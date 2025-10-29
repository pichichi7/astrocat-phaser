/**
 * LevelSharingService
 * Server-side service for sharing levels to Reddit
 */
import { redis, reddit } from '@devvit/web/server';
import type { Context } from '@devvit/web/server';
import type {
  SharedLevel,
  ShareLevelRequest,
  ShareLevelResponse,
  PlaySharedLevelResponse,
  RateSharedLevelResponse,
  LevelStatsResponse,
} from '../../shared/types/level-sharing';

export class LevelSharingService {
  /**
   * Share a level to Reddit as a new post
   */
  static async shareLevel(
    request: ShareLevelRequest,
    context: Context
  ): Promise<ShareLevelResponse> {
    try {
      const { levelName, description, difficulty, levelData, previewImage, subreddit } = request;
      
      // Get user info
      const userId = context.userId;
      if (!userId) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      // Get actual Reddit username
      let username = 'Anonymous';
      try {
        const user = await reddit.getCurrentUser();
        username = user?.username || `Player_${userId.substring(0, 8)}`;
      } catch (error) {
        console.warn('Could not fetch Reddit username:', error);
        username = `Player_${userId.substring(0, 8)}`;
      }

      // First, save level to Redis with a temporary ID
      const tempLevelId = `level_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      // Parse level data to extract metadata
      let blockCount = 0;
      let goalCount = 0;
      let enemyCount = 0;
      let rows = 7;

      try {
        const level = JSON.parse(levelData);
        rows = level.rows || 7;
        blockCount = level.blocks?.length || Object.keys(level.blocks || {}).length || 0;
        goalCount = level.blocks?.filter?.((b: any) => b.type === 6).length || 
                    Object.values(level.blocks || {}).filter((t: any) => t === 6).length || 0;
        enemyCount = level.enemies?.length || 0;
      } catch (e) {
        console.warn('Could not parse level data for metadata:', e);
      }

      // Store in Redis immediately so it's accessible
      await redis.hSet(`shared_level:${tempLevelId}`, {
        levelName,
        creator: username,
        creatorId: userId,
        difficulty,
        rows: rows.toString(),
        blockCount: blockCount.toString(),
        goalCount: goalCount.toString(),
        enemyCount: enemyCount.toString(),
        levelData,
        previewImage: previewImage || '',
        createdAt: Date.now().toString(),
        playCount: '0',
        rating: '0',
        ratingCount: '0',
      });

      // Add to indexes immediately
      await redis.zAdd('shared_levels:all', {
        member: tempLevelId,
        score: Date.now(),
      });

      await redis.zAdd(`shared_levels:creator:${userId}`, {
        member: tempLevelId,
        score: Date.now(),
      });

      console.log(`✅ Level stored in Redis: ${tempLevelId}`);

      // Now try to create Reddit post with embedded game
      let postId: string = tempLevelId;
      let postUrl: string = '';
      
      try {
        const subredditName = context.subredditName || subreddit || 'astrocatapp_dev';
        
        console.log(`Creating shared level post in r/${subredditName}...`);
        console.log(`Level details: ${levelName} by ${username} (${difficulty})`);
        
        // Create custom post with embedded game
        const post = await reddit.submitCustomPost({
          subredditName,
          title: `🎮 ${levelName} - Custom Level by ${username}`,
          postData: {
            // Pass level data to the game
            type: 'shared-level',
            levelId: tempLevelId,
            levelName,
            creator: username,
            difficulty,
            levelData, // The actual level data
            blockCount,
            goalCount,
            enemyCount,
            rows,
          },
        });

        postId = post.id;
        postUrl = post.url;
        
        // Update Redis with actual post ID
        await redis.hSet(`shared_level:${tempLevelId}`, {
          postId: post.id,
          postUrl: post.url,
        });
        
        console.log(`✅ Reddit post created successfully!`);
        console.log(`   Post ID: ${postId}`);
        console.log(`   Post URL: ${postUrl}`);
        console.log(`   Level can be played directly from the post!`);
      } catch (error) {
        console.error('Failed to create Reddit post:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        // Level is still accessible via tempLevelId in Redis
        postUrl = `/levels/${tempLevelId}`;
        console.warn(`⚠️ Post creation failed, but level is accessible at: ${postUrl}`);
      }

      console.log(`✅ Level shared successfully: ${postId}`);

      return {
        success: true,
        postId,
        postUrl,
      };
    } catch (error) {
      console.error('Error sharing level:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get a shared level by post ID
   */
  static async getSharedLevel(
    postId: string,
    _context: Context
  ): Promise<PlaySharedLevelResponse> {
    try {
      // Get level data from Redis
      const levelData = await redis.hGetAll(`shared_level:${postId}`);

      if (!levelData || Object.keys(levelData).length === 0) {
        return {
          success: false,
          error: 'Level not found',
        };
      }

      // Increment play count
      await redis.hIncrBy(`shared_level:${postId}`, 'playCount', 1);

      const level: SharedLevel = {
        postId,
        levelName: levelData.levelName || 'Untitled',
        creator: levelData.creator || 'Unknown',
        creatorId: levelData.creatorId || '',
        difficulty: (levelData.difficulty as any) || 'normal',
        rows: parseInt(levelData.rows || '7'),
        blockCount: parseInt(levelData.blockCount || '0'),
        goalCount: parseInt(levelData.goalCount || '0'),
        enemyCount: parseInt(levelData.enemyCount || '0'),
        levelData: levelData.levelData || '{}',
        previewImage: levelData.previewImage || undefined,
        createdAt: parseInt(levelData.createdAt || '0'),
        playCount: parseInt(levelData.playCount || '0') + 1,
        rating: parseFloat(levelData.rating || '0'),
        ratingCount: parseInt(levelData.ratingCount || '0'),
      };

      return {
        success: true,
        level,
      };
    } catch (error) {
      console.error('Error getting shared level:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Rate a shared level
   */
  static async rateLevel(
    postId: string,
    rating: number,
    _context: Context
  ): Promise<RateSharedLevelResponse> {
    try {
      const userId = _context.userId;
      if (!userId) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      // Validate rating
      if (rating < 1 || rating > 5) {
        return {
          success: false,
          error: 'Rating must be between 1 and 5',
        };
      }

      // Check if user already rated this level
      const existingRating = await redis.hGet(`shared_level:${postId}:ratings`, userId);

      // Get current rating data
      const currentRatingStr = await redis.hGet(`shared_level:${postId}`, 'rating');
      const currentRatingCountStr = await redis.hGet(`shared_level:${postId}`, 'ratingCount');
      
      const currentRating = parseFloat(currentRatingStr || '0');
      const currentRatingCount = parseInt(currentRatingCountStr || '0');

      let newRating: number;
      let newRatingCount: number;

      if (existingRating) {
        // Update existing rating
        const oldRating = parseFloat(existingRating);
        const totalRating = currentRating * currentRatingCount;
        newRating = (totalRating - oldRating + rating) / currentRatingCount;
        newRatingCount = currentRatingCount;
      } else {
        // Add new rating
        const totalRating = currentRating * currentRatingCount + rating;
        newRatingCount = currentRatingCount + 1;
        newRating = totalRating / newRatingCount;
      }

      // Update rating in Redis
      await redis.hSet(`shared_level:${postId}`, {
        rating: newRating.toString(),
        ratingCount: newRatingCount.toString(),
      });

      // Store user's rating
      await redis.hSet(`shared_level:${postId}:ratings`, {
        [userId]: rating.toString(),
      });

      return {
        success: true,
        newRating,
      };
    } catch (error) {
      console.error('Error rating level:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get level stats (play count, rating)
   */
  static async getLevelStats(
    postId: string,
    _context: Context
  ): Promise<LevelStatsResponse> {
    try {
      const playCountStr = await redis.hGet(`shared_level:${postId}`, 'playCount');
      const ratingStr = await redis.hGet(`shared_level:${postId}`, 'rating');
      const ratingCountStr = await redis.hGet(`shared_level:${postId}`, 'ratingCount');

      return {
        success: true,
        stats: {
          playCount: parseInt(playCountStr || '0'),
          rating: parseFloat(ratingStr || '0'),
          ratingCount: parseInt(ratingCountStr || '0'),
        },
      };
    } catch (error) {
      console.error('Error getting level stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
