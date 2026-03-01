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
    const flameColors = [0xff2a00, 0xff5500, 0xff7a00, 0xffaa22, 0xffdd66];
    const emberColors = [0xff6f00, 0xff9c33, 0xffc04d];

    const makeFlameTongue = (baseX, baseY, widthRange, heightRange, depth, horizontalDrift = 0) => {
      const flame = this.add.ellipse(
        baseX,
        baseY,
        Phaser.Math.Between(widthRange.min, widthRange.max),
        Phaser.Math.Between(heightRange.min, heightRange.max),
        flameColors[Phaser.Math.Between(0, flameColors.length - 1)],
        Phaser.Math.FloatBetween(0.55, 0.92)
      );
      flame.setDepth(depth);

      const startY = baseY;
      const startX = baseX;

      this.tweens.add({
        targets: flame,
        y: startY - Phaser.Math.Between(55, 210),
        x: startX + Phaser.Math.Between(-horizontalDrift, horizontalDrift),
        alpha: { from: flame.alpha, to: 0.06 },
        scaleX: Phaser.Math.FloatBetween(0.75, 1.35),
        scaleY: Phaser.Math.FloatBetween(1.05, 1.75),
        duration: Phaser.Math.Between(420, 980),
        repeat: -1,
        delay: Phaser.Math.Between(0, 650),
        ease: 'Sine.easeOut',
        onRepeat: () => {
          flame.x = startX + Phaser.Math.Between(-horizontalDrift, horizontalDrift);
          flame.y = startY + Phaser.Math.Between(-6, 8);
          flame.alpha = Phaser.Math.FloatBetween(0.55, 0.92);
          flame.width = Phaser.Math.Between(widthRange.min, widthRange.max);
          flame.height = Phaser.Math.Between(heightRange.min, heightRange.max);
          flame.setFillStyle(flameColors[Phaser.Math.Between(0, flameColors.length - 1)], flame.alpha);
        }
      });

      return flame;
    };

    const floorFlameCount = 90;
    for (let i = 0; i < floorFlameCount; i++) {
      const x = (i / (floorFlameCount - 1)) * width;
      const y = height + Phaser.Math.Between(8, 34);
      makeFlameTongue(x, y, { min: 18, max: 48 }, { min: 36, max: 110 }, -540 + Phaser.Math.Between(0, 50), 22);
    }

    const sideFlameCount = 24;
    for (let i = 0; i < sideFlameCount; i++) {
      const y = height * 0.22 + i * ((height * 0.78) / sideFlameCount);
      makeFlameTongue(0 + Phaser.Math.Between(-12, 18), y, { min: 16, max: 34 }, { min: 40, max: 92 }, -535, 28);
      makeFlameTongue(width + Phaser.Math.Between(-18, 12), y, { min: 16, max: 34 }, { min: 40, max: 92 }, -535, 28);
    }

    for (let i = 0; i < 18; i++) {
      const ember = this.add.circle(
        Phaser.Math.Between(0, width),
        height + Phaser.Math.Between(0, 50),
        Phaser.Math.Between(2, 4),
        emberColors[Phaser.Math.Between(0, emberColors.length - 1)],
        0.65
      );
      ember.setDepth(-510);

      this.tweens.add({
        targets: ember,
        y: -30,
        x: ember.x + Phaser.Math.Between(-30, 30),
        alpha: { from: 0.65, to: 0 },
        duration: Phaser.Math.Between(3200, 5200),
        repeat: -1,
        delay: Phaser.Math.Between(0, 2200),
        ease: 'Sine.easeOut',
        onRepeat: () => {
          ember.x = Phaser.Math.Between(0, width);
          ember.y = height + Phaser.Math.Between(0, 50);
          ember.setFillStyle(emberColors[Phaser.Math.Between(0, emberColors.length - 1)], 0.65);
        }
      });
    }
  }

  createTitleFlames(titleText, centerX, centerY) {
    const titleBounds = titleText.getBounds();
    const titleWidth = titleBounds.width;

    const glowLayer = this.add.graphics();
    glowLayer.fillStyle(0xff5a00, 0.24);
    glowLayer.fillRoundedRect(centerX - titleWidth / 2 - 18, centerY - 44, titleWidth + 36, 88, 38);
    glowLayer.fillStyle(0xffaa00, 0.13);
    glowLayer.fillRoundedRect(centerX - titleWidth / 2 - 8, centerY - 32, titleWidth + 16, 64, 30);
    glowLayer.setDepth(999);

    const tongues = [];
    const tongueCount = 24;
    for (let i = 0; i < tongueCount; i++) {
      const tx = centerX - titleWidth / 2 + (i / (tongueCount - 1)) * titleWidth;
      const tongue = this.add.ellipse(
        tx,
        centerY + 50,
        Phaser.Math.Between(12, 28),
        Phaser.Math.Between(26, 62),
        Phaser.Utils.Array.GetRandom([0xff4400, 0xff7700, 0xffc247]),
        Phaser.Math.FloatBetween(0.55, 0.88)
      );
      tongue.setDepth(1000);
      tongues.push(tongue);

      this.tweens.add({
        targets: tongue,
        y: centerY + Phaser.Math.Between(4, 32),
        alpha: { from: tongue.alpha, to: 0.06 },
        scaleX: Phaser.Math.FloatBetween(0.85, 1.25),
        scaleY: Phaser.Math.FloatBetween(1.1, 1.8),
        duration: Phaser.Math.Between(380, 860),
        repeat: -1,
        delay: Phaser.Math.Between(0, 500),
        ease: 'Sine.easeOut',
        onRepeat: () => {
          tongue.x = tx + Phaser.Math.Between(-12, 12);
          tongue.y = centerY + 50;
          tongue.alpha = Phaser.Math.FloatBetween(0.55, 0.88);
          tongue.width = Phaser.Math.Between(12, 28);
          tongue.height = Phaser.Math.Between(26, 62);
          tongue.setFillStyle(Phaser.Utils.Array.GetRandom([0xff4400, 0xff7700, 0xffc247]), tongue.alpha);
        }
      });
    }

    this.tweens.add({
      targets: [glowLayer, ...tongues],
      alpha: { from: 0.8, to: 1 },
      duration: 260,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

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
