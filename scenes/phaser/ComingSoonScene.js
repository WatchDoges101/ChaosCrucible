import { cleanupScene } from '../../helpers/sceneCleanupHelpers.js';

/**
 * ComingSoonScene
 * Displays "COMING SOON" with cool fiery animations and shaking text.
 */
export class ComingSoonScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ComingSoonScene', active: false });
    this.escBackHandler = null;
    this.fireBurstEvent = null;
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
      'WikiScene',
      'CharacterWikiScene',
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

    // Background with dark inferno layering
    const bg = this.add.rectangle(centerX, centerY, width, height, 0x0a0000, 1).setOrigin(0.5);
    bg.setDepth(-1000);

    const heatLayer1 = this.add.ellipse(centerX, height * 0.82, width * 1.2, height * 0.5, 0x7a1b00, 0.22);
    heatLayer1.setDepth(-930);
    const heatLayer2 = this.add.ellipse(centerX, height * 0.78, width * 0.95, height * 0.38, 0xff5500, 0.14);
    heatLayer2.setDepth(-925);
    const smokeBand = this.add.rectangle(centerX, height * 0.3, width, height * 0.34, 0x000000, 0.15).setDepth(-920);

    this.tweens.add({
      targets: [heatLayer1, heatLayer2],
      alpha: { from: 0.12, to: 0.3 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    this.tweens.add({
      targets: smokeBand,
      alpha: { from: 0.08, to: 0.2 },
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    // Create intense fiery particle effects
    this.createIntenseFlameParticles(width, height);

    // Electric/energy effect around the text
    this.createEnergyEffect(centerX, centerY);

    const titleGlow = this.add.text(centerX, centerY - 80, 'COMING SOON', {
      font: 'bold 128px Impact',
      fill: '#ff8800',
      stroke: '#220000',
      strokeThickness: 12
    }).setOrigin(0.5).setAlpha(0.35).setDepth(18);

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
    }).setOrigin(0.5).setDepth(20);

    // Intense shaking animation for the main text
    this.tweens.add({
      targets: [comingSoonText, titleGlow],
      x: centerX + Phaser.Math.Between(-7, 7),
      y: centerY - 80 + Phaser.Math.Between(-6, 6),
      duration: 50,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
      onUpdate: () => {
        const nx = centerX + Phaser.Math.Between(-6, 6);
        const ny = centerY - 80 + Phaser.Math.Between(-5, 5);
        comingSoonText.x = nx;
        comingSoonText.y = ny;
        titleGlow.x = nx;
        titleGlow.y = ny;
      }
    });

    // Scale pulse animation
    this.tweens.add({
      targets: [comingSoonText, titleGlow],
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    this.time.addEvent({
      delay: 120,
      loop: true,
      callback: () => {
        const tint = Phaser.Utils.Array.GetRandom([0xffff00, 0xffee66, 0xffc24b, 0xfff4b3]);
        comingSoonText.setTint(tint);
      }
    });

    // Subtitle text with rotation animation
    const subtitleText = this.add.text(centerX, centerY + 80, 'THIS FEATURE IS UNDER CONSTRUCTION', {
      font: 'bold 28px Arial',
      fill: '#ffffff',
      stroke: '#ff6600',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(20);

    const subline = this.add.text(centerX, centerY + 126, 'ONLINE MATCHMAKING IS BEING FORGED IN FIRE', {
      font: 'bold 20px Arial',
      fill: '#ffd9aa',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(20);

    // Rotating animation for subtitle
    this.tweens.add({
      targets: subtitleText,
      rotation: -0.15,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    this.tweens.add({
      targets: subline,
      alpha: { from: 0.75, to: 1 },
      y: centerY + 130,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    // Flame-colored border effect at bottom
    const footer = this.add.rectangle(centerX, height - 20, width, 40, 0xff3300, 0.6).setOrigin(0.5).setDepth(20);
    const stayTuned = this.add.text(centerX, height - 20, '🔥 STAY TUNED 🔥', {
      font: 'bold 24px Arial',
      fill: '#ffff00',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(21);

    this.tweens.add({
      targets: [footer, stayTuned],
      alpha: { from: 0.65, to: 1 },
      duration: 420,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    this.fireBurstEvent = this.time.addEvent({
      delay: 420,
      loop: true,
      callback: () => {
        this.spawnFireBurst(
          Phaser.Math.Between(60, width - 60),
          Phaser.Math.Between(Math.floor(height * 0.64), height - 70)
        );
      }
    });

    // Back button in top-left corner
    this.createBackButton(90, 50);

    this.escBackHandler = () => {
      this.scene.start('MenuScene');
    };
    this.input.keyboard.on('keydown-ESC', this.escBackHandler);
  }

  createIntenseFlameParticles(width, height) {
    this.ensureFireTextures();

    const tinyEmbers = this.add.particles(width / 2, height + 20, 'flameYellowIntense', {
      x: { min: -width * 0.55, max: width * 0.55 },
      y: 0,
      speedY: { min: -320, max: -140 },
      speedX: { min: -60, max: 60 },
      scale: { start: 0.35, end: 0 },
      alpha: { start: 0.75, end: 0 },
      lifespan: { min: 1200, max: 2600 },
      frequency: 20,
      blendMode: 'ADD'
    });
    tinyEmbers.setDepth(-515);

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

    const leftColumn = this.add.particles(width * 0.15, height + 30, 'flameRedIntense', {
      x: { min: -40, max: 40 },
      y: 0,
      speedY: { min: -260, max: -130 },
      speedX: { min: -35, max: 35 },
      scale: { start: 1.25, end: 0 },
      alpha: { start: 0.85, end: 0 },
      lifespan: { min: 1000, max: 1800 },
      frequency: 45,
      blendMode: 'ADD'
    });
    leftColumn.setDepth(-502);

    const rightColumn = this.add.particles(width * 0.85, height + 30, 'flameOrangeIntense', {
      x: { min: -40, max: 40 },
      y: 0,
      speedY: { min: -260, max: -130 },
      speedX: { min: -35, max: 35 },
      scale: { start: 1.25, end: 0 },
      alpha: { start: 0.85, end: 0 },
      lifespan: { min: 1000, max: 1800 },
      frequency: 45,
      blendMode: 'ADD'
    });
    rightColumn.setDepth(-502);

    this.tweens.add({
      targets: [centerFlame, leftExplosion, rightExplosion, risingFlames, leftColumn, rightColumn],
      alpha: { from: 0.9, to: 1 },
      duration: 250,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
  }

  ensureFireTextures() {
    const defs = [
      { key: 'flameRedIntense', color: 0xff3300, size: 16, radius: 8 },
      { key: 'flameOrangeIntense', color: 0xff7700, size: 16, radius: 8 },
      { key: 'flameYellowIntense', color: 0xffff00, size: 12, radius: 6 }
    ];

    defs.forEach(def => {
      if (this.textures.exists(def.key)) {
        return;
      }
      const flameGraphics = this.make.graphics({ x: 0, y: 0, add: false });
      flameGraphics.fillStyle(def.color, 1);
      flameGraphics.fillCircle(def.size / 2, def.size / 2, def.radius);
      flameGraphics.generateTexture(def.key, def.size, def.size);
      flameGraphics.destroy();
    });
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

    const outerRing = this.add.circle(centerX, centerY, 185, undefined, 0).setDepth(10);
    outerRing.setStrokeStyle(2, 0xff8833, 0.32);
    this.tweens.add({
      targets: outerRing,
      rotation: -Math.PI * 2,
      duration: 5500,
      repeat: -1,
      ease: 'Linear'
    });

    this.tweens.add({
      targets: [energyRing, innerRing, outerRing],
      alpha: { from: 0.25, to: 0.7 },
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
  }

  spawnFireBurst(x, y) {
    const burst = this.add.circle(x, y, Phaser.Math.Between(10, 18), 0xff6600, 0.35).setDepth(14);
    this.tweens.add({
      targets: burst,
      scale: Phaser.Math.FloatBetween(1.8, 2.6),
      alpha: 0,
      duration: Phaser.Math.Between(260, 420),
      ease: 'Quad.easeOut',
      onComplete: () => burst.destroy()
    });

    for (let i = 0; i < 7; i++) {
      const spark = this.add.circle(x, y, Phaser.Math.Between(2, 5), Phaser.Utils.Array.GetRandom([0xff3300, 0xff7700, 0xffcc33]), 0.95).setDepth(15);
      const angle = Phaser.Math.FloatBetween(-Math.PI * 0.95, -Math.PI * 0.05);
      const speed = Phaser.Math.Between(35, 130);
      this.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        scale: Phaser.Math.FloatBetween(0.25, 0.65),
        alpha: 0,
        duration: Phaser.Math.Between(260, 560),
        ease: 'Quad.easeOut',
        onComplete: () => spark.destroy()
      });
    }

    if (Math.random() < 0.17) {
      this.cameras.main.shake(55, 0.0028);
    }
  }

  createBackButton(x, y) {
    const text = this.add.text(x, y, 'Back', {
      font: 'bold 20px Arial',
      fill: '#ffffff'
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
      this.scene.start('MenuScene');
    });
  }

  shutdown() {
    if (this.fireBurstEvent) {
      this.fireBurstEvent.remove(false);
      this.fireBurstEvent = null;
    }

    if (this.escBackHandler) {
      this.input.keyboard.off('keydown-ESC', this.escBackHandler);
      this.escBackHandler = null;
    }

    cleanupScene(this);
  }
}
