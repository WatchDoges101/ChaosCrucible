import { gameState } from '../../services/gameState.js';
import { audioManager } from '../../services/audioManager.js';

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

    // Completely shut down any other scenes (active, paused, or sleeping)
    const scenesToShutdown = [
      'CharacterSelectionScene',
      'CharacterCustomizationScene',
      'ChaossCrucibleScene',
      'HostScene'
    ];
    scenesToShutdown.forEach(key => {
      const sceneInstance = this.scene.get(key);
      if (sceneInstance) {
        this.scene.stop(key);
        // Remove all display objects from that scene's display list
        if (sceneInstance.children && sceneInstance.children.list) {
          sceneInstance.children.list.forEach(child => {
            try { child.destroy(); } catch(e) {}
          });
        }
      }
    });

    // Background (simple color for now) - must be FIRST and FULLY OPAQUE to cover everything
    const bg = this.add.rectangle(centerX, centerY, width, height, 0x0a0a0a, 1).setOrigin(0.5);
    bg.setDepth(-1000); // Make sure it's behind everything

    // Title
    const titleText = this.add.text(centerX, 100, 'CHAOS CRUCIBLE', {
      font: '64px Impact',
      fill: '#ffffff',
      stroke: '#550000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Subtle shake to make the title feel powerful
    this.tweens.add({
      targets: titleText,
      x: centerX + 3,
      y: 102,
      duration: 90,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inout'
    });

    // Buttons with interactive areas
    const buttons = [
      { label: 'Start Game', scene: 'CharacterSelectionScene', color: 0xff0000 },
      { label: 'Options', scene: 'OptionsScene', color: 0x00ff00 },
      { label: 'Quit', action: () => this.quitGame(), color: 0x0000ff }
    ];

    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonGap = 20;
    const totalHeight = buttons.length * buttonHeight + (buttons.length - 1) * buttonGap;
    const startY = centerY - totalHeight / 2;

    buttons.forEach((btn, idx) => {
      const y = startY + idx * (buttonHeight + buttonGap);
      this.createButton(centerX, y, buttonWidth, buttonHeight, btn);
    });

    // Play background music
    // audioManager.playMusic('menuMusic', true);
  }

  createButton(x, y, width, height, config) {
    const button = this.add.rectangle(x, y, width, height, config.color, 0.8)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const text = this.add.text(x, y, config.label, {
      font: '20px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

    button.on('pointerover', () => {
      button.setScale(1.1);
      this.tweens.add({
        targets: button,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200
      });
    });

    button.on('pointerout', () => {
      this.tweens.add({
        targets: button,
        scaleX: 1,
        scaleY: 1,
        duration: 200
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
        } else {
          this.scene.start(config.scene);
        }
      } else if (config.action) {
        config.action();
      }
    });
  }

  quitGame() {
    console.log('Quit game (would close window in production)');
  }

  shutdown() {
    // Called when scene stops
  }
}
