/**
 * Utility helpers for Phaser scenes
 * Reusable functions to reduce boilerplate
 */

/**
 * Create a styled button with automatic hover effects
 */
export function createButton(scene, x, y, width, height, label, config = {}) {
  const {
    color = 0x333333,
    hoverColor = 0x555555,
    textColor = '#ffffff',
    fontSize = '20px',
    onClick = () => {}
  } = config;

  const button = scene.add.rectangle(x, y, width, height, color, 0.8)
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

  const text = scene.add.text(x, y, label, {
    font: `${fontSize} Arial`,
    fill: textColor
  }).setOrigin(0.5);

  button.on('pointerover', () => {
    button.setFillStyle(hoverColor, 0.9);
    scene.tweens.add({
      targets: button,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 150
    });
  });

  button.on('pointerout', () => {
    button.setFillStyle(color, 0.8);
    scene.tweens.add({
      targets: button,
      scaleX: 1,
      scaleY: 1,
      duration: 150
    });
  });

  button.on('pointerdown', onClick);

  return { button, text };
}

/**
 * Create text with outline for better readability
 */
export function createOutlineText(scene, x, y, text, config = {}) {
  const {
    fontSize = '32px',
    fillColor = '#ffffff',
    outlineColor = '#000000',
    outlineWidth = 3
  } = config;

  return scene.add.text(x, y, text, {
    font: `${fontSize} Arial`,
    fill: fillColor,
    stroke: outlineColor,
    strokeThickness: outlineWidth
  }).setOrigin(0.5);
}

/**
 * Create a sprite with physics and optional collision
 */
export function createGameObject(scene, x, y, texture, physics = false) {
  const sprite = scene.add.sprite(x, y, texture);
  
  if (physics) {
    scene.physics.add.existing(sprite);
  }

  return sprite;
}

/**
 * Fade-in effect
 */
export function fadeIn(scene, gameObject, duration = 500) {
  gameObject.setAlpha(0);
  return scene.tweens.add({
    targets: gameObject,
    alpha: 1,
    duration
  });
}

/**
 * Fade-out effect
 */
export function fadeOut(scene, gameObject, duration = 500) {
  gameObject.setAlpha(1);
  return scene.tweens.add({
    targets: gameObject,
    alpha: 0,
    duration
  });
}

/**
 * Create a simple timer for spawning/events
 */
export class Timer {
  constructor(scene, interval, callback, repeat = Infinity) {
    this.elapsed = 0;
    this.interval = interval;
    this.callback = callback;
    this.repeat = repeat;
    this.count = 0;
  }

  update(delta) {
    this.elapsed += delta;
    if (this.elapsed >= this.interval) {
      this.callback();
      this.count++;
      this.elapsed = 0;

      if (this.count >= this.repeat) {
        return false; // Timer complete
      }
    }
    return true; // Timer still running
  }

  reset() {
    this.elapsed = 0;
    this.count = 0;
  }
}

/**
 * Distance between two points
 */
export function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Get angle (radians) between two points
 */
export function angle(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Clamp value between min and max
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Random integer between min and max (inclusive)
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Random float between min and max
 */
export function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}
