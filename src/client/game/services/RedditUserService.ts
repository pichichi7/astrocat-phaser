/**
 * RedditUserService
 * Client-side service for Reddit user profile management
 */
import type { RedditUser, RedditUserResponse } from '../../../shared/types/reddit';

export class RedditUserService {
  private static cachedUser: RedditUser | null = null;
  private static lastFetch: number = 0;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get current user profile with caching
   */
  static async getCurrentUser(forceRefresh: boolean = false): Promise<RedditUser | null> {
    try {
      // Return cached user if still valid
      const now = Date.now();
      if (!forceRefresh && this.cachedUser && (now - this.lastFetch) < this.CACHE_DURATION) {
        return this.cachedUser;
      }

      // Fetch from server
      const response = await fetch('/api/user/profile');

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.statusText}`);
      }

      const data: RedditUserResponse = await response.json();

      if (data.success && data.user) {
        this.cachedUser = data.user;
        this.lastFetch = now;
        return data.user;
      } else {
        console.warn('User profile fetch failed:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Clear cached user data
   */
  static clearCache(): void {
    this.cachedUser = null;
    this.lastFetch = 0;
  }

  /**
   * Get cached user without fetching
   */
  static getCachedUser(): RedditUser | null {
    return this.cachedUser;
  }

  /**
   * Check if user is authenticated (has cached data)
   */
  static isAuthenticated(): boolean {
    return this.cachedUser !== null;
  }
}
