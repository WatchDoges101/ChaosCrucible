import { gameState } from '../../services/gameState.js';
import { generateCharacterSprite } from '../../services/spriteGenerator.js';
import { LEVEL_XP } from '../../services/levelingSystem.js';
import { cleanupScene, stopAllTweens } from '../../helpers/sceneCleanupHelpers.js';

/**
 * CharacterSelectionScene
 * Phaser version of scenes/characterSelection.js with exciting animations and design
 */
export class CharacterSelectionScene extends Phaser.Scene {
  constructor() {

    super({ key: 'CharacterSelectionScene', active: false });
    this.buttons = [];
    this.escBackHandler = null;
    
    // Character data with detailed stats and information
    this.characterData = {
      'Male': {
        name: 'Warrior',
        description: 'A versatile melee fighter with balanced stats',
        abilities: 'Close combat specialist with sword skills',
        enemyEffects: 'Moderate knockback on hit, stuns enemies briefly',
        stats: {
          damage: 75,
          health: 100,
          speed: 70
        },
        pros: [
          'Well-rounded stats',
          'Good survivability',
          'Reliable damage output'
        ],
        cons: [
          'No ranged attacks',
          'Average at everything',
          'Requires close combat'
        ]
      },
      'archer': {
        name: 'Archer',
        description: 'Swift ranged attacker with precision strikes',
        abilities: 'Long-range bow attacks, rapid shot ability',
        enemyEffects: 'Piercing damage, slows enemies on critical hits',
        stats: {
          damage: 65,
          health: 70,
          speed: 90
        },
        pros: [
          'Excellent mobility',
          'Safe ranged attacks',
          'High attack speed'
        ],
        cons: [
          'Low health pool',
          'Weak in close combat',
          'Lower single-hit damage'
        ]
      },
      'brute': {
        name: 'Brute',
        description: 'Heavy-armored tank that absorbs massive damage',
        abilities: 'Ground slam, defensive stance',
        enemyEffects: 'Heavy knockback, area stun, intimidates nearby enemies',
        stats: {
          damage: 90,
          health: 150,
          speed: 45
        },
        pros: [
          'Highest health pool',
          'Maximum damage output',
          'Strong area control'
        ],
        cons: [
          'Very slow movement',
          'Easy to dodge',
          'Low attack speed'
        ]
      },
      'gunner': {
        name: 'Gunner',
        description: 'Tech-savvy fighter with advanced weaponry',
        abilities: 'Rapid-fire shots, explosive rounds, deployable turrets',
        enemyEffects: 'Chain damage to nearby enemies, burn damage over time',
        stats: {
          damage: 80,
          health: 85,
          speed: 75
        },
        pros: [
          'High burst damage',
          'Area damage capability',
          'Versatile range options'
        ],
        cons: [
          'Resource dependent',
          'Medium survivability',
          'Reload downtime'
        ]
      }
    };
  }

  init() {
    // Clear button references when scene initializes
    this.buttons = [];
    this.escBackHandler = null;
  }

  create() {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;
    
    this.currentViewedCharacter = 'Male';

    // Dark gradient background
    const bg = this.add.rectangle(centerX, centerY, width, height, 0x0a0a0a).setOrigin(0.5);
    
    // Create flame particle emitters for background
    this.createFlameBackground();

    // Back button (top-left)
    this.createBackButton(100, 55);

    // Title with exciting font and glow - larger
    const title = this.add.text(centerX, 60, '⚔ CHOOSE YOUR CHAMPION ⚔', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '72px',
      fill: '#ffaa00',
      stroke: '#ff4400',
      strokeThickness: 5,
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: '#ff6600',
        blur: 25,
        fill: true
      }
    }).setOrigin(0.5);
    
    // Pulsing animation for title
    this.tweens.add({
      targets: title,
      scale: { from: 1, to: 1.05 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Role buttons
    const roles = [
      { name: 'Male', label: 'WARRIOR', color: 0x0066cc, gradientColor: 0x0099ff },
      { name: 'archer', label: 'ARCHER', color: 0x00aa00, gradientColor: 0x00ff44 },
      { name: 'brute', label: 'BRUTE', color: 0x994400, gradientColor: 0xcc6600 },
      { name: 'gunner', label: 'GUNNER', color: 0xcc0000, gradientColor: 0xff3333 }
    ];

    const buttonWidth = 400;
    const buttonHeight = 140;
    const buttonGap = 25;
    const totalHeight = roles.length * buttonHeight + (roles.length - 1) * buttonGap;
    const startY = centerY - totalHeight / 2 + 50;
    
    // Center the layout - buttons on left side of center, details on right
    const leftColumnX = centerX - 250;
    const detailsPanelX = centerX + 280;
    const panelWidth = 520;

    roles.forEach((role, idx) => {
      const y = startY + idx * (buttonHeight + buttonGap);
      this.createRoleButton(leftColumnX, y, buttonWidth, buttonHeight, role);
    });
    
    // Create details panel on the right, aligned with buttons (same total height)
    this.createDetailsPanel(detailsPanelX, startY, panelWidth, totalHeight);

    this.escBackHandler = () => {
      this.scene.start('MenuScene');
    };
    this.input.keyboard.on('keydown-ESC', this.escBackHandler);
  }

  createBackButton(x, y) {
    const button = this.add.zone(x, y, 160, 58)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(5000)
      .setScrollFactor(0);

    const text = this.add.text(x, y, 'BACK', {
      font: 'bold 26px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5)
      .setDepth(5001)
      .setScrollFactor(0);

    button.on('pointerover', () => {
      this.tweens.add({
        targets: text,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 150,
        ease: 'Power2'
      });
    });

    button.on('pointerout', () => {
      this.tweens.add({
        targets: text,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
        ease: 'Power2'
      });
    });

    button.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    this.buttons.push({ button, texts: [text] });
  }
  
  createFlameBackground() {
    const { width, height } = this.scale;
    
    // Create multiple flame emitters at bottom
    const numEmitters = 8;
    for (let i = 0; i < numEmitters; i++) {
      const x = (width / (numEmitters + 1)) * (i + 1);
      
      // Create particle emitter for flames
      const particles = this.add.particles(x, height + 20, null, {
        speed: { min: 80, max: 150 },
        angle: { min: 250, max: 290 },
        scale: { start: 0.6, end: 0 },
        alpha: { start: 0.8, end: 0 },
        tint: [0xff4400, 0xff6600, 0xff8800, 0xffaa00, 0xffcc00],
        lifespan: 2000,
        frequency: 80,
        gravityY: -50,
        blendMode: 'ADD',
        emitting: true,
        quantity: 2
      });
      
      // Make circles for particles
      const graphics = this.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(0xffffff);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture('flameParticle' + i, 16, 16);
      graphics.destroy();
      
      particles.setTexture('flameParticle' + i);
      particles.setDepth(-1);
    }
    
    // Add some ember particles floating up
    const emberParticles = this.add.particles(0, height, null, {
      x: { min: 0, max: width },
      speed: { min: 20, max: 60 },
      angle: { min: 260, max: 280 },
      scale: { min: 0.2, max: 0.5 },
      alpha: { start: 1, end: 0 },
      tint: [0xff6600, 0xff8800, 0xffaa00],
      lifespan: 4000,
      frequency: 200,
      gravityY: -10,
      blendMode: 'ADD',
      emitting: true
    });
    
    const emberGraphics = this.make.graphics({ x: 0, y: 0 });
    emberGraphics.fillStyle(0xffffff);
    emberGraphics.fillCircle(4, 4, 4);
    emberGraphics.generateTexture('emberParticle', 8, 8);
    emberGraphics.destroy();
    
    emberParticles.setTexture('emberParticle');
    emberParticles.setDepth(-2);
  }

  createRoleButton(x, y, width, height, role) {
    const radius = 25;
    
    // Create rounded rectangle button using graphics
    const buttonGraphics = this.add.graphics();
    buttonGraphics.fillStyle(role.color, 0.85);
    buttonGraphics.fillRoundedRect(x - width/2, y - height/2, width, height, radius);
    buttonGraphics.lineStyle(4, role.gradientColor, 1);
    buttonGraphics.strokeRoundedRect(x - width/2, y - height/2, width, height, radius);
    
    // Create interactive zone for the button
    const button = this.add.zone(x, y, width, height)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(2);

    // Store graphics for later manipulation
    button.graphics = buttonGraphics;
    button.roleData = role;
    
    // Store button reference for cleanup
    this.buttons.push({ button, graphics: buttonGraphics, texts: [] });

    // Show sprite preview - larger
    const spriteX = x - width / 2 + 70;
    const spritePreview = generateCharacterSprite(this, role.name, spriteX, y);
    spritePreview.setScale(3.5);
    spritePreview.setDepth(3);
    button.sprite = spritePreview;

    // Role label with exciting font - larger
    const text = this.add.text(x + 40, y - 20, role.label, {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '42px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 8,
        fill: true
      }
    }).setOrigin(0.5);
    text.setDepth(3);
    button.text = text;

    const levelInfo = this.getRoleLevelInfo(role.name);

    const levelText = this.add.text(x + 40, y + 18, `LEVEL ${levelInfo.level}`, {
      fontFamily: 'Arial',
      fontSize: '16px',
      fill: '#ffe08a',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    levelText.setDepth(3);

    const levelBarWidth = 210;
    const levelBarHeight = 12;
    const levelBarX = x + 40 - levelBarWidth / 2;
    const levelBarY = y + 40;

    const levelBarBg = this.add.graphics();
    levelBarBg.fillStyle(0x222222, 0.9);
    levelBarBg.fillRoundedRect(levelBarX, levelBarY, levelBarWidth, levelBarHeight, 6);
    levelBarBg.lineStyle(2, 0x666666, 0.7);
    levelBarBg.strokeRoundedRect(levelBarX, levelBarY, levelBarWidth, levelBarHeight, 6);
    levelBarBg.setDepth(3);

    const levelBarFill = this.add.graphics();
    levelBarFill.fillStyle(0xffc857, 1);
    levelBarFill.fillRoundedRect(levelBarX, levelBarY, Math.max(6, levelBarWidth * levelInfo.progress), levelBarHeight, 6);
    levelBarFill.setDepth(3);

    // Store text references for cleanup
    const buttonRef = this.buttons[this.buttons.length - 1];
    buttonRef.texts.push(text, levelText, levelBarBg, levelBarFill);
    buttonRef.sprite = spritePreview;

    // Hover effects
    button.on('pointerover', () => {
      // Redraw with brighter color and glow
      buttonGraphics.clear();
      buttonGraphics.fillStyle(role.gradientColor, 1);
      buttonGraphics.fillRoundedRect(x - width/2, y - height/2, width, height, radius);
      buttonGraphics.lineStyle(5, 0xffffff, 1);
      buttonGraphics.strokeRoundedRect(x - width/2, y - height/2, width, height, radius);
      
      this.tweens.add({
        targets: spritePreview,
        scale: 3.85,
        duration: 200,
        ease: 'Back.easeOut'
      });
      this.tweens.add({
        targets: [text, levelText],
        scale: 1.1,
        duration: 200,
        ease: 'Back.easeOut'
      });
      
      // Update details panel
      this.updateDetailsPanel(role.name);
    });

    button.on('pointerout', () => {
      // Redraw with original color
      buttonGraphics.clear();
      buttonGraphics.fillStyle(role.color, 0.85);
      buttonGraphics.fillRoundedRect(x - width/2, y - height/2, width, height, radius);
      buttonGraphics.lineStyle(4, role.gradientColor, 1);
      buttonGraphics.strokeRoundedRect(x - width/2, y - height/2, width, height, radius);
      
      this.tweens.add({
        targets: spritePreview,
        scale: 3.5,
        duration: 200
      });
      this.tweens.add({
        targets: [text, levelText],
        scale: 1,
        duration: 200
      });
    });

    button.on('pointerdown', () => {
      // Flash effect
      this.tweens.add({
        targets: buttonGraphics,
        alpha: 0.5,
        duration: 100,
        yoyo: true
      });
      
      gameState.setSelectedRole(role.name);
      // Add and start CharacterCustomizationScene on-demand
      if (!this.scene.get('CharacterCustomizationScene')) {
        this.scene.add('CharacterCustomizationScene', window.sceneClasses['CharacterCustomizationScene'], false);
      }
      this.input.enabled = false;
      this.scene.start('CharacterCustomizationScene', { role: role.name });
    });
  }

  getRoleLevelInfo(role) {
    let level = 1;
    let xp = 0;

    const inMemory = gameState.characters[role]?.leveling;
    if (inMemory) {
      if (Number.isFinite(inMemory.level)) level = Math.max(1, inMemory.level);
      if (Number.isFinite(inMemory.xp)) xp = Math.max(0, inMemory.xp);
    } else {
      const saved = gameState.loadSkillTreeForRole(role);
      if (saved) {
        if (Number.isFinite(saved.level)) level = Math.max(1, saved.level);
        if (Number.isFinite(saved.xp)) xp = Math.max(0, saved.xp);
      }
    }

    const maxIndex = LEVEL_XP.length - 1;
    const safeLevel = Math.min(level, maxIndex);
    const currentThreshold = LEVEL_XP[safeLevel - 1] || 0;
    const nextThreshold = LEVEL_XP[safeLevel] || currentThreshold;
    const span = Math.max(1, nextThreshold - currentThreshold);
    const progress = safeLevel >= maxIndex ? 1 : Phaser.Math.Clamp((xp - currentThreshold) / span, 0, 1);

    return { level, xp, progress };
  }
  
  createDetailsPanel(x, y, panelWidth, panelHeight) {
    const radius = 25;
    const buttonHeight = 140; // Match button height for alignment
    
    // Create rounded rectangle panel using graphics - aligned with button heights
    this.detailsPanelGraphics = this.add.graphics();
    this.detailsPanelGraphics.fillStyle(0x1a1a1a, 0.95);
    this.detailsPanelGraphics.fillRoundedRect(
      x - panelWidth/2, 
      y - buttonHeight/2, 
      panelWidth, 
      panelHeight, 
      radius
    );
    this.detailsPanelGraphics.lineStyle(5, 0xffaa00, 0.8);
    this.detailsPanelGraphics.strokeRoundedRect(
      x - panelWidth/2, 
      y - buttonHeight/2, 
      panelWidth, 
      panelHeight, 
      radius
    );
    this.detailsPanelGraphics.setDepth(1);
    
    // Store dimensions for updates
    this.detailsPanel = {
      x: x,
      y: y,
      width: panelWidth,
      height: panelHeight
    };
    
    // Container for all detail text elements
    this.detailsContainer = this.add.container(x, y - buttonHeight/2 + 20);
    this.detailsContainer.setDepth(2);
    
    // Initialize with first character
    this.updateDetailsPanel('Male');
  }
  
  updateDetailsPanel(characterKey) {
    if (this.currentViewedCharacter === characterKey && this.detailsContainer.list.length > 0) {
      return; // Already showing this character
    }
    
    this.currentViewedCharacter = characterKey;
    const data = this.characterData[characterKey];
    const panelWidth = this.detailsPanel.width;
    
    // Glow effect on panel border
    this.tweens.add({
      targets: this.detailsPanelGraphics,
      alpha: 0.7,
      duration: 200,
      yoyo: true
    });
    
    // Clear existing details
    this.detailsContainer.removeAll(true);
    
    let yOffset = 10;
    const leftMargin = -panelWidth/2 + 20;
    
    // Character name with exciting font - larger
    const nameText = this.add.text(0, yOffset, data.name.toUpperCase(), {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '52px',
      fill: '#ffaa00',
      stroke: '#663300',
      strokeThickness: 4,
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: '#ffcc00',
        blur: 15,
        fill: true
      }
    }).setOrigin(0.5, 0);
    this.detailsContainer.add(nameText);
    yOffset += 58;
    
    const levelInfo = this.getRoleLevelInfo(characterKey);
    const levelLabel = this.add.text(leftMargin, yOffset, `LEVEL ${levelInfo.level}`, {
      fontFamily: 'Arial',
      fontSize: '19px',
      fill: '#ffe08a',
      fontStyle: 'bold'
    }).setOrigin(0, 0);
    this.detailsContainer.add(levelLabel);

    const levelBarWidth = panelWidth - 40;
    const levelBarHeight = 16;
    const levelBarBg = this.add.graphics();
    levelBarBg.fillStyle(0x333333, 0.8);
    levelBarBg.fillRoundedRect(leftMargin, yOffset + 24, levelBarWidth, levelBarHeight, 8);
    this.detailsContainer.add(levelBarBg);

    const levelBarFill = this.add.graphics();
    levelBarFill.fillStyle(0xffc857, 1);
    levelBarFill.fillRoundedRect(leftMargin, yOffset + 24, Math.max(6, levelBarWidth * levelInfo.progress), levelBarHeight, 8);
    this.detailsContainer.add(levelBarFill);
    yOffset += 52;
    
    // Stats header - larger
    const statsHeader = this.add.text(leftMargin, yOffset, '⚡ STATS', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '26px',
      fill: '#ffcc00'
    }).setOrigin(0, 0);
    this.detailsContainer.add(statsHeader);
    yOffset += 32;
    
    // Stats bars with rounded corners - larger
    const stats = [
      { name: 'Damage', value: data.stats.damage, color: 0xff4444 },
      { name: 'Speed', value: data.stats.speed, color: 0x4444ff }
    ];
    
    stats.forEach(stat => {
      // Stat name and value - larger
      const statText = this.add.text(leftMargin, yOffset, `${stat.name}: ${stat.value}`, {
        fontFamily: 'Arial',
        fontSize: '19px',
        fill: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0, 0);
      this.detailsContainer.add(statText);
      
      // Stat bar with rounded corners - larger
      const barWidth = panelWidth - 40;
      const barHeight = 22;
      const barRadius = 11;
      
      // Background bar
      const barBg = this.add.graphics();
      barBg.fillStyle(0x333333, 0.8);
      barBg.fillRoundedRect(leftMargin, yOffset + 22, barWidth, barHeight, barRadius);
      this.detailsContainer.add(barBg);
      
      // Fill bar (normalized to 150 max)
      const fillWidth = Math.max(5, (stat.value / 150) * barWidth);
      const barFill = this.add.graphics();
      barFill.fillStyle(stat.color, 1);
      barFill.fillRoundedRect(leftMargin, yOffset + 22, fillWidth, barHeight, barRadius);
      
      // Add glow effect
      barFill.lineStyle(3, stat.color, 0.5);
      barFill.strokeRoundedRect(leftMargin, yOffset + 22, fillWidth, barHeight, barRadius);
      this.detailsContainer.add(barFill);
      
      yOffset += 48;
    });
    
    yOffset += 10;
    
    // Abilities section - larger
    const abilityHeader = this.add.text(leftMargin, yOffset, '⚔ ABILITIES', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '22px',
      fill: '#66ccff'
    }).setOrigin(0, 0);
    this.detailsContainer.add(abilityHeader);
    yOffset += 28;
    
    const abilityText = this.add.text(leftMargin + 5, yOffset, data.abilities, {
      fontFamily: 'Arial',
      fontSize: '16px',
      fill: '#aaddff',
      wordWrap: { width: panelWidth - 45 }
    }).setOrigin(0, 0);
    this.detailsContainer.add(abilityText);
    yOffset += abilityText.height + 16;
    
    // Enemy Effects section - larger
    const effectsHeader = this.add.text(leftMargin, yOffset, '💥 ENEMY EFFECTS', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '22px',
      fill: '#ff6633'
    }).setOrigin(0, 0);
    this.detailsContainer.add(effectsHeader);
    yOffset += 28;
    
    const effectsText = this.add.text(leftMargin + 5, yOffset, data.enemyEffects, {
      fontFamily: 'Arial',
      fontSize: '16px',
      fill: '#ffaa88',
      wordWrap: { width: panelWidth - 45 }
    }).setOrigin(0, 0);
    this.detailsContainer.add(effectsText);
    yOffset += effectsText.height + 16;
    
    // Pros section - larger
    const prosHeader = this.add.text(leftMargin, yOffset, '✓ PROS', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '22px',
      fill: '#44ff44'
    }).setOrigin(0, 0);
    this.detailsContainer.add(prosHeader);
    yOffset += 28;
    
    data.pros.forEach(pro => {
      const proText = this.add.text(leftMargin + 10, yOffset, `+ ${pro}`, {
        fontFamily: 'Arial',
        fontSize: '16px',
        fill: '#88ff88',
        fontStyle: 'bold'
      }).setOrigin(0, 0);
      this.detailsContainer.add(proText);
      yOffset += 24;
    });
    
    yOffset += 8;
    
    // Cons section - larger
    const consHeader = this.add.text(leftMargin, yOffset, '✗ CONS', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '22px',
      fill: '#ff4444'
    }).setOrigin(0, 0);
    this.detailsContainer.add(consHeader);
    yOffset += 28;
    
    data.cons.forEach(con => {
      const conText = this.add.text(leftMargin + 10, yOffset, `- ${con}`, {
        fontFamily: 'Arial',
        fontSize: '16px',
        fill: '#ff8888'
      }).setOrigin(0, 0);
      this.detailsContainer.add(conText);
      yOffset += 24;
    });
  }

  shutdown() {
    if (this.escBackHandler) {
      this.input.keyboard.off('keydown-ESC', this.escBackHandler);
      this.escBackHandler = null;
    }

    // Clean up all buttons, text, and graphics
    this.buttons.forEach(buttonRef => {
      try {
        if (buttonRef.button && buttonRef.button.destroy) {
          buttonRef.button.destroy();
        }
        if (buttonRef.graphics && buttonRef.graphics.destroy) {
          buttonRef.graphics.destroy();
        }
        if (buttonRef.sprite && buttonRef.sprite.destroy) {
          buttonRef.sprite.destroy();
        }
        buttonRef.texts.forEach(text => {
          if (text && text.destroy) {
            text.destroy();
          }
        });
      } catch(e) {
        console.error('Error cleaning up button:', e);
      }
    });
    this.buttons = [];
    
    // Clean up details panel
    if (this.detailsPanelGraphics && this.detailsPanelGraphics.destroy) {
      this.detailsPanelGraphics.destroy();
    }
    if (this.detailsContainer && this.detailsContainer.destroy) {
      this.detailsContainer.destroy();
    }
    
    // General cleanup
    cleanupScene(this);
  }}