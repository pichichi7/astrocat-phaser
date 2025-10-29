/**
 * Level Sharing Types
 * For Reddit post creation and level sharing
 */

export interface SharedLevel {
  postId: string;
  levelName: string;
  creator: string;
  creatorId: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
  rows: number;
  blockCount: number;
  goalCount: number;
  enemyCount: number;
  levelData: string; // JSON serialized level
  previewImage?: string | undefined; // Base64 or URL
  createdAt: number;
  playCount: number;
  rating: number;
  ratingCount: number;
}

export interface ShareLevelRequest {
  levelName: string;
  description?: string | undefined;
  difficulty: string;
  levelData: string; // JSON serialized
  previewImage?: string | undefined;
  subreddit?: string | undefined;
}

export interface ShareLevelResponse {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

export interface PlaySharedLevelRequest {
  postId: string;
}

export interface PlaySharedLevelResponse {
  success: boolean;
  level?: SharedLevel;
  error?: string;
}

export interface RateSharedLevelRequest {
  postId: string;
  rating: number; // 1-5 stars
}

export interface RateSharedLevelResponse {
  success: boolean;
  newRating?: number;
  error?: string;
}

export interface LevelStatsResponse {
  success: boolean;
  stats?: {
    playCount: number;
    rating: number;
    ratingCount: number;
  };
  error?: string;
}
