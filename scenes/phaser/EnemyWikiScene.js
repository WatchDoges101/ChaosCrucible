import { generateEnemySprite } from '../../services/spriteGenerator.js';
import { cleanupScene } from '../../helpers/sceneCleanupHelpers.js';

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
        ,
        {
          name: 'Frost Wraith',
          type: 'frost_wraith',
          stats: { hp: 70, damage: 15, speed: 80 },
          abilities: ['Freeze', 'Icy Dash']
        },
        {
          name: 'Bomber Beetle',
          type: 'bomber_beetle',
          stats: { hp: 60, damage: 10, speed: 50 },
          abilities: ['Explosive Bomb', 'Quick Escape']
        },
        {
          name: 'Storm Mage',
          type: 'storm_mage',
          stats: { hp: 90, damage: 20, speed: 60 },
          abilities: ['Lightning Strike', 'Teleport']
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
      this.addEnemyAnimations(sprite, enemy.type, index);

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

  addEnemyAnimations(sprite, type, index) {
    const baseDelay = index * 200;

    switch (type) {
      case 'slime':
        this.tweens.add({
          targets: sprite,
          scaleY: 1.15,
          scaleX: 1.2,
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.inOut',
          delay: baseDelay
        });
        break;

      case 'devil':
        this.tweens.add({
          targets: sprite,
          y: sprite.y - 8,
          duration: 1200,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.inOut',
          delay: baseDelay
        });

        if (sprite.glow) {
          this.tweens.add({
            targets: sprite.glow,
            alpha: 0.4,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut',
            delay: baseDelay
          });
        }

        if (sprite.wings) {
          this.tweens.add({
            targets: sprite.wings,
            scaleX: 1.1,
            scaleY: 0.95,
            duration: 400,
            yoyo: true,
            repeat: -1,
            ease: 'Quad.inOut',
            delay: baseDelay + 100
          });
        }

        if (sprite.tail) {
          this.tweens.add({
            targets: sprite.tail,
            angle: -10,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut',
            delay: baseDelay + 200
          });
        }

        if (sprite.weapon) {
          this.tweens.add({
            targets: sprite.weapon,
            angle: 15,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut',
            delay: baseDelay + 300
          });
        }
        break;

      case 'skeleton':
        this.tweens.add({
          targets: sprite,
          angle: -5,
          duration: 1800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.inOut',
          delay: baseDelay
        });

        if (sprite.skull) {
          this.tweens.add({
            targets: sprite.skull,
            y: sprite.skull.y - 3,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut',
            delay: baseDelay + 100
          });
        }

        if (sprite.weapon) {
          this.tweens.add({
            targets: sprite.weapon,
            angle: 8,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut',
            delay: baseDelay + 200
          });
        }
        break;

      case 'frost_wraith':
        this.tweens.add({
          targets: sprite,
          y: sprite.y - 10,
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.inOut',
          delay: baseDelay
        });

        this.tweens.add({
          targets: sprite,
          angle: 5,
          duration: 3000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.inOut',
          delay: baseDelay + 100
        });

        if (sprite.aura) {
          this.tweens.add({
            targets: sprite.aura,
            alpha: 0.3,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut',
            delay: baseDelay
          });
        }

        if (sprite.crystals) {
          this.tweens.add({
            targets: sprite.crystals,
            alpha: 0.7,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut',
            delay: baseDelay + 300
          });
        }

        if (sprite.tail) {
          this.tweens.add({
            targets: sprite.tail,
            alpha: 0.4,
            scaleY: 0.9,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut',
            delay: baseDelay + 200
          });
        }

        if (sprite.shards) {
          this.tweens.add({
            targets: sprite.shards,
            angle: 360,
            duration: 8000,
            repeat: -1,
            ease: 'Linear',
            delay: baseDelay
          });
        }
        break;

      case 'bomber_beetle':
        this.tweens.add({
          targets: sprite,
          angle: -3,
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: 'Bounce.inOut',
          delay: baseDelay
        });

        if (sprite.antennae) {
          this.tweens.add({
            targets: sprite.antennae,
            angle: 10,
            duration: 400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut',
            delay: baseDelay + 100
          });
        }

        if (sprite.bomb) {
          this.tweens.add({
            targets: sprite.bomb,
            alpha: 0.6,
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: 'Quad.inOut',
            delay: baseDelay
          });
        }

        if (sprite.legs) {
          this.tweens.add({
            targets: sprite.legs,
            scaleX: 1.05,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut',
            delay: baseDelay + 200
          });
        }
        break;

      case 'storm_mage':
        this.tweens.add({
          targets: sprite,
          y: sprite.y - 7,
          duration: 1800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.inOut',
          delay: baseDelay
        });

        this.tweens.add({
          targets: sprite,
          angle: 4,
          duration: 2500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.inOut',
          delay: baseDelay + 100
        });

        if (sprite.aura) {
          this.tweens.add({
            targets: sprite.aura,
            alpha: 0.25,
            scaleX: 1.25,
            scaleY: 1.25,
            duration: 1600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut',
            delay: baseDelay
          });
        }

        if (sprite.leftArm) {
          this.tweens.add({
            targets: sprite.leftArm,
            angle: -15,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut',
            delay: baseDelay + 200
          });
        }

        if (sprite.rightArm) {
          this.tweens.add({
            targets: sprite.rightArm,
            angle: 15,
            duration: 2200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut',
            delay: baseDelay + 300
          });
        }

        if (sprite.staff) {
          this.tweens.add({
            targets: sprite.staff,
            alpha: 0.8,
            angle: 10,
            duration: 1300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut',
            delay: baseDelay + 400
          });
        }
        break;

      default:
        this.tweens.add({
          targets: sprite,
          y: sprite.y - 5,
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.inOut',
          delay: baseDelay
        });
        break;
    }
  }

  shutdown() {
    // Clean up all scene resources
    cleanupScene(this);
  }}