import { cleanupScene } from '../../helpers/sceneCleanupHelpers.js';

/**
 * ComingSoonScene
 * Displays "COMING SOON" with cool fiery animations and shaking text.
 */
export class ComingSoonScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ComingSoonScene', active: false });
  }

  create() {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // Ensure tween/time systems are running
    this.tweens.timeScale = 1;
    this.tweens.resumeAll();
    this.time.timeScale = 1;

    // Shut down other scenes
    const scenesToShutdown = [
      'MenuScene',
      'CharacterSelectionScene',
      'CharacterCustomizationScene',
      'ChaossCrucibleScene',
      'HostScene',
      'EnemyWikiScene',
      'PowerupWikiScene',
      'OptionsScene'
    ];
    scenesToShutdown.forEach(key => {
      const sceneInstance = this.scene.get(key);
      if (sceneInstance) {
        cleanupScene(sceneInstance);
        this.scene.stop(key);
      }
    });

    // Background with dark red/black gradient effect
    const bg = this.add.rectangle(centerX, centerY, width, height, 0x0a0000, 1).setOrigin(0.5);
    bg.setDepth(-1000);

    // Create intense fiery particle effects
    this.createIntenseFlameParticles(width, height);

    // Electric/energy effect around the text
    this.createEnergyEffect(centerX, centerY);

    // Main "COMING SOON" text with shaking animation
    const comingSoonText = this.add.text(centerX, centerY - 80, 'COMING SOON', {
      font: 'bold 120px Impact',
      fill: '#ffff00',
      stroke: '#ff3300',
      strokeThickness: 8,
      shadow: {
        offsetX: 5,
        offsetY: 5,
        color: '#000000',
        blur: 15,
        fill: true
      }
    }).setOrigin(0.5);

    // Intense shaking animation for the main text
    this.tweens.add({
      targets: comingSoonText,
      x: centerX + Phaser.Math.Between(-8, 8),
      y: centerY - 80 + Phaser.Math.Between(-8, 8),
      duration: 50,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
      onUpdate: () => {
        // Random position for intense shake effect
        comingSoonText.x = centerX + Phaser.Math.Between(-6, 6);
        comingSoonText.y = centerY - 80 + Phaser.Math.Between(-6, 6);
      }
    });

    // Scale pulse animation
    this.tweens.add({
      targets: comingSoonText,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    // Subtitle text with rotation animation
    const subtitleText = this.add.text(centerX, centerY + 80, 'THIS FEATURE IS UNDER CONSTRUCTION', {
      font: 'bold 28px Arial',
      fill: '#ffffff',
      stroke: '#ff6600',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Rotating animation for subtitle
    this.tweens.add({
      targets: subtitleText,
      rotation: -0.15,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    // Flame-colored border effect at bottom
    this.add.rectangle(centerX, height - 20, width, 40, 0xff3300, 0.6).setOrigin(0.5);
    this.add.text(centerX, height - 20, '🔥 STAY TUNED 🔥', {
      font: 'bold 24px Arial',
      fill: '#ffff00',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Back button in top-left corner
    this.createBackButton(90, 50);
  }

  createIntenseFlameParticles(width, height) {
    // Create flame particle textures
    const flameGraphics = this.make.graphics({ x: 0, y: 0, add: false });

    // Red flame particle
    flameGraphics.fillStyle(0xff3300, 1);
    flameGraphics.fillCircle(8, 8, 8);
    flameGraphics.generateTexture('flameRedIntense', 16, 16);
    flameGraphics.clear();

    // Orange flame particle
    flameGraphics.fillStyle(0xff7700, 1);
    flameGraphics.fillCircle(8, 8, 8);
    flameGraphics.generateTexture('flameOrangeIntense', 16, 16);
    flameGraphics.clear();

    // Yellow flame particle
    flameGraphics.fillStyle(0xffff00, 1);
    flameGraphics.fillCircle(6, 6, 6);
    flameGraphics.generateTexture('flameYellowIntense', 12, 12);

    flameGraphics.destroy();

    // Bottom center intense flame burst
    const centerFlame = this.add.particles(width / 2, height + 50, 'flameYellowIntense', {
      x: { min: -150, max: 150 },
      y: 0,
      speed: { min: 100, max: 300 },
      angle: { min: 230, max: 310 },
      scale: { start: 2, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 2500,
      frequency: 60,
      blendMode: 'ADD'
    });
    centerFlame.setDepth(-500);

    // Left side explosive flames
    const leftExplosion = this.add.particles(0, height * 0.4, 'flameRedIntense', {
      x: 0,
      y: { min: -100, max: 100 },
      speed: { min: 80, max: 200 },
      angle: { min: 20, max: 80 },
      scale: { start: 1.8, end: 0 },
      alpha: { start: 0.9, end: 0 },
      lifespan: 2000,
      frequency: 70,
      blendMode: 'ADD'
    });
    leftExplosion.setDepth(-500);

    // Right side explosive flames
    const rightExplosion = this.add.particles(width, height * 0.4, 'flameOrangeIntense', {
      x: 0,
      y: { min: -100, max: 100 },
      speed: { min: 80, max: 200 },
      angle: { min: 100, max: 160 },
      scale: { start: 1.8, end: 0 },
      alpha: { start: 0.9, end: 0 },
      lifespan: 2000,
      frequency: 70,
      blendMode: 'ADD'
    });
    rightExplosion.setDepth(-500);

    // Rising flames from center
    const risingFlames = this.add.particles(width / 2, height, 'flameOrangeIntense', {
      x: { min: -200, max: 200 },
      y: 0,
      speed: { min: 150, max: 400 },
      angle: 270,
      angleVariance: 20,
      scale: { start: 1.5, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 3000,
      frequency: 80,
      blendMode: 'ADD'
    });
    risingFlames.setDepth(-500);
  }

  createEnergyEffect(centerX, centerY) {
    // Create a pulsing energy ring effect
    const energyRing = this.add.circle(centerX, centerY, 150, 0xff6600, 0.2);
    energyRing.setStrokeStyle(3, 0xffff00, 0.6);

    this.tweens.add({
      targets: energyRing,
      radius: 250,
      alpha: 0,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    // Inner rotating energy effect
    const innerRing = this.add.circle(centerX, centerY, 100, undefined, 0);
    innerRing.setStrokeStyle(2, 0xffff00, 0.8);
    innerRing.setRotation(0);

    this.tweens.add({
      targets: innerRing,
      rotation: Math.PI * 2,
      duration: 3000,
      repeat: -1,
      ease: 'Linear'
    });
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

  shutdown() {
    cleanupScene(this);
  }
}
