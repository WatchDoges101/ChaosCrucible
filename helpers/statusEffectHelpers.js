/**
 * Status Effects Helpers
 * Buff system, cooldown management, status tracking
 * @module helpers/statusEffectHelpers
 */

/**
 * Get current damage multiplier from buffs
 * @param {Object} buffState - Buff state object
 * @param {number} currentTime - Current game time
 * @returns {number} Damage multiplier (1 = no buff)
 */
export function getDamageMultiplier(buffState, currentTime) {
  return currentTime < buffState.damageUntil ? 1.35 : 1;
}

/**
 * Get current cooldown scale from buffs
 * @param {Object} buffState - Buff state object
 * @param {number} currentTime - Current game time
 * @returns {number} Cooldown scale (0.7 = 30% faster)
 */
export function getCooldownScale(buffState, currentTime) {
  return currentTime < buffState.cooldownUntil ? 0.7 : 1;
}

/**
 * Get current speed multiplier from buffs
 * @param {Object} buffState - Buff state object
 * @param {number} currentTime - Current game time
 * @returns {number} Speed multiplier (1.25 = 25% faster)
 */
export function getSpeedMultiplier(buffState, currentTime) {
  return currentTime < buffState.speedUntil ? 1.25 : 1;
}

/**
 * Check if a cooldown is ready
 * @param {number} lastAttackTime - Last attack time
 * @param {number} cooldown - Cooldown duration in ms
 * @param {number} currentTime - Current game time
 * @returns {boolean} True if cooldown is ready
 */
export function isCooldownReady(lastAttackTime, cooldown, currentTime) {
  return currentTime >= lastAttackTime + cooldown;
}

/**
 * Apply damage cooldown
 * @param {number} currentTime - Current game time
 * @param {number} cooldown - Cooldown duration
 * @returns {number} Next damage time
 */
export function applyDamageCooldow(currentTime, cooldown) {
  return currentTime + cooldown;
}

/**
 * Activate fury buff
 * @param {Object} buffState - Buff state
 * @param {number} currentTime - Current game time
 * @param {number} duration - Buff duration in ms
 */
export function activateFuryBuff(buffState, currentTime, duration = 10000) {
  buffState.damageUntil = currentTime + duration;
}

/**
 * Activate time warp buff (cooldown reduction)
 * @param {Object} buffState - Buff state
 * @param {number} currentTime - Current game time
 * @param {number} duration - Buff duration in ms
 */
export function activateTimeWarpBuff(buffState, currentTime, duration = 8000) {
  buffState.cooldownUntil = currentTime + duration;
}

/**
 * Activate speed buff
 * @param {Object} buffState - Buff state
 * @param {number} currentTime - Current game time
 * @param {number} duration - Buff duration in ms
 */
export function activateSpeedBuff(buffState, currentTime, duration = 12000) {
  buffState.speedUntil = currentTime + duration;
}

/**
 * Get all active buffs
 * @param {Object} buffState - Buff state
 * @param {number} currentTime - Current game time
 * @returns {Array} Array of active buff info
 */
export function getActiveBuffs(buffState, currentTime) {
  const buffs = [];
  
  if (currentTime < buffState.damageUntil) {
    buffs.push({
      type: 'fury',
      name: 'Fury',
      remaining: buffState.damageUntil - currentTime,
      color: '#ffaa33',
      icon: '⚡'
    });
  }
  
  if (currentTime < buffState.cooldownUntil) {
    buffs.push({
      type: 'cooldown',
      name: 'Warp',
      remaining: buffState.cooldownUntil - currentTime,
      color: '#66ccff',
      icon: '⏱'
    });
  }
  
  if (currentTime < buffState.speedUntil) {
    buffs.push({
      type: 'speed',
      name: 'Speed',
      remaining: buffState.speedUntil - currentTime,
      color: '#ffff66',
      icon: '→'
    });
  }
  
  return buffs;
}

/**
 * Update shield value
 * @param {Object} shield - Shield object {value, max}
 * @param {number} damage - Damage amount
 * @returns {number} Remaining damage after shield
 */
export function applyShieldDamage(shield, damage) {
  if (shield.value > 0) {
    const absorbed = Math.min(shield.value, damage);
    shield.value -= absorbed;
    return damage - absorbed;
  }
  return damage;
}

/**
 * Add shield value
 * @param {Object} shield - Shield object {value, max}
 * @param {number} amount - Amount to add
 */
export function addShield(shield, amount) {
  shield.value = Math.min(shield.max, shield.value + amount);
}

/**
 * Check if shield is active
 * @param {Object} shield - Shield object
 * @returns {boolean} True if shield has value
 */
export function hasActiveShield(shield) {
  return shield.value > 0;
}
