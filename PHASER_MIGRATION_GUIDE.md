# Chaos Crucible: Phaser + Howler Architecture Guide

## Overview

This guide explains the new Phaser + Howler architecture for Chaos Crucible and how to migrate incrementally from your canvas-based version.

## Why Phaser?

| Feature | Canvas | Phaser |
|---------|--------|--------|
| Scene Management | Manual | Built-in, state machine |
| Animation/Tweens | Write yourself | Native tweens, timelines |
| Input Handling | Manual tracking | Automatic hitbox detection |
| Physics | DIY collision | Arcade/Matter physics integrated |
| Performance | Good for small games | Optimized rendering pipeline |
| Asset Loading | Manual Image() | Built-in loader with caching |
| Camera System | Manual translations | First-class camera with follow |

## Architecture Overview

```
main.phaser.js (entry point)
  ├── config/gameConfig.js (Phaser config + constants)
  ├── services/
  │   ├── gameState.js (centralized state, replaces old `state` object)
  │   └── audioManager.js (Howler integration)
  └── scenes/phaser/
      ├── MenuScene.js
      ├── CharacterSelectionScene.js
      ├── HostScene.js (main gameplay)
      └── ... (OptionsScene, PauseScene, etc.)
```

## Key Differences from Canvas Version

### 1. Scene Management
**Old (Canvas):**
```javascript
// main.js manual state tracking
let entered;
const state = { currentState: MenuScene, sceneName: "menu" };
function gameLoop() {
  if (entered === state.currentState) {
    state.currentState.loop(ctx, canvas);
  } else {
    state.currentState.onEnter(state, canvas);
    entered = state.currentState;
  }
}
```

**New (Phaser):**
```javascript
// Scenes are managed by Phaser
this.scene.start('MenuScene');
this.scene.switch('HostScene'); // Smooth transition
```

### 2. Input Handling
**Old (Canvas):**
```javascript
// Manual key tracking
let keys = {};
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
```

**New (Phaser):**
```javascript
// Phaser input manager
this.keys = this.input.keyboard.createCursorKeys();
this.keys.w = this.input.keyboard.addKey('W');
if (this.keys.w.isDown) { /* move */ }

// Or pointer/click events
button.on('pointerdown', () => { /* action */ });
```

### 3. Animation
**Old (Canvas):**
```javascript
// Manual requestAnimationFrame scheduling
let animationFrameId = requestAnimationFrame(gameLoop);
```

**New (Phaser):**
```javascript
// Built-in tweens
this.tweens.add({
  targets: button,
  scaleX: 1.1,
  scaleY: 1.1,
  duration: 200
});
```

### 4. Rendering
**Old (Canvas):**
```javascript
ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = "red";
ctx.arc(x, y, radius, 0, Math.PI * 2);
ctx.fill();
```

**New (Phaser):**
```javascript
this.add.circle(x, y, radius, 0xff0000);
// Phaser handles rendering, depth sorting, transformations
```

### 5. State Management
**Old:**
```javascript
const state = { selectedRole: null, character: null, isPaused: false };
// State scattered across scenes
```

**New:**
```javascript
gameState.setSelectedRole('Male');
gameState.initCharacter('Male');
// Centralized, event-driven
gameState.on('roleSelected', (role) => {
  // React to changes
});
```

### 6. Audio
**Old:**
```javascript
// No audio system (would require manual Web Audio API)
```

**New:**
```javascript
audioManager.registerSFX('slash', './audio/slash.wav');
audioManager.playSFX('slash');

audioManager.registerMusic('menuMusic', './audio/menu.ogg');
audioManager.playMusic('menuMusic', fadeIn = true);
```

## Migration Path (Recommended)

### Phase 1: Setup (Now)
- [x] Install Phaser + Howler (`npm install`)
- [x] Create gameConfig.js with constants
- [x] Create gameState.js (centralized state)
- [x] Create audioManager.js (Howler wrapper)

### Phase 2: Scenes
Do these one at a time. Each scene is independent.

1. **MenuScene** (lowest risk)
   - No game logic
   - Just buttons and navigation
   - Time: ~30 min

2. **CharacterSelectionScene**
   - Similar to MenuScene
   - Calls `gameState.setSelectedRole()`
   - Time: ~20 min

3. **HostScene** (most complex)
   - Player movement, camera, enemies
   - Requires understanding Phaser physics/input
   - Time: ~1-2 hours
   - Tip: Start with simple shapes, add sprites later

4. **OptionsScene, PauseScene** (as needed)

### Phase 3: Assets & Sprites
- Load images in `preload()`, not manually
- Use sprite animations via Phaser's `anims` system
- Keep your image asset files, just load differently

### Phase 4: Polish
- Add physics collisions
- Implement enemy AI patterns
- Sound effects and music
- Particle effects

## Code Patterns

### Creating a Scene
```javascript
export class MyScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MyScene' });
  }

  preload() {
    // Load assets
    this.load.image('player', './assets/player.png');
  }

  create() {
    // Initialize scene
    const player = this.add.sprite(400, 300, 'player');
    this.physics.add.existing(player);
  }

  update(time, delta) {
    // Called every frame (~60fps)
    // Update game logic here
  }

  shutdown() {
    // Cleanup when scene stops (optional)
  }
}
```

### Managing State in Scenes
```javascript
// Getting state
const role = gameState.selectedRole;
const character = gameState.character;

// Setting state
gameState.setPaused(true);

// Listening to changes
gameState.on('characterInitialized', (character) => {
  console.log('Character created:', character);
});
```

### Input Handling
```javascript
// Keyboard
this.input.keyboard.on('keydown-W', () => { /* jump */ });

// Mouse/Touch
sprite.setInteractive();
sprite.on('pointerdown', () => { /* clicked */ });

// Both together
if (this.keys.w.isDown && this.input.activePointer.isDown) {
  // Keyboard + touch
}
```

### Audio
```javascript
// Register once (in init or first use)
audioManager.registerSFX('hit', './audio/hit.wav', 0.8);
audioManager.registerMusic('combat', './audio/combat.ogg', 0.6);

// Play anytime
audioManager.playSFX('hit');
audioManager.playMusic('combat', fadeIn = true);

// Volume control
audioManager.setMasterVolume(0.5);
audioManager.setMusicVolume(0.7);
```

## Performance Tips

1. **Use object pooling for bullets/enemies**
   ```javascript
   this.enemyPool = [];
   this.getEnemy = function() {
     if (this.enemyPool.length > 0) {
       return this.enemyPool.pop();
     }
     return new Enemy(scene);
   };
   ```

2. **Batch render updates**
   - Don't update hundreds of objects in `update()`
   - Use Phaser's built-in groups and containers

3. **Optimize physics**
   - Only enable physics on objects that need it
   - Use appropriate collision layers

4. **Cache assets properly**
   - Phaser caches images/audio automatically
   - Use `cacheKey` to avoid reloading

## Debugging

```javascript
// Access from browser console
window.gameState.character    // See character data
window.audioManager.sounds    // See loaded audio
window.game.scene.scenes      // List all scenes
window.game.scene.isActive('HostScene')  // Check if running
```

## Common Gotchas

1. **Scenes run in parallel by default**
   - Use `this.scene.sleep()` to pause without unloading
   - Use `this.scene.stop()` to fully stop
   - Use `this.scene.switch()` to replace cleanly

2. **Camera doesn't auto-follow**
   - Call `this.cameras.main.startFollow(sprite)` in `create()`

3. **Sound requires user interaction first**
   - First click must happen before audio plays (browser security)

4. **Sprites need explicit depth management**
   - Use `setDepth(100)` for UI to stay on top

## Next Steps

1. **Run the setup:**
   ```bash
   npm install
   npm run dev
   ```
   Opens http://localhost:3000 with menu

2. **Migrate one scene at a time**
   - Pick simplest first (MenuScene)
   - Test thoroughly before moving on

3. **Add assets incrementally**
   - Replace placeholder shapes with images
   - Load via `preload()` system

4. **Reference Phaser docs:**
   - [Phaser 3 Docs](https://photonstorm.github.io/phaser3-docs/)
   - [Phaser Examples](https://phaser.io/examples)

## File Reference

| File | Purpose |
|------|---------|
| `package.json` | Dependencies (Phaser, Howler, Vite) |
| `vite.config.js` | Build/dev server config |
| `config/gameConfig.js` | Phaser game config + constants |
| `services/gameState.js` | Centralized game state, replaces old `state` |
| `services/audioManager.js` | Audio management wrapper around Howler |
| `scenes/phaser/MenuScene.js` | Main menu (Phaser version) |
| `scenes/phaser/CharacterSelectionScene.js` | Character picker |
| `scenes/phaser/HostScene.js` | Main gameplay scene |
| `main.phaser.js` | Entry point (loads Phaser, registers scenes) |
| `index.phaser.html` | HTML template for Phaser version |

## Old Files (Backup)

Your original canvas-based files remain:
- `main.js` (old entry)
- `sceneTemplate.js`
- `scenes/menu.js`, `host.js`, etc.
- `index.html`

These are untouched and can be referenced during migration.

---

**Happy coding!** The architecture is designed to be familiar (scenes, modular), but with professional tooling underneath. You'll notice the game becomes much more responsive and easier to extend.
