import { gameState } from '../../services/gameState.js';
import { audioManager } from '../../services/audioManager.js';
import { stopAllTweens, stopAllTimers, removeAllInputListeners, cleanupScene } from '../../helpers/sceneCleanupHelpers.js';

/**
 * MenuScene
 * Main menu using Phaser. Replaces scenes/menu.js.
 * 
 * Benefits over canvas version:
 *  - Built-in tweens for button animations
 *  - Text rendering with fonts/styles
 *  - Input handling with hitbox detection
 *  - Scene management (transitions)
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    console.log('[CONSTRUCTOR] MenuScene being instantiated');
    super({ key: 'MenuScene', active: true });
  }

  preload() {
    // Load any assets needed for menu
    // this.load.image('menuBg', './assets/gameBackground.jpg');
  }

  create() {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // Ensure tween/time systems are running after scene transitions
    this.tweens.timeScale = 1;
    this.tweens.resumeAll();
    this.time.timeScale = 1;

    // Completely shut down any other scenes (active, paused, or sleeping)
    const scenesToShutdown = [
      'CharacterSelectionScene',
      'CharacterCustomizationScene',
      'ChaossCrucibleScene',
      'HostScene',
      'WikiScene',
      'CharacterWikiScene',
      'EnemyWikiScene',
      'PowerupWikiScene',
      'OptionsScene'
    ];
    scenesToShutdown.forEach(key => {
      const sceneInstance = this.scene.get(key);
      if (sceneInstance) {
        // Properly clean up the scene first
        cleanupScene(sceneInstance);
        // Then stop it
        this.scene.stop(key);
      }
    });

    // Background (dark color) - must be FIRST and FULLY OPAQUE to cover everything
    const bg = this.add.rectangle(centerX, centerY, width, height, 0x1a0000, 1).setOrigin(0.5);
    bg.setDepth(-1000); // Make sure it's behind everything

    // Create flame particles for burning effect
    this.createFlameParticles(width, height);

    // Title
    const titleText = this.add.text(centerX, 120, 'CHAOS CRUCIBLE', {
      font: 'bold 96px Impact',
      fill: '#ffffff',
      stroke: '#550000',
      strokeThickness: 10
    }).setOrigin(0.5).setDepth(1002);

    // Add burning flame effect around the title
    this.createTitleFlames(titleText, centerX, 120);

    // Buttons with interactive areas
    const buttons = [
      { label: 'ARENA', scene: 'CharacterSelectionScene' },
      { label: 'ONLINE', scene: 'ComingSoonScene' },
      { label: 'SKILL TREE', scene: 'SkillTreeScene' },
      { label: 'WIKI', scene: 'WikiScene' },
      { label: 'OPTIONS', scene: 'OptionsScene' }
    ];

    const buttonWidth = 350;
    const buttonHeight = 90;
    const buttonGap = 30;
    const totalHeight = buttons.length * buttonHeight + (buttons.length - 1) * buttonGap;
    // add a small offset so buttons sit lower and aren't too close to the title
    const buttonOffset = 80; // pixels to push the group down
    const startY = centerY - totalHeight / 2 + buttonOffset;

    buttons.forEach((btn, idx) => {
      const y = startY + idx * (buttonHeight + buttonGap);
      this.createButton(centerX, y, buttonWidth, buttonHeight, btn);
    });

    // Play background music
    // audioManager.playMusic('menuMusic', true);
  }

  shutdown() {
    // Called when scene stops - clean up all resources
    cleanupScene(this);
  }

  sleep() {
    // Called when scene is paused - disable interactions
    removeAllInputListeners(this);
  }

  createButton(x, y, width, height, config) {
    const button = this.add.rectangle(x, y, width, height, config.color, 0.9)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const text = this.add.text(x, y, config.label.toUpperCase(), {
      font: 'bold 24px Arial',
      fill: '#fff',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);

    button.on('pointerover', () => {
      this.tweens.add({
        targets: [button, text],
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 200,
        ease: 'Power2'
      });
    });

    button.on('pointerout', () => {
      this.tweens.add({
        targets: [button, text],
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: 'Power2'
      });
    });

    button.on('pointerdown', () => {
      if (config.scene) {
        // Ensure target scene exists, then start it so current scene stops cleanly
        if (!this.scene.get(config.scene) && window.sceneClasses[config.scene]) {
          this.scene.add(config.scene, window.sceneClasses[config.scene], false);
        }
        this.input.enabled = false;
        this.scene.start(config.scene);
      } else if (config.action) {
        config.action();
      }
    });
  }

  createFlameParticles(width, height) {
    const createTexture = (key, color, size, radius) => {
      if (this.textures.exists(key)) return;
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(color, 1);
      graphics.fillCircle(size / 2, size / 2, radius);
      graphics.generateTexture(key, size, size);
      graphics.destroy();
    };

    createTexture('menuFlameCore', 0xffa133, 14, 7);
    createTexture('menuFlameMid', 0xff5a00, 16, 8);
    createTexture('menuFlameDeep', 0xff2a00, 18, 9);
    createTexture('menuEmber', 0xffd27a, 8, 3);

    const lowerHeat = this.add.ellipse(width / 2, height * 0.93, width * 1.2, height * 0.42, 0xb22a00, 0.18).setDepth(-620);
    const lowerHeatCore = this.add.ellipse(width / 2, height * 0.95, width * 0.88, height * 0.25, 0xff6a00, 0.14).setDepth(-618);
    this.tweens.add({
      targets: [lowerHeat, lowerHeatCore],
      alpha: { from: 0.12, to: 0.26 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    const floorCore = this.add.particles(width / 2, height + 20, 'menuFlameCore', {
      x: { min: -width * 0.55, max: width * 0.55 },
      speedY: { min: -340, max: -150 },
      speedX: { min: -80, max: 80 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 0.95, end: 0 },
      lifespan: { min: 900, max: 1500 },
      frequency: 10,
      blendMode: 'ADD'
    }).setDepth(-590);

    const floorMid = this.add.particles(width / 2, height + 25, 'menuFlameMid', {
      x: { min: -width * 0.6, max: width * 0.6 },
      speedY: { min: -280, max: -120 },
      speedX: { min: -70, max: 70 },
      scale: { start: 1.2, end: 0 },
      alpha: { start: 0.78, end: 0 },
      lifespan: { min: 1000, max: 1700 },
      frequency: 12,
      blendMode: 'ADD'
    }).setDepth(-592);

    const floorDeep = this.add.particles(width / 2, height + 30, 'menuFlameDeep', {
      x: { min: -width * 0.62, max: width * 0.62 },
      speedY: { min: -240, max: -90 },
      speedX: { min: -60, max: 60 },
      scale: { start: 1.35, end: 0 },
      alpha: { start: 0.68, end: 0 },
      lifespan: { min: 1200, max: 2100 },
      frequency: 16,
      blendMode: 'ADD'
    }).setDepth(-594);

    const leftWallFlames = this.add.particles(-5, height * 0.55, 'menuFlameMid', {
      y: { min: -height * 0.33, max: height * 0.4 },
      speedX: { min: 45, max: 120 },
      speedY: { min: -150, max: 50 },
      scale: { start: 1.1, end: 0 },
      alpha: { start: 0.75, end: 0 },
      lifespan: { min: 1100, max: 1700 },
      frequency: 36,
      blendMode: 'ADD'
    }).setDepth(-585);

    const rightWallFlames = this.add.particles(width + 5, height * 0.55, 'menuFlameMid', {
      y: { min: -height * 0.33, max: height * 0.4 },
      speedX: { min: -120, max: -45 },
      speedY: { min: -150, max: 50 },
      scale: { start: 1.1, end: 0 },
      alpha: { start: 0.75, end: 0 },
      lifespan: { min: 1100, max: 1700 },
      frequency: 36,
      blendMode: 'ADD'
    }).setDepth(-585);

    const embers = this.add.particles(width / 2, height + 10, 'menuEmber', {
      x: { min: -width * 0.6, max: width * 0.6 },
      speedY: { min: -260, max: -60 },
      speedX: { min: -85, max: 85 },
      scale: { start: 0.9, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: { min: 1500, max: 3200 },
      frequency: 26,
      blendMode: 'ADD'
    }).setDepth(-580);

    this.tweens.add({
      targets: [floorCore, floorMid, floorDeep, leftWallFlames, rightWallFlames, embers],
      alpha: { from: 0.86, to: 1 },
      duration: 240,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
  }

  createTitleFlames(titleText, centerX, centerY) {
    const titleBounds = titleText.getBounds();
    const titleWidth = titleBounds.width;

    const titleAuraBack = this.add.ellipse(centerX, centerY + 6, titleWidth + 160, 126, 0xff3d00, 0.19).setDepth(995);
    const titleAuraMid = this.add.ellipse(centerX, centerY + 4, titleWidth + 84, 94, 0xff8a00, 0.14).setDepth(996);
    const titleAuraFront = this.add.ellipse(centerX, centerY + 4, titleWidth + 28, 72, 0xffd27a, 0.1).setDepth(997);

    const createTexture = (key, color, size, radius) => {
      if (this.textures.exists(key)) return;
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(color, 1);
      graphics.fillCircle(size / 2, size / 2, radius);
      graphics.generateTexture(key, size, size);
      graphics.destroy();
    };

    createTexture('menuTitleFlameCore', 0xffdd88, 10, 5);
    createTexture('menuTitleFlameMid', 0xff8a00, 14, 7);
    createTexture('menuTitleEmber', 0xffc16a, 8, 3);

    const flameBand = this.add.particles(centerX, centerY + 52, 'menuTitleFlameMid', {
      x: { min: -titleWidth * 0.56, max: titleWidth * 0.56 },
      speedY: { min: -185, max: -55 },
      speedX: { min: -42, max: 42 },
      scale: { start: 1.05, end: 0 },
      alpha: { start: 0.88, end: 0 },
      lifespan: { min: 620, max: 1080 },
      frequency: 14,
      blendMode: 'ADD'
    }).setDepth(998);

    const flameBandCore = this.add.particles(centerX, centerY + 52, 'menuTitleFlameCore', {
      x: { min: -titleWidth * 0.5, max: titleWidth * 0.5 },
      speedY: { min: -145, max: -40 },
      speedX: { min: -34, max: 34 },
      scale: { start: 0.9, end: 0 },
      alpha: { start: 0.96, end: 0 },
      lifespan: { min: 500, max: 900 },
      frequency: 11,
      blendMode: 'ADD'
    }).setDepth(999);

    const titleEmbers = this.add.particles(centerX, centerY + 56, 'menuTitleEmber', {
      x: { min: -titleWidth * 0.6, max: titleWidth * 0.6 },
      speedY: { min: -230, max: -80 },
      speedX: { min: -62, max: 62 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.72, end: 0 },
      lifespan: { min: 1200, max: 2200 },
      frequency: 20,
      blendMode: 'ADD'
    }).setDepth(1000);

    this.tweens.add({
      targets: [titleAuraBack, titleAuraMid, titleAuraFront, flameBand, flameBandCore, titleEmbers],
      alpha: { from: 0.78, to: 1 },
      duration: 250,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    this.tweens.add({
      targets: [titleAuraBack, titleAuraMid, titleAuraFront],
      scaleX: { from: 0.992, to: 1.01 },
      scaleY: { from: 0.992, to: 1.02 },
      duration: 880,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    titleText.setTint(0xfff0d1);
    this.tweens.add({
      targets: titleText,
      alpha: { from: 0.97, to: 1 },
      duration: 180,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
  }

  shutdown() {
    // Called when scene stops
  }
}
