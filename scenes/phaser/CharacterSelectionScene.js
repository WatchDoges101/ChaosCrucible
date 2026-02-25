import { gameState } from '../services/gameState.js';

/**
 * CharacterSelectionScene
 * Phaser version of scenes/characterSelection.js
 */
export class CharacterSelectionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharacterSelectionScene' });
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

    const buttonWidth = 300;
    const buttonHeight = 100;
    const buttonGap = 20;
    const totalHeight = roles.length * buttonHeight + (roles.length - 1) * buttonGap;
    const startY = centerY - totalHeight / 2;

    roles.forEach((role, idx) => {
      const y = startY + idx * (buttonHeight + buttonGap);
      this.createRoleButton(centerX, y, buttonWidth, buttonHeight, role);
    });
  }

  createRoleButton(x, y, width, height, role) {
    const button = this.add.rectangle(x, y, width, height, role.color, 0.8)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const text = this.add.text(x, y, role.label, {
      font: '24px Arial',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    const hoverTween = null;

    button.on('pointerover', () => {
      if (hoverTween) hoverTween.stop();
      this.tweens.add({
        targets: button,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200
      });
      button.setStroke(0xffffff, 3);
    });

    button.on('pointerout', () => {
      this.tweens.add({
        targets: button,
        scaleX: 1,
        scaleY: 1,
        duration: 200
      });
      button.setStroke();
    });

    button.on('pointerdown', () => {
      gameState.setSelectedRole(role.name);
      gameState.initCharacter(role.name);
      this.scene.start('HostScene');
    });
  }
}
