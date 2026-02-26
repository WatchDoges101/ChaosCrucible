import { generateEnemySprite } from '../../services/spriteGenerator.js';

/**
 * EnemyWikiScene
 * Shows a centered list of enemies with sprites, stats, and abilities.
 */
export class EnemyWikiScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EnemyWikiScene', active: false });
  }

  create() {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    const bg = this.add.rectangle(centerX, centerY, width, height, 0x150606, 1).setOrigin(0.5);
    bg.setDepth(-1000);

    this.add.text(centerX, 80, 'ENEMY WIKI', {
      font: 'bold 56px Impact',
      fill: '#ffffff',
      stroke: '#550000',
      strokeThickness: 8
    }).setOrigin(0.5);

    this.createBackButton(90, 50);
    this.createEnemyList(centerX, centerY + 40);
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

  createEnemyList(centerX, centerY) {
    const enemies = [
      {
        name: 'Slime',
        type: 'slime',
        stats: { hp: 40, damage: 8, speed: 60 },
        abilities: ['Split Bounce', 'Sticky Slow']
      },
      {
        name: 'Devil',
        type: 'devil',
        stats: { hp: 85, damage: 18, speed: 70 },
        abilities: ['Hellfire Burst', 'Winged Dash']
      },
      {
        name: 'Skeleton',
        type: 'skeleton',
        stats: { hp: 55, damage: 12, speed: 65 },
        abilities: ['Bone Throw', 'Shielded Guard']
      }
    ];

    const itemWidth = Math.min(720, this.scale.width - 80);
    const itemHeight = 130;
    const gap = 24;
    const totalHeight = enemies.length * itemHeight + (enemies.length - 1) * gap;
    const startY = -totalHeight / 2 + itemHeight / 2;

    const listContainer = this.add.container(centerX, centerY);

    enemies.forEach((enemy, index) => {
      const itemY = startY + index * (itemHeight + gap);
      const itemContainer = this.add.container(0, itemY);

      const panel = this.add.rectangle(0, 0, itemWidth, itemHeight, 0x2b0a0a, 0.85)
        .setStrokeStyle(2, 0xff5500, 0.7);

      const sprite = generateEnemySprite(this, 0, 0, enemy.type);
      sprite.setScale(1.3);
      sprite.x = -itemWidth / 2 + 70;

      const nameText = this.add.text(-itemWidth / 2 + 140, -38, enemy.name, {
        font: 'bold 26px Arial',
        fill: '#ffffff'
      });

      const statsText = this.add.text(
        -itemWidth / 2 + 140,
        -8,
        `HP: ${enemy.stats.hp}  DMG: ${enemy.stats.damage}  SPD: ${enemy.stats.speed}`,
        {
          font: '18px Arial',
          fill: '#ffdda0'
        }
      );

      const abilitiesText = this.add.text(
        -itemWidth / 2 + 140,
        22,
        `Abilities: ${enemy.abilities.join(', ')}`,
        {
          font: '16px Arial',
          fill: '#ffd1a3',
          wordWrap: { width: itemWidth - 180 }
        }
      );

      itemContainer.add([panel, sprite, nameText, statsText, abilitiesText]);
      listContainer.add(itemContainer);
    });
  }
}
