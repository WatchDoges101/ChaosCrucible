/**
 * WaveHandler
 * Manages wave-based enemy spawning with progressive difficulty scaling
 * 
 * Features:
 * - Progressive difficulty with randomization
 * - Elite enemy chance scaling
 * - Wave completion tracking
 * - Automatic wave progression
 */
export class WaveHandler {
	/**
	 * @param {Phaser.Scene} scene - The game scene
	 * @param {Object} options - Configuration options
	 */
	constructor(scene, options = {}) {
		this.scene = scene;
		
		// Wave state tracking
		this.state = {
			currentWave: 0,
			enemiesKilledThisWave: 0,
			totalEnemiesThisWave: 0,
			waveInProgress: false,
			nextWaveTimer: null,
			waveStartDelay: options.waveStartDelay || 3000 // 3 seconds between waves
		};
		
		// Difficulty configuration
		this.difficulty = {
			baseEnemies: options.baseEnemies || 5,
			enemiesPerWave: options.enemiesPerWave || 2.5,
			eliteChancePerWave: options.eliteChancePerWave || 0.08, // 8% increase per wave
			variation: options.variation || 0.3 // 30% randomization
		};
		
		// Enemy spawn callbacks (set by scene)
		this.spawnCallbacks = {
			slime: null,
			devil: null,
			skeleton: null,
			frost_wraith: null,
			bomber_beetle: null,
			storm_mage: null
		};
	}
	
	/**
	 * Register enemy spawn callbacks
	 * @param {Object} callbacks - Object mapping enemy types to spawn functions
	 */
	registerSpawnCallbacks(callbacks) {
		this.spawnCallbacks = { ...this.spawnCallbacks, ...callbacks };
	}
	
	/**
	 * Start a new wave with randomized enemies and progressive difficulty
	 * @param {number} waveNumber - The wave number to start
	 * @returns {Object} Wave composition data
	 */
	startWave(waveNumber) {
		this.state.currentWave = waveNumber;
		this.state.enemiesKilledThisWave = 0;
		this.state.waveInProgress = true;
		
		// Calculate base number of enemies with exponential growth
		const baseCount = this.difficulty.baseEnemies;
		const growthRate = this.difficulty.enemiesPerWave;
		const baseEnemies = Math.floor(baseCount + (waveNumber - 1) * growthRate);
		
		// Add randomization (±variation%)
		const variation = this.difficulty.variation;
		const randomFactor = 1 + (Math.random() * variation * 2 - variation);
		const totalEnemies = Math.max(3, Math.floor(baseEnemies * randomFactor));
		
		// Calculate elite enemy chance (increases with waves, capped at 70%)
		const eliteChance = Math.min(0.7, waveNumber * this.difficulty.eliteChancePerWave);
		
		// Distribute enemies randomly based on difficulty
		const enemyCounts = this.calculateEnemyDistribution(totalEnemies, eliteChance, waveNumber);
		
		// Spawn enemies using registered callbacks
		this.spawnEnemies(enemyCounts);
		
		// Set total for tracking
		this.state.totalEnemiesThisWave = Object.values(enemyCounts).reduce((sum, count) => sum + count, 0);
		
		return {
			waveNumber,
			enemyCounts,
			totalEnemies: this.state.totalEnemiesThisWave
		};
	}
	
	/**
	 * Calculate enemy type distribution for a wave
	 * @param {number} totalEnemies - Total number of enemies to spawn
	 * @param {number} eliteChance - Chance for elite enemies (0-1)
	 * @param {number} waveNumber - Current wave number
	 * @returns {Object} Enemy counts by type
	 */
	calculateEnemyDistribution(totalEnemies, eliteChance, waveNumber) {
		const enemyCounts = {
			slime: 0,
			devil: 0,
			skeleton: 0,
			frost_wraith: 0,
			bomber_beetle: 0,
			storm_mage: 0
		};
		
		// Roll for each enemy slot
		for (let i = 0; i < totalEnemies; i++) {
			const roll = Math.random();
			
			if (roll < eliteChance * 0.3) {
				// Devil (rarest, most dangerous)
				enemyCounts.devil++;
			} else if (roll < eliteChance * 0.7) {
				// Skeleton (medium)
				enemyCounts.skeleton++;
			} else {
				// Slime (common)
				enemyCounts.slime++;
			}
		}
		
		// Ensure variety in higher waves
		if (waveNumber >= 3 && enemyCounts.devil === 0) {
			const transferCount = Math.floor(Math.random() * 2) + 1;
			enemyCounts.devil = transferCount;
			enemyCounts.slime = Math.max(0, enemyCounts.slime - transferCount);
		}
		
		if (waveNumber >= 2 && enemyCounts.skeleton === 0) {
			const transferCount = Math.floor(Math.random() * 2) + 1;
			enemyCounts.skeleton = transferCount;
			enemyCounts.slime = Math.max(0, enemyCounts.slime - transferCount);
		}
		
		return enemyCounts;
	}
	
	/**
	 * Spawn enemies using registered callbacks
	 * @param {Object} enemyCounts - Enemy counts by type
	 */
	spawnEnemies(enemyCounts) {
		Object.entries(enemyCounts).forEach(([type, count]) => {
			const callback = this.spawnCallbacks[type];
			if (callback && count > 0) {
				for (let i = 0; i < count; i++) {
					callback();
				}
			}
		});
	}
	
	/**
	 * Register an enemy kill
	 * @returns {boolean} True if wave is complete
	 */
	registerKill() {
		if (this.state.waveInProgress) {
			this.state.enemiesKilledThisWave++;
		}
		return this.checkCompletion();
	}
	
	/**
	 * Check if the current wave is complete
	 * @param {number} remainingEnemies - Number of enemies still alive
	 * @returns {boolean} True if wave is complete
	 */
	checkCompletion(remainingEnemies = 0) {
		if (!this.state.waveInProgress) return false;
		
		if (remainingEnemies === 0) {
			this.state.waveInProgress = false;
			return true;
		}
		
		return false;
	}
	
	/**
	 * Schedule the next wave to start after a delay
	 * @param {Function} onNextWave - Callback when next wave starts
	 */
	scheduleNextWave(onNextWave) {
		if (this.state.nextWaveTimer) {
			this.state.nextWaveTimer.destroy();
		}
		
		this.state.nextWaveTimer = this.scene.time.delayedCall(
			this.state.waveStartDelay,
			() => {
				if (onNextWave) {
					onNextWave(this.state.currentWave + 1);
				}
			}
		);
	}
	
	/**
	 * Get wave progress information
	 * @returns {Object} Wave progress data
	 */
	getProgress() {
		return {
			currentWave: this.state.currentWave,
			enemiesKilled: this.state.enemiesKilledThisWave,
			totalEnemies: this.state.totalEnemiesThisWave,
			inProgress: this.state.waveInProgress,
			nextWaveTimer: this.state.nextWaveTimer
		};
	}
	
	/**
	 * Get formatted progress text for UI
	 * @param {number} remainingEnemies - Number of enemies still alive
	 * @returns {string} Formatted wave text
	 */
	getProgressText(remainingEnemies) {
		if (this.state.waveInProgress) {
			return `Wave: ${this.state.currentWave} (${this.state.enemiesKilledThisWave}/${this.state.totalEnemiesThisWave})`;
		} else if (this.state.nextWaveTimer) {
			const remaining = Math.ceil(this.state.nextWaveTimer.getRemaining() / 1000);
			return `Next Wave in ${remaining}s`;
		} else {
			return `Wave: ${this.state.currentWave}`;
		}
	}
	
	/**
	 * Clean up wave handler resources
	 */
	destroy() {
		if (this.state.nextWaveTimer) {
			this.state.nextWaveTimer.destroy();
			this.state.nextWaveTimer = null;
		}
	}
}
