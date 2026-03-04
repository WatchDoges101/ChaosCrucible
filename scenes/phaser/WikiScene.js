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

    this.add.text(centerX, 150, 'Explore characters, enemies, and powerups', {
      font: 'bold 24px Arial',
      fill: '#ffcc99'
    }).setOrigin(0.5);

    this.createButton(100, 55, 170, 60, {
      label: 'BACK',
      scene: 'MenuScene',
      fontSize: 22
    });

    const cards = [
      { label: 'CHARACTERS', scene: 'CharacterWikiScene', y: 245 },
      { label: 'ENEMIES', scene: 'EnemyWikiScene', y: 385 },
      { label: 'POWERUPS', scene: 'PowerupWikiScene', y: 525 }
    ];

    cards.forEach(card => {
      this.createButton(centerX, card.y, 560, 120, card);
    });

    this.escBackHandler = () => {
      this.scene.start('MenuScene');
    };
    this.input.keyboard.on('keydown-ESC', this.escBackHandler);
  }

  createButton(x, y, width, height, config) {
    const BUTTON_COLOR = 0xDD6600;
    const GLOW_COLOR = 0xFFAA55;
    const CORNER_RADIUS = 20;
    const fontSize = config.fontSize || 24;

    // Create a container to hold all button visual elements
    const buttonContainer = this.add.container(x, y);
    buttonContainer.setDepth(1000);

    // Create main button with rounded corners in container
    const buttonGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    buttonGraphics.fillStyle(BUTTON_COLOR, 0.85);
    buttonGraphics.fillRoundedRect(-width / 2, -height / 2, width, height, CORNER_RADIUS);
    buttonContainer.add(buttonGraphics);

    // Add border/outline effect
    const borderGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    borderGraphics.lineStyle(3, 0xFFFFFF);
    borderGraphics.strokeRoundedRect(-width / 2, -height / 2, width, height, CORNER_RADIUS);
    buttonContainer.add(borderGraphics);

    // Add inner highlight for 3D effect
    const highlightGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    highlightGraphics.fillStyle(0xFFFFFF, 0.15);
    highlightGraphics.fillRoundedRect(-width / 2, -height / 2 + 5, width, height * 0.18, CORNER_RADIUS / 2);
    buttonContainer.add(highlightGraphics);

    // Create button text in container
    const text = this.add.text(0, 0, config.label.toUpperCase(), {
      font: `bold ${fontSize}px Arial`,
      fill: '#ffffff',
      align: 'center',
      wordWrap: { width: width - 20 }
    }).setOrigin(0.5);
    buttonContainer.add(text);

    // Create invisible hitbox for interaction
    const hitBox = this.add.rectangle(x, y, width, height)
      .setOrigin(0.5)
      .setFillStyle(0x000000, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(1001);

    // Particle emitter for hover effect
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

    // Idle animation - subtle pulse
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

      // Stop idle animation
      if (idleTween) {
        idleTween.stop();
        idleTween = null;
      }

      // Stop previous tweens
      if (scaleTween) scaleTween.stop();

      // Button scale - only scale the visual container
      scaleTween = this.tweens.add({
        targets: buttonContainer,
        scaleX: 1.12,
        scaleY: 1.12,
        duration: 250,
        ease: 'Back.easeOut'
      });

      // Emit particles on hover
      for (let i = 0; i < 5; i++) {
        particles.emitParticleAt(
          x + Phaser.Math.Between(-width / 3, width / 3),
          y + Phaser.Math.Between(-height / 3, height / 3)
        );
      }
    });

    hitBox.on('pointerout', () => {
      isHovering = false;

      // Stop previous tweens
      if (scaleTween) scaleTween.stop();

      // Reset scale - only reset the visual container
      scaleTween = this.tweens.add({
        targets: buttonContainer,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        ease: 'Back.easeOut'
      });

      // Resume idle animation after reset completes
      this.time.delayedCall(300, () => {
        if (!isHovering) {
          startIdleAnimation();
        }
      });
    });

    hitBox.on('pointerdown', () => {
      // Click feedback - only scale the visual container
      this.tweens.add({
        targets: buttonContainer,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: 'Sine.easeOut',
        yoyo: true
      });

      // Emit burst of particles on click
      for (let i = 0; i < 12; i++) {
        particles.emitParticleAt(
          x + Phaser.Math.Between(-width / 2, width / 2),
          y + Phaser.Math.Between(-height / 2, height / 2)
        );
      }

      if (config.scene) {
        // Ensure target scene exists, then start it so current scene stops cleanly
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

  shutdown() {
    if (this.escBackHandler) {
      this.input.keyboard.off('keydown-ESC', this.escBackHandler);
      this.escBackHandler = null;
    }

    cleanupScene(this);
  }
}
