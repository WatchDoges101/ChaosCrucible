import { openOptionsFromPause, quitToMenuFromPause, resumeFromPause } from '../../helpers/pauseHelpers.js';

export default class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
    this.resumeEscHandler = null;
    this.gameSceneKey = 'ChaossCrucibleScene';
    this.escReadyAt = 0;
  }

  init(data) {
    this.gameSceneKey = data?.gameSceneKey || 'ChaossCrucibleScene';
  }

  create() {
    this.input.keyboard.enabled = true;

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    // Dimmed overlay
    this.add.rectangle(centerX, centerY, this.scale.width, this.scale.height, 0x000000, 0.6)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1000);
    // Panel
    this.add.rectangle(centerX, centerY, 440, 260, 0x222222, 0.92)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1001)
      .setStrokeStyle(4, 0xffd700);
    // Title
    this.add.text(centerX, centerY - 80, 'PAUSED', {
      font: 'bold 44px Arial', fill: '#ff0', stroke: '#000', strokeThickness: 7
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);

    // OPTIONS button
    const optionsBtn = this.add.text(centerX, centerY - 10, 'OPTIONS', {
      font: 'bold 30px Arial', fill: '#fff', stroke: '#000', strokeThickness: 4, backgroundColor: '#444', padding: { left: 24, right: 24, top: 12, bottom: 12 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1002).setInteractive({ useHandCursor: true });
    optionsBtn.on('pointerdown', () => {
      openOptionsFromPause(this, this.gameSceneKey);
    });
    optionsBtn.on('pointerover', () => optionsBtn.setStyle({ fill: '#ff0' }));
    optionsBtn.on('pointerout', () => optionsBtn.setStyle({ fill: '#fff' }));

    // QUIT button
    const quitBtn = this.add.text(centerX, centerY + 60, 'QUIT', {
      font: 'bold 30px Arial', fill: '#fff', stroke: '#000', strokeThickness: 4, backgroundColor: '#444', padding: { left: 24, right: 24, top: 12, bottom: 12 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1002).setInteractive({ useHandCursor: true });
    quitBtn.on('pointerdown', () => {
      quitToMenuFromPause(this, this.gameSceneKey);
    });
    quitBtn.on('pointerover', () => quitBtn.setStyle({ fill: '#ff0' }));
    quitBtn.on('pointerout', () => quitBtn.setStyle({ fill: '#fff' }));

    // ESC to resume
    this.add.text(centerX, centerY + 120, 'PRESS ESC TO RESUME', {
      font: 'bold 18px Arial', fill: '#ff0', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);

    this.escReadyAt = this.time.now + 180;
    this.resumeEscHandler = () => {
      if (this.time.now < this.escReadyAt) {
        return;
      }

      resumeFromPause(this, this.gameSceneKey);
    };

    this.input.keyboard.on('keydown-ESC', this.resumeEscHandler);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.resumeEscHandler) {
        this.input.keyboard.off('keydown-ESC', this.resumeEscHandler);
        this.resumeEscHandler = null;
      }
    });
  }
}
