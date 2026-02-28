import { gameState } from '../../services/gameState.js';
import { createAnimatedCharacterWithViews } from '../../services/spriteGenerator.js';
import { generateEnemySprite } from '../../services/spriteGenerator.js';
import { cleanupScene } from '../../helpers/sceneCleanupHelpers.js';
import { attachPauseKey, detachPauseKey } from '../../handlers/PauseHandler.js';
import { ensureSceneRegistered, openPauseMenu } from '../../helpers/pauseHelpers.js';

/**
 * =================================================================
 * CHAOS CRUCIBLE SCENE
 * =================================================================
 * Large zoomable arena with camera following the player
 */

export class ChaossCrucibleScene extends Phaser.Scene {
	constructor() {
		super({ key: 'ChaossCrucibleScene', active: false });

		// Arena dimensions - much larger for zoomed view
		this.ARENA_WIDTH = 5000;
		this.ARENA_HEIGHT = 5000;
		this.ARENA_PADDING = 200;

		// Game objects
		this.player = null;
		this.playerData = null;
		this.enemies = [];
		this.enemyProjectiles = [];
		this.keys = {};
		this.projectiles = [];
		this.attackState = {
			nextBasicTime: 0,
			nextAbilityTime: 0
		};
		this.cameraFxState = {
			lastShakeAt: 0,
			minIntervalMs: 45
		};
		this.playerDamageState = {
			nextDamageTime: 0,
			damageCooldown: 500 // 0.5 seconds between damage
		};
		this.lavaDamageState = {
			nextDamageTime: 0,
			damageCooldown: 500 // 0.5 seconds between lava damage
		};
		this.powerups = [];
		this.powerupSpawnState = {
			nextSpawnTime: 0,
			lastSpawnTime: 0,
			hasSpawned: false
		};
		this.powerupConfig = {
			spawnInterval: 3500,
			spawnChance: 0.45,
			guaranteedInterval: 8000,
			maxPowerups: 5,
			despawnTime: 18000,
			minPlayerDistance: 260
		};
		this.powerupCatalog = {
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
				shieldAmount: 100
			}
		};
		this.buffState = {
			damageUntil: 0,
			cooldownUntil: 0,
			speedUntil: 0
		};
		this.buffConfig = {
			damageMultiplier: 1.35,
			cooldownScale: 0.7,
			speedMultiplier: 1.25
		};
		this.playerShield = {
			value: 0,
			max: 100
		};

		// Wave system
		this.waveState = {
			currentWave: 0,
			enemiesKilledThisWave: 0,
			totalEnemiesThisWave: 0,
			waveInProgress: false,
			nextWaveTimer: null,
			waveStartDelay: 3000 // 3 seconds between waves
		};

		// Wave difficulty scaling - progressive and randomized
		this.waveDifficulty = {
			baseEnemies: 5,
			enemiesPerWave: 2.5,
			eliteChancePerWave: 0.08, // 8% increase per wave
			variation: 0.3 // 30% randomization
		};

		// Minimap system
		this.minimap = {
			container: null,
			background: null,
			border: null,
			playerDot: null,
			enemyDots: [],
			size: 180,
			scale: null // Will be calculated based on arena size
		};

		// Enemy tracking indicators
		this.enemyIndicators = [];

		// Constants
		this.uiCamera = null;
		this.arenaObjects = [];
		this.obstacles = []; // Obstacles for collision detection
		this.lavaPools = []; // Lava pools for damage detection
		this.structures = []; // Structures player can enter
		this.isInsideStructure = false;
		this.currentStructure = null;
		this.interiorContainer = null;
		this.centerpieceParts = null;
	}

	create() {
		// Ensure tween/time systems are running after scene transitions
		this.tweens.timeScale = 1;
		this.tweens.resumeAll();
		this.time.timeScale = 1;
		this.centerpieceStatue = null;
		this.depthSortedActors = [];

		const centerX = this.ARENA_WIDTH / 2;
		const centerY = this.ARENA_HEIGHT / 2;
		const playerSpawnY = centerY + 260;

		// Initialize character if missing
		if (!gameState.character) {
			gameState.setSelectedRole('Male'); // Default role
		}
		const character = gameState.character;

		ensureSceneRegistered(this, 'PauseScene');
		ensureSceneRegistered(this, 'OptionsScene');

		this.handlePauseEsc = attachPauseKey(this, 'ChaossCrucibleScene');

		// ===== CREATE BARBARIC ARENA =====
		this.createArenaEnvironment(centerX, centerY);

		// ===== PLACE PLAYER IN CENTER =====
		this.player = createAnimatedCharacterWithViews(this, character.role, centerX, playerSpawnY, character.colors);
		this.playerData = {
			x: centerX,
			y: playerSpawnY,
			vx: 0,
			vy: 0,
			speed: 6
		};

		this.roleConfig = this.getRoleConfig(character.role);

		// Track facing for front/back sprite switching
		this.playerFacing = 'down';

		// Add player idle scale pulse animation (doesn't interfere with movement)
		this.tweens.add({
			targets: this.player,
			scaleY: 1.1,
			duration: 1000,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.inOut'
		});

		// Animate arms and weapons for FRONT sprite
		if (this.player.frontSprite.leftArm) {
			this.tweens.add({
				targets: this.player.frontSprite.leftArm,
				rotation: -0.5,
				duration: 800,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.inOut'
			});
		}

		if (this.player.frontSprite.rightArm) {
			this.tweens.add({
				targets: this.player.frontSprite.rightArm,
				rotation: 0.5,
				duration: 800,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.inOut'
			});
		}

		if (this.player.frontSprite.weapon) {
			this.tweens.add({
				targets: this.player.frontSprite.weapon,
				rotation: 1,
				duration: 600,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.inOut'
			});
		}

		// Animate arms and weapons for BACK sprite
		if (this.player.backSprite.leftArm) {
			this.tweens.add({
				targets: this.player.backSprite.leftArm,
				rotation: -0.5,
				duration: 800,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.inOut'
			});
		}

		if (this.player.backSprite.rightArm) {
			this.tweens.add({
				targets: this.player.backSprite.rightArm,
				rotation: 0.5,
				duration: 800,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.inOut'
			});
		}

		if (this.player.backSprite.weapon) {
			this.tweens.add({
				targets: this.player.backSprite.weapon,
				rotation: 1,
				duration: 600,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.inOut'
			});
		}

		// ===== CAMERA SETUP =====
		const gameConfig = this.sys.game.config;
		const displayWidth = gameConfig.width;
		const displayHeight = gameConfig.height;

		// Main camera - follows player, zoomed in
		this.cameras.main.setBounds(0, 0, this.ARENA_WIDTH, this.ARENA_HEIGHT);
		this.cameras.main.setViewport(0, 0, displayWidth, displayHeight);
		this.cameras.main.setZoom(2.5); // Zoom in for focused view
		this.cameras.main.setLerp(0.1, 0.1); // Smooth camera movement
		this.cameras.main.startFollow(this.player);

		// UI camera - fixed overlay for HUD elements
		this.uiCamera = this.cameras.add(0, 0, displayWidth, displayHeight);
		this.uiCamera.setViewport(0, 0, displayWidth, displayHeight);
		this.uiCamera.setZoom(1);

		// Hide all world objects from UI camera
		this.arenaObjects.forEach(obj => this.uiCamera.ignore(obj));
		this.uiCamera.ignore(this.player);
		if (this.player.getChildren) {
			this.player.getChildren().forEach(child => this.uiCamera.ignore(child));
		}

		// ===== INITIALIZE WAVE SYSTEM =====
		// Start wave 1
		this.startWave(1);

		// ===== UI TEXT (on UI camera) =====
		// Reset score at start of game
		gameState.resetScore();

		const displayName = character.name || 'Player';
		const nameText = this.add.text(20, 20, displayName, {
			font: 'bold 28px Arial',
			fill: '#ffffff'
		});

		// Enemy counter
		this.enemyCountText = this.add.text(20, 60, `Enemies: ${this.enemies.length}`,
			{
				font: 'bold 20px Arial',
				fill: '#FF6B00'
			});

		// Score display
		this.scoreText = this.add.text(20, 100, `Score: ${gameState.score}`,
			{
				font: 'bold 20px Arial',
				fill: '#FFD700'
			});

		// Wave display
		this.waveText = this.add.text(20, 140, `Wave: ${this.waveState.currentWave}`,
			{
				font: 'bold 24px Arial',
				fill: '#00FFFF'
			});

		// Initialize player health
		if (!character.hp) {
			character.hp = 100;
			character.maxHp = 100;
		}

		// ===== PLAYER HEALTH BAR (on UI camera, bottom left) =====
		const healthBarX = 40;
		const healthBarY = gameConfig.height - 50; // Bottom left of screen

		// Heart icon using graphics
		const heartGraphics = this.make.graphics({ x: 0, y: 0, add: false });
		heartGraphics.fillStyle(0xff0000, 1);
		heartGraphics.beginPath();
		heartGraphics.arc(healthBarX - 6, healthBarY - 3, 5, 0, Math.PI * 2); // Left bump
		heartGraphics.fill();
		heartGraphics.beginPath();
		heartGraphics.arc(healthBarX + 6, healthBarY - 3, 5, 0, Math.PI * 2); // Right bump
		heartGraphics.fill();

		// Heart point
		heartGraphics.beginPath();
		heartGraphics.moveTo(healthBarX - 11, healthBarY);
		heartGraphics.lineTo(healthBarX + 11, healthBarY);
		heartGraphics.lineTo(healthBarX, healthBarY + 11);
		heartGraphics.lineTo(healthBarX - 11, healthBarY);
		heartGraphics.fill();

		// Add outline
		heartGraphics.lineStyle(1.5, 0x990000, 1);
		heartGraphics.beginPath();
		heartGraphics.arc(healthBarX - 6, healthBarY - 3, 5, 0, Math.PI * 2);
		heartGraphics.stroke();
		this.add.existing(heartGraphics);

		// Health bar background (black)
		this.playerHealthBg = this.add.rectangle(
			healthBarX + 35,
			healthBarY,
			300,
			30,
			0x000000,
			0.9
		);
		this.playerHealthBg.setOrigin(0, 0.5);

		// Health bar border
		this.playerHealthBorder = this.add.rectangle(
			healthBarX + 35,
			healthBarY,
			300,
			30,
			0x333333
		);
		this.playerHealthBorder.setOrigin(0, 0.5);
		this.playerHealthBorder.setStrokeStyle(2, 0x666666);
		this.playerHealthBorder.isFilled = false;

		// Health bar foreground (red)
		this.playerHealthFg = this.add.rectangle(
			healthBarX + 35,
			healthBarY,
			300,
			30,
			0xff0000,
			1
		);
		this.playerHealthFg.setOrigin(0, 0.5);

		// Health text
		this.playerHealthText = this.add.text(
			healthBarX + 190,
			healthBarY,
			`${character.hp} / ${character.maxHp}`,
			{
				font: 'bold 16px Arial',
				fill: '#ffffff',
				stroke: '#000000',
				strokeThickness: 4
			}
		);
		this.playerHealthText.setOrigin(0.5, 0.5);

		// ===== POWERUP/BUFF INDICATOR (on UI camera, left side, stacked vertically) =====
		const buffStartY = gameConfig.height - 220;
		const buffStartX = 40;

		// SHIELD SECTION
		const shieldLabelY = buffStartY;
		this.shieldLabel = this.add.text(buffStartX, shieldLabelY, 'SHIELD', {
			font: 'bold 18px Arial',
			fill: '#88ccff',
			stroke: '#000000',
			strokeThickness: 3
		});
		this.shieldLabel.setOrigin(0, 0);

		const shieldBoxY = shieldLabelY + 28;
		this.shieldBg = this.add.rectangle(buffStartX + 35, shieldBoxY + 15, 300, 30, 0x001a33, 0.9);
		this.shieldBg.setOrigin(0, 0.5);
		this.shieldBg.setStrokeStyle(3, 0x88ccff);

		this.shieldIcon = this.add.text(buffStartX + 50, shieldBoxY + 15, '⬡', {
			font: 'bold 20px Arial',
			fill: '#88ccff'
		});
		this.shieldIcon.setOrigin(0.5, 0.5);

		this.shieldText = this.add.text(buffStartX + 185, shieldBoxY + 15, '0/100', {
			font: 'bold 20px Arial',
			fill: '#88ccff',
			stroke: '#000000',
			strokeThickness: 2
		});
		this.shieldText.setOrigin(0, 0.5);

		// ACTIVE EFFECTS SECTION
		const effectsLabelY = shieldBoxY + 44;
		this.effectsLabel = this.add.text(buffStartX, effectsLabelY, 'ACTIVE EFFECTS', {
			font: 'bold 18px Arial',
			fill: '#ffcc00',
			stroke: '#000000',
			strokeThickness: 3
		});
		this.effectsLabel.setOrigin(0, 0);

		// Active buffs panel (will show up to 3 active buffs)
		this.activeBuffPanels = [];
		for (let i = 0; i < 3; i++) {
			const buffY = effectsLabelY + 34 + i * 50;
			const buffBg = this.add.rectangle(buffStartX + 240, buffY + 8, 220, 42, 0x1a1a1a, 0.95);
			buffBg.setOrigin(1, 0.5);
			buffBg.setStrokeStyle(2, 0x666666);
			
			const buffIcon = this.add.text(buffStartX + 20, buffY + 8, '●', {
				font: 'bold 24px Arial',
				fill: '#ffffff'
			});
			buffIcon.setOrigin(0.5, 0.5);

			const buffName = this.add.text(buffStartX + 35, buffY - 5, '', {
				font: 'bold 16px Arial',
				fill: '#ffffff'
			});
			buffName.setOrigin(0, 0.5);

			const buffTimeBg = this.add.rectangle(buffStartX + 35, buffY + 18, 120, 8, 0x000000, 0.9);
			buffTimeBg.setOrigin(0, 0.5);

			const buffTimeBar = this.add.rectangle(buffStartX + 35, buffY + 18, 120, 8, 0x00ff00, 1);
			buffTimeBar.setOrigin(0, 0.5);

			const buffTimeText = this.add.text(buffStartX + 165, buffY + 18, '0s', {
				font: 'bold 14px Arial',
				fill: '#ffffff',
				stroke: '#000000',
				strokeThickness: 2
			});
			buffTimeText.setOrigin(1, 0.5);

			this.activeBuffPanels.push({
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

		// ===== MINIMAP (on UI camera, top right) =====
		const minimapSize = this.minimap.size;
		const minimapX = displayWidth - minimapSize - 20;
		const minimapY = 20;

		// Calculate minimap scale
		this.minimap.scale = minimapSize / Math.max(this.ARENA_WIDTH, this.ARENA_HEIGHT);

		// Minimap background
		this.minimap.background = this.add.rectangle(
			minimapX + minimapSize / 2,
			minimapY + minimapSize / 2,
			minimapSize,
			minimapSize,
			0x000000,
			0.7
		);

		// Minimap border
		this.minimap.border = this.add.rectangle(
			minimapX + minimapSize / 2,
			minimapY + minimapSize / 2,
			minimapSize,
			minimapSize
		);
		this.minimap.border.setStrokeStyle(3, 0x00FFFF);
		this.minimap.border.isFilled = false;

		// Minimap label
		this.minimapLabel = this.add.text(
			minimapX + minimapSize / 2,
			minimapY - 8,
			'MAP',
			{
				font: 'bold 14px Arial',
				fill: '#00FFFF',
				stroke: '#000000',
				strokeThickness: 3
			}
		);
		this.minimapLabel.setOrigin(0.5, 1);

		// Player dot on minimap
		this.minimap.playerDot = this.add.circle(
			minimapX + minimapSize / 2,
			minimapY + minimapSize / 2,
			4,
			0x00FF00,
			1
		);

		// Container for minimap
		this.minimap.container = this.add.container(0, 0);

		// Hide HUD elements from the main camera (UI camera only)
		const hudElements = [
			nameText,
			this.enemyCountText,
			this.scoreText,
			this.waveText,
			heartGraphics,
			this.playerHealthBg,
			this.playerHealthBorder,
			this.playerHealthFg,
			this.playerHealthText,
			this.shieldLabel,
			this.shieldBg,
			this.shieldIcon,
			this.shieldText,
			this.effectsLabel,
			this.minimap.background,
			this.minimap.border,
			this.minimapLabel,
			this.minimap.playerDot
		];
		this.activeBuffPanels.forEach(panel => {
			hudElements.push(panel.bg, panel.icon, panel.name, panel.timeBg, panel.timeBar, panel.timeText);
		});
		hudElements.forEach(element => this.cameras.main.ignore(element));

		// ===== INPUT HANDLING =====
		this.keys = this.input.keyboard.createCursorKeys();
		this.input.keyboard.enabled = true;
		this.keys.w = this.input.keyboard.addKey('W');
		this.keys.a = this.input.keyboard.addKey('A');
		this.keys.s = this.input.keyboard.addKey('S');
		this.keys.d = this.input.keyboard.addKey('D');
		this.keys.esc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
		this.keys.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
		this.keys.e = this.input.keyboard.addKey('E');
		this.keys.shift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

		this.powerupSpawnState.lastSpawnTime = this.time.now;
		this.scheduleNextPowerupSpawn(2000);
	}

	getRoleConfig(role) {
		const configs = {
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

		return configs[role] || configs.Male;
	}

	getAimDirection(targetX, targetY) {
		if (typeof targetX !== 'number' || typeof targetY !== 'number') {
			return this.getFacingDirection();
		}

		const dx = targetX - this.playerData.x;
		const dy = targetY - this.playerData.y;
		const len = Math.hypot(dx, dy);
		if (!len) return this.getFacingDirection();
		return { x: dx / len, y: dy / len };
	}

	getFacingDirection() {
		if (this.playerFacing === 'up') return { x: 0, y: -1 };
		if (this.playerFacing === 'down') return { x: 0, y: 1 };
		return this.player.scaleX >= 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
	}

	getDamageMultiplier(now = this.time.now) {
		return now < this.buffState.damageUntil ? this.buffConfig.damageMultiplier : 1;
	}

	getCooldownScale(now = this.time.now) {
		return now < this.buffState.cooldownUntil ? this.buffConfig.cooldownScale : 1;
	}

	getSpeedMultiplier(now = this.time.now) {
		return now < this.buffState.speedUntil ? this.buffConfig.speedMultiplier : 1;
	}

	safeCameraShake(duration = 60, intensity = 0.01, minIntervalMs = this.cameraFxState.minIntervalMs) {
		if (!this.cameras || !this.cameras.main) return;

		const now = this.time ? this.time.now : Date.now();
		if (now - this.cameraFxState.lastShakeAt < minIntervalMs) return;
		if (this.cameras.main.shakeEffect && this.cameras.main.shakeEffect.isRunning) return;

		this.cameraFxState.lastShakeAt = now;
		const clampedIntensity = Phaser.Math.Clamp(intensity, 0, 0.03);
		this.cameras.main.shake(duration, clampedIntensity);
	}

	queueBasicAttack(aim) {
		const now = this.time.now;
		if (now < this.attackState.nextBasicTime) return;
		const cooldownScale = this.getCooldownScale(now);
		this.attackState.nextBasicTime = now + this.roleConfig.basicCooldown * cooldownScale;
		const damageMultiplier = this.getDamageMultiplier(now);

		switch (gameState.character.role) {
			case 'archer':
				this.spawnProjectile({
					x: this.playerData.x,
					y: this.playerData.y,
					vx: aim.x * this.roleConfig.projectileSpeed,
					vy: aim.y * this.roleConfig.projectileSpeed,
					damage: this.roleConfig.basicDamage * damageMultiplier,
					color: 0xd4af37,
					radius: 3,
					range: 520,
					type: 'arrow'
				});
				break;
			case 'gunner':
				this.spawnProjectile({
					x: this.playerData.x,
					y: this.playerData.y,
					vx: aim.x * this.roleConfig.projectileSpeed,
					vy: aim.y * this.roleConfig.projectileSpeed,
					damage: this.roleConfig.basicDamage * damageMultiplier,
					color: 0xffdd55,
					radius: 2,
					range: 480
				});
				break;
			case 'brute':
			case 'Male':
			default:
				this.performMeleeSlash(aim, this.roleConfig.meleeRange, this.roleConfig.basicDamage * damageMultiplier);
				break;
		}

		this.playAttackAnimation();
	}

	queueAbility(aim) {
		const now = this.time.now;
		if (now < this.attackState.nextAbilityTime) return;
		const cooldownScale = this.getCooldownScale(now);
		this.attackState.nextAbilityTime = now + this.roleConfig.abilityCooldown * cooldownScale;
		const damageMultiplier = this.getDamageMultiplier(now);

		switch (gameState.character.role) {
			case 'archer':
				this.fireArcherVolley(aim, damageMultiplier);
				break;
			case 'gunner':
				this.fireGunnerBurst(aim, damageMultiplier);
				break;
			case 'brute':
				this.performShockwave(this.roleConfig.abilityRadius, this.roleConfig.abilityDamage * damageMultiplier);
				break;
			case 'Male':
			default:
				this.performShockwave(this.roleConfig.abilityRadius, this.roleConfig.abilityDamage * damageMultiplier);
				break;
		}

		this.playAttackAnimation();
	}

	playAttackAnimation() {
		const activeSprite = this.playerFacing === 'up' ? this.player.backSprite : this.player.frontSprite;
		if (!activeSprite) return;
		const arms = [activeSprite.leftArm, activeSprite.rightArm].filter(Boolean);
		arms.forEach(arm => {
			this.tweens.add({
				targets: arm,
				rotation: arm.rotation + (arm === activeSprite.leftArm ? -0.7 : 0.7),
				duration: 120,
				yoyo: true,
				repeat: 0,
				ease: 'Sine.out'
			});
		});

		if (activeSprite.weapon) {
			this.tweens.add({
				targets: activeSprite.weapon,
				rotation: activeSprite.weapon.rotation + 1.2,
				duration: 150,
				yoyo: true,
				repeat: 0,
				ease: 'Sine.out'
			});
		}
	}

	performMeleeSlash(aim, range, damage) {
		this.createSlashEffect(aim, range);
		const hitThreshold = Math.cos(Phaser.Math.DegToRad(60));
		this.enemies.forEach(enemyData => {
			const dx = enemyData.enemy.x - this.playerData.x;
			const dy = enemyData.enemy.y - this.playerData.y;
			const dist = Math.hypot(dx, dy);
			if (dist > range || !dist) return;
			const dot = (dx / dist) * aim.x + (dy / dist) * aim.y;
			if (dot < hitThreshold) return;
			this.damageEnemy(enemyData, damage, { x: aim.x * 0.8, y: aim.y * 0.8 });
		});
	}

	performShockwave(radius, damage) {
		const ring = this.add.circle(this.playerData.x, this.playerData.y, radius, 0xffcc55, 0.15);
		ring.setStrokeStyle(3, 0xffaa00, 0.8);
		if (this.uiCamera) this.uiCamera.ignore(ring);
		
		// Add glow flash
		const glow = this.add.circle(this.playerData.x, this.playerData.y, radius * 0.8, 0xffcc55, 0.4);
		if (this.uiCamera) this.uiCamera.ignore(glow);
		
		// Controlled screen shake on shockwave (prevents visual glitching)
		this.safeCameraShake(100, 0.02, 120);
		
		this.tweens.add({
			targets: ring,
			scale: 1.1,
			alpha: 0,
			duration: 220,
			onComplete: () => ring.destroy()
		});
		
		this.tweens.add({
			targets: glow,
			scale: 1.3,
			alpha: 0,
			duration: 280,
			onComplete: () => glow.destroy()
		});

		this.enemies.forEach(enemyData => {
			const dx = enemyData.enemy.x - this.playerData.x;
			const dy = enemyData.enemy.y - this.playerData.y;
			const dist = Math.hypot(dx, dy);
			if (dist > radius) return;
			const knock = dist ? { x: dx / dist, y: dy / dist } : { x: 0, y: 0 };
			this.damageEnemy(enemyData, damage, { x: knock.x * 1.2, y: knock.y * 1.2 });
		});
	}

	fireArcherVolley(aim, damageMultiplier = 1) {
		const shots = this.roleConfig.abilityShots;
		const spread = this.roleConfig.abilitySpread;
		
		// Create a burst of light at player position
		const burstLight = this.add.circle(this.playerData.x, this.playerData.y, 30, 0xffcc55, 0.3);
		if (this.uiCamera) this.uiCamera.ignore(burstLight);
		this.tweens.add({
			targets: burstLight,
			scale: 1.8,
			alpha: 0,
			duration: 200,
			onComplete: () => burstLight.destroy()
		});
		
		// Controlled screen shake for volley
		this.safeCameraShake(80, 0.014, 100);
		
		for (let i = 0; i < shots; i++) {
			const offset = (i - (shots - 1) / 2) * spread;
			const angle = Math.atan2(aim.y, aim.x) + offset;
			this.spawnProjectile({
				x: this.playerData.x,
				y: this.playerData.y,
				vx: Math.cos(angle) * this.roleConfig.projectileSpeed,
				vy: Math.sin(angle) * this.roleConfig.projectileSpeed,
				damage: this.roleConfig.abilityDamage * damageMultiplier,
				color: 0xffcc55,
				radius: 3,
				range: 600,
				type: 'arrow'
			});
		}
	}

	fireGunnerBurst(aim, damageMultiplier = 1) {
		const shots = this.roleConfig.abilityBurst;
		
		// Muzzle flash
		const muzzle = this.add.circle(this.playerData.x + aim.x * 15, this.playerData.y + aim.y * 15, 12, 0xffdd00, 0.9);
		if (this.uiCamera) this.uiCamera.ignore(muzzle);
		this.tweens.add({
			targets: muzzle,
			scale: 1.5,
			alpha: 0,
			duration: 150,
			onComplete: () => muzzle.destroy()
		});
		
		// Controlled shake for initial burst
		this.safeCameraShake(45, 0.01, 60);
		
		for (let i = 0; i < shots; i++) {
			this.time.delayedCall(i * 60, () => {
				this.spawnProjectile({
					x: this.playerData.x,
					y: this.playerData.y,
					vx: aim.x * (this.roleConfig.projectileSpeed + 2),
					vy: aim.y * (this.roleConfig.projectileSpeed + 2),
					damage: this.roleConfig.abilityDamage * damageMultiplier,
					color: 0xffee88,
					radius: 2,
					range: 520
				});
				// Small shake between shots (throttled)
				if (i > 0) {
					this.safeCameraShake(24, 0.006, 45);
				}
			});
		}
	}

	createSlashEffect(aim, range) {
		const baseAngle = Math.atan2(aim.y, aim.x);
		
		// Primary slash arc (white)
		const arc = this.add.graphics();
		arc.lineStyle(3, 0xffffff, 0.8);
		arc.beginPath();
		arc.arc(this.playerData.x, this.playerData.y, range, baseAngle - 0.6, baseAngle + 0.6);
		arc.strokePath();
		if (this.uiCamera) this.uiCamera.ignore(arc);
		
		// Secondary flash arcs (golden)
		const arcFlash = this.add.graphics();
		arcFlash.lineStyle(2, 0xffcc55, 0.5);
		arcFlash.beginPath();
		arcFlash.arc(this.playerData.x, this.playerData.y, range * 0.85, baseAngle - 0.55, baseAngle + 0.55);
		arcFlash.strokePath();
		if (this.uiCamera) this.uiCamera.ignore(arcFlash);
		
		// Mini sparkles at arc edges
		for (let i = 0; i < 3; i++) {
			const angle = baseAngle - 0.6 + (i * 0.6);
			const sparkX = this.playerData.x + Math.cos(angle) * range;
			const sparkY = this.playerData.y + Math.sin(angle) * range;
			const spark = this.add.circle(sparkX, sparkY, 2, 0xffff88, 0.9);
			if (this.uiCamera) this.uiCamera.ignore(spark);
			this.tweens.add({
				targets: spark,
				alpha: 0,
				scale: 0.5,
				duration: 200,
				onComplete: () => spark.destroy()
			});
		}
		
		// Controlled screen shake on slash
		this.safeCameraShake(50, 0.012, 80);
		
		this.tweens.add({
			targets: arc,
			alpha: 0,
			duration: 140,
			onComplete: () => arc.destroy()
		});
		
		this.tweens.add({
			targets: arcFlash,
			alpha: 0,
			duration: 200,
			onComplete: () => arcFlash.destroy()
		});
	}

	spawnProjectile({ x, y, vx, vy, damage, color, radius, range, type = 'bullet' }) {
		let sprite;
		
		if (type === 'arrow') {
			// Create arrow graphics
			const arrowGraphics = this.add.graphics();
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
			sprite = this.add.circle(x, y, radius, color, 0.9);
			sprite.setStrokeStyle(1, 0x000000, 0.4);
		}
		
		if (this.uiCamera) this.uiCamera.ignore(sprite);
		this.projectiles.push({
			sprite,
			x,
			y,
			vx,
			vy,
			damage,
			radius,
			rangeRemaining: range,
			type
		});
	}

	updateProjectiles(deltaScale) {
		for (let i = this.projectiles.length - 1; i >= 0; i--) {
			const proj = this.projectiles[i];
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
			for (let j = this.enemies.length - 1; j >= 0; j--) {
				const enemyData = this.enemies[j];
				const radius = this.getEnemyRadius(enemyData.sizeScale);
				const dx = enemyData.enemy.x - proj.x;
				const dy = enemyData.enemy.y - proj.y;
				const dist = Math.hypot(dx, dy);
				if (dist <= radius + proj.radius) {
					this.damageEnemy(enemyData, proj.damage, { x: dx / (dist || 1), y: dy / (dist || 1) });
					hit = true;
					break;
				}
			}

			const outOfBounds =
				proj.x < this.ARENA_PADDING ||
				proj.x > this.ARENA_WIDTH - this.ARENA_PADDING ||
				proj.y < this.ARENA_PADDING ||
				proj.y > this.ARENA_HEIGHT - this.ARENA_PADDING;

			if (hit || proj.rangeRemaining <= 0 || outOfBounds) {
				if (proj.sprite) proj.sprite.destroy();
				this.projectiles.splice(i, 1);
			}
		}
	}

	getEnemyRadius(sizeScale) {
		return 14 * sizeScale;
	}

	damageEnemy(enemyData, damage, knockback) {
		if (!enemyData || !enemyData.enemy) return;
		enemyData.enemy.hp = Math.max(0, enemyData.enemy.hp - damage);
		if (enemyData.healthBar) {
			enemyData.healthBar.width = (enemyData.enemy.hp / enemyData.enemy.maxHp) * 40 * enemyData.sizeScale;
		}
		this.flashEnemy(enemyData.enemy);
		
		// Show floating damage number
		this.floatDamage(enemyData.enemy.x, enemyData.enemy.y, damage);
		
		if (knockback) {
			enemyData.vx += knockback.x;
			enemyData.vy += knockback.y;
		}

		if (enemyData.enemy.hp <= 0) {
			// Award points based on enemy type
			let pointsAwarded = 25; // Slime default
			if (enemyData.type === 'devil') {
				pointsAwarded = 100;
			} else if (enemyData.type === 'skeleton') {
				pointsAwarded = 50;
			}
			gameState.addScore(pointsAwarded);

			// Display floating points animation at enemy position
			this.floatPoints(enemyData.enemy.x, enemyData.enemy.y, pointsAwarded);

			// Track wave kills
			if (this.waveState.waveInProgress) {
				this.waveState.enemiesKilledThisWave++;
			}

			if (enemyData.healthBar) enemyData.healthBar.destroy();
			enemyData.enemy.destroy();
			this.enemies = this.enemies.filter(entry => entry !== enemyData);

			// Check if wave is complete
			this.checkWaveCompletion();
		}
	}

	flashEnemy(enemy) {
		if (enemy.setTint) {
			enemy.setTint(0xff6666);
			this.time.delayedCall(80, () => {
				if (enemy.clearTint) enemy.clearTint();
			});
			return;
		}
		if (enemy.getChildren) {
			enemy.getChildren().forEach(child => {
				if (child.setTint) child.setTint(0xff6666);
			});
			this.time.delayedCall(80, () => {
				enemy.getChildren().forEach(child => {
					if (child.clearTint) child.clearTint();
				});
			});
		}
	}

	flashPlayer() {
		if (!this.player) return;
		
		// Tint all player character parts red
		const children = this.player.getChildren ? this.player.getChildren() : [this.player];
		children.forEach(child => {
			if (child.setTint) {
				child.setTint(0xff4444);
				this.tweens.add({
					targets: child,
					tint: 0xffffff,
					duration: 120,
					ease: 'Sine.out'
				});
			}
		});
	}

	damagePlayer(damage) {
		if (!gameState.character) return;
		
		const now = this.time.now;
		if (now < this.playerDamageState.nextDamageTime) return;
		
		this.playerDamageState.nextDamageTime = now + this.playerDamageState.damageCooldown;
		
		if (this.playerShield.value > 0) {
			const absorbed = Math.min(this.playerShield.value, damage);
			this.playerShield.value -= absorbed;
			damage -= absorbed;
			this.spawnShieldAbsorbEffect();
		}
		
		if (damage <= 0) return;
		
		gameState.character.hp = Math.max(0, gameState.character.hp - damage);
		this.flashPlayer();
		
		// Show floating damage number
		this.floatDamage(this.playerData.x, this.playerData.y - 20, damage);
		
		if (gameState.character.hp <= 0) {
			// Player died - could add death handling here
		}
	}

	/**
	 * Display floating point text when enemy is slain
	 * @param {number} x - World X coordinate
	 * @param {number} y - World Y coordinate
	 * @param {number} points - Points earned
	 */
	floatPoints(x, y, points) {
		// Create text showing points earned
		const pointsText = this.add.text(x, y, `+${points}`, {
			font: 'bold 24px Arial',
			fill: '#FFD700',
			stroke: '#FF8C00',
			strokeThickness: 2
		});
		pointsText.setOrigin(0.5, 0.5);
		pointsText.setDepth(1000); // Ensure it's on top

		// Make uiCamera ignore this text so it stays in world space
		if (this.uiCamera) {
			this.uiCamera.ignore(pointsText);
		}

		// Animate the text: move up and fade out
		this.tweens.add({
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
	 * Display floating damage text when character takes damage
	 * @param {number} x - World X coordinate
	 * @param {number} y - World Y coordinate
	 * @param {number} damage - Damage amount
	 */
	floatDamage(x, y, damage) {
		// Round damage to integer for display
		const dmg = Math.round(damage);
		
		// Create text showing damage taken
		const damageText = this.add.text(x, y, `-${dmg}`, {
			font: 'bold 28px Arial',
			fill: '#FF3333',
			stroke: '#990000',
			strokeThickness: 3
		});
		damageText.setOrigin(0.5, 0.5);
		damageText.setDepth(1001); // Above points
		damageText.setScale(1.2); // Start slightly larger

		// Make uiCamera ignore this text so it stays in world space
		if (this.uiCamera) {
			this.uiCamera.ignore(damageText);
		}

		// Add a random horizontal offset for visual variety
		const offsetX = (Math.random() - 0.5) * 30;

		// Animate the text with a bounce effect
		this.tweens.add({
			targets: damageText,
			y: y - 60,
			x: x + offsetX,
			scale: 1.0,
			duration: 300,
			ease: 'Back.easeOut'
		});

		// Fade out after the bounce
		this.tweens.add({
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

	createArenaEnvironment(centerX, centerY) {
		// Grey stone background
		const arenaBg = this.add.rectangle(centerX, centerY, this.ARENA_WIDTH, this.ARENA_HEIGHT, 0x2a2a2a).setOrigin(0.5);

		// ===== CREATE ARENA FLOOR TEXTURE =====
		const floorGraphics = this.make.graphics({ x: 0, y: 0, add: false });

		// Solid stone floor
		floorGraphics.fillStyle(0x3a3a3a, 1);
		floorGraphics.fillRectShape(new Phaser.Geom.Rectangle(
			this.ARENA_PADDING,
			this.ARENA_PADDING,
			this.ARENA_WIDTH - 2 * this.ARENA_PADDING,
			this.ARENA_HEIGHT - 2 * this.ARENA_PADDING
		));

		// Rocky speckles
		for (let i = 0; i < 120; i++) {
			const sx = this.ARENA_PADDING + 50 + Math.random() * (this.ARENA_WIDTH - 2 * this.ARENA_PADDING - 100);
			const sy = this.ARENA_PADDING + 50 + Math.random() * (this.ARENA_HEIGHT - 2 * this.ARENA_PADDING - 100);
			const sr = 2 + Math.random() * 4;
			const shade = Math.random() > 0.5 ? 0x555555 : 0x2b2b2b;
			floorGraphics.fillStyle(shade, 0.7);
			floorGraphics.fillCircle(sx, sy, sr);
		}

		// Add cracks and wear marks
		floorGraphics.lineStyle(1.5, 0x202020, 0.8);
		for (let i = 0; i < 30; i++) {
			const startX = this.ARENA_PADDING + 100 + Math.random() * (this.ARENA_WIDTH - 2 * this.ARENA_PADDING - 200);
			const startY = this.ARENA_PADDING + 100 + Math.random() * (this.ARENA_HEIGHT - 2 * this.ARENA_PADDING - 200);
			const endX = startX + (Math.random() - 0.5) * 200;
			const endY = startY + (Math.random() - 0.5) * 200;
			floorGraphics.lineBetween(startX, startY, endX, endY);
		}

		// Lava cracks with bright glow
		const lavaCracks = this.make.graphics({ x: 0, y: 0, add: false });
		const crackCount = 28;
		for (let i = 0; i < crackCount; i++) {
			const startX = this.ARENA_PADDING + 120 + Math.random() * (this.ARENA_WIDTH - 2 * this.ARENA_PADDING - 240);
			const startY = this.ARENA_PADDING + 120 + Math.random() * (this.ARENA_HEIGHT - 2 * this.ARENA_PADDING - 240);
			const segments = 4 + Math.floor(Math.random() * 4);
			const segmentLength = 40 + Math.random() * 60;
			const points = [{ x: startX, y: startY }];

			let angle = Math.random() * Math.PI * 2;
			for (let s = 0; s < segments; s++) {
				angle += (Math.random() - 0.5) * 0.9;
				const last = points[points.length - 1];
				const nx = last.x + Math.cos(angle) * (segmentLength + Math.random() * 30);
				const ny = last.y + Math.sin(angle) * (segmentLength + Math.random() * 30);
				points.push({ x: nx, y: ny });
			}

			// Outer dark fissure
			lavaCracks.lineStyle(8, 0x2a0a00, 0.55);
			lavaCracks.beginPath();
			lavaCracks.moveTo(points[0].x, points[0].y);
			for (let p = 1; p < points.length; p++) {
				lavaCracks.lineTo(points[p].x, points[p].y);
			}
			lavaCracks.strokePath();

			// Hot core glow
			lavaCracks.lineStyle(4, 0xff4400, 0.85);
			lavaCracks.beginPath();
			lavaCracks.moveTo(points[0].x, points[0].y);
			for (let p = 1; p < points.length; p++) {
				lavaCracks.lineTo(points[p].x, points[p].y);
			}
			lavaCracks.strokePath();

			// Bright inner filament
			lavaCracks.lineStyle(2, 0xffcc66, 1);
			lavaCracks.beginPath();
			lavaCracks.moveTo(points[0].x, points[0].y);
			for (let p = 1; p < points.length; p++) {
				lavaCracks.lineTo(points[p].x, points[p].y);
			}
			lavaCracks.strokePath();

			// Small branching cracks
			if (Math.random() > 0.4) {
				const branchIndex = 1 + Math.floor(Math.random() * (points.length - 2));
				const branchStart = points[branchIndex];
				const branchAngle = angle + (Math.random() > 0.5 ? 1 : -1) * (0.6 + Math.random() * 0.6);
				const branchLength = 30 + Math.random() * 50;
				const bx = branchStart.x + Math.cos(branchAngle) * branchLength;
				const by = branchStart.y + Math.sin(branchAngle) * branchLength;
				lavaCracks.lineStyle(3, 0xff6600, 0.75);
				lavaCracks.lineBetween(branchStart.x, branchStart.y, bx, by);
				lavaCracks.lineStyle(1.5, 0xffdd88, 0.9);
				lavaCracks.lineBetween(branchStart.x, branchStart.y, bx, by);
			}
		}

		// Blood stains (dark red circles)
		for (let i = 0; i < 15; i++) {
			const bx = this.ARENA_PADDING + 150 + Math.random() * (this.ARENA_WIDTH - 2 * this.ARENA_PADDING - 300);
			const by = this.ARENA_PADDING + 150 + Math.random() * (this.ARENA_HEIGHT - 2 * this.ARENA_PADDING - 300);
			const radius = 15 + Math.random() * 30;
			floorGraphics.fillStyle(0x4a0000, 0.4);
			floorGraphics.fillCircle(bx, by, radius);
		}

		this.add.existing(floorGraphics);
		this.add.existing(lavaCracks);
		lavaCracks.setDepth(0);

		// ===== CREATE ARENA BORDER =====
		const borderGraphics = this.make.graphics({ x: 0, y: 0, add: false });
		const borderX = this.ARENA_PADDING;
		const borderY = this.ARENA_PADDING;
		const borderW = this.ARENA_WIDTH - 2 * this.ARENA_PADDING;
		const borderH = this.ARENA_HEIGHT - 2 * this.ARENA_PADDING;

		// Outer dark stone border
		borderGraphics.fillStyle(0x4a3a2a, 1);
		borderGraphics.fillRectShape(new Phaser.Geom.Rectangle(borderX - 20, borderY - 20, borderW + 40, 20));
		borderGraphics.fillRectShape(new Phaser.Geom.Rectangle(borderX - 20, borderY + borderH, borderW + 40, 20));
		borderGraphics.fillRectShape(new Phaser.Geom.Rectangle(borderX - 20, borderY, 20, borderH));
		borderGraphics.fillRectShape(new Phaser.Geom.Rectangle(borderX + borderW, borderY, 20, borderH));

		// Main orange border line
		borderGraphics.lineStyle(14, 0xFF6B00, 1);
		borderGraphics.strokeRectShape(new Phaser.Geom.Rectangle(borderX, borderY, borderW, borderH));

		// Inner detail border
		borderGraphics.lineStyle(4, 0xFFAA44, 0.7);
		borderGraphics.strokeRectShape(new Phaser.Geom.Rectangle(borderX + 8, borderY + 8, borderW - 16, borderH - 16));

		// Dark inner line
		borderGraphics.lineStyle(2, 0x331100, 0.8);
		borderGraphics.strokeRectShape(new Phaser.Geom.Rectangle(borderX + 2, borderY + 2, borderW - 4, borderH - 4));

		// Spikes along border
		const spikeSize = 50;
		const spikeColor = 0xCC0000;

		// Top and bottom spikes
		for (let x = borderX + 100; x < borderX + borderW; x += 150) {
			borderGraphics.fillStyle(spikeColor, 1);
			borderGraphics.fillTriangleShape(
				new Phaser.Geom.Triangle(x - spikeSize / 2, borderY - 30, x + spikeSize / 2, borderY - 30, x, borderY - 60)
			);
			borderGraphics.fillTriangleShape(
				new Phaser.Geom.Triangle(x - spikeSize / 2, borderY + borderH + 30, x + spikeSize / 2, borderY + borderH + 30, x, borderY + borderH + 60)
			);
		}

		// Left and right spikes
		for (let y = borderY + 100; y < borderY + borderH; y += 150) {
			borderGraphics.fillStyle(spikeColor, 1);
			borderGraphics.fillTriangleShape(
				new Phaser.Geom.Triangle(borderX - 30, y - spikeSize / 2, borderX - 30, y + spikeSize / 2, borderX - 60, y)
			);
			borderGraphics.fillTriangleShape(
				new Phaser.Geom.Triangle(borderX + borderW + 30, y - spikeSize / 2, borderX + borderW + 30, y + spikeSize / 2, borderX + borderW + 60, y)
			);
		}

		this.add.existing(borderGraphics);

		// Store references for later camera filtering
		this.arenaObjects = [arenaBg, floorGraphics, lavaCracks, borderGraphics];

		// ===== LAVA POOLS =====
		const lavaPoolCount = 6;
		for (let i = 0; i < lavaPoolCount; i++) {
			const poolX = this.ARENA_PADDING + 250 + Math.random() * (this.ARENA_WIDTH - 2 * this.ARENA_PADDING - 500);
			const poolY = this.ARENA_PADDING + 250 + Math.random() * (this.ARENA_HEIGHT - 2 * this.ARENA_PADDING - 500);
			const poolW = 140 + Math.random() * 120;
			const poolH = 90 + Math.random() * 80;
			this.createLavaPool(poolX, poolY, poolW, poolH);
		}

		// ===== TORCH EFFECTS AT CORNERS =====
		this.createTorchEffect(borderX + 60, borderY + 60);
		this.createTorchEffect(borderX + borderW - 60, borderY + 60);
		this.createTorchEffect(borderX + 60, borderY + borderH - 60);
		this.createTorchEffect(borderX + borderW - 60, borderY + borderH - 60);

		// ===== CREATE OBSTACLES =====
		this.createObstacles();

		// ===== CREATE STRUCTURES =====
		this.createStructures();

		// ===== CENTERPIECE MONUMENT + SURROUNDING STATUES =====
		this.createCenterpieceStatue(centerX, centerY);
		this.createBattlefieldStatues(centerX, centerY);

		// ===== FLOATING PARTICLES FOR DEPTH =====
		this.createFloatingParticles();

		// ===== LASER AND FOG AMBIENCE =====
		this.createLaserEffects();
		this.createFogLayers();
		this.createArenaLighting();
	}

	createTorchEffect(x, y) {
		// Torch pole
		const pole = this.add.rectangle(x, y + 20, 12, 60, 0x4a3a2a, 1).setOrigin(0.5);
		const base = this.add.rectangle(x, y + 48, 20, 12, 0x2a1a0a, 1).setOrigin(0.5);

		// Flame glow
		const glow = this.add.circle(x, y - 10, 22, 0xFFDD00, 0.4).setOrigin(0.5);
		const flameOuter = this.add.circle(x, y - 10, 14, 0xFF8800, 0.8).setOrigin(0.5);
		const flameInner = this.add.circle(x, y - 12, 8, 0xFF4400, 0.9).setOrigin(0.5);
		const flameCore = this.add.circle(x, y - 14, 4, 0xFFFF00, 1).setOrigin(0.5);

		// Fire flicker animation
		this.tweens.add({
			targets: [glow, flameOuter, flameInner, flameCore],
			alpha: { from: 0.6, to: 1 },
			duration: 200 + Math.random() * 300,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.inOut'
		});

		this.tweens.add({
			targets: [flameOuter, flameInner, flameCore],
			scaleX: { from: 0.9, to: 1.1 },
			scaleY: { from: 0.9, to: 1.2 },
			duration: 250 + Math.random() * 250,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.inOut'
		});

		// Add to arena objects for camera filtering
		this.arenaObjects.push(pole, base, glow, flameOuter, flameInner, flameCore);
	}

	createLavaPool(x, y, width, height) {
		// Rocky base
		const base = this.add.ellipse(x, y, width + 20, height + 20, 0x4a4a4a, 1).setOrigin(0.5);

		// Outer glow
		const glow = this.add.ellipse(x, y, width + 14, height + 14, 0xffaa00, 0.45).setOrigin(0.5);
		const glowRing = this.add.ellipse(x, y, width + 28, height + 28, 0xff6600, 0.2).setOrigin(0.5);
		// Mid layer
		const mid = this.add.ellipse(x, y, width, height, 0xff5500, 0.7).setOrigin(0.5);
		// Core
		const core = this.add.ellipse(x, y, width - 20, height - 20, 0xff2200, 0.9).setOrigin(0.5);
		const heatHaze = this.add.ellipse(x, y, width + 6, height + 6, 0xffdd88, 0.15).setOrigin(0.5);

		// Bubble highlights
		const bubbles = [];
		for (let i = 0; i < 4; i++) {
			const bx = x + (Math.random() - 0.5) * (width / 2);
			const by = y + (Math.random() - 0.5) * (height / 2);
			const br = 6 + Math.random() * 8;
			const bubble = this.add.circle(bx, by, br, 0xffdd88, 0.8).setOrigin(0.5);
			bubbles.push(bubble);
		}

		// Animate glow and bubbles
		this.tweens.add({
			targets: glow,
			alpha: { from: 0.35, to: 0.65 },
			scale: { from: 0.98, to: 1.05 },
			duration: 700,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.inOut'
		});

		this.tweens.add({
			targets: [glowRing, heatHaze],
			alpha: { from: 0.08, to: 0.25 },
			scale: { from: 0.95, to: 1.08 },
			duration: 1200,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.inOut'
		});

		bubbles.forEach((bubble, idx) => {
			this.tweens.add({
				targets: bubble,
				alpha: { from: 0.3, to: 1 },
				duration: 400 + idx * 120,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.inOut'
			});
		});

		this.arenaObjects.push(base, glowRing, glow, mid, core, heatHaze, ...bubbles);

		// Store lava pool collision data for damage detection (use actual hot core size)
		this.lavaPools.push({
			x: x,
			y: y,
			width: width - 20,
			height: height - 20
		});
	}

	createFloatingParticles() {
		const padding = this.ARENA_PADDING + 80;
		const spawnArea = {
			minX: padding,
			maxX: this.ARENA_WIDTH - 2 * padding,
			minY: padding,
			maxY: this.ARENA_HEIGHT - 2 * padding
		};

		// Create diverse floating particles using graphics and tweens
		const particleCount = 100;
		const particleGroup = this.add.container(0, 0);
		particleGroup.setDepth(2);

		for (let i = 0; i < particleCount; i++) {
			const x = spawnArea.minX + Math.random() * spawnArea.maxX;
			const y = spawnArea.minY + Math.random() * spawnArea.maxY;
			
			// Randomly choose particle type with varied properties
			const particleType = Math.random();
			let particleConfig = {};
			
			if (particleType < 0.2) {
				// Small dust particles (circles, fast upward drift)
				particleConfig = {
					shape: 'circle',
					size: 1 + Math.random() * 1.5,
					color: [0xffffff, 0xffe0b8, 0xffc68a][Math.floor(Math.random() * 3)],
					speedX: (Math.random() - 0.5) * 25,
					speedY: -40 - Math.random() * 30,
					duration: 5000,
					alpha: 0.5
				};
			} else if (particleType < 0.35) {
				// Medium dust clouds (larger circles, slow upward)
				particleConfig = {
					shape: 'circle',
					size: 3 + Math.random() * 3,
					color: [0xffd9a3, 0xffe0b8, 0xffccaa][Math.floor(Math.random() * 3)],
					speedX: (Math.random() - 0.5) * 35,
					speedY: -20 - Math.random() * 15,
					duration: 8000,
					alpha: 0.35
				};
			} else if (particleType < 0.5) {
				// Embers (orange circles/squares, settling)
				particleConfig = {
					shape: Math.random() > 0.5 ? 'circle' : 'square',
					size: 2 + Math.random() * 3,
					color: [0xff4400, 0xff6600, 0xff8800, 0xffaa00][Math.floor(Math.random() * 4)],
					speedX: (Math.random() - 0.5) * 20,
					speedY: 8 + Math.random() * 12,
					duration: 9000,
					alpha: 0.7
				};
			} else if (particleType < 0.65) {
				// Vapor particles (purple/blue, chaotic motion)
				particleConfig = {
					shape: Math.random() > 0.6 ? 'circle' : 'triangle',
					size: 2 + Math.random() * 4,
					color: [0x8844ff, 0xaa66ff, 0xcc88ff, 0x6655dd][Math.floor(Math.random() * 4)],
					speedX: (Math.random() - 0.5) * 40,
					speedY: (Math.random() - 0.5) * 30,
					duration: 7000,
					alpha: 0.4
				};
			} else if (particleType < 0.8) {
				// Ash particles (dark, large, settling slowly)
				particleConfig = {
					shape: Math.random() > 0.7 ? 'circle' : 'square',
					size: 2 + Math.random() * 4,
					color: [0x5a5a5a, 0x4a4a4a, 0x3a3a3a, 0x6a6a6a][Math.floor(Math.random() * 4)],
					speedX: (Math.random() - 0.5) * 15,
					speedY: 3 + Math.random() * 8,
					duration: 10000,
					alpha: 0.45
				};
			} else if (particleType < 0.9) {
				// Intense fire sparks (red/yellow, very small, upward burst)
				particleConfig = {
					shape: 'circle',
					size: 1 + Math.random() * 1,
					color: [0xff0000, 0xff4400, 0xffaa00, 0xffdd00][Math.floor(Math.random() * 4)],
					speedX: (Math.random() - 0.5) * 50,
					speedY: -60 - Math.random() * 40,
					duration: 4000,
					alpha: 0.8
				};
			} else {
				// Mystical energy (cyan/magenta, medium, random movement)
				particleConfig = {
					shape: Math.random() > 0.5 ? 'circle' : 'triangle',
					size: 2 + Math.random() * 2.5,
					color: [0x00ffff, 0xff00ff, 0xcc66ff, 0x66ffcc][Math.floor(Math.random() * 4)],
					speedX: (Math.random() - 0.5) * 35,
					speedY: (Math.random() - 0.5) * 25,
					duration: 6000,
					alpha: 0.5
				};
			}
			
			// Create particle with specified shape
			const particleGfx = this.make.graphics({ x: 0, y: 0, add: false });
			particleGfx.fillStyle(particleConfig.color, particleConfig.alpha);
			
			if (particleConfig.shape === 'circle') {
				particleGfx.fillCircle(particleConfig.size + 3, particleConfig.size + 3, particleConfig.size);
			} else if (particleConfig.shape === 'square') {
				particleGfx.fillRect(3, 3, particleConfig.size * 2, particleConfig.size * 2);
			} else if (particleConfig.shape === 'triangle') {
				const triSize = particleConfig.size + 2;
				particleGfx.fillTriangleShape(
					new Phaser.Geom.Triangle(
						triSize + 3,
						3,
						3,
						triSize * 2 + 3,
						triSize * 2 + 3,
						triSize * 2 + 3
					)
				);
			}
			
			particleGroup.add(particleGfx);
			particleGfx.x = x;
			particleGfx.y = y;
			particleGfx.originalAlpha = particleConfig.alpha;
			particleGfx.originalSize = particleConfig.size;
			
			// Animate particle
			this.tweens.add({
				targets: particleGfx,
				x: x + particleConfig.speedX,
				y: y + particleConfig.speedY,
				alpha: 0,
				scale: 0.3 + Math.random() * 0.3,
				duration: particleConfig.duration,
				ease: 'Linear',
				onComplete: () => {
					// Respawn particle at random location
					const newX = spawnArea.minX + Math.random() * spawnArea.maxX;
					const newY = spawnArea.minY + Math.random() * spawnArea.maxY;
					particleGfx.x = newX;
					particleGfx.y = newY;
					particleGfx.alpha = particleGfx.originalAlpha;
					particleGfx.scale = 1;
					
					// Pick new random motion for respawned particle
					const nextType = Math.random();
					let nextConfig = {};
					
					if (nextType < 0.2) {
						nextConfig = {
							speedX: (Math.random() - 0.5) * 25,
							speedY: -40 - Math.random() * 30,
							duration: 5000,
							alpha: 0.5
						};
					} else if (nextType < 0.35) {
						nextConfig = {
							speedX: (Math.random() - 0.5) * 35,
							speedY: -20 - Math.random() * 15,
							duration: 8000,
							alpha: 0.35
						};
					} else if (nextType < 0.5) {
						nextConfig = {
							speedX: (Math.random() - 0.5) * 20,
							speedY: 8 + Math.random() * 12,
							duration: 9000,
							alpha: 0.7
						};
					} else if (nextType < 0.65) {
						nextConfig = {
							speedX: (Math.random() - 0.5) * 40,
							speedY: (Math.random() - 0.5) * 30,
							duration: 7000,
							alpha: 0.4
						};
					} else if (nextType < 0.8) {
						nextConfig = {
							speedX: (Math.random() - 0.5) * 15,
							speedY: 3 + Math.random() * 8,
							duration: 10000,
							alpha: 0.45
						};
					} else if (nextType < 0.9) {
						nextConfig = {
							speedX: (Math.random() - 0.5) * 50,
							speedY: -60 - Math.random() * 40,
							duration: 4000,
							alpha: 0.8
						};
					} else {
						nextConfig = {
							speedX: (Math.random() - 0.5) * 35,
							speedY: (Math.random() - 0.5) * 25,
							duration: 6000,
							alpha: 0.5
						};
					}
					
					this.tweens.add({
						targets: particleGfx,
						x: newX + nextConfig.speedX,
						y: newY + nextConfig.speedY,
						alpha: 0,
						scale: 0.3 + Math.random() * 0.3,
						duration: nextConfig.duration,
						ease: 'Linear'
					});
				}
			});
		}

		this.arenaObjects.push(particleGroup);
	}

	createLaserEffects() {
		const laserGroup = this.add.container(0, 0);
		laserGroup.setDepth(3);

		const padding = this.ARENA_PADDING + 120;
		const minX = padding;
		const maxX = this.ARENA_WIDTH - padding;
		const minY = padding;
		const maxY = this.ARENA_HEIGHT - padding;

		const laserCount = 10;
		for (let i = 0; i < laserCount; i++) {
			const isVertical = Math.random() > 0.5;
			const beamLength = 900 + Math.random() * 600;
			const beamThickness = 5 + Math.random() * 3;
			const baseAlpha = 0.2 + Math.random() * 0.2;
			const laserColor = [0x44ccff, 0x66ffcc, 0xff66cc][Math.floor(Math.random() * 3)];

			const beam = this.add.rectangle(0, 0, isVertical ? beamThickness : beamLength, isVertical ? beamLength : beamThickness, laserColor, baseAlpha);
			beam.setOrigin(0.5);
			beam.setBlendMode('ADD');

			const glow = this.add.rectangle(0, 0, isVertical ? beamThickness * 3 : beamLength, isVertical ? beamLength : beamThickness * 3, laserColor, baseAlpha * 0.6);
			glow.setOrigin(0.5);
			glow.setBlendMode('ADD');

			const resetLaser = () => {
				const x = minX + Math.random() * (maxX - minX);
				const y = minY + Math.random() * (maxY - minY);
				const angle = Math.random() * Math.PI;
				beam.setPosition(x, y);
				glow.setPosition(x, y);
				beam.setRotation(angle);
				glow.setRotation(angle);
			};

			resetLaser();

			const burstDistance = 300 + Math.random() * 300;
			const burstAngle = Math.random() * Math.PI * 2;
			const targetX = Phaser.Math.Clamp(beam.x + Math.cos(burstAngle) * burstDistance, minX, maxX);
			const targetY = Phaser.Math.Clamp(beam.y + Math.sin(burstAngle) * burstDistance, minY, maxY);

			this.tweens.add({
				targets: [beam, glow],
				x: targetX,
				y: targetY,
				alpha: { from: baseAlpha * 0.2, to: baseAlpha * 1.8 },
				duration: 800 + Math.random() * 700,
				ease: 'Sine.inOut',
				yoyo: true,
				repeat: -1
			});

			this.tweens.add({
				targets: [beam, glow],
				scaleX: { from: 0.9, to: 1.2 },
				scaleY: { from: 0.9, to: 1.2 },
				duration: 600 + Math.random() * 500,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.inOut'
			});

			this.time.addEvent({
				delay: 1200 + Math.random() * 1500,
				loop: true,
				callback: resetLaser
			});

			laserGroup.add([glow, beam]);
		}

		this.arenaObjects.push(laserGroup);
	}

	createArenaLighting() {
		const lightGroup = this.add.container(0, 0);
		lightGroup.setDepth(2);

		const padding = this.ARENA_PADDING + 120;
		const minX = padding;
		const maxX = this.ARENA_WIDTH - padding;
		const minY = padding;
		const maxY = this.ARENA_HEIGHT - padding;

		const orbCount = 14;
		for (let i = 0; i < orbCount; i++) {
			const radius = 60 + Math.random() * 100;
			const color = [0xffaa44, 0x66ccff, 0x8844ff, 0xff6688][Math.floor(Math.random() * 4)];
			const orb = this.add.circle(0, 0, radius, color, 0.12 + Math.random() * 0.08);
			orb.setBlendMode('ADD');

			const x = minX + Math.random() * (maxX - minX);
			const y = minY + Math.random() * (maxY - minY);
			orb.setPosition(x, y);

			this.tweens.add({
				targets: orb,
				x: x + (Math.random() - 0.5) * 220,
				y: y + (Math.random() - 0.5) * 180,
				alpha: { from: orb.alpha * 0.5, to: orb.alpha * 1.6 },
				scale: { from: 0.9, to: 1.15 },
				yoyo: true,
				repeat: -1,
				duration: 6000 + Math.random() * 4000,
				ease: 'Sine.inOut'
			});

			lightGroup.add(orb);
		}

		this.arenaObjects.push(lightGroup);
	}

	createFogLayers() {
		const fogGroup = this.add.container(0, 0);
		fogGroup.setDepth(1);

		const padding = this.ARENA_PADDING + 100;
		const minX = padding;
		const maxX = this.ARENA_WIDTH - padding;
		const minY = padding;
		const maxY = this.ARENA_HEIGHT - padding;

		const fogCount = 10;
		for (let i = 0; i < fogCount; i++) {
			const fogWidth = 260 + Math.random() * 320;
			const fogHeight = 120 + Math.random() * 180;
			const fogColor = [0x334455, 0x2a3a4a, 0x3a3a4a][Math.floor(Math.random() * 3)];
			const fog = this.add.ellipse(0, 0, fogWidth, fogHeight, fogColor, 0.08 + Math.random() * 0.08);
			fog.setOrigin(0.5);

			const x = minX + Math.random() * (maxX - minX);
			const y = minY + Math.random() * (maxY - minY);
			fog.setPosition(x, y);

			const driftX = x + (Math.random() - 0.5) * 250;
			const driftY = y + (Math.random() - 0.5) * 120;

			this.tweens.add({
				targets: fog,
				x: driftX,
				y: driftY,
				alpha: { from: fog.alpha * 0.5, to: fog.alpha * 1.4 },
				yoyo: true,
				repeat: -1,
				duration: 9000 + Math.random() * 5000,
				ease: 'Sine.inOut'
			});

			fogGroup.add(fog);
		}

		this.arenaObjects.push(fogGroup);
	}

	/**
	 * Creates various obstacles that block player and enemy movement
	 */
	createObstacles() {
		const padding = this.ARENA_PADDING + 300;
		const centerX = this.ARENA_WIDTH / 2;
		const centerY = this.ARENA_HEIGHT / 2;
		const centerSafeRadius = 430;
		const spawnArea = {
			minX: padding,
			maxX: this.ARENA_WIDTH - padding,
			minY: padding,
			maxY: this.ARENA_HEIGHT - padding
		};

		const getSpawnAwayFromCenter = () => {
			for (let tries = 0; tries < 24; tries++) {
				const x = spawnArea.minX + Math.random() * (spawnArea.maxX - spawnArea.minX);
				const y = spawnArea.minY + Math.random() * (spawnArea.maxY - spawnArea.minY);
				if (Math.hypot(x - centerX, y - centerY) > centerSafeRadius) {
					return { x, y };
				}
			}

			const angle = Math.random() * Math.PI * 2;
			return {
				x: centerX + Math.cos(angle) * (centerSafeRadius + 120),
				y: centerY + Math.sin(angle) * (centerSafeRadius + 120)
			};
		};

		// Ancient Stone Rocks (10-15 scattered around)
		const numRocks = 12 + Math.floor(Math.random() * 4);
		for (let i = 0; i < numRocks; i++) {
			const { x, y } = getSpawnAwayFromCenter();
			this.createRockObstacle(x, y);
		}

		// Ancient Pillars (5-7 tall columns)
		const numPillars = 5 + Math.floor(Math.random() * 3);
		for (let i = 0; i < numPillars; i++) {
			const { x, y } = getSpawnAwayFromCenter();
			this.createPillarObstacle(x, y);
		}

		// Mysterious Obelisks (3-4 magical monoliths)
		const numObelisks = 3 + Math.floor(Math.random() * 2);
		for (let i = 0; i < numObelisks; i++) {
			const { x, y } = getSpawnAwayFromCenter();
			this.createObeliskObstacle(x, y);
		}

		// Broken Statues (4-5 ruined monuments)
		const numStatues = 4 + Math.floor(Math.random() * 2);
		for (let i = 0; i < numStatues; i++) {
			const { x, y } = getSpawnAwayFromCenter();
			this.createStatueObstacle(x, y);
		}

		// Stone Altars (2-3 sacrificial platforms)
		const numAltars = 2 + Math.floor(Math.random() * 2);
		for (let i = 0; i < numAltars; i++) {
			const { x, y } = getSpawnAwayFromCenter();
			this.createAltarObstacle(x, y);
		}
	}

	setWorldDepth(gameObject, worldY, offset = 0) {
		if (!gameObject || !gameObject.setDepth) return;
		gameObject.setDepth(50 + worldY * 0.01 + offset);
	}

	createCenterpieceStatue(centerX, centerY) {
		const statueBase = this.make.graphics({ x: 0, y: 0, add: false });
		const statueTop = this.make.graphics({ x: 0, y: 0, add: false });

		// Base + body
		statueBase.fillStyle(0x2c2020, 1);
		statueBase.fillCircle(centerX, centerY + 180, 230);
		statueBase.fillStyle(0x4a1a1a, 0.95);
		statueBase.fillCircle(centerX, centerY + 180, 190);
		statueBase.fillStyle(0x362424, 1);
		statueBase.fillRect(centerX - 160, centerY + 20, 320, 170);
		statueBase.fillStyle(0x522727, 1);
		statueBase.fillRect(centerX - 180, centerY + 160, 360, 45);
		statueBase.fillStyle(0x472020, 1);
		statueBase.fillRect(centerX - 100, centerY - 190, 200, 230);
		statueBase.fillStyle(0x5e2a2a, 1);
		statueBase.fillRect(centerX - 170, centerY - 170, 340, 65);
		statueBase.fillStyle(0x3b1717, 1);
		statueBase.fillRect(centerX - 210, centerY - 130, 65, 210);
		statueBase.fillRect(centerX + 145, centerY - 130, 65, 210);
		statueBase.fillTriangle(centerX - 210, centerY + 80, centerX - 145, centerY + 80, centerX - 178, centerY + 130);
		statueBase.fillTriangle(centerX + 145, centerY + 80, centerX + 210, centerY + 80, centerX + 178, centerY + 130);
		statueBase.fillStyle(0x7a0000, 0.7);
		for (let i = 0; i < 12; i++) {
			const streakX = centerX - 75 + Math.random() * 150;
			const streakY = centerY - 80 + Math.random() * 210;
			const length = 26 + Math.random() * 55;
			statueBase.fillRect(streakX, streakY, 5, length);
		}
		statueBase.lineStyle(4, 0xaa2200, 0.85);
		statueBase.strokeCircle(centerX, centerY + 180, 205);
		statueBase.lineStyle(2, 0xff8844, 0.65);
		for (let i = 0; i < 16; i++) {
			const a = (i / 16) * Math.PI * 2;
			const x1 = centerX + Math.cos(a) * 178;
			const y1 = centerY + 180 + Math.sin(a) * 178;
			const x2 = centerX + Math.cos(a) * 196;
			const y2 = centerY + 180 + Math.sin(a) * 196;
			statueBase.lineBetween(x1, y1, x2, y2);
		}

		// Top (head + horns)
		statueTop.fillStyle(0x5a2b2b, 1);
		statueTop.fillCircle(centerX, centerY - 235, 82);
		statueTop.fillStyle(0x2b1414, 1);
		statueTop.fillTriangle(centerX - 58, centerY - 290, centerX - 145, centerY - 370, centerX - 82, centerY - 252);
		statueTop.fillTriangle(centerX + 58, centerY - 290, centerX + 145, centerY - 370, centerX + 82, centerY - 252);
		statueTop.fillStyle(0xff2200, 0.95);
		statueTop.fillCircle(centerX - 30, centerY - 248, 10);
		statueTop.fillCircle(centerX + 30, centerY - 248, 10);
		statueTop.fillRect(centerX - 36, centerY - 215, 72, 12);

		this.add.existing(statueBase);
		this.add.existing(statueTop);
		this.setWorldDepth(statueBase, centerY + 170);
		this.setWorldDepth(statueTop, centerY - 170, 4);
		this.arenaObjects.push(statueBase, statueTop);

		const eyeGlowLeft = this.add.circle(centerX - 30, centerY - 248, 23, 0xff3300, 0.32).setBlendMode('ADD');
		const eyeGlowRight = this.add.circle(centerX + 30, centerY - 248, 23, 0xff3300, 0.32).setBlendMode('ADD');
		const baseGlow = this.add.circle(centerX, centerY + 180, 265, 0xff2200, 0.12).setBlendMode('ADD').setDepth(4);
		this.arenaObjects.push(eyeGlowLeft, eyeGlowRight, baseGlow);
		this.setWorldDepth(eyeGlowLeft, centerY - 170, 5);
		this.setWorldDepth(eyeGlowRight, centerY - 170, 5);

		this.centerpieceParts = {
			base: statueBase,
			top: statueTop,
			eyeGlowLeft,
			eyeGlowRight,
			headAnchorY: centerY - 170
		};

		this.tweens.add({
			targets: [eyeGlowLeft, eyeGlowRight],
			alpha: { from: 0.18, to: 0.5 },
			scale: { from: 0.9, to: 1.1 },
			duration: 700,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.inOut'
		});

		this.tweens.add({
			targets: baseGlow,
			alpha: { from: 0.08, to: 0.24 },
			scale: { from: 0.95, to: 1.08 },
			duration: 1300,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.inOut'
		});

		this.createCenterpieceLavaCracks(centerX, centerY + 175);
		this.createStatueBloodPouring(centerX, centerY);

		// Collision footprint: keep lower mass collidable, allow passing behind top/head
		this.addObstacle(centerX, centerY + 120, 'rect', 300, 220, 'centerpiece_statue_body');
		this.addObstacle(centerX, centerY + 180, 'circle', 225, 0, 'centerpiece_statue_platform');
	}

	createCenterpieceLavaCracks(centerX, centerY) {
		const crackGraphics = this.make.graphics({ x: 0, y: 0, add: false });

		const ringCount = 14;
		for (let i = 0; i < ringCount; i++) {
			const angle = (i / ringCount) * Math.PI * 2;
			const radius = 230 + Math.random() * 55;
			const startX = centerX + Math.cos(angle) * radius;
			const startY = centerY + Math.sin(angle) * radius;

			const points = [{ x: startX, y: startY }];
			let direction = angle + (Math.random() > 0.5 ? 1 : -1) * (0.6 + Math.random() * 0.5);
			const segments = 4 + Math.floor(Math.random() * 3);

			for (let s = 0; s < segments; s++) {
				direction += (Math.random() - 0.5) * 0.8;
				const prev = points[points.length - 1];
				const length = 28 + Math.random() * 40;
				points.push({
					x: prev.x + Math.cos(direction) * length,
					y: prev.y + Math.sin(direction) * length
				});
			}

			crackGraphics.lineStyle(7, 0x2a0a00, 0.65);
			crackGraphics.beginPath();
			crackGraphics.moveTo(points[0].x, points[0].y);
			for (let p = 1; p < points.length; p++) crackGraphics.lineTo(points[p].x, points[p].y);
			crackGraphics.strokePath();

			crackGraphics.lineStyle(3.5, 0xff3300, 0.9);
			crackGraphics.beginPath();
			crackGraphics.moveTo(points[0].x, points[0].y);
			for (let p = 1; p < points.length; p++) crackGraphics.lineTo(points[p].x, points[p].y);
			crackGraphics.strokePath();

			crackGraphics.lineStyle(1.5, 0xffcc66, 1);
			crackGraphics.beginPath();
			crackGraphics.moveTo(points[0].x, points[0].y);
			for (let p = 1; p < points.length; p++) crackGraphics.lineTo(points[p].x, points[p].y);
			crackGraphics.strokePath();
		}

		this.add.existing(crackGraphics);
		crackGraphics.setDepth(0);
		this.arenaObjects.push(crackGraphics);

		this.tweens.add({
			targets: crackGraphics,
			alpha: { from: 0.55, to: 1 },
			duration: 650,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.inOut'
		});
	}

	createStatueBloodPouring(centerX, centerY) {
		const bloodGroup = this.add.container(0, 0);
		bloodGroup.setDepth(9);

		// Create a blood drop at a given position
		const spawnBloodDrop = (startX, startY, offsetX = 0) => {
			const drop = this.add.circle(startX + offsetX, startY, 3 + Math.random() * 2, 0x8a0000, 0.85);
			bloodGroup.add(drop);
			
			const fallDistance = 140 + Math.random() * 80;
			const fallDuration = 800 + Math.random() * 600;
			
			this.tweens.add({
				targets: drop,
				y: startY + fallDistance,
				alpha: { from: 0.9, to: 0.1 },
				scaleX: { from: 1, to: 0.5 },
				scaleY: { from: 1, to: 1.4 },
				duration: fallDuration,
				ease: 'Quad.in',
				onComplete: () => drop.destroy()
			});
		};

		// Set up repeating blood streams with proper timer delays
		const createBloodStream = (startX, startY, offsetX = 0) => {
			const loopDelay = 120 + Math.random() * 200;
			this.time.addEvent({
				callback: () => spawnBloodDrop(startX, startY, offsetX),
				delay: loopDelay,
				loop: true,
				loopDelay: loopDelay
			});
		};

		// Pouring from both eyes
		createBloodStream(centerX - 30, centerY - 248, -2);
		createBloodStream(centerX - 30, centerY - 248, 2);
		createBloodStream(centerX + 30, centerY - 248, -2);
		createBloodStream(centerX + 30, centerY - 248, 2);
		
		// Pouring from mouth - wider stream
		for (let i = 0; i < 3; i++) {
			const mouthX = centerX - 30 + i * 30;
			createBloodStream(mouthX, centerY - 210, Math.random() * 10 - 5);
		}

		this.arenaObjects.push(bloodGroup);
	}

	createBattlefieldStatues(centerX, centerY) {
		const guardianOffsets = [
			{ x: -520, y: -320 },
			{ x: 520, y: -320 },
			{ x: -520, y: 360 },
			{ x: 520, y: 360 }
		];

		guardianOffsets.forEach((offset, index) => {
			const gx = centerX + offset.x;
			const gy = centerY + offset.y;
			const lower = this.make.graphics({ x: 0, y: 0, add: false });
			const upper = this.make.graphics({ x: 0, y: 0, add: false });

			lower.fillStyle(index % 2 === 0 ? 0x5a4a4a : 0x4a3a3a, 1);
			lower.fillRect(gx - 45, gy + 35, 90, 18);
			lower.fillStyle(0x6a5656, 1);
			lower.fillRect(gx - 32, gy - 40, 64, 80);
			upper.fillStyle(0x3a2a2a, 1);
			upper.fillCircle(gx, gy - 58, 30);
			upper.fillStyle(0x220f0f, 1);
			upper.fillTriangle(gx - 16, gy - 88, gx - 42, gy - 120, gx - 25, gy - 73);
			upper.fillTriangle(gx + 16, gy - 88, gx + 42, gy - 120, gx + 25, gy - 73);
			upper.fillStyle(0xff4400, 0.85);
			upper.fillCircle(gx - 9, gy - 62, 4);
			upper.fillCircle(gx + 9, gy - 62, 4);

			this.add.existing(lower);
			this.add.existing(upper);
			this.setWorldDepth(lower, gy + 35);
			this.setWorldDepth(upper, gy - 70, 3);
			this.arenaObjects.push(lower, upper);

			const aura = this.add.circle(gx, gy - 15, 58, 0xff5522, 0.12).setBlendMode('ADD');
			this.setWorldDepth(aura, gy - 70, 4);
			this.arenaObjects.push(aura);
			this.tweens.add({
				targets: aura,
				alpha: { from: 0.06, to: 0.18 },
				scale: { from: 0.92, to: 1.08 },
				duration: 1300 + index * 180,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.inOut'
			});

			this.addObstacle(gx, gy + 6, 'rect', 70, 86, `guardian_statue_${index}`);
		});
	}

	createRockObstacle(x, y) {
		const size = 40 + Math.random() * 60; // Varied sizes
		const obstacleGraphics = this.make.graphics({ x: 0, y: 0, add: false });

		// Main rock body - irregular shape
		const baseColor = Math.random() > 0.5 ? 0x5a5a5a : 0x6a6050;
		obstacleGraphics.fillStyle(baseColor, 1);
		obstacleGraphics.beginPath();
		
		// Create irregular rock shape with random points
		const points = 6 + Math.floor(Math.random() * 3);
		for (let i = 0; i < points; i++) {
			const angle = (i / points) * Math.PI * 2;
			const radius = size * (0.7 + Math.random() * 0.3);
			const px = x + Math.cos(angle) * radius;
			const py = y + Math.sin(angle) * radius;
			if (i === 0) {
				obstacleGraphics.moveTo(px, py);
			} else {
				obstacleGraphics.lineTo(px, py);
			}
		}
		obstacleGraphics.closePath();
		obstacleGraphics.fill();

		// Add highlights and shadows
		obstacleGraphics.fillStyle(0x7a7a7a, 0.6);
		obstacleGraphics.fillCircle(x - size * 0.25, y - size * 0.25, size * 0.3);
		
		obstacleGraphics.fillStyle(0x3a3a3a, 0.5);
		obstacleGraphics.fillCircle(x + size * 0.2, y + size * 0.2, size * 0.25);

		// Cracks
		obstacleGraphics.lineStyle(2, 0x2a2a2a, 0.7);
		for (let i = 0; i < 2; i++) {
			const angle = Math.random() * Math.PI * 2;
			const len = size * 0.6;
			obstacleGraphics.lineBetween(x, y, x + Math.cos(angle) * len, y + Math.sin(angle) * len);
		}

		this.add.existing(obstacleGraphics);
		this.arenaObjects.push(obstacleGraphics);
		this.depthSortedActors.push({
			type: 'single',
			baseY: y + size * 0.8,
			obj: obstacleGraphics
		});

		// Store collision data - circular collision matching visual size
		this.addObstacle(x, y, 'circle', size * 0.8, 0, 'rock');
	}

	createPillarObstacle(x, y) {
		const width = 50 + Math.random() * 30;
		const height = 80 + Math.random() * 40;
		
		const pillarGraphics = this.make.graphics({ x: 0, y: 0, add: false });

		// Pillar base
		pillarGraphics.fillStyle(0x4a3a2a, 1);
		pillarGraphics.fillRect(x - width / 2 - 5, y + height / 2 - 10, width + 10, 20);

		// Main pillar body
		pillarGraphics.fillStyle(0x8a8070, 1);
		pillarGraphics.fillRect(x - width / 2, y - height / 2, width, height);

		// Pillar top capital
		pillarGraphics.fillStyle(0x6a5a4a, 1);
		pillarGraphics.fillRect(x - width / 2 - 8, y - height / 2 - 15, width + 16, 15);

		// Weathering and cracks
		pillarGraphics.fillStyle(0x3a3a3a, 0.3);
		pillarGraphics.fillRect(x - width / 2 + 5, y - height / 2 + 10, 8, height - 20);
		
		pillarGraphics.lineStyle(2, 0x2a2a2a, 0.6);
		pillarGraphics.lineBetween(x, y - height / 2, x, y + height / 2);
		
		// Horizontal bands
		for (let i = 0; i < 3; i++) {
			const bandY = y - height / 2 + (i + 1) * (height / 4);
			pillarGraphics.lineStyle(3, 0x5a4a3a, 0.8);
			pillarGraphics.lineBetween(x - width / 2, bandY, x + width / 2, bandY);
		}

		// Ancient runes/symbols
		pillarGraphics.lineStyle(2, 0xaa8844, 0.7);
		pillarGraphics.strokeCircle(x, y, width * 0.3);
		pillarGraphics.lineBetween(x - width * 0.2, y - width * 0.2, x + width * 0.2, y + width * 0.2);
		pillarGraphics.lineBetween(x - width * 0.2, y + width * 0.2, x + width * 0.2, y - width * 0.2);

		this.add.existing(pillarGraphics);
		this.arenaObjects.push(pillarGraphics);
		this.depthSortedActors.push({
			type: 'single',
			baseY: y + height / 2,
			obj: pillarGraphics
		});

		// Store collision data - narrow rectangular collision for thin pillar
		this.addObstacle(x, y, 'rect', width * 0.6, height * 0.85, 'pillar');
	}

	createObeliskObstacle(x, y) {
		const baseWidth = 60;
		const topWidth = 30;
		const height = 120;
		
		const obeliskGraphics = this.make.graphics({ x: 0, y: 0, add: false });

		// Obelisk body (tapered)
		const gradient = [
			{ offset: 0, color: 0x2a1a3a },
			{ offset: 0.5, color: 0x4a3a5a },
			{ offset: 1, color: 0x2a1a3a }
		];

		// Draw tapered obelisk
		obeliskGraphics.fillStyle(0x4a3a5a, 1);
		obeliskGraphics.beginPath();
		obeliskGraphics.moveTo(x - baseWidth / 2, y + height / 2);
		obeliskGraphics.lineTo(x - topWidth / 2, y - height / 2);
		obeliskGraphics.lineTo(x + topWidth / 2, y - height / 2);
		obeliskGraphics.lineTo(x + baseWidth / 2, y + height / 2);
		obeliskGraphics.closePath();
		obeliskGraphics.fill();

		// Pyramidal top
		obeliskGraphics.fillStyle(0x3a2a4a, 1);
		obeliskGraphics.beginPath();
		obeliskGraphics.moveTo(x - topWidth / 2, y - height / 2);
		obeliskGraphics.lineTo(x, y - height / 2 - 25);
		obeliskGraphics.lineTo(x + topWidth / 2, y - height / 2);
		obeliskGraphics.closePath();
		obeliskGraphics.fill();

		// Mystical glow
		const glowCircle = this.add.circle(x, y - height / 4, 15, 0x8844ff, 0.4);
		this.tweens.add({
			targets: glowCircle,
			alpha: { from: 0.2, to: 0.6 },
			scale: { from: 0.8, to: 1.2 },
			duration: 1500,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.inOut'
		});

		// Mystical runes
		obeliskGraphics.lineStyle(2, 0xaa66ff, 0.8);
		for (let i = 0; i < 4; i++) {
			const runeY = y + height / 2 - 20 - i * 25;
			obeliskGraphics.strokeCircle(x, runeY, 8);
			obeliskGraphics.lineBetween(x - 6, runeY, x + 6, runeY);
		}

		// Edge highlights
		obeliskGraphics.lineStyle(1, 0x7a6a8a, 0.5);
		obeliskGraphics.lineBetween(x - baseWidth / 2, y + height / 2, x - topWidth / 2, y - height / 2);
		obeliskGraphics.lineBetween(x + baseWidth / 2, y + height / 2, x + topWidth / 2, y - height / 2);

		this.add.existing(obeliskGraphics);
		this.arenaObjects.push(obeliskGraphics, glowCircle);
		this.depthSortedActors.push({
			type: 'single',
			baseY: y + height / 2,
			obj: obeliskGraphics,
			glow: glowCircle
		});

		// Store collision data - use average width since obelisk tapers
		const avgWidth = (baseWidth + topWidth) / 2;
		this.addObstacle(x, y, 'rect', avgWidth * 0.9, height * 0.9, 'obelisk');
	}

	createStatueObstacle(x, y) {
		const statueGraphics = this.make.graphics({ x: 0, y: 0, add: false });

		// Broken pedestal
		statueGraphics.fillStyle(0x6a5a4a, 1);
		statueGraphics.fillRect(x - 40, y + 30, 80, 30);

		// Statue base (broken top)
		statueGraphics.fillStyle(0x8a7a6a, 1);
		statueGraphics.fillRect(x - 30, y - 40, 60, 70);

		// Broken top with jagged edge
		statueGraphics.fillStyle(0x7a6a5a, 1);
		statueGraphics.beginPath();
		statueGraphics.moveTo(x - 30, y - 40);
		statueGraphics.lineTo(x - 20, y - 55);
		statueGraphics.lineTo(x - 10, y - 45);
		statueGraphics.lineTo(x + 5, y - 60);
		statueGraphics.lineTo(x + 15, y - 50);
		statueGraphics.lineTo(x + 30, y - 40);
		statueGraphics.lineTo(x + 30, y - 35);
		statueGraphics.lineTo(x - 30, y - 35);
		statueGraphics.closePath();
		statueGraphics.fill();

		// Weathering and moss
		statueGraphics.fillStyle(0x3a5a3a, 0.4);
		statueGraphics.fillRect(x - 25, y - 20, 15, 40);
		statueGraphics.fillRect(x + 10, y - 10, 12, 30);

		// Cracks
		statueGraphics.lineStyle(3, 0x2a2a2a, 0.7);
		statueGraphics.lineBetween(x - 10, y - 40, x - 5, y + 30);
		statueGraphics.lineBetween(x + 15, y - 30, x + 20, y + 30);

		// Ancient carved face (partial)
		statueGraphics.fillStyle(0x5a4a3a, 1);
		statueGraphics.fillCircle(x - 10, y - 10, 6); // Eye socket
		statueGraphics.fillCircle(x + 10, y - 10, 6); // Eye socket

		this.add.existing(statueGraphics);
		this.arenaObjects.push(statueGraphics);
		this.depthSortedActors.push({
			type: 'single',
			baseY: y + 35,
			obj: statueGraphics
		});

		// Store collision data - circular collision for broken statue base
		this.addObstacle(x, y, 'circle', 35, 0, 'statue');
	}

	createAltarObstacle(x, y) {
		const altarGraphics = this.make.graphics({ x: 0, y: 0, add: false });

		// Altar base (stone platform)
		altarGraphics.fillStyle(0x3a3a3a, 1);
		altarGraphics.fillRect(x - 60, y + 25, 120, 15);

		// Middle tier
		altarGraphics.fillStyle(0x4a4a4a, 1);
		altarGraphics.fillRect(x - 50, y + 5, 100, 20);

		// Top surface
		altarGraphics.fillStyle(0x5a4a4a, 1);
		altarGraphics.fillRect(x - 55, y - 15, 110, 20);

		// Blood stains
		altarGraphics.fillStyle(0x4a0000, 0.6);
		altarGraphics.fillCircle(x - 15, y - 5, 12);
		altarGraphics.fillCircle(x + 20, y - 5, 10);
		altarGraphics.fillCircle(x, y - 8, 8);

		// Dripping blood
		altarGraphics.fillStyle(0x660000, 0.7);
		for (let i = 0; i < 3; i++) {
			const dripX = x - 25 + i * 25;
			altarGraphics.fillRect(dripX, y - 15, 3, 20);
			altarGraphics.fillCircle(dripX + 1.5, y + 5, 4);
		}

		// Carved symbols
		altarGraphics.lineStyle(2, 0x8a6a4a, 0.8);
		altarGraphics.strokeCircle(x, y - 5, 20);
		
		// Pentagram-like symbol
		const points = 5;
		const radius = 18;
		for (let i = 0; i < points; i++) {
			const angle1 = (i * 2 * Math.PI) / points - Math.PI / 2;
			const angle2 = ((i + 2) * 2 * Math.PI) / points - Math.PI / 2;
			altarGraphics.lineBetween(
				x + Math.cos(angle1) * radius,
				y - 5 + Math.sin(angle1) * radius,
				x + Math.cos(angle2) * radius,
				y - 5 + Math.sin(angle2) * radius
			);
		}

		// Mystical flame on altar
		const flame = this.add.circle(x, y - 25, 8, 0xff4400, 0.8);
		const flameGlow = this.add.circle(x, y - 25, 15, 0xffaa00, 0.3);
		
		this.tweens.add({
			targets: [flame, flameGlow],
			alpha: { from: 0.4, to: 0.9 },
			scaleY: { from: 0.8, to: 1.3 },
			duration: 400,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.inOut'
		});

		this.add.existing(altarGraphics);
		this.arenaObjects.push(altarGraphics, flame, flameGlow);
		this.depthSortedActors.push({
			type: 'single',
			baseY: y + 30,
			obj: altarGraphics,
			glow: flameGlow,
			fx: flame
		});

		// Store collision data - rectangular collision matching altar footprint
		this.addObstacle(x, y, 'rect', 110, 50, 'altar');
	}

	/**
	 * Helper function to add obstacle collision box with proper sizing
	 * Ensures collision zones match visual footprints exactly
	 * @param {number} x - Center X position
	 * @param {number} y - Center Y position
	 * @param {string} shapeType - 'circle' or 'rect'
	 * @param {number} sizeParam1 - Radius (for circle) or Width (for rect)
	 * @param {number} sizeParam2 - Height (for rect only, ignored for circle)
	 * @param {string} marker - Unique identifier for debugging
	 */
	addObstacle(x, y, shapeType, sizeParam1, sizeParam2 = 0, marker = '') {
		const obstacle = {
			x: x,
			y: y,
			type: shapeType,
			marker: marker
		};

		if (shapeType === 'circle') {
			obstacle.radius = sizeParam1;
		} else if (shapeType === 'rect') {
			obstacle.width = sizeParam1;
			obstacle.height = sizeParam2;
		}

		this.obstacles.push(obstacle);
	}

	/**
	 * Check if a circular entity collides with any obstacles
	 * @param {number} entityX - Entity x position
	 * @param {number} entityY - Entity y position
	 * @param {number} entityRadius - Entity collision radius
	 * @returns {boolean} True if collision detected
	 */
	checkObstacleCollision(entityX, entityY, entityRadius) {
		for (const obstacle of this.obstacles) {
			if (obstacle.type === 'circle') {
				// Circle-to-circle collision
				const dx = entityX - obstacle.x;
				const dy = entityY - obstacle.y;
				const distance = Math.hypot(dx, dy);
				if (distance < entityRadius + obstacle.radius) {
					return true;
				}
			} else if (obstacle.type === 'rect') {
				// Circle-to-rectangle collision
				const closestX = Phaser.Math.Clamp(entityX, obstacle.x - obstacle.width / 2, obstacle.x + obstacle.width / 2);
				const closestY = Phaser.Math.Clamp(entityY, obstacle.y - obstacle.height / 2, obstacle.y + obstacle.height / 2);
				
				const dx = entityX - closestX;
				const dy = entityY - closestY;
				const distance = Math.hypot(dx, dy);
				
				if (distance < entityRadius) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * Resolve collision by pushing entity away from obstacle
	 * @param {number} entityX - Entity x position
	 * @param {number} entityY - Entity y position
	 * @param {number} entityRadius - Entity collision radius
	 * @returns {object} Adjusted position {x, y}
	 */
	resolveObstacleCollision(entityX, entityY, entityRadius) {
		let adjustedX = entityX;
		let adjustedY = entityY;

		// Iterate to resolve stacked/adjacent obstacles reliably
		for (let pass = 0; pass < 3; pass++) {
			let movedThisPass = false;

			for (const obstacle of this.obstacles) {
				if (obstacle.type === 'circle') {
					const dx = adjustedX - obstacle.x;
					const dy = adjustedY - obstacle.y;
					const distance = Math.hypot(dx, dy);
					const minDistance = entityRadius + obstacle.radius;

					if (distance < minDistance) {
						const safeDistance = distance || 0.0001;
						const overlap = minDistance - safeDistance;
						adjustedX += (dx / safeDistance) * overlap;
						adjustedY += (dy / safeDistance) * overlap;
						movedThisPass = true;
					}
				} else if (obstacle.type === 'rect') {
					const halfW = obstacle.width / 2;
					const halfH = obstacle.height / 2;
					const minX = obstacle.x - halfW;
					const maxX = obstacle.x + halfW;
					const minY = obstacle.y - halfH;
					const maxY = obstacle.y + halfH;

					const closestX = Phaser.Math.Clamp(adjustedX, minX, maxX);
					const closestY = Phaser.Math.Clamp(adjustedY, minY, maxY);
					const dx = adjustedX - closestX;
					const dy = adjustedY - closestY;
					const distance = Math.hypot(dx, dy);

					if (distance < entityRadius && distance > 0) {
						const overlap = entityRadius - distance;
						adjustedX += (dx / distance) * overlap;
						adjustedY += (dy / distance) * overlap;
						movedThisPass = true;
					} else if (distance === 0) {
						// Entity center is inside rectangle: push to nearest edge
						const leftPen = Math.abs(adjustedX - minX);
						const rightPen = Math.abs(maxX - adjustedX);
						const topPen = Math.abs(adjustedY - minY);
						const bottomPen = Math.abs(maxY - adjustedY);
						const minPen = Math.min(leftPen, rightPen, topPen, bottomPen);

						if (minPen === leftPen) {
							adjustedX = minX - entityRadius;
						} else if (minPen === rightPen) {
							adjustedX = maxX + entityRadius;
						} else if (minPen === topPen) {
							adjustedY = minY - entityRadius;
						} else {
							adjustedY = maxY + entityRadius;
						}
						movedThisPass = true;
					}
				}
			}

			if (!movedThisPass) break;
		}

		return { x: adjustedX, y: adjustedY };
	}

	/**
	 * Check if player is standing in lava and deal damage
	 * @param {number} time - Current game time
	 */
	checkLavaDamage(time) {
		// Check if player is in any lava pool
		let isInLava = false;
		
		for (const lavaPool of this.lavaPools) {
			// Check if player position is within the elliptical lava pool
			const dx = Math.abs(this.playerData.x - lavaPool.x);
			const dy = Math.abs(this.playerData.y - lavaPool.y);
			
			// Ellipse collision detection
			const normalizedDist = (dx * dx) / ((lavaPool.width / 2) * (lavaPool.width / 2)) + 
			                       (dy * dy) / ((lavaPool.height / 2) * (lavaPool.height / 2));
			
			if (normalizedDist <= 1) {
				isInLava = true;
				break;
			}
		}
		
		// Deal damage if player is in lava and cooldown has expired
		if (isInLava && time >= this.lavaDamageState.nextDamageTime) {
			const lavaDamage = 8; // Lava deals 8 damage per tick
			this.damagePlayer(lavaDamage);
			this.lavaDamageState.nextDamageTime = time + this.lavaDamageState.damageCooldown;
			
			// Visual feedback - flash the player orange briefly
			const flashSprite = (sprite) => {
				if (!sprite) return;
				if (sprite.getChildren) {
					sprite.getChildren().forEach(child => {
						if (child.setTint) child.setTint(0xff4400);
					});
				} else if (sprite.setTint) {
					sprite.setTint(0xff4400);
				}
			};

			flashSprite(this.player.frontSprite);
			flashSprite(this.player.backSprite);

			this.time.delayedCall(100, () => {
				const clearSprite = (sprite) => {
					if (!sprite) return;
					if (sprite.getChildren) {
						sprite.getChildren().forEach(child => {
							if (child.clearTint) child.clearTint();
						});
					} else if (sprite.clearTint) {
						sprite.clearTint();
					}
				};
				clearSprite(this.player.frontSprite);
				clearSprite(this.player.backSprite);
			});
		}
	}

	/**
	 * Creates interactive structures in the arena
	 */
	createStructures() {
		const padding = this.ARENA_PADDING + 500;
		const spawnArea = {
			minX: padding,
			maxX: this.ARENA_WIDTH - padding,
			minY: padding,
			maxY: this.ARENA_HEIGHT - padding
		};

		// Ancient Temple
		const templeX = spawnArea.minX + (spawnArea.maxX - spawnArea.minX) * 0.25;
		const templeY = spawnArea.minY + (spawnArea.maxY - spawnArea.minY) * 0.25;
		this.createTemple(templeX, templeY, 'Ancient Temple');

		// Dark Dungeon
		const dungeonX = spawnArea.minX + (spawnArea.maxX - spawnArea.minX) * 0.75;
		const dungeonY = spawnArea.minY + (spawnArea.maxY - spawnArea.minY) * 0.25;
		this.createDungeon(dungeonX, dungeonY, 'Dark Dungeon');

		// Mystical Tower
		const towerX = spawnArea.minX + (spawnArea.maxX - spawnArea.minX) * 0.5;
		const towerY = spawnArea.minY + (spawnArea.maxY - spawnArea.minY) * 0.75;
		this.createTower(towerX, towerY, 'Mystical Tower');
	}

	createTemple(x, y, name) {
		const width = 150;
		const height = 200;
		const templeGraphics = this.make.graphics({ x: 0, y: 0, add: false });

		// Stone foundation
		templeGraphics.fillStyle(0x8b7355, 1);
		templeGraphics.fillRect(x - width / 2, y + height / 2 - 20, width, 20);

		// Main temple body
		templeGraphics.fillStyle(0xa89968, 1);
		templeGraphics.fillRect(x - width / 2, y - height / 2, width, height);

		// Columns (4 pillars)
		const columnWidth = 15;
		const columnHeight = height - 30;
		templeGraphics.fillStyle(0xb8a878, 1);
		templeGraphics.fillRect(x - width / 2 + 20, y - height / 2 + 15, columnWidth, columnHeight);
		templeGraphics.fillRect(x + width / 2 - 35, y - height / 2 + 15, columnWidth, columnHeight);
		templeGraphics.fillRect(x - 20, y - height / 2 + 15, columnWidth, columnHeight);
		templeGraphics.fillRect(x + 5, y - height / 2 + 15, columnWidth, columnHeight);

		// Roof (triangular gable)
		templeGraphics.fillStyle(0x8b7555, 1);
		templeGraphics.beginPath();
		templeGraphics.moveTo(x - width / 2, y - height / 2);
		templeGraphics.lineTo(x, y - height / 2 - 50);
		templeGraphics.lineTo(x + width / 2, y - height / 2);
		templeGraphics.closePath();
		templeGraphics.fill();

		// Entrance doorway
		templeGraphics.fillStyle(0x2a2a2a, 1);
		templeGraphics.fillRect(x - 25, y, 50, 80);

		// Door frame gold
		templeGraphics.lineStyle(2, 0xffd700, 1);
		templeGraphics.strokeRect(x - 27, y - 2, 54, 84);

		// Mystical glow around entrance
		const entranceGlow = this.add.circle(x, y + 40, 35, 0xffd700, 0.15);
		this.tweens.add({
			targets: entranceGlow,
			alpha: { from: 0.1, to: 0.25 },
			duration: 1500,
			yoyo: true,
			repeat: -1
		});

		this.add.existing(templeGraphics);
		templeGraphics.setDepth(6);
		entranceGlow.setDepth(5);
		this.arenaObjects.push(templeGraphics, entranceGlow);

		// Store structure data
		this.structures.push({
			x: x,
			y: y,
			width: width,
			height: height,
			name: name,
			type: 'temple',
			entranceX: x,
			entranceY: y + 40,
			entranceRadius: 40,
			description: 'An ancient stone temple\nPress [ENTER] to explore'
		});

		// Create precise collision perimeter for temple
		// Top block
		this.addObstacle(x, y - height / 2 - 10, 'rect', width + 20, 20, 'temple_top');
		// Left side
		this.addObstacle(x - width / 2 - 10, y - 20, 'rect', 20, 100, 'temple_left');
		// Right side
		this.addObstacle(x + width / 2 + 10, y - 20, 'rect', 20, 100, 'temple_right');
		// Bottom left (entrance gap at center)
		this.addObstacle(x - 45, y + height / 2 + 5, 'rect', 40, 15, 'temple_bottom_left');
		// Bottom right (entrance gap at center)
		this.addObstacle(x + 45, y + height / 2 + 5, 'rect', 40, 15, 'temple_bottom_right');
	}

	createDungeon(x, y, name) {
		const width = 120;
		const height = 180;
		const dungeonGraphics = this.make.graphics({ x: 0, y: 0, add: false });

		// Dark stone walls
		dungeonGraphics.fillStyle(0x3a3a3a, 1);
		dungeonGraphics.fillRect(x - width / 2, y - height / 2, width, height);

		// Brick pattern
		dungeonGraphics.lineStyle(1, 0x2a2a2a, 0.5);
		for (let i = 0; i < 8; i++) {
			dungeonGraphics.lineBetween(x - width / 2, y - height / 2 + i * 22, x + width / 2, y - height / 2 + i * 22);
		}
		for (let j = 0; j < 6; j++) {
			dungeonGraphics.lineBetween(x - width / 2 + j * 20, y - height / 2, x - width / 2 + j * 20, y + height / 2);
		}

		// Iron fortifications
		dungeonGraphics.fillStyle(0x555555, 1);
		dungeonGraphics.fillRect(x - width / 2 - 5, y - height / 2 - 5, width + 10, 5);
		dungeonGraphics.fillRect(x - width / 2 - 5, y + height / 2, width + 10, 5);

		// Dark entrance (iron grated door)
		dungeonGraphics.fillStyle(0x1a1a1a, 1);
		dungeonGraphics.fillRect(x - 20, y - 10, 40, 60);

		// Iron bars on entrance
		dungeonGraphics.lineStyle(3, 0x555555, 1);
		for (let i = 0; i < 5; i++) {
			dungeonGraphics.lineBetween(x - 15 + i * 8, y - 10, x - 15 + i * 8, y + 50);
		}

		// Eerie red glow
		const entranceGlow = this.add.circle(x, y + 20, 30, 0xff0000, 0.1);
		this.tweens.add({
			targets: entranceGlow,
			alpha: { from: 0.05, to: 0.2 },
			duration: 2000,
			yoyo: true,
			repeat: -1
		});

		this.add.existing(dungeonGraphics);
		dungeonGraphics.setDepth(6);
		entranceGlow.setDepth(5);
		this.arenaObjects.push(dungeonGraphics, entranceGlow);

		// Store structure data
		this.structures.push({
			x: x,
			y: y,
			width: width,
			height: height,
			name: name,
			type: 'dungeon',
			entranceX: x,
			entranceY: y + 20,
			entranceRadius: 35,
			description: 'A dark, ominous dungeon\nPress [ENTER] to enter'
		});

		// Create precise collision perimeter for dungeon
		// Top block
		this.addObstacle(x, y - height / 2 - 10, 'rect', width + 20, 20, 'dungeon_top');
		// Left side
		this.addObstacle(x - width / 2 - 10, y - 15, 'rect', 20, 90, 'dungeon_left');
		// Right side
		this.addObstacle(x + width / 2 + 10, y - 15, 'rect', 20, 90, 'dungeon_right');
		// Bottom left (entrance gap at center)
		this.addObstacle(x - 35, y + height / 2 + 5, 'rect', 35, 15, 'dungeon_bottom_left');
		// Bottom right (entrance gap at center)
		this.addObstacle(x + 35, y + height / 2 + 5, 'rect', 35, 15, 'dungeon_bottom_right');
	}

	createTower(x, y, name) {
		const width = 100;
		const height = 220;
		const towerLower = this.make.graphics({ x: 0, y: 0, add: false });
		const towerUpper = this.make.graphics({ x: 0, y: 0, add: false });

		// Tower base
		towerLower.fillStyle(0x5a4a3a, 1);
		towerLower.fillRect(x - width / 2, y - height / 2 + 40, width, height - 40);
		towerUpper.fillStyle(0x5a4a3a, 1);
		towerUpper.fillRect(x - width / 2, y - height / 2, width, 40);

		// Stone rings/bands
		towerLower.lineStyle(3, 0x3a2a1a, 1);
		for (let i = 0; i < 8; i++) {
			towerLower.lineBetween(x - width / 2, y - height / 2 + 40 + i * 27, x + width / 2, y - height / 2 + 40 + i * 27);
		}
		towerUpper.lineStyle(3, 0x3a2a1a, 1);
		towerUpper.lineBetween(x - width / 2, y - height / 2 + 20, x + width / 2, y - height / 2 + 20);

		// Spiral staircase pattern
		towerLower.lineStyle(2, 0x7a6a5a, 0.7);
		for (let i = 0; i < 4; i++) {
			towerLower.lineBetween(x - 15, y - height / 2 + 55 + i * 55, x + 15, y - height / 2 + 85 + i * 55);
		}

		// Conical roof
		towerUpper.fillStyle(0x4a3a2a, 1);
		towerUpper.beginPath();
		towerUpper.moveTo(x - width / 2, y - height / 2);
		towerUpper.lineTo(x, y - height / 2 - 60);
		towerUpper.lineTo(x + width / 2, y - height / 2);
		towerUpper.closePath();
		towerUpper.fill();

		// Tower window (entrance)
		towerUpper.fillStyle(0x8844ff, 0.6);
		towerUpper.fillCircle(x, y - 30, 20);

		// Mystical energy at entrance
		const entranceGlow = this.add.circle(x, y - 30, 30, 0x8844ff, 0.2);
		this.tweens.add({
			targets: entranceGlow,
			scale: { from: 0.9, to: 1.1 },
			alpha: { from: 0.15, to: 0.3 },
			duration: 1800,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.inOut'
		});

		this.add.existing(towerLower);
		this.add.existing(towerUpper);
		this.arenaObjects.push(towerLower, towerUpper, entranceGlow);

		// Store structure data
		this.structures.push({
			x: x,
			y: y,
			width: width,
			height: height,
			name: name,
			type: 'tower',
			entranceX: x,
			entranceY: y - 30,
			entranceRadius: 40,
			description: 'A mystical tower of magic\nPress [ENTER] to ascend'
		});

		// Create precise collision perimeter for tower
		// Top block (includes roof cone)
		this.addObstacle(x, y - height / 2 - 40, 'rect', width + 20, 35, 'tower_top');
		// Left side
		this.addObstacle(x - width / 2 - 10, y - 10, 'rect', 20, height - 70, 'tower_left');
		// Right side
		this.addObstacle(x + width / 2 + 10, y - 10, 'rect', 20, height - 70, 'tower_right');
		// Bottom left (entrance gap at center)
		this.addObstacle(x - 30, y + height / 2 - 10, 'rect', 30, 15, 'tower_bottom_left');
		// Bottom right (entrance gap at center)
		this.addObstacle(x + 30, y + height / 2 - 10, 'rect', 30, 15, 'tower_bottom_right');

		this.depthSortedActors.push({
			type: 'split',
			baseY: y + height / 2,
			upperStartY: y - height / 2 + 40,
			lower: towerLower,
			upper: towerUpper,
			glow: entranceGlow
		});
	}

	/**
	 * Check if player is near any structure entrance
	 */
	checkStructureProximity() {
		if (this.isInsideStructure) return;

		for (const structure of this.structures) {
			const dx = this.playerData.x - structure.entranceX;
			const dy = this.playerData.y - structure.entranceY;
			const dist = Math.hypot(dx, dy);

			if (dist < structure.entranceRadius) {
				// Show entrance prompt
				if (!this.structurePrompt) {
					this.structurePrompt = this.add.text(
						this.playerData.x,
						this.playerData.y - 60,
						`${structure.description}`,
						{
							font: 'bold 14px Arial',
							fill: '#ffffff',
							backgroundColor: '#000000aa',
							padding: { x: 10, y: 5 }
						}
					);
					this.structurePrompt.setOrigin(0.5);
					this.structurePrompt.setDepth(1000);
					this.uiCamera.ignore(this.structurePrompt);
				}

				// Check if player pressed E to enter
				if (Phaser.Input.Keyboard.JustDown(this.keys.e)) {
					this.enterStructure(structure);
				}
				return;
			}
		}

		// Remove prompt if not near any entrance
		if (this.structurePrompt) {
			this.structurePrompt.destroy();
			this.structurePrompt = null;
		}
	}

	/**
	 * Enter a structure and show interior
	 */
	enterStructure(structure) {
		this.isInsideStructure = true;
		this.currentStructure = structure;

		// Create interior container
		this.interiorContainer = this.add.container(0, 0);
		this.interiorContainer.setDepth(500);

		// Semi-transparent overlay
		const overlay = this.add.rectangle(this.ARENA_WIDTH / 2, this.ARENA_HEIGHT / 2, this.ARENA_WIDTH, this.ARENA_HEIGHT, 0x000000, 0.7);
		this.interiorContainer.add(overlay);

		// Interior background
		const interiorBg = this.add.rectangle(this.ARENA_WIDTH / 2, this.ARENA_HEIGHT / 2, 800, 600, 0x2a3a4a, 1);
		this.interiorContainer.add(interiorBg);

		// Interior border
		const border = this.add.rectangle(this.ARENA_WIDTH / 2, this.ARENA_HEIGHT / 2, 800, 600, 0x8844ff);
		border.setStrokeStyle(3, 0x8844ff);
		border.setFilled(false);
		this.interiorContainer.add(border);

		// Structure name
		const titleText = this.add.text(
			this.ARENA_WIDTH / 2,
			this.ARENA_HEIGHT / 2 - 250,
			structure.name,
			{
				font: 'bold 32px Arial',
				fill: '#8844ff'
			}
		);
		titleText.setOrigin(0.5);
		this.interiorContainer.add(titleText);

		// Interior content based on type
		let contentText = '';
		let bgColor = 0x2a3a4a;

		if (structure.type === 'temple') {
			contentText = 'An ancient place of worship.\nSpiritual energy fills the air.\n\nYour wounds heal (partially restored).';
			bgColor = 0x4a5a6a;
		} else if (structure.type === 'dungeon') {
			contentText = 'Dark corridors stretch before you.\nThe faint sound of chains echoes...\n\nYou gain insight! (Temporary power boost).';
			bgColor = 0x2a2a2a;
		} else if (structure.type === 'tower') {
			contentText = 'You ascend the spiral stairs,\nreaching the top chamber.\nPowerful magic swirls around you.\n\nYour abilities are enhanced!';
			bgColor = 0x3a3a5a;
		}

		const contentArea = this.add.rectangle(this.ARENA_WIDTH / 2, this.ARENA_HEIGHT / 2, 700, 300, bgColor, 0.8);
		contentArea.setStrokeStyle(2, 0x8844ff);
		this.interiorContainer.add(contentArea);

		const contentTextObj = this.add.text(
			this.ARENA_WIDTH / 2,
			this.ARENA_HEIGHT / 2,
			contentText,
			{
				font: 'bold 16px Arial',
				fill: '#ffffff',
				align: 'center'
			}
		);
		contentTextObj.setOrigin(0.5);
		this.interiorContainer.add(contentTextObj);

		// Exit instruction
		const exitText = this.add.text(
			this.ARENA_WIDTH / 2,
			this.ARENA_HEIGHT / 2 + 220,
			'Press [E] to exit',
			{
				font: 'bold 14px Arial',
				fill: '#ffd700'
			}
		);
		exitText.setOrigin(0.5);
		this.interiorContainer.add(exitText);

		// Make sure interior is on UI camera
		this.uiCamera.ignore(this.interiorContainer);

		// Pause enemy movement
		this.enemies.forEach(enemy => {
			enemy.paused = true;
		});

		// Remove structure prompt
		if (this.structurePrompt) {
			this.structurePrompt.destroy();
			this.structurePrompt = null;
		}
	}

	/**
	 * Exit current structure
	 */
	exitStructure() {
		if (!this.isInsideStructure) return;

		this.isInsideStructure = false;
		this.currentStructure = null;

		if (this.interiorContainer) {
			this.interiorContainer.destroy();
			this.interiorContainer = null;
		}

		// Resume enemies
		this.enemies.forEach(enemy => {
			enemy.paused = false;
		});
	}

	/**
	 * Start a new wave with randomized enemies and progressive difficulty
	 * @param {number} waveNumber - The wave number to start
	 */
	startWave(waveNumber) {
		this.waveState.currentWave = waveNumber;
		this.waveState.enemiesKilledThisWave = 0;
		this.waveState.waveInProgress = true;

		// Calculate base number of enemies with exponential growth
		const baseCount = this.waveDifficulty.baseEnemies;
		const growthRate = this.waveDifficulty.enemiesPerWave;
		const baseEnemies = Math.floor(baseCount + (waveNumber - 1) * growthRate);
		
		// Add randomization (±30%)
		const variation = this.waveDifficulty.variation;
		const randomFactor = 1 + (Math.random() * variation * 2 - variation);
		const totalEnemies = Math.max(3, Math.floor(baseEnemies * randomFactor));

		// Calculate elite enemy chance (increases with waves)
		const eliteChance = Math.min(0.7, waveNumber * this.waveDifficulty.eliteChancePerWave);
		
		// Distribute enemies randomly based on difficulty
		let enemyCounts = { slime: 0, devil: 0, skeleton: 0 };
		
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

		// Ensure at least some variety in higher waves
		if (waveNumber >= 3 && enemyCounts.devil === 0) {
			enemyCounts.devil = Math.floor(Math.random() * 2) + 1;
			enemyCounts.slime = Math.max(0, enemyCounts.slime - enemyCounts.devil);
		}
		if (waveNumber >= 2 && enemyCounts.skeleton === 0) {
			enemyCounts.skeleton = Math.floor(Math.random() * 2) + 1;
			enemyCounts.slime = Math.max(0, enemyCounts.slime - enemyCounts.skeleton);
		}

		// Calculate total enemies for this wave
		this.waveState.totalEnemiesThisWave = 
			enemyCounts.slime + enemyCounts.devil + enemyCounts.skeleton;

		// Spawn enemies
		for (let i = 0; i < enemyCounts.slime; i++) {
			this.spawnRandomSlime();
		}
		for (let i = 0; i < enemyCounts.devil; i++) {
			this.spawnRandomDevil();
		}
		for (let i = 0; i < enemyCounts.skeleton; i++) {
			this.spawnRandomSkeleton();
		}
        for (let i = 0; i < (enemyCounts.frost_wraith || 0); i++) {
            this.spawnRandomFrostWraith();
        }
        for (let i = 0; i < (enemyCounts.bomber_beetle || 0); i++) {
            this.spawnRandomBomberBeetle();
        }
        for (let i = 0; i < (enemyCounts.storm_mage || 0); i++) {
            this.spawnRandomStormMage();
        }

		// Update wave UI
		if (this.waveText) {
			this.waveText.setText(`Wave: ${this.waveState.currentWave}`);
		}

		// Show wave start notification with enemy composition
		const composition = [];
		if (enemyCounts.slime > 0) composition.push(`${enemyCounts.slime} Slimes`);
		if (enemyCounts.skeleton > 0) composition.push(`${enemyCounts.skeleton} Skeletons`);
		if (enemyCounts.devil > 0) composition.push(`${enemyCounts.devil} Devils`);
		
		this.showWaveNotification(
			`Wave ${waveNumber} Started!\n${composition.join(' | ')}`
		);
	}

	/**
	 * Check if the current wave is complete
	 */
	checkWaveCompletion() {
		if (!this.waveState.waveInProgress) return;

		// Check if all enemies are defeated
		if (this.enemies.length === 0) {
			this.waveState.waveInProgress = false;
			
			// Show completion message
			this.showWaveNotification(`Wave ${this.waveState.currentWave} Complete!`);

			// Start next wave after delay
			this.waveState.nextWaveTimer = this.time.delayedCall(
				this.waveState.waveStartDelay,
				() => {
					this.startWave(this.waveState.currentWave + 1);
				}
			);
		}
	}

	/**
	 * Show wave notification on screen
	 * @param {string} message - The message to display
	 */
	showWaveNotification(message) {
		const gameConfig = this.sys.game.config;
		const centerX = gameConfig.width / 2;
		const centerY = gameConfig.height / 2;

		const notification = this.add.text(centerX, centerY - 100, message, {
			font: 'bold 48px Arial',
			fill: '#00FFFF',
			stroke: '#000000',
			strokeThickness: 6,
			align: 'center'
		});
		notification.setOrigin(0.5);
		notification.setAlpha(0);

		// Animate in and out
		this.tweens.add({
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
		this.tweens.add({
			targets: notification,
			scale: { from: 0.5, to: 1.2 },
			duration: 500,
			ease: 'Back.easeOut',
			yoyo: true,
			hold: 1500
		});

		// Make sure notification is on UI camera only
		if (this.cameras.main) {
			this.cameras.main.ignore(notification);
		}
	}

	/**
	 * Update minimap with player and enemy positions
	 */
	updateMinimap() {
		if (!this.minimap.playerDot || !this.player) return;

		const gameConfig = this.sys.game.config;
		const displayWidth = gameConfig.width;
		const minimapSize = this.minimap.size;
		const minimapX = displayWidth - minimapSize - 20;
		const minimapY = 20;

		// Update player position on minimap
		const playerMapX = minimapX + (this.player.x * this.minimap.scale);
		const playerMapY = minimapY + (this.player.y * this.minimap.scale);
		this.minimap.playerDot.setPosition(playerMapX, playerMapY);

		// Clear old enemy dots
		this.minimap.enemyDots.forEach(dot => dot.destroy());
		this.minimap.enemyDots = [];

		// Add enemy dots
		this.enemies.forEach(enemyData => {
			const enemy = enemyData.enemy;
			const enemyMapX = minimapX + (enemy.x * this.minimap.scale);
			const enemyMapY = minimapY + (enemy.y * this.minimap.scale);

			// Color based on enemy type
			let color = 0xFF6B00; // Slime - orange
			if (enemyData.type === 'devil') {
				color = 0xFF0000; // Devil - red
			} else if (enemyData.type === 'skeleton') {
				color = 0xCCCCCC; // Skeleton - gray
			}

			const dot = this.add.circle(enemyMapX, enemyMapY, 2.5, color, 1);
			this.cameras.main.ignore(dot);
			this.minimap.enemyDots.push(dot);
		});
	}

	/**
	 * Update enemy tracking indicators for off-screen enemies
	 */
	updateEnemyIndicators() {
		if (!this.player) return;

		const gameConfig = this.sys.game.config;
		const displayWidth = gameConfig.width;
		const displayHeight = gameConfig.height;

		// Clear old indicators
		this.enemyIndicators.forEach(indicator => {
			if (indicator.arrow) indicator.arrow.destroy();
			if (indicator.text) indicator.text.destroy();
		});
		this.enemyIndicators = [];

		// Get camera bounds
		const cam = this.cameras.main;
		const camCenterX = cam.worldView.centerX;
		const camCenterY = cam.worldView.centerY;
		const viewWidth = cam.worldView.width;
		const viewHeight = cam.worldView.height;

		// Track enemies outside view
		this.enemies.forEach(enemyData => {
			const enemy = enemyData.enemy;
			const dx = enemy.x - camCenterX;
			const dy = enemy.y - camCenterY;

			// Check if enemy is outside camera view
			const isOutside = Math.abs(dx) > viewWidth / 2 || Math.abs(dy) > viewHeight / 2;

			if (isOutside) {
				// Calculate angle to enemy
				const angle = Math.atan2(dy, dx);
				
				// Calculate indicator position at edge of screen
				const margin = 40;
				let indicatorX, indicatorY;

				// Determine which edge to place indicator on
				const normalized = Math.abs(Math.cos(angle)) / (viewWidth / viewHeight);
				
				if (normalized > Math.abs(Math.sin(angle)) / 1) {
					// Left or right edge
					indicatorX = dx > 0 ? displayWidth - margin : margin;
					indicatorY = displayHeight / 2 + (dy / viewHeight) * (displayHeight - 2 * margin);
				} else {
					// Top or bottom edge
					indicatorY = dy > 0 ? displayHeight - margin : margin;
					indicatorX = displayWidth / 2 + (dx / viewWidth) * (displayWidth - 2 * margin);
				}

				// Clamp to screen bounds
				indicatorX = Phaser.Math.Clamp(indicatorX, margin, displayWidth - margin);
				indicatorY = Phaser.Math.Clamp(indicatorY, margin, displayHeight - margin);

				// Color based on enemy type
				let color = 0xFF6B00;
				let symbol = '▸';
				if (enemyData.type === 'devil') {
					color = 0xFF0000;
					symbol = '▸';
				} else if (enemyData.type === 'skeleton') {
					color = 0xCCCCCC;
					symbol = '▸';
				}

				// Create arrow indicator
				const arrow = this.add.text(indicatorX, indicatorY, symbol, {
					font: 'bold 20px Arial',
					fill: '#' + color.toString(16).padStart(6, '0'),
					stroke: '#000000',
					strokeThickness: 3
				});
				arrow.setOrigin(0.5, 0.5);
				arrow.setRotation(angle);
				this.cameras.main.ignore(arrow);

				// Distance text
				const distance = Math.floor(Math.hypot(dx, dy) / 10);
				const distText = this.add.text(indicatorX, indicatorY - 15, `${distance}`, {
					font: 'bold 12px Arial',
					fill: '#FFFFFF',
					stroke: '#000000',
					strokeThickness: 2
				});
				distText.setOrigin(0.5, 1);
				this.cameras.main.ignore(distText);

				this.enemyIndicators.push({ arrow, text: distText });
			}
		});
	}

	spawnRandomSlime() {
		const padding = this.ARENA_PADDING + 200;
		const x = padding + Math.random() * (this.ARENA_WIDTH - 2 * padding);
		const y = padding + Math.random() * (this.ARENA_HEIGHT - 2 * padding);

		const enemy = generateEnemySprite(this, x, y, 'slime');

		// Random size for slime
		const sizeScale = Phaser.Math.FloatBetween(0.6, 1.2);
		enemy.setScale(sizeScale);

		// Red tint for slime
		if (enemy.setTint) {
			enemy.setTint(0xff4444);
		} else if (enemy.getChildren) {
			enemy.getChildren().forEach(child => {
				if (child.setTint) {
					child.setTint(0xff4444);
				}
			});
		}

		// Enemy health
		enemy.hp = 30 * sizeScale;
		enemy.maxHp = 30 * sizeScale;

		// Enemy health bar
		const healthBar = this.add.rectangle(x, y - 30 * sizeScale, 40 * sizeScale, 6, 0xff0000, 0.8);
		healthBar.setOrigin(0.5);

		// Simple movement state
		const angle = Math.random() * Math.PI * 2;
		const baseSpeed = Phaser.Math.FloatBetween(0.6, 1.2) * sizeScale;
		const vx = Math.cos(angle) * baseSpeed;
		const vy = Math.sin(angle) * baseSpeed;

		// Ensure slimes are hidden from UI camera
		if (this.uiCamera) {
			this.uiCamera.ignore(enemy);
			this.uiCamera.ignore(healthBar);
			if (enemy.getChildren) {
				enemy.getChildren().forEach(child => this.uiCamera.ignore(child));
			}
		}

		this.enemies.push({
			enemy,
			healthBar,
			sizeScale,
			vx,
			vy,
			type: 'slime',
			lastAttackTime: -Infinity,
			attackCooldown: 600
		});
	}

	spawnRandomFrostWraith() {
		const padding = this.ARENA_PADDING + 200;
		const x = padding + Math.random() * (this.ARENA_WIDTH - 2 * padding);
		const y = padding + Math.random() * (this.ARENA_HEIGHT - 2 * padding);

		const enemy = generateEnemySprite(this, x, y, 'frost_wraith');
		const sizeScale = Phaser.Math.FloatBetween(1.0, 1.3);
		enemy.setScale(sizeScale);
		enemy.setTint(0x66ccff);

		// Frosty animation: shimmer and fade
		this.tweens.add({
			targets: enemy,
			alpha: { from: 0.7, to: 1 },
			yoyo: true,
			repeat: -1,
			duration: 800
		});

		const healthBar = this.add.rectangle(x, y - 32 * sizeScale, 42 * sizeScale, 6, 0x66ccff, 0.8);
		healthBar.setOrigin(0.5);

		const angle = Math.random() * Math.PI * 2;
		const baseSpeed = Phaser.Math.FloatBetween(1.2, 1.6) * sizeScale;
		const vx = Math.cos(angle) * baseSpeed;
		const vy = Math.sin(angle) * baseSpeed;

		if (this.uiCamera) {
			this.uiCamera.ignore(enemy);
			this.uiCamera.ignore(healthBar);
			if (enemy.getChildren) {
				enemy.getChildren().forEach(child => this.uiCamera.ignore(child));
			}
		}

		this.enemies.push({
			enemy,
			healthBar,
			sizeScale,
			vx,
			vy,
			type: 'frost_wraith',
			lastAttackTime: -Infinity,
			attackCooldown: 900,
			freezeCooldown: 3000,
			lastFreezeTime: -Infinity
		});
	}

	spawnRandomBomberBeetle() {
		const padding = this.ARENA_PADDING + 200;
		const x = padding + Math.random() * (this.ARENA_WIDTH - 2 * padding);
		const y = padding + Math.random() * (this.ARENA_HEIGHT - 2 * padding);

		const enemy = generateEnemySprite(this, x, y, 'bomber_beetle');
		const sizeScale = Phaser.Math.FloatBetween(1.2, 1.5);
		enemy.setScale(sizeScale);
		enemy.setTint(0xffaa00);

		// Bomber animation: shake and flash
		this.tweens.add({
			targets: enemy,
			rotation: { from: -0.1, to: 0.1 },
			yoyo: true,
			repeat: -1,
			duration: 400
		});
		this.tweens.add({
			targets: enemy,
			alpha: { from: 1, to: 0.7 },
			yoyo: true,
			repeat: -1,
			duration: 600
		});

		const healthBar = this.add.rectangle(x, y - 34 * sizeScale, 44 * sizeScale, 6, 0xffaa00, 0.8);
		healthBar.setOrigin(0.5);

		const angle = Math.random() * Math.PI * 2;
		const baseSpeed = Phaser.Math.FloatBetween(0.7, 1.1) * sizeScale;
		const vx = Math.cos(angle) * baseSpeed;
		const vy = Math.sin(angle) * baseSpeed;

		if (this.uiCamera) {
			this.uiCamera.ignore(enemy);
			this.uiCamera.ignore(healthBar);
			if (enemy.getChildren) {
				enemy.getChildren().forEach(child => this.uiCamera.ignore(child));
			}
		}

		this.enemies.push({
			enemy,
			healthBar,
			sizeScale,
			vx,
			vy,
			type: 'bomber_beetle',
			lastAttackTime: -Infinity,
			attackCooldown: 1200,
			bombCooldown: 2500,
			lastBombTime: -Infinity
		});
	}

	spawnRandomStormMage() {
		const padding = this.ARENA_PADDING + 200;
		const x = padding + Math.random() * (this.ARENA_WIDTH - 2 * padding);
		const y = padding + Math.random() * (this.ARENA_HEIGHT - 2 * padding);

		const enemy = generateEnemySprite(this, x, y, 'storm_mage');
		const sizeScale = Phaser.Math.FloatBetween(1.1, 1.4);
		enemy.setScale(sizeScale);
		enemy.setTint(0x8888ff);

		// Storm Mage animation: glow and pulse
		this.tweens.add({
			targets: enemy,
			alpha: { from: 0.8, to: 1 },
			yoyo: true,
			repeat: -1,
			duration: 700
		});
		this.tweens.add({
			targets: enemy,
			scale: { from: sizeScale, to: sizeScale * 1.08 },
			yoyo: true,
			repeat: -1,
			duration: 900
		});

		const healthBar = this.add.rectangle(x, y - 36 * sizeScale, 46 * sizeScale, 6, 0x8888ff, 0.8);
		healthBar.setOrigin(0.5);

		const angle = Math.random() * Math.PI * 2;
		const baseSpeed = Phaser.Math.FloatBetween(0.9, 1.3) * sizeScale;
		const vx = Math.cos(angle) * baseSpeed;
		const vy = Math.sin(angle) * baseSpeed;

		if (this.uiCamera) {
			this.uiCamera.ignore(enemy);
			this.uiCamera.ignore(healthBar);
			if (enemy.getChildren) {
				enemy.getChildren().forEach(child => this.uiCamera.ignore(child));
			}
		}

		this.enemies.push({
			enemy,
			healthBar,
			sizeScale,
			vx,
			vy,
			type: 'storm_mage',
			lastAttackTime: -Infinity,
			attackCooldown: 1100,
			teleportCooldown: 4000,
			lastTeleportTime: -Infinity,
			lightningCooldown: 2200,
			lastLightningTime: -Infinity
		});
	}

	spawnRandomDevil() {
		const padding = this.ARENA_PADDING + 250;
		const x = padding + Math.random() * (this.ARENA_WIDTH - 2 * padding);
		const y = padding + Math.random() * (this.ARENA_HEIGHT - 2 * padding);

		const enemy = generateEnemySprite(this, x, y, 'devil');

		const sizeScale = Phaser.Math.FloatBetween(1.0, 1.4);
		enemy.setScale(sizeScale);

		enemy.hp = 80 * sizeScale;
		enemy.maxHp = 80 * sizeScale;

		const healthBar = this.add.rectangle(x, y - 34 * sizeScale, 50 * sizeScale, 7, 0xff5500, 0.9);
		healthBar.setOrigin(0.5);

		const angle = Math.random() * Math.PI * 2;
		const baseSpeed = Phaser.Math.FloatBetween(0.9, 1.4) * sizeScale;
		const vx = Math.cos(angle) * baseSpeed;
		const vy = Math.sin(angle) * baseSpeed;

		this.setupDevilAnimations(enemy, sizeScale);

		if (this.uiCamera) {
			this.uiCamera.ignore(enemy);
			this.uiCamera.ignore(healthBar);
			if (enemy.getChildren) {
				enemy.getChildren().forEach(child => this.uiCamera.ignore(child));
			}
		}

		this.enemies.push({
			enemy,
			healthBar,
			sizeScale,
			vx,
			vy,
			type: 'devil',
			nextFireTime: this.time.now + Phaser.Math.Between(600, 1400),
			nextDashTime: this.time.now + Phaser.Math.Between(900, 1800),
			dashUntil: null,
			dashDirX: 0,
			dashDirY: 0
		});
	}

	setupDevilAnimations(enemy) {
		if (enemy.wings) {
			this.tweens.add({
				targets: enemy.wings,
				scaleY: { from: 0.9, to: 1.1 },
				duration: 500,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.inOut'
			});
		}

		if (enemy.tail) {
			this.tweens.add({
				targets: enemy.tail,
				rotation: { from: -0.3, to: 0.3 },
				duration: 800,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.inOut'
			});
		}

		if (enemy.weapon) {
			this.tweens.add({
				targets: enemy.weapon,
				rotation: { from: -0.2, to: 0.4 },
				duration: 700,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.inOut'
			});
		}

		if (enemy.glow) {
			this.tweens.add({
				targets: enemy.glow,
				alpha: { from: 0.2, to: 0.5 },
				duration: 600,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.inOut'
			});
		}
	}

	spawnRandomSkeleton() {
		const padding = this.ARENA_PADDING + 250;
		const x = padding + Math.random() * (this.ARENA_WIDTH - 2 * padding);
		const y = padding + Math.random() * (this.ARENA_HEIGHT - 2 * padding);

		const enemy = generateEnemySprite(this, x, y, 'skeleton');

		const sizeScale = Phaser.Math.FloatBetween(0.8, 1.2);
		enemy.setScale(sizeScale);

		enemy.hp = 50 * sizeScale;
		enemy.maxHp = 50 * sizeScale;

		const healthBar = this.add.rectangle(x, y - 32 * sizeScale, 45 * sizeScale, 6, 0xcccccc, 0.85);
		healthBar.setOrigin(0.5);

		const angle = Math.random() * Math.PI * 2;
		const baseSpeed = Phaser.Math.FloatBetween(0.4, 0.8) * sizeScale;
		const vx = Math.cos(angle) * baseSpeed;
		const vy = Math.sin(angle) * baseSpeed;

		this.setupSkeletonAnimations(enemy, sizeScale);

		if (this.uiCamera) {
			this.uiCamera.ignore(enemy);
			this.uiCamera.ignore(healthBar);
			if (enemy.getChildren) {
				enemy.getChildren().forEach(child => this.uiCamera.ignore(child));
			}
		}

		this.enemies.push({
			enemy,
			healthBar,
			sizeScale,
			vx,
			vy,
			type: 'skeleton',
			nextArrowTime: this.time.now + Phaser.Math.Between(1200, 2400)
		});
	}

	setupSkeletonAnimations(enemy) {
		if (enemy.skull) {
			this.tweens.add({
				targets: enemy.skull,
				y: { from: enemy.skull.y - 1, to: enemy.skull.y + 1 },
				duration: 800,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.inOut'
			});
		}

		if (enemy.leftArm) {
			this.tweens.add({
				targets: enemy.leftArm,
				rotation: { from: -0.1, to: 0.1 },
				duration: 900,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.inOut'
			});
		}

		if (enemy.rightArm) {
			this.tweens.add({
				targets: enemy.rightArm,
				rotation: { from: -0.15, to: 0.15 },
				duration: 850,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.inOut'
			});
		}
	}

	scheduleNextPowerupSpawn(delayOverride = null) {
		const jitter = Phaser.Math.Between(-1200, 1400);
		const delay = delayOverride === null ? this.powerupConfig.spawnInterval + jitter : delayOverride;
		this.powerupSpawnState.nextSpawnTime = this.time.now + Math.max(1000, delay);
	}

	updatePowerups(time) {
		if (time >= this.powerupSpawnState.nextSpawnTime) {
			const timeSinceLast = time - this.powerupSpawnState.lastSpawnTime;
			const shouldForce = timeSinceLast >= this.powerupConfig.guaranteedInterval;
			const shouldSpawn = shouldForce || !this.powerupSpawnState.hasSpawned || Math.random() < this.powerupConfig.spawnChance;
			if (this.powerups.length < this.powerupConfig.maxPowerups && shouldSpawn) {
				this.spawnRandomPowerup();
				this.powerupSpawnState.lastSpawnTime = time;
				this.powerupSpawnState.hasSpawned = true;
			}
			this.scheduleNextPowerupSpawn();
		}

		for (let i = this.powerups.length - 1; i >= 0; i--) {
			const powerup = this.powerups[i];
			const powerupX = powerup.container ? powerup.container.x : powerup.x;
			const powerupY = powerup.container ? powerup.container.y : powerup.y;
			const dx = this.playerData.x - powerupX;
			const dy = this.playerData.y - powerupY;
			const dist = Math.hypot(dx, dy);
			if (dist <= powerup.pickupRadius) {
				this.collectPowerup({ ...powerup, x: powerupX, y: powerupY }, time);
				this.powerups.splice(i, 1);
				continue;
			}

			if (time >= powerup.expiresAt) {
				if (powerup.container) {
					this.tweens.add({
						targets: powerup.container,
						alpha: 0,
						scale: 0.6,
						duration: 400,
						onComplete: () => powerup.container.destroy()
					});
				}
				this.powerups.splice(i, 1);
			}
		}
	}

	spawnRandomPowerup() {
		const types = Object.keys(this.powerupCatalog);
		const type = types[Math.floor(Math.random() * types.length)];
		const position = this.findPowerupSpawn();
		if (!position) return;
		this.spawnPowerup(type, position.x, position.y);
	}

	findPowerupSpawn() {
		const padding = this.ARENA_PADDING + 220;
		for (let attempt = 0; attempt < 8; attempt++) {
			const x = padding + Math.random() * (this.ARENA_WIDTH - 2 * padding);
			const y = padding + Math.random() * (this.ARENA_HEIGHT - 2 * padding);
			const dist = Math.hypot(x - this.playerData.x, y - this.playerData.y);
			if (dist < this.powerupConfig.minPlayerDistance) continue;
			if (this.checkObstacleCollision(x, y, 20)) continue;
			if (this.isPositionInLava(x, y)) continue;
			return { x, y };
		}
		return null;
	}

	isPositionInLava(x, y) {
		for (const lavaPool of this.lavaPools) {
			const dx = Math.abs(x - lavaPool.x);
			const dy = Math.abs(y - lavaPool.y);
			const normalizedDist = (dx * dx) / ((lavaPool.width / 2) * (lavaPool.width / 2)) +
				(dy * dy) / ((lavaPool.height / 2) * (lavaPool.height / 2));
			if (normalizedDist <= 1) return true;
		}
		return false;
	}

	spawnPowerup(type, x, y) {
		const container = this.createPowerupVisuals(type, x, y);
		container.setDepth(6);
		const powerup = {
			type,
			x,
			y,
			container,
			pickupRadius: 26,
			expiresAt: this.time.now + this.powerupConfig.despawnTime
		};
		this.powerups.push(powerup);
	}

	createPowerupVisuals(type, x, y) {
		const container = this.add.container(x, y);
		const tint = this.powerupCatalog[type]?.color || 0xffffff;
		let applyFloat = true;

		if (type === 'blood_orb') {
			const glow = this.add.circle(0, 0, 18, tint, 0.25);
			const core = this.add.circle(0, 0, 10, tint, 0.9);
			const highlight = this.add.circle(-3, -4, 3, 0xffffff, 0.9);
			const ring = this.add.circle(0, 0, 13, 0xff2222, 0.6).setStrokeStyle(2, 0xff7777, 0.9);
			container.add([glow, ring, core, highlight]);
			this.tweens.add({
				targets: glow,
				scale: { from: 0.9, to: 1.15 },
				alpha: { from: 0.2, to: 0.4 },
				duration: 900,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.inOut'
			});
			this.tweens.add({
				targets: ring,
				angle: { from: 0, to: 360 },
				duration: 2600,
				repeat: -1
			});
		} else if (type === 'fury_totem') {
			const base = this.add.circle(0, 0, 16, 0x4a1a00, 0.8);
			const flame = this.add.triangle(0, -4, 0, 18, 14, -10, -14, -10, tint, 0.9);
			const ember = this.add.circle(0, -10, 5, 0xffdd55, 0.9);
			container.add([base, flame, ember]);
			this.tweens.add({
				targets: [flame, ember],
				scaleY: { from: 0.9, to: 1.15 },
				alpha: { from: 0.7, to: 1 },
				duration: 320,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.inOut'
			});
			this.tweens.add({
				targets: container,
				y: y - 6,
				duration: 1400,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.inOut'
			});
			applyFloat = false;
		} else if (type === 'time_shard') {
			const shard = this.add.polygon(0, 0, [0, -16, 12, 0, 0, 16, -12, 0], tint, 0.95);
			const outline = this.add.polygon(0, 0, [0, -18, 14, 0, 0, 18, -14, 0], 0x224455, 0.6);
			const spark = this.add.circle(0, -12, 3, 0xffffff, 0.9);
			container.add([outline, shard, spark]);
			this.tweens.add({
				targets: container,
				angle: { from: -8, to: 8 },
				duration: 1200,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.inOut'
			});
			this.tweens.add({
				targets: spark,
				y: -16,
				alpha: { from: 0.4, to: 1 },
				duration: 600,
				yoyo: true,
				repeat: -1
			});
		} else if (type === 'iron_aegis') {
			const ring = this.add.circle(0, 0, 18, 0x1b2d3d, 0.7).setStrokeStyle(3, tint, 0.9);
			const sigil = this.add.star(0, 0, 6, 4, 9, tint, 0.9);
			const core = this.add.circle(0, 0, 5, 0xffffff, 0.7);
			container.add([ring, sigil, core]);
			this.tweens.add({
				targets: ring,
				scale: { from: 0.9, to: 1.1 },
				alpha: { from: 0.6, to: 0.9 },
				duration: 900,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.inOut'
			});
			this.tweens.add({
				targets: sigil,
				angle: { from: 0, to: 360 },
				duration: 2400,
				repeat: -1
			});
		} else {
			const glow = this.add.circle(0, 0, 16, tint, 0.4);
			const core = this.add.circle(0, 0, 8, tint, 0.9);
			container.add([glow, core]);
		}

		if (applyFloat) {
			this.tweens.add({
				targets: container,
				y: y - 8,
				duration: 1600,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.inOut'
			});
		}

		if (this.uiCamera) {
			this.uiCamera.ignore(container);
			container.list.forEach(child => this.uiCamera.ignore(child));
		}

		return container;
	}

	collectPowerup(powerup, time) {
		const catalog = this.powerupCatalog[powerup.type];
		this.spawnPowerupBurst(powerup.x, powerup.y, catalog?.color || 0xffffff);
		if (powerup.container) {
			powerup.container.destroy();
		}

		if (powerup.type === 'blood_orb') {
			const heal = catalog?.healAmount || 30;
			const character = gameState.character;
			character.hp = Math.min(character.maxHp, character.hp + heal);
			this.showPowerupText(powerup.x, powerup.y, `+${heal} HP`, '#ff6666');
		} else if (powerup.type === 'fury_totem') {
			this.buffState.damageUntil = time + (catalog?.duration || 10000);
			this.showPowerupText(powerup.x, powerup.y, 'Fury Surge', '#ffcc66');
		} else if (powerup.type === 'time_shard') {
			this.buffState.cooldownUntil = time + (catalog?.duration || 8000);
			this.showPowerupText(powerup.x, powerup.y, 'Time Warp', '#88ddff');
		} else if (powerup.type === 'iron_aegis') {
			const shield = catalog?.shieldAmount || 100;
			this.playerShield.value = Math.min(this.playerShield.max, this.playerShield.value + shield);
			this.showPowerupText(powerup.x, powerup.y, 'Aegis Shield', '#b3ddff');
		}
	}

	showPowerupText(x, y, text, color) {
		const label = this.add.text(x, y - 18, text, {
			font: 'bold 18px Arial',
			fill: color,
			stroke: '#000000',
			strokeThickness: 3
		});
		label.setOrigin(0.5, 0.5);
		label.setDepth(1002);
		if (this.uiCamera) this.uiCamera.ignore(label);
		this.tweens.add({
			targets: label,
			y: y - 60,
			alpha: 0,
			duration: 900,
			ease: 'Quad.easeOut',
			onComplete: () => label.destroy()
		});
	}

	spawnPowerupBurst(x, y, color) {
		const burst = this.add.circle(x, y, 8, color, 0.8);
		if (this.uiCamera) this.uiCamera.ignore(burst);
		this.tweens.add({
			targets: burst,
			scale: 2.2,
			alpha: 0,
			duration: 260,
			onComplete: () => burst.destroy()
		});

		for (let i = 0; i < 6; i++) {
			const angle = (i / 6) * Math.PI * 2;
			const spark = this.add.circle(x, y, 2.5, color, 0.9);
			if (this.uiCamera) this.uiCamera.ignore(spark);
			this.tweens.add({
				targets: spark,
				x: x + Math.cos(angle) * 26,
				y: y + Math.sin(angle) * 26,
				alpha: 0,
				duration: 320,
				onComplete: () => spark.destroy()
			});
		}
	}

	spawnShieldAbsorbEffect() {
		const ring = this.add.circle(this.playerData.x, this.playerData.y, 16, 0x66ccff, 0.2);
		ring.setStrokeStyle(2, 0x99ddff, 0.8);
		if (this.uiCamera) this.uiCamera.ignore(ring);
		this.tweens.add({
			targets: ring,
			scale: 1.6,
			alpha: 0,
			duration: 240,
			onComplete: () => ring.destroy()
		});
	}

	updateBuffUI(time) {
		// Update shield display
		this.shieldText.setText(`${Math.round(this.playerShield.value)}/${this.playerShield.max}`);
		if (this.playerShield.value > 0) {
			this.shieldIcon.setFill('#88ff88');
			this.shieldText.setFill('#88ff88');
		} else {
			this.shieldIcon.setFill('#888888');
			this.shieldText.setFill('#888888');
		}

		// Collect active buffs
		const activeBuffs = [];
		if (time < this.buffState.damageUntil) {
			activeBuffs.push({
				type: 'fury',
				name: 'Fury',
				remaining: Math.max(0, this.buffState.damageUntil - time),
				color: '#ffaa33',
				icon: '⚡'
			});
		}
		if (time < this.buffState.cooldownUntil) {
			activeBuffs.push({
				type: 'cooldown',
				name: 'Warp',
				remaining: Math.max(0, this.buffState.cooldownUntil - time),
				color: '#66ccff',
				icon: '⏱'
			});
		}
		if (time < this.buffState.speedUntil) {
			activeBuffs.push({
				type: 'speed',
				name: 'Speed',
				remaining: Math.max(0, this.buffState.speedUntil - time),
				color: '#ffff66',
				icon: '→'
			});
		}

		// Update buff panels
		for (let i = 0; i < this.activeBuffPanels.length; i++) {
			const panel = this.activeBuffPanels[i];
			if (i < activeBuffs.length) {
				const buff = activeBuffs[i];
				const maxDuration = buff.type === 'fury' ? 10000 : buff.type === 'cooldown' ? 8000 : 8000;
				const percent = Math.max(0, Math.min(1, buff.remaining / maxDuration));

				panel.icon.setText(buff.icon);
				panel.icon.setFill(buff.color);
				panel.name.setText(buff.name);
				panel.name.setFill(buff.color);
				panel.timeBar.width = 120 * percent;
				panel.timeBar.setFillStyle(Phaser.Display.Color.HexStringToColor(buff.color).color, 1);
				const seconds = Math.ceil(buff.remaining / 1000);
				panel.timeText.setText(`${Math.max(0, seconds)}s`);
				panel.timeText.setFill(buff.color);

				panel.bg.setVisible(true);
				panel.icon.setVisible(true);
				panel.name.setVisible(true);
				panel.timeBg.setVisible(true);
				panel.timeBar.setVisible(true);
				panel.timeText.setVisible(true);
			} else {
				panel.bg.setVisible(false);
				panel.icon.setVisible(false);
				panel.name.setVisible(false);
				panel.timeBg.setVisible(false);
				panel.timeBar.setVisible(false);
				panel.timeText.setVisible(false);
			}
		}
	}

	updateDepthSorting() {
		if (!this.player || !this.playerData) return;

		const depthScale = 0.01;
		const playerDepth = 100 + this.playerData.y * depthScale;
		this.player.setDepth(playerDepth);

		if (this.centerpieceStatue) {
			const statue = this.centerpieceStatue;
			const lowerDepth = 100 + statue.baseY * depthScale;
			statue.lower.setDepth(lowerDepth);
			if (this.playerData.y < statue.headY) {
				statue.upper.setDepth(playerDepth + 20);
				if (statue.eyeGlowLeft) statue.eyeGlowLeft.setDepth(playerDepth + 21);
				if (statue.eyeGlowRight) statue.eyeGlowRight.setDepth(playerDepth + 21);
			} else {
				statue.upper.setDepth(playerDepth - 3);
				if (statue.eyeGlowLeft) statue.eyeGlowLeft.setDepth(playerDepth - 2);
				if (statue.eyeGlowRight) statue.eyeGlowRight.setDepth(playerDepth - 2);
			}
		}

		for (const actor of this.depthSortedActors) {
			if (actor.type === 'single') {
				const baseDepth = 100 + actor.baseY * depthScale;
				actor.obj.setDepth(baseDepth);
				if (actor.glow) actor.glow.setDepth(baseDepth + 1);
				if (actor.fx) actor.fx.setDepth(baseDepth + 2);
				continue;
			}

			const lowerDepth = 100 + actor.baseY * depthScale;
			actor.lower.setDepth(lowerDepth);
			if (this.playerData.y < actor.upperStartY) {
				actor.upper.setDepth(playerDepth + 14);
				if (actor.glow) actor.glow.setDepth(playerDepth + 15);
			} else {
				actor.upper.setDepth(playerDepth - 2);
				if (actor.glow) actor.glow.setDepth(playerDepth - 1);
			}
		}

		if (this.enemies) {
			for (const enemyData of this.enemies) {
				if (!enemyData.enemy) continue;
				const enemyDepth = 100 + enemyData.enemy.y * depthScale;
				enemyData.enemy.setDepth(enemyDepth);
				if (enemyData.healthBar) enemyData.healthBar.setDepth(enemyDepth + 1);
			}
		}
	}

	update(time, delta) {
		if (!this.player) return;

		if (this.keys.esc && Phaser.Input.Keyboard.JustDown(this.keys.esc)) {
			openPauseMenu(this, 'ChaossCrucibleScene');
		}

		const deltaScale = delta ? delta / 16.666 : 1;

		// Movement
		let moveX = 0;
		let moveY = 0;

		if (this.keys.w.isDown) moveY -= 1;
		if (this.keys.s.isDown) moveY += 1;
		if (this.keys.a.isDown) moveX -= 1;
		if (this.keys.d.isDown) moveX += 1;

		if (moveX !== 0 || moveY !== 0) {
			const length = Math.sqrt(moveX * moveX + moveY * moveY);
			const speed = this.playerData.speed * this.getSpeedMultiplier(time);
			moveX = (moveX / length) * speed;
			moveY = (moveY / length) * speed;
			
			// Slight screen shake during high-speed buff
			if (this.getSpeedMultiplier(time) > 1.1) {
				const shake = 0.003 + Math.random() * 0.003;
				this.safeCameraShake(45, shake, 90);
			}
		}

		// Update facing and sprite visibility based on movement
		if (moveY < 0) {
			this.playerFacing = 'up';
		} else if (moveY > 0) {
			this.playerFacing = 'down';
		}

		if (this.player.frontSprite && this.player.backSprite) {
			const showBack = this.playerFacing === 'up';
			this.player.frontSprite.setVisible(!showBack);
			this.player.backSprite.setVisible(showBack);
		}

		if (moveX !== 0) {
			const direction = moveX > 0 ? 1 : -1;
			const absScaleX = Math.abs(this.player.scaleX) || 1;
			this.player.scaleX = absScaleX * direction;
		}

		this.playerData.x += moveX;
		this.playerData.y += moveY;

		// Clamp player to arena bounds
		this.playerData.x = Phaser.Math.Clamp(this.playerData.x, this.ARENA_PADDING, this.ARENA_WIDTH - this.ARENA_PADDING);
		this.playerData.y = Phaser.Math.Clamp(this.playerData.y, this.ARENA_PADDING, this.ARENA_HEIGHT - this.ARENA_PADDING);

		// Check and resolve obstacle collisions for player
		const playerRadius = 20;
		const adjustedPos = this.resolveObstacleCollision(this.playerData.x, this.playerData.y, playerRadius);
		this.playerData.x = adjustedPos.x;
		this.playerData.y = adjustedPos.y;

		this.player.setPosition(this.playerData.x, this.playerData.y);
		this.updateDepthSorting();

		// Check if player is standing in lava
		this.checkLavaDamage(time);

		this.updatePowerups(time);

		// Update powerup UI
		this.updateBuffUI(time);

		// Check structure proximity and handle entry/exit
		if (this.isInsideStructure) {
			// Check if player wants to exit structure
			if (Phaser.Input.Keyboard.JustDown(this.keys.e)) {
				this.exitStructure();
			}
		} else {
			// Check if player is near any structure entrance
			this.checkStructureProximity();
		}

		const pointer = this.input.activePointer;
		const worldPoint = pointer.positionToCamera(this.cameras.main);
		const aim = this.getAimDirection(worldPoint?.x, worldPoint?.y);
		const wantsBasic = (this.keys.space && this.keys.space.isDown) || pointer.isDown;
		const wantsAbility = Phaser.Input.Keyboard.JustDown(this.keys.e) || Phaser.Input.Keyboard.JustDown(this.keys.shift);

		if (wantsBasic) {
			this.queueBasicAttack(aim);
		}

		if (wantsAbility) {
			this.queueAbility(aim);
		}

		this.updateProjectiles(deltaScale);
		this.updateEnemyProjectiles(deltaScale);

		// Check enemy collision with player
		this.enemies.forEach((enemyData) => {
			const dx = enemyData.enemy.x - this.playerData.x;
			const dy = enemyData.enemy.y - this.playerData.y;
			const dist = Math.hypot(dx, dy);
			const enemyRadius = this.getEnemyRadius(enemyData.sizeScale);
			
			if (dist < playerRadius + enemyRadius) {
				// Enemy is touching player - deal damage
				const enemyDamage = 5 * enemyData.sizeScale; // Bigger enemies deal more damage
				this.damagePlayer(enemyDamage);

				// Calculate knockback direction
				const knockbackDist = dist || 1;
				const knockX = (this.playerData.x - enemyData.enemy.x) / knockbackDist;
				const knockY = (this.playerData.y - enemyData.enemy.y) / knockbackDist;

				// Trigger attack animation and effects
				if (enemyData.type === 'slime') {
					this.triggerSlimeAttack(enemyData, knockX, knockY);
				}

				// Apply knockback to player
				this.playerData.vx += knockX * 4 * enemyData.sizeScale;
				this.playerData.vy += knockY * 4 * enemyData.sizeScale;
			}
		});

		// Update enemy movement + health bars
		this.enemies.forEach((enemyData) => {
			const { enemy, healthBar, sizeScale } = enemyData;
			if (!enemy) return;
			if (enemyData.paused) return; // Skip if paused (inside structure)

			// Light steering toward player
			const dx = this.player.x - enemy.x;
			const dy = this.player.y - enemy.y;
			const dist = Math.hypot(dx, dy) || 1;
			const steerStrength = 0.02;
			enemyData.vx += (dx / dist) * steerStrength;
			enemyData.vy += (dy / dist) * steerStrength;

			// Clamp speed
			const maxSpeed = 1.6 * sizeScale;
			const speed = Math.hypot(enemyData.vx, enemyData.vy) || 1;
			if (speed > maxSpeed) {
				enemyData.vx = (enemyData.vx / speed) * maxSpeed;
				enemyData.vy = (enemyData.vy / speed) * maxSpeed;
			}

			if (enemyData.type === 'devil') {
				this.handleDevilAbilities(enemyData);
			} else if (enemyData.type === 'skeleton') {
				this.handleSkeletonAbilities(enemyData);
			}

			enemy.x += enemyData.vx;
			enemy.y += enemyData.vy;

			// Check and resolve obstacle collisions for enemies
			const enemyRadius = this.getEnemyRadius(enemyData.sizeScale);
			const adjustedEnemyPos = this.resolveObstacleCollision(enemy.x, enemy.y, enemyRadius);
			enemy.x = adjustedEnemyPos.x;
			enemy.y = adjustedEnemyPos.y;

			// Bounce off arena bounds
			const minX = this.ARENA_PADDING + 20;
			const maxX = this.ARENA_WIDTH - this.ARENA_PADDING - 20;
			const minY = this.ARENA_PADDING + 20;
			const maxY = this.ARENA_HEIGHT - this.ARENA_PADDING - 20;

			if (enemy.x <= minX || enemy.x >= maxX) {
				enemyData.vx *= -1;
				enemy.x = Phaser.Math.Clamp(enemy.x, minX, maxX);
			}

			if (enemy.y <= minY || enemy.y >= maxY) {
				enemyData.vy *= -1;
				enemy.y = Phaser.Math.Clamp(enemy.y, minY, maxY);
			}

			let barOffset = 30;
			let barWidth = 40;
			if (enemyData.type === 'devil') {
				barOffset = 34;
				barWidth = 50;
			} else if (enemyData.type === 'skeleton') {
				barOffset = 32;
				barWidth = 45;
			}
			healthBar.x = enemy.x;
			healthBar.y = enemy.y - barOffset * sizeScale;
			healthBar.width = (enemy.hp / enemy.maxHp) * barWidth * sizeScale;
		});

		// Update enemy counter
		if (this.enemyCountText) {
			this.enemyCountText.setText(`Enemies: ${this.enemies.length}`);
		}

		// Update score display
		if (this.scoreText) {
			this.scoreText.setText(`Score: ${gameState.score}`);
		}

		// Update wave display
		if (this.waveText) {
			if (this.waveState.waveInProgress) {
				this.waveText.setText(
					`Wave: ${this.waveState.currentWave} (${this.waveState.enemiesKilledThisWave}/${this.waveState.totalEnemiesThisWave})`
				);
			} else {
				// Show countdown to next wave
				if (this.waveState.nextWaveTimer) {
					const remaining = Math.ceil(this.waveState.nextWaveTimer.getRemaining() / 1000);
					this.waveText.setText(`Next Wave in ${remaining}s`);
				} else {
					this.waveText.setText(`Wave: ${this.waveState.currentWave}`);
				}
			}
		}

		// Update player health bar
		if (this.playerHealthFg) {
			const character = gameState.character;
			const hpPercentRaw = character.maxHp ? character.hp / character.maxHp : 0;
			const hpPercent = Phaser.Math.Clamp(hpPercentRaw, 0, 1);
			this.playerHealthFg.width = 300 * hpPercent;
			this.playerHealthText.setText(`${Math.round(character.hp)} / ${character.maxHp}`);
		}

		// Update minimap
		this.updateMinimap();

		// Update enemy tracking indicators
		this.updateEnemyIndicators();
	}

	handleDevilAbilities(enemyData) {
		const { enemy, sizeScale } = enemyData;
		const now = this.time.now;
		const dx = this.player.x - enemy.x;
		const dy = this.player.y - enemy.y;
		const dist = Math.hypot(dx, dy) || 1;

		if (enemyData.dashUntil && now < enemyData.dashUntil) {
			const dashSpeed = 3.6 * sizeScale;
			enemyData.vx += enemyData.dashDirX * dashSpeed;
			enemyData.vy += enemyData.dashDirY * dashSpeed;
		} else if (enemyData.dashUntil && now >= enemyData.dashUntil) {
			enemyData.dashUntil = null;
		}

		if (dist < 300 && dist > 120 && now >= enemyData.nextDashTime) {
			enemyData.dashDirX = dx / dist;
			enemyData.dashDirY = dy / dist;
			enemyData.dashUntil = now + 260;
			enemyData.nextDashTime = now + Phaser.Math.Between(2800, 4200);
			this.spawnHellfireRing(enemy.x, enemy.y, sizeScale, 0x7a1b12);
		}

		if (dist < 180 && now >= enemyData.nextFireTime) {
			this.spawnHellfireRing(enemy.x, enemy.y, sizeScale, 0xff4d1a);
			this.applyPlayerDamage(6);
			enemyData.nextFireTime = now + Phaser.Math.Between(2600, 3800);
		}
	}

	spawnHellfireRing(x, y, sizeScale, color = 0xff4d1a) {
		const ring = this.add.circle(x, y, 12, color, 0.4).setOrigin(0.5);
		this.tweens.add({
			targets: ring,
			scale: { from: 0.6, to: 2.2 * sizeScale },
			alpha: { from: 0.5, to: 0 },
			duration: 500,
			onComplete: () => ring.destroy()
		});
		if (this.uiCamera) {
			this.uiCamera.ignore(ring);
		}
	}

	applyPlayerDamage(amount) {
		this.damagePlayer(amount);
	}

	handleSkeletonAbilities(enemyData) {
		const { enemy, sizeScale } = enemyData;
		const now = this.time.now;
		const dx = this.player.x - enemy.x;
		const dy = this.player.y - enemy.y;
		const dist = Math.hypot(dx, dy) || 1;

		if (dist < 380 && dist > 120 && now >= enemyData.nextArrowTime) {
			this.shootFlamingArrow(enemy.x, enemy.y, dx / dist, dy / dist, sizeScale);
			enemyData.nextArrowTime = now + Phaser.Math.Between(1800, 3200);
		}
	}

	shootFlamingArrow(x, y, dirX, dirY, sizeScale) {
		const arrow = this.add.graphics();
		arrow.lineStyle(2, 0xff6600, 1);
		arrow.lineBetween(-6, 0, 2, 0);
		arrow.fillStyle(0xffaa33, 1);
		arrow.fillTriangleShape(new Phaser.Geom.Triangle(2, 0, 5, -2, 5, 2));
		const flame = this.add.circle(0, 0, 3, 0xff4400, 0.7);
		const arrowContainer = this.add.container(x, y, [arrow, flame]);
		arrowContainer.setRotation(Math.atan2(dirY, dirX));

		if (this.uiCamera) {
			this.uiCamera.ignore(arrowContainer);
			this.uiCamera.ignore(arrow);
			this.uiCamera.ignore(flame);
		}

		this.tweens.add({
			targets: flame,
			alpha: { from: 0.5, to: 0.9 },
			scale: { from: 0.8, to: 1.2 },
			duration: 200,
			yoyo: true,
			repeat: -1
		});

		this.enemyProjectiles.push({
			sprite: arrowContainer,
			x,
			y,
			vx: dirX * 3.5,
			vy: dirY * 3.5,
			damage: 8,
			radius: 8,
			rangeRemaining: 420
		});
	}

	updateEnemyProjectiles(deltaScale) {
		for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
			const proj = this.enemyProjectiles[i];
			const stepX = proj.vx * deltaScale;
			const stepY = proj.vy * deltaScale;
			proj.x += stepX;
			proj.y += stepY;
			proj.sprite.x = proj.x;
			proj.sprite.y = proj.y;
			proj.rangeRemaining -= Math.hypot(stepX, stepY);

			const hitPlayer = Math.hypot(proj.x - this.playerData.x, proj.y - this.playerData.y) < (proj.radius + 12);

			if (hitPlayer) {
				this.applyPlayerDamage(proj.damage);
				this.spawnArrowImpact(proj.x, proj.y);
				proj.sprite.destroy();
				this.enemyProjectiles.splice(i, 1);
			} else if (proj.rangeRemaining <= 0) {
				proj.sprite.destroy();
				this.enemyProjectiles.splice(i, 1);
			}
		}
	}

	spawnArrowImpact(x, y) {
		const burst = this.add.circle(x, y, 6, 0xff6600, 0.8);
		if (this.uiCamera) this.uiCamera.ignore(burst);
		for (let i = 0; i < 6; i++) {
			const angle = (i / 6) * Math.PI * 2;
			const spark = this.add.circle(x, y, 2, 0xffaa33, 0.9);
			if (this.uiCamera) this.uiCamera.ignore(spark);
			this.tweens.add({
				targets: spark,
				x: x + Math.cos(angle) * 20,
				y: y + Math.sin(angle) * 20,
				alpha: 0,
				duration: 280,
				onComplete: () => spark.destroy()
			});
		}
		this.tweens.add({
			targets: burst,
			scale: 2,
			alpha: 0,
			duration: 220,
			onComplete: () => burst.destroy()
		});
	}

	triggerSlimeAttack(enemyData, knockX, knockY) {
		const now = this.time.now;
		if (now < enemyData.lastAttackTime + enemyData.attackCooldown) return;
		enemyData.lastAttackTime = now;

		const { enemy, sizeScale } = enemyData;

		// Smooth hop-back animation (natural recoil)
		this.tweens.add({
			targets: enemy,
			x: enemy.x - knockX * 20,
			y: enemy.y - knockY * 20,
			duration: 200,
			ease: 'Sine.inOut'
		});

		// Smooth squash-stretch: compress on impact, expand back
		this.tweens.add({
			targets: enemy,
			scaleX: sizeScale * 0.75,
			scaleY: sizeScale * 1.25,
			duration: 100,
			ease: 'Sine.out'
		});

		// Resume normal bounce after
		this.time.delayedCall(100, () => {
			this.tweens.add({
				targets: enemy,
				scaleX: sizeScale,
				scaleY: sizeScale,
				duration: 150,
				ease: 'Sine.inOut'
			});
		});
	}

	shutdown() {
		if (this.handlePauseEsc) {
			detachPauseKey(this, this.handlePauseEsc);
			this.handlePauseEsc = null;
		}

		// Clean up all scene resources
		cleanupScene(this);
		
		// Clear wave timer
		if (this.waveState.nextWaveTimer) {
			this.waveState.nextWaveTimer.destroy();
			this.waveState.nextWaveTimer = null;
		}
		
		// Clear minimap elements
		if (this.minimap.enemyDots) {
			this.minimap.enemyDots.forEach(dot => dot.destroy());
			this.minimap.enemyDots = [];
		}
		
		// Clear enemy indicators
		if (this.enemyIndicators) {
			this.enemyIndicators.forEach(indicator => {
				if (indicator.arrow) indicator.arrow.destroy();
				if (indicator.text) indicator.text.destroy();
			});
			this.enemyIndicators = [];
		}
		
		// Clear game-specific arrays
		this.enemies = [];
		this.enemyProjectiles = [];
		this.projectiles = [];
		this.powerups = [];
		this.arenaObjects = [];
		this.obstacles = [];
		this.lavaPools = [];
		this.structures = [];
	}}