/**
 * LevelSharingClient
 * Client-side service for sharing levels to Reddit
 */
import type {
  ShareLevelRequest,
  ShareLevelResponse,
  PlaySharedLevelResponse,
  RateSharedLevelRequest,
  RateSharedLevelResponse,
  LevelStatsResponse,
} from '../../../shared/types/level-sharing';

export class LevelSharingClient {
  /**
   * Share a level to Reddit
   */
  static async shareLevel(request: ShareLevelRequest): Promise<ShareLevelResponse> {
    try {
      const response = await fetch('/api/levels/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to share level: ${response.statusText}`);
      }

      return await response.json();
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
  static async getSharedLevel(postId: string): Promise<PlaySharedLevelResponse> {
    try {
      const response = await fetch(`/api/levels/shared/${postId}`);

      if (!response.ok) {
        throw new Error(`Failed to get shared level: ${response.statusText}`);
      }

      return await response.json();
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
  static async rateLevel(postId: string, rating: number): Promise<RateSharedLevelResponse> {
    try {
      const request: RateSharedLevelRequest = { postId, rating };

      const response = await fetch(`/api/levels/rate/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to rate level: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error rating level:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get level statistics
   */
  static async getLevelStats(postId: string): Promise<LevelStatsResponse> {
    try {
      const response = await fetch(`/api/levels/stats/${postId}`);

      if (!response.ok) {
        throw new Error(`Failed to get level stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting level stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
