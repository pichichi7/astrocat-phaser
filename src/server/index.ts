import express from 'express';
import { InitResponse, IncrementResponse, DecrementResponse } from '../shared/types/api';
import { redis, reddit, createServer, context } from '@devvit/web/server';
import { createPost } from './core/post';
import { LeaderboardService } from './services/LeaderboardService';
import { LevelSharingService } from './services/LevelSharingService';
import type {
  LeaderboardSubmitRequest,
  LeaderboardSubmitResponse,
  GlobalLeaderboardResponse,
  LevelLeaderboardResponse,
  UserProfileResponse,
} from '../shared/types/leaderboard';
import type { RedditUserResponse } from '../shared/types/reddit';
import type {
  ShareLevelRequest,
  ShareLevelResponse,
  PlaySharedLevelResponse,
  RateSharedLevelRequest,
  RateSharedLevelResponse,
  LevelStatsResponse,
} from '../shared/types/level-sharing';

const app = express();

// Middleware for JSON body parsing
app.use(express.json());
// Middleware for URL-encoded body parsing
app.use(express.urlencoded({ extended: true }));
// Middleware for plain text body parsing
app.use(express.text());

const router = express.Router();

router.get<{ postId: string }, InitResponse | { status: string; message: string }>(
  '/api/init',
  async (_req, res): Promise<void> => {
    const { postId } = context;

    if (!postId) {
      console.error('API Init Error: postId not found in devvit context');
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }

    try {
      const count = await redis.get('count');
      res.json({
        type: 'init',
        postId: postId,
        count: count ? parseInt(count) : 0,
      });
    } catch (error) {
      console.error(`API Init Error for post ${postId}:`, error);
      let errorMessage = 'Unknown error during initialization';
      if (error instanceof Error) {
        errorMessage = `Initialization failed: ${error.message}`;
      }
      res.status(400).json({ status: 'error', message: errorMessage });
    }
  }
);

router.post<{ postId: string }, IncrementResponse | { status: string; message: string }, unknown>(
  '/api/increment',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', 1),
      postId,
      type: 'increment',
    });
  }
);

router.post<{ postId: string }, DecrementResponse | { status: string; message: string }, unknown>(
  '/api/decrement',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', -1),
      postId,
      type: 'decrement',
    });
  }
);

router.post('/internal/on-app-install', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      status: 'success',
      message: `Post created in subreddit ${context.subredditName} with id ${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

// ===== LEADERBOARD ENDPOINTS =====

/**
 * Submit a score to the leaderboard
 * POST /api/leaderboard/submit
 */
router.post<unknown, LeaderboardSubmitResponse | { status: string; message: string }, LeaderboardSubmitRequest>(
  '/api/leaderboard/submit',
  async (req, res): Promise<void> => {
    try {
      const { levelId, score, time, levelCompleted } = req.body;
      const userId = context.userId;

      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'User not authenticated',
        });
        return;
      }

      // Get Reddit username
      let username = 'Anonymous';
      try {
        const user = await reddit.getCurrentUser();
        username = user?.username || 'Anonymous';
      } catch (error) {
        console.warn('Could not fetch Reddit username, using fallback:', error);
        username = `Player_${userId.substring(0, 8)}`;
      }

      const result = await LeaderboardService.submitScore(
        userId,
        username,
        levelId,
        score,
        time,
        levelCompleted
      );

      res.json(result);
    } catch (error) {
      console.error('Error submitting score:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to submit score',
      });
    }
  }
);

/**
 * Get global leaderboard
 * GET /api/leaderboard/global?limit=10&offset=0
 */
router.get<unknown, GlobalLeaderboardResponse | { status: string; message: string }>(
  '/api/leaderboard/global',
  async (req, res): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const userId = context.userId;

      const result = await LeaderboardService.getGlobalLeaderboard(
        Math.min(limit, 100), // Cap at 100
        offset,
        userId
      );

      res.json(result);
    } catch (error) {
      console.error('Error fetching global leaderboard:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch leaderboard',
      });
    }
  }
);

/**
 * Get level-specific leaderboard
 * GET /api/leaderboard/level/:levelId?limit=10
 */
router.get<{ levelId: string }, LevelLeaderboardResponse | { status: string; message: string }>(
  '/api/leaderboard/level/:levelId',
  async (req, res): Promise<void> => {
    try {
      const { levelId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = context.userId;

      const result = await LeaderboardService.getLevelLeaderboard(
        levelId,
        Math.min(limit, 100),
        userId
      );

      res.json(result);
    } catch (error) {
      console.error('Error fetching level leaderboard:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch level leaderboard',
      });
    }
  }
);

/**
 * Get user profile
 * GET /api/leaderboard/user/:userId
 */
router.get<{ userId: string }, UserProfileResponse | { status: string; message: string } | null>(
  '/api/leaderboard/user/:userId',
  async (req, res): Promise<void> => {
    try {
      const targetUserId = req.params.userId;

      if (!targetUserId) {
        res.status(401).json({
          status: 'error',
          message: 'User ID required',
        });
        return;
      }

      const profile = await LeaderboardService.getUserProfile(targetUserId);

      if (!profile) {
        res.status(404).json({
          status: 'error',
          message: 'User profile not found',
        });
        return;
      }

      // Get global rank
      const globalRank = await redis.zRank('leaderboard:global', targetUserId);

      res.json({
        ...profile,
        globalRank: globalRank !== null && globalRank !== undefined ? globalRank + 1 : -1,
        levelRanks: {}, // Can be expanded later
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch user profile',
      });
    }
  }
);

/**
 * Get current user profile
 * GET /api/leaderboard/me
 */
router.get<unknown, UserProfileResponse | { status: string; message: string } | null>(
  '/api/leaderboard/me',
  async (_req, res): Promise<void> => {
    try {
      const targetUserId = context.userId;

      if (!targetUserId) {
        res.status(401).json({
          status: 'error',
          message: 'User not authenticated',
        });
        return;
      }

      const profile = await LeaderboardService.getUserProfile(targetUserId);

      if (!profile) {
        res.status(404).json({
          status: 'error',
          message: 'User profile not found',
        });
        return;
      }

      // Get global rank
      const globalRank = await redis.zRank('leaderboard:global', targetUserId);

      res.json({
        ...profile,
        globalRank: globalRank !== null && globalRank !== undefined ? globalRank + 1 : -1,
        levelRanks: {}, // Can be expanded later
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch user profile',
      });
    }
  }
);

// ===== REDDIT USER PROFILE ENDPOINT =====

/**
 * Get current Reddit user profile
 * GET /api/user/profile
 */
router.get<unknown, RedditUserResponse>(
  '/api/user/profile',
  async (_req, res): Promise<void> => {
    try {
      const userId = context.userId;

      if (!userId) {
        res.json({
          success: false,
          error: 'User not authenticated',
        });
        return;
      }

      // Generate a consistent username based on userId
      // In production, this would fetch from Reddit API when available
      const username = `Player_${userId.substring(0, 8)}`;

      // Check if user has any game data in Redis
      const userKey = `user:${userId}`;
      const userData = await redis.hGetAll(userKey);

      // Get karma from game stats (games won)
      const karma = userData.gamesWon ? parseInt(userData.gamesWon) : 0;

      res.json({
        success: true,
        user: {
          userId,
          username,
          karma,
          createdAt: userData.createdAt ? parseInt(userData.createdAt) : Date.now(),
        },
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.json({
        success: false,
        error: 'Failed to fetch user profile',
      });
    }
  }
);

// ===== LEVEL SHARING ENDPOINTS =====

/**
 * Share a level to Reddit
 * POST /api/levels/share
 */
router.post<unknown, ShareLevelResponse, ShareLevelRequest>(
  '/api/levels/share',
  async (req, res): Promise<void> => {
    try {
      const result = await LevelSharingService.shareLevel(req.body, context);
      res.json(result);
    } catch (error) {
      console.error('Error sharing level:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to share level',
      });
    }
  }
);

/**
 * Get a shared level by post ID
 * GET /api/levels/shared/:postId
 */
router.get<{ postId: string }, PlaySharedLevelResponse>(
  '/api/levels/shared/:postId',
  async (req, res): Promise<void> => {
    try {
      const { postId } = req.params;
      const result = await LevelSharingService.getSharedLevel(postId, context);
      res.json(result);
    } catch (error) {
      console.error('Error getting shared level:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get shared level',
      });
    }
  }
);

/**
 * Rate a shared level
 * POST /api/levels/rate/:postId
 */
router.post<{ postId: string }, RateSharedLevelResponse, RateSharedLevelRequest>(
  '/api/levels/rate/:postId',
  async (req, res): Promise<void> => {
    try {
      const { postId } = req.params;
      const { rating } = req.body;
      const result = await LevelSharingService.rateLevel(postId, rating, context);
      res.json(result);
    } catch (error) {
      console.error('Error rating level:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to rate level',
      });
    }
  }
);

/**
 * Get level stats
 * GET /api/levels/stats/:postId
 */
router.get<{ postId: string }, LevelStatsResponse>(
  '/api/levels/stats/:postId',
  async (req, res): Promise<void> => {
    try {
      const { postId } = req.params;
      const result = await LevelSharingService.getLevelStats(postId, context);
      res.json(result);
    } catch (error) {
      console.error('Error getting level stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get level stats',
      });
    }
  }
);

/**
 * Get all shared levels (newest first)
 * GET /api/levels/all?limit=20&page=0
 */
router.get<unknown, { success: boolean; levels?: any[]; pagination?: any; error?: string }>(
  '/api/levels/all',
  async (req, res): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 0;
      const limit = parseInt(req.query.limit as string) || 20;
      const start = page * limit;
      const end = start + limit - 1;
      
      // Get level IDs from Redis sorted set (newest first)
      const levelIds = await redis.zRange('shared_levels:all', start, end, {
        reverse: true,
        by: 'rank',
      });

      const levels = [];

      for (const item of levelIds) {
        const levelId = item.member;
        const levelData = await redis.hGetAll(`shared_level:${levelId}`);

        if (levelData && Object.keys(levelData).length > 0) {
          levels.push({
            id: levelId,
            name: levelData.levelName,
            creator: levelData.creator,
            difficulty: levelData.difficulty,
            playCount: parseInt(levelData.playCount || '0'),
            rating: parseFloat(levelData.rating || '0'),
            createdAt: parseInt(levelData.createdAt || '0'),
            postUrl: levelData.postUrl || `/levels/${levelId}`,
            levelData: levelData.levelData, // Include serialized level data
          });
        }
      }

      // Get total count for pagination
      const total = await redis.zCard('shared_levels:all');

      res.json({
        success: true,
        levels,
        pagination: {
          page,
          limit,
          total: total || 0,
        },
      });
    } catch (error) {
      console.error('Error getting all levels:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get levels',
      });
    }
  }
);

/**
 * Share a level (alternative endpoint for EditorScene)
 * POST /api/share-level
 */
router.post<unknown, { success: boolean; levelId?: string; postId?: string; message?: string; error?: string }>(
  '/api/share-level',
  async (req, res): Promise<void> => {
    try {
      const { levelData, levelName, difficulty, description, authorId } = req.body;
      const userId = context.userId || authorId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
        return;
      }

      // Get Reddit username
      let username = 'Anonymous';
      try {
        const user = await reddit.getCurrentUser();
        username = user?.username || 'Anonymous';
      } catch (error) {
        console.warn('Could not fetch Reddit username:', error);
        username = `Player_${userId.substring(0, 8)}`;
      }

      // Generate unique level ID
      const timestamp = Date.now();
      const levelId = `level:${timestamp}:${userId}`;

      // Save to Redis using hashes
      await redis.hSet(levelId, {
        levelData: JSON.stringify(levelData),
        levelName: levelName || 'Untitled Level',
        difficulty: difficulty || 'medium',
        description: description || '',
        author: userId,
        creator: username,
        createdAt: timestamp.toString(),
        playCount: '0',
        rating: '0',
        likes: '0',
      });

      // Add to public levels sorted set (sorted by timestamp)
      await redis.zAdd('shared_levels:all', {
        score: timestamp,
        member: levelId,
      });

      // Create Reddit Custom Post (embeds the game)
      let postId = '';
      try {
        const { subredditName } = context;
        if (subredditName) {
          // 🔥 FIX: Pass postData when creating the custom post
          // Devvit will embed this in the URL hash automatically
          const post = await reddit.submitCustomPost({
            subredditName,
            title: `🎮 ${levelName || 'Custom Level'} - by ${username}`,
            postData: {
              // This gets passed to the game via URL hash
              type: 'shared-level',
              levelData: levelData,
              levelName: levelName || 'Untitled Level',
              creator: username,
              difficulty: difficulty || 'medium',
              description: description || '',
            },
          });

          postId = post.id;
          
          // ALSO store in Redis for fallback/API access
          await redis.set(`level:${postId}`, JSON.stringify({
            type: 'shared-level',
            levelData: levelData,
            levelName: levelName || 'Untitled Level',
            creator: username,
            difficulty: difficulty || 'medium',
            description: description || '',
            createdAt: timestamp,
          }));

          // Update level data with post info
          await redis.hSet(levelId, {
            postId: postId,
            postUrl: `https://reddit.com/r/${subredditName}/comments/${postId}`,
          });
          
          console.log(`[ShareLevel] ✅ Created Custom Post ${postId} with level data in postData`);
          console.log(`[ShareLevel] Level will auto-load from URL hash`);
        }
      } catch (postError) {
        console.error('[ShareLevel] ❌ Could not create Reddit post:', postError);
        console.error('[ShareLevel] Error details:', JSON.stringify(postError, null, 2));
        // Continue even if post creation fails
      }

      res.json({
        success: true,
        levelId,
        postId,
        message: 'Level shared successfully!',
      });
    } catch (error) {
      console.error('Error sharing level:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to share level',
      });
    }
  }
);

/**
 * Submit score (alternative endpoint for LeaderboardScene)
 * POST /api/submit-score
 */
router.post<unknown, { success: boolean; newHighScore?: boolean; rank?: number; score?: number; message?: string; error?: string }>(
  '/api/submit-score',
  async (req, res): Promise<void> => {
    try {
      const { username, score, levelId = 'global' } = req.body;
      const userId = context.userId;

      if (!userId && !username) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
        return;
      }

      // Use username from request or fetch from context
      let playerName = username;
      if (!playerName) {
        try {
          const user = await reddit.getCurrentUser();
          playerName = user?.username || `Player_${userId?.substring(0, 8)}`;
        } catch (error) {
          playerName = `Player_${userId?.substring(0, 8)}`;
        }
      }

      // Leaderboard key (global or per level)
      const leaderboardKey = `leaderboard:${levelId}`;

      // Get previous score
      const previousScoreData = await redis.zScore(leaderboardKey, playerName);
      const previousScore = previousScoreData !== null && previousScoreData !== undefined ? previousScoreData : null;

      // Only update if it's a better score (higher)
      if (previousScore === null || score > previousScore) {
        await redis.zAdd(leaderboardKey, {
          score: score,
          member: playerName,
        });

        // Get user rank using zRange to find position
        const allMembers = await redis.zRange(leaderboardKey, 0, -1, {
          reverse: true,
          by: 'rank',
        });
        const rank = allMembers.findIndex(entry => entry.member === playerName) + 1;

        // Update user stats
        if (userId) {
          const userKey = `user:${userId}`;
          await redis.hIncrBy(userKey, 'gamesPlayed', 1);
          if (levelId !== 'global') {
            await redis.hIncrBy(userKey, 'gamesWon', 1);
          }
        }

        res.json({
          success: true,
          newHighScore: previousScore === null || score > previousScore,
          rank,
          score,
          message: previousScore === null ? 'First score recorded!' : 'New high score!',
        });
      } else {
        res.json({
          success: true,
          newHighScore: false,
          message: 'Score not high enough',
        });
      }
    } catch (error) {
      console.error('Error submitting score:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit score',
      });
    }
  }
);

/**
 * Get leaderboard by type (global or level-specific)
 * GET /api/leaderboard/:type?limit=10
 */
router.get<{ type: string }, { success: boolean; leaderboard?: any[]; error?: string }>(
  '/api/leaderboard/:type',
  async (req, res): Promise<void> => {
    try {
      const { type } = req.params; // 'global' or specific levelId
      const limit = parseInt(req.query.limit as string) || 10;

      const leaderboardKey = `leaderboard:${type}`;

      // Get top scores with usernames (descending order)
      const topScores = await redis.zRange(leaderboardKey, 0, limit - 1, {
        reverse: true,
        by: 'rank',
      });

      // Format response
      const leaderboard = topScores.map((entry, index) => ({
        rank: index + 1,
        username: entry.member,
        score: entry.score,
      }));

      res.json({
        success: true,
        leaderboard,
      });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch leaderboard',
      });
    }
  }
);

// Use router middleware
app.use(router);

// Get port from environment variable with fallback
const port = process.env.WEBBIT_PORT || 3000;

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port, () => console.log(`http://localhost:${port}`));
