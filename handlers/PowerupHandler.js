/**
 * PowerupHandler
 * Manages powerup spawning, collection, effects, and UI
 */
export class PowerupHandler {
	/**
	 * @param {Phaser.Scene} scene - The game scene
	 * @param {Object} options - Configuration options
	 */
	constructor(scene, options = {}) {
		this.scene = scene;
		this.powerups = [];
		
		// Configuration
		this.config = {
			spawnInterval: options.spawnInterval || 3500,
			spawnChance: options.spawnChance || 0.45,
			guaranteedInterval: options.guaranteedInterval || 8000,
			maxPowerups: options.maxPowerups || 5,
			despawnTime: options.despawnTime || 18000,
			minPlayerDistance: options.minPlayerDistance || 260,
			...options
		};
		
		// Spawn state
		this.spawnState = {
			nextSpawnTime: 0,
			lastSpawnTime: 0,
			hasSpawned: false
		};
		
		// Powerup catalog
		this.catalog = {
			blood_orb: {
				name: 'Blood Orb',
				color: 0xff4d4d,
				healAmount: 30
			},
			fury_totem: {
				name: 'Fury Totem',
				color: 0xffaa33,
				duration: 10000
			},
			time_shard: {
				name: 'Time Shard',
				color: 0x66ccff,
				duration: 8000
			},
			iron_aegis: {
				name: 'Iron Aegis',
				color: 0x99ccff,
				shieldAmount: 40
			}
		};
	}
	
	/**
	 * Initialize the powerup handler
	 * @param {number} initialDelay - Delay before first spawn
	 */
	initialize(initialDelay = 2000) {
		this.spawnState.lastSpawnTime = this.scene.time.now;
		this.scheduleNextSpawn(initialDelay);
	}
	
	/**
	 * Schedule the next powerup spawn
	 * @param {number} delay - Delay in milliseconds
	 */
	scheduleNextSpawn(delay) {
		this.spawnState.nextSpawnTime = this.scene.time.now + delay;
	}
	
	/**
	 * Update powerup logic - call every frame
	 * @param {number} time - Current game time
	 * @param {Object} player - Player data object with x, y
	 * @param {Function} onPickup - Callback when powerup is picked up
	 */
	update(time, player, onPickup) {
		// Handle powerup spawning
		if (time >= this.spawnState.nextSpawnTime && this.powerups.length < this.config.maxPowerups) {
			const timeSinceLastSpawn = time - this.spawnState.lastSpawnTime;
			const shouldSpawn = timeSinceLastSpawn >= this.config.guaranteedInterval || 
			                   Math.random() < this.config.spawnChance;
			
			if (shouldSpawn) {
				this.spawn(player);
				this.spawnState.lastSpawnTime = time;
			}
			
			this.scheduleNextSpawn(this.config.spawnInterval);
		}
		
		// Update existing powerups
		for (let i = this.powerups.length - 1; i >= 0; i--) {
			const powerup = this.powerups[i];
			
			// Check if despawn time reached
			if (time >= powerup.despawnTime) {
				this.removePowerup(i);
				continue;
			}
			
			// Check for player pickup
			if (player) {
				const dx = powerup.sprite.x - player.x;
				const dy = powerup.sprite.y - player.y;
				const dist = Math.hypot(dx, dy);
				
				if (dist < 30) {
					if (onPickup) {
						onPickup(powerup.type, powerup.data);
					}
					this.removePowerup(i);
				}
			}
		}
	}
	
	/**
	 * Spawn a random powerup
	 * @param {Object} player - Player data for position checking
	 */
	spawn(player) {
		const types = Object.keys(this.catalog);
		const type = types[Math.floor(Math.random() * types.length)];
		const data = this.catalog[type];
		
		// Find spawn position away from player
		let x, y, attempts = 0;
		const bounds = this.config.bounds || { 
			minX: 200, maxX: 4800, 
			minY: 200, maxY: 4800 
		};
		
		do {
			x = Phaser.Math.Between(bounds.minX, bounds.maxX);
			y = Phaser.Math.Between(bounds.minY, bounds.maxY);
			attempts++;
		} while (
			player && 
			Math.hypot(x - player.x, y - player.y) < this.config.minPlayerDistance &&
			attempts < 10
		);
		
		// Create visual representation
		const sprite = this.scene.add.circle(x, y, 12, data.color, 0.8);
		const glow = this.scene.add.circle(x, y, 20, data.color, 0.3);
		const label = this.scene.add.text(x, y - 30, data.name, {
			font: 'bold 12px Arial',
			fill: '#ffffff',
			stroke: '#000000',
			strokeThickness: 3
		}).setOrigin(0.5);
		
		// Ignore UI camera if present
		if (this.scene.uiCamera) {
			this.scene.uiCamera.ignore([sprite, glow, label]);
		}
		
		// Floating animation
		this.scene.tweens.add({
			targets: [sprite, glow, label],
			y: '-=10',
			duration: 1200,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.inOut'
		});
		
		// Pulsing glow
		this.scene.tweens.add({
			targets: glow,
			scale: 1.2,
			alpha: 0.5,
			duration: 800,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.inOut'
		});
		
		// Add to array
		this.powerups.push({
			type,
			data,
			sprite,
			glow,
			label,
			spawnTime: this.scene.time.now,
			despawnTime: this.scene.time.now + this.config.despawnTime
		});
	}
	
	/**
	 * Remove powerup at index
	 * @param {number} index - Index in powerups array
	 */
	removePowerup(index) {
		const powerup = this.powerups[index];
		if (!powerup) return;
		
		// Create pickup effect
		const burst = this.scene.add.circle(
			powerup.sprite.x, 
			powerup.sprite.y, 
			16, 
			powerup.data.color, 
			0.8
		);
		
		if (this.scene.uiCamera) {
			this.scene.uiCamera.ignore(burst);
		}
		
		this.scene.tweens.add({
			targets: burst,
			scale: 2.5,
			alpha: 0,
			duration: 300,
			onComplete: () => burst.destroy()
		});
		
		// Destroy powerup objects
		powerup.sprite.destroy();
		powerup.glow.destroy();
		powerup.label.destroy();
		
		// Remove from array
		this.powerups.splice(index, 1);
	}
	
	/**
	 * Clear all powerups
	 */
	clear() {
		this.powerups.forEach(powerup => {
			powerup.sprite.destroy();
			powerup.glow.destroy();
			powerup.label.destroy();
		});
		this.powerups = [];
	}
	
	/**
	 * Get powerup count
	 * @returns {number}
	 */
	getCount() {
		return this.powerups.length;
	}
}
