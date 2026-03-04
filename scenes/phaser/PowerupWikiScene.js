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

    const bg = this.add.rectangle(centerX, centerY, width, height, 0x120707, 1).setOrigin(0.5);
    bg.setDepth(-1000);

    this.add.text(centerX, 90, 'POWERUPS', {
      font: 'bold 72px Impact',
      fill: '#ffffff',
      stroke: '#550000',
      strokeThickness: 10
    }).setOrigin(0.5);

    this.add.text(centerX, 150, 'Buff effects, durations, and use cases', {
      font: 'bold 24px Arial',
      fill: '#ffcc99'
    }).setOrigin(0.5);

    this.createButton(100, 55, 170, 60, {
      label: 'BACK',
      scene: 'WikiScene',
      fontSize: 22
    });
    this.createPowerupList(centerX, centerY + 70);

    this.escBackHandler = () => {
      this.scene.start('WikiScene');
    };
    this.input.keyboard.on('keydown-ESC', this.escBackHandler);
  }

  createButton(x, y, width, height, config) {
    const BUTTON_COLOR = 0xDD6600;
    const GLOW_COLOR = 0xFFAA55;
    const CORNER_RADIUS = 20;
    const fontSize = config.fontSize || 24;

    const buttonContainer = this.add.container(x, y);
    buttonContainer.setDepth(1000);

    const buttonGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    buttonGraphics.fillStyle(BUTTON_COLOR, 0.85);
    buttonGraphics.fillRoundedRect(-width / 2, -height / 2, width, height, CORNER_RADIUS);
    buttonContainer.add(buttonGraphics);

    const borderGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    borderGraphics.lineStyle(3, 0xFFFFFF);
    borderGraphics.strokeRoundedRect(-width / 2, -height / 2, width, height, CORNER_RADIUS);
    buttonContainer.add(borderGraphics);

    const highlightGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    highlightGraphics.fillStyle(0xFFFFFF, 0.15);
    highlightGraphics.fillRoundedRect(-width / 2, -height / 2 + 5, width, height * 0.18, CORNER_RADIUS / 2);
    buttonContainer.add(highlightGraphics);

    const text = this.add.text(0, 0, config.label.toUpperCase(), {
      font: `bold ${fontSize}px Arial`,
      fill: '#ffffff',
      align: 'center',
      wordWrap: { width: width - 20 }
    }).setOrigin(0.5);
    buttonContainer.add(text);

    const hitBox = this.add.rectangle(x, y, width, height)
      .setOrigin(0.5)
      .setFillStyle(0x000000, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(1001);

    const particles = this.add.particles(GLOW_COLOR, {
      speed: { min: -100, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 600
    }).setDepth(999);
    particles.stop();

    let scaleTween = null;
    let idleTween = null;
    let isHovering = false;

    const startIdleAnimation = () => {
      idleTween = this.tweens.add({
        targets: buttonContainer,
        scaleX: 1.03,
        scaleY: 1.03,
        duration: 2000,
        delay: Phaser.Math.Between(0, 1000),
        yoyo: true,
        loop: -1,
        ease: 'Sine.easeInOut'
      });
    };

    startIdleAnimation();

    hitBox.on('pointerover', () => {
      isHovering = true;
      if (idleTween) {
        idleTween.stop();
        idleTween = null;
      }
      if (scaleTween) scaleTween.stop();
      scaleTween = this.tweens.add({
        targets: buttonContainer,
        scaleX: 1.12,
        scaleY: 1.12,
        duration: 250,
        ease: 'Back.easeOut'
      });

      for (let i = 0; i < 5; i++) {
        particles.emitParticleAt(
          x + Phaser.Math.Between(-width / 3, width / 3),
          y + Phaser.Math.Between(-height / 3, height / 3)
        );
      }
    });

    hitBox.on('pointerout', () => {
      isHovering = false;
      if (scaleTween) scaleTween.stop();
      scaleTween = this.tweens.add({
        targets: buttonContainer,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        ease: 'Back.easeOut'
      });

      this.time.delayedCall(300, () => {
        if (!isHovering) {
          startIdleAnimation();
        }
      });
    });

    hitBox.on('pointerdown', () => {
      this.tweens.add({
        targets: buttonContainer,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: 'Sine.easeOut',
        yoyo: true
      });

      for (let i = 0; i < 12; i++) {
        particles.emitParticleAt(
          x + Phaser.Math.Between(-width / 2, width / 2),
          y + Phaser.Math.Between(-height / 2, height / 2)
        );
      }

      if (config.scene) {
        if (!this.scene.get(config.scene) && window.sceneClasses[config.scene]) {
          this.scene.add(config.scene, window.sceneClasses[config.scene], false);
        }
        this.input.enabled = false;
        this.scene.start(config.scene);
      } else if (config.action) {
        config.action();
      }
    });
  }

  createPowerupList(centerX, centerY) {
    const powerupOrder = ['blood_orb', 'fury_totem', 'time_shard', 'iron_aegis'];
    const powerups = powerupOrder.map(type => ({ type, ...POWERUP_WIKI_DATA[type] }));

    const frameWidth = Math.min(940, this.scale.width - 80);
    const frameHeight = Math.min(620, this.scale.height - 180);
    const itemWidth = frameWidth - 30;
    const itemHeight = 120;
    const gap = 16;
    const totalHeight = powerups.length * itemHeight + (powerups.length - 1) * gap;
    const startY = -totalHeight / 2 + itemHeight / 2;

    this.add.rectangle(centerX, centerY, frameWidth, frameHeight, 0x2b0a0a, 0.26)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xff8844, 0.7);

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
