# Global Leaderboard System - Technical Specification

## Overview

Implement a global leaderboard system that tracks player scores across all levels using Redis Sorted Sets, displays top 10 players in-game, and integrates with Reddit user authentication.

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     PHASER CLIENT                           │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │ LeaderboardScene │──────│ LeaderboardUI    │            │
│  │ (Display)        │      │ (Components)     │            │
│  └────────┬─────────┘      └──────────────────┘            │
│           │ fetch /api/leaderboard/*                        │
└───────────┼─────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXPRESS SERVER                            │
│  ┌──────────────────────────────────────────────────┐       │
│  │           LeaderboardService                     │       │
│  │  ┌────────────────┐  ┌──────────────────┐       │       │
│  │  │ Score Manager  │  │ User Manager     │       │       │
│  │  └────────┬───────┘  └────────┬─────────┘       │       │
│  └───────────┼──────────────────┼──────────────────┘       │
└──────────────┼──────────────────┼──────────────────────────┘
               │                  │
               ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    REDIS STORE                              │
│  ┌─────────────────────────────────────────────────┐        │
│  │  Sorted Sets (Leaderboards)                     │        │
│  │  - leaderboard:global                           │        │
│  │  - leaderboard:level:{levelId}                  │        │
│  │  - leaderboard:weekly                           │        │
│  └─────────────────────────────────────────────────┘        │
│  ┌─────────────────────────────────────────────────┐        │
│  │  Hashes (User Profiles)                         │        │
│  │  - user:{userId}                                │        │
│  │    • username, totalScore, gamesPlayed,         │        │
│  │      bestTime, lastUpdated                      │        │
│  └─────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Models

### Redis Schema

#### 1. **Global Leaderboard** (Sorted Set)
```
Key: "leaderboard:global"
Type: Sorted Set (ZSET)
Score: Total points accumulated
Member: userId (Reddit user ID)

Commands:
- ZADD leaderboard:global {score} {userId}
- ZREVRANGE leaderboard:global 0 9 WITHSCORES
- ZRANK leaderboard:global {userId}
- ZSCORE leaderboard:global {userId}
```

#### 2. **Level-Specific Leaderboards** (Sorted Set)
```
Key: "leaderboard:level:{levelId}"
Type: Sorted Set (ZSET)
Score: Best time (milliseconds, lower is better)
Member: userId

Commands:
- ZADD leaderboard:level:{levelId} {time} {userId}
- ZRANGE leaderboard:level:{levelId} 0 9 WITHSCORES (ascending)
```

#### 3. **Weekly Leaderboard** (Sorted Set with TTL)
```
Key: "leaderboard:weekly:{weekNumber}"
Type: Sorted Set (ZSET)
Score: Weekly points
Member: userId
TTL: 604800 seconds (7 days)

Commands:
- ZADD leaderboard:weekly:{weekNumber} {score} {userId}
- EXPIRE leaderboard:weekly:{weekNumber} 604800
```

#### 4. **User Profile** (Hash)
```
Key: "user:{userId}"
Type: Hash (HSET)

Fields:
- username: string (Reddit username)
- totalScore: number
- gamesPlayed: number
- gamesWon: number
- bestTime: number (milliseconds)
- lastUpdated: timestamp
- createdAt: timestamp
- rank: number (cached from ZRANK)

Commands:
- HSET user:{userId} username "u/player123"
- HGETALL user:{userId}
- HINCRBY user:{userId} totalScore {points}
- HINCRBY user:{userId} gamesPlayed 1
```

---

## API Endpoints

### 1. **Submit Score**
```typescript
POST /api/leaderboard/submit

Request Body:
{
  levelId: string;
  score: number;        // Points earned
  time: number;         // Completion time in ms
  levelCompleted: boolean;
}

Response:
{
  success: boolean;
  newBest: boolean;     // Is this a new personal best?
  rank: number;         // Global rank
  previousBest?: number;
  data: {
    globalRank: number;
    levelRank: number;
    totalScore: number;
  }
}

Implementation:
- Get userId from context.userId
- Get username from context.reddit.getCurrentUser()
- Update user profile hash
- Update global leaderboard (ZADD with XX to only update if better)
- Update level leaderboard (ZADD)
- Update weekly leaderboard
- Return new rank and stats
```

### 2. **Get Global Leaderboard**
```typescript
GET /api/leaderboard/global?limit=10&offset=0

Response:
{
  leaderboard: [
    {
      rank: number;
      userId: string;
      username: string;
      score: number;
      gamesPlayed: number;
      gamesWon: number;
    }
  ],
  total: number;
  userRank?: number;    // Current user's rank
  userScore?: number;   // Current user's score
}

Implementation:
- ZREVRANGE leaderboard:global {offset} {offset+limit} WITHSCORES
- For each userId, HGETALL user:{userId}
- Get current user's rank with ZRANK
- Return paginated results with user context
```

### 3. **Get Level Leaderboard**
```typescript
GET /api/leaderboard/level/:levelId?limit=10

Response:
{
  levelId: string;
  leaderboard: [
    {
      rank: number;
      userId: string;
      username: string;
      time: number;         // Best time in ms
      completedAt: string;  // ISO timestamp
    }
  ],
  userBest?: number;        // Current user's best time
  userRank?: number;
}

Implementation:
- ZRANGE leaderboard:level:{levelId} 0 {limit-1} WITHSCORES
- Fetch usernames from user:{userId} hashes
- Get current user's best time
- Return sorted by time (ascending)
```

### 4. **Get User Profile**
```typescript
GET /api/leaderboard/user/:userId?

Response:
{
  userId: string;
  username: string;
  totalScore: number;
  gamesPlayed: number;
  gamesWon: number;
  bestTime: number;
  globalRank: number;
  levelRanks: {
    [levelId: string]: number;
  },
  recentScores: [
    {
      levelId: string;
      score: number;
      time: number;
      timestamp: string;
    }
  ]
}

Implementation:
- If no userId provided, use context.userId
- HGETALL user:{userId}
- ZRANK leaderboard:global {userId}
- ZRANK for each level leaderboard
- Return comprehensive profile
```

### 5. **Get Weekly Leaderboard**
```typescript
GET /api/leaderboard/weekly

Response:
{
  weekNumber: number;
  startDate: string;
  endDate: string;
  leaderboard: [
    {
      rank: number;
      userId: string;
      username: string;
      weeklyScore: number;
    }
  ],
  userRank?: number;
  userScore?: number;
}

Implementation:
- Calculate current week number
- ZREVRANGE leaderboard:weekly:{weekNumber} 0 9 WITHSCORES
- Get usernames
- Return weekly rankings
```

---

## Server Implementation

### File Structure
```
src/server/
├── index.ts                          # Main server (add routes)
├── services/
│   └── LeaderboardService.ts         # Core leaderboard logic
├── models/
│   ├── LeaderboardEntry.ts          # Type definitions
│   └── UserProfile.ts               # User model
└── utils/
    └── redisHelpers.ts              # Redis utility functions
```

### LeaderboardService.ts
```typescript
import { redis } from '@devvit/web/server';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  gamesPlayed?: number;
  gamesWon?: number;
  time?: number;
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

export class LeaderboardService {
  private static readonly GLOBAL_KEY = 'leaderboard:global';
  private static readonly USER_PREFIX = 'user:';
  private static readonly LEVEL_PREFIX = 'leaderboard:level:';

  /**
   * Submit a score to the leaderboard
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
    data: {
      globalRank: number;
      levelRank: number;
      totalScore: number;
    };
  }> {
    try {
      // Update or create user profile
      const userKey = `${this.USER_PREFIX}${userId}`;
      const exists = await redis.exists(userKey);

      if (!exists) {
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
      const currentScore = parseInt(
        (await redis.hGet(userKey, 'totalScore')) || '0'
      );
      const currentBestTime = parseInt(
        (await redis.hGet(userKey, 'bestTime')) || '999999999'
      );

      // Update user stats
      const newTotalScore = currentScore + score;
      await redis.hSet(userKey, {
        username,
        totalScore: newTotalScore.toString(),
        lastUpdated: Date.now().toString(),
      });

      await redis.hIncrBy(userKey, 'gamesPlayed', 1);
      if (completed) {
        await redis.hIncrBy(userKey, 'gamesWon', 1);
      }

      // Update best time if better
      const newBestTime = time < currentBestTime;
      if (newBestTime) {
        await redis.hSet(userKey, 'bestTime', time.toString());
      }

      // Update global leaderboard
      await redis.zAdd(this.GLOBAL_KEY, {
        member: userId,
        score: newTotalScore,
      });

      // Update level-specific leaderboard (only if better time)
      const levelKey = `${this.LEVEL_PREFIX}${levelId}`;
      const currentLevelTime = await redis.zScore(levelKey, userId);

      if (!currentLevelTime || time < currentLevelTime) {
        await redis.zAdd(levelKey, {
          member: userId,
          score: time,
        });
      }

      // Get rankings
      const globalRank = await redis.zRank(this.GLOBAL_KEY, userId);
      const levelRank = await redis.zRank(levelKey, userId);

      return {
        success: true,
        newBest: newBestTime,
        rank: globalRank !== null ? globalRank + 1 : -1,
        data: {
          globalRank: globalRank !== null ? globalRank + 1 : -1,
          levelRank: levelRank !== null ? levelRank + 1 : -1,
          totalScore: newTotalScore,
        },
      };
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
    offset: number = 0,
    currentUserId?: string
  ): Promise<{
    leaderboard: LeaderboardEntry[];
    total: number;
    userRank?: number;
    userScore?: number;
  }> {
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
        const rank = await redis.zRevRank(this.GLOBAL_KEY, currentUserId);
        const score = await redis.zScore(this.GLOBAL_KEY, currentUserId);

        userRank = rank !== null ? rank + 1 : undefined;
        userScore = score !== null ? score : undefined;
      }

      return {
        leaderboard,
        total,
        userRank,
        userScore,
      };
    } catch (error) {
      console.error('Error fetching global leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get level-specific leaderboard (best times)
   */
  static async getLevelLeaderboard(
    levelId: string,
    limit: number = 10,
    currentUserId?: string
  ): Promise<{
    levelId: string;
    leaderboard: LeaderboardEntry[];
    userBest?: number;
    userRank?: number;
  }> {
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
          score: 0,
          time,
        });
      }

      // Get current user's best time and rank
      let userBest: number | undefined;
      let userRank: number | undefined;

      if (currentUserId) {
        const time = await redis.zScore(levelKey, currentUserId);
        const rank = await redis.zRank(levelKey, currentUserId);

        userBest = time !== null ? time : undefined;
        userRank = rank !== null ? rank + 1 : undefined;
      }

      return {
        levelId,
        leaderboard,
        userBest,
        userRank,
      };
    } catch (error) {
      console.error('Error fetching level leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get user profile
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
```

---

## Client Implementation

### File Structure
```
src/client/game/
├── scenes/
│   ├── LeaderboardScene.ts          # Main leaderboard scene
│   └── GameScene.ts                 # Update to submit scores
├── ui/
│   ├── LeaderboardPanel.ts          # Reusable UI component
│   └── LeaderboardEntry.ts          # Single entry component
└── services/
    └── LeaderboardClient.ts         # API client
```

### LeaderboardClient.ts
```typescript
/**
 * Client-side service for leaderboard API calls
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

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  total: number;
  userRank?: number;
  userScore?: number;
}

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
  ): Promise<{
    success: boolean;
    newBest: boolean;
    rank: number;
    data: {
      globalRank: number;
      levelRank: number;
      totalScore: number;
    };
  }> {
    const response = await fetch(`${this.BASE_URL}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ levelId, score, time, levelCompleted: completed }),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit score: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get global leaderboard
   */
  static async getGlobalLeaderboard(
    limit: number = 10,
    offset: number = 0
  ): Promise<LeaderboardResponse> {
    const response = await fetch(
      `${this.BASE_URL}/global?limit=${limit}&offset=${offset}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get level-specific leaderboard
   */
  static async getLevelLeaderboard(
    levelId: string,
    limit: number = 10
  ): Promise<{
    levelId: string;
    leaderboard: LeaderboardEntry[];
    userBest?: number;
    userRank?: number;
  }> {
    const response = await fetch(`${this.BASE_URL}/level/${levelId}?limit=${limit}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch level leaderboard: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get user profile
   */
  static async getUserProfile(userId?: string): Promise<any> {
    const url = userId
      ? `${this.BASE_URL}/user/${userId}`
      : `${this.BASE_URL}/user`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.statusText}`);
    }

    return response.json();
  }
}
```

### LeaderboardScene.ts
```typescript
import * as Phaser from 'phaser';
import { LeaderboardClient, type LeaderboardEntry } from '../services/LeaderboardClient';
import { GameConfig } from '../config';

export class LeaderboardScene extends Phaser.Scene {
  private leaderboardData: LeaderboardEntry[] = [];
  private currentPage = 0;
  private readonly ENTRIES_PER_PAGE = 10;
  private leaderboardContainer!: Phaser.GameObjects.Container;
  private loadingText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'LeaderboardScene' });
  }

  preload(): void {
    this.load.image('space', '/assets/space.png');
  }

  create(): void {
    // Background
    this.add.tileSprite(640, 360, 1280, 720, 'space');

    // Title
    this.add.text(640, 60, '🏆 GLOBAL LEADERBOARD', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Loading indicator
    this.loadingText = this.add.text(640, 360, 'Loading leaderboard...', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Container for leaderboard entries
    this.leaderboardContainer = this.add.container(0, 0);

    // Back button
    this.createBackButton();

    // Load leaderboard data
    this.loadLeaderboard();
  }

  private async loadLeaderboard(): Promise<void> {
    try {
      const data = await LeaderboardClient.getGlobalLeaderboard(this.ENTRIES_PER_PAGE, this.currentPage * this.ENTRIES_PER_PAGE);
      
      this.leaderboardData = data.leaderboard;
      this.loadingText.setVisible(false);
      this.displayLeaderboard(data);
      
      // Show user rank if available
      if (data.userRank && data.userScore) {
        this.displayUserRank(data.userRank, data.userScore);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      this.loadingText.setText('Failed to load leaderboard. Please try again.');
    }
  }

  private displayLeaderboard(data: any): void {
    this.leaderboardContainer.removeAll(true);

    const startY = 140;
    const entryHeight = 50;

    // Header
    const header = this.add.graphics();
    header.fillStyle(0x1a1a3a, 0.9);
    header.fillRoundedRect(140, startY - 10, 1000, 40, 8);
    this.leaderboardContainer.add(header);

    const headerText = [
      { text: 'RANK', x: 200 },
      { text: 'PLAYER', x: 380 },
      { text: 'SCORE', x: 750 },
      { text: 'GAMES', x: 900 },
      { text: 'WINS', x: 1020 },
    ];

    headerText.forEach(({ text, x }) => {
      const txt = this.add.text(x, startY + 10, text, {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#00ffff',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      this.leaderboardContainer.add(txt);
    });

    // Entries
    data.leaderboard.forEach((entry: LeaderboardEntry, index: number) => {
      const y = startY + 50 + index * entryHeight;
      this.createLeaderboardEntry(entry, y, index);
    });
  }

  private createLeaderboardEntry(entry: LeaderboardEntry, y: number, index: number): void {
    // Background
    const bgColor = index % 2 === 0 ? 0x0a0a1a : 0x151530;
    const bg = this.add.graphics();
    bg.fillStyle(bgColor, 0.8);
    bg.fillRoundedRect(140, y - 20, 1000, 45, 8);
    this.leaderboardContainer.add(bg);

    // Medal for top 3
    let rankColor = '#ffffff';
    let rankText = `${entry.rank}`;
    if (entry.rank === 1) {
      rankText = '🥇';
      rankColor = '#ffd700';
    } else if (entry.rank === 2) {
      rankText = '🥈';
      rankColor = '#c0c0c0';
    } else if (entry.rank === 3) {
      rankText = '🥉';
      rankColor = '#cd7f32';
    }

    // Rank
    const rank = this.add.text(200, y, rankText, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: rankColor,
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.leaderboardContainer.add(rank);

    // Username
    const username = this.add.text(380, y, entry.username, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.leaderboardContainer.add(username);

    // Score
    const score = this.add.text(750, y, entry.score.toLocaleString(), {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#00ff00',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.leaderboardContainer.add(score);

    // Games played
    const games = this.add.text(900, y, `${entry.gamesPlayed || 0}`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#cccccc',
    }).setOrigin(0.5);
    this.leaderboardContainer.add(games);

    // Wins
    const wins = this.add.text(1020, y, `${entry.gamesWon || 0}`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#00ffcc',
    }).setOrigin(0.5);
    this.leaderboardContainer.add(wins);
  }

  private displayUserRank(rank: number, score: number): void {
    // User stats panel at bottom
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a3a, 0.95);
    panel.fillRoundedRect(340, 640, 600, 60, 12);
    panel.lineStyle(3, 0x00ffff, 0.8);
    panel.strokeRoundedRect(340, 640, 600, 60, 12);
    panel.setDepth(100);

    const text = this.add.text(640, 670, `Your Rank: #${rank}  |  Your Score: ${score.toLocaleString()}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(101);
  }

  private createBackButton(): void {
    const btn = this.add.graphics();
    btn.fillStyle(0xff6600, 0.9);
    btn.fillRoundedRect(50, 50, 120, 50, 10);
    btn.setDepth(100);

    const text = this.add.text(110, 75, '← BACK', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(101);

    const hitArea = this.add.rectangle(110, 75, 120, 50, 0x000000, 0.01);
    hitArea.setInteractive({ useHandCursor: true });
    hitArea.setDepth(102);

    hitArea.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    hitArea.on('pointerover', () => {
      btn.clear();
      btn.fillStyle(0xff8833, 0.9);
      btn.fillRoundedRect(50, 50, 120, 50, 10);
      text.setScale(1.05);
    });

    hitArea.on('pointerout', () => {
      btn.clear();
      btn.fillStyle(0xff6600, 0.9);
      btn.fillRoundedRect(50, 50, 120, 50, 10);
      text.setScale(1.0);
    });
  }
}
```

---

## Integration Points

### 1. Update MenuScene
Add "View Leaderboard" button:
```typescript
// In MenuScene.ts create() method
const leaderboardButton = this.add.rectangle(640, 550, 240, 50, 0xffd700, 0.8);
const leaderboardText = this.add.text(640, 550, '🏆 LEADERBOARD', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#000000',
    fontStyle: 'bold'
}).setOrigin(0.5);

leaderboardButton.setInteractive();
leaderboardButton.on('pointerdown', () => {
    this.scene.start('LeaderboardScene');
});
```

### 2. Update GameScene
Submit score on level completion:
```typescript
// In GameScene.ts winLevel() method
private async winLevel(): Promise<void> {
    // ... existing celebration code ...
    
    // Calculate score based on time and performance
    const timeBonus = Math.max(0, 10000 - this.elapsedTime);
    const score = 1000 + timeBonus;
    
    try {
        const result = await LeaderboardClient.submitScore(
            `level_${this.level}`,
            score,
            this.elapsedTime,
            true
        );
        
        if (result.newBest) {
            // Show "New Best!" message
            this.showNewBestMessage(result.rank);
        }
    } catch (error) {
        console.error('Failed to submit score:', error);
    }
}
```

### 3. Update main.ts
Add LeaderboardScene to scene array:
```typescript
scene: [SplashScene, MenuScene, LeaderboardScene, GameScene, EditorScene, LevelSelectScene]
```

---

## Shared Types

### src/shared/types/leaderboard.ts
```typescript
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
  data: {
    globalRank: number;
    levelRank: number;
    totalScore: number;
  };
}

export interface GlobalLeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  total: number;
  userRank?: number;
  userScore?: number;
}

export interface LevelLeaderboardResponse {
  levelId: string;
  leaderboard: LeaderboardEntry[];
  userBest?: number;
  userRank?: number;
}
```

---

## Testing Strategy

### Unit Tests
```typescript
// Test LeaderboardService methods
describe('LeaderboardService', () => {
  it('should submit score and update global leaderboard', async () => {
    const result = await LeaderboardService.submitScore(
      'user123',
      'TestUser',
      'level1',
      5000,
      30000,
      true
    );
    expect(result.success).toBe(true);
    expect(result.data.totalScore).toBeGreaterThan(0);
  });

  it('should retrieve top 10 global leaderboard', async () => {
    const result = await LeaderboardService.getGlobalLeaderboard(10, 0);
    expect(result.leaderboard.length).toBeLessThanOrEqual(10);
  });

  it('should only update best time if new time is better', async () => {
    // Submit initial time
    await LeaderboardService.submitScore('user123', 'Test', 'level1', 100, 5000, true);
    
    // Submit worse time
    await LeaderboardService.submitScore('user123', 'Test', 'level1', 100, 6000, true);
    
    const levelBoard = await LeaderboardService.getLevelLeaderboard('level1', 10);
    const userEntry = levelBoard.leaderboard.find(e => e.userId === 'user123');
    expect(userEntry?.time).toBe(5000); // Should keep better time
  });
});
```

### Integration Tests
```typescript
// Test API endpoints
describe('/api/leaderboard', () => {
  it('POST /api/leaderboard/submit should return success', async () => {
    const response = await fetch('/api/leaderboard/submit', {
      method: 'POST',
      body: JSON.stringify({
        levelId: 'level1',
        score: 1000,
        time: 30000,
        levelCompleted: true
      })
    });
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
```

---

## Performance Considerations

### Redis Optimization
1. **Use pipelining** for multiple Redis commands
2. **Set TTL** on weekly leaderboards (auto-cleanup)
3. **Cache user profiles** in memory for frequently accessed data
4. **Limit ZRANGE** queries to top 100 max

### Client Optimization
1. **Pagination** for large leaderboards (10-20 entries per page)
2. **Debounce** score submissions (max 1 per second)
3. **Cache** leaderboard data for 30 seconds client-side
4. **Lazy load** user profiles (only fetch when needed)

---

## Security Considerations

1. **Rate limiting** on score submission (max 10/minute per user)
2. **Validate** score values (prevent impossibly high scores)
3. **Sanitize** usernames (prevent XSS)
4. **Use Redis transactions** for atomic operations
5. **Authenticate** all requests via Devvit context

---

## Deployment Checklist

- [ ] Create LeaderboardService.ts
- [ ] Add leaderboard endpoints to server/index.ts
- [ ] Create shared types in shared/types/leaderboard.ts
- [ ] Create LeaderboardClient.ts
- [ ] Create LeaderboardScene.ts
- [ ] Update MenuScene with leaderboard button
- [ ] Update GameScene to submit scores
- [ ] Add LeaderboardScene to main.ts scene array
- [ ] Test locally with `npm run dev`
- [ ] Test Redis operations in Devvit playtest
- [ ] Verify Reddit username appears correctly
- [ ] Test pagination and ranking
- [ ] Deploy with `npm run deploy`

---

## Future Enhancements

### Phase 2 (Optional)
- [ ] Friends leaderboard (compare with Reddit friends)
- [ ] Daily challenges with separate leaderboards
- [ ] Achievement system
- [ ] Replay system (save best runs)
- [ ] Real-time updates (refresh every 30s)
- [ ] Level creator leaderboard (most popular custom levels)
- [ ] Clan/Team system

---

**Status:** Specification Complete ✅
**Next Step:** Implementation
**Estimated Time:** 4-6 hours for full implementation
