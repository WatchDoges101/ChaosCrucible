// Skill Tree UI Scene for Phaser
import { gameState } from '../../services/gameState.js';
import { createAnimatedCharacter } from '../../services/spriteGenerator.js';
import { AbilityEffectsHandler } from '../../handlers/AbilityEffectsHandler.js';

const SKILL_TREE_ROLES = [
  { id: 'WARRIOR', label: 'WARRIOR' },
  { id: 'archer', label: 'ARCHER' },
  { id: 'brute', label: 'BRUTE' },
  { id: 'gunner', label: 'GUNNER' }
];

function normalizeRoleId(role) {
  if (!role || typeof role !== 'string') return null;

  const normalized = role.trim().toUpperCase();

  if (normalized === 'WARRIOR') return 'WARRIOR';
  if (normalized === 'ARCHER') return 'archer';
  if (normalized === 'BRUTE') return 'brute';
  if (normalized === 'GUNNER') return 'gunner';

  return null;
}

export default class SkillTreeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SkillTreeScene' });
    this.selectedRole = null;
    this.escBackHandler = null;
  }

  create() {
    this.escBackHandler = null;

    const { width, height } = this.scale;
    const centerX = width / 2;

    const panelColor = 0x171b2a;
    const panelEdge = 0x46506f;
    const lockedNode = 0x5f667f;
    const availableNode = 0x8ea0d6;
    const unlockedNode = 0xffc857;
    const connectorLocked = 0x697089;
    const connectorUnlocked = 0xf6cf74;

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
      this.add.circle(x, y, radius + 4, 0x0f1320, 0.95).setStrokeStyle(2, 0x525b78, 0.7).setDepth(19);
      return this.add.circle(x, y, radius, stateColor, 0.92).setStrokeStyle(3, 0xf2f5ff, 0.2).setDepth(20);
    };

    const createInfoCard = (x, y, widthPx, text, fontSize = '14px') => {
      return this.add.text(x, y + 18, text, {
        font: `bold ${fontSize} Arial`,
        fill: '#edf2ff',
        align: 'center'
      }).setOrigin(0.5).setDepth(15);
    };

    // Background and framing
    const background = this.add.graphics();
    background.fillStyle(0x0b0f19, 1);
    background.fillRect(0, 0, width, height);

    const footer = this.add.graphics();
    footer.fillStyle(0x10172b, 0.8);
    footer.fillRect(0, height - 52, width, 52);

    const headerBar = this.add.graphics();
    headerBar.fillStyle(0x0f1320, 0.95);
    headerBar.fillRect(0, 0, width, 85);
    headerBar.lineStyle(2, 0x4a5578, 0.7);
    headerBar.beginPath();
    headerBar.moveTo(0, 85);
    headerBar.lineTo(width, 85);
    headerBar.strokePath();

    const backBtn = this.add.text(40, 42, '< BACK', {
      font: 'bold 16px Arial', fill: '#8ea0d6', stroke: '#000', strokeThickness: 2
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
      roleCard.fillStyle(isSelected ? 0x263357 : 0x1f2537, 0.94);
      roleCard.fillRoundedRect(spriteX - 58, spriteY - 66, 116, 152, 14);
      roleCard.lineStyle(2, isSelected ? 0xf5d37d : 0x556086, isSelected ? 1 : 0.9);
      roleCard.strokeRoundedRect(spriteX - 58, spriteY - 66, 116, 152, 14);

      if (isSelected) {
        this.add.graphics()
          .lineStyle(5, 0xf0d176, 0.35)
          .strokeRoundedRect(spriteX - 61, spriteY - 69, 122, 158, 16);
      }

      const hitZone = this.add.zone(spriteX, spriteY + 8, 120, 155).setInteractive({ useHandCursor: true });

      const sprite = createAnimatedCharacter(this, roleData.id, spriteX, spriteY);
      sprite.setScale(2.37);
      sprite.setDepth(3);

      const roleLabel = this.add.text(spriteX, spriteY + 74, roleData.label, {
        font: 'bold 15px Arial', fill: '#eaf1ff', stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5).setDepth(3);

      hitZone.on('pointerdown', () => {
        this.selectedRole = roleData.id;
        gameState.setSelectedRole(roleData.id);
        this.scene.restart();
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
    drawRoundedPanel(centerX - 210, 324, 420, 84, 14, 0.92, 15);

    const statsTextDepth = 16;
    const statsSpacing = 120;

    this.add.text(centerX - statsSpacing, 344, `LEVEL ${leveling.level}`, {
      font: 'bold 24px Arial', fill: '#e8efff', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5, 0).setDepth(statsTextDepth);

    this.add.text(centerX, 349, `XP ${leveling.xp}`, {
      font: 'bold 22px Arial', fill: '#b9c6e8', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5, 0).setDepth(statsTextDepth);

    this.add.text(centerX + statsSpacing, 347, `TOKENS ${leveling.tokens}`, {
      font: 'bold 22px Arial', fill: '#f8d678', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5, 0).setDepth(statsTextDepth);

    // Skill tree layout
    const startY = 520;
    const branchSpacingY = 260;
    const childOffsetY = 120;
    const nodeSpacingX = 250;
    const iconRadius = 52;

    // Draw main branches
    const branches = Object.keys(leveling.skillTree);
    let branchY = startY;
    branches.forEach((branch) => {
      const node = leveling.skillTree[branch];
      const branchX = centerX;

      const branchStateColor = node.unlocked
        ? unlockedNode
        : (leveling.tokens >= node.cost)
          ? availableNode
          : lockedNode;

      const branchIcon = createNodeVisual(branchX, branchY, iconRadius, branchStateColor);
      branchIcon.setDepth(20);

      const branchLabel = this.add.text(branchX, branchY, node.name.toUpperCase(), {
        font: 'bold 30px Arial', fill: node.unlocked ? '#fff0be' : '#d4ddf5', stroke: '#000', strokeThickness: 3
      }).setDepth(21);
      branchLabel.setOrigin(0.5, 0.5);

      createInfoCard(branchX, branchY + 65, 480, `${node.description.toUpperCase()} • COST ${node.cost}`, '15px');

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
            this.time.delayedCall(460, () => this.scene.restart());
          }
        }
      });

      // Draw child nodes and connecting lines
      const children = Object.keys(node.children);
      children.forEach((child, j) => {
        const childNode = node.children[child];
        const childX = branchX + (j === 0 ? -nodeSpacingX : nodeSpacingX);
        const childY = branchY + childOffsetY;

        drawConnector(branchX, branchY + iconRadius, childX, childY - iconRadius, childNode.unlocked);

        const childStateColor = childNode.unlocked
          ? unlockedNode
          : (node.unlocked && leveling.tokens >= childNode.cost)
            ? availableNode
            : lockedNode;

        const childIcon = createNodeVisual(childX, childY, iconRadius, childStateColor);
        childIcon.setDepth(20);

        const iconSymbol = this.add.text(childX, childY, childNode.name[0].toUpperCase(), {
          font: 'bold 52px Arial', fill: childNode.unlocked ? '#fff0be' : '#d4ddf5', stroke: '#000', strokeThickness: 3
        }).setDepth(21);
        iconSymbol.setOrigin(0.5, 0.5);

        const childLabel = this.add.text(childX, childY + iconRadius + 24, childNode.name.toUpperCase(), {
          font: 'bold 17px Arial', fill: childNode.unlocked ? '#fff0be' : '#d4ddf5', stroke: '#000', strokeThickness: 3
        }).setDepth(21);
        childLabel.setOrigin(0.5, 0.5);

        createInfoCard(childX, childY + iconRadius + 55, 300, `${childNode.description.toUpperCase()} • COST ${childNode.cost}`, '14px');

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
              this.time.delayedCall(460, () => this.scene.restart());
            }
          }
        });
      });

      branchY += branchSpacingY;
    });
  }

  shutdown() {
    if (this.escBackHandler) {
      this.input.keyboard?.off('keydown-ESC', this.escBackHandler);
      this.escBackHandler = null;
    }
  }
}
