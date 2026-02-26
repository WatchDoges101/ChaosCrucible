/**
 * Arena Environment Helper Functions
 * 
 * Helper utilities for creating game arena environments including floors,
 * borders, obstacles, structures, and environmental elements.
 * 
 * @module helpers/arenaHelpers
 */

import { createTorchEffect, createLavaPool } from './particleHelpers.js';

/**
 * Create an arena floor with stone texture
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {Object} config - Arena configuration
 * @param {number} config.width - Arena width
 * @param {number} config.height - Arena height
 * @param {number} config.padding - Border padding
 * @param {number} [config.centerX] - Center X position
 * @param {number} [config.centerY] - Center Y position
 * @returns {Array} Array of arena objects (background, floor, graphics)
 * @example
 * const arenaObjects = createArenaFloor(this, {
 *   width: 5000,
 *   height: 5000,
 *   padding: 200,
 *   centerX: 2500,
 *   centerY: 2500
 * });
 */
export function createArenaFloor(scene, config) {
  const {
    width,
    height,
    padding,
    centerX = width / 2,
    centerY = height / 2
  } = config;

  const objects = [];

  // Grey stone background
  const arenaBg = scene.add.rectangle(centerX, centerY, width, height, 0x2a2a2a).setOrigin(0.5);
  objects.push(arenaBg);

  // Create floor texture
  const floorGraphics = scene.make.graphics({ x: 0, y: 0, add: false });

  // Solid stone floor
  floorGraphics.fillStyle(0x3a3a3a, 1);
  floorGraphics.fillRectShape(new Phaser.Geom.Rectangle(
    padding,
    padding,
    width - 2 * padding,
    height - 2 * padding
  ));

  // Rocky speckles
  for (let i = 0; i < 120; i++) {
    const sx = padding + 50 + Math.random() * (width - 2 * padding - 100);
    const sy = padding + 50 + Math.random() * (height - 2 * padding - 100);
    const sr = 2 + Math.random() * 4;
    const shade = Math.random() > 0.5 ? 0x555555 : 0x2b2b2b;
    floorGraphics.fillStyle(shade, 0.7);
    floorGraphics.fillCircle(sx, sy, sr);
  }

  // Add cracks and wear marks
  floorGraphics.lineStyle(1.5, 0x202020, 0.8);
  for (let i = 0; i < 30; i++) {
    const startX = padding + 100 + Math.random() * (width - 2 * padding - 200);
    const startY = padding + 100 + Math.random() * (height - 2 * padding - 200);
    const endX = startX + (Math.random() - 0.5) * 200;
    const endY = startY + (Math.random() - 0.5) * 200;
    floorGraphics.lineBetween(startX, startY, endX, endY);
  }

  // Blood stains (dark red circles)
  for (let i = 0; i < 15; i++) {
    const bx = padding + 150 + Math.random() * (width - 2 * padding - 300);
    const by = padding + 150 + Math.random() * (height - 2 * padding - 300);
    const radius = 15 + Math.random() * 30;
    floorGraphics.fillStyle(0x4a0000, 0.4);
    floorGraphics.fillCircle(bx, by, radius);
  }

  scene.add.existing(floorGraphics);
  objects.push(floorGraphics);

  return objects;
}

/**
 * Create arena border with spikes
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {Object} config - Border configuration
 * @param {number} config.width - Arena width
 * @param {number} config.height - Arena height
 * @param {number} config.padding - Border padding
 * @returns {Phaser.GameObjects.Graphics} Border graphics object
 * @example
 * const border = createArenaBorder(this, { width: 5000, height: 5000, padding: 200 });
 */
export function createArenaBorder(scene, config) {
  const {
    width,
    height,
    padding
  } = config;

  const borderGraphics = scene.make.graphics({ x: 0, y: 0, add: false });
  const borderX = padding;
  const borderY = padding;
  const borderW = width - 2 * padding;
  const borderH = height - 2 * padding;

  // Outer dark stone border
  borderGraphics.fillStyle(0x4a3a2a, 1);
  borderGraphics.fillRectShape(new Phaser.Geom.Rectangle(borderX - 20, borderY - 20, borderW + 40, 20));
  borderGraphics.fillRectShape(new Phaser.Geom.Rectangle(borderX - 20, borderY + borderH, borderW + 40, 20));
  borderGraphics.fillRectShape(new Phaser.Geom.Rectangle(borderX - 20, borderY, 20, borderH));
  borderGraphics.fillRectShape(new Phaser.Geom.Rectangle(borderX + borderW, borderY, 20, borderH));

  // Main orange border line
  borderGraphics.lineStyle(14, 0xFF6B00, 1);
  borderGraphics.strokeRectShape(new Phaser.Geom.Rectangle(borderX, borderY, borderW, borderH));

  // Inner detail border
  borderGraphics.lineStyle(4, 0xFFAA44, 0.7);
  borderGraphics.strokeRectShape(new Phaser.Geom.Rectangle(borderX + 8, borderY + 8, borderW - 16, borderH - 16));

  // Dark inner line
  borderGraphics.lineStyle(2, 0x331100, 0.8);
  borderGraphics.strokeRectShape(new Phaser.Geom.Rectangle(borderX + 2, borderY + 2, borderW - 4, borderH - 4));

  // Spikes along border
  const spikeSize = 50;
  const spikeColor = 0xCC0000;

  // Top and bottom spikes
  for (let x = borderX + 100; x < borderX + borderW; x += 150) {
    borderGraphics.fillStyle(spikeColor, 1);
    borderGraphics.fillTriangleShape(
      new Phaser.Geom.Triangle(x - spikeSize / 2, borderY - 30, x + spikeSize / 2, borderY - 30, x, borderY - 60)
    );
    borderGraphics.fillTriangleShape(
      new Phaser.Geom.Triangle(x - spikeSize / 2, borderY + borderH + 30, x + spikeSize / 2, borderY + borderH + 30, x, borderY + borderH + 60)
    );
  }

  // Left and right spikes
  for (let y = borderY + 100; y < borderY + borderH; y += 150) {
    borderGraphics.fillStyle(spikeColor, 1);
    borderGraphics.fillTriangleShape(
      new Phaser.Geom.Triangle(borderX - 30, y - spikeSize / 2, borderX - 30, y + spikeSize / 2, borderX - 60, y)
    );
    borderGraphics.fillTriangleShape(
      new Phaser.Geom.Triangle(borderX + borderW + 30, y - spikeSize / 2, borderX + borderW + 30, y + spikeSize / 2, borderX + borderW + 60, y)
    );
  }

  scene.add.existing(borderGraphics);

  return borderGraphics;
}

/**
 * Create corner torches for arena
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {Object} config - Torch configuration
 * @param {number} config.width - Arena width
 * @param {number} config.height - Arena height
 * @param {number} config.padding - Border padding
 * @param {Array} [config.arenaObjects=[]] - Array to add objects to
 * @returns {Array} Array of torch component objects
 * @example
 * const torches = createCornerTorches(this, { width: 5000, height: 5000, padding: 200 });
 */
export function createCornerTorches(scene, config) {
  const {
    width,
    height,
    padding,
    arenaObjects = []
  } = config;

  const borderX = padding;
  const borderY = padding;
  const borderW = width - 2 * padding;
  const borderH = height - 2 * padding;

  const torches = [];
  const positions = [
    { x: borderX + 60, y: borderY + 60 },
    { x: borderX + borderW - 60, y: borderY + 60 },
    { x: borderX + 60, y: borderY + borderH - 60 },
    { x: borderX + borderW - 60, y: borderY + borderH - 60 }
  ];

  positions.forEach(pos => {
    const torch = createTorchEffect(scene, pos.x, pos.y, { arenaObjects });
    torches.push(torch);
  });

  return torches;
}

/**
 * Create lava pools
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {Object} config - Lava configuration
 * @param {number} config.width - Arena width
 * @param {number} config.height - Arena height
 * @param {number} config.padding - Border padding
 * @param {number} [config.count=6] - Number of lava pools
 * @param {Array} [config.arenaObjects=[]] - Array to add objects to
 * @param {Array} [config.lavaPools=[]] - Array to store collision data
 * @returns {Array} Array of lava pool objects
 * @example
 * const lavaPools = createLavaPools(this, {
 *   width: 5000,
 *   height: 5000,
 *   padding: 200,
 *   count: 8
 * });
 */
export function createLavaPools(scene, config) {
  const {
    width,
    height,
    padding,
    count = 6,
    arenaObjects = [],
    lavaPools = []
  } = config;

  const pools = [];

  for (let i = 0; i < count; i++) {
    const poolX = padding + 250 + Math.random() * (width - 2 * padding - 500);
    const poolY = padding + 250 + Math.random() * (height - 2 * padding - 500);
    const poolW = 140 + Math.random() * 120;
    const poolH = 90 + Math.random() * 80;

    const pool = createLavaPool(scene, poolX, poolY, poolW, poolH, { arenaObjects });
    pools.push(pool);

    // Store collision data
    lavaPools.push(pool.collisionData);
  }

  return pools;
}

/**
 * Create obstacles (rocks, pillars)
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {Object} config - Obstacle configuration
 * @param {number} config.width - Arena width
 * @param {number} config.height - Arena height
 * @param {number} config.padding - Border padding
 * @param {number} [config.count=15] - Number of obstacles
 * @param {Array} [config.arenaObjects=[]] - Array to add objects to
 * @param {Array} [config.obstacles=[]] - Array to store collision data
 * @returns {Array} Array of obstacle objects
 * @example
 * const obstacles = createObstacles(this, {
 *   width: 5000,
 *   height: 5000,
 *   padding: 200,
 *   count: 20
 * });
 */
export function createObstacles(scene, config) {
  const {
    width,
    height,
    padding,
    count = 15,
    arenaObjects = [],
    obstacles = []
  } = config;

  const obstacleObjects = [];

  for (let i = 0; i < count; i++) {
    const x = padding + 300 + Math.random() * (width - 2 * padding - 600);
    const y = padding + 300 + Math.random() * (height - 2 * padding - 600);
    const w = 60 + Math.random() * 80;
    const h = 60 + Math.random() * 80;

    // Create rock/pillar
    const rock = scene.add.ellipse(x, y, w, h, 0x4a4a4a, 1).setOrigin(0.5);
    rock.setStrokeStyle(3, 0x3a3a3a, 0.8);

    // Add shadow
    const shadow = scene.add.ellipse(x + 5, y + 8, w * 0.9, h * 0.6, 0x000000, 0.3).setOrigin(0.5);
    shadow.setDepth(-1);

    arenaObjects.push(rock, shadow);
    obstacleObjects.push({ rock, shadow });

    // Store collision data
    obstacles.push({
      x,
      y,
      width: w,
      height: h
    });
  }

  return obstacleObjects;
}

/**
 * Create a complete arena environment
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {Object} config - Complete arena configuration
 * @param {number} config.width - Arena width
 * @param {number} config.height - Arena height
 * @param {number} config.padding - Border padding
 * @param {boolean} [config.includeTorches=true] - Include corner torches
 * @param {boolean} [config.includeLava=true] - Include lava pools
 * @param {boolean} [config.includeObstacles=true] - Include obstacles
 * @param {number} [config.lavaCount=6] - Number of lava pools
 * @param {number} [config.obstacleCount=15] - Number of obstacles
 * @returns {Object} Arena components
 * @example
 * const arena = createCompleteArena(this, {
 *   width: 5000,
 *   height: 5000,
 *   padding: 200
 * });
 */
export function createCompleteArena(scene, config) {
  const {
    width,
    height,
    padding,
    includeTorches = true,
    includeLava = true,
    includeObstacles = true,
    lavaCount = 6,
    obstacleCount = 15
  } = config;

  const centerX = width / 2;
  const centerY = height / 2;

  const arenaObjects = [];
  const lavaPools = [];
  const obstacles = [];

  // Create floor
  const floorObjects = createArenaFloor(scene, { width, height, padding, centerX, centerY });
  arenaObjects.push(...floorObjects);

  // Create border
  const border = createArenaBorder(scene, { width, height, padding });
  arenaObjects.push(border);

  // Create torches
  let torches = [];
  if (includeTorches) {
    torches = createCornerTorches(scene, { width, height, padding, arenaObjects });
  }

  // Create lava pools
  let lavaPoolObjects = [];
  if (includeLava) {
    lavaPoolObjects = createLavaPools(scene, {
      width,
      height,
      padding,
      count: lavaCount,
      arenaObjects,
      lavaPools
    });
  }

  // Create obstacles
  let obstacleObjects = [];
  if (includeObstacles) {
    obstacleObjects = createObstacles(scene, {
      width,
      height,
      padding,
      count: obstacleCount,
      arenaObjects,
      obstacles
    });
  }

  return {
    arenaObjects,
    lavaPools,
    obstacles,
    torches,
    lavaPoolObjects,
    obstacleObjects,
    border,
    floorObjects
  };
}

/**
 * Create a grid background
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @param {Object} [config] - Grid configuration
 * @param {number} [config.gridSize=100] - Grid cell size
 * @param {number} [config.color=0x333333] - Grid line color
 * @param {number} [config.alpha=0.5] - Grid line opacity
 * @returns {Phaser.GameObjects.Graphics} Grid graphics object
 * @example
 * const grid = createGridBackground(this, 2000, 2000, { gridSize: 150 });
 */
export function createGridBackground(scene, width, height, config = {}) {
  const {
    gridSize = 100,
    color = 0x333333,
    alpha = 0.5
  } = config;

  const grid = scene.add.graphics();
  grid.lineStyle(1, color, alpha);

  // Vertical lines
  for (let x = 0; x < width; x += gridSize) {
    grid.moveTo(x, 0);
    grid.lineTo(x, height);
  }

  // Horizontal lines
  for (let y = 0; y < height; y += gridSize) {
    grid.moveTo(0, y);
    grid.lineTo(width, y);
  }

  grid.strokePath();

  return grid;
}

/**
 * Create a simple rectangular background
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} width - Background width
 * @param {number} height - Background height
 * @param {number} [color=0x1a0000] - Background color
 * @param {number} [alpha=1] - Background opacity
 * @returns {Phaser.GameObjects.Rectangle} Background rectangle
 * @example
 * const bg = createSimpleBackground(this, 1920, 1080, 0x000000);
 */
export function createSimpleBackground(scene, width, height, color = 0x1a0000, alpha = 1) {
  const centerX = width / 2;
  const centerY = height / 2;

  return scene.add.rectangle(centerX, centerY, width, height, color, alpha).setOrigin(0.5);
}
