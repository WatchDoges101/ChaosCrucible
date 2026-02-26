# Quick Start: Running Chaos Crucible with Phaser

## Step 1: Install Dependencies
```bash
npm install
```
This installs:
- **phaser** (3.60.0) - Game framework
- **howler** (2.2.4) - Audio engine
- **vite** (5.0.0) - Fast dev server + build tool

## Step 2: Start Development Server
```bash
npm run dev
```
Opens http://localhost:3000 in your browser with hot-reload enabled.

## Step 3: Navigate the Game
- **Menu Scene**: Start Game → Character Selection → Game
- **Keyboard Controls** (in game): WASD to move, ESC to pause
- **Debug Console**: `window.gameState`, `window.audioManager`

## File Layout

```
Old Canvas Version          New Phaser Version
main.js                     main.phaser.js (entry point)
sceneTemplate.js            (no longer needed)
scenes/menu.js              scenes/phaser/MenuScene.js
scenes/host.js              scenes/phaser/HostScene.js
scenes/*.js                 scenes/phaser/*.js

(All original files remain - no deletion)
├── config/gameConfig.js         (new)
├── services/gameState.js        (new)
├── services/audioManager.js     (new)
├── utils/helpers.js             (new)
└── Documentation files (new):
    ├── PHASER_MIGRATION_GUIDE.md
    ├── BEST_PRACTICES.md
    └── PHASER_CHEATSHEET.md
```

## Build for Production
```bash
npm run build
```
Creates optimized game in `dist/` folder.

## Incremental Migration Path

You **don't need to migrate everything at once:**

### Option A: Run both versions in parallel
- Keep using `index.html` (canvas version)
- Optionally test Phaser version with `index.phaser.html`
- Gradually migrate scenes

### Option B: Migrate one scene at a time
1. Start with MenuScene (simplest)
2. Test thoroughly
3. Move to CharacterSelectionScene
4. Finally migrate HostScene

### Option C: Use Phaser for new features only
- Keep canvas-based gameplay
- Add new features in Phaser scenes
- Bridge them with `gameState`

## Key Architectural Changes

| Aspect | Old | New |
|--------|-----|-----|
| **Scene Init** | `onEnter(state, canvas)` | `create()` |
| **Frame Loop** | `gameLoop(timestamp)` | Built-in `update(time, delta)` |
| **State** | `const state = {...}` | `gameState` + events |
| **Input** | Manual key tracking | `this.keys.*` + pointer events |
| **Audio** | None | `audioManager` (Howler) |
| **Rendering** | Canvas context | Phaser display objects |
| **Animation** | Manual tweens | `this.tweens.add(...)` |

## Common First Steps After Install

### 1. Test Menu Scene
```javascript
// Browser console
window.game.scene.scenes  // Verify MenuScene is active
```

### 2. Register Sounds (optional)
```javascript
const { audioManager } = window;
audioManager.registerSFX('click', './audio/click.wav');
audioManager.playSFX('click');
```

### 3. Access Game State
```javascript
const { gameState } = window;
gameState.setSelectedRole('archer');
gameState.character  // Verify change
```

### 4. Monitor Performance
```javascript
// In browser DevTools
window.game.loop.actualFps  // Current FPS
```

## Troubleshooting

### "Module not found"
```bash
npm install  # Make sure dependencies are installed
```

### Port 3000 already in use
```bash
# Specify different port
vite --port 3001
```

### Hot reload not working
- Check browser console for errors
- Restart dev server: `Ctrl+C`, then `npm run dev`

### Audio doesn't play
- Audio requires user interaction first (browser security)
- Click something in the game before audio will work
- Check browser console for loading errors

### Phaser not in window
- Make sure `index.phaser.html` is loaded
- Check that `main.phaser.js` is being imported
- Verify no console errors

## Next: Migration Resources

1. **Read docs in this order:**
   - `PHASER_MIGRATION_GUIDE.md` (architecture + patterns)
   - `PHASER_CHEATSHEET.md` (quick reference)
   - `BEST_PRACTICES.md` (detailed patterns + tips)

2. **Study example scenes:**
   - `scenes/phaser/MenuScene.js` (simplest)
   - `scenes/phaser/CharacterSelectionScene.js` (buttons + state)
   - `scenes/phaser/HostScene.js` (game loop + physics)

3. **Reference official Phaser docs:**
   - [Phaser 3 Docs](https://photonstorm.github.io/phaser3-docs/)
   - [Phaser Examples](https://phaser.io/examples)

## Key File Reference

| File | Purpose |
|------|---------|
| `main.phaser.js` | Entry point - loads Phaser, registers scenes |
| `config/gameConfig.js` | Phaser config + game constants |
| `services/gameState.js` | Centralized persistent state |
| `services/audioManager.js` | Audio wrapper around Howler |
| `utils/helpers.js` | Reusable utility functions |
| `scenes/phaser/*.js` | Game scenes (UI + logic) |
| `index.phaser.html` | HTML template for Phaser version |

---

**You're ready!** Run `npm run dev` and start exploring. The architecture is designed for incremental growth—add complexity as you need it.

**Questions?**
- Check docs in order: MIGRATION_GUIDE → CHEATSHEET → BEST_PRACTICES
- Look at example scene implementations
- Phaser docs are excellent for specific features
