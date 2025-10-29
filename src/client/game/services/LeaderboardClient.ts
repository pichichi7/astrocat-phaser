/**
 * LeaderboardClient
 * Client-side service for leaderboard API calls
 */
import type {
  LeaderboardEntry,
  LeaderboardSubmitResponse,
  GlobalLeaderboardResponse,
  LevelLeaderboardResponse,
  UserProfileResponse,
} from '../../../shared/types/leaderboard';

export class LeaderboardClient {
  private static readonly BASE_URL = '/api/leaderboard';

  /**
   * Submit a score to the leaderboard
   */
  static async submitScore(
    levelId: string,
    score: number,
    time: number,
    completed: boolean
  ): Promise<LeaderboardSubmitResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          levelId,
          score,
          time,
          levelCompleted: completed,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit score: ${response.statusText}`);
      }

      const result = await response.json();

      // ALSO send to Devvit for real-time updates
      if (typeof window !== 'undefined' && (window as any).DevvitBridge) {
        console.log('Sending score to Devvit:', { score, levelId, timeMs: time });
        (window as any).DevvitBridge.submitScore(score, levelId, time);
      }

      return result;
    } catch (error) {
      console.error('Error submitting score:', error);
      throw error;
    }
  }

  /**
   * Get global leaderboard
   */
  static async getGlobalLeaderboard(
    limit: number = 10,
    offset: number = 0
  ): Promise<GlobalLeaderboardResponse> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/global?limit=${limit}&offset=${offset}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching global leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get level-specific leaderboard
   */
  static async getLevelLeaderboard(
    levelId: string,
    limit: number = 10
  ): Promise<LevelLeaderboardResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/level/${levelId}?limit=${limit}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch level leaderboard: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching level leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  static async getUserProfile(userId?: string): Promise<UserProfileResponse> {
    try {
      const url = userId
        ? `${this.BASE_URL}/user/${userId}`
        : `${this.BASE_URL}/user`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
}

// Re-export types for convenience
export type { LeaderboardEntry, GlobalLeaderboardResponse, LevelLeaderboardResponse };
