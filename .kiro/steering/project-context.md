# ASTROCAT Project Context

## Project Overview

**Name:** ASTROCAT  
**Type:** Isometric Puzzle Game with User-Generated Content  
**Platform:** Reddit Devvit (Web Custom Posts)  
**Purpose:** Reddit & Kiro Community Games Hackathon Submission  
**Start Date:** October 15, 2025  
**Deadline:** October 29, 2025  
**Status:** 95% Complete, Ready for Deployment

## Core Concept

ASTROCAT is an isometric puzzle game inspired by the classic Q*bert arcade game, with a modern twist: **community-created levels**. Players can:
1. Play 4 predefined levels with increasing difficulty
2. Create custom levels using a full-featured editor
3. Share levels to Reddit (creates actual Reddit posts)
4. Browse and play community levels
5. Compete on global and level-specific leaderboards

The game is fully integrated with Reddit's Devvit platform, using custom posts as the delivery mechanism and Redis for data persistence.

## Tech Stack

### Frontend
- **Game Engine:** Phaser 3.88.2
- **Language:** TypeScript 5.8.2
- **Build Tool:** Vite 6.2.4
- **Bundler:** ESBuild (via Vite)
- **Styling:** CSS3 (minimal, mostly Phaser rendering)

### Backend
- **Runtime:** Node.js 22
- **Framework:** Express 5.1.0
- **Platform:** Devvit Web 0.12.1
- **Database:** Redis (Devvit managed)
- **APIs:** Reddit API (via Devvit SDK)

### DevOps
- **Package Manager:** npm
- **Version Control:** Git
- **Deployment:** Devvit CLI (`devvit upload`)
- **Linting:** ESLint 9.23.0 with TypeScript plugin
- **Type Checking:** TypeScript strict mode

### Dependencies
```json
{
  "phaser": "3.88.2",           // Game engine
  "devvit": "0.12.1",           // Reddit platform SDK
  "@devvit/web": "0.12.1",      // WebView integration
  "express": "5.1.0",           // Backend API
  "typescript": "5.8.2",        // Type safety
  "vite": "6.2.4"               // Build tool
}
```

## Architecture Principles

### 1. Modular Scene-Based Design
Each game screen is a self-contained `Phaser.Scene` subclass:
- **SplashScene:** Loading and logo animation
- **MenuScene:** Main menu navigation
- **GameScene:** Actual gameplay with physics
- **EditorScene:** Level creation tool
- **LevelSelectScene:** Choose predefined levels
- **LeaderboardScene:** Global rankings
- **BrowseLevelsScene:** Community level browser

**Benefits:**
- Easy to navigate codebase (each scene ~500-1000 LOC)
- Scenes can be loaded/unloaded independently
- Clear separation of concerns

### 2. Centralized Configuration
`GameConfig.ts` contains all game constants:
- Phaser initialization config
- Scale settings (responsive breakpoints)
- Isometric grid parameters
- Color palettes
- Physics settings
- API endpoints

**Benefits:**
- Single source of truth for magic numbers
- Easy to tune game balance
- Prevents hardcoded values scattered across files

### 3. Type Safety First
All code uses **strict TypeScript**:
- No `any` types (enforced by tsconfig.json)
- Explicit interfaces for all data structures
- Type guards for runtime validation
- Generic types for reusable components

**Benefits:**
- Catches bugs at compile time
- IDE autocomplete and IntelliSense
- Self-documenting code
- Easier refactoring

### 4. Reddit-First Integration
Game is designed around Reddit's ecosystem:
- All shared levels create Devvit custom posts
- User authentication via Reddit OAuth (context.userId)
- Leaderboards use Reddit usernames
- Data persists in Reddit-managed Redis
- No external databases or auth systems

**Benefits:**
- Seamless user experience (no separate login)
- Native Reddit content (levels appear in feed)
- Leverages Reddit's community features
- Simplified deployment (no separate backend hosting)

### 5. Responsive-First Design
Game adapts to viewport sizes:
- **Mobile (320px-767px):** Single column, large buttons
- **Tablet (768px-1023px):** Compact layout, side panels
- **Desktop (1024px+):** Full UI with all panels visible

Phaser scale mode: `Phaser.Scale.FIT` (maintains aspect ratio)

**Benefits:**
- Playable on any device
- No separate mobile/desktop codebases
- Future-proof for new screen sizes

## Coding Standards

### File Structure
```
src/
├── client/                    # Frontend Phaser game
│   ├── game/
│   │   ├── main.ts           # Entry point, Phaser init
│   │   ├── config/
│   │   │   └── GameConfig.ts # Centralized constants
│   │   ├── scenes/           # All game scenes
│   │   │   ├── SplashScene.ts
│   │   │   ├── MenuScene.ts
│   │   │   ├── GameScene.ts
│   │   │   ├── EditorScene.ts
│   │   │   ├── LevelSelectScene.ts
│   │   │   ├── LeaderboardScene.ts
│   │   │   └── BrowseLevelsScene.ts
│   │   ├── utils/            # Helper functions
│   │   │   ├── DevvitBridge.ts
│   │   │   └── IsometricUtils.ts
│   │   ├── services/         # API clients
│   │   │   ├── LeaderboardClient.ts
│   │   │   └── LevelSharingClient.ts
│   │   └── ui/               # Reusable UI components
│   │       └── ShareLevelDialog.ts
│   ├── index.html            # WebView entry
│   └── style.css             # Minimal global styles
├── server/                    # Backend Express API
│   ├── index.ts              # Express app, routes
│   └── services/             # Business logic
│       ├── LeaderboardService.ts
│       └── LevelSharingService.ts
└── main.tsx                   # Devvit app entry (Blocks UI)
```

### Scene Structure Pattern
All scenes follow this consistent structure:

```typescript
export class ExampleScene extends Phaser.Scene {
    // 1. Class properties (state)
    private player!: Phaser.GameObjects.Sprite;
    private score: number = 0;
    
    // 2. Constructor (scene key)
    constructor() {
        super({ key: 'ExampleScene' });
    }
    
    // 3. init() - Receive data from previous scene
    init(data: { levelId?: number }) {
        // Initialize with passed data
    }
    
    // 4. preload() - Load assets (if needed)
    preload() {
        // Load sprites, audio, etc.
    }
    
    // 5. create() - Setup scene
    create() {
        this.createBackground();
        this.createWorld();
        this.createUI();
        this.setupInputHandlers();
    }
    
    // 6. update() - Game loop (60 FPS)
    update(time: number, delta: number) {
        // Update game state each frame
    }
    
    // 7. Helper methods (private)
    private createBackground() { }
    private createWorld() { }
    private createUI() { }
    private setupInputHandlers() { }
}
```

### Naming Conventions
- **Scenes:** PascalCase + "Scene" suffix (e.g., `GameScene`)
- **Interfaces:** PascalCase (e.g., `LevelData`)
- **Enums:** PascalCase (e.g., `BlockType`)
- **Variables:** camelCase (e.g., `playerPosition`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `TILE_WIDTH`)
- **Private members:** Prefix with `_` or use TypeScript `private`

### Code Style
- **Indentation:** 4 spaces (enforced by ESLint)
- **Semicolons:** Always use (TypeScript convention)
- **Quotes:** Single quotes for strings
- **Max line length:** 120 characters
- **Trailing commas:** Always in multiline objects/arrays

### Data Serialization
- **LevelData:** Always serialize to JSON via `JSON.stringify()`
- **Redis Storage:** All data stored as strings (JSON or plain text)
- **Position Keys:** Format `{row}_{col}` for grid positions
- **IDs:** Format `level:{timestamp}:{userId}` for shared levels

### Isometric Coordinate System
- **Grid Positions:** `{ row: number; col: number }`
- **Screen Positions:** `{ x: number; y: number }` (pixels)
- **Conversion:** Use `GameConfig.ISOMETRIC_UTILS.isoToScreen()`
- **Tile Size:** 120px width, 60px height (2:1 ratio)

## Development Workflow

### 1. Spec-Driven Development
Before writing any feature code:
1. Write user stories in `requirements.md` (EARS notation)
2. Design interfaces and data flow in `design.md`
3. Break down into atomic tasks in `tasks.md`
4. Implement with acceptance criteria as checklist

**Why:** Prevents scope creep, ensures complete features, faster debugging

### 2. Scene-First Iteration
When building a new scene:
1. Create empty scene class with constructor + key
2. Add to `scenes` array in `main.ts`
3. Implement `create()` with placeholder UI
4. Test navigation (back button to menu)
5. Fill in actual functionality incrementally

**Why:** Ensures navigation works before complex logic, easy to demo progress

### 3. BFS Validation Always
Before saving or sharing any level:
1. Run Breadth-First Search from spawn to goal
2. Check if path exists
3. Verify all blocks are reachable
4. Reject invalid levels with specific error messages

**Why:** Prevents unplayable levels from cluttering community

### 4. Responsive Design Testing
Test every UI change at these viewports:
- **320px:** iPhone SE (portrait)
- **768px:** iPad (portrait)
- **1024px:** iPad Pro (landscape)
- **1920px:** Desktop

**Tool:** Chrome DevTools → Responsive Mode

### 5. Redis Data Inspection
Use Devvit CLI to inspect Redis state:
```bash
# View all keys
devvit redis-cli KEYS *

# View leaderboard
devvit redis-cli ZRANGE leaderboard:global 0 -1 WITHSCORES

# View level data
devvit redis-cli HGETALL level:1730000000000:t2_abc123
```

### 6. Continuous Integration
On every commit:
1. `npm run check` (type-check + lint + prettier)
2. Fix all errors before pushing
3. Build locally (`npm run build`) to catch bundling issues
4. Test in playtest mode (`npm run dev`)

## Devvit-Specific Best Practices

### Reddit Context Usage
Always access user data via `context`:
```typescript
const userId = context.userId;         // t2_xxxxx format
const username = await reddit.getCurrentUser();
const postId = context.postId;         // Current post (if applicable)
const subreddit = context.subredditName;
```

### Redis Best Practices
- **Use TTL for temporary data:** `redis.set(key, value, { expiration: Date.now() + 86400000 })`
- **Atomic operations:** Use `HINCRBY` for counters
- **Sorted sets for rankings:** `ZADD`, `ZRANGE` for leaderboards
- **Hashes for structured data:** `HSET`, `HGETALL` for levels

### WebView ↔ Devvit Communication
- **WebView → Devvit:** `window.parent.postMessage({ type, data }, '*')`
- **Devvit → WebView:** `webview.postMessage({ type, data })`
- **Always use typed messages:** Define interfaces for all message types
- **Handle errors gracefully:** Wrap in try/catch

### Custom Post Creation
```typescript
// Share level to Reddit
const post = await reddit.submitPost({
    subredditName: context.subredditName,
    title: `🎮 Custom Level: ${levelName}`,
    preview: {
        text: `Play this ${difficulty} level by @${username}`,
        url: `https://reddit.com${context.postId}`
    }
});
```

## Performance Considerations

### Bundle Size
- **Client Bundle:** Target < 100 KB (current: 76.55 KB)
- **Server Bundle:** < 5 MB (current: 4.68 MB)
- **Use code splitting:** Lazy load scenes if bundle grows

### Frame Rate
- **Desktop Target:** 60 FPS
- **Mobile Target:** 30 FPS minimum
- **Optimization:** Use sprite pools, limit particles, cache calculations

### Memory Usage
- **Target:** < 200 MB total
- **Destroy unused scenes:** Use `scene.sleep()` instead of `scene.start()`
- **Clear textures:** Remove large assets when not needed

### API Response Time
- **Target:** < 200ms for p95
- **Caching:** Use Redis for frequently accessed data
- **Pagination:** Limit large queries (e.g., top 100 leaderboard)

## Security Notes

### Input Validation
- **Level names:** Max 50 characters, alphanumeric + spaces only
- **Scores:** Validate range (0 to max possible score)
- **Level data:** Reject levels with > 100 blocks (DoS prevention)

### XSS Prevention
- **Never use `innerHTML`:** Use Phaser's text rendering
- **Sanitize user input:** Escape special characters in level names
- **No eval():** Never execute user-provided code

### Rate Limiting
- **Score submissions:** Max 1 per minute per user
- **Level sharing:** Max 5 per hour per user
- **API calls:** Use Devvit's built-in rate limiting

## Common Pitfalls to Avoid

### ❌ Don't hardcode coordinates
```typescript
// BAD
this.player.setPosition(640, 360);

// GOOD
this.player.setPosition(
    this.cameras.main.centerX,
    this.cameras.main.centerY
);
```

### ❌ Don't forget to clean up
```typescript
// BAD
create() {
    this.time.addEvent({ delay: 1000, callback: this.doSomething, loop: true });
}

// GOOD
create() {
    this.myTimer = this.time.addEvent({ delay: 1000, callback: this.doSomething, loop: true });
}

shutdown() {
    this.myTimer?.destroy();
}
```

### ❌ Don't mutate levelData directly
```typescript
// BAD
levelData.cubes.set(key, BlockType.NORMAL);

// GOOD
const newCubes = new Map(levelData.cubes);
newCubes.set(key, BlockType.NORMAL);
const updatedLevel = { ...levelData, cubes: newCubes };
```

### ❌ Don't assume Redis data exists
```typescript
// BAD
const levelData = await redis.hGetAll(`level:${id}`);
return JSON.parse(levelData.levelData);

// GOOD
const levelData = await redis.hGetAll(`level:${id}`);
if (!levelData || !levelData.levelData) {
    throw new Error('Level not found');
}
return JSON.parse(levelData.levelData);
```

## Testing Strategy

### Manual Testing Checklist
Every build should pass:
- [ ] Can create level in editor
- [ ] Can test level (valid/invalid detection works)
- [ ] Can share level to Reddit
- [ ] Level appears in Browse Levels
- [ ] Can play shared level
- [ ] Score submits to leaderboard
- [ ] Leaderboard displays correctly
- [ ] Responsive on mobile/desktop

### Critical User Flows
1. **First-time player:** Splash → Menu → Level Select → Play → Win → Leaderboard
2. **Level creator:** Menu → Editor → Design → Test → Share → Browse (verify)
3. **Community player:** Browse → Play → Complete → Rate → Back

## Deployment Checklist

### Pre-Deploy
- [ ] `npm run check` passes
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Manual testing passed
- [ ] Responsive testing passed

### Deploy
```bash
npm run build
devvit upload
devvit install r/your_subreddit
```

### Post-Deploy
- [ ] Game loads in WebView
- [ ] Can create custom post
- [ ] All features work in production
- [ ] No console errors
- [ ] Performance acceptable

## Future Roadmap

### Phase 2 (Post-Hackathon)
- Touch controls with virtual D-pad
- Level thumbnail generation
- Comment integration (fetch Reddit comments)
- User profiles with created levels
- Daily challenges

### Phase 3 (Multiplayer)
- Real-time race mode (2-4 players)
- Spectator mode
- Team challenges
- Weekly tournaments

## Team & Contacts

- **Developer:** Solo developer (hackathon project)
- **Platform:** Reddit Devvit
- **Support:** r/astrocatapp (community subreddit)
- **Hackathon:** Reddit & Kiro Community Games Challenge
- **Deadline:** October 29, 2025

## License & Credits

- **License:** MIT (or BSD-3-Clause, check LICENSE file)
- **Game Engine:** Phaser 3 (MIT License)
- **Platform:** Reddit Devvit (Reddit Inc.)
- **Inspiration:** Q*bert (1982, Gottlieb)
- **Assets:** Custom pixel art + free sprites (attribution in README)

---

**Last Updated:** October 29, 2025  
**Version:** 2.1.2  
**Status:** Ready for Deployment 🚀
