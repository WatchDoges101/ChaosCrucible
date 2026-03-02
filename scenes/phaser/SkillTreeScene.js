// Skill Tree UI Scene for Phaser
import { gameState } from '../../services/gameState.js';
import { createAnimatedCharacter } from '../../services/spriteGenerator.js';
import { AbilityEffectsHandler } from '../../handlers/AbilityEffectsHandler.js';

const SKILL_TREE_ROLES = [
  { id: 'Male', label: 'WARRIOR' },
  { id: 'archer', label: 'ARCHER' },
  { id: 'brute', label: 'BRUTE' },
  { id: 'gunner', label: 'GUNNER' }
];

function normalizeRoleId(role) {
  if (!role || typeof role !== 'string') return null;

  const normalized = role.trim().toUpperCase();

  if (normalized === 'WARRIOR' || normalized === 'MALE') return 'Male';
  if (normalized === 'ARCHER') return 'archer';
  if (normalized === 'BRUTE') return 'brute';
  if (normalized === 'GUNNER') return 'gunner';

  return null;
}

export default class SkillTreeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SkillTreeScene' });
    this.selectedRole = null;
    this.selectedBranchKey = null;
    this.escBackHandler = null;
  }

  init(data) {
    if (data && Object.prototype.hasOwnProperty.call(data, 'selectedRole')) {
      this.selectedRole = data.selectedRole;
    }
    if (data && Object.prototype.hasOwnProperty.call(data, 'selectedBranchKey')) {
      this.selectedBranchKey = data.selectedBranchKey;
    }
  }

  create() {
    this.escBackHandler = null;

    if (!this.selectedRole && gameState.selectedRole) {
      this.selectedRole = normalizeRoleId(gameState.selectedRole);
    }

    const { width, height } = this.scale;
    const centerX = width / 2;

    const panelColor = 0x120b08;
    const panelEdge = 0xffa766;
    const lockedNode = 0x6b4331;
    const availableNode = 0xffa652;
    const unlockedNode = 0xffd98a;
    const connectorLocked = 0x8f5a3b;
    const connectorUnlocked = 0xffd49a;

    const goBackToMenu = () => {
      this.scene.stop();
      this.scene.start('MenuScene');
    };

    const drawRoundedPanel = (x, y, w, h, radius = 16, alpha = 0.92, depth = 0) => {
      const panel = this.add.graphics();
      panel.fillStyle(panelColor, alpha);
      panel.fillRoundedRect(x, y, w, h, radius);
      panel.lineStyle(2, panelEdge, 0.9);
      panel.strokeRoundedRect(x, y, w, h, radius);
      panel.setDepth(depth);
      return panel;
    };

    const drawConnector = (fromX, fromY, toX, toY, unlocked = false) => {
      const line = this.add.graphics();
      line.lineStyle(unlocked ? 6 : 4, unlocked ? connectorUnlocked : connectorLocked, unlocked ? 0.28 : 0.18);
      line.beginPath();
      line.moveTo(fromX, fromY);
      line.lineTo(toX, toY);
      line.strokePath();

      line.lineStyle(unlocked ? 3 : 2, unlocked ? connectorUnlocked : 0x8a92ad, unlocked ? 0.95 : 0.55);
      line.beginPath();
      line.moveTo(fromX, fromY);
      line.lineTo(toX, toY);
      line.strokePath();
      line.setDepth(19);
    };

    const createNodeVisual = (x, y, radius, stateColor) => {
      this.add.circle(x, y + 5, radius + 5, 0x000000, 0.25).setDepth(18);
      this.add.circle(x, y, radius + 4, 0x2a130a, 0.95).setStrokeStyle(2, 0x9a5f40, 0.7).setDepth(19);
      return this.add.circle(x, y, radius, stateColor, 0.92).setStrokeStyle(3, 0xfff0cf, 0.3).setDepth(20);
    };

    const createInfoCard = (x, y, widthPx, text, fontSize = '18px') => {
      return this.add.text(x, y + 18, text, {
        font: `bold ${fontSize} Arial`,
        fill: '#f2ddc8',
        align: 'center',
        wordWrap: { width: widthPx }
      }).setOrigin(0.5).setDepth(15);
    };

    // Background and framing
    const background = this.add.graphics();
    background.fillStyle(0x130707, 1);
    background.fillRect(0, 0, width, height);

    const footer = this.add.graphics();
    footer.fillStyle(0x1f0f09, 0.8);
    footer.fillRect(0, height - 52, width, 52);

    const headerBar = this.add.graphics();
    headerBar.fillStyle(0x1a0d08, 0.95);
    headerBar.fillRect(0, 0, width, 85);
    headerBar.lineStyle(2, 0x8f5a3b, 0.7);
    headerBar.beginPath();
    headerBar.moveTo(0, 85);
    headerBar.lineTo(width, 85);
    headerBar.strokePath();

    const backBtn = this.add.text(40, 42, '< BACK', {
      font: 'bold 16px Arial', fill: '#ffcc99', stroke: '#000', strokeThickness: 2
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true }).setDepth(10);

    backBtn.on('pointerdown', goBackToMenu);
    this.escBackHandler = goBackToMenu;
    this.input.keyboard?.on('keydown-ESC', this.escBackHandler);

    // Character selection
    const spriteY = 210;
    const spriteSpacing = 175;
    let spriteX = centerX - ((SKILL_TREE_ROLES.length - 1) * spriteSpacing) / 2;

    SKILL_TREE_ROLES.forEach((roleData) => {
      const isSelected = this.selectedRole && this.selectedRole === roleData.id;

      const roleCard = this.add.graphics();
      roleCard.fillStyle(isSelected ? 0x4a1f12 : 0x332018, 0.94);
      roleCard.fillRoundedRect(spriteX - 58, spriteY - 66, 116, 152, 14);
      roleCard.lineStyle(2, isSelected ? 0xffcf8a : 0x8f5a3b, isSelected ? 1 : 0.9);
      roleCard.strokeRoundedRect(spriteX - 58, spriteY - 66, 116, 152, 14);

      if (isSelected) {
        this.add.graphics()
          .lineStyle(5, 0xffa95e, 0.35)
          .strokeRoundedRect(spriteX - 61, spriteY - 69, 122, 158, 16);
      }

      const hitZone = this.add.zone(spriteX, spriteY + 8, 120, 155).setInteractive({ useHandCursor: true });

      const sprite = createAnimatedCharacter(this, roleData.id, spriteX, spriteY);
      sprite.setScale(2.37);
      sprite.setDepth(3);

      const roleLabel = this.add.text(spriteX, spriteY + 74, roleData.label, {
        font: 'bold 15px Arial', fill: '#f2ddc8', stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5).setDepth(3);

      hitZone.on('pointerdown', () => {
        this.selectedRole = roleData.id;
        this.selectedBranchKey = null;
        gameState.setSelectedRole(roleData.id);
        this.scene.restart({ selectedRole: roleData.id, selectedBranchKey: null });
      });

      hitZone.on('pointerover', () => {
        this.tweens.add({ targets: sprite, scale: 2.05, duration: 120, ease: 'Sine.out' });
        this.tweens.add({ targets: roleLabel, scale: 1.05, duration: 120, ease: 'Sine.out' });
      });

      hitZone.on('pointerout', () => {
        this.tweens.add({ targets: sprite, scale: 1.93, duration: 140, ease: 'Sine.out' });
        this.tweens.add({ targets: roleLabel, scale: 1, duration: 140, ease: 'Sine.out' });
      });

      spriteX += spriteSpacing;
    });

    if (!this.selectedRole) {
      drawRoundedPanel(centerX - 360, 316, 720, 92, 14, 0.92, 5);
      this.add.text(centerX, 360, 'SELECT A CHARACTER ABOVE TO VIEW THEIR SKILL TREE.', {
        font: 'bold 22px Arial', fill: '#ffe58f', stroke: '#000', strokeThickness: 3
      }).setOrigin(0.5).setDepth(6);
      return;
    }

    const selectedRole = normalizeRoleId(this.selectedRole);
    if (!selectedRole) {
      return;
    }

    if (!gameState.characters[selectedRole]) {
      gameState.setSelectedRole(selectedRole);
    }

    const leveling = gameState.characters[selectedRole].leveling;
    const abilityEffectsHandler = new AbilityEffectsHandler(this);
    abilityEffectsHandler.setLeveling(leveling);

    const statsTextDepth = 16;
    const hudY = 347;
    const statsSpacing = 170;
    const levelHudX = centerX - statsSpacing;
    const xpHudX = centerX;
    const tokensHudX = centerX + statsSpacing;

    this.add.text(levelHudX, hudY, `LEVEL ${leveling.level}`, {
      font: 'bold 24px Arial', fill: '#fff2d8', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(statsTextDepth);

    this.add.text(xpHudX, hudY, `XP ${leveling.xp}`, {
      font: 'bold 22px Arial', fill: '#ffd7aa', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(statsTextDepth);

    this.add.text(tokensHudX, hudY, `TOKENS ${leveling.tokens}`, {
      font: 'bold 22px Arial', fill: '#f8d678', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(statsTextDepth);

    const branches = Object.keys(leveling.skillTree);
    if (!this.selectedBranchKey || !leveling.skillTree[this.selectedBranchKey]) {
      this.selectedBranchKey = branches[0] || null;
    }

    const compactLayout = height <= 760;
    const sectionVerticalGap = compactLayout ? 74 : 96;
    const branchButtonY = hudY + sectionVerticalGap;
    const branchButtonWidth = 250;
    const branchButtonGap = 28;
    const branchButtonSpacing = branchButtonWidth + branchButtonGap;
    const branchButtonHeight = 62;
    const buttonStartX = centerX - ((branches.length - 1) * branchButtonSpacing) / 2;

    branches.forEach((branchKey, index) => {
      const branchNode = leveling.skillTree[branchKey];
      const isActive = this.selectedBranchKey === branchKey;
      const buttonX = buttonStartX + index * branchButtonSpacing;

      const branchButton = this.add.rectangle(
        buttonX,
        branchButtonY,
        branchButtonWidth,
        branchButtonHeight,
        isActive ? 0x5a2a10 : 0x332018,
        0.95
      )
        .setOrigin(0.5)
        .setStrokeStyle(2.5, isActive ? 0xffcf8a : 0x8f5a3b, 0.95)
        .setInteractive({ useHandCursor: true })
        .setDepth(18);

      const branchButtonLabel = this.add.text(buttonX, branchButtonY - 3, branchNode.name.toUpperCase(), {
        font: 'bold 16px Arial',
        fill: isActive ? '#fff2d8' : '#e7c9ac',
        stroke: '#000',
        strokeThickness: 3,
        align: 'center',
        wordWrap: { width: branchButtonWidth - 20 }
      }).setOrigin(0.5).setDepth(19);

      branchButton.on('pointerdown', () => {
        if (this.selectedBranchKey !== branchKey) {
          this.selectedBranchKey = branchKey;
          this.scene.restart({ selectedRole, selectedBranchKey: branchKey });
        }
      });

      branchButton.on('pointerover', () => {
        this.tweens.add({ targets: [branchButton, branchButtonLabel], scaleX: 1.03, scaleY: 1.03, duration: 110, ease: 'Sine.out' });
      });

      branchButton.on('pointerout', () => {
        this.tweens.add({ targets: [branchButton, branchButtonLabel], scaleX: 1, scaleY: 1, duration: 110, ease: 'Sine.out' });
      });
    });

    const branch = this.selectedBranchKey;
    const node = leveling.skillTree[branch];
    const children = Object.keys(node.children);

    const maxChildren = Math.max(1, children.length);
    const iconRadius = compactLayout ? 24 : 28;
    const branchX = centerX;

    let branchY = branchButtonY + sectionVerticalGap;
    let branchDescriptionY = branchY + (compactLayout ? 52 : 70);
    let childY = branchDescriptionY + (compactLayout ? 92 : 120);

    const childDescriptionStartOffset = compactLayout ? 56 : 66;
    const estimatedDescriptionHeight = compactLayout ? 56 : 74;
    const requiredBottom = childY + iconRadius + childDescriptionStartOffset + estimatedDescriptionHeight;
    const maxBottom = height - 60;
    if (requiredBottom > maxBottom) {
      const shiftUp = requiredBottom - maxBottom;
      branchY -= shiftUp;
      branchDescriptionY -= shiftUp;
      childY -= shiftUp;
    }

    const nodeSpacingX = Math.min(250, Math.max(132, (width - 220) / Math.max(1, maxChildren - 1)));
    const childStartX = branchX - ((children.length - 1) * nodeSpacingX) / 2;

    const branchStateColor = node.unlocked
      ? unlockedNode
      : (leveling.tokens >= node.cost)
        ? availableNode
        : lockedNode;

    const branchIcon = createNodeVisual(branchX, branchY, iconRadius, branchStateColor);
    branchIcon.setDepth(20);

    const branchDot = this.add.text(branchX, branchY, '•', {
      font: `bold ${compactLayout ? 24 : 28}px Arial`, fill: '#fff2d8', stroke: '#000', strokeThickness: 3
    }).setDepth(21);
    branchDot.setOrigin(0.5, 0.5);

    const branchLabel = this.add.text(branchX + iconRadius + 24, branchY, node.name.toUpperCase(), {
      font: `bold ${compactLayout ? 18 : 22}px Arial`, fill: node.unlocked ? '#fff2d8' : '#e7c9ac', stroke: '#000', strokeThickness: 3,
      align: 'left'
    }).setDepth(21);
    branchLabel.setOrigin(0, 0.5);

    const branchDescription = this.add.text(branchX, branchDescriptionY, node.description.toUpperCase(), {
      font: `bold ${compactLayout ? 16 : 20}px Arial`,
      fill: '#f2ddc8',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
      wordWrap: { width: compactLayout ? 700 : 820 }
    }).setDepth(15);
    branchDescription.setOrigin(0.5, 0);

    const branchCanUnlock = !node.unlocked && leveling.tokens >= node.cost;
    branchIcon.setInteractive();

    branchIcon.on('pointerover', () => {
      if (!node.unlocked) {
        this.tweens.add({ targets: branchIcon, scale: 1.08, duration: 110, ease: 'Sine.out' });
      }
    });

    branchIcon.on('pointerout', () => {
      this.tweens.add({ targets: branchIcon, scale: 1, duration: 110, ease: 'Sine.out' });
    });

    branchIcon.on('pointerdown', () => {
      if (branchCanUnlock) {
        if (leveling.unlockSkill([branch])) {
          gameState.saveSkillTreeForRole(selectedRole);
          abilityEffectsHandler.showUnlockCelebration([branch], node.name);
          this.time.delayedCall(460, () => this.scene.restart({ selectedRole, selectedBranchKey: branch }));
        }
      }
    });

    children.forEach((child, j) => {
      const childNode = node.children[child];
      const childX = childStartX + (j * nodeSpacingX);

      drawConnector(branchX, branchY + iconRadius, childX, childY - iconRadius, childNode.unlocked);

      const childStateColor = childNode.unlocked
        ? unlockedNode
        : (node.unlocked && leveling.tokens >= childNode.cost)
          ? availableNode
          : lockedNode;

      const childIcon = createNodeVisual(childX, childY, iconRadius, childStateColor);
      childIcon.setDepth(20);

      const iconSymbol = this.add.text(childX, childY, `${childNode.cost}`, {
        font: `bold ${compactLayout ? 18 : 22}px Arial`, fill: childNode.unlocked ? '#fff2d8' : '#e7c9ac', stroke: '#000', strokeThickness: 3
      }).setDepth(21);
      iconSymbol.setOrigin(0.5, 0.5);

      const childLabel = this.add.text(childX, childY + iconRadius + 24, childNode.name.toUpperCase(), {
        font: `bold ${compactLayout ? 10 : 12}px Arial`, fill: childNode.unlocked ? '#fff2d8' : '#e7c9ac', stroke: '#000', strokeThickness: 3,
        wordWrap: { width: nodeSpacingX - 10 },
        align: 'center'
      }).setDepth(21);
      childLabel.setOrigin(0.5, 0);

      const childDescriptionWidth = Math.max(130, nodeSpacingX - (compactLayout ? 24 : 20));
      const childDescription = this.add.text(childX, childY + iconRadius + childDescriptionStartOffset, childNode.description.toUpperCase(), {
        font: `bold ${compactLayout ? 13 : 16}px Arial`,
        fill: '#f2ddc8',
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center',
        wordWrap: { width: childDescriptionWidth }
      }).setDepth(15);
      childDescription.setOrigin(0.5, 0);

      const childCanUnlock = !childNode.unlocked && leveling.tokens >= childNode.cost && node.unlocked;
      childIcon.setInteractive();

      childIcon.on('pointerover', () => {
        if (!childNode.unlocked) {
          this.tweens.add({ targets: childIcon, scale: 1.08, duration: 110, ease: 'Sine.out' });
        }
      });

      childIcon.on('pointerout', () => {
        this.tweens.add({ targets: childIcon, scale: 1, duration: 110, ease: 'Sine.out' });
      });

      childIcon.on('pointerdown', () => {
        if (childCanUnlock) {
          if (leveling.unlockSkill([branch, child])) {
            gameState.saveSkillTreeForRole(selectedRole);
            abilityEffectsHandler.showUnlockCelebration([branch, child], childNode.name);
            this.time.delayedCall(460, () => this.scene.restart({ selectedRole, selectedBranchKey: branch }));
          }
        }
      });
    });
  }

  shutdown() {
    if (this.escBackHandler) {
      this.input.keyboard?.off('keydown-ESC', this.escBackHandler);
      this.escBackHandler = null;
    }
  }
}
