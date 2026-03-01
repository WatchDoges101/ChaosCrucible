import { generateCharacterSprite } from '../../services/spriteGenerator.js';
import { cleanupScene } from '../../helpers/sceneCleanupHelpers.js';

/**
 * CharacterWikiScene
 * Shows playable characters with combat profile and abilities.
 */
export class CharacterWikiScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharacterWikiScene', active: false });
    this.escBackHandler = null;
  }

  create() {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    const bg = this.add.rectangle(centerX, centerY, width, height, 0x150606, 1).setOrigin(0.5);
    bg.setDepth(-1000);

    this.add.text(centerX, 80, 'CHARACTER WIKI', {
      font: 'bold 56px Impact',
      fill: '#ffffff',
      stroke: '#550000',
      strokeThickness: 8
    }).setOrigin(0.5);

    this.createBackButton(90, 50);
    this.createCharacterList(centerX, centerY + 40);

    this.escBackHandler = () => {
      this.scene.start('WikiScene');
    };
    this.input.keyboard.on('keydown-ESC', this.escBackHandler);
  }

  createBackButton(x, y) {
    const text = this.add.text(x, y, 'BACK', {
      font: 'bold 22px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
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
      this.scene.start('WikiScene');
    });
  }

  createCharacterList(centerX, centerY) {
    const characters = [
      {
        role: 'Male',
        title: 'Warrior',
        profile: 'Close-range bruiser with balanced offense and survivability.',
        basic: 'Basic: Sword Slash',
        ability: 'Ability: Shockwave',
        accent: '#ffb28f'
      },
      {
        role: 'archer',
        title: 'Archer',
        profile: 'Ranged precision fighter focused on sustained safe damage.',
        basic: 'Basic: Arrow Shot',
        ability: 'Ability: Volley Burst',
        accent: '#c3e3ff'
      },
      {
        role: 'brute',
        title: 'Brute',
        profile: 'Heavy-impact frontline with powerful area pressure.',
        basic: 'Basic: Heavy Swing',
        ability: 'Ability: Earth Shockwave',
        accent: '#ffd49c'
      },
      {
        role: 'gunner',
        title: 'Gunner',
        profile: 'High attack-speed ranged class with rapid burst windows.',
        basic: 'Basic: Rapid Shot',
        ability: 'Ability: Burst Fire',
        accent: '#ffe89a'
      }
    ];

    const itemWidth = Math.min(760, this.scale.width - 80);
    const itemHeight = 130;
    const gap = 20;
    const totalHeight = characters.length * itemHeight + (characters.length - 1) * gap;
    const startY = -totalHeight / 2 + itemHeight / 2;

    const listContainer = this.add.container(centerX, centerY);

    characters.forEach((entry, index) => {
      const itemY = startY + index * (itemHeight + gap);
      const itemContainer = this.add.container(0, itemY);

      const panel = this.add.rectangle(0, 0, itemWidth, itemHeight, 0x2b0a0a, 0.86)
        .setStrokeStyle(2, 0xff8844, 0.75);

      const spriteContainer = generateCharacterSprite(this, entry.role, 0, 0, null, false, true);
      spriteContainer.setScale(2.1);
      spriteContainer.x = -itemWidth / 2 + 62;
      this.addCharacterAnimation(spriteContainer, index);

      const nameText = this.add.text(-itemWidth / 2 + 150, -44, entry.title, {
        font: 'bold 26px Arial',
        fill: '#ffffff'
      });

      const profileText = this.add.text(-itemWidth / 2 + 150, -12, entry.profile, {
        font: '17px Arial',
        fill: entry.accent,
        wordWrap: { width: itemWidth - 200 }
      });

      const basicText = this.add.text(-itemWidth / 2 + 150, 18, entry.basic, {
        font: '16px Arial',
        fill: '#ffe2b8'
      });

      const abilityText = this.add.text(-itemWidth / 2 + 150, 42, entry.ability, {
        font: '16px Arial',
        fill: '#ffcf9b'
      });

      itemContainer.add([panel, spriteContainer, nameText, profileText, basicText, abilityText]);
      listContainer.add(itemContainer);
    });
  }

  addCharacterAnimation(sprite, index) {
    const baseDelay = index * 170;

    this.tweens.add({
      targets: sprite,
      y: sprite.y - 3,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
      delay: baseDelay
    });

    this.tweens.add({
      targets: sprite,
      angle: 3,
      duration: 1700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
      delay: baseDelay + 100
    });
  }

  shutdown() {
    if (this.escBackHandler) {
      this.input.keyboard.off('keydown-ESC', this.escBackHandler);
      this.escBackHandler = null;
    }

    cleanupScene(this);
  }
}
