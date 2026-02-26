/**
 * Enemy Spawn Handler
 * 
 * Manages enemy spawning, AI behavior, and enemy-specific configurations.
 * Provides centralized enemy management for game scenes.
 * 
 * @module handlers/EnemySpawnHandler
 */

import { generateEnemySprite } from '../services/spriteGenerator.js';
import { randomInt } from '../helpers/mathHelpers.js';

/**
 * Enemy type configurations
 * @type {Object}
 */
export const ENEMY_CONFIGS = {
  slime: {
    hp: 40,
    maxHp: 40,
    damage: 8,
    speed: 60,
    sizeScale: 1,
    points: 25,
    color: 0x00ff00
  },
  devil: {
    hp: 85,
    maxHp: 85,
    damage: 18,
    speed: 70,
    sizeScale: 1.3,
    points: 100,
    color: 0xff0000
  },
  skeleton: {
    hp: 55,
    maxHp: 55,
    damage: 12,
    speed: 65,
    sizeScale: 1.1,
    points: 50,
    color: 0xcccccc
  }
};

/**
 * Enemy Spawn Handler Class
 */
export class EnemySpawnHandler {
  /**
   * Create enemy spawn handler
   * @param {Phaser.Scene} scene - The Phaser scene
   * @param {Object} config - Handler configuration
   * @param {Object} config.bounds - Spawn bounds { minX, maxX, minY, maxY }
   * @param {number} [config.maxEnemies=20] - Maximum enemies allowed
   * @param {Phaser.Cameras.Scene2D.Camera} [config.ignoreCamera=null] - Camera to ignore for enemies
   */
  constructor(scene, config) {
    this.scene = scene;
    this.bounds = config.bounds;
    this.maxEnemies = config.maxEnemies || 20;
    this.ignoreCamera = config.ignoreCamera || null;
    this.enemies = [];
  }

  /**
   * Spawn a random enemy
   * @param {Object} [config] - Spawn configuration
   * @param {number} [config.x] - Specific X position (random if not provided)
   * @param {number} [config.y] - Specific Y position (random if not provided)
   * @param {string} [config.type] - Specific enemy type (random if not provided)
   * @returns {Object|null} Enemy data object or null if max enemies reached
   * @example
   * const enemy = handler.spawnRandom({ type: 'slime' });
   */
  spawnRandom(config = {}) {
    if (this.enemies.length >= this.maxEnemies) {
      return null;
    }

    const x = config.x || this.bounds.minX + Math.random() * (this.bounds.maxX - this.bounds.minX);
    const y = config.y || this.bounds.minY + Math.random() * (this.bounds.maxY - this.bounds.minY);
    
    let type = config.type;
    if (!type) {
      const rand = Math.random();
      if (rand < 0.15) {
        type = 'skeleton';
      } else if (rand < 0.3) {
        type = 'devil';
      } else {
        type = 'slime';
      }
    }

    return this.spawn(x, y, type);
  }

  /**
   * Spawn a specific enemy type at position
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} type - Enemy type ('slime', 'devil', 'skeleton')
   * @returns {Object} Enemy data object
   * @example
   * const slime = handler.spawn(100, 100, 'slime');
   */
  spawn(x, y, type) {
    const config = ENEMY_CONFIGS[type] || ENEMY_CONFIGS.slime;
    
    const enemy = generateEnemySprite(this.scene, x, y, type);
    enemy.hp = config.hp;
    enemy.maxHp = config.maxHp;
    enemy.setDepth(1);

    if (this.ignoreCamera) {
      this.ignoreCamera.ignore(enemy);
      if (enemy.getChildren) {
        enemy.getChildren().forEach(child => this.ignoreCamera.ignore(child));
      }
    }

    // Create health bar
    const healthBarBg = this.scene.add.rectangle(x, y - 25, 40 * config.sizeScale, 5, 0x000000, 0.7)
      .setOrigin(0.5);
    const healthBar = this.scene.add.rectangle(x, y - 25, 40 * config.sizeScale, 5, 0xff0000, 1)
      .setOrigin(0.5);

    if (this.ignoreCamera) {
      this.ignoreCamera.ignore(healthBarBg);
      this.ignoreCamera.ignore(healthBar);
    }

    const enemyData = {
      enemy,
      type,
      healthBar,
      healthBarBg,
      sizeScale: config.sizeScale,
      damage: config.damage,
      speed: config.speed,
      points: config.points,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      targetX: x,
      targetY: y,
      aiState: 'idle',
      aiTimer: 0
    };

    this.enemies.push(enemyData);
    return enemyData;
  }

  /**
   * Spawn multiple enemies
   * @param {number} count - Number of enemies to spawn
   * @param {string} [type] - Specific type or undefined for random
   * @returns {Array} Array of spawned enemy data
   * @example
   * handler.spawnMultiple(5, 'slime');
   */
  spawnMultiple(count, type = null) {
    const spawned = [];
    
    for (let i = 0; i < count; i++) {
      const enemy = this.spawnRandom({ type });
      if (enemy) {
        spawned.push(enemy);
      }
    }
    
    return spawned;
  }

  /**
   * Update all enemies (AI and movement)
   * @param {Object} player - Player position { x, y }
   * @param {number} deltaScale - Time delta multiplier
   * @returns {void}
   * @example
   * handler.update({ x: playerX, y: playerY }, deltaScale);
   */
  update(player, deltaScale = 1) {
    this.enemies.forEach(enemyData => {
      this.updateEnemyAI(enemyData, player, deltaScale);
      this.updateEnemyPosition(enemyData, deltaScale);
      this.updateEnemyHealthBar(enemyData);
    });
  }

  /**
   * Update enemy AI behavior
   * @private
   * @param {Object} enemyData - Enemy data object
   * @param {Object} player - Player position
   * @param {number} deltaScale - Time delta
   * @returns {void}
   */
  updateEnemyAI(enemyData, player, deltaScale) {
    const dx = player.x - enemyData.enemy.x;
    const dy = player.y - enemyData.enemy.y;
    const dist = Math.hypot(dx, dy);

    enemyData.aiTimer += deltaScale;

    // Chase player if in range
    if (dist < 400) {
      enemyData.aiState = 'chase';
      const speed = (enemyData.speed / 100) * deltaScale;
      enemyData.vx += (dx / dist) * speed * 0.1;
      enemyData.vy += (dy / dist) * speed * 0.1;
    } else {
      // Wander behavior
      if (enemyData.aiTimer > 60) {
        enemyData.aiTimer = 0;
        enemyData.targetX = this.bounds.minX + Math.random() * (this.bounds.maxX - this.bounds.minX);
        enemyData.targetY = this.bounds.minY + Math.random() * (this.bounds.maxY - this.bounds.minY);
      }

      const tdx = enemyData.targetX - enemyData.enemy.x;
      const tdy = enemyData.targetY - enemyData.enemy.y;
      const tdist = Math.hypot(tdx, tdy);

      if (tdist > 10) {
        const speed = (enemyData.speed / 100) * deltaScale * 0.5;
        enemyData.vx += (tdx / tdist) * speed * 0.05;
        enemyData.vy += (tdy / tdist) * speed * 0.05;
      }
    }

    // Apply friction
    enemyData.vx *= 0.95;
    enemyData.vy *= 0.95;
  }

  /**
   * Update enemy position
   * @private
   * @param {Object} enemyData - Enemy data object
   * @param {number} deltaScale - Time delta
   * @returns {void}
   */
  updateEnemyPosition(enemyData, deltaScale) {
    enemyData.enemy.x += enemyData.vx * deltaScale;
    enemyData.enemy.y += enemyData.vy * deltaScale;

    // Keep within bounds
    if (enemyData.enemy.x < this.bounds.minX) {
      enemyData.enemy.x = this.bounds.minX;
      enemyData.vx = Math.abs(enemyData.vx);
    }
    if (enemyData.enemy.x > this.bounds.maxX) {
      enemyData.enemy.x = this.bounds.maxX;
      enemyData.vx = -Math.abs(enemyData.vx);
    }
    if (enemyData.enemy.y < this.bounds.minY) {
      enemyData.enemy.y = this.bounds.minY;
      enemyData.vy = Math.abs(enemyData.vy);
    }
    if (enemyData.enemy.y > this.bounds.maxY) {
      enemyData.enemy.y = this.bounds.maxY;
      enemyData.vy = -Math.abs(enemyData.vy);
    }
  }

  /**
   * Update enemy health bar position
   * @private
   * @param {Object} enemyData - Enemy data object
   * @returns {void}
   */
  updateEnemyHealthBar(enemyData) {
    if (enemyData.healthBar) {
      enemyData.healthBar.x = enemyData.enemy.x;
      enemyData.healthBar.y = enemyData.enemy.y - 25;
    }
    if (enemyData.healthBarBg) {
      enemyData.healthBarBg.x = enemyData.enemy.x;
      enemyData.healthBarBg.y = enemyData.enemy.y - 25;
    }
  }

  /**
   * Remove an enemy (cleanup)
   * @param {Object} enemyData - Enemy data to remove
   * @returns {void}
   * @example
   * handler.removeEnemy(deadEnemy);
   */
  removeEnemy(enemyData) {
    if (enemyData.healthBar) enemyData.healthBar.destroy();
    if (enemyData.healthBarBg) enemyData.healthBarBg.destroy();
    if (enemyData.enemy) enemyData.enemy.destroy();

    const index = this.enemies.indexOf(enemyData);
    if (index > -1) {
      this.enemies.splice(index, 1);
    }
  }

  /**
   * Get all enemies
   * @returns {Array} Array of enemy data objects
   * @example
   * const enemies = handler.getEnemies();
   */
  getEnemies() {
    return this.enemies;
  }

  /**
   * Get enemy count
   * @returns {number} Number of active enemies
   * @example
   * const count = handler.getEnemyCount();
   */
  getEnemyCount() {
    return this.enemies.length;
  }

  /**
   * Clear all enemies
   * @returns {void}
   * @example
   * handler.clearAll();
   */
  clearAll() {
    this.enemies.forEach(enemyData => {
      if (enemyData.healthBar) enemyData.healthBar.destroy();
      if (enemyData.healthBarBg) enemyData.healthBarBg.destroy();
      if (enemyData.enemy) enemyData.enemy.destroy();
    });
    
    this.enemies = [];
  }

  /**
   * Get enemies within range of a point
   * @param {Object} position - Center position { x, y }
   * @param {number} range - Search range
   * @returns {Array} Enemies within range
   * @example
   * const nearby = handler.getEnemiesInRange({ x: 500, y: 500 }, 200);
   */
  getEnemiesInRange(position, range) {
    return this.enemies.filter(enemyData => {
      const dx = enemyData.enemy.x - position.x;
      const dy = enemyData.enemy.y - position.y;
      const dist = Math.hypot(dx, dy);
      return dist <= range;
    });
  }

  /**
   * Get nearest enemy to position
   * @param {Object} position - Center position { x, y }
   * @returns {Object|null} Nearest enemy or null
   * @example
   * const nearest = handler.getNearestEnemy({ x: playerX, y: playerY });
   */
  getNearestEnemy(position) {
    if (this.enemies.length === 0) return null;

    let nearest = null;
    let minDist = Infinity;

    this.enemies.forEach(enemyData => {
      const dx = enemyData.enemy.x - position.x;
      const dy = enemyData.enemy.y - position.y;
      const dist = Math.hypot(dx, dy);
      
      if (dist < minDist) {
        minDist = dist;
        nearest = enemyData;
      }
    });

    return nearest;
  }
}

/**
 * Create enemy spawn handler
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {Object} config - Configuration
 * @returns {EnemySpawnHandler} Handler instance
 * @example
 * const enemyHandler = createEnemySpawnHandler(this, {
 *   bounds: { minX: 200, maxX: 4800, minY: 200, maxY: 4800 },
 *   maxEnemies: 20
 * });
 */
export function createEnemySpawnHandler(scene, config) {
  return new EnemySpawnHandler(scene, config);
}
