/**
 * UI Helper Functions
 * 
 * Helper utilities for creating common UI elements like buttons, panels, and HUD components.
 * Promotes consistent UI design across all scenes.
 * 
 * @module helpers/uiHelpers
 */

import { createButtonHoverScale, createButtonUnhoverScale } from './animationHelpers.js';

/**
 * Create an interactive button with hover effects
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Button width
 * @param {number} height - Button height
 * @param {Object} config - Button configuration
 * @param {string} config.label - Button text
 * @param {number} [config.color=0xff3300] - Button background color
 * @param {Object} [config.style] - Text style object
 * @param {Function} [config.onClick] - Click callback
 * @param {number} [config.hoverScale=1.15] - Scale on hover
 * @param {number} [config.radius=0] - Corner radius for rounded button
 * @returns {Object} Object containing button and text references
 * @example
 * const btn = createButton(this, 100, 100, 200, 50, {
 *   label: 'Start Game',
 *   color: 0x00ff00,
 *   onClick: () => this.scene.start('GameScene')
 * });
 */
export function createButton(scene, x, y, width, height, config = {}) {
  const {
    label,
    color = 0xff3300,
    style = {
      font: 'bold 32px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    },
    onClick,
    hoverScale = 1.15,
    radius = 0
  } = config;

  let button;
  
  if (radius > 0) {
    // Create rounded button using graphics
    const graphics = scene.add.graphics();
    graphics.fillStyle(color, 0.9);
    graphics.fillRoundedRect(x - width / 2, y - height / 2, width, height, radius);
    
    // Create interactive zone
    button = scene.add.zone(x, y, width, height)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    
    button.graphics = graphics;
  } else {
    // Create rectangular button
    button = scene.add.rectangle(x, y, width, height, color, 0.9)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
  }

  const text = scene.add.text(x, y, label, style).setOrigin(0.5);

  // Hover effects
  button.on('pointerover', () => {
    createButtonHoverScale(scene, [button, text], { to: hoverScale });
    if (button.graphics) {
      createButtonHoverScale(scene, button.graphics, { to: hoverScale });
    }
  });

  button.on('pointerout', () => {
    createButtonUnhoverScale(scene, [button, text]);
    if (button.graphics) {
      createButtonUnhoverScale(scene, button.graphics);
    }
  });

  if (onClick) {
    button.on('pointerdown', onClick);
  }

  return { button, text, graphics: button.graphics };
}

/**
 * Create a back button (smaller, positioned in corner)
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {Function} onClick - Click callback
 * @param {Object} [config] - Additional configuration
 * @returns {Object} Object containing button and text references
 * @example
 * createBackButton(this, 90, 50, () => this.scene.start('MenuScene'));
 */
export function createBackButton(scene, x, y, onClick, config = {}) {
  const {
    label = 'Back',
    width = 120,
    height = 44,
    color = 0x7a1a00
  } = config;

  return createButton(scene, x, y, width, height, {
    label,
    color,
    style: {
      font: 'bold 20px Arial',
      fill: '#ffffff'
    },
    onClick,
    hoverScale: 1.08
  });
}

/**
 * Create a text input field
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Input width
 * @param {number} height - Input height
 * @param {Object} config - Input configuration
 * @param {string} [config.placeholder=''] - Placeholder text
 * @param {number} [config.maxLength=20] - Maximum character length
 * @param {Function} [config.onChange] - Callback when text changes
 * @returns {Object} Object containing input box, text, and value accessor
 * @example
 * const input = createTextInput(this, 100, 100, 300, 50, {
 *   placeholder: 'Enter name...',
 *   maxLength: 15,
 *   onChange: (text) => console.log(text)
 * });
 */
export function createTextInput(scene, x, y, width, height, config = {}) {
  const {
    placeholder = '',
    maxLength = 20,
    onChange
  } = config;

  const inputBox = scene.add.rectangle(x, y, width, height, 0x333333, 1)
    .setOrigin(0.5)
    .setStrokeStyle(3, 0xffffff);

  const textStyle = {
    font: 'bold 24px Arial',
    fill: '#ffffff'
  };

  const inputText = scene.add.text(x - width / 2 + 15, y, placeholder, textStyle)
    .setOrigin(0, 0.5);

  let value = placeholder;
  let isFocused = false;

  inputBox.setInteractive({ useHandCursor: true });
  inputBox.on('pointerdown', () => {
    isFocused = true;
    inputBox.setStrokeStyle(3, 0xff00ff);
  });

  scene.input.keyboard.on('keydown', (event) => {
    if (!isFocused) return;

    if (event.keyCode === 13) { // Enter
      isFocused = false;
      inputBox.setStrokeStyle(3, 0xffffff);
    } else if (event.keyCode === 8) { // Backspace
      value = value.slice(0, -1);
    } else if (value.length < maxLength && event.key.length === 1) {
      value += event.key;
    }

    inputText.setText(value);
    
    if (onChange) {
      onChange(value);
    }
  });

  return {
    inputBox,
    inputText,
    getValue: () => value,
    setValue: (newValue) => {
      value = newValue;
      inputText.setText(value);
    }
  };
}

/**
 * Create a health bar
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Bar width
 * @param {number} height - Bar height
 * @param {Object} config - Health bar configuration
 * @param {number} [config.currentHealth=100] - Current health value
 * @param {number} [config.maxHealth=100] - Maximum health value
 * @param {number} [config.foregroundColor=0xff0000] - Bar color
 * @param {number} [config.backgroundColor=0x000000] - Background color
 * @param {boolean} [config.showText=true] - Show health text
 * @returns {Object} Health bar components and update function
 * @example
 * const healthBar = createHealthBar(this, 100, 500, 300, 30, {
 *   currentHealth: 75,
 *   maxHealth: 100
 * });
 * healthBar.update(50); // Update to 50 HP
 */
export function createHealthBar(scene, x, y, width, height, config = {}) {
  const {
    currentHealth = 100,
    maxHealth = 100,
    foregroundColor = 0xff0000,
    backgroundColor = 0x000000,
    showText = true
  } = config;

  // Background
  const background = scene.add.rectangle(x, y, width, height, backgroundColor, 0.9)
    .setOrigin(0, 0.5);

  // Border
  const border = scene.add.rectangle(x, y, width, height, 0x333333)
    .setOrigin(0, 0.5)
    .setStrokeStyle(2, 0x666666);
  border.isFilled = false;

  // Foreground (actual health)
  const initialWidth = (currentHealth / maxHealth) * width;
  const foreground = scene.add.rectangle(x, y, initialWidth, height, foregroundColor, 1)
    .setOrigin(0, 0.5);

  let healthText = null;
  if (showText) {
    healthText = scene.add.text(x + width / 2, y, `${currentHealth} / ${maxHealth}`, {
      font: 'bold 16px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5, 0.5);
  }

  /**
   * Update health bar value
   * @param {number} newHealth - New health value
   */
  const update = (newHealth) => {
    const healthPercent = Math.max(0, Math.min(1, newHealth / maxHealth));
    foreground.width = healthPercent * width;
    
    if (healthText) {
      healthText.setText(`${Math.floor(newHealth)} / ${maxHealth}`);
    }
  };

  return {
    background,
    border,
    foreground,
    healthText,
    update,
    destroy: () => {
      background.destroy();
      border.destroy();
      foreground.destroy();
      if (healthText) healthText.destroy();
    }
  };
}

/**
 * Create a panel/container with border
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Panel width
 * @param {number} height - Panel height
 * @param {Object} [config] - Panel configuration
 * @param {number} [config.backgroundColor=0x2b0a0a] - Background color
 * @param {number} [config.backgroundAlpha=0.85] - Background opacity
 * @param {number} [config.borderColor=0xff5500] - Border color
 * @param {number} [config.borderWidth=2] - Border thickness
 * @param {number} [config.borderAlpha=0.7] - Border opacity
 * @returns {Phaser.GameObjects.Rectangle} The created panel
 * @example
 * const panel = createPanel(this, 100, 100, 400, 300, {
 *   backgroundColor: 0x000000,
 *   borderColor: 0xffffff
 * });
 */
export function createPanel(scene, x, y, width, height, config = {}) {
  const {
    backgroundColor = 0x2b0a0a,
    backgroundAlpha = 0.85,
    borderColor = 0xff5500,
    borderWidth = 2,
    borderAlpha = 0.7
  } = config;

  const panel = scene.add.rectangle(x, y, width, height, backgroundColor, backgroundAlpha)
    .setStrokeStyle(borderWidth, borderColor, borderAlpha);

  return panel;
}

/**
 * Create a title text with shadow and effects
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} text - Title text
 * @param {Object} [config] - Title configuration
 * @param {string} [config.fontFamily='Impact'] - Font family
 * @param {string} [config.fontSize='96px'] - Font size
 * @param {string} [config.fill='#ffffff'] - Text color
 * @param {string} [config.stroke='#550000'] - Stroke color
 * @param {number} [config.strokeThickness=10] - Stroke thickness
 * @returns {Phaser.GameObjects.Text} The created title
 * @example
 * createTitle(this, 960, 120, 'CHAOS CRUCIBLE', {
 *   fontSize: '72px',
 *   fill: '#ff0000'
 * });
 */
export function createTitle(scene, x, y, text, config = {}) {
  const {
    fontFamily = 'Impact',
    fontSize = '96px',
    fill = '#ffffff',
    stroke = '#550000',
    strokeThickness = 10
  } = config;

  return scene.add.text(x, y, text, {
    font: `bold ${fontSize} ${fontFamily}`,
    fill,
    stroke,
    strokeThickness
  }).setOrigin(0.5);
}

/**
 * Create a label text (smaller, simpler than title)
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} text - Label text
 * @param {Object} [config] - Label configuration
 * @returns {Phaser.GameObjects.Text} The created label
 * @example
 * createLabel(this, 100, 100, 'Score:', { fontSize: '24px', fill: '#ffff00' });
 */
export function createLabel(scene, x, y, text, config = {}) {
  const {
    fontSize = '20px',
    fontFamily = 'Arial',
    fill = '#ffffff',
    stroke = null,
    strokeThickness = 0
  } = config;

  const style = {
    font: `bold ${fontSize} ${fontFamily}`,
    fill
  };

  if (stroke) {
    style.stroke = stroke;
    style.strokeThickness = strokeThickness;
  }

  return scene.add.text(x, y, text, style);
}

/**
 * Create a stat display (icon + label + value)
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} x - X position  
 * @param {number} y - Y position
 * @param {string} label - Stat label
 * @param {number|string} value - Stat value
 * @param {Object} [config] - Configuration
 * @returns {Object} Stat display components
 * @example
 * const stat = createStatDisplay(this, 100, 100, 'HP', 100, { color: 0xff0000 });
 * stat.update(75); // Update value
 */
export function createStatDisplay(scene, x, y, label, value, config = {}) {
  const {
    color = 0xffffff,
    fontSize = '18px'
  } = config;

  const labelText = scene.add.text(x, y, `${label}:`, {
    font: `bold ${fontSize} Arial`,
    fill: '#ffdda0'
  });

  const valueText = scene.add.text(x + labelText.width + 10, y, value.toString(), {
    font: `bold ${fontSize} Arial`,
    fill: `#${color.toString(16).padStart(6, '0')}`
  });

  const update = (newValue) => {
    valueText.setText(newValue.toString());
  };

  return {
    labelText,
    valueText,
    update,
    destroy: () => {
      labelText.destroy();
      valueText.destroy();
    }
  };
}

/**
 * Create a color picker button
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} size - Button size
 * @param {number} color - Color value
 * @param {Function} onClick - Click callback
 * @returns {Phaser.GameObjects.Rectangle} The color button
 * @example
 * createColorButton(this, 100, 100, 60, 0xff0000, () => selectColor(0xff0000));
 */
export function createColorButton(scene, x, y, size, color, onClick) {
  const button = scene.add.rectangle(x, y, size, size, color, 1)
    .setOrigin(0.5)
    .setStrokeStyle(4, 0xffffff, 0.7)
    .setInteractive({ useHandCursor: true });

  button.on('pointerover', () => {
    button.setStrokeStyle(5, 0xffff00, 1);
    createButtonHoverScale(scene, button, { to: 1.1 });
  });

  button.on('pointerout', () => {
    button.setStrokeStyle(4, 0xffffff, 0.7);
    createButtonUnhoverScale(scene, button);
  });

  if (onClick) {
    button.on('pointerdown', onClick);
  }

  return button;
}

/**
 * Create a loading bar/progress bar
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Bar width
 * @param {number} height - Bar height
 * @param {Object} [config] - Configuration
 * @returns {Object} Progress bar components and update function
 * @example
 * const progress = createProgressBar(this, 100, 100, 400, 30);
 * progress.update(0.5); // 50% complete
 */
export function createProgressBar(scene, x, y, width, height, config = {}) {
  const {
    backgroundColor = 0x222222,
    foregroundColor = 0x00ff00,
    borderColor = 0x666666
  } = config;

  const background = scene.add.rectangle(x, y, width, height, backgroundColor, 0.9)
    .setOrigin(0, 0.5);

  const foreground = scene.add.rectangle(x, y, 0, height, foregroundColor, 1)
    .setOrigin(0, 0.5);

  const border = scene.add.rectangle(x, y, width, height, borderColor)
    .setOrigin(0, 0.5)
    .setStrokeStyle(2, borderColor);
  border.isFilled = false;

  const update = (progress) => {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    foreground.width = clampedProgress * width;
  };

  return {
    background,
    foreground,
    border,
    update,
    destroy: () => {
      background.destroy();
      foreground.destroy();
      border.destroy();
    }
  };
}
