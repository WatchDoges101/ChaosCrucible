/**
 * Shared powerup sprite helpers
 * Ensures powerup visuals are identical between gameplay and wiki scenes.
 */

export const POWERUP_WIKI_DATA = {
  blood_orb: {
    name: 'Blood Orb',
    color: 0xff4d4d,
    effect: 'Instantly restores 30 HP (up to max health).',
    duration: 'Instant'
  },
  fury_totem: {
    name: 'Fury Totem',
    color: 0xffaa33,
    effect: 'Increases all outgoing damage by 35%.',
    duration: '10s'
  },
  time_shard: {
    name: 'Time Shard',
    color: 0x66ccff,
    effect: 'Reduces attack cooldowns by 30%.',
    duration: '8s'
  },
  iron_aegis: {
    name: 'Iron Aegis',
    color: 0x99ccff,
    effect: 'Adds 100 shield that absorbs incoming damage first.',
    duration: 'Until depleted'
  }
};

/**
 * Create a consistent Phaser powerup sprite.
 *
 * @param {Phaser.Scene} scene
 * @param {object} options
 * @param {string} options.type
 * @param {number} options.x
 * @param {number} options.y
 * @param {number} [options.tint]
 * @param {boolean} [options.float=true]
 * @param {number} [options.depth=0]
 * @param {number} [options.scale=1]
 * @param {boolean} [options.ignoreUiCamera=false]
 * @returns {Phaser.GameObjects.Container}
 */
export function createPowerupSprite(scene, {
  type,
  x,
  y,
  tint,
  float = true,
  depth = 0,
  scale = 1,
  ignoreUiCamera = false
}) {
  const container = scene.add.container(x, y);
  const resolvedTint = tint || POWERUP_WIKI_DATA[type]?.color || 0xffffff;
  let useFloat = float;

  if (type === 'blood_orb') {
    const glow = scene.add.circle(0, 0, 18, resolvedTint, 0.25);
    const core = scene.add.circle(0, 0, 10, resolvedTint, 0.9);
    const highlight = scene.add.circle(-3, -4, 3, 0xffffff, 0.9);
    const ring = scene.add.circle(0, 0, 13, 0xff2222, 0.6).setStrokeStyle(2, 0xff7777, 0.9);
    container.add([glow, ring, core, highlight]);

    scene.tweens.add({
      targets: glow,
      scale: { from: 0.9, to: 1.15 },
      alpha: { from: 0.2, to: 0.4 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    scene.tweens.add({
      targets: ring,
      angle: { from: 0, to: 360 },
      duration: 2600,
      repeat: -1
    });
  } else if (type === 'fury_totem') {
    const base = scene.add.circle(0, 0, 16, 0x4a1a00, 0.8);
    const flame = scene.add.triangle(0, -4, 0, 18, 14, -10, -14, -10, resolvedTint, 0.9);
    const ember = scene.add.circle(0, -10, 5, 0xffdd55, 0.9);
    container.add([base, flame, ember]);

    scene.tweens.add({
      targets: [flame, ember],
      scaleY: { from: 0.9, to: 1.15 },
      alpha: { from: 0.7, to: 1 },
      duration: 320,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    useFloat = float;
  } else if (type === 'time_shard') {
    const shard = scene.add.polygon(0, 0, [0, -16, 12, 0, 0, 16, -12, 0], resolvedTint, 0.95);
    const outline = scene.add.polygon(0, 0, [0, -18, 14, 0, 0, 18, -14, 0], 0x224455, 0.6);
    const spark = scene.add.circle(0, -12, 3, 0xffffff, 0.9);
    container.add([outline, shard, spark]);

    scene.tweens.add({
      targets: container,
      angle: { from: -8, to: 8 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    scene.tweens.add({
      targets: spark,
      y: -16,
      alpha: { from: 0.4, to: 1 },
      duration: 600,
      yoyo: true,
      repeat: -1
    });
  } else if (type === 'iron_aegis') {
    const ring = scene.add.circle(0, 0, 18, 0x1b2d3d, 0.7).setStrokeStyle(3, resolvedTint, 0.9);
    const sigil = scene.add.star(0, 0, 6, 4, 9, resolvedTint, 0.9);
    const core = scene.add.circle(0, 0, 5, 0xffffff, 0.7);
    container.add([ring, sigil, core]);

    scene.tweens.add({
      targets: ring,
      scale: { from: 0.9, to: 1.1 },
      alpha: { from: 0.6, to: 0.9 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    scene.tweens.add({
      targets: sigil,
      angle: { from: 0, to: 360 },
      duration: 2400,
      repeat: -1
    });
  } else {
    const glow = scene.add.circle(0, 0, 16, resolvedTint, 0.4);
    const core = scene.add.circle(0, 0, 8, resolvedTint, 0.9);
    container.add([glow, core]);
  }

  if (useFloat) {
    scene.tweens.add({
      targets: container,
      y: y - 8,
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
  }

  container.setDepth(depth);
  if (scale !== 1) {
    container.setScale(scale);
  }

  if (ignoreUiCamera && scene.uiCamera) {
    scene.uiCamera.ignore(container);
    container.list.forEach(child => scene.uiCamera.ignore(child));
  }

  return container;
}
