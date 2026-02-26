# Chaos Crucible: Best Practices for Phaser Development

## Folder Structure Best Practices

```
ChaosCrucible/
├── config/
│   └── gameConfig.js            # Phaser config, game constants
├── scenes/
│   └── phaser/
│       ├── MenuScene.js
│       ├── CharacterSelectionScene.js
│       ├── HostScene.js
│       ├── OptionsScene.js
│       └── PauseScene.js
├── services/
│   ├── gameState.js             # Centralized state manager
│   └── audioManager.js          # Audio wrapper (Howler)
├── utils/
│   └── helpers.js               # Reusable utility functions
├── assets/
│   ├── images/
│   ├── audio/
│   │   ├── sfx/
│   │   └── music/
│   └── sprites/
├── main.phaser.js               # Entry point
├── index.phaser.html            # HTML template
├── package.json
├── vite.config.js
└── PHASER_MIGRATION_GUIDE.md
```

## Code Organization Principles

### 1. Separation of Concerns
- **Scenes** = UI/Presentation + Local logic
- **GameState** = Persistent data (character, settings, progress)
- **Services** = Audio, networking, analytics (inject into scenes)
- **Utils** = Pure functions (distance, clamp, random)

### 2. Scene Responsibilities

```javascript
export class HostScene extends Phaser.Scene {
  // ✅ DO: Manage visual state and input
  create() {
    this.player = this.add.sprite(...);
    this.enemies = [];
  }

  // ✅ DO: Read from gameState
  update() {
    const character = gameState.character;
    this.player.x = character.x;
  }

  // ❌ DON'T: Store data that should be in gameState
  // DON'T: this.selectedRole = 'Male';
  // Instead: gameState.setSelectedRole('Male');
}
```

### 3. GameState Usage

```javascript
// ✅ DO: Emit events for state changes
gameState.on('characterInitialized', (character) => {
  this.scene.start('HostScene');
});

// ❌ DON'T: Directly mutate state
// DON'T: gameState.character.hp = 0;
// Instead: gameState.damageCharacter(10);
```

### 4. Audio Best Practices

```javascript
// ✅ DO: Register audio once, play multiple times
export class HostScene extends Phaser.Scene {
  create() {
    // Register SFX (once per session)
    audioManager.registerSFX('enemyHit', './audio/hit.wav', 0.7);
  }

  onEnemyHit() {
    // Play (cheap, already loaded)
    audioManager.playSFX('enemyHit');
  }
}

// ❌ DON'T: Recreate audio every frame
// ❌ DON'T: audioManager.registerSFX(...) in update()
```

## Performance Optimization

### Object Pooling for High-Frequency Objects

```javascript
export class HostScene extends Phaser.Scene {
  create() {
    // Pre-allocate bullet pool
    this.bulletPool = [];
    for (let i = 0; i < 50; i++) {
      const bullet = this.physics.add.sprite(0, 0, 'bullet');
      bullet.setActive(false);
      bullet.setVisible(false);
      this.bulletPool.push(bullet);
    }
  }

  fireBullet(x, y, vx, vy) {
    let bullet = this.bulletPool.pop();
    if (!bullet) {
      bullet = this.physics.add.sprite(x, y, 'bullet');
    }
    
    bullet.setPosition(x, y);
    bullet.setVelocity(vx, vy);
    bullet.setActive(true);
    bullet.setVisible(true);
  }

  returnBullet(bullet) {
    bullet.setActive(false);
    bullet.setVisible(false);
    this.bulletPool.push(bullet);
  }
}
```

### Camera Culling

```javascript
create() {
  // Only draw what's on camera
  this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  this.cameras.main.startFollow(this.player);
  
  // Mark objects as cullable
  this.add.sprite(...).setCullable(true);
}
```

### Lazy Load Assets

```javascript
// Bad: Load all assets at startup
preload() {
  for (let i = 1; i <= 1000; i++) {
    this.load.image(`enemy${i}`, `./assets/enemy${i}.png`);
  }
}

// Good: Load on demand
preload() {
  // Load only essentials
  this.load.image('player', './assets/player.png');
  this.load.image('button', './assets/button.png');
}

create() {
  // Load more later as needed
  this.load.on('complete', () => {
    this.scene.start('HostScene');
  });
  this.load.start();
}
```

## Common Patterns

### Pause/Resume Cleanly

```javascript
export class HostScene extends Phaser.Scene {
  togglePause() {
    if (this.isPaused) {
      this.physics.resume();
      this.anims.resumeAll();
      this.isPaused = false;
    } else {
      this.physics.pause();
      this.anims.pauseAll();
      this.isPaused = true;
    }
  }
}
```

### Coordinate Between Scenes

```javascript
// In scene1
this.scene.launch('scene2', { data: 'hello' });

// In scene2 init
init(data) {
  console.log(data.data); // 'hello'
}
```

### Handle Window Resize

```javascript
create() {
  this.scale.on('resize', this.onResize, this);
}

onResize(gameSize) {
  // Adjust UI layout for new size
  this.uiLayer.x = gameSize.width / 2;
}

shutdown() {
  this.scale.off('resize', this.onResize, this);
}
```

## Debugging Tips

### Enable Debug Mode

```javascript
// In gameConfig.js
physics: {
  arcade: {
    debug: true  // Show collision boxes, velocities
  }
}

// In scenes
this.physics.world.showDebug = true;
```

### Log State Changes

```javascript
gameState.on('characterInitialized', (char) => {
  console.log('[GameState] Character:', char);
});

gameState.on('roleSelected', (role) => {
  console.log('[GameState] Selected:', role);
});
```

### Check Performance

```javascript
// In browser console
game.loop.actualFps  // Current FPS
game.renderer.debug  // Rendering stats
game.physics.world.bodies.length  // Active bodies
```

## Common Mistakes

1. **Storing state in scenes**
   - ❌ `this.health = 100;` in HostScene
   - ✅ `gameState.player.health = 100;`

2. **Not cleaning up listeners**
   - ❌ `this.input.keyboard.on(...)`
   - ✅ Store listener, call `off()` in `shutdown()`

3. **Loading same asset multiple times**
   - ❌ `this.load.image('bg', ...)` in every scene
   - ✅ Load core assets once in first scene

4. **Creating new objects every frame**
   - ❌ `new Bullet(...)` in `update()`
   - ✅ Use object pool or recycled sprites

5. **Forgetting to unregister audio**
   - ❌ `audioManager.registerSFX(same_key, ...)` multiple times
   - ✅ Check if already registered first

## Testing Strategy

```javascript
// In browser console, test states
gameState.setSelectedRole('archer');
gameState.initCharacter('archer');
gameState.character  // Verify

// Test audio
audioManager.registerSFX('test', './audio/test.wav');
audioManager.playSFX('test');

// Switch scenes
game.scene.start('HostScene');
game.scene.scenes  // Verify active
```

## Scaling to Larger Project

As Chaos Crucible grows:

1. **Extract entity logic**
   ```javascript
   // enemies/slime.js
   export class SlimeEnemy extends Phaser.Physics.Arcade.Sprite {
     constructor(scene, x, y) {
       super(scene, x, y, 'slime');
       scene.physics.add.existing(this);
     }
     
     update() { /* AI logic */ }
   }
   ```

2. **Create event dispatcher**
   ```javascript
   // services/eventBus.js
   export const eventBus = new Phaser.Events.EventEmitter();
   // Use for global events
   ```

3. **Add save/load system**
   ```javascript
   // services/saveManager.js
   export const saveManager = {
     save(slot) { /* serialize state */ },
     load(slot) { /* restore state */ }
   };
   ```

4. **Separate animation configs**
   ```javascript
   // config/animations.js
   export const ANIMATIONS = {
     playerWalk: { key: 'walk', frames: [...] },
     enemyAttack: { key: 'attack', frames: [...] }
   };
   ```

---

**Remember:** Start simple, refactor as you grow. The architecture supports both small prototypes and larger games.
