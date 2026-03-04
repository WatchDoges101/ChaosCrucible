import { gameState } from '../../services/gameState.js';
import { stopAllTweens, stopAllTimers, removeAllInputListeners, cleanupScene } from '../../helpers/sceneCleanupHelpers.js';

/**
 * StartScreenScene
 * A cool splash/start screen using the chaosart asset that transitions to the menu.
 * Features:
 *  - Displays the chaosart.png with fade-in effect
 *  - Adds atmospheric burning/flame effects
 *  - Title text with animation
 *  - 5-second loading bar with ember effects
 *  - Automatic transition after 5 seconds
 */
export class StartScreenScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScreenScene', active: true });
  }

  preload() {
    // Load the chaosart image
    this.load.image('chaosart', './asset/chaosart.png');
  }

  create() {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // Dark background
    const bg = this.add.rectangle(centerX, centerY, width, height, 0x0a0000, 1).setOrigin(0.5);
    bg.setDepth(-1000);

    // Load and display the chaosart image (initially invisible for fade-in)
    const chaosArt = this.add.image(centerX, centerY, 'chaosart').setOrigin(0.5).setAlpha(0);
    chaosArt.setDepth(10);

    // Fill the entire screen while maintaining aspect ratio (cover style - no stretching)
    const scaleX = width / chaosArt.width;
    const scaleY = height / chaosArt.height;
    const scale = Math.max(scaleX, scaleY); // Use max to cover entire screen
    chaosArt.setScale(scale);

    // Fade in the image smoothly
    this.tweens.add({
      targets: chaosArt,
      alpha: 1,
      duration: 1000,
      ease: 'Power2.easeInOut'
    });

    // Create burning particle effects around the edges
    this.createBurningAura(width, height);

    // Create loading bar at the bottom
    this.createLoadingBar(width, height);

    // Add ember effects around the sides
    this.createEmbersAroundSides(width, height);

    // Title removed - only showing loading bar and embers

    // Add instruction text that fades in later
    const instructionText = this.add.text(centerX, height * 0.9, 'Click anywhere or press ENTER to continue', {
      font: 'bold 18px Arial',
      fill: '#ffccaa',
      align: 'center'
    }).setOrigin(0.5).setAlpha(0);
    instructionText.setDepth(300);

    this.tweens.add({
      targets: instructionText,
      alpha: 1,
      duration: 600,
      delay: 2500,
      ease: 'Power2.easeOut'
    });

    // Make instruction text pulse
    this.tweens.add({
      targets: instructionText,
      alpha: 0.5,
      duration: 1000,
      delay: 3100,
      yoyo: true,
      loop: -1,
      ease: 'Sine.easeInOut'
    });

    // Auto-transition after 5 seconds OR on click/key
    const transitionTimer = this.time.delayedCall(5000, () => {
      this.startTransition();
    });

    // Allow user to skip by clicking
    this.input.on('pointerdown', () => {
      // Cancel auto-transition and go immediately
      transitionTimer.remove();
      this.startTransition();
    });

    // Allow user to skip with Enter key
    this.input.keyboard.on('keydown-ENTER', () => {
      transitionTimer.remove();
      this.startTransition();
    });

    // Allow user to skip with Space key
    this.input.keyboard.on('keydown-SPACE', () => {
      transitionTimer.remove();
      this.startTransition();
    });

    // Add subtle vignette effect on top
    const vignette = this.add.rectangle(centerX, centerY, width, height, 0x000000, 0.2).setOrigin(0.5);
    vignette.setDepth(1000);
  }

  startTransition() {
    // Fade out to black and transition
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      // Start MenuScene and stop this scene
      if (!this.scene.get('MenuScene') && window.sceneClasses['MenuScene']) {
        this.scene.add('MenuScene', window.sceneClasses['MenuScene'], true);
      } else {
        this.scene.start('MenuScene');
      }
      this.scene.stop();
    });
  }

  createLoadingBar(width, height) {
    const barWidth = 600;
    const barHeight = 40;
    const barX = width / 2;
    const barY = height - 80;

    // Background bar
    const bgBar = this.add.rectangle(barX, barY, barWidth, barHeight, 0x333333, 0.8);
    bgBar.setOrigin(0.5).setDepth(500);

    // Border
    const border = this.add.rectangle(barX, barY, barWidth, barHeight, 0xffffff, 0);
    border.setOrigin(0.5).setDepth(501);
    border.setStrokeStyle(3, 0xffffff);

    // Progress bar fill (starts at 0)
    const fillBar = this.add.rectangle(barX - barWidth / 2, barY, 0, barHeight, 0xffffff, 0.9);
    fillBar.setOrigin(0, 0.5).setDepth(500);

    // Loading text
    const loadingText = this.add.text(barX, barY - 50, 'LOADING...', {
      font: 'bold 20px Arial',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5).setDepth(502);

    // Animate the bar filling over 5 seconds
    this.tweens.add({
      targets: fillBar,
      width: barWidth,
      duration: 5000,
      ease: 'Linear'
    });
  }

  createEmbersAroundSides(width, height) {
    // Top embers falling down
    const topParticles = this.add.particles(0xff8800, {
      speed: { min: 100, max: 200 },
      speedY: { min: 100, max: 200 },
      angle: { min: 240, max: 300 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.9, end: 0 },
      lifespan: 2500
    });
    topParticles.setDepth(15);
    topParticles.emitZone = {
      type: 'random',
      source: new Phaser.Geom.Line(0, -20, width, -20)
    };

    // Bottom embers rising up
    const bottomParticles = this.add.particles(0xff8800, {
      speed: { min: 100, max: 200 },
      speedY: { min: -200, max: -100 },
      angle: { min: 60, max: 120 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.9, end: 0 },
      lifespan: 2500
    });
    bottomParticles.setDepth(15);
    bottomParticles.emitZone = {
      type: 'random',
      source: new Phaser.Geom.Line(0, height + 20, width, height + 20)
    };

    // Left embers flowing right
    const leftParticles = this.add.particles(0xff8800, {
      speed: { min: 100, max: 200 },
      speedX: { min: 100, max: 200 },
      angle: { min: 330, max: 30 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.9, end: 0 },
      lifespan: 2500
    });
    leftParticles.setDepth(15);
    leftParticles.emitZone = {
      type: 'random',
      source: new Phaser.Geom.Line(-20, 0, -20, height)
    };

    // Right embers flowing left
    const rightParticles = this.add.particles(0xff8800, {
      speed: { min: 100, max: 200 },
      speedX: { min: -200, max: -100 },
      angle: { min: 150, max: 210 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.9, end: 0 },
      lifespan: 2500
    });
    rightParticles.setDepth(15);
    rightParticles.emitZone = {
      type: 'random',
      source: new Phaser.Geom.Line(width + 20, 0, width + 20, height)
    };

    // Emit particles continuously from each side
    this.time.addEvent({
      delay: 50,
      callback: () => {
        topParticles.emitParticleAt(Phaser.Math.Between(0, width), -20);
        bottomParticles.emitParticleAt(Phaser.Math.Between(0, width), height + 20);
        leftParticles.emitParticleAt(-20, Phaser.Math.Between(0, height));
        rightParticles.emitParticleAt(width + 20, Phaser.Math.Between(0, height));
      },
      loop: true
    });
  }

  createBurningAura(width, height) {
    // Create particle emitter for burning effect using modern Phaser API
    const particles = this.add.particles(0xdd6600, {
      speed: { min: -150, max: -50 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 1500
    });
    particles.setDepth(20);

    // Emit from left side periodically
    this.time.addEvent({
      delay: 100,
      callback: () => {
        particles.emitParticleAt(
          Phaser.Math.Between(0, width * 0.1),
          Phaser.Math.Between(height * 0.2, height * 0.8),
          1
        );
      },
      loop: true
    });

    // Emit from right side periodically
    const particlesRight = this.add.particles(0xdd6600, {
      speed: { min: -150, max: -50 },
      speedX: { min: -100, max: -30 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 1500
    });
    particlesRight.setDepth(20);

    this.time.addEvent({
      delay: 100,
      callback: () => {
        particlesRight.emitParticleAt(
          Phaser.Math.Between(width * 0.9, width),
          Phaser.Math.Between(height * 0.2, height * 0.8),
          1
        );
      },
      loop: true
    });
  }

  shutdown() {
    cleanupScene(this);
  }

  sleep() {
    removeAllInputListeners(this);
  }
}
