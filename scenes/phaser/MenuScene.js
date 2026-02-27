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
    }).setOrigin(0.5);

    // Subtle shake to make the title feel powerful
    this.tweens.add({
      targets: titleText,
      x: centerX + 3,
      y: 102,
      duration: 90,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    // Buttons with interactive areas
    const buttons = [
      { label: 'Start Game', scene: 'CharacterSelectionScene', color: 0xff3300 },
      { label: 'Enemies', scene: 'EnemyWikiScene', color: 0xff8a00 },
      { label: 'Options', scene: 'OptionsScene', color: 0xff6600 }
    ];

    const buttonWidth = 350;
    const buttonHeight = 90;
    const buttonGap = 30;
    const totalHeight = buttons.length * buttonHeight + (buttons.length - 1) * buttonGap;
    const startY = centerY - totalHeight / 2;

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

    const text = this.add.text(x, y, config.label, {
      font: 'bold 32px Arial',
      fill: '#ffffff',
      stroke: '#000000',
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
        // For CharacterSelectionScene, add it first then start it
        if (config.scene === 'CharacterSelectionScene') {
          if (!this.scene.isActive(config.scene) && !this.scene.get(config.scene)) {
            this.scene.add(config.scene, window.sceneClasses[config.scene], true);
          } else {
            this.scene.start(config.scene);
          }
        } else if (config.scene === 'OptionsScene') {
          // For OptionsScene, add it first then start it
          if (!this.scene.isActive(config.scene) && !this.scene.get(config.scene)) {
            this.scene.add(config.scene, window.sceneClasses[config.scene], true);
          } else {
            this.scene.start(config.scene);
          }
        } else if (config.scene === 'EnemyWikiScene') {
          // For EnemyWikiScene, add it first then start it
          if (!this.scene.isActive(config.scene) && !this.scene.get(config.scene)) {
            this.scene.add(config.scene, window.sceneClasses[config.scene], true);
          } else {
            this.scene.start(config.scene);
          }
        } else {
          this.scene.start(config.scene);
        }
      } else if (config.action) {
        config.action();
      }
    });
  }

  createFlameParticles(width, height) {
    // Create flame particles using Phaser's built-in particle system
    // Create graphics for flame particles
    const flameGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Red flame particle
    flameGraphics.fillStyle(0xff3300, 1);
    flameGraphics.fillCircle(8, 8, 8);
    flameGraphics.generateTexture('flameRed', 16, 16);
    flameGraphics.clear();
    
    // Orange flame particle
    flameGraphics.fillStyle(0xff6600, 1);
    flameGraphics.fillCircle(8, 8, 8);
    flameGraphics.generateTexture('flameOrange', 16, 16);
    flameGraphics.clear();
    
    // Yellow flame particle
    flameGraphics.fillStyle(0xffaa00, 1);
    flameGraphics.fillCircle(6, 6, 6);
    flameGraphics.generateTexture('flameYellow', 12, 12);
    
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

  shutdown() {
    // Called when scene stops
  }
}
