---
include_when: ["server/**/*.ts", "src/utils/reddit*.ts"]
---

# Reddit Devvit Integration Patterns

## API Constraints

- Rate limit: 60 req/min per OAuth token
- Use `reddit.submitPost()` not REST API
- Redis: 5MB per-key limit
- Error handling: Reddit returns HTML on errors, not JSON

## Level Sharing Flow

Player creates → BFS validate → Compress JSON → 
Post to Reddit → Store in Redis → Return URL

## Backend-Frontend Sync

When changing level format:
1. Update `src/types/Level.ts`
2. Update `server/models/Level.ts`
3. Update validation
4. Regenerate API client
