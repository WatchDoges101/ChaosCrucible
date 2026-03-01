import { cleanupScene } from '../../helpers/sceneCleanupHelpers.js';
import { createPowerupSprite, POWERUP_WIKI_DATA } from '../../helpers/powerupSpriteHelpers.js';

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
      this.scene.start('WikiScene');
    };
    this.input.keyboard.on('keydown-ESC', this.escBackHandler);
  }

  createBackButton(x, y) {
    const text = this.add.text(x, y, 'BACK', {
      font: 'bold 22px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

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
      this.scene.start('WikiScene');
    });
  }

  createPowerupList(centerX, centerY) {
    const powerupOrder = ['blood_orb', 'fury_totem', 'time_shard', 'iron_aegis'];
    const powerups = powerupOrder.map(type => ({ type, ...POWERUP_WIKI_DATA[type] }));

    const itemWidth = Math.min(760, this.scale.width - 80);
    const itemHeight = 130;
    const gap = 20;
    const totalHeight = powerups.length * itemHeight + (powerups.length - 1) * gap;
    const startY = -totalHeight / 2 + itemHeight / 2;

    const listContainer = this.add.container(centerX, centerY);

    powerups.forEach((powerup, index) => {
      const itemY = startY + index * (itemHeight + gap);
      const itemContainer = this.add.container(0, itemY);

      const panel = this.add.rectangle(0, 0, itemWidth, itemHeight, 0x2b0a0a, 0.86)
        .setStrokeStyle(2, 0xff8844, 0.75);

      const iconX = centerX - itemWidth / 2 + 70;
      const iconY = centerY + itemY;
      createPowerupSprite(this, {
        type: powerup.type,
        x: iconX,
        y: iconY,
        tint: powerup.color,
        float: false,
        depth: 5,
        scale: 1.1,
        ignoreUiCamera: false
      });

      const nameText = this.add.text(-itemWidth / 2 + 130, -34, powerup.name, {
        font: 'bold 26px Arial',
        fill: '#ffffff'
      });

      const durationText = this.add.text(-itemWidth / 2 + 130, -3, `Duration: ${powerup.duration}`, {
        font: '17px Arial',
        fill: '#ffdda0'
      });

      const effectText = this.add.text(-itemWidth / 2 + 130, 26, `Effect: ${powerup.effect}`, {
        font: '16px Arial',
        fill: '#ffd1a3',
        wordWrap: { width: itemWidth - 180 }
      });

      itemContainer.add([panel, nameText, durationText, effectText]);
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
