import { gameState } from '../../services/gameState.js';

export default class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  create() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    // Dimmed overlay
    this.add.rectangle(centerX, centerY, this.scale.width, this.scale.height, 0x000000, 0.45).setOrigin(0.5);
    // Panel
    this.add.rectangle(centerX, centerY, 440, 260, 0x222222, 0.92).setOrigin(0.5).setStrokeStyle(4, 0xffd700);
    // Title
    this.add.text(centerX, centerY - 80, 'PAUSED', {
      font: 'bold 44px Arial', fill: '#ff0', stroke: '#000', strokeThickness: 7
    }).setOrigin(0.5);

    // OPTIONS button
    const optionsBtn = this.add.text(centerX, centerY - 10, 'OPTIONS', {
      font: 'bold 30px Arial', fill: '#fff', stroke: '#000', strokeThickness: 4, backgroundColor: '#444', padding: { left: 24, right: 24, top: 12, bottom: 12 }
    }).setOrigin(0.5).setInteractive();
    optionsBtn.on('pointerdown', () => {
      this.scene.stop();
      this.scene.start('OptionsScene');
    });
    optionsBtn.on('pointerover', () => optionsBtn.setStyle({ fill: '#ff0' }));
    optionsBtn.on('pointerout', () => optionsBtn.setStyle({ fill: '#fff' }));

    // QUIT button
    const quitBtn = this.add.text(centerX, centerY + 60, 'QUIT', {
      font: 'bold 30px Arial', fill: '#fff', stroke: '#000', strokeThickness: 4, backgroundColor: '#444', padding: { left: 24, right: 24, top: 12, bottom: 12 }
    }).setOrigin(0.5).setInteractive();
    quitBtn.on('pointerdown', () => {
      this.scene.stop('ChaossCrucibleScene');
      this.scene.start('MenuScene');
    });
    quitBtn.on('pointerover', () => quitBtn.setStyle({ fill: '#ff0' }));
    quitBtn.on('pointerout', () => quitBtn.setStyle({ fill: '#fff' }));

    // ESC to resume
    this.add.text(centerX, centerY + 120, 'PRESS ESC TO RESUME', {
      font: 'bold 18px Arial', fill: '#ff0', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5);
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.stop();
      this.scene.resume('ChaossCrucibleScene');
    });
  }
}
