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

  /**
   * Create a properly functioning slider with thumb
   */
  createSlider(startX, startY, width, height, currentValue, onChange) {
    const sliderStart = startX;
    const sliderEnd = startX + width;
    const sliderTrack = 12;
    const thumbSize = 20;

    // Background track
    const track = this.add.rectangle(startX + width / 2, startY, width, sliderTrack, 0x444444, 1)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xffffff);

    // Fill bar
    const fillWidth = Math.max(0, Math.min(1, currentValue)) * width;
    const fill = this.add.rectangle(
      startX,
      startY,
      fillWidth,
      sliderTrack,
      0xff6b00,
      1
    ).setOrigin(0, 0.5);

    // Thumb/handle
    const thumb = this.add.rectangle(
      startX + Math.max(0, Math.min(1, currentValue)) * width,
      startY,
      thumbSize,
      thumbSize + 8,
      0xffaa44,
      1
    ).setOrigin(0.5)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });

    const updateSlader = (value) => {
      const clampedValue = Math.max(0, Math.min(1, value));
      const newX = startX + clampedValue * width;
      const newFillWidth = clampedValue * width;

      // Scale the fill bar based on the percentage
      if (fillWidth > 0) {
        fill.scaleX = newFillWidth / fillWidth;
      }
      thumb.setX(newX);

      if (onChange) {
        onChange(clampedValue);
      }
    };

    // Track click for direct position change
    track.setInteractive({ useHandCursor: true });
    track.on('pointerdown', (pointer) => {
      updateSlader((pointer.x - sliderStart) / width);
    });

    // Thumb drag
    this.input.setDraggable(thumb);
    thumb.on('drag', (pointer) => {
      updateSlader((pointer.x - sliderStart) / width);
    });

    return { track, fill, thumb, updateSlader };
  }

  create() {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // Background
    this.add.rectangle(centerX, centerY, width, height, 0x0a0a0a, 1).setOrigin(0.5);

    // Title
    const titleText = this.add.text(centerX, 80, 'OPTIONS', {
      font: '56px Impact',
      fill: '#ffffff',
      stroke: '#550000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Sound Volume Option
    this.add.text(centerX - 400, 200, 'Sound Volume:', {
      font: 'bold 24px Arial',
      fill: '#ffffff'
    }).setOrigin(0, 0.5);

    this.createSlider(
      centerX - 100,
      200,
      250,
      30,
      gameState.settings.soundVolume,
      (value) => {
        gameState.settings.soundVolume = value;
      }
    );

    // Music Volume Option
    this.add.text(centerX - 400, 280, 'Music Volume:', {
      font: 'bold 24px Arial',
      fill: '#ffffff'
    }).setOrigin(0, 0.5);

    this.createSlider(
      centerX - 100,
      280,
      250,
      30,
      gameState.settings.musicVolume,
      (value) => {
        gameState.settings.musicVolume = value;
      }
    );

    // Graphics Quality Option
    this.add.text(centerX - 400, 360, 'Graphics Quality:', {
      font: 'bold 24px Arial',
      fill: '#ffffff'
    }).setOrigin(0, 0.5);

    const qualities = ['Low', 'Medium', 'High'];
    qualities.forEach((quality, idx) => {
      const isSelected = gameState.settings.graphicsQuality === quality.toLowerCase();
      const btn = this.add.rectangle(centerX - 50 + idx * 110, 360, 100, 40, isSelected ? 0xff6b00 : 0x444444, 1)
        .setOrigin(0.5)
        .setStrokeStyle(2, 0xffffff)
        .setInteractive({ useHandCursor: true });

      const label = this.add.text(centerX - 50 + idx * 110, 360, quality, {
        font: 'bold 18px Arial',
        fill: '#ffffff'
      }).setOrigin(0.5);

      // Store button reference
      this.qualityButtons.push({ btn, label, quality: quality.toLowerCase() });

      btn.on('pointerdown', () => {
        gameState.settings.graphicsQuality = quality.toLowerCase();
        // Update all buttons properly
        this.qualityButtons.forEach((buttonRef) => {
          if (buttonRef.quality === gameState.settings.graphicsQuality) {
            buttonRef.btn.setFillStyle(0xff6b00);
          } else {
            buttonRef.btn.setFillStyle(0x444444);
          }
        });
      });
    });

    // Back Button
    const backButton = this.add.rectangle(centerX, 500, 200, 60, 0xff0000, 0.8)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const backText = this.add.text(centerX, 500, 'Back to Menu', {
      font: '20px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

    backButton.on('pointerover', () => {
      this.tweens.add({
        targets: backButton,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200
      });
    });

    backButton.on('pointerout', () => {
      this.tweens.add({
        targets: backButton,
        scaleX: 1,
        scaleY: 1,
        duration: 200
      });
    });

    backButton.on('pointerdown', () => {
      this.scene.start(this.returnScene, this.returnSceneData);
    });

    this.escBackHandler = () => {
      this.scene.start(this.returnScene, this.returnSceneData);
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
