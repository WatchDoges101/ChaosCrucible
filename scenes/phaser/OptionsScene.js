import { gameState } from '../../services/gameState.js';
import { cleanupScene } from '../../helpers/sceneCleanupHelpers.js';

/**
 * OptionsScene
 * Settings and options menu
 */
export class OptionsScene extends Phaser.Scene {
  constructor() {
    console.log('[CONSTRUCTOR] OptionsScene being instantiated');
    super({ key: 'OptionsScene', active: false });
    this.qualityButtons = [];
    this.returnScene = 'MenuScene';
    this.returnSceneData = {};
    this.activeSlider = null;
    this.escBackHandler = null;
    this.qualityValueText = null;
  }

  init(data) {
    this.qualityButtons = [];
    this.returnScene = data?.returnScene || 'MenuScene';
    this.returnSceneData = data?.returnSceneData || {};
    this.escBackHandler = null;

    if (data?.gameSceneKey) {
      this.returnSceneData.gameSceneKey = data.gameSceneKey;
    }
  }

  navigateBack() {
    gameState.saveSettings();
    this.scene.start(this.returnScene, this.returnSceneData);
  }

  /**
   * Create a properly functioning slider with thumb
   */
  createSlider(startX, startY, width, height, currentValue, onChange) {
    const sliderStart = startX;
    const sliderTrack = 14;
    const thumbSize = 24;

    // Background track
    const track = this.add.rectangle(startX + width / 2, startY, width, sliderTrack, 0x2a1a12, 0.95)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xffb066, 0.9);

    // Fill bar
    const clampedInitial = Math.max(0, Math.min(1, currentValue));
    const fillWidth = clampedInitial * width;
    const fill = this.add.rectangle(
      startX,
      startY,
      fillWidth,
      sliderTrack,
      0xff7a1a,
      0.95
    ).setOrigin(0, 0.5);

    // Thumb/handle
    const thumb = this.add.rectangle(
      startX + clampedInitial * width,
      startY,
      thumbSize,
      thumbSize + 8,
      0xffc266,
      1
    ).setOrigin(0.5)
      .setStrokeStyle(2, 0x1a0d05, 0.95)
      .setInteractive({ useHandCursor: true });

    const updateSlider = (value) => {
      const clampedValue = Math.max(0, Math.min(1, value));
      const newX = startX + clampedValue * width;
      const newFillWidth = clampedValue * width;

      fill.width = newFillWidth;
      thumb.setX(newX);

      if (onChange) {
        onChange(clampedValue);
      }
    };

    // Track click for direct position change
    track.setInteractive({ useHandCursor: true });
    track.on('pointerdown', (pointer) => {
      updateSlider((pointer.x - sliderStart) / width);
    });

    // Thumb drag
    this.input.setDraggable(thumb);
    thumb.on('drag', (pointer) => {
      updateSlider((pointer.x - sliderStart) / width);
    });

    thumb.on('pointerover', () => {
      thumb.setFillStyle(0xffd48a, 1);
      this.tweens.add({
        targets: thumb,
        scaleX: 1.08,
        scaleY: 1.08,
        duration: 120,
        ease: 'Sine.out'
      });
    });

    thumb.on('pointerout', () => {
      thumb.setFillStyle(0xffc266, 1);
      this.tweens.add({
        targets: thumb,
        scaleX: 1,
        scaleY: 1,
        duration: 120,
        ease: 'Sine.out'
      });
    });

    return { track, fill, thumb, updateSlider };
  }

  createVolcanicBackdrop(width, height, centerX, centerY) {
    const bg = this.add.rectangle(centerX, centerY, width, height, 0x130707, 1).setOrigin(0.5);
    bg.setDepth(-1000);

    const lowerGlow = this.add.ellipse(centerX, height * 0.9, width * 1.15, height * 0.4, 0x7a1900, 0.28).setDepth(-995);
    const innerGlow = this.add.ellipse(centerX, height * 0.93, width * 0.8, height * 0.23, 0xff5a00, 0.18).setDepth(-994);

    const createTexture = (key, color, size, radius) => {
      if (this.textures.exists(key)) return;
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(color, 1);
      g.fillCircle(size / 2, size / 2, radius);
      g.generateTexture(key, size, size);
      g.destroy();
    };

    createTexture('optionsEmber', 0xffc97a, 8, 3);
    createTexture('optionsFlame', 0xff7a2a, 14, 7);

    const floorFlames = this.add.particles(centerX, height + 12, 'optionsFlame', {
      x: { min: -width * 0.55, max: width * 0.55 },
      speedY: { min: -260, max: -110 },
      speedX: { min: -55, max: 55 },
      scale: { start: 1.15, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: { min: 900, max: 1700 },
      frequency: 18,
      blendMode: 'ADD'
    }).setDepth(-990);

    const embers = this.add.particles(centerX, height + 6, 'optionsEmber', {
      x: { min: -width * 0.55, max: width * 0.55 },
      speedY: { min: -210, max: -60 },
      speedX: { min: -65, max: 65 },
      scale: { start: 0.9, end: 0 },
      alpha: { start: 0.72, end: 0 },
      lifespan: { min: 1200, max: 2200 },
      frequency: 22,
      blendMode: 'ADD'
    }).setDepth(-989);

    this.tweens.add({
      targets: [lowerGlow, innerGlow, floorFlames, embers],
      alpha: { from: 0.7, to: 1 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
  }

  createOptionPanel(centerX, centerY) {
    const panel = this.add.rectangle(centerX, centerY + 35, 920, 430, 0x120b08, 0.86)
      .setStrokeStyle(3, 0xffa766, 0.86);
    const panelGlow = this.add.rectangle(centerX, centerY + 35, 934, 444, 0x3a1408, 0.26);
    panelGlow.setDepth(panel.depth - 1);

    this.tweens.add({
      targets: [panel, panelGlow],
      alpha: { from: 0.7, to: 1 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
  }

  createBackButton(x, y) {
    const text = this.add.text(x, y, 'BACK', {
      font: 'bold 24px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    text.on('pointerover', () => {
      this.tweens.add({
        targets: text,
        scaleX: 1.08,
        scaleY: 1.08,
        duration: 140,
        ease: 'Power2'
      });
    });

    text.on('pointerout', () => {
      this.tweens.add({
        targets: text,
        scaleX: 1,
        scaleY: 1,
        duration: 140,
        ease: 'Power2'
      });
    });

    text.on('pointerdown', () => this.navigateBack());
  }

  updateQualityButtons() {
    this.qualityButtons.forEach((buttonRef) => {
      const isSelected = buttonRef.quality === gameState.settings.graphicsQuality;
      buttonRef.btn.setFillStyle(isSelected ? 0xff7a1a : 0x332018, isSelected ? 0.95 : 0.92);
      buttonRef.btn.setStrokeStyle(2.5, isSelected ? 0xffd49a : 0x8f5a3b, 0.9);
      buttonRef.label.setFill(isSelected ? '#fff2d8' : '#d8c4b0');
    });

    if (this.qualityValueText) {
      this.qualityValueText.setText(gameState.settings.graphicsQuality.toUpperCase());
    }
  }

  create() {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    this.createVolcanicBackdrop(width, height, centerX, centerY);
    this.createOptionPanel(centerX, centerY);

    this.add.text(centerX, 88, 'OPTIONS', {
      font: 'bold 72px Impact',
      fill: '#ffffff',
      stroke: '#4a1300',
      strokeThickness: 10
    }).setOrigin(0.5);

    this.add.text(centerX, 148, 'Tune your crucible experience', {
      font: 'bold 22px Arial',
      fill: '#ffcc99',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.createBackButton(95, 54);

    // Sound Volume Option
    this.add.text(centerX - 360, 235, 'SOUND VOLUME', {
      font: 'bold 24px Arial',
      fill: '#f2ddc8',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0, 0.5);

    this.createSlider(
      centerX - 30,
      235,
      320,
      30,
      gameState.settings.soundVolume,
      (value) => {
        gameState.settings.soundVolume = value;
        gameState.saveSettings();
      }
    );

    // Music Volume Option
    this.add.text(centerX - 360, 320, 'MUSIC VOLUME', {
      font: 'bold 24px Arial',
      fill: '#f2ddc8',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0, 0.5);

    this.createSlider(
      centerX - 30,
      320,
      320,
      30,
      gameState.settings.musicVolume,
      (value) => {
        gameState.settings.musicVolume = value;
        gameState.saveSettings();
      }
    );

    // Graphics Quality Option
    this.add.text(centerX - 360, 405, 'GRAPHICS QUALITY', {
      font: 'bold 24px Arial',
      fill: '#f2ddc8',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0, 0.5);

    this.qualityValueText = this.add.text(centerX + 260, 405, '', {
      font: 'bold 20px Arial',
      fill: '#ffe0b3',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(1, 0.5);

    const qualities = ['Low', 'Medium', 'High'];
    qualities.forEach((quality, idx) => {
      const btnX = centerX - 90 + idx * 130;
      const btn = this.add.rectangle(btnX, 465, 118, 56, 0x332018, 0.92)
        .setOrigin(0.5)
        .setStrokeStyle(2.5, 0x8f5a3b, 0.9)
        .setInteractive({ useHandCursor: true });

      const label = this.add.text(btnX, 465, quality.toUpperCase(), {
        font: 'bold 19px Arial',
        fill: '#d8c4b0',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);

      // Store button reference
      this.qualityButtons.push({ btn, label, quality: quality.toLowerCase() });

      btn.on('pointerover', () => {
        this.tweens.add({
          targets: [btn, label],
          scaleX: 1.06,
          scaleY: 1.06,
          duration: 120,
          ease: 'Sine.out'
        });
      });

      btn.on('pointerout', () => {
        this.tweens.add({
          targets: [btn, label],
          scaleX: 1,
          scaleY: 1,
          duration: 120,
          ease: 'Sine.out'
        });
      });

      btn.on('pointerdown', () => {
        gameState.settings.graphicsQuality = quality.toLowerCase();
        gameState.saveSettings();
        this.updateQualityButtons();
      });
    });

    this.updateQualityButtons();

    this.escBackHandler = () => {
      this.navigateBack();
    };
    this.input.keyboard.on('keydown-ESC', this.escBackHandler);
  }

  shutdown() {
    if (this.escBackHandler) {
      this.input.keyboard.off('keydown-ESC', this.escBackHandler);
      this.escBackHandler = null;
    }

    // Clean up quality buttons
    this.qualityButtons.forEach(buttonRef => {
      try {
        if (buttonRef.btn && buttonRef.btn.destroy) {
          buttonRef.btn.destroy();
        }
        if (buttonRef.label && buttonRef.label.destroy) {
          buttonRef.label.destroy();
        }
      } catch(e) {
        console.error('Error cleaning up quality button:', e);
      }
    });
    this.qualityButtons = [];

    // General cleanup
    cleanupScene(this);
  }
}
