import { redis } from '@devvit/web/server';
import type {
  LeaderboardEntry,
  UserProfile,
  GlobalLeaderboardResponse,
  LevelLeaderboardResponse,
} from '../../shared/types/leaderboard';

/**
 * LeaderboardService
 * Manages global and level-specific leaderboards using Redis Sorted Sets
 */
export class LeaderboardService {
  private static readonly GLOBAL_KEY = 'leaderboard:global';
  private static readonly USER_PREFIX = 'user:';
  private static readonly LEVEL_PREFIX = 'leaderboard:level:';

  /**
   * Submit a score to the leaderboard
   * Updates global leaderboard, level leaderboard, and user profile
   */
  static async submitScore(
    userId: string,
    username: string,
    levelId: string,
    score: number,
    time: number,
    completed: boolean
  ): Promise<{
    success: boolean;
    newBest: boolean;
    rank: number;
    previousBest?: number;
    data: {
      globalRank: number;
      levelRank: number;
      totalScore: number;
    };
  }> {
    try {
      const userKey = `${this.USER_PREFIX}${userId}`;

      // Check if user exists
      const userExists = await redis.exists(userKey);

      if (!userExists) {
        // Create new user profile
        await redis.hSet(userKey, {
          username,
          totalScore: '0',
          gamesPlayed: '0',
          gamesWon: '0',
          bestTime: '999999999',
          createdAt: Date.now().toString(),
          lastUpdated: Date.now().toString(),
        });
      }

      // Get current user stats
      const currentTotalScore = parseInt((await redis.hGet(userKey, 'totalScore')) || '0');
      const currentBestTime = parseInt((await redis.hGet(userKey, 'bestTime')) || '999999999');

      // Calculate new total score
      const newTotalScore = currentTotalScore + score;

      // Update user profile
      await redis.hSet(userKey, {
        username,
        totalScore: newTotalScore.toString(),
        lastUpdated: Date.now().toString(),
      });

      // Increment games played
      await redis.hIncrBy(userKey, 'gamesPlayed', 1);

      // Increment games won if completed
      if (completed) {
        await redis.hIncrBy(userKey, 'gamesWon', 1);
      }

      // Update best time if better
      const newBestTime = time < currentBestTime;
      const previousBest = currentBestTime !== 999999999 ? currentBestTime : undefined;

      if (newBestTime) {
        await redis.hSet(userKey, { bestTime: time.toString() });
      }

      // Update global leaderboard (sorted by total score, descending)
      await redis.zAdd(this.GLOBAL_KEY, {
        member: userId,
        score: newTotalScore,
      });

      // Update level-specific leaderboard (sorted by time, ascending - lower is better)
      const levelKey = `${this.LEVEL_PREFIX}${levelId}`;
      const currentLevelTime = await redis.zScore(levelKey, userId);

      // Only update if this is a better time (or first time)
      if (currentLevelTime === null || currentLevelTime === undefined || time < currentLevelTime) {
        await redis.zAdd(levelKey, {
          member: userId,
          score: time,
        });
      }

      // Get rankings (using zRank with reverse flag for global)
      const globalRankResult = await redis.zRank(this.GLOBAL_KEY, userId);
      const levelRankResult = await redis.zRank(levelKey, userId);

      const globalRank = globalRankResult !== null && globalRankResult !== undefined ? globalRankResult + 1 : -1;
      const levelRank = levelRankResult !== null && levelRankResult !== undefined ? levelRankResult + 1 : -1;

      const result: {
        success: boolean;
        newBest: boolean;
        rank: number;
        previousBest?: number;
        data: {
          globalRank: number;
          levelRank: number;
          totalScore: number;
        };
      } = {
        success: true,
        newBest: newBestTime,
        rank: globalRank,
        data: {
          globalRank,
          levelRank,
          totalScore: newTotalScore,
        },
      };

      if (previousBest !== undefined) {
        result.previousBest = previousBest;
      }

      return result;
    } catch (error) {
      console.error('Error submitting score:', error);
      throw error;
    }
  }

  /**
   * Get global leaderboard (top players by total score)
   */
  static async getGlobalLeaderboard(
    limit: number = 10,
    offset: number = 0,
    currentUserId?: string
  ): Promise<GlobalLeaderboardResponse> {
    try {
      // Get top players (ZREVRANGE for descending order)
      const topPlayers = await redis.zRange(this.GLOBAL_KEY, offset, offset + limit - 1, {
        reverse: true,
        by: 'rank',
      });

      // Get total count
      const total = await redis.zCard(this.GLOBAL_KEY);

      // Fetch user details for each player
      const leaderboard: LeaderboardEntry[] = [];

      for (let i = 0; i < topPlayers.length; i++) {
        const member = topPlayers[i];
        if (!member) continue;

        const userId = member.member;
        const score = member.score;
        const userKey = `${this.USER_PREFIX}${userId}`;
        const userData = await redis.hGetAll(userKey);

        leaderboard.push({
          rank: offset + i + 1,
          userId,
          username: userData.username || 'Anonymous',
          score,
          gamesPlayed: parseInt(userData.gamesPlayed || '0'),
          gamesWon: parseInt(userData.gamesWon || '0'),
        });
      }

      // Get current user's rank and score if provided
      let userRank: number | undefined;
      let userScore: number | undefined;

      if (currentUserId) {
        const rankResult = await redis.zRank(this.GLOBAL_KEY, currentUserId);
        const scoreResult = await redis.zScore(this.GLOBAL_KEY, currentUserId);

        userRank = rankResult !== null && rankResult !== undefined ? rankResult + 1 : undefined;
        userScore = scoreResult !== null && scoreResult !== undefined ? scoreResult : undefined;
      }

      const result: GlobalLeaderboardResponse = {
        leaderboard,
        total,
      };

      if (userRank !== undefined) {
        result.userRank = userRank;
      }

      if (userScore !== undefined) {
        result.userScore = userScore;
      }

      return result;
    } catch (error) {
      console.error('Error fetching global leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get level-specific leaderboard (best times, ascending)
   */
  static async getLevelLeaderboard(
    levelId: string,
    limit: number = 10,
    currentUserId?: string
  ): Promise<LevelLeaderboardResponse> {
    try {
      const levelKey = `${this.LEVEL_PREFIX}${levelId}`;

      // Get top times (ascending order - lower time is better)
      const topTimes = await redis.zRange(levelKey, 0, limit - 1, {
        by: 'rank',
      });

      const leaderboard: LeaderboardEntry[] = [];

      for (let i = 0; i < topTimes.length; i++) {
        const member = topTimes[i];
        if (!member) continue;

        const userId = member.member;
        const time = member.score;
        const userKey = `${this.USER_PREFIX}${userId}`;
        const userData = await redis.hGetAll(userKey);

        leaderboard.push({
          rank: i + 1,
          userId,
          username: userData.username || 'Anonymous',
          score: 0, // Not relevant for level leaderboards
          time,
        });
      }

      // Get current user's best time and rank
      let userBest: number | undefined;
      let userRank: number | undefined;

      if (currentUserId) {
        const timeResult = await redis.zScore(levelKey, currentUserId);
        const rankResult = await redis.zRank(levelKey, currentUserId);

        userBest = timeResult !== null && timeResult !== undefined ? timeResult : undefined;
        userRank = rankResult !== null && rankResult !== undefined ? rankResult + 1 : undefined;
      }

      const result: LevelLeaderboardResponse = {
        levelId,
        leaderboard,
      };

      if (userBest !== undefined) {
        result.userBest = userBest;
      }

      if (userRank !== undefined) {
        result.userRank = userRank;
      }

      return result;
    } catch (error) {
      console.error('Error fetching level leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get user profile with stats
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userKey = `${this.USER_PREFIX}${userId}`;
      const userData = await redis.hGetAll(userKey);

      if (!userData || Object.keys(userData).length === 0) {
        return null;
      }

      return {
        userId,
        username: userData.username || 'Anonymous',
        totalScore: parseInt(userData.totalScore || '0'),
        gamesPlayed: parseInt(userData.gamesPlayed || '0'),
        gamesWon: parseInt(userData.gamesWon || '0'),
        bestTime: parseInt(userData.bestTime || '999999999'),
        lastUpdated: parseInt(userData.lastUpdated || '0'),
        createdAt: parseInt(userData.createdAt || '0'),
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
}
