import { gameState } from '../../services/gameState.js';
import { generateCharacterSprite } from '../../services/spriteGenerator.js';

/**
 * CharacterCustomizationScene
 * Allows player to name their character and pick color scheme
 */
export class CharacterCustomizationScene extends Phaser.Scene {
  constructor() {
    console.log('[CONSTRUCTOR] CharacterCustomizationScene being instantiated');
    super({ key: 'CharacterCustomizationScene', active: false });
  }

  init(data) {
    console.log('[CharacterCustomization] Init called with data:', data);
    this.selectedRole = data.role || 'Male';
    console.log('[CharacterCustomization] Selected role:', this.selectedRole);
  }

  create() {
    console.log('[CharacterCustomization] Scene created');
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // Background
    this.add.rectangle(centerX, centerY, width, height, 0x1a1a1a).setOrigin(0.5);

    // Title
    this.add.text(centerX, 50, 'Customize Your Character', {
      font: 'bold 40px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // ===== CHARACTER NAME INPUT =====
    this.add.text(centerX, 120, 'Character Name:', {
      font: 'bold 22px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Create input field
    const inputWidth = 350;
    const inputBox = this.add.rectangle(centerX, 170, inputWidth, 45, 0x333333, 1)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xffffff);

    this.characterNameText = this.add.text(centerX - inputWidth / 2 + 15, 170, '', {
      font: '20px Arial',
      fill: '#ffffff'
    }).setOrigin(0, 0.5);

    // Input field state
    let isInputFocused = false;
    this.characterName = '';

    inputBox.setInteractive({ useHandCursor: true });
    inputBox.on('pointerdown', () => {
      isInputFocused = true;
      inputBox.setStrokeStyle(2, 0xffff00);
    });

    // Use the scene's keyboard input
    this.input.keyboard.on('keydown', (event) => {
      if (!isInputFocused) return;

      if (event.keyCode === 13) { // Enter
        isInputFocused = false;
        inputBox.setStrokeStyle(2, 0xffffff);
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
    this.add.text(centerX, 230, 'Preview:', {
      font: 'bold 22px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

    console.log('[CharacterCustomization] Creating preview sprite for role:', this.selectedRole);
    this.previewSprite = generateCharacterSprite(this, this.selectedRole, centerX, 310, this.selectedColorScheme);
    this.previewSprite.setScale(4.5);
    console.log('[CharacterCustomization] Preview sprite created');

    // ===== COLOR SCHEME SELECTOR =====
    this.add.text(centerX, 475, 'Color Scheme:', {
      font: 'bold 22px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

    const colorSchemes = [
      { name: 'Blue', primary: 0x2c3e50, secondary: 0x3498db, accent: 0x95a5a6, skin: 0xf4a460 },
      { name: 'Green', primary: 0x27ae60, secondary: 0x2ecc71, accent: 0x95a5a6, skin: 0xf4a460 },
      { name: 'Red', primary: 0xc0392b, secondary: 0xe74c3c, accent: 0xf39c12, skin: 0xf4a460 },
      { name: 'Purple', primary: 0x8e44ad, secondary: 0x9b59b6, accent: 0xbdc3c7, skin: 0xf4a460 },
      { name: 'Orange', primary: 0xd68910, secondary: 0xe67e22, accent: 0xf39c12, skin: 0xf4a460 },
      { name: 'Gray', primary: 0x34495e, secondary: 0x7f8c8d, accent: 0xbdc3c7, skin: 0xf4a460 }
    ];

    const colorButtonWidth = 110;
    const colorButtonHeight = 55;
    const colorGapX = 25;
    const colorGapY = 35;

    // Calculate grid dimensions
    const colorGridWidth = 3 * colorButtonWidth + 2 * colorGapX;
    const colorGridStartX = centerX - colorGridWidth / 2;
    const colorStartY = 525;
    const buttonRefs = [];

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

      buttonRefs.push({ button, scheme, idx });

      // Label below button
      this.add.text(x, y + colorButtonHeight / 2 + 15, scheme.name, {
        font: 'bold 13px Arial',
        fill: '#ffffff'
      }).setOrigin(0.5);

      button.on('pointerdown', () => {
        // Clear all borders
        buttonRefs.forEach(ref => ref.button.setStrokeStyle());

        // Set new selection
        this.selectedColorScheme = scheme;
        button.setStrokeStyle(3, 0xffff00);
        this.updatePreview(scheme);
      });

      // Highlight initial selection
      if (idx === 0) {
        button.setStrokeStyle(3, 0xffff00);
      }
    });

    // Store the selected color scheme
    this.selectedColorScheme = colorSchemes[0];

    console.log('[CharacterCustomization] Color schemes created');

    // ===== START GAME BUTTON =====
    const buttonGap = 40;
    const buttonY = height - 80;

    const backButton = this.add.rectangle(centerX - 120, buttonY, 120, 60, 0xc0392b, 0.8)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.add.text(centerX - 120, buttonY, 'Back', {
      font: 'bold 24px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

    backButton.on('pointerover', () => {
      backButton.setAlpha(1);
      backButton.setScale(1.05);
    });

    backButton.on('pointerout', () => {
      backButton.setAlpha(0.8);
      backButton.setScale(1);
    });

    backButton.on('pointerdown', () => {
      console.log('[CharacterCustomization] Back clicked');
      this.scene.start('CharacterSelectionScene');
    });

    const startButton = this.add.rectangle(centerX + 120, buttonY, 150, 60, 0x27ae60, 0.8)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.add.text(centerX + 120, buttonY, 'Start Game', {
      font: 'bold 24px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

    startButton.on('pointerover', () => {
      startButton.setAlpha(1);
      startButton.setScale(1.05);
    });

    startButton.on('pointerout', () => {
      startButton.setAlpha(0.8);
      startButton.setScale(1);
    });

    startButton.on('pointerdown', () => {
      console.log('[CharacterCustomization] Start Game clicked');
      console.log('[CharacterCustomization] Character name:', this.characterName);
      console.log('[CharacterCustomization] Role:', this.selectedRole);
      console.log('[CharacterCustomization] Color scheme:', this.selectedColorScheme);
      
      // Save character customization
      gameState.initCharacter(this.selectedRole, this.characterName, this.selectedColorScheme);
      console.log('[CharacterCustomization] Starting ChaossCrucibleScene...');
      
      // Add and start ChaossCrucibleScene on-demand
      if (!this.scene.get('ChaossCrucibleScene')) {
        this.scene.add('ChaossCrucibleScene', window.sceneClasses['ChaossCrucibleScene'], true);
      } else {
        this.scene.start('ChaossCrucibleScene');
      }
    });

    console.log('[CharacterCustomization] Scene fully created!');
  }

  updatePreview(colorScheme) {
    this.selectedColorScheme = colorScheme;
    this.previewSprite.destroy();
    this.previewSprite = generateCharacterSprite(this, this.selectedRole, this.scale.width / 2, 310, colorScheme);
    this.previewSprite.setScale(4.5);
  }
}
