import { gameState } from '../../services/gameState.js';
import { GAME_CONSTANTS } from '../../config/gameConfig.js';
import { generateCharacterSprite, generateEnemySprite, createAnimatedCharacter } from '../../services/spriteGenerator.js';

/**
 * HostScene
 * Phaser version of scenes/host.js
 * Main gameplay scene with enemy spawning, camera, player movement.
 */
export class HostScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HostScene', active: false });
  }

  init() {
    this.isPaused = false;
    this.enemies = [];
    this.camera.setBounds(0, 0, GAME_CONSTANTS.WORLD_WIDTH, GAME_CONSTANTS.WORLD_HEIGHT);
  }

  create() {
    const { WORLD_WIDTH, WORLD_HEIGHT, MOVE_SPEED, PLAYER_RADIUS } = GAME_CONSTANTS;

    // Create world background (tiled pattern)
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x333333, 0.5);
    for (let x = 0; x < WORLD_WIDTH; x += 100) {
      grid.moveTo(x, 0);
      grid.lineTo(x, WORLD_HEIGHT);
    }
    for (let y = 0; y < WORLD_HEIGHT; y += 100) {
      grid.moveTo(0, y);
      grid.lineTo(WORLD_WIDTH, y);
    }
    grid.strokePath();

    // Create player with procedurally generated sprite
    const character = gameState.character;
    this.player = createAnimatedCharacter(this, character.role, character.x, character.y, character.colors);
    this.player.setData('character', character);

    // Follow player with camera
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Input handlers
    this.keys = this.input.keyboard.createCursorKeys();
    this.keys.w = this.input.keyboard.addKey('W');
    this.keys.a = this.input.keyboard.addKey('A');
    this.keys.s = this.input.keyboard.addKey('S');
    this.keys.d = this.input.keyboard.addKey('D');
    this.keys.esc = this.input.keyboard.addKey('ESC');

    this.input.keyboard.on('keydown-ESC', () => this.togglePause());

    // Enemy manager
    this.enemySpawnTimer = 0;
    this.enemySpawnRate = 120; // frames

    // UI layer (stays on screen)
    this.uiLayer = this.add.layer();
    const displayName = character.name ? `${character.name} (${character.role})` : `Role: ${character.role}`;
    this.uiText = this.add.text(10, 10, displayName, {
      font: '16px Arial',
      fill: '#ffffff'
    }).setScrollFactor(0); // Don't scroll with camera
    this.uiLayer.add(this.uiText);
  }

  update(time, delta) {
    if (this.isPaused) return;

    const character = gameState.character;
    const { MOVE_SPEED, WORLD_WIDTH, WORLD_HEIGHT } = GAME_CONSTANTS;

    // Input handling
    let vx = 0, vy = 0;
    if (this.keys.w.isDown) vy -= MOVE_SPEED;
    if (this.keys.s.isDown) vy += MOVE_SPEED;
    if (this.keys.a.isDown) vx -= MOVE_SPEED;
    if (this.keys.d.isDown) vx += MOVE_SPEED;

    // Diagonal normalization
    if (vx !== 0 && vy !== 0) {
      const factor = 1 / Math.sqrt(2);
      vx *= factor;
      vy *= factor;
    }

    // Update character position
    character.x += vx;
    character.y += vy;
    character.x = Math.max(0, Math.min(character.x, WORLD_WIDTH));
    character.y = Math.max(0, Math.min(character.y, WORLD_HEIGHT));

    this.player.x = character.x;
    this.player.y = character.y;

    // Spawn enemies periodically
    this.enemySpawnTimer++;
    if (this.enemySpawnTimer >= this.enemySpawnRate && this.enemies.length < 10) {
      this.spawnEnemy();
      this.enemySpawnTimer = 0;
    }

    // Update enemies
    this.enemies.forEach((enemy, idx) => {
      enemy.x += enemy.vx;
      enemy.y += enemy.vy;

      // Simple bounds wrapping
      if (enemy.x < 0) enemy.vx = 2;
      if (enemy.x > 900) enemy.vx = -2;

      enemy.sprite.x = enemy.x;
      enemy.sprite.y = enemy.y;
    });

    // Update UI
    this.uiText.setText(`Role: ${character.role} | Pos: (${Math.round(character.x)}, ${Math.round(character.y)})`);
  }

  spawnEnemy() {
    const x = 150 + Math.random() * 200;
    const y = 150 + Math.random() * 200;
    
    // Create enemy with procedurally generated sprite
    const sprite = generateEnemySprite(this, x, y, 'slime');
    sprite.setData('hp', 100);

    const enemy = {
      x,
      y,
      vx: 2,
      vy: 0,
      sprite,
      hp: 100,
      direction: 'right'
    };

    this.enemies.push(enemy);
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.showPauseMenu();
    } else {
      this.hidePauseMenu();
    }
  }

  showPauseMenu() {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // Semi-transparent overlay
    const overlay = this.add.rectangle(centerX, centerY, width, height, 0x000000, 0.5)
      .setScrollFactor(0)
      .setDepth(100);

    // Pause text
    this.add.text(centerX, centerY - 100, 'PAUSED', {
      font: '48px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

    // Resume button
    const resumeBtn = this.add.rectangle(centerX, centerY, 200, 60, 0x00aa00, 0.8)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101)
      .setInteractive({ useHandCursor: true });

    this.add.text(centerX, centerY, 'Resume', {
      font: '20px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

    resumeBtn.on('pointerdown', () => this.togglePause());
  }

  hidePauseMenu() {
    // Clear pause UI (in production, store refs to destroy properly)
  }
}
