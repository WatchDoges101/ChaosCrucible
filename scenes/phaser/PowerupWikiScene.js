import { cleanupScene } from '../../helpers/sceneCleanupHelpers.js';

/**
 * PowerupWikiScene
 * Shows a centered list of powerups with effects and durations.
 */
export class PowerupWikiScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PowerupWikiScene', active: false });
    this.escBackHandler = null;
  }

  create() {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    const bg = this.add.rectangle(centerX, centerY, width, height, 0x150606, 1).setOrigin(0.5);
    bg.setDepth(-1000);

    this.add.text(centerX, 80, 'POWERUP WIKI', {
      font: 'bold 56px Impact',
      fill: '#ffffff',
      stroke: '#550000',
      strokeThickness: 8
    }).setOrigin(0.5);

    this.createBackButton(90, 50);
    this.createPowerupList(centerX, centerY + 40);

    this.escBackHandler = () => {
      this.scene.start('MenuScene');
    };
    this.input.keyboard.on('keydown-ESC', this.escBackHandler);
  }

  createBackButton(x, y) {
    const button = this.add.rectangle(x, y, 120, 44, 0x7a1a00, 0.9)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const text = this.add.text(x, y, 'Back', {
      font: 'bold 20px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

    button.on('pointerover', () => {
      this.tweens.add({
        targets: [button, text],
        scaleX: 1.08,
        scaleY: 1.08,
        duration: 150,
        ease: 'Power2'
      });
    });

    button.on('pointerout', () => {
      this.tweens.add({
        targets: [button, text],
        scaleX: 1,
        scaleY: 1,
        duration: 150,
        ease: 'Power2'
      });
    });

    button.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }

  createPowerupList(centerX, centerY) {
    const powerups = [
      {
        name: 'Blood Orb',
        color: 0xff4d4d,
        effect: 'Instantly restores 30 HP (up to max health).',
        duration: 'Instant'
      },
      {
        name: 'Fury Totem',
        color: 0xffaa33,
        effect: 'Increases all outgoing damage by 35%.',
        duration: '10s'
      },
      {
        name: 'Time Shard',
        color: 0x66ccff,
        effect: 'Reduces attack cooldowns by 30%.',
        duration: '8s'
      },
      {
        name: 'Iron Aegis',
        color: 0x99ccff,
        effect: 'Adds 100 shield that absorbs incoming damage first.',
        duration: 'Until depleted'
      }
    ];

    const itemWidth = Math.min(760, this.scale.width - 80);
    const itemHeight = 120;
    const gap = 20;
    const totalHeight = powerups.length * itemHeight + (powerups.length - 1) * gap;
    const startY = -totalHeight / 2 + itemHeight / 2;

    const listContainer = this.add.container(centerX, centerY);

    powerups.forEach((powerup, index) => {
      const itemY = startY + index * (itemHeight + gap);
      const itemContainer = this.add.container(0, itemY);

      const panel = this.add.rectangle(0, 0, itemWidth, itemHeight, 0x2b0a0a, 0.85)
        .setStrokeStyle(2, powerup.color, 0.8);

      const iconRing = this.add.circle(-itemWidth / 2 + 70, 0, 30, 0x111111, 0.8)
        .setStrokeStyle(3, powerup.color, 1);
      const iconCore = this.add.circle(-itemWidth / 2 + 70, 0, 15, powerup.color, 0.9);

      this.tweens.add({
        targets: [iconRing, iconCore],
        scale: { from: 0.95, to: 1.05 },
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut'
      });

      const nameText = this.add.text(-itemWidth / 2 + 130, -34, powerup.name, {
        font: 'bold 28px Arial',
        fill: '#ffffff'
      });

      const durationText = this.add.text(-itemWidth / 2 + 130, -3, `Duration: ${powerup.duration}`, {
        font: '18px Arial',
        fill: '#ffdda0'
      });

      const effectText = this.add.text(-itemWidth / 2 + 130, 26, `Effect: ${powerup.effect}`, {
        font: '16px Arial',
        fill: '#ffd1a3',
        wordWrap: { width: itemWidth - 180 }
      });

      itemContainer.add([panel, iconRing, iconCore, nameText, durationText, effectText]);
      listContainer.add(itemContainer);
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
