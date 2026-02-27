/**
 * ProjectileHandler
 * Manages player and enemy projectiles with collision detection
 */
export class ProjectileHandler {
	/**
	 * @param {Phaser.Scene} scene - The game scene
	 */
	constructor(scene) {
		this.scene = scene;
		this.playerProjectiles = [];
		this.enemyProjectiles = [];
	}
	
	/**
	 * Spawn a player projectile
	 * @param {Object} config - Projectile configuration
	 */
	spawnPlayerProjectile(config) {
		const {
			x, y, vx, vy, 
			damage = 10, 
			color = 0xffdd55, 
			radius = 3, 
			range = 500,
			type = 'basic'
		} = config;
		
		// Create visual
		const sprite = this.scene.add.circle(x, y, radius, color, 1);
		
		// Add glow effect
		const glow = this.scene.add.circle(x, y, radius * 1.8, color, 0.4);
		
		// Ignore UI camera
		if (this.scene.uiCamera) {
			this.scene.uiCamera.ignore([sprite, glow]);
		}
		
		// Pulsing glow animation
		this.scene.tweens.add({
			targets: glow,
			scale: 1.3,
			alpha: 0.2,
			duration: 200,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.inOut'
		});
		
		this.playerProjectiles.push({
			sprite,
			glow,
			x, y, vx, vy,
			damage,
			radius,
			range,
			rangeRemaining: range,
			type
		});
	}
	
	/**
	 * Spawn an enemy projectile
	 * @param {Object} config - Projectile configuration
	 */
	spawnEnemyProjectile(config) {
		const {
			x, y, dirX, dirY,
			speed = 3.5,
			damage = 8,
			radius = 8,
			range = 420,
			visual = 'arrow'
		} = config;
		
		let sprite;
		
		if (visual === 'arrow') {
			// Flaming arrow visual
			const arrow = this.scene.add.graphics();
			arrow.lineStyle(2, 0xff6600, 1);
			arrow.lineBetween(-6, 0, 2, 0);
			arrow.fillStyle(0xffaa33, 1);
			arrow.fillTriangleShape(new Phaser.Geom.Triangle(2, 0, 5, -2, 5, 2));
			
			const flame = this.scene.add.circle(0, 0, 3, 0xff4400, 0.7);
			sprite = this.scene.add.container(x, y, [arrow, flame]);
			sprite.setRotation(Math.atan2(dirY, dirX));
			
			if (this.scene.uiCamera) {
				this.scene.uiCamera.ignore([sprite, arrow, flame]);
			}
			
			// Flickering flame
			this.scene.tweens.add({
				targets: flame,
				alpha: { from: 0.5, to: 0.9 },
				scale: { from: 0.8, to: 1.2 },
				duration: 200,
				yoyo: true,
				repeat: -1
			});
		} else {
			// Generic projectile
			sprite = this.scene.add.circle(x, y, radius, 0xff4400, 0.9);
			
			if (this.scene.uiCamera) {
				this.scene.uiCamera.ignore(sprite);
			}
		}
		
		this.enemyProjectiles.push({
			sprite,
			x, y,
			vx: dirX * speed,
			vy: dirY * speed,
			damage,
			radius,
			rangeRemaining: range,
			visual
		});
	}
	
	/**
	 * Update player projectiles
	 * @param {number} deltaScale - Delta time scale
	 * @param {Array} enemies - Array of enemies to check collision
	 * @param {Function} onHit - Callback when projectile hits enemy
	 */
	updatePlayerProjectiles(deltaScale, enemies, onHit) {
		for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
			const proj = this.playerProjectiles[i];
			
			// Move projectile
			const stepX = proj.vx * deltaScale;
			const stepY = proj.vy * deltaScale;
			proj.x += stepX;
			proj.y += stepY;
			proj.sprite.x = proj.x;
			proj.sprite.y = proj.y;
			
			if (proj.glow) {
				proj.glow.x = proj.x;
				proj.glow.y = proj.y;
			}
			
			proj.rangeRemaining -= Math.hypot(stepX, stepY);
			
			// Check collision with enemies
			let hit = false;
			for (const enemy of enemies) {
				if (!enemy.enemy) continue;
				
				const dx = proj.x - enemy.enemy.x;
				const dy = proj.y - enemy.enemy.y;
				const dist = Math.hypot(dx, dy);
				const enemyRadius = this.getEnemyRadius(enemy.sizeScale);
				
				if (dist < proj.radius + enemyRadius) {
					if (onHit) {
						onHit(enemy, proj.damage);
					}
					hit = true;
					break;
				}
			}
			
			// Remove if hit or out of range
			if (hit || proj.rangeRemaining <= 0) {
				if (hit) {
					this.createImpactEffect(proj.x, proj.y, proj.radius, proj.sprite.fillColor);
				}
				this.removePlayerProjectile(i);
			}
		}
	}
	
	/**
	 * Update enemy projectiles
	 * @param {number} deltaScale - Delta time scale
	 * @param {Object} player - Player data object
	 * @param {Function} onHit - Callback when projectile hits player
	 */
	updateEnemyProjectiles(deltaScale, player, onHit) {
		for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
			const proj = this.enemyProjectiles[i];
			
			// Move projectile
			const stepX = proj.vx * deltaScale;
			const stepY = proj.vy * deltaScale;
			proj.x += stepX;
			proj.y += stepY;
			proj.sprite.x = proj.x;
			proj.sprite.y = proj.y;
			proj.rangeRemaining -= Math.hypot(stepX, stepY);
			
			// Check collision with player
			const hitPlayer = player && Math.hypot(proj.x - player.x, proj.y - player.y) < (proj.radius + 12);
			
			if (hitPlayer) {
				if (onHit) {
					onHit(proj.damage);
				}
				this.createImpactEffect(proj.x, proj.y, proj.radius, 0xff6600);
				this.removeEnemyProjectile(i);
			} else if (proj.rangeRemaining <= 0) {
				this.removeEnemyProjectile(i);
			}
		}
	}
	
	/**
	 * Create impact effect for projectile hit
	 * @param {number} x - X position
	 * @param {number} y - Y position
	 * @param {number} radius - Effect radius
	 * @param {number} color - Effect color
	 */
	createImpactEffect(x, y, radius, color) {
		const burst = this.scene.add.circle(x, y, radius * 2, color, 0.8);
		
		if (this.scene.uiCamera) {
			this.scene.uiCamera.ignore(burst);
		}
		
		// Sparks
		for (let i = 0; i < 6; i++) {
			const angle = (i / 6) * Math.PI * 2;
			const spark = this.scene.add.circle(x, y, 2, color, 0.9);
			
			if (this.scene.uiCamera) {
				this.scene.uiCamera.ignore(spark);
			}
			
			this.scene.tweens.add({
				targets: spark,
				x: x + Math.cos(angle) * 20,
				y: y + Math.sin(angle) * 20,
				alpha: 0,
				duration: 280,
				onComplete: () => spark.destroy()
			});
		}
		
		// Expanding burst
		this.scene.tweens.add({
			targets: burst,
			scale: 2,
			alpha: 0,
			duration: 220,
			onComplete: () => burst.destroy()
		});
	}
	
	/**
	 * Remove player projectile at index
	 * @param {number} index - Index in array
	 */
	removePlayerProjectile(index) {
		const proj = this.playerProjectiles[index];
		if (!proj) return;
		
		proj.sprite.destroy();
		if (proj.glow) proj.glow.destroy();
		this.playerProjectiles.splice(index, 1);
	}
	
	/**
	 * Remove enemy projectile at index
	 * @param {number} index - Index in array
	 */
	removeEnemyProjectile(index) {
		const proj = this.enemyProjectiles[index];
		if (!proj) return;
		
		proj.sprite.destroy();
		this.enemyProjectiles.splice(index, 1);
	}
	
	/**
	 * Get enemy radius based on size scale
	 * @param {number} sizeScale - Size multiplier
	 * @returns {number}
	 */
	getEnemyRadius(sizeScale) {
		return 20 * (sizeScale || 1);
	}
	
	/**
	 * Clear all projectiles
	 */
	clear() {
		// Clear player projectiles
		this.playerProjectiles.forEach(proj => {
			proj.sprite.destroy();
			if (proj.glow) proj.glow.destroy();
		});
		this.playerProjectiles = [];
		
		// Clear enemy projectiles
		this.enemyProjectiles.forEach(proj => {
			proj.sprite.destroy();
		});
		this.enemyProjectiles = [];
	}
	
	/**
	 * Get projectile counts
	 * @returns {Object} - {player: number, enemy: number}
	 */
	getCounts() {
		return {
			player: this.playerProjectiles.length,
			enemy: this.enemyProjectiles.length
		};
	}
}
