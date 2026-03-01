import { cleanupScene } from '../../helpers/sceneCleanupHelpers.js';

/**
 * WikiScene
 * Hub scene that groups all wiki pages.
 */
export class WikiScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WikiScene', active: false });
    this.escBackHandler = null;
  }

  create() {
    const { width, height } = this.scale;
    const centerX = width / 2;

    const bg = this.add.rectangle(centerX, height / 2, width, height, 0x120707, 1).setOrigin(0.5);
    bg.setDepth(-1000);

    this.add.text(centerX, 90, 'WIKI', {
      font: 'bold 72px Impact',
      fill: '#ffffff',
      stroke: '#550000',
      strokeThickness: 10
    }).setOrigin(0.5);

    this.add.text(centerX, 150, 'Explore enemies and powerups', {
      font: 'bold 24px Arial',
      fill: '#ffcc99'
    }).setOrigin(0.5);

    this.createBackButton(100, 55);

    const cards = [
      { label: 'ENEMIES', scene: 'EnemyWikiScene', y: 285, color: 0x7a1b12 },
      { label: 'POWERUPS', scene: 'PowerupWikiScene', y: 445, color: 0x5a2a0a }
    ];

    cards.forEach(card => {
      this.createWikiCard(centerX, card.y, 560, 120, card);
    });

    this.escBackHandler = () => {
      this.scene.start('MenuScene');
    };
    this.input.keyboard.on('keydown-ESC', this.escBackHandler);
  }

  createBackButton(x, y) {
    const text = this.add.text(x, y, 'BACK', {
      font: 'bold 22px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    text.on('pointerover', () => {
      this.tweens.add({
        targets: text,
        scaleX: 1.08,
        scaleY: 1.08,
        duration: 150,
        ease: 'Power2'
      });
    });

    text.on('pointerout', () => {
      this.tweens.add({
        targets: text,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
        ease: 'Power2'
      });
    });

    text.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }

  createWikiCard(x, y, width, height, config) {
    const panel = this.add.rectangle(x, y, width, height, config.color, 0.85)
      .setOrigin(0.5)
      .setStrokeStyle(3, 0xffaa66, 0.85)
      .setInteractive({ useHandCursor: true });

    const label = this.add.text(x, y, config.label, {
      font: 'bold 44px Impact',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    panel.on('pointerover', () => {
      this.tweens.add({
        targets: [panel, label],
        scaleX: 1.03,
        scaleY: 1.03,
        duration: 160,
        ease: 'Back.easeOut'
      });
    });

    panel.on('pointerout', () => {
      this.tweens.add({
        targets: [panel, label],
        scaleX: 1,
        scaleY: 1,
        duration: 140,
        ease: 'Power2'
      });
    });

    panel.on('pointerdown', () => {
      if (!this.scene.get(config.scene) && window.sceneClasses[config.scene]) {
        this.scene.add(config.scene, window.sceneClasses[config.scene], false);
      }
      this.input.enabled = false;
      this.scene.start(config.scene);
    });
  }

  shutdown() {
    if (this.escBackHandler) {
      this.input.keyboard.off('keydown-ESC', this.escBackHandler);
      this.escBackHandler = null;
    }

    cleanupScene(this);
  }
}
