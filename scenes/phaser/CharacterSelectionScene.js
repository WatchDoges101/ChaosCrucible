import { gameState } from '../../services/gameState.js';
import { generateCharacterSprite } from '../../services/spriteGenerator.js';

/**
 * CharacterSelectionScene
 * Phaser version of scenes/characterSelection.js
 */
export class CharacterSelectionScene extends Phaser.Scene {
  constructor() {
    console.log('[CONSTRUCTOR] CharacterSelectionScene being instantiated');
    super({ key: 'CharacterSelectionScene', active: false });
  }

  create() {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // Background
    this.add.rectangle(centerX, centerY, width, height, 0x1a1a1a).setOrigin(0.5);

    // Title
    this.add.text(centerX, 50, 'Choose Your Role', {
      font: '48px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Role buttons
    const roles = [
      { name: 'Male', label: 'Male', color: 0x0066cc },
      { name: 'archer', label: 'Archer', color: 0x00cc00 },
      { name: 'brute', label: 'Brute', color: 0x994400 },
      { name: 'gunner', label: 'Gunner', color: 0xcc0000 }
    ];

    const buttonWidth = 250;
    const buttonHeight = 120;
    const buttonGap = 30;
    const totalHeight = roles.length * buttonHeight + (roles.length - 1) * buttonGap;
    const startY = centerY - totalHeight / 2;

    roles.forEach((role, idx) => {
      const y = startY + idx * (buttonHeight + buttonGap);
      this.createRoleButton(centerX, y, buttonWidth, buttonHeight, role);
    });
  }

  createRoleButton(x, y, width, height, role) {
    const button = this.add.rectangle(x, y, width, height, role.color, 0.7)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(1);

    // Show large sprite preview on the left side of button
    const spriteX = x - width / 2 + 40;
    const spritePreview = generateCharacterSprite(this, role.name, spriteX, y);
    spritePreview.setScale(2.5);
    spritePreview.setDepth(2);

    // Role label on the right side
    const text = this.add.text(x + 40, y - 10, role.label, {
      font: 'bold 28px Arial',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    text.setDepth(2);

    // Description text
    const descriptions = {
      'Male': 'Balanced Warrior',
      'archer': 'Ranged Master',
      'brute': 'Tank Heavy',
      'gunner': 'Tech Expert'
    };

    const desc = this.add.text(x + 40, y + 15, descriptions[role.name], {
      font: '14px Arial',
      fill: '#cccccc',
      align: 'center'
    }).setOrigin(0.5);
    desc.setDepth(2);

    button.on('pointerover', () => {
      this.tweens.add({
        targets: button,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 200
      });
      this.tweens.add({
        targets: spritePreview,
        scaleX: 2.8,
        scaleY: 2.8,
        duration: 200
      });
      button.setAlpha(1);
      button.setStrokeStyle(4, 0xffffff);
    });

    button.on('pointerout', () => {
      this.tweens.add({
        targets: button,
        scaleX: 1,
        scaleY: 1,
        duration: 200
      });
      this.tweens.add({
        targets: spritePreview,
        scaleX: 2.5,
        scaleY: 2.5,
        duration: 200
      });
      button.setAlpha(0.7);
      button.setStrokeStyle();
    });

    button.on('pointerdown', () => {
      gameState.setSelectedRole(role.name);
      // Add and start CharacterCustomizationScene on-demand
      if (!this.scene.get('CharacterCustomizationScene')) {
        this.scene.add('CharacterCustomizationScene', window.sceneClasses['CharacterCustomizationScene'], true, { role: role.name });
      } else {
        this.scene.start('CharacterCustomizationScene', { role: role.name });
      }
    });
  }
}
