/**
 * Animation Configuration Constants
 * 
 * Centralized animation configurations for tweens and visual effects.
 * Used throughout the game for consistent animation behavior.
 * 
 * @module constants/animationConstants
 */

/**
 * Idle Animation Configs - Used for player idle pose animations
 * @type {Object}
 */
export const IDLE_ANIMATIONS = {
	// Breathing/floating animation for player
	BREATHING: {
		duration: 1000,
		y: -5,
		yoyo: true,
		repeat: -1,
		ease: 'Sine.inOut'
	},
	
	// Left arm idle animation
	LEFT_ARM: {
		rotation: -0.5,
		duration: 800,
		yoyo: true,
		repeat: -1,
		ease: 'Sine.inOut'
	},
	
	// Right arm idle animation
	RIGHT_ARM: {
		rotation: 0.5,
		duration: 800,
		yoyo: true,
		repeat: -1,
		ease: 'Sine.inOut'
	},
	
	// Weapon idle animation
	WEAPON: {
		rotation: 1,
		duration: 600,
		yoyo: true,
		repeat: -1,
		ease: 'Sine.inOut'
	}
};

/**
 * Combat Visual Effects Animations
 * @type {Object}
 */
export const COMBAT_ANIMATIONS = {
	// Impact ring effect when hitting
	IMPACT_RING: {
		scaleX: 1.5,
		scaleY: 1.5,
		alpha: 0,
		duration: 600,
		ease: 'Power2.out'
	},
	
	// Attack arc animation
	ATTACK_ARC: {
		rotation: Math.PI,
		duration: 800,
		ease: 'Power1.out'
	},
	
	// Damage flash effect
	DAMAGE_FLASH: {
		duration: 200,
		ease: 'Power2.out'
	}
};

/**
 * Enemy Animation Configurations
 * @type {Object}
 */
export const ENEMY_ANIMATIONS = {
	// Enemy movement bob
	BOB: {
		duration: 600,
		y: -10,
		yoyo: true,
		repeat: -1,
		ease: 'Sine.inOut'
	},
	
	// Enemy attack telegraph
	ATTACK_TELEGRAPH: {
		duration: 300,
		scale: 1.1,
		ease: 'Power2.in'
	}
};

/**
 * UI Animation Configurations
 * @type {Object}
 */
export const UI_ANIMATIONS = {
	// Floating damage number
	FLOAT_DAMAGE: {
		duration: 1200,
		y: -80,
		alpha: 0,
		ease: 'Power2.out'
	},
	
	// Floating points/loot
	FLOAT_POINTS: {
		duration: 1200,
		y: -60,
		alpha: 0,
		ease: 'Power2.out'
	},
	
	// Button hover
	BUTTON_HOVER: {
		duration: 200,
		scale: 1.05,
		ease: 'Power2.out'
	},
	
	// Notification fade in
	NOTIFICATION_IN: {
		duration: 300,
		alpha: 1,
		ease: 'Power2.out'
	},
	
	// Notification fade out
	NOTIFICATION_OUT: {
		duration: 300,
		alpha: 0,
		ease: 'Power2.out',
		delay: 2000
	}
};

/**
 * Particle & Burst Animations
 * @type {Object}
 */
export const PARTICLE_ANIMATIONS = {
	// Burst particle spread
	BURST: {
		lifeDuration: 800,
		velocityDecay: 0.95,
		ease: 'Power2.out'
	},
	
	// Wave effect (from center)
	WAVE: {
		duration: 1000,
		scale: 2,
		alpha: 0,
		ease: 'Power1.out'
	}
};

export default {
	IDLE_ANIMATIONS,
	COMBAT_ANIMATIONS,
	ENEMY_ANIMATIONS,
	UI_ANIMATIONS,
	PARTICLE_ANIMATIONS
};
