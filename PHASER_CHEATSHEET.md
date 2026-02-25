# Phaser Quick Reference for Chaos Crucible

## Scene Lifecycle

```javascript
export class MyScene extends Phaser.Scene {
  // 1. Constructor - Set scene key
  constructor() { super({ key: 'MyScene' }); }

  // 2. Init - Receives data from previous scene
  init(data) { console.log('Init with:', data); }

  // 3. Preload - Load assets (images, audio, etc.)
  preload() { this.load.image('bg', './bg.png'); }

  // 4. Create - Initialize scene objects
  create() { this.add.sprite(400, 300, 'bg'); }

  // 5. Update - Called every frame (~60fps by default)
  update(time, delta) { /* Update game logic */ }

  // 6. Shutdown - Called when scene stops (optional)
  shutdown() { /* Cleanup */ }

  // 7. Sleep - Called when scene sleeps (optional)
  sleep() { /* Pause without unload */ }

  // 8. Wake - Called when scene wakes (optional)
  wake() { /* Resume */ }
}
```

## Common Tasks

### Add Game Objects

```javascript
// Sprites
const sprite = this.add.sprite(x, y, 'textureKey');

// Text
const text = this.add.text(x, y, 'Hello', { font: '32px Arial', fill: '#fff' });

// Rectangle / Shapes
const rect = this.add.rectangle(x, y, width, height, 0xff0000);
const circle = this.add.circle(x, y, radius, 0xff0000);
const line = this.add.line(x1, y1, x2, y2, 0xff0000);

// Graphics (custom drawing)
const graphics = this.add.graphics();
graphics.fillStyle(0xff0000);
graphics.fillRect(x, y, w, h);
graphics.strokePath();

// Container (group objects)
const container = this.add.container(0, 0, [sprite1, sprite2]);
```

### Input Handling

```javascript
// Keyboard
this.input.keyboard.on('keydown-W', () => { /* action */ });
this.keys = this.input.keyboard.createCursorKeys();
if (this.keys.left.isDown) { /* handle */ }

// Mouse/Touch
sprite.setInteractive();
sprite.on('pointerdown', () => { /* clicked */ });
sprite.on('pointerover', () => { /* hover */ });

// Direct polling
if (this.input.keyboard.isDown('W')) { /* continuous */ }
if (this.input.activePointer.isDown) { /* touch/click */ }
```

### Physics

```javascript
// Enable arcade physics for object
this.physics.add.existing(sprite);
sprite.setVelocity(vx, vy);
sprite.setBounce(1, 1);
sprite.setMass(2);

// Collision
this.physics.add.collider(sprite1, sprite2, () => {
  console.log('Collision!');
});

// Overlap (no bounce/response)
this.physics.add.overlap(player, enemies, () => {
  console.log('Overlapping!');
});
```

### Tweens (Animation)

```javascript
// Simple tween
this.tweens.add({
  targets: sprite,
  x: 500,
  y: 300,
  duration: 1000,
  ease: 'Power2'
});

// Chain tweens
this.tweens.chain({
  targets: sprite,
  tweens: [
    { x: 600, duration: 500 },
    { y: 400, duration: 500 },
    { x: 0, y: 0, duration: 1000 }
  ]
});

// With callbacks
this.tweens.add({
  targets: sprite,
  alpha: 0,
  duration: 500,
  onComplete: () => { console.log('Done'); }
});
```

### Camera

```javascript
// Follow sprite
this.cameras.main.startFollow(sprite);

// Set bounds
this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

// Zoom
this.cameras.main.setZoom(2);

// Pan
this.cameras.main.pan(x, y, duration);

// Fade
this.cameras.main.fadeOut(duration);
this.cameras.main.fadeIn(duration);
```

### Animations

```javascript
// Create animation (once)
this.anims.create({
  key: 'walk',
  frames: this.anisFrames('player', { start: 0, end: 7 }),
  frameRate: 10,
  repeat: -1  // infinite
});

// Play on sprite
sprite.play('walk');
sprite.stop();
sprite.resume();
```

### Scene Management

```javascript
// Start new scene (stops current)
this.scene.start('MenuScene');

// Switch (same as start)
this.scene.switch('HostScene');

// Launch alongside
this.scene.launch('PauseScene');

// Sleep/Wake (pause without unload)
this.scene.sleep('HostScene');
this.scene.wake('HostScene');

// Stop scene
this.scene.stop('HostScene');

// Get scene
const scene = this.scene.get('MenuScene');
const isActive = this.scene.isActive('MenuScene');
```

### Events

```javascript
// Game events
this.events.on('create', () => { /* scene created */ });
this.events.on('update', () => { /* scene updated */ });
this.events.on('shutdown', () => { /* scene stopped */ });

// Custom events
this.events.emit('playerHit', damage);
this.events.on('playerHit', (damage) => { /* handle */ });

// One-time listener
this.events.once('custom', () => { /* fires once */ });

// Remove listener
const callback = () => { };
this.events.on('test', callback);
this.events.off('test', callback);
```

### Useful Methods

```javascript
// Object properties
sprite.x, sprite.y           // Position
sprite.width, sprite.height  // Dimensions
sprite.alpha                 // Opacity (0-1)
sprite.rotation              // Angle (radians)
sprite.scale, sprite.scaleX  // Scale
sprite.tint                  // Color tint

// Methods
sprite.setOrigin(0.5)        // 0=top-left, 0.5=center
sprite.setDepth(10)          // Draw order (higher = on top)
sprite.setActive(false)      // Disable from physics/input
sprite.setVisible(false)     // Hide without removing
sprite.destroy()             // Remove from scene
sprite.setData('key', val)   // Attach custom data
sprite.getData('key')        // Retrieve custom data

// Math
Phaser.Math.Distance.Between(x1, y1, x2, y2)
Phaser.Math.Angle.Between(x1, y1, x2, y2)
Phaser.Math.Clamp(value, min, max)
```

### Time/Timers

```javascript
// Delayed callback
this.time.delayedCall(1000, () => {
  console.log('After 1 second');
});

// Timer loop
const timer = this.time.addTimer({
  delay: 1000,
  callback: () => { /* fires every 1 sec */ },
  repeat: 5  // 5 times total
});

// Get elapsed time since scene start
console.log(this.time.now);  // Total milliseconds
```

## Debugging

```javascript
// Enable physics debug overlay
this.physics.world.showDebug = true;

// Log in console
console.log('Scene:', this.scene.key);
console.log('Active scenes:', this.scene.manager.scenes);

// Check FPS
game.loop.actualFps

// Draw debug graphics
const graphics = this.make.graphics({ x: 0, y: 0, add: false });
this.physics.world.drawDebug(graphics);
```

## Common Patterns

### Handle Sprite Destroy Safely

```javascript
if (sprite && sprite.active) {
  sprite.destroy();
}
```

### Conditional Input

```javascript
if (!this.isPaused && this.keys.up.isDown) {
  // Only move if not paused
  sprite.y -= 5;
}
```

### Safe Scene Switch

```javascript
this.scene.transition({
  target: 'NextScene',
  duration: 1000,
  ease: 'Power2'
});
```

### Prevent Sprite Going Off-Screen

```javascript
sprite.x = Phaser.Math.Clamp(sprite.x, 0, 1920);
sprite.y = Phaser.Math.Clamp(sprite.y, 0, 1080);
```

## Color Codes (Hex)

```javascript
0xff0000   // Red
0x00ff00   // Green
0x0000ff   // Blue
0xffffff   // White
0x000000   // Black
0xffff00   // Yellow
0x00ffff   // Cyan
0xff00ff   // Magenta
```

## Easing Functions

```
'Linear'
'Quad'
'Cubic'
'Quart' 
'Quint'
'Sine'
'Expo'
'Circ'
'Back'
'Bounce'
'Elastic'

// Variants: In, Out, InOut
'Power2.easeOut'
'Sine.easeInOut'
```

---

**Keep this handy while coding!** For more: https://photonstorm.github.io/phaser3-docs/
