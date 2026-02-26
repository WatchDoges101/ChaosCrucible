/**
 * Combat System Helper Functions
 * 
 * Helper utilities for combat mechanics including damage calculation,
 * projectile management, collision detection, and combat effects.
 * 
 * @module helpers/combatHelpers
 */

import { getDistance, getAngle } from './mathHelpers.js';
import { createFlashTint } from './animationHelpers.js';
import { createBloodSplatter } from './particleHelpers.js';

/**
 * Role-specific combat configurations
 * @type {Object}
 */
export const ROLE_CONFIGS = {
  Male: {
    basicCooldown: 300,
    abilityCooldown: 1500,
    meleeRange: 70,
    basicDamage: 12,
    abilityDamage: 20,
    abilityRadius: 110
  },
  archer: {
    basicCooldown: 400,
    abilityCooldown: 2000,
    projectileSpeed: 10,
    basicDamage: 10,
    abilityDamage: 12,
    abilityShots: 5,
    abilitySpread: 0.25
  },
  brute: {
    basicCooldown: 700,
    abilityCooldown: 2500,
    meleeRange: 60,
    basicDamage: 18,
    abilityDamage: 28,
    abilityRadius: 140
  },
  gunner: {
    basicCooldown: 140,
    abilityCooldown: 1800,
    projectileSpeed: 12,
    basicDamage: 6,
    abilityDamage: 8,
    abilityBurst: 6
  }
};

/**
 * Get role-specific combat configuration
 * @param {string} role - Character role name
 * @returns {Object} Role combat configuration
 * @example
 * const config = getRoleConfig('archer');
 */
export function getRoleConfig(role) {
  return ROLE_CONFIGS[role] || ROLE_CONFIGS.Male;
}

/**
 * Check if attack is off cooldown
 * @param {number} currentTime - Current timestamp
 * @param {number} nextAllowedTime - Next allowed attack time
 * @returns {boolean} True if attack is ready
 * @example
 * if (isAttackReady(this.time.now, attackState.nextBasicTime)) { attack(); }
 */
export function isAttackReady(currentTime, nextAllowedTime) {
  return currentTime >= nextAllowedTime;
}

/**
 * Calculate cooldown end time
 * @param {number} currentTime - Current timestamp
 * @param {number} cooldown - Cooldown duration in ms
 * @returns {number} Timestamp when cooldown ends
 * @example
 * attackState.nextBasicTime = calculateCooldownEnd(this.time.now, 300);
 */
export function calculateCooldownEnd(currentTime, cooldown) {
  return currentTime + cooldown;
}

/**
 * Calculate aim direction from source to target
 * @param {Object} source - Source position { x, y }
 * @param {Object} target - Target position { x, y }
 * @returns {Object} Normalized direction { x, y }
 * @example
 * const aim = getAimDirection({ x: playerX, y: playerY }, { x: mouseX, y: mouseY });
 */
export function getAimDirection(source, target) {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const len = Math.hypot(dx, dy);
  
  if (!len || len === 0) {
    return { x: 1, y: 0 }; // Default to right
  }
  
  return { x: dx / len, y: dy / len };
}

/**
 * Get facing direction from player state
 * @param {string} facing - Facing direction ('up', 'down', 'left', 'right')
 * @param {number} [scaleX=1] - Sprite scale X (for left/right)
 * @returns {Object} Direction vector { x, y }
 * @example
 * const direction = getFacingDirection('up');
 */
export function getFacingDirection(facing, scaleX = 1) {
  if (facing === 'up') return { x: 0, y: -1 };
  if (facing === 'down') return { x: 0, y: 1 };
  if (facing === 'left') return { x: -1, y: 0 };
  if (facing === 'right') return { x: 1, y: 0 };
  
  // Fallback for horizontal based on scale
  return scaleX >= 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
}

/**
 * Create a projectile object
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {Object} config - Projectile configuration
 * @param {number} config.x - Starting X position
 * @param {number} config.y - Starting Y position
 * @param {number} config.vx - Velocity X
 * @param {number} config.vy - Velocity Y
 * @param {number} config.damage - Damage amount
 * @param {number} [config.color=0xffdd55] - Projectile color
 * @param {number} [config.radius=2] - Projectile radius
 * @param {number} [config.range=480] - Maximum range
 * @param {string} [config.type='bullet'] - Projectile type ('bullet' or 'arrow')
 * @param {Phaser.Cameras.Scene2D.Camera} [config.ignoreCamera] - Camera to ignore
 * @returns {Object} Projectile data object
 * @example
 * const projectile = createProjectile(this, {
 *   x: playerX, y: playerY,
 *   vx: aim.x * 10, vy: aim.y * 10,
 *   damage: 15, type: 'arrow'
 * });
 */
export function createProjectile(scene, config) {
  const {
    x,
    y,
    vx,
    vy,
    damage,
    color = 0xffdd55,
    radius = 2,
    range = 480,
    type = 'bullet',
    ignoreCamera = null
  } = config;

  let sprite;
  
  if (type === 'arrow') {
    // Create arrow graphics
    const arrowGraphics = scene.add.graphics();
    const angle = Math.atan2(vy, vx);
    
    // Arrow shaft
    arrowGraphics.lineStyle(2, color, 1);
    arrowGraphics.lineBetween(0, 0, 12, 0);
    
    // Arrowhead
    arrowGraphics.fillStyle(color, 1);
    arrowGraphics.fillTriangle(12, 0, 8, -2, 8, 2);
    
    // Fletching (back of arrow)
    arrowGraphics.lineStyle(1.5, 0x8b4513, 0.8);
    arrowGraphics.lineBetween(-1, -1.5, -1, 1.5);
    
    arrowGraphics.setPosition(x, y);
    arrowGraphics.setRotation(angle);
    sprite = arrowGraphics;
  } else {
    // Create bullet (circle)
    sprite = scene.add.circle(x, y, radius, color, 0.9);
    sprite.setStrokeStyle(1, 0x000000, 0.4);
  }
  
  if (ignoreCamera) {
    ignoreCamera.ignore(sprite);
  }

  return {
    sprite,
    x,
    y,
    vx,
    vy,
    damage,
    radius,
    rangeRemaining: range,
    type
  };
}

/**
 * Update projectiles (movement and collision)
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {Array} projectiles - Array of projectile objects
 * @param {Array} enemies - Array of enemy objects
 * @param {Object} bounds - Bounds { minX, maxX, minY, maxY }
 * @param {number} deltaScale - Time delta scale
 * @param {Function} damageCallback - Callback when enemy hit (enemy, damage, knockback)
 * @returns {void}
 * @example
 * updateProjectiles(this, projectiles, enemies, bounds, deltaScale, damageEnemy);
 */
export function updateProjectiles(scene, projectiles, enemies, bounds, deltaScale, damageCallback) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];
    const stepX = proj.vx * deltaScale;
    const stepY = proj.vy * deltaScale;
    
    proj.x += stepX;
    proj.y += stepY;
    proj.rangeRemaining -= Math.hypot(stepX, stepY);

    if (proj.sprite) {
      proj.sprite.setPosition(proj.x, proj.y);
      // Update arrow rotation to match flight direction
      if (proj.type === 'arrow') {
        const angle = Math.atan2(proj.vy, proj.vx);
        proj.sprite.setRotation(angle);
      }
    }

    let hit = false;
    
    // Check collision with enemies
    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemyData = enemies[j];
      const enemyRadius = getEnemyRadius(enemyData.sizeScale);
      const dx = enemyData.enemy.x - proj.x;
      const dy = enemyData.enemy.y - proj.y;
      const dist = Math.hypot(dx, dy);
      
      if (dist <= enemyRadius + proj.radius) {
        const knockback = dist ? { x: dx / dist, y: dy / dist } : { x: 0, y: 0 };
        damageCallback(enemyData, proj.damage, knockback);
        hit = true;
        break;
      }
    }

    const outOfBounds =
      proj.x < bounds.minX ||
      proj.x > bounds.maxX ||
      proj.y < bounds.minY ||
      proj.y > bounds.maxY;

    if (hit || proj.rangeRemaining <= 0 || outOfBounds) {
      if (proj.sprite) proj.sprite.destroy();
      projectiles.splice(i, 1);
    }
  }
}

/**
 * Get enemy radius based on size scale
 * @param {number} sizeScale - Enemy size multiplier
 * @returns {number} Enemy collision radius
 * @example
 * const radius = getEnemyRadius(1.5);
 */
export function getEnemyRadius(sizeScale = 1) {
  return 14 * sizeScale;
}

/**
 * Apply damage to an enemy
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {Object} enemyData - Enemy data object
 * @param {number} damage - Damage amount
 * @param {Object} [knockback=null] - Knockback vector { x, y }
 * @param {Function} [onKillCallback=null] - Callback when enemy dies
 * @returns {boolean} True if enemy was killed
 * @example
 * damageEnemy(this, enemy, 25, { x: 0.5, y: 0.5 });
 */
export function damageEnemy(scene, enemyData, damage, knockback = null, onKillCallback = null) {
  if (!enemyData || !enemyData.enemy) return false;
  
  enemyData.enemy.hp = Math.max(0, enemyData.enemy.hp - damage);
  
  // Update health bar
  if (enemyData.healthBar) {
    enemyData.healthBar.width = (enemyData.enemy.hp / enemyData.enemy.maxHp) * 40 * enemyData.sizeScale;
  }
  
  // Flash effect
  createFlashTint(scene, enemyData.enemy, { tintColor: 0xff6666, duration: 80 });
  
  // Apply knockback
  if (knockback && enemyData.vx !== undefined && enemyData.vy !== undefined) {
    enemyData.vx += knockback.x;
    enemyData.vy += knockback.y;
  }

  // Check if killed
  if (enemyData.enemy.hp <= 0) {
    // Create blood splatter
    createBloodSplatter(scene, enemyData.enemy.x, enemyData.enemy.y);
    
    if (onKillCallback) {
      onKillCallback(enemyData);
    }
    
    return true;
  }
  
  return false;
}

/**
 * Apply damage to player
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {Object} character - Character data object
 * @param {Object} player - Player sprite/container
 * @param {number} damage - Damage amount
 * @param {Object} damageState - Damage cooldown state { nextDamageTime, damageCooldown }
 * @param {number} currentTime - Current timestamp
 * @param {Function} [onDeathCallback=null] - Callback when player dies
 * @returns {boolean} True if damage was applied
 * @example
 * damagePlayer(this, gameState.character, playerSprite, 15, damageState, this.time.now);
 */
export function damagePlayer(scene, character, player, damage, damageState, currentTime, onDeathCallback = null) {
  if (!character) return false;
  
  // Check cooldown
  if (currentTime < damageState.nextDamageTime) return false;
  
  damageState.nextDamageTime = currentTime + damageState.damageCooldown;
  
  character.hp = Math.max(0, character.hp - damage);
  
  // Flash effect on player
  flashPlayer(scene, player);
  
  if (character.hp <= 0 && onDeathCallback) {
    onDeathCallback();
    return true;
  }
  
  return true;
}

/**
 * Flash player red when damaged
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {Object} player - Player sprite/container
 * @returns {void}
 * @example
 * flashPlayer(this, playerSprite);
 */
export function flashPlayer(scene, player) {
  if (!player) return;
  
  const children = player.getChildren ? player.getChildren() : [player];
  
  children.forEach(child => {
    if (child.setTint) {
      child.setTint(0xff4444);
      scene.tweens.add({
        targets: child,
        tint: 0xffffff,
        duration: 120,
        ease: 'Sine.out'
      });
    }
  });
}

/**
 * Check if point is inside area of effect
 * @param {Object} point - Point { x, y }
 * @param {Object} center - AOE center { x, y }
 * @param {number} radius - AOE radius
 * @returns {boolean} True if point is inside AOE
 * @example
 * if (isInAOE({ x: enemyX, y: enemyY }, { x: playerX, y: playerY }, 100)) { }
 */
export function isInAOE(point, center, radius) {
  const dist = getDistance(point.x, point.y, center.x, center.y);
  return dist <= radius;
}

/**
 * Check if target is in melee cone (arc in front of attacker)
 * @param {Object} attacker - Attacker position { x, y }
 * @param {Object} target - Target position { x, y }
 * @param {Object} aim - Attack direction { x, y }
 * @param {number} range - Melee range
 * @param {number} [coneAngle=60] - Cone angle in degrees
 * @returns {boolean} True if target is in melee range
 * @example
 * if (isInMeleeCone(player, enemy, aimDirection, 70)) { hitEnemy(); }
 */
export function isInMeleeCone(attacker, target, aim, range, coneAngle = 60) {
  const dx = target.x - attacker.x;
  const dy = target.y - attacker.y;
  const dist = Math.hypot(dx, dy);
  
  if (dist > range || !dist) return false;
  
  // Calculate dot product to check if in cone
  const hitThreshold = Math.cos(Phaser.Math.DegToRad(coneAngle));
  const dot = (dx / dist) * aim.x + (dy / dist) * aim.y;
  
  return dot >= hitThreshold;
}

/**
 * Calculate knockback vector
 * @param {Object} from - Source position { x, y }
 * @param {Object} to - Target position { x, y }
 * @param {number} force - Knockback force multiplier
 * @returns {Object} Knockback vector { x, y }
 * @example
 * const knockback = calculateKnockback(playerPos, enemyPos, 0.8);
 */
export function calculateKnockback(from, to, force = 1.0) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy);
  
  if (!dist) return { x: 0, y: 0 };
  
  return {
    x: (dx / dist) * force,
    y: (dy / dist) * force
  };
}

/**
 * Check collision between circle and ellipse (for lava pools)
 * @param {Object} circle - Circle { x, y, radius }
 * @param {Object} ellipse - Ellipse { x, y, width, height }
 * @returns {boolean} True if colliding
 * @example
 * if (circleEllipseCollision(player, lavaPool)) { damagePlayer(); }
 */
export function circleEllipseCollision(circle, ellipse) {
  // Simple approach: check if circle center is inside ellipse
  const dx = circle.x - ellipse.x;
  const dy = circle.y - ellipse.y;
  const a = ellipse.width / 2;
  const b = ellipse.height / 2;
  
  return ((dx * dx) / (a * a)) + ((dy * dy) / (b * b)) <= 1;
}

/**
 * Calculate critical hit chance and damage
 * @param {number} baseDamage - Base damage amount
 * @param {number} [critChance=0.1] - Critical hit chance (0-1)
 * @param {number} [critMultiplier=2] - Critical damage multiplier
 * @returns {Object} { damage, isCrit }
 * @example
 * const result = calculateCritical(20, 0.15, 2.5);
 * if (result.isCrit) console.log('Critical hit!');
 */
export function calculateCritical(baseDamage, critChance = 0.1, critMultiplier = 2) {
  const isCrit = Math.random() < critChance;
  const damage = isCrit ? baseDamage * critMultiplier : baseDamage;
  
  return { damage, isCrit };
}

/**
 * Get all enemies within range
 * @param {Object} position - Center position { x, y }
 * @param {Array} enemies - Array of enemy objects
 * @param {number} range - Search range
 * @returns {Array} Array of enemies within range
 * @example
 * const nearbyEnemies = getEnemiesInRange({ x: playerX, y: playerY }, enemies, 200);
 */
export function getEnemiesInRange(position, enemies, range) {
  return enemies.filter(enemyData => {
    const dist = getDistance(position.x, position.y, enemyData.enemy.x, enemyData.enemy.y);
    return dist <= range;
  });
}

/**
 * Get nearest enemy to position
 * @param {Object} position - Center position { x, y }
 * @param {Array} enemies - Array of enemy objects
 * @returns {Object|null} Nearest enemy data or null
 * @example
 * const nearest = getNearestEnemy({ x: playerX, y: playerY }, enemies);
 */
export function getNearestEnemy(position, enemies) {
  if (!enemies || enemies.length === 0) return null;
  
  let nearest = null;
  let minDist = Infinity;
  
  enemies.forEach(enemyData => {
    const dist = getDistance(position.x, position.y, enemyData.enemy.x, enemyData.enemy.y);
    if (dist < minDist) {
      minDist = dist;
      nearest = enemyData;
    }
  });
  
  return nearest;
}
