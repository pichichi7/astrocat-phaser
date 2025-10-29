# ASTROCAT - Community Puzzle Game Requirements

## Project Overview
ASTROCAT is an isometric puzzle game inspired by Q*bert, built for Reddit's Community Games Hackathon. The game features user-generated content where players can create, share, and play community levels through Reddit's Devvit platform.

## User Stories (EARS Notation)

### Level Editor System

**US-01: Block Selection**
WHEN user clicks on block type button (Normal, Trap, Trampoline, Goal, Enemy)
THE SYSTEM SHALL highlight selected block with animated cyan border  
AND deselect previously selected block with fade-out animation
AND update cursor preview to show selected block type

**US-02: Block Placement**
WHEN user clicks on valid grid position with block type selected
THE SYSTEM SHALL create block sprite at isometric coordinates
AND add block to levelData map with key format "{row}_{col}"
AND update preview rendering in real-time
AND IF position already contains block THE SYSTEM SHALL replace existing block

**US-03: Block Removal**
WHEN user right-clicks on existing block
THE SYSTEM SHALL remove block from levelData map
AND destroy corresponding sprite with fade-out animation
AND recalculate grid connectivity

**US-04: Level Validation**  
WHEN user clicks "Test Level" button
THE SYSTEM SHALL run Breadth-First Search pathfinding algorithm from spawn to goal
AND IF valid path exists THE SYSTEM SHALL transition to GameScene with test mode enabled
AND IF no path exists THE SYSTEM SHALL display error toast with message "Goal is unreachable - add more blocks"
AND IF no goal exists THE SYSTEM SHALL display error "Please set a Goal block (yellow)"
AND IF no spawn exists THE SYSTEM SHALL display error "Please set Spawn point (green)"

**US-05: Save Level Locally**
WHEN user clicks "Save" button
THE SYSTEM SHALL serialize levelData to JSON format
AND save to browser localStorage with key "astrocat_custom_level"
AND display success toast "Level saved locally"
AND preserve level state on page reload

**US-06: Clear Level**
WHEN user clicks "Clear" button
THE SYSTEM SHALL prompt confirmation dialog "Clear all blocks?"
AND IF confirmed THE SYSTEM SHALL remove all blocks from grid
AND reset to initial state with single starter block
AND clear localStorage

**US-07: Community Sharing**
WHEN user clicks "Share to Reddit" button  
THE SYSTEM SHALL validate level is completable (BFS check)
AND IF valid THE SYSTEM SHALL open ShareLevelDialog modal
AND prompt user for level name and difficulty selection
AND create Devvit custom post via POST /api/share-level
AND embed serialized level data in post metadata
AND redirect to Browse Levels scene showing newly created level

### Gameplay System

**US-08: Isometric Movement**
WHEN player presses WASD or arrow keys
THE SYSTEM SHALL calculate target cube position in diamond grid layout
AND IF target cube exists THE SYSTEM SHALL move character with smooth tween animation (300ms)
AND change current cube color according to BlockType rules
AND IF target is void THE SYSTEM SHALL trigger fall animation and lose life
AND update score based on time elapsed

**US-09: Block Type Interactions**
WHEN player lands on block
THE SYSTEM SHALL execute block-specific behavior:
- NORMAL (0): Changes to visited color (green)
- TRAP (1): Triggers instant death and respawn
- TRAMPOLINE (3): Launches player 2 cubes forward with bounce animation
- GOAL (6): Triggers win condition if all blocks visited
- VOID (-1): Player falls and loses life

**US-10: Enemy AI**
WHEN enemy entity updates
THE SYSTEM SHALL check distance to player
AND IF distance < 3 cubes THE SYSTEM SHALL pursue player with A* pathfinding
AND IF distance >= 3 cubes THE SYSTEM SHALL patrol between random cubes
AND IF enemy collides with player THE SYSTEM SHALL reduce player lives by 1

**US-11: Win Condition**
WHEN player steps on Goal block
THE SYSTEM SHALL verify all non-goal blocks are visited (color changed)
AND IF true THE SYSTEM SHALL display "LEVEL COMPLETE" screen
AND calculate final score (base + time bonus + lives bonus)
AND trigger POST /api/submit-score to leaderboard
AND transition to victory screen with options: Next Level, Retry, Menu

**US-12: Lose Condition**
WHEN player lives reach 0
THE SYSTEM SHALL display "GAME OVER" screen
AND show final score and best attempt
AND provide options: Retry, Browse Levels, Menu

**US-13: Leaderboards Integration**
WHEN player completes level
THE SYSTEM SHALL submit score to backend via LeaderboardClient.submitScore()
AND send userId from Reddit context (context.userId)
AND display global ranking with Reddit usernames
AND highlight current player's rank with gold color
AND show top 10 players with medals (🥇🥈🥉)

### Browse Levels System

**US-14: Community Levels Feed**
WHEN user opens BrowseLevelsScene
THE SYSTEM SHALL fetch latest 50 community levels via GET /api/levels/all?limit=50
AND display with card layout showing:
  - Level name
  - Creator username (from Reddit)
  - Difficulty badge (Easy/Medium/Hard)
  - Play count
  - Average rating (1-5 stars)
AND provide PLAY button for each level

**US-15: Level Loading**
WHEN user clicks PLAY on community level
THE SYSTEM SHALL fetch full level data from GET /api/levels/shared/{levelId}
AND deserialize levelData JSON to Map<string, BlockType>
AND transition to GameScene with custom level loaded
AND increment play count via backend

**US-16: Auto-Refresh**
WHEN BrowseLevelsScene is active
THE SYSTEM SHALL refresh level list every 10 seconds automatically
AND preserve scroll position on refresh
AND show loading indicator during fetch

**US-17: Empty State**
WHEN no community levels exist
THE SYSTEM SHALL display placeholder message:
  "No levels yet! Be the first to share one in the Editor 🚀"
AND show button linking to EditorScene

### Leaderboard System

**US-18: Global Leaderboard Display**
WHEN user opens LeaderboardScene
THE SYSTEM SHALL fetch top 100 players via GET /api/leaderboard/global
AND display with columns: Rank, Username, Score, Games Played, Wins
AND highlight current user's entry with cyan background
AND auto-refresh every 5 seconds

**US-19: Level-Specific Leaderboard**
WHEN viewing specific level leaderboard
THE SYSTEM SHALL fetch via GET /api/leaderboard/level/{levelId}
AND show top 50 scores for that level only
AND display personal best for current user

**US-20: Score Submission**
WHEN score submitted via POST /api/submit-score
THE SYSTEM SHALL validate score is higher than previous best
AND IF higher THE SYSTEM SHALL update Redis sorted set
AND return new rank and "New High Score!" flag
AND IF not higher THE SYSTEM SHALL return existing rank

### Reddit Integration

**US-21: User Authentication**
WHEN game loads in Devvit WebView
THE SYSTEM SHALL retrieve userId from context.userId (Reddit OAuth)
AND fetch username via reddit.getCurrentUser()
AND IF username unavailable THE SYSTEM SHALL use fallback "Player_{userId.slice(-8)}"

**US-22: Custom Post Creation**
WHEN level shared to Reddit
THE SYSTEM SHALL call reddit.submitPost() with:
  - Title: "🎮 Custom Level: {levelName}"
  - Subreddit: current subreddit from context
  - Post type: custom post with ASTROCAT app
  - Metadata: serialized levelData JSON
AND return postId and postUrl

**US-23: Deep Linking**
WHEN user clicks on level post in Reddit feed
THE SYSTEM SHALL detect levelId from URL hash
AND skip SplashScene directly to GameScene with loaded level
AND display "Playing community level by @{creator}"

### UI/UX System

**US-24: Responsive Layout**
WHEN viewport width changes
THE SYSTEM SHALL adapt UI layout using breakpoints:
  - Mobile (320px - 767px): Single column, large buttons
  - Tablet (768px - 1023px): Compact controls, side panels
  - Desktop (1024px+): Full UI with all panels visible
AND scale Phaser game canvas with RESIZE scale mode
AND maintain aspect ratio 16:9

**US-25: Touch Controls**
WHEN game detects touch device (mobile/tablet)
THE SYSTEM SHALL display virtual D-pad for movement
AND show jump button on right side
AND support swipe gestures as alternative to D-pad

**US-26: Tutorial System**
WHEN first-time player starts game
THE SYSTEM SHALL display interactive tutorial overlay
AND guide through basic movement (WASD)
AND explain block color change mechanic
AND show goal objective
AND allow skip with "ESC" key

## Non-Functional Requirements

### Performance

**NFR-01: Frame Rate**
THE SYSTEM SHALL maintain minimum 30 FPS on mobile devices (iPhone 12, Galaxy S21)
AND minimum 60 FPS on desktop browsers (Chrome, Firefox, Safari)
AND optimize sprite rendering using texture atlases

**NFR-02: Load Time**
THE SYSTEM SHALL load initial game bundle in under 3 seconds on 3G connection
AND preload critical assets (player, blocks, UI) in SplashScene
AND lazy-load audio assets after game starts

**NFR-03: Memory Usage**
THE SYSTEM SHALL limit total memory usage to under 200 MB
AND destroy unused scenes when transitioning
AND clear sprite pools when levels unload

### Responsive Design

**NFR-04: Viewport Compatibility**
THE SYSTEM SHALL adapt UI layout for viewports 320px to 1920px wide
AND test on devices: iPhone SE (375px), iPad (768px), Desktop (1920px)
AND use CSS Grid for panel layouts

**NFR-05: Orientation Support**
THE SYSTEM SHALL support landscape orientation on mobile
AND display rotation prompt on portrait orientation
AND adjust UI panels for landscape aspect ratio

### Reddit/Devvit Integration

**NFR-06: Devvit Compliance**
THE SYSTEM SHALL use Devvit Web custom posts exclusively
AND comply with Reddit Developer Platform rules
AND use approved APIs only (redis, reddit, context)
AND pass Devvit app review requirements

**NFR-07: Reddit Authentication**
THE SYSTEM SHALL authenticate users via context.userId
AND never store passwords or OAuth tokens
AND use Reddit usernames in leaderboards

**NFR-08: Data Persistence**
THE SYSTEM SHALL store all game data in Redis with proper TTL:
  - Leaderboard entries: permanent
  - Shared levels: 90 days TTL
  - User sessions: 24 hours TTL

### Security

**NFR-09: Input Validation**
THE SYSTEM SHALL sanitize all user inputs (level names, descriptions)
AND reject invalid characters in level data
AND prevent XSS attacks in text fields

**NFR-10: Score Validation**
THE SYSTEM SHALL validate scores on server-side
AND reject impossible scores (exceeding max possible)
AND detect rapid score submissions (rate limiting)

### Accessibility

**NFR-11: Keyboard Navigation**
THE SYSTEM SHALL support full keyboard navigation
AND provide keyboard shortcuts for all actions
AND display key bindings in Settings menu

**NFR-12: Color Blindness Support**
THE SYSTEM SHALL use distinct block patterns in addition to colors
AND provide color blind mode toggle in Settings
AND use WCAG AAA contrast ratios for text

## Success Metrics

**Metric-01: Engagement**
THE SYSTEM SHALL track:
- Daily active users (DAU)
- Average session duration (target: 10+ minutes)
- Levels created per user (target: 2+)
- Levels played per session (target: 5+)

**Metric-02: Community Content**
THE SYSTEM SHALL measure:
- Total community levels shared (target: 100+ in first week)
- Average plays per level (target: 20+)
- Levels with 4+ star rating (target: 60%)

**Metric-03: Technical Health**
THE SYSTEM SHALL monitor:
- Error rate (target: <1% of sessions)
- Crash rate (target: <0.1%)
- API response time (target: <200ms p95)

## Acceptance Criteria

**AC-01: Minimum Viable Product**
THE SYSTEM SHALL include:
- [x] 4 playable predefined levels
- [x] Full level editor with all block types
- [x] Share to Reddit functionality
- [x] Browse community levels
- [x] Global leaderboard
- [x] Responsive design (mobile + desktop)

**AC-02: Hackathon Submission**
THE SYSTEM SHALL:
- [x] Deploy on Reddit via devvit upload
- [x] Pass Reddit app review
- [x] Function in at least 1 test subreddit
- [x] Include README with installation instructions
- [x] Have 0 critical bugs

**AC-03: Kiro Documentation**
THE SYSTEM SHALL include:
- [x] .kiro/specs/ with requirements, design, tasks
- [x] .kiro/steering/ with project context
- [x] KIRO_DEVELOPER_EXPERIENCE.md writeup
- [x] .kiro/ folder NOT in .gitignore
