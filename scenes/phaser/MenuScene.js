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
    super({ key: 'MenuScene', active: false });
  }

  preload() {
    // Load background image
    this.load.image('background1', './asset/background1.png');
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

    // Background image - must be FIRST to cover everything
    const bg = this.add.image(centerX, centerY, 'background1').setOrigin(0.5).setDepth(-1000);
    // Scale background to cover entire screen
    const scaleX = width / bg.width;
    const scaleY = height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale);

    // Title
    const titleText = this.add.text(centerX, 120, 'CHAOS CRUCIBLE', {
      font: 'bold 96px Impact',
      fill: '#ffffff',
      stroke: '#550000',
      strokeThickness: 10
    }).setOrigin(0.5).setDepth(1002);

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
    const BUTTON_COLOR = 0xDD6600;
    const GLOW_COLOR = 0xFFAA55;
    const CORNER_RADIUS = 20;

    // Create a container to hold all button visual elements
    const buttonContainer = this.add.container(x, y);
    buttonContainer.setDepth(1000);

    // Create main button with rounded corners in container
    const buttonGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    buttonGraphics.fillStyle(BUTTON_COLOR, 0.85);
    buttonGraphics.fillRoundedRect(-width / 2, -height / 2, width, height, CORNER_RADIUS);
    buttonContainer.add(buttonGraphics);

    // Add border/outline effect
    const borderGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    borderGraphics.lineStyle(3, 0xFFFFFF);
    borderGraphics.strokeRoundedRect(-width / 2, -height / 2, width, height, CORNER_RADIUS);
    buttonContainer.add(borderGraphics);

    // Add inner highlight for 3D effect
    const highlightGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    highlightGraphics.fillStyle(0xFFFFFF, 0.15);
    highlightGraphics.fillRoundedRect(-width / 2, -height / 2 + 5, width, height * 0.18, CORNER_RADIUS / 2);
    buttonContainer.add(highlightGraphics);

    // Create button text in container
    const text = this.add.text(0, 0, config.label.toUpperCase(), {
      font: 'bold 24px Arial',
      fill: '#ffffff',
      align: 'center',
      wordWrap: { width: width - 20 }
      }).setOrigin(0.5);
    buttonContainer.add(text);

    // Create invisible hitbox for interaction
    const hitBox = this.add.rectangle(x, y, width, height)
      .setOrigin(0.5)
      .setFillStyle(0x000000, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(1001);

    // Particle emitter for hover effect
    const particles = this.add.particles(GLOW_COLOR, {
      speed: { min: -100, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 600
    }).setDepth(999);
    particles.stop();

    let scaleTween = null;
    let idleTween = null;
    let isHovering = false;

    // Idle animation - subtle pulse
    const startIdleAnimation = () => {
      idleTween = this.tweens.add({
        targets: buttonContainer,
        scaleX: 1.03,
        scaleY: 1.03,
        duration: 2000,
        delay: Phaser.Math.Between(0, 1000),
        yoyo: true,
        loop: -1,
        ease: 'Sine.easeInOut'
      });
    };

    startIdleAnimation();

    hitBox.on('pointerover', () => {
      isHovering = true;

      // Stop idle animation
      if (idleTween) {
        idleTween.stop();
        idleTween = null;
      }

      // Stop previous tweens
      if (scaleTween) scaleTween.stop();

      // Button scale - only scale the visual container
      scaleTween = this.tweens.add({
        targets: buttonContainer,
        scaleX: 1.12,
        scaleY: 1.12,
        duration: 250,
        ease: 'Back.easeOut'
      });

      // Emit particles on hover
      for (let i = 0; i < 5; i++) {
        particles.emitParticleAt(
          x + Phaser.Math.Between(-width / 3, width / 3),
          y + Phaser.Math.Between(-height / 3, height / 3)
        );
      }
    });

    hitBox.on('pointerout', () => {
      isHovering = false;

      // Stop previous tweens
      if (scaleTween) scaleTween.stop();

      // Reset scale - only reset the visual container
      scaleTween = this.tweens.add({
        targets: buttonContainer,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        ease: 'Back.easeOut'
      });

      // Resume idle animation after reset completes
      this.time.delayedCall(300, () => {
        if (!isHovering) {
          startIdleAnimation();
        }
      });
    });

    hitBox.on('pointerdown', () => {
      // Click feedback - only scale the visual container
      this.tweens.add({
        targets: buttonContainer,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: 'Sine.easeOut',
        yoyo: true
      });

      // Emit burst of particles on click
      for (let i = 0; i < 12; i++) {
        particles.emitParticleAt(
          x + Phaser.Math.Between(-width / 2, width / 2),
          y + Phaser.Math.Between(-height / 2, height / 2)
        );
      }

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
}
