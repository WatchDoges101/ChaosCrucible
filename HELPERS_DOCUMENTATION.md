# Chaos Crucible - Helpers & Handlers Documentation

This document provides an overview of all helper functions and handlers available in the Chaos Crucible project. These utilities have been organized to promote code reusability, maintainability, and consistency across the game.

## 📁 Project Structure

```
helpers/
├── animationHelpers.js      - Animation and tween utilities
├── arenaHelpers.js          - Arena environment creation
├── cameraHelpers.js         - Camera management (part of sceneHelpers.js)
├── colorHelpers.js          - Color manipulation utilities
├── combatHelpers.js         - Combat system utilities
├── mathHelpers.js           - Mathematical operations
├── particleHelpers.js       - Particle effects and visual flourishes
├── sceneHelpers.js          - Scene and camera management
├── storageHelpers.js        - Local storage utilities
├── stringHelpers.js         - String manipulation
├── uiHelpers.js             - UI component creation
└── validationHelpers.js     - Input validation

handlers/
├── EnemySpawnHandler.js     - Enemy spawning and AI management
└── InputHandler.js          - Input handling utilities
```

## 🎬 Animation Helpers

**File:** `helpers/animationHelpers.js`

Common animation patterns using Phaser tweens.

### Key Functions

#### `createPulseAnimation(scene, target, config)`
Creates a breathing/pulsing scale effect.
```javascript
createPulseAnimation(this, titleText, { from: 1, to: 1.1, duration: 1000 });
```

#### `createFloatingAnimation(scene, target, config)`
Creates a hovering up-and-down motion.
```javascript
createFloatingAnimation(this, sprite, { distance: 20, duration: 2000 });
```

#### `createShakeAnimation(scene, target, config)`
Creates a rapid shake/wiggle effect.
```javascript
createShakeAnimation(this, button, { distance: 5, duration: 100 });
```

#### `createColorCycleAnimation(scene, target, colors, interval)`
Cycles through an array of colors for text.
```javascript
createColorCycleAnimation(this, text, ['#ff0000', '#00ff00', '#0000ff'], 150);
```

#### `createFadeIn(scene, target, config)` / `createFadeOut(scene, target, config)`
Fade animations with optional destroy.
```javascript
createFadeOut(this, sprite, { duration: 500, destroy: true });
```

#### `createFloatingText(scene, x, y, text, config)`
Creates floating score/damage text popups.
```javascript
createFloatingText(this, enemyX, enemyY, '+50', {
  distance: 100,
  duration: 1500,
  ignoreCamera: this.uiCamera
});
```

#### `createFlashTint(scene, target, config)`
Flashes a tint color (for damage indication).
```javascript
createFlashTint(this, enemy, { tintColor: 0xff0000, duration: 100 });
```

---

## 🎨 UI Helpers

**File:** `helpers/uiHelpers.js`

Utilities for creating consistent UI elements.

### Key Functions

#### `createButton(scene, x, y, width, height, config)`
Creates an interactive button with hover effects.
```javascript
const btn = createButton(this, 960, 540, 300, 60, {
  label: 'Start Game',
  color: 0x00ff00,
  onClick: () => this.scene.start('GameScene'),
  radius: 15
});
```

#### `createBackButton(scene, x, y, onClick, config)`
Creates a standardized back button.
```javascript
createBackButton(this, 90, 50, () => this.scene.start('MenuScene'));
```

#### `createTextInput(scene, x, y, width, height, config)`
Creates an interactive text input field.
```javascript
const input = createTextInput(this, 960, 200, 400, 55, {
  placeholder: 'Enter name...',
  maxLength: 20,
  onChange: (text) => console.log(text)
});
```

#### `createHealthBar(scene, x, y, width, height, config)`
Creates a health bar with text.
```javascript
const healthBar = createHealthBar(this, 40, 1030, 300, 30, {
  currentHealth: 75,
  maxHealth: 100,
  foregroundColor: 0xff0000
});
// Later: healthBar.update(50);
```

#### `createPanel(scene, x, y, width, height, config)`
Creates a bordered panel/container.
```javascript
const panel = createPanel(this, 960, 540, 600, 400, {
  backgroundColor: 0x000000,
  borderColor: 0xffffff
});
```

#### `createTitle(scene, x, y, text, config)`
Creates a large title text with effects.
```javascript
createTitle(this, 960, 120, 'CHAOS CRUCIBLE', {
  fontSize: '96px',
  fill: '#ffffff'
});
```

---

## ✨ Particle Helpers

**File:** `helpers/particleHelpers.js`

Visual effects using Phaser's particle systems and graphics.

### Key Functions

#### `createFlameParticles(scene, x, y, config)`
Creates flame particle emitters.
```javascript
createFlameParticles(this, 100, 500, {
  colors: [0xff3300, 0xff6600, 0xff8800],
  quantity: 3,
  frequency: 60
});
```

#### `createEmberParticles(scene, x, y, width, config)`
Creates floating ember/spark particles.
```javascript
createEmberParticles(this, 0, 1080, 1920);
```

#### `createTorchEffect(scene, x, y, config)`
Creates animated torch with flame.
```javascript
const torch = createTorchEffect(this, 200, 200, {
  arenaObjects: this.arenaObjects
});
```

#### `createLavaPool(scene, x, y, width, height, config)`
Creates animated lava pool with collision data.
```javascript
const lava = createLavaPool(this, 500, 500, 200, 150, {
  arenaObjects: this.arenaObjects
});
// Access collision: lava.collisionData
```

#### `createExplosionParticles(scene, x, y, config)`
Creates an explosion effect.
```javascript
createExplosionParticles(this, 300, 300, {
  radius: 100,
  duration: 500,
  quantity: 40
});
```

#### `createSlashEffect(scene, x, y, aim, range, config)`
Creates melee slash arc visual.
```javascript
createSlashEffect(this, playerX, playerY, { x: 1, y: 0 }, 70);
```

#### `createShockwave(scene, x, y, radius, config)`
Creates expanding ring effect.
```javascript
createShockwave(this, playerX, playerY, 120, {
  color: 0xffaa00,
  duration: 250
});
```

#### `createFloatingParticles(scene, spawnArea, count, config)`
Creates ambient atmospheric particles.
```javascript
createFloatingParticles(this, {
  minX: 200, maxX: 4800, minY: 200, maxY: 4800
}, 100);
```

---

## ⚔️ Combat Helpers

**File:** `helpers/combatHelpers.js`

Combat mechanics including damage, projectiles, and collision.

### Constants

```javascript
import { ROLE_CONFIGS } from './helpers/combatHelpers.js';
// Access role stats: ROLE_CONFIGS.archer.basicDamage
```

### Key Functions

#### `getRoleConfig(role)`
Get combat configuration for a character role.
```javascript
const config = getRoleConfig('archer');
// { basicCooldown: 400, projectileSpeed: 10, ... }
```

#### `getAimDirection(source, target)`
Calculate normalized direction vector.
```javascript
const aim = getAimDirection(
  { x: playerX, y: playerY },
  { x: mouseX, y: mouseY }
);
```

#### `createProjectile(scene, config)`
Create a projectile (bullet or arrow).
```javascript
const projectile = createProjectile(this, {
  x: playerX,
  y: playerY,
  vx: aim.x * 10,
  vy: aim.y * 10,
  damage: 15,
  type: 'arrow',
  radius: 3,
  range: 500,
  ignoreCamera: this.uiCamera
});
this.projectiles.push(projectile);
```

#### `updateProjectiles(scene, projectiles, enemies, bounds, deltaScale, damageCallback)`
Update all projectiles (movement and collision).
```javascript
updateProjectiles(
  this,
  this.projectiles,
  this.enemies,
  { minX: 200, maxX: 4800, minY: 200, maxY: 4800 },
  deltaScale,
  (enemy, damage, knockback) => this.damageEnemy(enemy, damage, knockback)
);
```

#### `damageEnemy(scene, enemyData, damage, knockback, onKillCallback)`
Apply damage to an enemy with visual effects.
```javascript
const killed = damageEnemy(this, enemyData, 25, { x: 0.5, y: 0.5 }, (enemy) => {
  // Enemy killed callback
  gameState.addScore(enemy.points);
});
```

#### `damagePlayer(scene, character, player, damage, damageState, currentTime, onDeathCallback)`
Apply damage to player with cooldown.
```javascript
damagePlayer(
  this,
  gameState.character,
  this.player,
  10,
  this.playerDamageState,
  this.time.now,
  () => console.log('Player died!')
);
```

#### `isInMeleeCone(attacker, target, aim, range, coneAngle)`
Check if target is within melee attack cone.
```javascript
if (isInMeleeCone(player, enemy, aimDirection, 70, 60)) {
  hitEnemy();
}
```

#### `getEnemiesInRange(position, enemies, range)`
Get all enemies within a radius.
```javascript
const nearbyEnemies = getEnemiesInRange({ x: playerX, y: playerY }, enemies, 200);
```

---

## 🏟️ Arena Helpers

**File:** `helpers/arenaHelpers.js`

Create game environments and arenas.

### Key Functions

#### `createCompleteArena(scene, config)`
Creates a full arena with floor, border, torches, lava, and obstacles.
```javascript
const arena = createCompleteArena(this, {
  width: 5000,
  height: 5000,
  padding: 200,
  lavaCount: 8,
  obstacleCount: 20
});
// Access: arena.arenaObjects, arena.lavaPools, arena.obstacles
```

#### `createArenaFloor(scene, config)`
Creates textured stone floor.
```javascript
const floorObjects = createArenaFloor(this, {
  width: 5000,
  height: 5000,
  padding: 200
});
```

#### `createArenaBorder(scene, config)`
Creates border with spikes.
```javascript
const border = createArenaBorder(this, {
  width: 5000,
  height: 5000,
  padding: 200
});
```

#### `createGridBackground(scene, width, height, config)`
Creates a simple grid background.
```javascript
const grid = createGridBackground(this, 2000, 2000, {
  gridSize: 100,
  color: 0x333333
});
```

---

## 📹 Scene & Camera Helpers

**File:** `helpers/sceneHelpers.js`

Scene transitions and camera management.

### Camera Functions

#### `setupFollowCamera(camera, target, config)`
Configure camera to follow target.
```javascript
setupFollowCamera(this.cameras.main, player, {
  zoom: 2.5,
  lerpX: 0.1,
  lerpY: 0.1,
  bounds: { x: 0, y: 0, width: 5000, height: 5000 }
});
```

#### `createUICamera(scene, width, height, ignoreObjects)`
Create fixed UI overlay camera.
```javascript
const uiCamera = createUICamera(this, 1920, 1080, [
  player,
  ...this.enemies.map(e => e.enemy)
]);
```

#### `shakeCamera(camera, config)` / `flashCamera(camera, config)`
Camera effects.
```javascript
shakeCamera(this.cameras.main, { duration: 200, intensity: 0.01 });
flashCamera(this.cameras.main, { red: 255, green: 0, blue: 0 });
```

#### `fadeCamera(camera, config)`
Fade camera (useful for transitions).
```javascript
fadeCamera(this.cameras.main, {
  duration: 1000,
  callback: () => this.scene.start('NextScene')
});
```

### Scene Functions

#### `transitionToScene(scene, targetSceneKey, config)`
Transition with fade effect.
```javascript
transitionToScene(this, 'GameScene', {
  duration: 1500,
  data: { level: 2 }
});
```

#### `startScene(scene, sceneKey, data)` / `stopScene(scene, sceneKey)`
Basic scene control.
```javascript
startScene(this, 'GameScene', { difficulty: 'hard' });
stopScene(this, 'PauseMenu');
```

#### `resetSceneTiming(scene)`
Fix timing issues after pause/resume.
```javascript
resetSceneTiming(this);
```

---

## 👾 Enemy Spawn Handler

**File:** `handlers/EnemySpawnHandler.js`

Centralized enemy management with AI.

### Usage

```javascript
import { createEnemySpawnHandler } from '../handlers/EnemySpawnHandler.js';

// In create():
this.enemyHandler = createEnemySpawnHandler(this, {
  bounds: { minX: 200, maxX: 4800, minY: 200, maxY: 4800 },
  maxEnemies: 20,
  ignoreCamera: this.uiCamera
});

// Spawn enemies
this.enemyHandler.spawnMultiple(5, 'slime');
this.enemyHandler.spawnRandom({ type: 'devil' });

// In update():
this.enemyHandler.update({ x: playerX, y: playerY }, deltaScale);

// Get enemies
const enemies = this.enemyHandler.getEnemies();
const nearest = this.enemyHandler.getNearestEnemy({ x: playerX, y: playerY });

// Remove enemy
this.enemyHandler.removeEnemy(deadEnemy);
```

### Methods

- `spawnRandom(config)` - Spawn random enemy
- `spawn(x, y, type)` - Spawn specific enemy
- `spawnMultiple(count, type)` - Spawn multiple enemies
- `update(player, deltaScale)` - Update AI and movement
- `getEnemies()` - Get all enemies
- `getEnemyCount()` - Get enemy count
- `getNearestEnemy(position)` - Find nearest enemy
- `getEnemiesInRange(position, range)` - Find enemies in range
- `removeEnemy(enemyData)` - Remove and cleanup enemy
- `clearAll()` - Remove all enemies

---

## 📐 Math Helpers

**File:** `helpers/mathHelpers.js`

Mathematical utilities.

### Key Functions

```javascript
import { getDistance, getAngle, clamp, randomInt, lerp } from '../helpers/mathHelpers.js';

const distance = getDistance(x1, y1, x2, y2);
const angle = getAngle(x1, y1, x2, y2);
const clamped = clamp(value, 0, 100);
const random = randomInt(1, 10);
const interpolated = lerp(0, 100, 0.5);
```

---

## 🎨 Color Helpers

**File:** `helpers/colorHelpers.js`

Color conversion and manipulation.

### Key Functions

```javascript
import { hexToRgb, rgbToHex, adjustBrightness, randomizeColor } from '../helpers/colorHelpers.js';

const rgb = hexToRgb('#FF0000');  // { r: 255, g: 0, b: 0 }
const hex = rgbToHex(255, 0, 0);   // '#FF0000'
const brighter = adjustBrightness(0xff0000, 20);  // 20% brighter
const varied = randomizeColor(0xff0000, 30);      // Random variation
```

---

## 💡 Usage Examples

### Creating a Game Scene

```javascript
import { setupFollowCamera, createUICamera } from '../helpers/sceneHelpers.js';
import { createCompleteArena } from '../helpers/arenaHelpers.js';
import { createEnemySpawnHandler } from '../handlers/EnemySpawnHandler.js';
import { createHealthBar } from '../helpers/uiHelpers.js';

class GameScene extends Phaser.Scene {
  create() {
    // Create arena
    const arena = createCompleteArena(this, {
      width: 5000,
      height: 5000,
      padding: 200
    });

    // Setup cameras
    setupFollowCamera(this.cameras.main, this.player, {
      zoom: 2.5,
      bounds: { x: 0, y: 0, width: 5000, height: 5000 }
    });

    this.uiCamera = createUICamera(this, 1920, 1080, arena.arenaObjects);

    // Setup enemy handler
    this.enemyHandler = createEnemySpawnHandler(this, {
      bounds: { minX: 200, maxX: 4800, minY: 200, maxY: 4800 },
      maxEnemies: 20,
      ignoreCamera: this.uiCamera
    });

    // Create UI
    this.healthBar = createHealthBar(this, 40, 1030, 300, 30, {
      currentHealth: 100,
      maxHealth: 100
    });
  }

  update(time, delta) {
    const deltaScale = delta / 16.67;
    
    // Update enemies
    this.enemyHandler.update(
      { x: this.player.x, y: this.player.y },
      deltaScale
    );
  }
}
```

### Creating a Menu

```javascript
import { createButton, createTitle } from '../helpers/uiHelpers.js';
import { createFlameParticles } from '../helpers/particleHelpers.js';
import { createPulseAnimation } from '../helpers/animationHelpers.js';

class MenuScene extends Phaser.Scene {
  create() {
    // Background
    const bg = this.add.rectangle(960, 540, 1920, 1080, 0x1a0000);

    // Flame effects
    createFlameParticles(this, 960, 1080);

    // Title
    const title = createTitle(this, 960, 200, 'CHAOS CRUCIBLE');
    createPulseAnimation(this, title);

    // Buttons
    createButton(this, 960, 500, 300, 60, {
      label: 'Start Game',
      color: 0xff3300,
      onClick: () => this.scene.start('CharacterSelectionScene')
    });

    createButton(this, 960, 600, 300, 60, {
      label: 'Options',
      color: 0xff6600,
      onClick: () => this.scene.start('OptionsScene')
   });
  }
}
```

---

## 📝 Best Practices

1. **Import only what you need** to keep bundle size small
2. **Use destructuring** for cleaner imports:
   ```javascript
   import { createButton, createHealthBar } from '../helpers/uiHelpers.js';
   ```
3. **Pass ignoreCamera** when creating world objects for proper camera layering
4. **Store references** to objects you need to update or destroy later
5. **Use deltaScale** for frame-independent movement
6. **Clean up** objects when scenes stop (helpers often provide destroy methods)

---

## 🔄 Migration Guide

When refactoring existing code to use these helpers:

1. Identify repeated patterns (button creation, animations, etc.)
2. Replace inline code with helper function calls
3. Move configuration to objects for clarity
4. Test thoroughly to ensure behavior is identical

**Before:**
```javascript
const button = this.add.rectangle(x, y, 200, 50, 0xff0000)
  .setInteractive({ useHandCursor: true });
button.on('pointerover', () => {
  this.tweens.add({ targets: button, scaleX: 1.1, scaleY: 1.1, duration: 200 });
});
// ... more event handlers
```

**After:**
```javascript
const btn = createButton(this, x, y, 200, 50, {
  label: 'Click Me',
  color: 0xff0000,
  onClick: () => console.log('Clicked!')
});
```

---

## 🤝 Contributing

When adding new helpers:

1. **Follow the naming convention**: `create___` for factory functions, `get___` for accessors
2. **Document with JSDoc**: Include @param, @returns, and @example
3. **Keep functions focused**: One responsibility per function
4. **Provide sensible defaults**: Use ES6 default parameters
5. **Return useful values**: Objects, references, or meaningful data
6. **Test with multiple scenes**: Ensure helpers work across different contexts

---

## 📚 API Reference

For complete API documentation with all parameters and return values, see the inline JSDoc comments in each helper file.

Happy coding! 🎮
