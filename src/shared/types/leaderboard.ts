/**
 * Leaderboard System - Shared Types
 * Used by both client and server for type safety
 */

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  time?: number;
  gamesPlayed?: number;
  gamesWon?: number;
}

export interface LeaderboardSubmitRequest {
  levelId: string;
  score: number;
  time: number;
  levelCompleted: boolean;
}

export interface LeaderboardSubmitResponse {
  success: boolean;
  newBest: boolean;
  rank: number;
  previousBest?: number | undefined;
  data: {
    globalRank: number;
    levelRank: number;
    totalScore: number;
  };
}

export interface GlobalLeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  total: number;
  userRank?: number | undefined;
  userScore?: number | undefined;
}

export interface LevelLeaderboardResponse {
  levelId: string;
  leaderboard: LeaderboardEntry[];
  userBest?: number | undefined;
  userRank?: number | undefined;
}

export interface UserProfile {
  userId: string;
  username: string;
  totalScore: number;
  gamesPlayed: number;
  gamesWon: number;
  bestTime: number;
  lastUpdated: number;
  createdAt: number;
}

export interface UserProfileResponse extends UserProfile {
  globalRank: number;
  levelRanks: {
    [levelId: string]: number;
  };
  recentScores?: {
    levelId: string;
    score: number;
    time: number;
    timestamp: string;
  }[];
}

export interface WeeklyLeaderboardResponse {
  weekNumber: number;
  startDate: string;
  endDate: string;
  leaderboard: LeaderboardEntry[];
  userRank?: number;
  userScore?: number;
}
