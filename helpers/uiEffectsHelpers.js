/**
 * UI Effects Helpers
 * Helper functions for creating visual UI feedback effects
 * 
 * Includes:
 * - Floating damage numbers
 * - Floating score/points text
 * - Power-up collection text
 * - Wave notifications
 */

/**
 * Display floating damage text when a character takes damage
 * @param {Phaser.Scene} scene - The game scene
 * @param {number} x - World X coordinate
 * @param {number} y - World Y coordinate
 * @param {number} damage - Damage amount
 * @param {Phaser.Cameras.Scene2D.Camera} uiCamera - UI camera to ignore (optional)
 */
export function floatDamage(scene, x, y, damage, uiCamera = null) {
	// Round damage to integer for display
	const dmg = Math.round(damage);
	
	// Create text showing damage taken
	const damageText = scene.add.text(x, y, `-${dmg}`, {
		font: 'bold 28px Arial',
		fill: '#FF3333',
		stroke: '#990000',
		strokeThickness: 3
	});
	damageText.setOrigin(0.5, 0.5);
	damageText.setDepth(1001); // Above points
	damageText.setScale(1.2); // Start slightly larger
	
	// Make uiCamera ignore this text so it stays in world space
	if (uiCamera) {
		uiCamera.ignore(damageText);
	}
	
	// Add a random horizontal offset for visual variety
	const offsetX = (Math.random() - 0.5) * 30;
	
	// Animate the text with a bounce effect
	scene.tweens.add({
		targets: damageText,
		y: y - 60,
		x: x + offsetX,
		scale: 1.0,
		duration: 300,
		ease: 'Back.easeOut'
	});
	
	// Fade out after the bounce
	scene.tweens.add({
		targets: damageText,
		alpha: 0,
		delay: 200,
		duration: 400,
		ease: 'Quad.easeIn',
		onComplete: () => {
			damageText.destroy();
		}
	});
}

/**
 * Display floating point text when enemy is slain or objective completed
 * @param {Phaser.Scene} scene - The game scene
 * @param {number} x - World X coordinate
 * @param {number} y - World Y coordinate
 * @param {number} points - Points earned
 * @param {Phaser.Cameras.Scene2D.Camera} uiCamera - UI camera to ignore (optional)
 */
export function floatPoints(scene, x, y, points, uiCamera = null) {
	// Create text showing points earned
	const pointsText = scene.add.text(x, y, `+${points}`, {
		font: 'bold 24px Arial',
		fill: '#FFD700',
		stroke: '#FF8C00',
		strokeThickness: 2
	});
	pointsText.setOrigin(0.5, 0.5);
	pointsText.setDepth(1000); // Ensure it's on top
	
	// Make uiCamera ignore this text so it stays in world space
	if (uiCamera) {
		uiCamera.ignore(pointsText);
	}
	
	// Animate the text: move up and fade out
	scene.tweens.add({
		targets: pointsText,
		y: y - 80, // Float upward
		alpha: 0, // Fade out
		duration: 1200, // Animation lasts 1.2 seconds
		ease: 'Quad.easeOut',
		onComplete: () => {
			pointsText.destroy();
		}
	});
}

/**
 * Display floating text for powerup collection
 * @param {Phaser.Scene} scene - The game scene
 * @param {number} x - World X coordinate
 * @param {number} y - World Y coordinate
 * @param {string} text - Text to display
 * @param {string} color - Text color (hex string like '#ff6666')
 * @param {Phaser.Cameras.Scene2D.Camera} uiCamera - UI camera to ignore (optional)
 */
export function floatPowerupText(scene, x, y, text, color, uiCamera = null) {
	const label = scene.add.text(x, y - 18, text, {
		font: 'bold 18px Arial',
		fill: color,
		stroke: '#000000',
		strokeThickness: 3
	});
	label.setOrigin(0.5, 0.5);
	label.setDepth(1002);
	
	if (uiCamera) {
		uiCamera.ignore(label);
	}
	
	scene.tweens.add({
		targets: label,
		y: y - 60,
		alpha: 0,
		duration: 900,
		ease: 'Quad.easeOut',
		onComplete: () => label.destroy()
	});
}

/**
 * Show wave notification on screen with dramatic animation
 * @param {Phaser.Scene} scene - The game scene
 * @param {string} message - The message to display
 * @param {Phaser.Cameras.Scene2D.Camera} mainCamera - Main camera to ignore (optional)
 */
export function showWaveNotification(scene, message, mainCamera = null) {
	const gameConfig = scene.sys.game.config;
	const centerX = gameConfig.width / 2;
	const centerY = gameConfig.height / 2;
	
	const notification = scene.add.text(centerX, centerY - 100, message, {
		font: 'bold 48px Arial',
		fill: '#00FFFF',
		stroke: '#000000',
		strokeThickness: 6,
		align: 'center'
	});
	notification.setOrigin(0.5);
	notification.setAlpha(0);
	
	// Animate in and out
	scene.tweens.add({
		targets: notification,
		alpha: 1,
		duration: 500,
		ease: 'Power2',
		yoyo: true,
		hold: 1500,
		onComplete: () => {
			notification.destroy();
		}
	});
	
	// Scale animation
	scene.tweens.add({
		targets: notification,
		scale: { from: 0.5, to: 1.2 },
		duration: 500,
		ease: 'Back.easeOut',
		yoyo: true,
		hold: 1500
	});
	
	// Make sure notification is on UI camera only
	if (mainCamera) {
		mainCamera.ignore(notification);
	}
}

/**
 * Create a burst effect at a position (for powerup collection, etc.)
 * @param {Phaser.Scene} scene - The game scene
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} color - Color of the burst (hex number)
 * @param {Phaser.Cameras.Scene2D.Camera} uiCamera - UI camera to ignore (optional)
 */
export function createBurstEffect(scene, x, y, color, uiCamera = null) {
	const burst = scene.add.circle(x, y, 8, color, 0.8);
	if (uiCamera) {
		uiCamera.ignore(burst);
	}
	
	scene.tweens.add({
		targets: burst,
		scale: 2.2,
		alpha: 0,
		duration: 260,
		onComplete: () => burst.destroy()
	});
	
	// Sparks radiating outward
	for (let i = 0; i < 6; i++) {
		const angle = (i / 6) * Math.PI * 2;
		const spark = scene.add.circle(x, y, 2.5, color, 0.9);
		if (uiCamera) {
			uiCamera.ignore(spark);
		}
		
		scene.tweens.add({
			targets: spark,
			x: x + Math.cos(angle) * 26,
			y: y + Math.sin(angle) * 26,
			alpha: 0,
			duration: 320,
			onComplete: () => spark.destroy()
		});
	}
}

/**
 * Show healing effect with green numbers
 * @param {Phaser.Scene} scene - The game scene
 * @param {number} x - World X coordinate
 * @param {number} y - World Y coordinate
 * @param {number} healAmount - Amount healed
 * @param {Phaser.Cameras.Scene2D.Camera} uiCamera - UI camera to ignore (optional)
 */
export function floatHeal(scene, x, y, healAmount, uiCamera = null) {
	const healText = scene.add.text(x, y, `+${Math.round(healAmount)}`, {
		font: 'bold 28px Arial',
		fill: '#00FF00',
		stroke: '#006600',
		strokeThickness: 3
	});
	healText.setOrigin(0.5, 0.5);
	healText.setDepth(1001);
	healText.setScale(1.3);
	
	if (uiCamera) {
		uiCamera.ignore(healText);
	}
	
	scene.tweens.add({
		targets: healText,
		y: y - 50,
		scale: 1.0,
		duration: 300,
		ease: 'Back.easeOut'
	});
	
	scene.tweens.add({
		targets: healText,
		alpha: 0,
		delay: 200,
		duration: 400,
		ease: 'Quad.easeIn',
		onComplete: () => healText.destroy()
	});
}
