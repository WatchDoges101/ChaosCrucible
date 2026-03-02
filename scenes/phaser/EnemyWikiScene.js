import { generateEnemySprite } from '../../services/spriteGenerator.js';
import { cleanupScene } from '../../helpers/sceneCleanupHelpers.js';

/**
 * EnemyWikiScene
 * Shows a centered list of enemies with sprites, stats, and abilities.
 */
export class EnemyWikiScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EnemyWikiScene', active: false });
    this.escBackHandler = null;
    this.wheelHandler = null;
    this.pointerMoveHandler = null;
    this.upScrollHandler = null;
    this.downScrollHandler = null;
    this.scrollState = null;
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

    this.add.text(centerX, 122, 'Scroll: Mouse Wheel / Arrow Keys', {
      font: 'bold 20px Arial',
      fill: '#ffcc99',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.createBackButton(90, 50);
    this.createEnemyList(centerX, centerY + 36);

    this.wheelHandler = (pointer, _gameObjects, _deltaX, deltaY) => {
      if (!this.scrollState) {
        return;
      }
      if (!Phaser.Geom.Rectangle.Contains(this.scrollState.viewportBounds, pointer.x, pointer.y)) {
        return;
      }
      this.scrollBy(-deltaY * 0.45);
    };
    this.input.on('wheel', this.wheelHandler);

    this.pointerMoveHandler = (pointer) => {
      if (!this.scrollState || !pointer.isDown) {
        return;
      }
      if (!Phaser.Geom.Rectangle.Contains(this.scrollState.viewportBounds, pointer.x, pointer.y) && !this.scrollState.isDragging) {
        return;
      }
      this.scrollState.isDragging = true;
      this.scrollBy(pointer.velocity.y * 0.8);
    };
    this.input.on('pointermove', this.pointerMoveHandler);

    this.input.on('pointerup', () => {
      if (this.scrollState) {
        this.scrollState.isDragging = false;
      }
    });

    this.upScrollHandler = () => this.scrollBy(55);
    this.downScrollHandler = () => this.scrollBy(-55);
    this.input.keyboard.on('keydown-UP', this.upScrollHandler);
    this.input.keyboard.on('keydown-DOWN', this.downScrollHandler);

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

  createEnemyList(centerX, centerY) {
    const enemies = [
      {
        name: 'Slime',
        type: 'slime',
        animationType: 'slime',
        stats: { hp: 40, damage: 8, speed: 60 },
        abilities: ['Split Bounce', 'Sticky Slow'],
        notes: 'Basic swarm unit that pressures early waves in numbers.'
      },
      {
        name: 'Devil',
        type: 'devil',
        animationType: 'devil',
        stats: { hp: 85, damage: 18, speed: 70 },
        abilities: ['Hellfire Burst', 'Winged Dash'],
        notes: 'Casts fire lanes and quick gap-closing dashes when close.'
      },
      {
        name: 'Skeleton',
        type: 'skeleton',
        animationType: 'skeleton',
        stats: { hp: 55, damage: 12, speed: 65 },
        abilities: ['Bone Throw', 'Shielded Guard'],
        notes: 'Ranged poke enemy with steady pressure and survivability.'
      },
      {
        name: 'Frost Wraith',
        type: 'frost_wraith',
        animationType: 'frost_wraith',
        stats: { hp: 70, damage: 15, speed: 80 },
        abilities: ['Freeze', 'Icy Dash'],
        notes: 'Mobile control enemy that punishes overextension.'
      },
      {
        name: 'Exploder Beetle',
        type: 'bomber_beetle',
        animationType: 'bomber_beetle',
        stats: { hp: 60, damage: 10, speed: 50 },
        abilities: ['Death Explosion', 'Volatile Charge'],
        notes: 'Forces spacing and movement discipline in melee range.'
      },
      {
        name: 'Storm Mage',
        type: 'storm_mage',
        animationType: 'storm_mage',
        stats: { hp: 90, damage: 20, speed: 60 },
        abilities: ['Lightning Strike', 'Teleport'],
        notes: 'Burst caster that blinks to maintain dangerous angles.'
      },
      {
        name: 'Anomaly Rift (Mini-Boss)',
        type: 'anomaly_rift',
        spriteType: 'anomaly_rift',
        animationType: 'anomaly_rift',
        stats: { hp: 'Elite Scaling', damage: 'High', speed: 62 },
        abilities: ['Rift Bolt', 'Anomaly Pulse', 'Rune Telegraph'],
        notes: 'Appears every 5-7 waves with variant-specific movesets.'
      },
      {
        name: 'Ironbound Colossus (Variant)',
        type: 'anomaly_rift',
        spriteType: 'ironbound_colossus',
        animationType: 'ironbound',
        stats: { hp: 'Very High', damage: 'Heavy', speed: 56 },
        abilities: ['Charging Slam', 'Ground Shockwave'],
        notes: 'Slowest variant, strongest frontal pressure and slam threat.'
      },
      {
        name: 'Crucible Knight (Variant)',
        type: 'anomaly_rift',
        spriteType: 'crucible_knight',
        animationType: 'crucible_knight',
        stats: { hp: 'High', damage: 'High', speed: 68 },
        abilities: ['Parry Window', 'Combo Dash Strikes'],
        notes: 'Balanced duelist with burst chains after parry timings.'
      },
      {
        name: 'Ember Witch (Variant)',
        type: 'anomaly_rift',
        spriteType: 'ember_witch',
        animationType: 'ember_witch',
        stats: { hp: 'High', damage: 'Ranged Burst', speed: 72 },
        abilities: ['Teleport Weave', 'Phase-2 Cast Speed Boost'],
        notes: 'Most mobile variant, accelerates cast tempo below 50% HP.'
      }
    ];

    const itemWidth = Math.min(760, this.scale.width - 80);
    const itemHeight = 158;
    const gap = 16;
    const contentPadding = 18;
    const viewportHeight = Math.min(560, this.scale.height - 205);
    const viewportWidth = itemWidth + 20;
    const viewportTop = centerY - viewportHeight / 2;

    const viewportFrame = this.add.rectangle(centerX, centerY, viewportWidth, viewportHeight, 0x2b0a0a, 0.26)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xff8844, 0.7);

    const viewportBounds = new Phaser.Geom.Rectangle(
      centerX - viewportWidth / 2,
      viewportTop,
      viewportWidth,
      viewportHeight
    );

    const contentContainer = this.add.container(0, 0);

    const listMaskGfx = this.make.graphics({ x: 0, y: 0, add: false });
    listMaskGfx.fillStyle(0xffffff, 1);
    listMaskGfx.fillRect(viewportBounds.x, viewportBounds.y, viewportBounds.width, viewportBounds.height);
    contentContainer.setMask(listMaskGfx.createGeometryMask());

    const totalContentHeight = enemies.length * itemHeight + (enemies.length - 1) * gap + contentPadding * 2;
    const maxScrollDistance = Math.max(0, totalContentHeight - viewportHeight);

    this.scrollState = {
      container: contentContainer,
      viewportBounds,
      minY: -maxScrollDistance,
      maxY: 0,
      isDragging: false
    };

    const startY = viewportTop + contentPadding + itemHeight / 2;

    enemies.forEach((enemy, index) => {
      const itemY = startY + index * (itemHeight + gap);
      const itemContainer = this.add.container(centerX, itemY);

      const panel = this.add.rectangle(0, 0, itemWidth, itemHeight, 0x2b0a0a, 0.86)
        .setStrokeStyle(2, 0xff8844, 0.75);

      const sprite = this.createWikiEnemySprite(enemy);
      sprite.setScale(enemy.type === 'anomaly_rift' ? 1.25 : 1.3);
      sprite.x = -itemWidth / 2 + 70;
      this.addEnemyAnimations(sprite, enemy.animationType || enemy.type, index);

      const nameText = this.add.text(-itemWidth / 2 + 140, -50, enemy.name, {
        font: 'bold 26px Arial',
        fill: '#ffffff'
      });

      const statsText = this.add.text(
        -itemWidth / 2 + 140,
        -20,
        `HP: ${this.formatStatValue(enemy.stats.hp)}  DMG: ${this.formatStatValue(enemy.stats.damage)}  SPD: ${this.formatStatValue(enemy.stats.speed)}`,
        {
          font: '17px Arial',
          fill: '#ffdda0'
        }
      );

      const abilitiesText = this.add.text(
        -itemWidth / 2 + 140,
        10,
        `Abilities: ${enemy.abilities.join(', ')}`,
        {
          font: '16px Arial',
          fill: '#ffd1a3',
          wordWrap: { width: itemWidth - 190 }
        }
      );

      const notesText = this.add.text(
        -itemWidth / 2 + 140,
        54,
        `Notes: ${enemy.notes}`,
        {
          font: '15px Arial',
          fill: '#ffc89d',
          wordWrap: { width: itemWidth - 190 }
        }
      );

      itemContainer.add([panel, sprite, nameText, statsText, abilitiesText, notesText]);
      contentContainer.add(itemContainer);
    });

    if (maxScrollDistance > 0) {
      const trackHeight = viewportHeight - 14;
      const track = this.add.rectangle(
        viewportBounds.right - 7,
        centerY,
        8,
        trackHeight,
        0x000000,
        0.35
      ).setOrigin(0.5);

      const thumbHeight = Math.max(60, (viewportHeight / totalContentHeight) * trackHeight);
      const thumbY = viewportBounds.y + thumbHeight / 2 + 7;
      const thumb = this.add.rectangle(viewportBounds.right - 7, thumbY, 8, thumbHeight, 0xffaa66, 0.75)
        .setOrigin(0.5);

      this.scrollState.track = track;
      this.scrollState.thumb = thumb;
      this.scrollState.trackHeight = trackHeight;
      this.scrollState.thumbHeight = thumbHeight;
    }

    this.setScrollPosition(0);
  }

  createWikiEnemySprite(enemy) {
    const sprite = generateEnemySprite(this, 0, 0, enemy.spriteType || enemy.type);
    if (enemy.tint) {
      this.tintContainerRecursive(sprite, enemy.tint);
    }
    return sprite;
  }

  tintContainerRecursive(target, tint) {
    if (!target) {
      return;
    }

    if (typeof target.setTint === 'function') {
      target.setTint(tint);
    }

    if (target.list && Array.isArray(target.list)) {
      target.list.forEach(child => this.tintContainerRecursive(child, tint));
    }
  }

  formatStatValue(value) {
    return typeof value === 'number' ? Math.round(value) : value;
  }

  scrollBy(delta) {
    if (!this.scrollState) {
      return;
    }
    this.setScrollPosition(this.scrollState.container.y + delta);
  }

  setScrollPosition(newY) {
    if (!this.scrollState) {
      return;
    }

    const clampedY = Phaser.Math.Clamp(newY, this.scrollState.minY, this.scrollState.maxY);
    this.scrollState.container.y = clampedY;

    if (this.scrollState.thumb) {
      const totalRange = Math.abs(this.scrollState.minY - this.scrollState.maxY);
      const progress = totalRange > 0 ? Math.abs(clampedY) / totalRange : 0;
      const thumbMinY = this.scrollState.viewportBounds.y + this.scrollState.thumbHeight / 2 + 7;
      const thumbMaxY = thumbMinY + (this.scrollState.trackHeight - this.scrollState.thumbHeight);
      this.scrollState.thumb.y = Phaser.Math.Linear(thumbMinY, thumbMaxY, progress);
    }
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

      case 'anomaly_rift':
      case 'ironbound':
      case 'crucible_knight':
      case 'ember_witch':
        this.tweens.add({
          targets: sprite,
          y: sprite.y - 8,
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.inOut',
          delay: baseDelay
        });

        this.tweens.add({
          targets: sprite,
          scaleX: sprite.scaleX * 1.08,
          scaleY: sprite.scaleY * 1.08,
          duration: 900,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.inOut',
          delay: baseDelay + 150
        });

        if (sprite.aura) {
          this.tweens.add({
            targets: sprite.aura,
            alpha: 0.2,
            scaleX: 1.35,
            scaleY: 1.35,
            duration: 1100,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut',
            delay: baseDelay
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
    if (this.escBackHandler) {
      this.input.keyboard.off('keydown-ESC', this.escBackHandler);
      this.escBackHandler = null;
    }

    if (this.upScrollHandler) {
      this.input.keyboard.off('keydown-UP', this.upScrollHandler);
      this.upScrollHandler = null;
    }

    if (this.downScrollHandler) {
      this.input.keyboard.off('keydown-DOWN', this.downScrollHandler);
      this.downScrollHandler = null;
    }

    if (this.wheelHandler) {
      this.input.off('wheel', this.wheelHandler);
      this.wheelHandler = null;
    }

    if (this.pointerMoveHandler) {
      this.input.off('pointermove', this.pointerMoveHandler);
      this.pointerMoveHandler = null;
    }

    this.scrollState = null;

    // Clean up all scene resources
    cleanupScene(this);
  }}