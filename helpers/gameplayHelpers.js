/**
 * Gameplay Helpers
 * Centralized functions for core game mechanics: movement, combat, enemy AI
 * @module helpers/gameplayHelpers
 */

/**
 * Update player position based on input
 * @param {Object} playerData - Player movement data
 * @param {Object} keys - Keyboard input keys
 * @param {number} speedMultiplier - Speed buff multiplier
 * @param {number} arenaWidth - Arena width
 * @param {number} arenaHeight - Arena height
 * @param {number} padding - Arena padding
 * @returns {Object} Updated position {x, y}
 */
export function updatePlayerMovement(playerData, keys, speedMultiplier, arenaWidth, arenaHeight, padding) {
  let moveX = 0;
  let moveY = 0;

  if (keys.w?.isDown) moveY -= 1;
  if (keys.s?.isDown) moveY += 1;
  if (keys.a?.isDown) moveX -= 1;
  if (keys.d?.isDown) moveX += 1;

  if (moveX !== 0 || moveY !== 0) {
    const length = Math.sqrt(moveX * moveX + moveY * moveY);
    const speed = playerData.speed * speedMultiplier;
    moveX = (moveX / length) * speed;
    moveY = (moveY / length) * speed;
  }

  let newX = playerData.x + moveX;
  let newY = playerData.y + moveY;

  // Clamp to arena bounds
  newX = Math.max(padding, Math.min(arenaWidth - padding, newX));
  newY = Math.max(padding, Math.min(arenaHeight - padding, newY));

  return { x: newX, y: newY, moveX, moveY };
}

/**
 * Determine player facing direction based on movement
 * @param {number} moveY - Current Y movement
 * @param {number} moveX - Current X movement
 * @param {string} currentFacing - Current facing direction
 * @returns {string} New facing direction ('up', 'down', 'left', 'right')
 */
export function updatePlayerFacing(moveY, moveX, currentFacing) {
  if (moveY < 0) return 'up';
  if (moveY > 0) return 'down';
  if (moveX < 0) return 'left';
  if (moveX > 0) return 'right';
  return currentFacing;
}

/**
 * Get aim direction from mouse/touch position or use facing direction
 * @param {number} targetX - Target X position
 * @param {number} targetY - Target Y position
 * @param {number} playerX - Player X position
 * @param {number} playerY - Player Y position
 * @param {string} facingDirection - Current facing direction
 * @returns {Object} Normalized aim direction {x, y}
 */
export function getAimDirection(targetX, targetY, playerX, playerY, facingDirection) {
  if (typeof targetX !== 'number' || typeof targetY !== 'number') {
    return getFacingVector(facingDirection);
  }

  const dx = targetX - playerX;
  const dy = targetY - playerY;
  const len = Math.hypot(dx, dy);
  if (!len) return getFacingVector(facingDirection);
  return { x: dx / len, y: dy / len };
}

/**
 * Get direction vector from facing string
 * @param {string} facing - Facing direction
 * @returns {Object} Direction vector {x, y}
 */
export function getFacingVector(facing) {
  switch (facing) {
    case 'up': return { x: 0, y: -1 };
    case 'down': return { x: 0, y: 1 };
    case 'left': return { x: -1, y: 0 };
    case 'right': return { x: 1, y: 0 };
    default: return { x: 0, y: 1 };
  }
}

/**
 * Update enemy AI movement toward player
 * @param {Object} enemyData - Enemy data
 * @param {number} playerX - Player X position
 * @param {number} playerY - Player Y position
 * @param {number} maxSpeed - Max enemy speed
 * @param {number} steerStrength - AI steer strength (0-1)
 */
export function updateEnemyMovement(enemyData, playerX, playerY, maxSpeed, steerStrength = 0.02) {
  const dx = playerX - enemyData.enemy.x;
  const dy = playerY - enemyData.enemy.y;
  const dist = Math.hypot(dx, dy) || 1;

  // Light steering toward player
  enemyData.vx += (dx / dist) * steerStrength;
  enemyData.vy += (dy / dist) * steerStrength;

  // Clamp speed
  const speed = Math.hypot(enemyData.vx, enemyData.vy) || 1;
  if (speed > maxSpeed) {
    enemyData.vx = (enemyData.vx / speed) * maxSpeed;
    enemyData.vy = (enemyData.vy / speed) * maxSpeed;
  }

  // Apply movement
  enemyData.enemy.x += enemyData.vx;
  enemyData.enemy.y += enemyData.vy;
}

/**
 * Handle enemy bouncing off arena bounds
 * @param {Object} enemyData - Enemy data
 * @param {number} minX - Arena min X
 * @param {number} maxX - Arena max X
 * @param {number} minY - Arena min Y
 * @param {number} maxY - Arena max Y
 */
export function handleEnemyBoundBounce(enemyData, minX, maxX, minY, maxY) {
  if (enemyData.enemy.x <= minX || enemyData.enemy.x >= maxX) {
    enemyData.vx *= -1;
    enemyData.enemy.x = Math.max(minX, Math.min(maxX, enemyData.enemy.x));
  }

  if (enemyData.enemy.y <= minY || enemyData.enemy.y >= maxY) {
    enemyData.vy *= -1;
    enemyData.enemy.y = Math.max(minY, Math.min(maxY, enemyData.enemy.y));
  }
}

/**
 * Get enemy collision radius based on size scale
 * @param {number} sizeScale - Size scale multiplier
 * @returns {number} Collision radius
 */
export function getEnemyRadius(sizeScale) {
  return 14 * sizeScale;
}

/**
 * Calculate distance between two points
 * @param {number} x1 - First X
 * @param {number} y1 - First Y
 * @param {number} x2 - Second X
 * @param {number} y2 - Second Y
 * @returns {number} Distance
 */
export function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

/**
 * Check if point is in ellipse
 * @param {number} px - Point X
 * @param {number} py - Point Y
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} width - Ellipse width
 * @param {number} height - Ellipse height
 * @returns {boolean} True if point is in ellipse
 */
export function isPointInEllipse(px, py, cx, cy, width, height) {
  const dx = Math.abs(px - cx);
  const dy = Math.abs(py - cy);
  const normalizedDist = (dx * dx) / ((width / 2) * (width / 2)) + 
                         (dy * dy) / ((height / 2) * (height / 2));
  return normalizedDist <= 1;
}

/**
 * Check melee cone attack hit
 * @param {Object} aim - Aim direction {x, y}
 * @param {number} playerX - Player X
 * @param {number} playerY - Player Y
 * @param {number} enemyX - Enemy X
 * @param {number} enemyY - Enemy Y
 * @param {number} range - Attack range
 * @param {number} coneAngle - Cone angle in degrees (default 60)
 * @returns {boolean} True if hit
 */
export function isInMeleeCone(aim, playerX, playerY, enemyX, enemyY, range, coneAngle = 60) {
  const dx = enemyX - playerX;
  const dy = enemyY - playerY;
  const dist = Math.hypot(dx, dy);
  
  if (dist > range || !dist) return false;
  
  // Check if enemy is within cone angle
  const hitThreshold = Math.cos(Phaser.Math.DegToRad(coneAngle / 2));
  const dot = (dx / dist) * aim.x + (dy / dist) * aim.y;
  
  return dot >= hitThreshold;
}
