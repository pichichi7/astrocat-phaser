export type InitResponse = {
  type: 'init';
  postId: string;
  count: number;
};

export type IncrementResponse = {
  type: 'increment';
  postId: string;
  count: number;
};

export type DecrementResponse = {
  type: 'decrement';
  postId: string;
  count: number;
};

// Re-export leaderboard types for convenience
export * from './leaderboard';

// Re-export Reddit types
export * from './reddit';

// Re-export level sharing types
export * from './level-sharing';
