import { gameState } from '../../services/gameState.js';
import { createAnimatedCharacterWithViews } from '../../services/spriteGenerator.js';
import { generateEnemySprite } from '../../services/spriteGenerator.js';

/**
 * =================================================================
 * CHAOS CRUCIBLE SCENE
 * =================================================================
 * Large zoomable arena with camera following the player
 */

export class ChaossCrucibleScene extends Phaser.Scene {
	constructor() {
		console.log('[CONSTRUCTOR] ChaossCrucibleScene being instantiated');
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
		this.playerDamageState = {
			nextDamageTime: 0,
			damageCooldown: 500 // 0.5 seconds between damage
		};
		this.lavaDamageState = {
			nextDamageTime: 0,
			damageCooldown: 500 // 0.5 seconds between lava damage
		};

		// Constants
		this.uiCamera = null;
		this.arenaObjects = [];
		this.obstacles = []; // Obstacles for collision detection
		this.lavaPools = []; // Lava pools for damage detection
	}

	create() {
		console.log('[ChaossCrucible] === SCENE CREATE STARTED ===');

		// Ensure tween/time systems are running after scene transitions
		this.tweens.timeScale = 1;
		this.tweens.resumeAll();
		this.time.timeScale = 1;

		const centerX = this.ARENA_WIDTH / 2;
		const centerY = this.ARENA_HEIGHT / 2;

		// ===== CREATE BARBARIC ARENA =====
		this.createArenaEnvironment(centerX, centerY);

		// ===== PLACE PLAYER IN CENTER =====
		const character = gameState.character;
		this.player = createAnimatedCharacterWithViews(this, character.role, centerX, centerY, character.colors);
		this.playerData = {
			x: centerX,
			y: centerY,
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

		// ===== SPAWN SLIMES =====
		const numSlimes = 8;
		for (let i = 0; i < numSlimes; i++) {
			this.spawnRandomSlime();
		}

		// ===== SPAWN DEVILS =====
		const numDevils = 2;
		for (let i = 0; i < numDevils; i++) {
			this.spawnRandomDevil();
		}

		// ===== SPAWN SKELETONS =====
		const numSkeletons = 3;
		for (let i = 0; i < numSkeletons; i++) {
			this.spawnRandomSkeleton();
		}

		// ===== UI TEXT (on UI camera) =====
		// Reset score at start of game
		gameState.resetScore();

		const displayName = character.name ? `${character.name} (${character.role})` : character.role;
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

		// Hide HUD elements from the main camera (UI camera only)
		const hudElements = [
			nameText,
			this.enemyCountText,
			heartGraphics,
			this.playerHealthBg,
			this.playerHealthBorder,
			this.playerHealthFg,
			this.playerHealthText
		];
		hudElements.forEach(element => this.cameras.main.ignore(element));

		// ===== INPUT HANDLING =====
		this.keys = this.input.keyboard.createCursorKeys();
		this.keys.w = this.input.keyboard.addKey('W');
		this.keys.a = this.input.keyboard.addKey('A');
		this.keys.s = this.input.keyboard.addKey('S');
		this.keys.d = this.input.keyboard.addKey('D');
		this.keys.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
		this.keys.e = this.input.keyboard.addKey('E');
		this.keys.shift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
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

	queueBasicAttack(aim) {
		const now = this.time.now;
		if (now < this.attackState.nextBasicTime) return;
		this.attackState.nextBasicTime = now + this.roleConfig.basicCooldown;

		switch (gameState.character.role) {
			case 'archer':
				this.spawnProjectile({
					x: this.playerData.x,
					y: this.playerData.y,
					vx: aim.x * this.roleConfig.projectileSpeed,
					vy: aim.y * this.roleConfig.projectileSpeed,
					damage: this.roleConfig.basicDamage,
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
					damage: this.roleConfig.basicDamage,
					color: 0xffdd55,
					radius: 2,
					range: 480
				});
				break;
			case 'brute':
			case 'Male':
			default:
				this.performMeleeSlash(aim, this.roleConfig.meleeRange, this.roleConfig.basicDamage);
				break;
		}

		this.playAttackAnimation();
	}

	queueAbility(aim) {
		const now = this.time.now;
		if (now < this.attackState.nextAbilityTime) return;
		this.attackState.nextAbilityTime = now + this.roleConfig.abilityCooldown;

		switch (gameState.character.role) {
			case 'archer':
				this.fireArcherVolley(aim);
				break;
			case 'gunner':
				this.fireGunnerBurst(aim);
				break;
			case 'brute':
				this.performShockwave(this.roleConfig.abilityRadius, this.roleConfig.abilityDamage);
				break;
			case 'Male':
			default:
				this.performShockwave(this.roleConfig.abilityRadius, this.roleConfig.abilityDamage);
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
		this.tweens.add({
			targets: ring,
			scale: 1.1,
			alpha: 0,
			duration: 220,
			onComplete: () => ring.destroy()
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

	fireArcherVolley(aim) {
		const shots = this.roleConfig.abilityShots;
		const spread = this.roleConfig.abilitySpread;
		for (let i = 0; i < shots; i++) {
			const offset = (i - (shots - 1) / 2) * spread;
			const angle = Math.atan2(aim.y, aim.x) + offset;
			this.spawnProjectile({
				x: this.playerData.x,
				y: this.playerData.y,
				vx: Math.cos(angle) * this.roleConfig.projectileSpeed,
				vy: Math.sin(angle) * this.roleConfig.projectileSpeed,
				damage: this.roleConfig.abilityDamage,
				color: 0xffcc55,
				radius: 3,
				range: 600,
				type: 'arrow'
			});
		}
	}

	fireGunnerBurst(aim) {
		const shots = this.roleConfig.abilityBurst;
		for (let i = 0; i < shots; i++) {
			this.time.delayedCall(i * 60, () => {
				this.spawnProjectile({
					x: this.playerData.x,
					y: this.playerData.y,
					vx: aim.x * (this.roleConfig.projectileSpeed + 2),
					vy: aim.y * (this.roleConfig.projectileSpeed + 2),
					damage: this.roleConfig.abilityDamage,
					color: 0xffee88,
					radius: 2,
					range: 520
				});
			});
		}
	}

	createSlashEffect(aim, range) {
		const arc = this.add.graphics();
		arc.lineStyle(3, 0xffffff, 0.7);
		const baseAngle = Math.atan2(aim.y, aim.x);
		arc.beginPath();
		arc.arc(this.playerData.x, this.playerData.y, range, baseAngle - 0.6, baseAngle + 0.6);
		arc.strokePath();
		if (this.uiCamera) this.uiCamera.ignore(arc);
		this.tweens.add({
			targets: arc,
			alpha: 0,
			duration: 140,
			onComplete: () => arc.destroy()
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

			if (enemyData.healthBar) enemyData.healthBar.destroy();
			enemyData.enemy.destroy();
			this.enemies = this.enemies.filter(entry => entry !== enemyData);
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
		
		// Flash both front and back sprites
		const flashSprite = (sprite) => {
			if (!sprite) return;
			if (sprite.getChildren) {
				sprite.getChildren().forEach(child => {
					if (child.setTint) child.setTint(0xff3333);
				});
			} else if (sprite.setTint) {
				sprite.setTint(0xff3333);
			}
		};

		flashSprite(this.player.frontSprite);
		flashSprite(this.player.backSprite);

		this.time.delayedCall(120, () => {
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

	damagePlayer(damage) {
		if (!gameState.character) return;
		
		const now = this.time.now;
		if (now < this.playerDamageState.nextDamageTime) return;
		
		this.playerDamageState.nextDamageTime = now + this.playerDamageState.damageCooldown;
		
		gameState.character.hp = Math.max(0, gameState.character.hp - damage);
		this.flashPlayer();
		
		if (gameState.character.hp <= 0) {
			// Player died - could add death handling here
			console.log('[ChaossCrucible] Player defeated!');
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

		// Blood stains (dark red circles)
		for (let i = 0; i < 15; i++) {
			const bx = this.ARENA_PADDING + 150 + Math.random() * (this.ARENA_WIDTH - 2 * this.ARENA_PADDING - 300);
			const by = this.ARENA_PADDING + 150 + Math.random() * (this.ARENA_HEIGHT - 2 * this.ARENA_PADDING - 300);
			const radius = 15 + Math.random() * 30;
			floorGraphics.fillStyle(0x4a0000, 0.4);
			floorGraphics.fillCircle(bx, by, radius);
		}

		this.add.existing(floorGraphics);

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
		this.arenaObjects = [arenaBg, floorGraphics, borderGraphics];

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

		// ===== FLOATING PARTICLES FOR DEPTH =====
		this.createFloatingParticles();
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
		const glow = this.add.ellipse(x, y, width + 10, height + 10, 0xffaa00, 0.25).setOrigin(0.5);
		// Mid layer
		const mid = this.add.ellipse(x, y, width, height, 0xff5500, 0.7).setOrigin(0.5);
		// Core
		const core = this.add.ellipse(x, y, width - 20, height - 20, 0xff2200, 0.9).setOrigin(0.5);

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
			alpha: { from: 0.2, to: 0.5 },
			duration: 900,
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

		this.arenaObjects.push(base, glow, mid, core, ...bubbles);

		// Store lava pool collision data for damage detection
		this.lavaPools.push({
			x: x,
			y: y,
			width: width,
			height: height
		});
	}

	createFloatingParticles() {
		const textureKey = 'arenaDustParticle';
		if (!this.textures.exists(textureKey)) {
			const particleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
			particleGraphics.fillStyle(0xffffff, 1);
			particleGraphics.fillCircle(8, 8, 3);
			particleGraphics.generateTexture(textureKey, 16, 16);
			particleGraphics.destroy();
		}

		const particles = this.add.particles(0, 0, textureKey);
		particles.setDepth(2);

		const padding = this.ARENA_PADDING + 80;
		const emitZone = new Phaser.Geom.Rectangle(
			padding,
			padding,
			this.ARENA_WIDTH - 2 * padding,
			this.ARENA_HEIGHT - 2 * padding
		);

		particles.createEmitter({
			x: 0,
			y: 0,
			emitZone: { type: 'random', source: emitZone },
			frequency: 90,
			lifespan: 7000,
			quantity: 1,
			speedX: { min: -12, max: 12 },
			speedY: { min: -18, max: -6 },
			alpha: { start: 0.25, end: 0 },
			scale: { start: 0.6, end: 0.15 },
			tint: [0xffffff, 0xffe0b8, 0xffc68a],
			blendMode: 'ADD'
		});

		this.arenaObjects.push(particles);
	}

	/**
	 * Creates various obstacles that block player and enemy movement
	 */
	createObstacles() {
		const padding = this.ARENA_PADDING + 300;
		const spawnArea = {
			minX: padding,
			maxX: this.ARENA_WIDTH - padding,
			minY: padding,
			maxY: this.ARENA_HEIGHT - padding
		};

		// Ancient Stone Rocks (10-15 scattered around)
		const numRocks = 12 + Math.floor(Math.random() * 4);
		for (let i = 0; i < numRocks; i++) {
			const x = spawnArea.minX + Math.random() * (spawnArea.maxX - spawnArea.minX);
			const y = spawnArea.minY + Math.random() * (spawnArea.maxY - spawnArea.minY);
			this.createRockObstacle(x, y);
		}

		// Ancient Pillars (5-7 tall columns)
		const numPillars = 5 + Math.floor(Math.random() * 3);
		for (let i = 0; i < numPillars; i++) {
			const x = spawnArea.minX + Math.random() * (spawnArea.maxX - spawnArea.minX);
			const y = spawnArea.minY + Math.random() * (spawnArea.maxY - spawnArea.minY);
			this.createPillarObstacle(x, y);
		}

		// Mysterious Obelisks (3-4 magical monoliths)
		const numObelisks = 3 + Math.floor(Math.random() * 2);
		for (let i = 0; i < numObelisks; i++) {
			const x = spawnArea.minX + Math.random() * (spawnArea.maxX - spawnArea.minX);
			const y = spawnArea.minY + Math.random() * (spawnArea.maxY - spawnArea.minY);
			this.createObeliskObstacle(x, y);
		}

		// Broken Statues (4-5 ruined monuments)
		const numStatues = 4 + Math.floor(Math.random() * 2);
		for (let i = 0; i < numStatues; i++) {
			const x = spawnArea.minX + Math.random() * (spawnArea.maxX - spawnArea.minX);
			const y = spawnArea.minY + Math.random() * (spawnArea.maxY - spawnArea.minY);
			this.createStatueObstacle(x, y);
		}

		// Stone Altars (2-3 sacrificial platforms)
		const numAltars = 2 + Math.floor(Math.random() * 2);
		for (let i = 0; i < numAltars; i++) {
			const x = spawnArea.minX + Math.random() * (spawnArea.maxX - spawnArea.minX);
			const y = spawnArea.minY + Math.random() * (spawnArea.maxY - spawnArea.minY);
			this.createAltarObstacle(x, y);
		}
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

		// Store collision data (circular collision)
		this.obstacles.push({
			x: x,
			y: y,
			radius: size * 0.85,
			type: 'circle'
		});
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

		// Store collision data (rectangular collision)
		this.obstacles.push({
			x: x,
			y: y,
			width: width,
			height: height,
			type: 'rect'
		});
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

		// Store collision data
		this.obstacles.push({
			x: x,
			y: y,
			width: baseWidth,
			height: height,
			type: 'rect'
		});
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

		// Store collision data
		this.obstacles.push({
			x: x,
			y: y,
			radius: 45,
			type: 'circle'
		});
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

		// Store collision data
		this.obstacles.push({
			x: x,
			y: y,
			width: 120,
			height: 40,
			type: 'rect'
		});
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

		for (const obstacle of this.obstacles) {
			if (obstacle.type === 'circle') {
				const dx = entityX - obstacle.x;
				const dy = entityY - obstacle.y;
				const distance = Math.hypot(dx, dy);
				
				if (distance < entityRadius + obstacle.radius) {
					// Push entity away from obstacle
					const overlap = entityRadius + obstacle.radius - distance;
					const angle = Math.atan2(dy, dx);
					adjustedX += Math.cos(angle) * overlap;
					adjustedY += Math.sin(angle) * overlap;
				}
			} else if (obstacle.type === 'rect') {
				const closestX = Phaser.Math.Clamp(entityX, obstacle.x - obstacle.width / 2, obstacle.x + obstacle.width / 2);
				const closestY = Phaser.Math.Clamp(entityY, obstacle.y - obstacle.height / 2, obstacle.y + obstacle.height / 2);
				
				const dx = entityX - closestX;
				const dy = entityY - closestY;
				const distance = Math.hypot(dx, dy);
				
				if (distance < entityRadius && distance > 0) {
					// Push entity away from obstacle
					const overlap = entityRadius - distance;
					const angle = Math.atan2(dy, dx);
					adjustedX += Math.cos(angle) * overlap;
					adjustedY += Math.sin(angle) * overlap;
				}
			}
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

		this.enemies.push({ enemy, healthBar, sizeScale, vx, vy, type: 'slime' });
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

	update(time, delta) {
		if (!this.player) return;

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
			moveX = (moveX / length) * this.playerData.speed;
			moveY = (moveY / length) * this.playerData.speed;
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

		// Check if player is standing in lava
		this.checkLavaDamage(time);

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
			}
		});

		// Update enemy movement + health bars
		this.enemies.forEach((enemyData) => {
			const { enemy, healthBar, sizeScale } = enemyData;
			if (!enemy) return;

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

		// Update player health bar
		if (this.playerHealthFg) {
			const character = gameState.character;
			const hpPercent = character.hp / character.maxHp;
			this.playerHealthFg.width = 300 * hpPercent;
			this.playerHealthText.setText(`${character.hp} / ${character.maxHp}`);
		}
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

		if (dist < 300 && now >= enemyData.nextDashTime) {
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
		const character = gameState.character;
		character.hp = Math.max(0, character.hp - amount);
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
}
