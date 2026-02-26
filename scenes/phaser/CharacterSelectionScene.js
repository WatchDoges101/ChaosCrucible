import { gameState } from '../../services/gameState.js';
import { generateCharacterSprite } from '../../services/spriteGenerator.js';

/**
 * CharacterSelectionScene
 * Phaser version of scenes/characterSelection.js with exciting animations and design
 */
export class CharacterSelectionScene extends Phaser.Scene {
  constructor() {
    console.log('[CONSTRUCTOR] CharacterSelectionScene being instantiated');
    super({ key: 'CharacterSelectionScene', active: false });
    
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

  create() {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;
    
    this.currentViewedCharacter = 'Male';

    // Dark gradient background
    const bg = this.add.rectangle(centerX, centerY, width, height, 0x0a0a0a).setOrigin(0.5);
    
    // Create flame particle emitters for background
    this.createFlameBackground();

    // Title with exciting font and glow
    const title = this.add.text(centerX, 40, '⚔ CHOOSE YOUR CHAMPION ⚔', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '56px',
      fill: '#ffaa00',
      stroke: '#ff4400',
      strokeThickness: 4,
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: '#ff6600',
        blur: 20,
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

    const buttonWidth = 280;
    const buttonHeight = 100;
    const buttonGap = 15;
    const totalHeight = roles.length * buttonHeight + (roles.length - 1) * buttonGap;
    const startY = centerY - totalHeight / 2 + 40;
    
    // Adjusted positions - characters closer to details panel
    const leftColumnX = width * 0.3;
    const detailsPanelX = width * 0.65;

    roles.forEach((role, idx) => {
      const y = startY + idx * (buttonHeight + buttonGap);
      this.createRoleButton(leftColumnX, y, buttonWidth, buttonHeight, role);
    });
    
    // Create details panel on the right, closer to buttons
    this.createDetailsPanel(detailsPanelX, startY, width * 0.32);
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
    buttonGraphics.lineStyle(3, role.gradientColor, 1);
    buttonGraphics.strokeRoundedRect(x - width/2, y - height/2, width, height, radius);
    
    // Create interactive zone for the button
    const button = this.add.zone(x, y, width, height)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(2);

    // Store graphics for later manipulation
    button.graphics = buttonGraphics;
    button.roleData = role;

    // Show sprite preview
    const spriteX = x - width / 2 + 50;
    const spritePreview = generateCharacterSprite(this, role.name, spriteX, y);
    spritePreview.setScale(2.8);
    spritePreview.setDepth(3);
    button.sprite = spritePreview;

    // Role label with exciting font
    const text = this.add.text(x + 20, y - 15, role.label, {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '32px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 5,
        fill: true
      }
    }).setOrigin(0.5);
    text.setDepth(3);
    button.text = text;

    // Tagline
    const charData = this.characterData[role.name];
    const tagline = this.add.text(x + 20, y + 18, charData.description.substring(0, 28) + '...', {
      fontFamily: 'Arial',
      fontSize: '11px',
      fill: '#dddddd',
      fontStyle: 'italic'
    }).setOrigin(0.5);
    tagline.setDepth(3);
    button.tagline = tagline;

    // Hover effects
    button.on('pointerover', () => {
      // Redraw with brighter color and glow
      buttonGraphics.clear();
      buttonGraphics.fillStyle(role.gradientColor, 1);
      buttonGraphics.fillRoundedRect(x - width/2, y - height/2, width, height, radius);
      buttonGraphics.lineStyle(4, 0xffffff, 1);
      buttonGraphics.strokeRoundedRect(x - width/2, y - height/2, width, height, radius);
      
      this.tweens.add({
        targets: [spritePreview, text, tagline],
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
      buttonGraphics.lineStyle(3, role.gradientColor, 1);
      buttonGraphics.strokeRoundedRect(x - width/2, y - height/2, width, height, radius);
      
      this.tweens.add({
        targets: spritePreview,
        scale: 2.8,
        duration: 200
      });
      this.tweens.add({
        targets: [text, tagline],
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
        this.scene.add('CharacterCustomizationScene', window.sceneClasses['CharacterCustomizationScene'], true, { role: role.name });
      } else {
        this.scene.start('CharacterCustomizationScene', { role: role.name });
      }
    });
  }
  
  createDetailsPanel(x, y, panelWidth) {
    const panelHeight = 520;
    const radius = 25;
    
    // Create rounded rectangle panel using graphics
    this.detailsPanelGraphics = this.add.graphics();
    this.detailsPanelGraphics.fillStyle(0x1a1a1a, 0.95);
    this.detailsPanelGraphics.fillRoundedRect(
      x - panelWidth/2, 
      y - 10, 
      panelWidth, 
      panelHeight, 
      radius
    );
    this.detailsPanelGraphics.lineStyle(4, 0xffaa00, 0.8);
    this.detailsPanelGraphics.strokeRoundedRect(
      x - panelWidth/2, 
      y - 10, 
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
    this.detailsContainer = this.add.container(x, y);
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
    
    let yOffset = 5;
    const leftMargin = -panelWidth/2 + 15;
    
    // Character name with exciting font
    const nameText = this.add.text(0, yOffset, data.name.toUpperCase(), {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '36px',
      fill: '#ffaa00',
      stroke: '#663300',
      strokeThickness: 3,
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: '#ffcc00',
        blur: 10,
        fill: true
      }
    }).setOrigin(0.5, 0);
    this.detailsContainer.add(nameText);
    yOffset += 42;
    
    // Description
    const descText = this.add.text(leftMargin, yOffset, data.description, {
      fontFamily: 'Arial',
      fontSize: '13px',
      fill: '#dddddd',
      fontStyle: 'italic',
      wordWrap: { width: panelWidth - 30 }
    }).setOrigin(0, 0);
    this.detailsContainer.add(descText);
    yOffset += 32;
    
    // Stats header
    const statsHeader = this.add.text(leftMargin, yOffset, '⚡ STATS', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '20px',
      fill: '#ffcc00'
    }).setOrigin(0, 0);
    this.detailsContainer.add(statsHeader);
    yOffset += 24;
    
    // Stats bars with rounded corners
    const stats = [
      { name: 'Damage', value: data.stats.damage, color: 0xff4444 },
      { name: 'Health', value: data.stats.health, color: 0x44ff44 },
      { name: 'Speed', value: data.stats.speed, color: 0x4444ff }
    ];
    
    stats.forEach(stat => {
      // Stat name and value
      const statText = this.add.text(leftMargin, yOffset, `${stat.name}: ${stat.value}`, {
        fontFamily: 'Arial',
        fontSize: '14px',
        fill: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0, 0);
      this.detailsContainer.add(statText);
      
      // Stat bar with rounded corners
      const barWidth = panelWidth - 30;
      const barHeight = 14;
      const barRadius = 7;
      
      // Background bar
      const barBg = this.add.graphics();
      barBg.fillStyle(0x333333, 0.8);
      barBg.fillRoundedRect(leftMargin, yOffset + 16, barWidth, barHeight, barRadius);
      this.detailsContainer.add(barBg);
      
      // Fill bar (normalized to 150 max)
      const fillWidth = Math.max(5, (stat.value / 150) * barWidth);
      const barFill = this.add.graphics();
      barFill.fillStyle(stat.color, 1);
      barFill.fillRoundedRect(leftMargin, yOffset + 16, fillWidth, barHeight, barRadius);
      
      // Add glow effect
      barFill.lineStyle(2, stat.color, 0.5);
      barFill.strokeRoundedRect(leftMargin, yOffset + 16, fillWidth, barHeight, barRadius);
      this.detailsContainer.add(barFill);
      
      yOffset += 34;
    });
    
    yOffset += 5;
    
    // Abilities section
    const abilityHeader = this.add.text(leftMargin, yOffset, '⚔ ABILITIES', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '16px',
      fill: '#66ccff'
    }).setOrigin(0, 0);
    this.detailsContainer.add(abilityHeader);
    yOffset += 20;
    
    const abilityText = this.add.text(leftMargin + 5, yOffset, data.abilities, {
      fontFamily: 'Arial',
      fontSize: '12px',
      fill: '#aaddff',
      wordWrap: { width: panelWidth - 35 }
    }).setOrigin(0, 0);
    this.detailsContainer.add(abilityText);
    yOffset += abilityText.height + 12;
    
    // Enemy Effects section
    const effectsHeader = this.add.text(leftMargin, yOffset, '💥 ENEMY EFFECTS', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '16px',
      fill: '#ff6633'
    }).setOrigin(0, 0);
    this.detailsContainer.add(effectsHeader);
    yOffset += 20;
    
    const effectsText = this.add.text(leftMargin + 5, yOffset, data.enemyEffects, {
      fontFamily: 'Arial',
      fontSize: '12px',
      fill: '#ffaa88',
      wordWrap: { width: panelWidth - 35 }
    }).setOrigin(0, 0);
    this.detailsContainer.add(effectsText);
    yOffset += effectsText.height + 12;
    
    // Pros section
    const prosHeader = this.add.text(leftMargin, yOffset, '✓ PROS', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '16px',
      fill: '#44ff44'
    }).setOrigin(0, 0);
    this.detailsContainer.add(prosHeader);
    yOffset += 20;
    
    data.pros.forEach(pro => {
      const proText = this.add.text(leftMargin + 8, yOffset, `+ ${pro}`, {
        fontFamily: 'Arial',
        fontSize: '12px',
        fill: '#88ff88',
        fontStyle: 'bold'
      }).setOrigin(0, 0);
      this.detailsContainer.add(proText);
      yOffset += 18;
    });
    
    yOffset += 4;
    
    // Cons section
    const consHeader = this.add.text(leftMargin, yOffset, '✗ CONS', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '16px',
      fill: '#ff4444'
    }).setOrigin(0, 0);
    this.detailsContainer.add(consHeader);
    yOffset += 20;
    
    data.cons.forEach(con => {
      const conText = this.add.text(leftMargin + 8, yOffset, `- ${con}`, {
        fontFamily: 'Arial',
        fontSize: '12px',
        fill: '#ff8888'
      }).setOrigin(0, 0);
      this.detailsContainer.add(conText);
      yOffset += 18;
    });
  }
}
