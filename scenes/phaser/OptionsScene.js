import { gameState } from '../../services/gameState.js';

/**
 * OptionsScene
 * Settings and options menu
 */
export class OptionsScene extends Phaser.Scene {
  constructor() {
    console.log('[CONSTRUCTOR] OptionsScene being instantiated');
    super({ key: 'OptionsScene', active: false });
  }

  create() {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // Background
    this.add.rectangle(centerX, centerY, width, height, 0x0a0a0a, 1).setOrigin(0.5);

    // Title
    const titleText = this.add.text(centerX, 80, 'OPTIONS', {
      font: '56px Impact',
      fill: '#ffffff',
      stroke: '#550000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Sound Volume Option
    this.add.text(centerX - 300, 200, 'Sound Volume:', {
      font: 'bold 24px Arial',
      fill: '#ffffff'
    }).setOrigin(0, 0.5);

    const soundSlider = this.add.rectangle(centerX + 100, 200, 200, 30, 0x444444, 1)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xffffff);

    const soundFill = this.add.rectangle(centerX - 100 + gameState.settings.soundVolume * 100, 200, gameState.settings.soundVolume * 200, 30, 0xff6b00, 1)
      .setOrigin(0, 0.5);

    soundSlider.setInteractive({ useHandCursor: true });
    soundSlider.on('pointerdown', (pointer) => {
      const localX = pointer.x - (centerX - 100);
      const newVolume = Math.max(0, Math.min(1, localX / 200));
      gameState.settings.soundVolume = newVolume;
      soundFill.setDisplayOrigin(0, 0);
      soundFill.setX(centerX - 100 + newVolume * 100);
      soundFill.setScale(newVolume * 2, 1);
    });

    // Music Volume Option
    this.add.text(centerX - 300, 280, 'Music Volume:', {
      font: 'bold 24px Arial',
      fill: '#ffffff'
    }).setOrigin(0, 0.5);

    const musicSlider = this.add.rectangle(centerX + 100, 280, 200, 30, 0x444444, 1)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xffffff);

    const musicFill = this.add.rectangle(centerX - 100 + gameState.settings.musicVolume * 100, 280, gameState.settings.musicVolume * 200, 30, 0xff6b00, 1)
      .setOrigin(0, 0.5);

    musicSlider.setInteractive({ useHandCursor: true });
    musicSlider.on('pointerdown', (pointer) => {
      const localX = pointer.x - (centerX - 100);
      const newVolume = Math.max(0, Math.min(1, localX / 200));
      gameState.settings.musicVolume = newVolume;
      musicFill.setDisplayOrigin(0, 0);
      musicFill.setX(centerX - 100 + newVolume * 100);
      musicFill.setScale(newVolume * 2, 1);
    });

    // Graphics Quality Option
    this.add.text(centerX - 300, 360, 'Graphics Quality:', {
      font: 'bold 24px Arial',
      fill: '#ffffff'
    }).setOrigin(0, 0.5);

    const qualities = ['Low', 'Medium', 'High'];
    const qualityButtons = [];
    qualities.forEach((quality, idx) => {
      const isSelected = gameState.settings.graphicsQuality === quality.toLowerCase();
      const btn = this.add.rectangle(centerX - 50 + idx * 110, 360, 100, 40, isSelected ? 0xff6b00 : 0x444444, 1)
        .setOrigin(0.5)
        .setStrokeStyle(2, 0xffffff)
        .setInteractive({ useHandCursor: true });

      const label = this.add.text(centerX - 50 + idx * 110, 360, quality, {
        font: 'bold 18px Arial',
        fill: '#ffffff'
      }).setOrigin(0.5);

      btn.on('pointerdown', () => {
        gameState.settings.graphicsQuality = quality.toLowerCase();
        // Update all buttons
        qualityButtons.forEach((b, i) => {
          b.btn.setFillStyle(gameState.settings.graphicsQuality === qualities[i].toLowerCase() ? 0xff6b00 : 0x444444);
        });
      });

      qualityButtons.push({ btn, label });
    });

    // Back Button
    const backButton = this.add.rectangle(centerX, 500, 200, 60, 0xff0000, 0.8)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const backText = this.add.text(centerX, 500, 'Back to Menu', {
      font: '20px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

    backButton.on('pointerover', () => {
      this.tweens.add({
        targets: backButton,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200
      });
    });

    backButton.on('pointerout', () => {
      this.tweens.add({
        targets: backButton,
        scaleX: 1,
        scaleY: 1,
        duration: 200
      });
    });

    backButton.on('pointerdown', () => {
      this.scene.stop();
      this.scene.start('MenuScene');
    });
  }
}
