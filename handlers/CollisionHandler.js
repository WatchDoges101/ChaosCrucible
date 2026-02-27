/**
 * CollisionHandler
 * Centralized collision detection and resolution
 */

import { isWithinDistance, distanceSquared } from '../helpers/performanceHelpers.js';

export class CollisionHandler {
	/**
	 * @param {Object} config - Configuration
	 */
	constructor(config = {}) {
		this.config = {
			playerRadius: config.playerRadius || 20,
			enemyRadiusBase: config.enemyRadiusBase || 20,
			...config
		};
		
		this.obstacles = [];
		this.lavaPools = [];
	}
	
	/**
	 * Set obstacles for collision checking
	 * @param {Array} obstacles - Array of obstacle objects with x, y, radius
	 */
	setObstacles(obstacles) {
		this.obstacles = obstacles;
	}
	
	/**
	 * Set lava pools for damage checking
	 * @param {Array} lavaPools - Array of lava pool objects
	 */
	setLavaPools(lavaPools) {
		this.lavaPools = lavaPools;
	}
	
	/**
	 * Resolve obstacle collision for an entity
	 * @param {number} x - Entity X position
	 * @param {number} y - Entity Y position
	 * @param {number} radius - Entity radius
	 * @returns {Object} - Adjusted position {x, y}
	 */
	resolveObstacleCollision(x, y, radius) {
		let adjustedX = x;
		let adjustedY = y;
		
		for (const obstacle of this.obstacles) {
			const dx = adjustedX - obstacle.x;
			const dy = adjustedY - obstacle.y;
			const dist = Math.hypot(dx, dy);
			const minDist = radius + obstacle.radius;
			
			if (dist < minDist && dist > 0) {
				// Push entity away from obstacle
				const pushDist = minDist - dist;
				adjustedX += (dx / dist) * pushDist;
				adjustedY += (dy / dist) * pushDist;
			}
		}
		
		return { x: adjustedX, y: adjustedY };
	}
	
	/**
	 * Check if entity is in lava
	 * @param {number} x - Entity X position
	 * @param {number} y - Entity Y position
	 * @returns {boolean}
	 */
	isInLava(x, y) {
		for (const lava of this.lavaPools) {
			const dx = x - lava.x;
			const dy = y - lava.y;
			const dist = Math.hypot(dx, dy);
			
			if (dist < lava.radius) {
				return true;
			}
		}
		return false;
	}
	
	/**
	 * Check collision between player and enemies
	 * @param {Object} player - Player object with x, y
	 * @param {Array} enemies - Array of enemy objects
	 * @returns {Array} - Array of colliding enemies
	 */
	checkPlayerEnemyCollision(player, enemies) {
		const collisions = [];
		const playerRadius = this.config.playerRadius;
		
		for (const enemy of enemies) {
			if (!enemy.enemy) continue;
			
			const enemyRadius = this.getEnemyRadius(enemy.sizeScale);
			const dx = enemy.enemy.x - player.x;
			const dy = enemy.enemy.y - player.y;
			const dist = Math.hypot(dx, dy);
			
			if (dist < playerRadius + enemyRadius) {
				collisions.push({
					enemy,
					distance: dist,
					dx,
					dy
				});
			}
		}
		
		return collisions;
	}
	
	/**
	 * Check if position is in melee range of target
	 * @param {number} sourceX - Source X
	 * @param {number} sourceY - Source Y
	 * @param {number} targetX - Target X
	 * @param {number} targetY - Target Y
	 * @param {number} range - Melee range
	 * @param {Object} direction - Direction vector {x, y}
	 * @param {number} coneAngle - Cone angle in degrees (default 120)
	 * @returns {boolean}
	 */
	isInMeleeCone(sourceX, sourceY, targetX, targetY, range, direction, coneAngle = 120) {
		const dx = targetX - sourceX;
		const dy = targetY - sourceY;
		const dist = Math.hypot(dx, dy);
		
		if (dist > range || dist === 0) return false;
		
		const dot = (dx / dist) * direction.x + (dy / dist) * direction.y;
		const threshold = Math.cos(Phaser.Math.DegToRad(coneAngle / 2));
		
		return dot >= threshold;
	}
	
	/**
	 * Get enemies within radius
	 * @param {number} x - Center X
	 * @param {number} y - Center Y
	 * @param {number} radius - Search radius
	 * @param {Array} enemies - Array of enemies
	 * @returns {Array} - Enemies within radius
	 */
	getEnemiesInRadius(x, y, radius, enemies) {
		const inRadius = [];
		
		for (const enemy of enemies) {
			if (!enemy.enemy) continue;
			
			if (isWithinDistance(x, y, enemy.enemy.x, enemy.enemy.y, radius)) {
				const dist = Math.hypot(enemy.enemy.x - x, enemy.enemy.y - y);
				inRadius.push({
					enemy,
					distance: dist
				});
			}
		}
		
		return inRadius;
	}
	
	/**
	 * Get enemy radius based on size scale
	 * @param {number} sizeScale - Enemy size multiplier
	 * @returns {number}
	 */
	getEnemyRadius(sizeScale) {
		return this.config.enemyRadiusBase * (sizeScale || 1);
	}
	
	/**
	 * Check projectile collision with enemies
	 * @param {number} projX - Projectile X
	 * @param {number} projY - Projectile Y
	 * @param {number} projRadius - Projectile radius
	 * @param {Array} enemies - Array of enemies
	 * @returns {Object|null} - Hit enemy or null
	 */
	checkProjectileEnemyCollision(projX, projY, projRadius, enemies) {
		for (const enemy of enemies) {
			if (!enemy.enemy) continue;
			
			const enemyRadius = this.getEnemyRadius(enemy.sizeScale);
			const distSq = distanceSquared(projX, projY, enemy.enemy.x, enemy.enemy.y);
			const minDistSq = (projRadius + enemyRadius) ** 2;
			
			if (distSq < minDistSq) {
				return enemy;
			}
		}
		return null;
	}
	
	/**
	 * Check projectile collision with player
	 * @param {number} projX - Projectile X
	 * @param {number} projY - Projectile Y
	 * @param {number} projRadius - Projectile radius
	 * @param {Object} player - Player object with x, y
	 * @returns {boolean}
	 */
	checkProjectilePlayerCollision(projX, projY, projRadius, player) {
		if (!player) return false;
		
		const distSq = distanceSquared(projX, projY, player.x, player.y);
		const minDistSq = (projRadius + this.config.playerRadius) ** 2;
		
		return distSq < minDistSq;
	}
	
	/**
	 * Clamp entity to bounds
	 * @param {Object} entity - Entity with x, y
	 * @param {Object} bounds - Bounds {minX, maxX, minY, maxY}
	 * @returns {Object} - Clamped position {x, y}
	 */
	clampToBounds(entity, bounds) {
		return {
			x: Phaser.Math.Clamp(entity.x, bounds.minX, bounds.maxX),
			y: Phaser.Math.Clamp(entity.y, bounds.minY, bounds.maxY)
		};
	}
	
	/**
	 * Clear all collision data
	 */
	clear() {
		this.obstacles = [];
		this.lavaPools = [];
	}
}
