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
      { label: 'ONLINE', scene: 'HostScene' },
      { label: 'SKILL TREE', scene: 'SkillTreeScene' },
      { label: 'ENEMIES', scene: 'EnemyWikiScene' },
      { label: 'POWERUPS', scene: 'PowerupWikiScene' },
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
    // Create flame particles using Phaser's built-in particle system
    // Create graphics for flame particles with flame-like shapes
    const flameGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Red flame particle - teardrop shape made from overlapping circles
    flameGraphics.fillStyle(0xff2200, 1);
    flameGraphics.fillCircle(8, 6, 5);    // Main body
    flameGraphics.fillCircle(5, 10, 3);   // Left bottom
    flameGraphics.fillCircle(8, 11, 3);   // Center bottom
    flameGraphics.fillCircle(11, 10, 3);  // Right bottom
    flameGraphics.fillCircle(8, 2, 2);    // Top point
    flameGraphics.generateTexture('flameRed', 16, 16);
    flameGraphics.clear();
    
    // Orange flame particle
    flameGraphics.fillStyle(0xff6600, 1);
    flameGraphics.fillCircle(8, 6, 5.5);  // Main body
    flameGraphics.fillCircle(5, 11, 3.5); // Left bottom
    flameGraphics.fillCircle(8, 12, 3.5); // Center bottom
    flameGraphics.fillCircle(11, 11, 3.5);// Right bottom
    flameGraphics.fillCircle(8, 1, 2.5);  // Top point
    flameGraphics.generateTexture('flameOrange', 16, 16);
    flameGraphics.clear();
    
    // Yellow flame particle - brighter and sharper
    flameGraphics.fillStyle(0xffdd00, 1);
    flameGraphics.fillCircle(6, 5, 4);    // Main body
    flameGraphics.fillCircle(4, 8, 2.5);  // Left
    flameGraphics.fillCircle(6, 9, 2.5);  // Center
    flameGraphics.fillCircle(8, 8, 2.5);  // Right
    flameGraphics.fillCircle(6, 1, 1.5);  // Top point
    flameGraphics.generateTexture('flameYellow', 12, 12);
    flameGraphics.clear();

    // White/bright hot center
    flameGraphics.fillStyle(0xffff99, 1);
    flameGraphics.fillCircle(4, 4, 3);
    flameGraphics.generateTexture('flameWhite', 8, 8);
    
    flameGraphics.destroy();

    // Bottom flame emitters (main burning effect)
    const bottomFlameLeft = this.add.particles(0, height, 'flameRed', {
      x: { min: 0, max: width / 2 },
      y: 0,
      speed: { min: 50, max: 150 },
      angle: { min: 250, max: 290 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 0.9, end: 0 },
      lifespan: 3000,
      frequency: 50,
      blendMode: 'ADD'
    });
    bottomFlameLeft.setDepth(-500);

    const bottomFlameRight = this.add.particles(width, height, 'flameOrange', {
      x: { min: width / 2, max: width },
      y: 0,
      speed: { min: 50, max: 150 },
      angle: { min: 250, max: 290 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 0.9, end: 0 },
      lifespan: 3000,
      frequency: 50,
      blendMode: 'ADD'
    });
    bottomFlameRight.setDepth(-500);

    // Side flame emitters
    const leftFlame = this.add.particles(0, 0, 'flameOrange', {
      x: 0,
      y: { min: height * 0.3, max: height },
      speed: { min: 30, max: 80 },
      angle: { min: -20, max: 20 },
      scale: { start: 1.2, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 2500,
      frequency: 80,
      blendMode: 'ADD'
    });
    leftFlame.setDepth(-500);

    const rightFlame = this.add.particles(width, 0, 'flameOrange', {
      x: 0,
      y: { min: height * 0.3, max: height },
      speed: { min: 30, max: 80 },
      angle: { min: 160, max: 200 },
      scale: { start: 1.2, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 2500,
      frequency: 80,
      blendMode: 'ADD'
    });
    rightFlame.setDepth(-500);

    // Add bright yellow/white hot spots
    const hotSpots = this.add.particles(width / 2, height, 'flameYellow', {
      x: { min: -width * 0.3, max: width * 0.3 },
      y: 0,
      speed: { min: 80, max: 200 },
      angle: { min: 260, max: 280 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 2000,
      frequency: 100,
      blendMode: 'ADD'
    });
    hotSpots.setDepth(-400);
  }

  createTitleFlames(titleText, centerX, centerY) {
    // Get title bounds for particle positioning
    const titleBounds = titleText.getBounds();
    const titleWidth = titleBounds.width;
    const titleHeight = titleBounds.height;

    // Create orange/red flames rising from bottom of text
    const flameBottom = this.add.particles(centerX, centerY + titleHeight / 2 + 10, 'flameRed', {
      x: { min: -titleWidth / 2.5, max: titleWidth / 2.5 },
      y: 0,
      speed: { min: 50, max: 120 },
      angle: { min: 255, max: 285 },
      scale: { start: 1.3, end: 0.1 },
      alpha: { start: 0.95, end: 0 },
      lifespan: 1800,
      frequency: 25,
      blendMode: 'ADD'
    });
    flameBottom.setDepth(1000);

    // Create orange flames on the sides
    const flameLeft = this.add.particles(centerX - titleWidth / 2 - 15, centerY, 'flameOrange', {
      x: { min: -15, max: 0 },
      y: { min: -titleHeight / 2.5, max: titleHeight / 2.5 },
      speed: { min: 40, max: 100 },
      angle: { min: -35, max: 35 },
      scale: { start: 1.2, end: 0.1 },
      alpha: { start: 0.9, end: 0 },
      lifespan: 1400,
      frequency: 40,
      blendMode: 'ADD'
    });
    flameLeft.setDepth(1000);

    const flameRight = this.add.particles(centerX + titleWidth / 2 + 15, centerY, 'flameOrange', {
      x: { min: 0, max: 15 },
      y: { min: -titleHeight / 2.5, max: titleHeight / 2.5 },
      speed: { min: 40, max: 100 },
      angle: { min: 145, max: 215 },
      scale: { start: 1.2, end: 0.1 },
      alpha: { start: 0.9, end: 0 },
      lifespan: 1400,
      frequency: 40,
      blendMode: 'ADD'
    });
    flameRight.setDepth(1000);

    // Create bright yellow hot flames in the center
    const flameHot = this.add.particles(centerX, centerY, 'flameYellow', {
      x: { min: -titleWidth / 2.2, max: titleWidth / 2.2 },
      y: { min: -titleHeight / 2.8, max: titleHeight / 2.8 },
      speed: { min: 60, max: 140 },
      angle: { min: 265, max: 275 },
      scale: { start: 0.9, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1200,
      frequency: 50,
      blendMode: 'ADD'
    });
    flameHot.setDepth(1000);

    // Add white hot core particles
    const hotCore = this.add.particles(centerX, centerY, 'flameWhite', {
      x: { min: -titleWidth / 3, max: titleWidth / 3 },
      y: { min: -titleHeight / 3, max: titleHeight / 3 },
      speed: { min: 70, max: 150 },
      angle: { min: 260, max: 280 },
      scale: { start: 0.7, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1000,
      frequency: 60,
      blendMode: 'ADD'
    });
    hotCore.setDepth(1001);

    // Add ember particles floating dramatically upward
    const embers = this.add.particles(centerX, centerY + titleHeight / 2, 'flameYellow', {
      x: { min: -titleWidth / 2.5, max: titleWidth / 2.5 },
      y: 10,
      speed: { min: 30, max: 80 },
      angle: { min: 265, max: 275 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 3000,
      frequency: 80,
      blendMode: 'ADD',
      gravityY: -50
    });
    embers.setDepth(999);

    // Glow effect: add a yellow/orange tint to the text
    titleText.setTint(0xffccaa);
    
    // Add a subtle pulsing glow effect
    this.tweens.add({
      targets: titleText,
      alpha: { from: 1, to: 0.97 },
      duration: 100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
  }

  shutdown() {
    // Called when scene stops
  }
}
