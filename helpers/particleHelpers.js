/**
 * Particle Effect Helper Functions
 * 
 * Helper utilities for creating various particle effects and visual flourishes.
 * Includes flames, smoke, embers, explosions, and environmental particles.
 * 
 * @module helpers/particleHelpers
 */

/**
 * Create a flame particle effect
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {Object} [config] - Flame configuration
 * @param {number[]} [config.colors=[0xff3300, 0xff6600, 0xff8800, 0xffaa00]] - Flame colors
 * @param {number} [config.quantity=2] - Particles per emission
 * @param {number} [config.frequency=80] - Emission frequency (ms)
 * @param {number} [config.lifespan=2000] - Particle lifespan (ms)
 * @param {Object} [config.speed] - Speed range { min, max }
 * @param {Phaser.Cameras.Scene2D.Camera} [config.ignoreCamera] - Camera to ignore
 * @returns {Phaser.GameObjects.Particles.ParticleEmitter} The particle emitter
 * @example
 * createFlameParticles(this, 100, 500, { quantity: 3, frequency: 60 });
 */
export function createFlameParticles(scene, x, y, config = {}) {
  const {
    colors = [0xff3300, 0xff6600, 0xff8800, 0xffaa00, 0xffcc00],
    quantity = 2,
    frequency = 80,
    lifespan = 2000,
    speed = { min: 80, max: 150 },
    ignoreCamera = null
  } = config;

  // Create particle texture
  const flameGraphics = scene.make.graphics({ x: 0, y: 0, add: false });
  flameGraphics.fillStyle(0xffffff);
  flameGraphics.fillCircle(8, 8, 8);
  const textureKey = `flameParticle_${Date.now()}_${Math.random()}`;
  flameGraphics.generateTexture(textureKey, 16, 16);
  flameGraphics.destroy();

  const particles = scene.add.particles(x, y, textureKey, {
    speed: speed,
    angle: { min: 250, max: 290 },
    scale: { start: 0.6, end: 0 },
    alpha: { start: 0.8, end: 0 },
    tint: colors,
    lifespan: lifespan,
    frequency: frequency,
    gravityY: -50,
    blendMode: 'ADD',
    emitting: true,
    quantity: quantity
  });

  particles.setDepth(-1);

  if (ignoreCamera) {
    ignoreCamera.ignore(particles);
  }

  return particles;
}

/**
 * Create ember/spark particles (small floating particles)
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Emission area width
 * @param {Object} [config] - Ember configuration
 * @returns {Phaser.GameObjects.Particles.ParticleEmitter} The particle emitter
 * @example
 * createEmberParticles(this, 0, 1080, 1920);
 */
export function createEmberParticles(scene, x, y, width, config = {}) {
  const {
    colors = [0xff6600, 0xff8800, 0xffaa00],
    quantity = 1,
    frequency = 200,
    lifespan = 4000,
    speed = { min: 20, max: 60 }
  } = config;

  const emberGraphics = scene.make.graphics({ x: 0, y: 0, add: false });
  emberGraphics.fillStyle(0xffffff);
  emberGraphics.fillCircle(4, 4, 4);
  const textureKey = `emberParticle_${Date.now()}_${Math.random()}`;
  emberGraphics.generateTexture(textureKey, 8, 8);
  emberGraphics.destroy();

  const particles = scene.add.particles(0, y, textureKey, {
    x: { min: x, max: x + width },
    speed: speed,
    angle: { min: 260, max: 280 },
    scale: { min: 0.2, max: 0.5 },
    alpha: { start: 1, end: 0 },
    tint: colors,
    lifespan: lifespan,
    frequency: frequency,
    gravityY: -10,
    blendMode: 'ADD',
    emitting: true,
    quantity: quantity
  });

  particles.setDepth(-2);

  return particles;
}

/**
 * Create a torch flame effect
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {Object} [config] - Torch configuration
 * @returns {Object} Torch components (pole, flame circles, animations)
 * @example
 * const torch = createTorchEffect(this, 200, 200);
 */
export function createTorchEffect(scene, x, y, config = {}) {
  const {
    poleColor = 0x4a3a2a,
    baseColor = 0x2a1a0a,
    arenaObjects = null,
    ignoreCamera = null
  } = config;

  // Torch pole
  const pole = scene.add.rectangle(x, y + 20, 12, 60, poleColor, 1).setOrigin(0.5);
  const base = scene.add.rectangle(x, y + 48, 20, 12, baseColor, 1).setOrigin(0.5);

  // Flame layers
  const glow = scene.add.circle(x, y - 10, 22, 0xFFDD00, 0.4).setOrigin(0.5);
  const flameOuter = scene.add.circle(x, y - 10, 14, 0xFF8800, 0.8).setOrigin(0.5);
  const flameInner = scene.add.circle(x, y - 12, 8, 0xFF4400, 0.9).setOrigin(0.5);
  const flameCore = scene.add.circle(x, y - 14, 4, 0xFFFF00, 1).setOrigin(0.5);

  const flameElements = [glow, flameOuter, flameInner, flameCore];

  // Fire flicker animation
  scene.tweens.add({
    targets: flameElements,
    alpha: { from: 0.6, to: 1 },
    duration: 200 + Math.random() * 300,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });

  scene.tweens.add({
    targets: [flameOuter, flameInner, flameCore],
    scaleX: { from: 0.9, to: 1.1 },
    scaleY: { from: 0.9, to: 1.2 },
    duration: 250 + Math.random() * 250,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });

  const components = [pole, base, ...flameElements];

  if (arenaObjects) {
    arenaObjects.push(...components);
  }

  if (ignoreCamera) {
    components.forEach(comp => ignoreCamera.ignore(comp));
  }

  return {
    pole,
    base,
    glow,
    flameOuter,
    flameInner,
    flameCore,
    components
  };
}

/**
 * Create a lava pool effect
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Pool width
 * @param {number} height - Pool height
 * @param {Object} [config] - Lava pool configuration
 * @returns {Object} Lava pool components and collision data
 * @example
 * const lava = createLavaPool(this, 500, 500, 200, 150);
 */
export function createLavaPool(scene, x, y, width, height, config = {}) {
  const {
    arenaObjects = null,
    ignoreCamera = null
  } = config;

  // Rocky base
  const base = scene.add.ellipse(x, y, width + 20, height + 20, 0x4a4a4a, 1).setOrigin(0.5);

  // Outer glow
  const glow = scene.add.ellipse(x, y, width + 10, height + 10, 0xffaa00, 0.25).setOrigin(0.5);
  
  // Mid layer
  const mid = scene.add.ellipse(x, y, width, height, 0xff5500, 0.7).setOrigin(0.5);
  
  // Core
  const core = scene.add.ellipse(x, y, width - 20, height - 20, 0xff2200, 0.9).setOrigin(0.5);

  // Bubble highlights
  const bubbles = [];
  for (let i = 0; i < 4; i++) {
    const bx = x + (Math.random() - 0.5) * (width / 2);
    const by = y + (Math.random() - 0.5) * (height / 2);
    const br = 6 + Math.random() * 8;
    const bubble = scene.add.circle(bx, by, br, 0xffdd88, 0.8).setOrigin(0.5);
    bubbles.push(bubble);
  }

  // Animate glow
  scene.tweens.add({
    targets: glow,
    alpha: { from: 0.2, to: 0.5 },
    duration: 900,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });

  // Animate bubbles
  bubbles.forEach((bubble, idx) => {
    scene.tweens.add({
      targets: bubble,
      alpha: { from: 0.3, to: 1 },
      duration: 400 + idx * 120,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  });

  const components = [base, glow, mid, core, ...bubbles];

  if (arenaObjects) {
    arenaObjects.push(...components);
  }

  if (ignoreCamera) {
    components.forEach(comp => ignoreCamera.ignore(comp));
  }

  return {
    base,
    glow,
    mid,
    core,
    bubbles,
    components,
    collisionData: { x, y, width, height }
  };
}

/**
 * Create an explosion particle effect
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {Object} [config] - Explosion configuration
 * @returns {Phaser.GameObjects.Particles.ParticleEmitter} The particle emitter
 * @example
 * createExplosionParticles(this, 300, 300, { radius: 100, duration: 500 });
 */
export function createExplosionParticles(scene, x, y, config = {}) {
  const {
    radius = 80,
    duration = 400,
    color = 0xff6600,
    quantity = 30
  } = config;

  const explosionGraphics = scene.make.graphics({ x: 0, y: 0, add: false });
  explosionGraphics.fillStyle(0xffffff);
  explosionGraphics.fillCircle(6, 6, 6);
  const textureKey = `explosionParticle_${Date.now()}_${Math.random()}`;
  explosionGraphics.generateTexture(textureKey, 12, 12);
  explosionGraphics.destroy();

  const particles = scene.add.particles(x, y, textureKey, {
    speed: { min: 50, max: radius * 2 },
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 },
    tint: [0xff0000, 0xff4400, 0xff6600, 0xff8800, color],
    lifespan: duration,
    blendMode: 'ADD',
    emitting: false
  });

  particles.explode(quantity, x, y);

  // Auto-destroy after animation
  scene.time.delayedCall(duration + 100, () => {
    particles.destroy();
  });

  return particles;
}

/**
 * Create slash/melee attack visual effect
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {Object} aim - Direction { x, y }
 * @param {number} range - Slash range
 * @param {Object} [config] - Slash configuration
 * @returns {Phaser.GameObjects.Graphics} The slash arc graphic
 * @example
 * createSlashEffect(this, playerX, playerY, { x: 1, y: 0 }, 70);
 */
export function createSlashEffect(scene, x, y, aim, range, config = {}) {
  const {
    color = 0xffffff,
    alpha = 0.7,
    lineWidth = 3,
    duration = 140,
    ignoreCamera = null
  } = config;

  const arc = scene.add.graphics();
  arc.lineStyle(lineWidth, color, alpha);
  
  const baseAngle = Math.atan2(aim.y, aim.x);
  arc.beginPath();
  arc.arc(x, y, range, baseAngle - 0.6, baseAngle + 0.6);
  arc.strokePath();

  if (ignoreCamera) {
    ignoreCamera.ignore(arc);
  }

  scene.tweens.add({
    targets: arc,
    alpha: 0,
    duration: duration,
    onComplete: () => arc.destroy()
  });

  return arc;
}

/**
 * Create a shockwave/ring effect
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} radius - Shockwave radius
 * @param {Object} [config] - Shockwave configuration
 * @returns {Phaser.GameObjects.Arc} The shockwave ring
 * @example
 * createShockwave(this, playerX, playerY, 110, { color: 0xffaa00, duration: 220 });
 */
export function createShockwave(scene, x, y, radius, config = {}) {
  const {
    color = 0xffcc55,
    fillAlpha = 0.15,
    strokeColor = 0xffaa00,
    strokeAlpha = 0.8,
    strokeWidth = 3,
    duration = 220,
    targetScale = 1.1,
    ignoreCamera = null
  } = config;

  const ring = scene.add.circle(x, y, radius, color, fillAlpha);
  ring.setStrokeStyle(strokeWidth, strokeColor, strokeAlpha);

  if (ignoreCamera) {
    ignoreCamera.ignore(ring);
  }

  scene.tweens.add({
    targets: ring,
    scale: targetScale,
    alpha: 0,
    duration: duration,
    onComplete: () => ring.destroy()
  });

  return ring;
}

/**
 * Create blood splatter effect
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {Object} [config] - Blood splatter configuration
 * @returns {Phaser.GameObjects.Particles.ParticleEmitter} The particle emitter
 * @example
 * createBloodSplatter(this, enemyX, enemyY);
 */
export function createBloodSplatter(scene, x, y, config = {}) {
  const {
    quantity = 15,
    speed = { min: 40, max: 100 },
    lifespan = 600
  } = config;

  const bloodGraphics = scene.make.graphics({ x: 0, y: 0, add: false });
  bloodGraphics.fillStyle(0xff0000);
  bloodGraphics.fillCircle(4, 4, 4);
  const textureKey = `bloodParticle_${Date.now()}_${Math.random()}`;
  bloodGraphics.generateTexture(textureKey, 8, 8);
  bloodGraphics.destroy();

  const particles = scene.add.particles(x, y, textureKey, {
    speed: speed,
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0.3 },
    alpha: { start: 1, end: 0 },
    tint: [0x8b0000, 0xff0000, 0x990000],
    lifespan: lifespan,
    gravityY: 200,
    emitting: false
  });

  particles.explode(quantity, x, y);

  scene.time.delayedCall(lifespan + 100, () => {
    particles.destroy();
  });

  return particles;
}

/**
 * Create ambient floating particles for atmosphere
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {Object} spawnArea - { minX, maxX, minY, maxY }
 * @param {number} count - Number of particles
 * @param {Object} [config] - Particle configuration
 * @returns {Phaser.GameObjects.Container} Container with particle graphics
 * @example
 * createFloatingParticles(this, { minX: 0, maxX: 1920, minY: 0, maxY: 1080 }, 100);
 */
export function createFloatingParticles(scene, spawnArea, count, config = {}) {
  const {
    depth = 2
  } = config;

  const particleContainer = scene.add.container(0, 0);
  particleContainer.setDepth(depth);

  const particleTypes = [
    { shape: 'circle', size: 1.5, colors: [0xffffff, 0xffe0b8, 0xffc68a], speed: { x: 25, y: -40 }, duration: 5000, alpha: 0.5 },
    { shape: 'circle', size: 3, colors: [0xffd9a3, 0xffe0b8, 0xffccaa], speed: { x: 35, y: -20 }, duration: 8000, alpha: 0.35 },
    { shape: 'circle', size: 2.5, colors: [0xff4400, 0xff6600, 0xff8800], speed: { x: 20, y: 10 }, duration: 9000, alpha: 0.7 },
    { shape: 'circle', size: 3, colors: [0x8844ff, 0xaa66ff, 0xcc88ff], speed: { x: 40, y: 0 }, duration: 7000, alpha: 0.4 },
    { shape: 'circle', size: 3, colors: [0x5a5a5a, 0x4a4a4a, 0x3a3a3a], speed: { x: 15, y: 5 }, duration: 10000, alpha: 0.45 }
  ];

  for (let i = 0; i < count; i++) {
    const x = spawnArea.minX + Math.random() * (spawnArea.maxX - spawnArea.minX);
    const y = spawnArea.minY + Math.random() * (spawnArea.maxY - spawnArea.minY);

    const typeIndex = Math.floor(Math.random() * particleTypes.length);
    const particleType = particleTypes[typeIndex];
    const color = particleType.colors[Math.floor(Math.random() * particleType.colors.length)];

    const particleGfx = scene.make.graphics({ x: 0, y: 0, add: false });
    particleGfx.fillStyle(color, particleType.alpha);
    particleGfx.fillCircle(particleType.size, particleType.size, particleType.size);
    
    particleContainer.add(particleGfx);
    particleGfx.x = x;
    particleGfx.y = y;

    const speedX = (Math.random() - 0.5) * particleType.speed.x;
    const speedY = (Math.random() - 0.5) * particleType.speed.y;

    scene.tweens.add({
      targets: particleGfx,
      x: x + speedX,
      y: y + speedY,
      alpha: 0,
      scale: 0.5,
      duration: particleType.duration,
      ease: 'Linear',
      repeat: -1,
      yoyo: false,
      onRepeat: () => {
        const newX = spawnArea.minX + Math.random() * (spawnArea.maxX - spawnArea.minX);
        const newY = spawnArea.minY + Math.random() * (spawnArea.maxY - spawnArea.minY);
        particleGfx.x = newX;
        particleGfx.y = newY;
        particleGfx.alpha = particleType.alpha;
        particleGfx.scale = 1;
      }
    });
  }

  return particleContainer;
}
