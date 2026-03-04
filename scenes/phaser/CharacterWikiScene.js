import { generateCharacterSprite } from '../../services/spriteGenerator.js';
import { cleanupScene } from '../../helpers/sceneCleanupHelpers.js';

/**
 * CharacterWikiScene
 * Shows playable characters with combat profile and abilities.
 */
export class CharacterWikiScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharacterWikiScene', active: false });
    this.escBackHandler = null;
  }

  create() {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    const bg = this.add.rectangle(centerX, centerY, width, height, 0x120707, 1).setOrigin(0.5);
    bg.setDepth(-1000);

    this.add.text(centerX, 90, 'CHARACTERS', {
      font: 'bold 72px Impact',
      fill: '#ffffff',
      stroke: '#550000',
      strokeThickness: 10
    }).setOrigin(0.5);

    this.add.text(centerX, 150, 'Playable classes, combat role, and abilities', {
      font: 'bold 24px Arial',
      fill: '#ffcc99'
    }).setOrigin(0.5);

    this.createButton(100, 55, 170, 60, {
      label: 'BACK',
      scene: 'WikiScene',
      fontSize: 22
    });
    this.createCharacterList(centerX, centerY + 70);
    this.createBottomWanderers();

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

  createCharacterList(centerX, centerY) {
    const characters = [
      {
        role: 'Male',
        title: 'Warrior',
        profile: 'Close-range bruiser with balanced offense and survivability.',
        basic: 'Basic: Sword Slash',
        ability: 'Ability: Shockwave',
        accent: '#ffb28f'
      },
      {
        role: 'archer',
        title: 'Archer',
        profile: 'Ranged precision fighter focused on sustained safe damage.',
        basic: 'Basic: Arrow Shot',
        ability: 'Ability: Volley Burst',
        accent: '#c3e3ff'
      },
      {
        role: 'brute',
        title: 'Brute',
        profile: 'Heavy-impact frontline with powerful area pressure.',
        basic: 'Basic: Heavy Swing',
        ability: 'Ability: Earth Shockwave',
        accent: '#ffd49c'
      },
      {
        role: 'gunner',
        title: 'Gunner',
        profile: 'High attack-speed ranged class with rapid burst windows.',
        basic: 'Basic: Rapid Shot',
        ability: 'Ability: Burst Fire',
        accent: '#ffe89a'
      }
    ];

    const frameWidth = Math.min(940, this.scale.width - 80);
    const frameHeight = Math.min(620, this.scale.height - 180);
    const itemWidth = frameWidth - 30;
    const itemHeight = 120;
    const gap = 16;
    const totalHeight = characters.length * itemHeight + (characters.length - 1) * gap;
    const startY = -totalHeight / 2 + itemHeight / 2;

    this.add.rectangle(centerX, centerY, frameWidth, frameHeight, 0x2b0a0a, 0.26)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xff8844, 0.7);

    const listContainer = this.add.container(centerX, centerY);

    characters.forEach((entry, index) => {
      const itemY = startY + index * (itemHeight + gap);
      const itemContainer = this.add.container(0, itemY);

      const panel = this.add.rectangle(0, 0, itemWidth, itemHeight, 0x2b0a0a, 0.86)
        .setStrokeStyle(2, 0xff8844, 0.75);

      const spriteContainer = generateCharacterSprite(this, entry.role, 0, 0, null, false, true);
      spriteContainer.setScale(2.1);
      spriteContainer.x = -itemWidth / 2 + 62;
      this.addCharacterAnimation(spriteContainer, index);

      const nameText = this.add.text(-itemWidth / 2 + 150, -44, entry.title, {
        font: 'bold 26px Arial',
        fill: '#ffffff'
      });

      const profileText = this.add.text(-itemWidth / 2 + 150, -12, entry.profile, {
        font: '17px Arial',
        fill: entry.accent,
        wordWrap: { width: itemWidth - 200 }
      });

      const basicText = this.add.text(-itemWidth / 2 + 150, 18, entry.basic, {
        font: '16px Arial',
        fill: '#ffe2b8'
      });

      const abilityText = this.add.text(-itemWidth / 2 + 150, 42, entry.ability, {
        font: '16px Arial',
        fill: '#ffcf9b'
      });

      itemContainer.add([panel, spriteContainer, nameText, profileText, basicText, abilityText]);
      listContainer.add(itemContainer);
    });
  }

  addCharacterAnimation(sprite, index) {
    const baseDelay = index * 170;

    this.tweens.add({
      targets: sprite,
      y: sprite.y - 3,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
      delay: baseDelay
    });

    this.tweens.add({
      targets: sprite,
      angle: 3,
      duration: 1700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
      delay: baseDelay + 100
    });
  }

  createBottomWanderers() {
    const { width, height } = this.scale;
    const laneY = height - 62;
    const leftBound = 16;
    const rightBound = width - 16;

    const characters = [
      { role: 'Male', scale: 2.8 },
      { role: 'archer', scale: 2.8 },
      { role: 'brute', scale: 2.8 },
      { role: 'gunner', scale: 2.8 }
    ];

    const spacing = characters.length > 1
      ? (rightBound - leftBound) / (characters.length - 1)
      : 0;

    characters.forEach((character, index) => {
      const startX = leftBound + spacing * index;
      const targetX = Phaser.Math.Between(leftBound, rightBound);
      const travelDistance = Math.abs(targetX - startX);
      const pixelsPerSecond = 70;
      const moveDuration = Math.max(2600, (travelDistance / pixelsPerSecond) * 1000);
      const mover = this.add.container(startX, laneY);
      mover.setSize(130, 120);
      mover.setDepth(30);

      const wanderer = generateCharacterSprite(this, character.role, 0, 0, null, false, true);
      wanderer.setScale(character.scale);
      wanderer.baseScale = character.scale;
      mover.prevX = startX;
      mover.add(wanderer);
      mover.setInteractive({ useHandCursor: true });

      this.addWandererWalkAnimation(wanderer, index);

      this.tweens.add({
        targets: mover,
        y: laneY - Phaser.Math.Between(4, 10),
        duration: Phaser.Math.Between(900, 1400),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut',
        delay: index * 120
      });

      this.tweens.add({
        targets: mover,
        x: targetX,
        duration: moveDuration,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut',
        delay: index * 140,
        onUpdate: (_tween, target) => {
          const dx = target.x - target.prevX;
          if (Math.abs(dx) > 0.2) {
            const facingScale = Math.abs(wanderer.baseScale || character.scale);
            wanderer.scaleX = dx < 0 ? -facingScale : facingScale;
          }
          target.prevX = target.x;
        }
      });

      mover.on('pointerdown', () => {
        this.tweens.add({
          targets: wanderer,
          y: -22,
          duration: 120,
          yoyo: true,
          ease: 'Quad.out'
        });

        this.tweens.add({
          targets: wanderer,
          scaleY: character.scale * 0.92,
          scaleX: character.scale * 1.06,
          duration: 100,
          yoyo: true,
          ease: 'Sine.inOut'
        });
      });
    });
  }

  addWandererWalkAnimation(wanderer, index) {
    const phaseDelay = index * 90;

    if (wanderer.leftLeg && wanderer.rightLeg) {
      this.tweens.add({
        targets: wanderer.leftLeg,
        angle: -22,
        duration: 320,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut',
        delay: phaseDelay
      });

      this.tweens.add({
        targets: wanderer.rightLeg,
        angle: 22,
        duration: 320,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut',
        delay: phaseDelay + 160
      });
    }

    if (wanderer.leftArm && wanderer.rightArm) {
      this.tweens.add({
        targets: wanderer.leftArm,
        angle: 12,
        duration: 360,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut',
        delay: phaseDelay + 140
      });

      this.tweens.add({
        targets: wanderer.rightArm,
        angle: -12,
        duration: 360,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut',
        delay: phaseDelay
      });
    }
  }

  shutdown() {
    if (this.escBackHandler) {
      this.input.keyboard.off('keydown-ESC', this.escBackHandler);
      this.escBackHandler = null;
    }

    cleanupScene(this);
  }
}
