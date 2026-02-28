import { gameState } from '../../services/gameState.js';
import { generateCharacterSprite } from '../../services/spriteGenerator.js';
import { cleanupScene, stopAllTweens } from '../../helpers/sceneCleanupHelpers.js';

/**
 * CharacterCustomizationScene
 * Allows player to name their character and pick color scheme
 */
export class CharacterCustomizationScene extends Phaser.Scene {
  constructor() {
    console.log('[CONSTRUCTOR] CharacterCustomizationScene being instantiated');
    super({ key: 'CharacterCustomizationScene', active: false });
    this.colorButtons = [];
    this.mainButtons = [];
    this.escBackHandler = null;
  }

  init(data) {
    console.log('[CharacterCustomization] Init called with data:', data);
    this.selectedRole = data.role || 'Male';
    this.colorButtons = [];
    this.mainButtons = [];
    this.escBackHandler = null;
    console.log('[CharacterCustomization] Selected role:', this.selectedRole);
  }

  create() {
    console.log('[CharacterCustomization] Scene created');
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // Background with gradient effect
    const bg = this.add.rectangle(centerX, centerY, width, height, 0x1a1a1a).setOrigin(0.5);
    
    // Animated particle background for chaos effect
    this.createChaosParticles();

    // Title with chaotic styling and animations
    const title = this.add.text(centerX, 60, 'CUSTOMIZE YOUR CHAOS', {
      font: 'bold 56px Arial',
      fill: '#ff0000',
      stroke: '#ffff00',
      strokeThickness: 4,
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: '#000',
        blur: 5,
        fill: true
      }
    }).setOrigin(0.5);
    
    // Chaotic title animations
    this.tweens.add({
      targets: title,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    this.tweens.add({
      targets: title,
      angle: { from: -2, to: 2 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Color cycle animation for title
    this.time.addEvent({
      delay: 100,
      callback: () => {
        const colors = ['#ff0000', '#ff6600', '#ffff00', '#00ff00', '#0000ff', '#ff00ff'];
        const currentColor = colors[Math.floor(Date.now() / 500) % colors.length];
        title.setFill(currentColor);
      },
      loop: true
    });

    // ===== CHARACTER NAME INPUT =====
    const nameLabel = this.add.text(centerX, 145, 'NAME YOUR WARRIOR:', {
      font: 'bold 28px Arial',
      fill: '#ffff00',
      stroke: '#ff0000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    // Pulse animation for label
    this.tweens.add({
      targets: nameLabel,
      alpha: { from: 0.7, to: 1 },
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    // Create input field - larger
    const inputWidth = 450;
    const inputBox = this.add.rectangle(centerX, 200, inputWidth, 55, 0x333333, 1)
      .setOrigin(0.5)
      .setStrokeStyle(3, 0xffffff);

    this.characterNameText = this.add.text(centerX - inputWidth / 2 + 15, 200, '', {
      font: 'bold 24px Arial',
      fill: '#ffffff'
    }).setOrigin(0, 0.5);

    // Input field state
    let isInputFocused = false;
    this.characterName = '';

    inputBox.setInteractive({ useHandCursor: true });
    inputBox.on('pointerdown', () => {
      isInputFocused = true;
      inputBox.setStrokeStyle(3, 0xff00ff);

      this.characterName = '';
      this.characterNameText.setText(this.characterName);
      
      // Shake animation on focus
      this.tweens.add({
        targets: inputBox,
        x: centerX + 5,
        duration: 50,
        yoyo: true,
        repeat: 2
      });
    });

    // Use the scene's keyboard input
    this.input.keyboard.on('keydown', (event) => {
      if (!isInputFocused) return;

      if (event.keyCode === 13) { // Enter
        isInputFocused = false;
        inputBox.setStrokeStyle(3, 0xffffff);
      } else if (event.keyCode === 8) { // Backspace
        this.characterName = this.characterName.slice(0, -1);
      } else if (this.characterName.length < 20 && event.key.length === 1) {
        this.characterName += event.key;
      }

      this.characterNameText.setText(this.characterName);
    });

    // Default name
    this.characterName = this.selectedRole;
    this.characterNameText.setText(this.characterName);

    console.log('[CharacterCustomization] Name input created');

    // ===== CHARACTER PREVIEW =====
    const previewLabel = this.add.text(centerX, 270, 'YOUR CHAMPION:', {
      font: 'bold 32px Arial',
      fill: '#00ffff',
      stroke: '#0000ff',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    // Wiggle animation for preview label
    this.tweens.add({
      targets: previewLabel,
      x: centerX + 3,
      duration: 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    console.log('[CharacterCustomization] Creating preview sprite for role:', this.selectedRole);
    this.previewSprite = generateCharacterSprite(this, this.selectedRole, centerX, 370, this.selectedColorScheme);
    this.previewSprite.setScale(6); // Much larger preview
    console.log('[CharacterCustomization] Preview sprite created');
    
    // Floating animation for preview sprite
    this.tweens.add({
      targets: this.previewSprite,
      y: 360,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Slight rotation for chaos effect
    this.tweens.add({
      targets: this.previewSprite,
      angle: { from: -5, to: 5 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // ===== COLOR SCHEME SELECTOR =====
    const colorLabel = this.add.text(centerX, 500, 'CHAOS COLORS:', {
      font: 'bold 32px Arial',
      fill: '#ff00ff',
      stroke: '#ffff00',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    // Rainbow effect for color label
    this.time.addEvent({
      delay: 150,
      callback: () => {
        const colors = ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#0077ff', '#ff00ff'];
        const index = Math.floor(Date.now() / 150) % colors.length;
        colorLabel.setFill(colors[index]);
      },
      loop: true
    });

    const colorSchemes = [
      { name: 'AZURE', primary: 0x2c3e50, secondary: 0x3498db, accent: 0x95a5a6, skin: 0xf4a460 },
      { name: 'EMERALD', primary: 0x27ae60, secondary: 0x2ecc71, accent: 0x95a5a6, skin: 0xf4a460 },
      { name: 'CRIMSON', primary: 0xc0392b, secondary: 0xe74c3c, accent: 0xf39c12, skin: 0xf4a460 },
      { name: 'VOID', primary: 0x8e44ad, secondary: 0x9b59b6, accent: 0xbdc3c7, skin: 0xf4a460 },
      { name: 'INFERNO', primary: 0xd68910, secondary: 0xe67e22, accent: 0xf39c12, skin: 0xf4a460 },
      { name: 'SHADOW', primary: 0x34495e, secondary: 0x7f8c8d, accent: 0xbdc3c7, skin: 0xf4a460 }
    ];

    const colorButtonWidth = 130;
    const colorButtonHeight = 65;
    const colorGapX = 30;
    const colorGapY = 40;

    // Calculate grid dimensions
    const colorGridWidth = 3 * colorButtonWidth + 2 * colorGapX;
    const colorGridStartX = centerX - colorGridWidth / 2;
    const colorStartY = 560;

    colorSchemes.forEach((scheme, idx) => {
      const row = Math.floor(idx / 3);
      const col = idx % 3;
      const x = colorGridStartX + col * (colorButtonWidth + colorGapX) + colorButtonWidth / 2;
      const y = colorStartY + row * (colorButtonHeight + colorGapY) + colorButtonHeight / 2;

      // Main button background
      const button = this.add.rectangle(x, y, colorButtonWidth, colorButtonHeight, 0x222222, 0.6)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      // Color swatches inside button
      const swatchWidth = colorButtonWidth / 5;
      const swatchHeight = colorButtonHeight - 8;

      // Primary color swatch
      this.add.rectangle(x - swatchWidth, y, swatchWidth - 2, swatchHeight, scheme.primary, 1)
        .setOrigin(0.5);

      // Secondary color swatch
      this.add.rectangle(x - swatchWidth / 2, y, swatchWidth - 2, swatchHeight, scheme.secondary, 1)
        .setOrigin(0.5);

      // Accent color swatch
      this.add.rectangle(x + swatchWidth / 2, y, swatchWidth - 2, swatchHeight, scheme.accent, 1)
        .setOrigin(0.5);

      // Skin color swatch
      this.add.rectangle(x + swatchWidth, y, swatchWidth - 2, swatchHeight, scheme.skin, 1)
        .setOrigin(0.5);

      // Store button reference for cleanup
      this.colorButtons.push({ button, scheme, idx });

      // Label below button with chaotic styling
      const label = this.add.text(x, y + colorButtonHeight / 2 + 20, scheme.name, {
        font: 'bold 15px Arial',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);

      // Hover animations for buttons
      button.on('pointerover', () => {
        this.tweens.add({
          targets: button,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 150,
          ease: 'Back.easeOut'
        });
        this.tweens.add({
          targets: label,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 150
        });
      });

      button.on('pointerout', () => {
        this.tweens.add({
          targets: button,
          scaleX: 1,
          scaleY: 1,
          duration: 150
        });
        this.tweens.add({
          targets: label,
          scaleX: 1,
          scaleY: 1,
          duration: 150
        });
      });

      button.on('pointerdown', () => {
        // Clear all borders
        this.colorButtons.forEach(ref => ref.button.setStrokeStyle());

        // Set new selection with flash effect
        this.selectedColorScheme = scheme;
        button.setStrokeStyle(4, 0xffff00);
        
        // Flash animation on selection
        this.tweens.add({
          targets: button,
          alpha: 0.5,
          duration: 100,
          yoyo: true,
          repeat: 2
        });
        
        this.updatePreview(scheme);
      });

      // Highlight initial selection
      if (idx === 0) {
        button.setStrokeStyle(4, 0xffff00);
      }
    });

    // Store the selected color scheme
    this.selectedColorScheme = colorSchemes[0];

    console.log('[CharacterCustomization] Color schemes created');

    // ===== START GAME BUTTON =====
    const buttonY = height - 90;
    const backButtonX = 110;
    const backButtonY = 50;

    const backButton = this.add.zone(backButtonX, backButtonY, 170, 64)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(5000);

    const backText = this.add.text(backButtonX, backButtonY, 'BACK', {
      font: 'bold 28px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(5001);

    // Store button references
    this.mainButtons.push({ button: backButton, text: backText });

    backButton.on('pointerover', () => {
      this.tweens.add({
        targets: backText,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 200,
        ease: 'Back.easeOut'
      });
    });

    backButton.on('pointerout', () => {
      this.tweens.add({
        targets: backText,
        scaleX: 1,
        scaleY: 1,
        duration: 200
      });
    });

    const goBackToSelection = () => {
      console.log('[CharacterCustomization] Back clicked');
      this.cameras.main.flash(200, 255, 0, 0);
      this.time.delayedCall(200, () => {
        if (!this.scene.get('CharacterSelectionScene') && window.sceneClasses['CharacterSelectionScene']) {
          this.scene.add('CharacterSelectionScene', window.sceneClasses['CharacterSelectionScene'], false);
        }
        this.scene.start('CharacterSelectionScene');
      });
    };

    backButton.on('pointerdown', goBackToSelection);

    this.escBackHandler = () => {
      goBackToSelection();
    };
    this.input.keyboard.on('keydown-ESC', this.escBackHandler);

    const startButton = this.add.zone(centerX + 160, buttonY, 200, 70)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const startText = this.add.text(centerX + 160, buttonY, 'UNLEASH CHAOS!', {
      font: 'bold 28px Arial',
      fill: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    // Store button reference
    this.mainButtons.push({ button: startButton, text: startText });
    
    // Pulsing glow effect on start button
    this.tweens.add({
      targets: startText,
      alpha: { from: 0.9, to: 1 },
      scaleX: { from: 1, to: 1.05 },
      scaleY: { from: 1, to: 1.05 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    startButton.on('pointerover', () => {
      this.tweens.add({
        targets: startText,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 200,
        ease: 'Back.easeOut'
      });
      startText.setFill('#ffffff');
    });

    startButton.on('pointerout', () => {
      this.tweens.add({
        targets: startText,
        scaleX: 1,
        scaleY: 1,
        duration: 200
      });
      startText.setFill('#ffff00');
    });

    startButton.on('pointerdown', () => {
      console.log('[CharacterCustomization] Start Game clicked');
      console.log('[CharacterCustomization] Character name:', this.characterName);
      console.log('[CharacterCustomization] Role:', this.selectedRole);
      console.log('[CharacterCustomization] Color scheme:', this.selectedColorScheme);
      
      // Epic screen shake and flash
      this.cameras.main.shake(500, 0.01);
      this.cameras.main.flash(500, 255, 255, 0);
      
      // Save character customization
      gameState.initCharacter(this.selectedRole, this.characterName, this.selectedColorScheme);
      console.log('[CharacterCustomization] Starting ChaossCrucibleScene...');
      
      this.time.delayedCall(500, () => {
        // Add and start ChaossCrucibleScene on-demand
        if (!this.scene.get('ChaossCrucibleScene')) {
          this.scene.add('ChaossCrucibleScene', window.sceneClasses['ChaossCrucibleScene'], false);
        }
        this.input.enabled = false;
        this.scene.start('ChaossCrucibleScene');
      });
    });

    console.log('[CharacterCustomization] Scene fully created!');
  }

  createChaosParticles() {
    // Create floating particles for chaotic background effect
    // Fallback: if 'pixel' texture doesn't exist, create simple graphics
    if (!this.textures.exists('pixel')) {
      const graphics = this.add.graphics();
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(2, 2, 2);
      graphics.generateTexture('pixel', 4, 4);
      graphics.destroy();
    }
    
    const particles = this.add.particles(0, 0, 'pixel', {
      x: { min: 0, max: this.scale.width },
      y: { min: 0, max: this.scale.height },
      lifespan: 3000,
      speed: { min: 20, max: 50 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.3, end: 0 },
      tint: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff],
      frequency: 100,
      blendMode: 'ADD'
    });
  }

  updatePreview(colorScheme) {
    this.selectedColorScheme = colorScheme;
    
    // Destroy old sprite with fade out
    this.tweens.add({
      targets: this.previewSprite,
      alpha: 0,
      scaleX: 0,
      scaleY: 0,
      duration: 200,
      onComplete: () => {
        this.previewSprite.destroy();
        
        // Create new sprite with fade in
        this.previewSprite = generateCharacterSprite(this, this.selectedRole, this.scale.width / 2, 370, colorScheme);
        this.previewSprite.setScale(0).setAlpha(0);
        
        this.tweens.add({
          targets: this.previewSprite,
          scaleX: 6,
          scaleY: 6,
          alpha: 1,
          duration: 300,
          ease: 'Back.easeOut'
        });
        
        // Re-add floating animation
        this.tweens.add({
          targets: this.previewSprite,
          y: 360,
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        
        // Re-add rotation animation
        this.tweens.add({
          targets: this.previewSprite,
          angle: { from: -5, to: 5 },
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    });
  }

  shutdown() {
    if (this.escBackHandler) {
      this.input.keyboard.off('keydown-ESC', this.escBackHandler);
      this.escBackHandler = null;
    }

    // Clean up color buttons
    this.colorButtons.forEach(buttonRef => {
      try {
        if (buttonRef.button && buttonRef.button.destroy) {
          buttonRef.button.destroy();
        }
      } catch(e) {
        console.error('Error cleaning up color button:', e);
      }
    });
    this.colorButtons = [];

    // Clean up main buttons (back and start)
    this.mainButtons.forEach(buttonRef => {
      try {
        if (buttonRef.button && buttonRef.button.destroy) {
          buttonRef.button.destroy();
        }
        if (buttonRef.text && buttonRef.text.destroy) {
          buttonRef.text.destroy();
        }
      } catch(e) {
        console.error('Error cleaning up main button:', e);
      }
    });
    this.mainButtons = [];

    // Clean up preview sprite
    if (this.previewSprite && this.previewSprite.destroy) {
      this.previewSprite.destroy();
    }

    // General cleanup
    cleanupScene(this);
  }
}

