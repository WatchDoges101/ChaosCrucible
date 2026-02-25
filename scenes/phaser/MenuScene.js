import { gameState } from '../services/gameState.js';
import { audioManager } from '../services/audioManager.js';

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
    super({ key: 'MenuScene' });
  }

  preload() {
    // Load any assets needed for menu
    // this.load.image('menuBg', './assets/gameBackground.jpg');
  }

  create() {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // Background (simple color for now)
    this.add.rectangle(centerX, centerY, width, height, 0x0a0a0a).setOrigin(0.5);

    // Title
    this.add.text(centerX, 100, 'Luke\'s Games', {
      font: '48px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

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
        this.scene.start(config.scene);
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
