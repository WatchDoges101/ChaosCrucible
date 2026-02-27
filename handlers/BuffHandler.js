/**
 * BuffHandler
 * Manages player buffs, debuffs, and shield states with UI
 */
export class BuffHandler {
	/**
	 * @param {Phaser.Scene} scene - The game scene
	 * @param {Object} options - Configuration options
	 */
	constructor(scene, options = {}) {
		this.scene = scene;
		
		// Buff configuration
		this.config = {
			damageMultiplier: options.damageMultiplier || 1.35,
			cooldownScale: options.cooldownScale || 0.7,
			speedMultiplier: options.speedMultiplier || 1.25,
			...options
		};
		
		// Buff state tracking
		this.state = {
			damageUntil: 0,
			cooldownUntil: 0,
			speedUntil: 0
		};
		
		// Shield state
		this.shield = {
			value: 0,
			max: options.maxShield || 60
		};
		
		// UI references
		this.ui = {
			shieldPanelBg: null,
			shieldPanelBorder: null,
			shieldIcon: null,
			shieldText: null,
			activeBuffPanels: []
		};
	}
	
	/**
	 * Create buff UI elements
	 * @param {number} x - Base X position
	 * @param {number} y - Base Y position
	 * @param {Phaser.Cameras.Scene2D.Camera} uiCamera - UI camera to use
	 */
	createUI(x, y, uiCamera) {
		// Shield indicator panel
		this.ui.shieldPanelBg = this.scene.add.rectangle(x + 35, y + 5, 60, 28, 0x001a33, 0.8);
		this.ui.shieldPanelBg.setOrigin(0, 0.5);
		
		this.ui.shieldPanelBorder = this.scene.add.rectangle(x + 35, y + 5, 60, 28);
		this.ui.shieldPanelBorder.setOrigin(0, 0.5);
		this.ui.shieldPanelBorder.setStrokeStyle(2, 0x88ccff);
		this.ui.shieldPanelBorder.setFillStyle(0, 0);
		
		this.ui.shieldIcon = this.scene.add.text(x + 42, y + 5, '⬡', {
			font: 'bold 16px Arial',
			fill: '#88ccff'
		});
		this.ui.shieldIcon.setOrigin(0.5, 0.5);
		
		this.ui.shieldText = this.scene.add.text(x + 58, y + 5, '0/60', {
			font: 'bold 11px Arial',
			fill: '#88ccff',
			stroke: '#000000',
			strokeThickness: 2
		});
		this.ui.shieldText.setOrigin(0.5, 0.5);
		
		// Active buffs panel (up to 3 active buffs)
		for (let i = 0; i < 3; i++) {
			const buffX = x + 135 + i * 85;
			const buffBg = this.scene.add.rectangle(buffX, y + 5, 80, 28, 0x1a1a1a, 0.9);
			buffBg.setOrigin(0, 0.5);
			buffBg.setStrokeStyle(2, 0x666666);
			
			const buffIcon = this.scene.add.text(buffX + 8, y + 5, '●', {
				font: 'bold 14px Arial',
				fill: '#ffffff'
			});
			buffIcon.setOrigin(0.5, 0.5);
			
			const buffName = this.scene.add.text(buffX + 25, y - 2, '', {
				font: 'bold 10px Arial',
				fill: '#ffffff'
			});
			buffName.setOrigin(0, 0.5);
			
			const buffTimeBg = this.scene.add.rectangle(buffX + 25, y + 10, 50, 4, 0x000000, 0.9);
			buffTimeBg.setOrigin(0, 0.5);
			
			const buffTimeBar = this.scene.add.rectangle(buffX + 25, y + 10, 50, 4, 0x00ff00, 1);
			buffTimeBar.setOrigin(0, 0.5);
			
			const buffTimeText = this.scene.add.text(buffX + 78, y + 5, '0s', {
				font: 'bold 9px Arial',
				fill: '#cccccc'
			});
			buffTimeText.setOrigin(1, 0.5);
			
			this.ui.activeBuffPanels.push({
				bg: buffBg,
				icon: buffIcon,
				name: buffName,
				timeBg: buffTimeBg,
				timeBar: buffTimeBar,
				timeText: buffTimeText,
				visible: false,
				type: null
			});
		}
		
		// Hide from main camera
		if (uiCamera) {
			const elements = [
				this.ui.shieldPanelBg,
				this.ui.shieldPanelBorder,
				this.ui.shieldIcon,
				this.ui.shieldText
			];
			
			this.ui.activeBuffPanels.forEach(panel => {
				elements.push(panel.bg, panel.icon, panel.name, panel.timeBg, panel.timeBar, panel.timeText);
			});
			
			elements.forEach(element => this.scene.cameras.main.ignore(element));
		}
	}
	
	/**
	 * Apply damage buff
	 * @param {number} duration - Duration in milliseconds
	 */
	applyDamageBuff(duration) {
		this.state.damageUntil = this.scene.time.now + duration;
	}
	
	/**
	 * Apply cooldown reduction buff
	 * @param {number} duration - Duration in milliseconds
	 */
	applyCooldownBuff(duration) {
		this.state.cooldownUntil = this.scene.time.now + duration;
	}
	
	/**
	 * Apply speed buff
	 * @param {number} duration - Duration in milliseconds
	 */
	applySpeedBuff(duration) {
		this.state.speedUntil = this.scene.time.now + duration;
	}
	
	/**
	 * Add shield points
	 * @param {number} amount - Amount to add
	 */
	addShield(amount) {
		this.shield.value = Math.min(this.shield.value + amount, this.shield.max);
	}
	
	/**
	 * Consume shield to absorb damage
	 * @param {number} damage - Incoming damage
	 * @returns {number} - Remaining damage after shield
	 */
	absorbDamage(damage) {
		if (this.shield.value > 0) {
			const absorbed = Math.min(damage, this.shield.value);
			this.shield.value -= absorbed;
			return damage - absorbed;
		}
		return damage;
	}
	
	/**
	 * Get damage multiplier
	 * @param {number} time - Current time
	 * @returns {number}
	 */
	getDamageMultiplier(time = this.scene.time.now) {
		return time < this.state.damageUntil ? this.config.damageMultiplier : 1;
	}
	
	/**
	 * Get cooldown scale
	 * @param {number} time - Current time
	 * @returns {number}
	 */
	getCooldownScale(time = this.scene.time.now) {
		return time < this.state.cooldownUntil ? this.config.cooldownScale : 1;
	}
	
	/**
	 * Get speed multiplier
	 * @param {number} time - Current time
	 * @returns {number}
	 */
	getSpeedMultiplier(time = this.scene.time.now) {
		return time < this.state.speedUntil ? this.config.speedMultiplier : 1;
	}
	
	/**
	 * Update buff UI - call every frame
	 * @param {number} time - Current time
	 */
	updateUI(time) {
		// Update shield display
		if (this.ui.shieldText) {
			this.ui.shieldText.setText(`${Math.round(this.shield.value)}/${this.shield.max}`);
		}
		
		// Update active buffs
		const activeBuffs = [];
		
		if (time < this.state.damageUntil) {
			activeBuffs.push({
				type: 'damage',
				icon: '⚔',
				name: 'Fury',
				color: 0xffaa33,
				remaining: this.state.damageUntil - time,
				total: 10000
			});
		}
		
		if (time < this.state.cooldownUntil) {
			activeBuffs.push({
				type: 'cooldown',
				icon: '⏱',
				name: 'Time',
				color: 0x66ccff,
				remaining: this.state.cooldownUntil - time,
				total: 8000
			});
		}
		
		if (time < this.state.speedUntil) {
			activeBuffs.push({
				type: 'speed',
				icon: '⚡',
				name: 'Speed',
				color: 0x44ff44,
				remaining: this.state.speedUntil - time,
				total: 6000
			});
		}
		
		// Update panels
		this.ui.activeBuffPanels.forEach((panel, idx) => {
			if (idx < activeBuffs.length) {
				const buff = activeBuffs[idx];
				
				// Show panel if not visible
				if (!panel.visible) {
					panel.bg.setVisible(true);
					panel.icon.setVisible(true);
					panel.name.setVisible(true);
					panel.timeBg.setVisible(true);
					panel.timeBar.setVisible(true);
					panel.timeText.setVisible(true);
					panel.visible = true;
				}
				
				// Update content
				panel.icon.setText(buff.icon);
				panel.icon.setColor(`#${buff.color.toString(16).padStart(6, '0')}`);
				panel.name.setText(buff.name);
				panel.timeText.setText(`${Math.ceil(buff.remaining / 1000)}s`);
				
				// Update time bar
				const timePercent = buff.remaining / buff.total;
				panel.timeBar.width = 50 * timePercent;
				
				// Color based on time remaining
				if (timePercent > 0.5) {
					panel.timeBar.setFillStyle(0x00ff00);
				} else if (timePercent > 0.25) {
					panel.timeBar.setFillStyle(0xffaa00);
				} else {
					panel.timeBar.setFillStyle(0xff0000);
				}
				
				panel.type = buff.type;
			} else if (panel.visible) {
				// Hide panel
				panel.bg.setVisible(false);
				panel.icon.setVisible(false);
				panel.name.setVisible(false);
				panel.timeBg.setVisible(false);
				panel.timeBar.setVisible(false);
				panel.timeText.setVisible(false);
				panel.visible = false;
				panel.type = null;
			}
		});
	}
	
	/**
	 * Clear all buffs
	 */
	clear() {
		this.state.damageUntil = 0;
		this.state.cooldownUntil = 0;
		this.state.speedUntil = 0;
		this.shield.value = 0;
	}
	
	/**
	 * Cleanup UI elements
	 */
	destroyUI() {
		if (this.ui.shieldPanelBg) this.ui.shieldPanelBg.destroy();
		if (this.ui.shieldPanelBorder) this.ui.shieldPanelBorder.destroy();
		if (this.ui.shieldIcon) this.ui.shieldIcon.destroy();
		if (this.ui.shieldText) this.ui.shieldText.destroy();
		
		this.ui.activeBuffPanels.forEach(panel => {
			panel.bg.destroy();
			panel.icon.destroy();
			panel.name.destroy();
			panel.timeBg.destroy();
			panel.timeBar.destroy();
			panel.timeText.destroy();
		});
		
		this.ui.activeBuffPanels = [];
	}
}
