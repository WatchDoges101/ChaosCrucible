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
    this.enemyCountText = this.add.text(20, 60, `Enemies: ${this.enemies.length}`, {
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
    const pole = this.make.graphics({ x: 0, y: 0, add: false });
    pole.fillStyle(0x4a3a2a, 1);
    pole.fillRectShape(new Phaser.Geom.Rectangle(x - 8, y - 50, 16, 70));
    pole.lineStyle(2, 0x2a1a0a, 1);
    pole.strokeRectShape(new Phaser.Geom.Rectangle(x - 8, y - 50, 16, 70));
    this.add.existing(pole);
    if (this.uiCamera) {
      this.uiCamera.ignore(pole);
    }
    this.arenaObjects.push(pole);

    // Torch fire - animated
    const fireGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    const drawFire = () => {
      fireGraphics.clear();
      const wobble = Math.sin(Date.now() * 0.005) * 5;

      // Outer glow (yellow)
      fireGraphics.fillStyle(0xFFDD00, 0.3);
      fireGraphics.fillCircle(x + wobble, y - 60, 25);

      // Mid flame (orange)
      fireGraphics.fillStyle(0xFF8800, 0.6);
      fireGraphics.fillCircle(x + wobble, y - 60, 18);

      // Inner flame (red)
      fireGraphics.fillStyle(0xFF4400, 1);
      fireGraphics.fillCircle(x + wobble + 2, y - 60, 10);

      // Bright core
      fireGraphics.fillStyle(0xFFFF00, 1);
      fireGraphics.fillCircle(x + wobble + 1, y - 60, 4);
    };

    this.add.existing(fireGraphics);
    if (this.uiCamera) {
      this.uiCamera.ignore(fireGraphics);
    }
    this.arenaObjects.push(fireGraphics);

    // Animate fire continuously
    this.events.on('preupdate', drawFire);
  }

  createLavaPool(x, y, width, height) {
    const pool = this.add.container(x, y);

    // Grey rocky base
    const rockBase = this.make.graphics({ x: 0, y: 0, add: false });
    rockBase.fillStyle(0x4a4a4a, 1);
    rockBase.fillEllipse(0, 0, width + 50, height + 35);
    rockBase.lineStyle(2, 0x2f2f2f, 0.8);
    rockBase.strokeEllipse(0, 0, width + 50, height + 35);
    pool.add(rockBase);

    // Outer glow
    const glow = this.make.graphics({ x: 0, y: 0, add: false });
    glow.fillStyle(0xffaa00, 0.25);
    glow.fillEllipse(0, 0, width + 30, height + 20);
    pool.add(glow);

    // Mid lava
    const mid = this.make.graphics({ x: 0, y: 0, add: false });
    mid.fillStyle(0xff5500, 0.7);
    mid.fillEllipse(0, 0, width, height);
    pool.add(mid);

    // Core lava
    const core = this.make.graphics({ x: 0, y: 0, add: false });
    core.fillStyle(0xff2200, 1);
    core.fillEllipse(0, 0, width * 0.6, height * 0.6);
    pool.add(core);

    // Subtle bubbling highlights
    const bubbles = this.make.graphics({ x: 0, y: 0, add: false });
    bubbles.fillStyle(0xffdd88, 0.6);
    for (let i = 0; i < 6; i++) {
      const bx = (Math.random() - 0.5) * width * 0.6;
      const by = (Math.random() - 0.5) * height * 0.4;
      const br = 6 + Math.random() * 8;
      bubbles.fillCircle(bx, by, br);
    }
    pool.add(bubbles);

    // Animate glow and bubbles for a living lava feel
    this.tweens.add({
      targets: glow,
      alpha: 0.45,
      duration: 1200 + Math.random() * 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inout'
    });
    this.tweens.add({
      targets: bubbles,
      alpha: 0.2,
      duration: 900 + Math.random() * 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inout'
    });

    if (this.uiCamera) {
      this.uiCamera.ignore(pool);
    }
    this.arenaObjects.push(pool);
  }

  spawnRandomSlime() {
    // Spawn slime randomly around the arena
    const x = this.ARENA_PADDING + 100 + Math.random() * (this.ARENA_WIDTH - 2 * this.ARENA_PADDING - 200);
    const y = this.ARENA_PADDING + 100 + Math.random() * (this.ARENA_HEIGHT - 2 * this.ARENA_PADDING - 200);

    const sprite = generateEnemySprite(this, x, y, 'slime');
    const slimeScale = Phaser.Math.FloatBetween(0.6, 1.2);
    sprite.setScale(slimeScale);
    if (sprite.setTint) {
      sprite.setTint(0xff4444);
    } else if (sprite.getChildren) {
      sprite.getChildren().forEach(child => {
        if (child.setTint) {
          child.setTint(0xff4444);
        }
      });
    }
    this.uiCamera.ignore(sprite); // Hide from UI camera

    // Create health bar container
    const healthBarOffsetY = 25 * slimeScale;
    const healthBarContainer = this.add.container(x, y - healthBarOffsetY);
    this.uiCamera.ignore(healthBarContainer); // Hide from UI camera

    // Health bar background (red)
    const healthBarBg = this.add.graphics();
    healthBarBg.fillStyle(0x000000, 0.5);
    healthBarBg.fillRect(-15, 0, 30, 4);
    healthBarContainer.add(healthBarBg);

    // Health bar foreground (green)
    const healthBarFg = this.add.graphics();
    healthBarFg.fillStyle(0x00ff00, 1);
    healthBarFg.fillRect(-15, 0, 30, 4);
    healthBarContainer.add(healthBarFg);

    const enemy = {
      x,
      y,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5,
      sprite,
      radius: 20 * slimeScale,
      healthBarOffsetY,
      bounceTimer: 0,
      bounceInterval: Phaser.Math.Between(60, 180),
      hp: 100,
      maxHp: 100,
      healthBar: healthBarContainer,
      healthBarFg: healthBarFg
    };

    // Add pulsing animation for slime
    this.tweens.add({
      targets: sprite,
      scaleX: slimeScale * 1.05,
      scaleY: slimeScale * 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inout'
    });

    this.enemies.push(enemy);
  }

  update() {
    const character = gameState.character;

    // Handle input
    let playerVx = 0;
    let playerVy = 0;

    if (this.keys.w.isDown) playerVy -= 1;
    if (this.keys.s.isDown) playerVy += 1;
    if (this.keys.a.isDown) playerVx -= 1;
    if (this.keys.d.isDown) playerVx += 1;

    // Normalize diagonal movement
    if (playerVx !== 0 && playerVy !== 0) {
      const factor = 1 / Math.sqrt(2);
      playerVx *= factor;
      playerVy *= factor;
    }

    this.playerData.x += playerVx * this.playerData.speed;
    this.playerData.y += playerVy * this.playerData.speed;

    // Keep player in bounds
    const playerbuffer = 50;
    this.playerData.x = Math.max(
      this.ARENA_PADDING + playerbuffer,
      Math.min(this.playerData.x, this.ARENA_WIDTH - this.ARENA_PADDING - playerbuffer)
    );
    this.playerData.y = Math.max(
      this.ARENA_PADDING + playerbuffer,
      Math.min(this.playerData.y, this.ARENA_HEIGHT - this.ARENA_PADDING - playerbuffer)
    );

    this.player.x = this.playerData.x;
    this.player.y = this.playerData.y;

    // Update character direction based on movement input
    if (playerVx !== 0 || playerVy !== 0) {
      // Determine primary direction
      const absVx = Math.abs(playerVx);
      const absVy = Math.abs(playerVy);

      if (absVy > absVx) {
        // Moving primarily vertically
        if (playerVy < 0) {
          // Moving up (W key) - show back
          this.player.frontSprite.setVisible(false);
          this.player.backSprite.setVisible(true);
        } else {
          // Moving down (S key) - show front
          this.player.frontSprite.setVisible(true);
          this.player.backSprite.setVisible(false);
        }
      } else {
        // Moving primarily horizontally - show front but flip it
        this.player.frontSprite.setVisible(true);
        this.player.backSprite.setVisible(false);
        const baseScaleX = Math.abs(this.player.frontSprite.scaleX || 1);
        this.player.frontSprite.scaleX = playerVx > 0 ? -baseScaleX : baseScaleX; // Flip if moving right
      }
    }

    // Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      // Simple bouncing AI
      enemy.bounceTimer++;
      if (enemy.bounceTimer > enemy.bounceInterval) {
        enemy.vx = (Math.random() - 0.5) * 5;
        enemy.vy = (Math.random() - 0.5) * 5;
        enemy.bounceTimer = 0;
      }

      enemy.x += enemy.vx;
      enemy.y += enemy.vy;

      const slimeRadius = enemy.radius || 20;
      if (enemy.x - slimeRadius < this.ARENA_PADDING || enemy.x + slimeRadius > this.ARENA_WIDTH - this.ARENA_PADDING) {
        enemy.vx *= -1;
        enemy.x = Math.max(this.ARENA_PADDING + slimeRadius, Math.min(enemy.x, this.ARENA_WIDTH - this.ARENA_PADDING - slimeRadius));
        this.createBounceEffect(enemy.x, enemy.y);
      }
      if (enemy.y - slimeRadius < this.ARENA_PADDING || enemy.y + slimeRadius > this.ARENA_HEIGHT - this.ARENA_PADDING) {
        enemy.vy *= -1;
        enemy.y = Math.max(this.ARENA_PADDING + slimeRadius, Math.min(enemy.y, this.ARENA_HEIGHT - this.ARENA_PADDING - slimeRadius));
        this.createBounceEffect(enemy.x, enemy.y);
      }

      enemy.sprite.x = enemy.x;
      enemy.sprite.y = enemy.y;

      // Update health bar position
      enemy.healthBar.x = enemy.x;
      enemy.healthBar.y = enemy.y - (enemy.healthBarOffsetY || 25);

      // Update health bar width based on current HP
      const healthPercent = enemy.hp / enemy.maxHp;
      enemy.healthBarFg.clear();

      // Color based on health
      let healthColor = 0x00ff00; // Green
      if (healthPercent < 0.5) healthColor = 0xffaa00; // Orange
      if (healthPercent < 0.25) healthColor = 0xff0000; // Red

      enemy.healthBarFg.fillStyle(healthColor, 1);
      enemy.healthBarFg.fillRect(-15, 0, 30 * healthPercent, 4);
    }

    // Update UI
    this.enemyCountText.setText(`Enemies: ${this.enemies.length}`);

    // Update player health bar
    const playerHealthPercent = character.hp / character.maxHp;

    // Update health bar width based on current HP
    this.playerHealthFg.width = 300 * playerHealthPercent;
    this.playerHealthText.setText(`${Math.ceil(character.hp)} / ${character.maxHp}`);
  }

  createBounceEffect(x, y) {
    // Flash the slime yellow on bounce
    const particle = this.add.circle(x, y, 20, 0xFFFF00, 0.4);

    this.tweens.add({
      targets: particle,
      scale: 0,
      alpha: 0,
      duration: 400,
      ease: 'Quad.out',
      onComplete: () => {
        particle.destroy();
      }
    });

    // Screen shake effect
    this.cameras.main.shake(150, 0.005);
  }
}
