---
include_when: "src/scenes/**/*.ts"
---

# Phaser 3 Scene Patterns for ASTROCAT

## Scene Lifecycle Rules

When modifying scenes:
1. Check `preload()` loads all required assets
2. Verify `create()` initializes objects in correct z-order
3. Ensure `update()` stays under 16ms (60 FPS)
4. Add cleanup in `shutdown()` for memory leaks

## Isometric Math Standards

Q*bert style movement:
- Tile: 64px × 32px (2:1 ratio)
- Screen X = (gridX - gridY) * 32
- Screen Y = (gridX + gridY) * 16
- Use `Phaser.Math.Snap.To()` for alignment

## Anti-Patterns

❌ NEVER use `this.scene.start()` without `this.scene.stop()`
❌ NEVER create objects in `update()` - only in `create()`
❌ NEVER hardcode dimensions - use `this.scale.width/height`
❌ NEVER mutate state directly - use events: `this.events.emit()`

## Reddit Integration

Level sharing context:
- OAuth tokens expire in 1 hour
- Reddit posts: 40K chars max
- Validate JSON before posting
- Use `devvit.storage.set()` not localStorage
