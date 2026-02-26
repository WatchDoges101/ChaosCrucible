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
		this.keys = {};

		// Constants
		this.uiCamera = null;
		this.arenaObjects = [];
	}

	create() {
		console.log('[ChaossCrucible] === SCENE CREATE STARTED ===');

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

		// Add player idle scale pulse animation (doesn't interfere with movement)
		this.tweens.add({
			targets: this.player,
			scaleX: 1.1,
			scaleY: 1.1,
			duration: 1000,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.inout'
		});

		// Animate arms and weapons for FRONT sprite
		if (this.player.frontSprite.leftArm) {
			this.tweens.add({
				targets: this.player.frontSprite.leftArm,
				rotation: -0.5,
				duration: 800,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.inout'
			});
		}

		if (this.player.frontSprite.rightArm) {
			this.tweens.add({
				targets: this.player.frontSprite.rightArm,
				rotation: 0.5,
				duration: 800,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.inout'
			});
		}

		if (this.player.frontSprite.weapon) {
			this.tweens.add({
				targets: this.player.frontSprite.weapon,
				rotation: 1,
				duration: 600,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.inout'
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
				ease: 'Sine.inout'
			});
		}

		if (this.player.backSprite.rightArm) {
			this.tweens.add({
				targets: this.player.backSprite.rightArm,
				rotation: 0.5,
				duration: 800,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.inout'
			});
		}

		if (this.player.backSprite.weapon) {
			this.tweens.add({
				targets: this.player.backSprite.weapon,
				rotation: 1,
				duration: 600,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.inout'
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

		// ===== UI TEXT (on UI camera) =====
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

		this.enemies.push({ enemy, healthBar, sizeScale });
	}

	update() {
		if (!this.player) return;

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

		this.playerData.x += moveX;
		this.playerData.y += moveY;

		// Clamp player to arena bounds
		this.playerData.x = Phaser.Math.Clamp(this.playerData.x, this.ARENA_PADDING, this.ARENA_WIDTH - this.ARENA_PADDING);
		this.playerData.y = Phaser.Math.Clamp(this.playerData.y, this.ARENA_PADDING, this.ARENA_HEIGHT - this.ARENA_PADDING);

		this.player.setPosition(this.playerData.x, this.playerData.y);

		// Update enemy health bars
		this.enemies.forEach(({ enemy, healthBar, sizeScale }) => {
			healthBar.x = enemy.x;
			healthBar.y = enemy.y - 30 * sizeScale;
			healthBar.width = (enemy.hp / enemy.maxHp) * 40 * sizeScale;
		});

		// Update enemy counter
		if (this.enemyCountText) {
			this.enemyCountText.setText(`Enemies: ${this.enemies.length}`);
		}

		// Update player health bar
		if (this.playerHealthFg) {
			const character = gameState.character;
			const hpPercent = character.hp / character.maxHp;
			this.playerHealthFg.width = 300 * hpPercent;
			this.playerHealthText.setText(`${character.hp} / ${character.maxHp}`);
		}
	}
}
