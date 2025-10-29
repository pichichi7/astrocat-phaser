/**
 * Reddit User Profile Types
 * Shared between client and server
 */

export interface RedditUser {
  userId: string;
  username: string;
  avatarUrl?: string;
  snoovatarUrl?: string;
  karma?: number;
  createdAt?: number;
}

export interface RedditUserRequest {
  // No body needed - uses context.userId
}

export interface RedditUserResponse {
  success: boolean;
  user?: RedditUser;
  error?: string;
}
