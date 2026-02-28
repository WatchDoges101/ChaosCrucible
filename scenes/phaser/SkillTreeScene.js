// Skill Tree UI Scene for Phaser
import { gameState } from '../../services/gameState.js';
import { LevelingSystem, LEVEL_XP, skillTrees } from '../../services/levelingSystem.js';
import { generateCharacterSprite } from '../../services/spriteGenerator.js';
import { skillTreeHandler } from '../../handlers/SkillTreeHandler.js';
import { cleanupScene, stopAllTweens } from '../../helpers/sceneCleanupHelpers.js';

export default class SkillTreeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SkillTreeScene' });
    this.selectedRole = null;
    this.skillDisplay = {};
  }

  shutdown() {
    // Save progress on scene shutdown
    if (this.selectedRole) {
      skillTreeHandler.forceSave();
    }
    cleanupScene(this);
  }

  create() {
    // Initialize progress persistence if role is selected
    if (gameState.selectedRole) {
      skillTreeHandler.init(gameState.selectedRole);
    }
    // Add back button
    const backBtn = this.add.text(60, 30, '< BACK', {
      font: 'bold 18px Arial',
      fill: '#ff0',
      backgroundColor: '#222',
      padding: { left: 8, right: 8, top: 4, bottom: 4 },
      stroke: '#000',
      strokeThickness: 2
    }).setInteractive();
    backBtn.on('pointerdown', () => {
      this.scene.stop();
      this.scene.start('MenuScene');
    });

    // Character selection
    const roles = ['MALE', 'ARCHER', 'BRUTE', 'GUNNER'];
    const spriteY = 120;
    const spriteSpacing = 160;
    const centerX = this.scale.width / 2;
    let spriteX = centerX - ((roles.length - 1) * spriteSpacing) / 2;
    roles.forEach((role, idx) => {
      const sprite = generateCharacterSprite(this, role.charAt(0) + role.slice(1).toLowerCase(), spriteX, spriteY);
      sprite.setScale(1.2);
      sprite.setSize(80, 120); // Set size for interaction
      sprite.setInteractive();
      sprite.on('pointerdown', () => {
        this.selectedRole = role;
        gameState.setSelectedRole(role.charAt(0) + role.slice(1).toLowerCase());
        this.scene.restart();
      });
      // Highlight selected
      if (gameState.selectedRole && gameState.selectedRole.toUpperCase() === role) {
        this.add.graphics().lineStyle(4, 0xffd700, 1).strokeRect(spriteX - 40, spriteY - 60, 80, 120);
      }
      this.add.text(spriteX, spriteY + 70, role, {
        font: 'bold 16px Arial', fill: '#fff', stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5);
      spriteX += spriteSpacing;
    });

    if (!gameState.selectedRole) {
      this.add.text(centerX, 260, 'SELECT A CHARACTER ABOVE TO VIEW THEIR SKILL TREE.', {
        font: 'bold 20px Arial', fill: '#ff0', stroke: '#000', strokeThickness: 3
      }).setOrigin(0.5);
      return;
    }
    const leveling = gameState.characters[gameState.selectedRole].leveling;
    this.add.text(60, 200, `LEVEL: ${leveling.level}  XP: ${leveling.xp}  TOKENS: ${leveling.tokens}`.toUpperCase(), {
      font: 'bold 20px Arial', fill: '#fff', stroke: '#000', strokeThickness: 3
    });
    this.add.text(60, 240, 'SKILL TREE', { font: 'bold 24px Arial', fill: '#ff0' });

    // Skill tree layout
    const startY = 320;
    const nodeSpacingY = 110;
    const nodeSpacingX = 220;
    const iconRadius = 32;
    const branchColor = 0x888888;
    const highlightColor = 0xffd700;

    // Draw main branches
    const branches = Object.keys(leveling.skillTree);
    let branchY = startY;
    branches.forEach((branch, i) => {
      const node = leveling.skillTree[branch];
      // Draw branch node
      const branchX = centerX;
      const branchIcon = this.add.circle(branchX, branchY, iconRadius, node.unlocked ? highlightColor : branchColor, node.unlocked ? 0.9 : 0.5);
      branchIcon.setStrokeStyle(3, node.unlocked ? highlightColor : branchColor, 1);
      const branchLabel = this.add.text(branchX, branchY, node.name.toUpperCase(), {
        font: 'bold 18px Arial', fill: node.unlocked ? '#ffd700' : '#aaa', stroke: '#000', strokeThickness: 2
      });
      branchLabel.setOrigin(0.5, 0.5);
      // Show description and cost
      this.add.text(branchX, branchY + 40, `${node.description.toUpperCase()} (COST: ${node.cost})`, {
        font: 'bold 14px Arial', fill: '#fff', stroke: '#000', strokeThickness: 1
      }).setOrigin(0.5);
      branchIcon.setInteractive();
      branchIcon.on('pointerdown', () => {
        if (!node.unlocked && leveling.tokens >= node.cost) {
          // Use SkillTreeHandler for persistence
          const success = skillTreeHandler.unlockSkill(gameState.selectedRole, branch, node.cost);
          if (success) {
            this.scene.restart();
          }
        }
      });
      // Draw child nodes and connecting lines
      const children = Object.keys(node.children);
      children.forEach((child, j) => {
        const childNode = node.children[child];
        const childX = branchX + (j === 0 ? -nodeSpacingX : nodeSpacingX);
        const childY = branchY + nodeSpacingY;
        // Draw line
        const line = this.add.graphics();
        line.lineStyle(4, childNode.unlocked ? highlightColor : branchColor, childNode.unlocked ? 0.8 : 0.4);
        line.beginPath();
        line.moveTo(branchX, branchY + iconRadius);
        line.lineTo(childX, childY - iconRadius);
        line.strokePath();
        // Draw child icon
        const childIcon = this.add.circle(childX, childY, iconRadius, childNode.unlocked ? highlightColor : branchColor, childNode.unlocked ? 0.9 : 0.5);
        childIcon.setStrokeStyle(3, childNode.unlocked ? highlightColor : branchColor, 1);
        // Draw icon symbol
        const iconSymbol = this.add.text(childX, childY, childNode.name[0].toUpperCase(), {
          font: 'bold 28px Arial', fill: childNode.unlocked ? '#ffd700' : '#aaa', stroke: '#000', strokeThickness: 2
        });
        iconSymbol.setOrigin(0.5, 0.5);
        // Draw label
        const childLabel = this.add.text(childX, childY + iconRadius + 18, childNode.name.toUpperCase(), {
          font: 'bold 16px Arial', fill: childNode.unlocked ? '#ffd700' : '#aaa', stroke: '#000', strokeThickness: 2
        });
        childLabel.setOrigin(0.5, 0.5);
        // Show description and cost
        this.add.text(childX, childY + iconRadius + 38, `${childNode.description.toUpperCase()} (COST: ${childNode.cost})`, {
          font: 'bold 12px Arial', fill: '#fff', stroke: '#000', strokeThickness: 1
        }).setOrigin(0.5);
        childIcon.setInteractive();
        childIcon.on('pointerdown', () => {
          if (!childNode.unlocked && leveling.tokens >= childNode.cost && node.unlocked) {
            // Use SkillTreeHandler for persistence
            const success = skillTreeHandler.unlockSkill(gameState.selectedRole, `${branch}_${child}`, childNode.cost);
            if (success) {
              this.scene.restart();
            }
          }
        });
      });
      branchY += nodeSpacingY * 2;
    });

    this.add.text(60, branchY + 20, 'EARN TOKENS BY LEVELING UP. SPEND TOKENS TO UNLOCK ABILITIES.', {
      font: '14px Arial', fill: '#fff'
    });
    this.add.text(60, branchY + 50, 'CLICK ICONS TO UNLOCK. PRESS ESC TO RETURN.', { font: '14px Arial', fill: '#ff0' });
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.stop();
      this.scene.start('MenuScene');
    });
  }
}
