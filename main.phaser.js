/**
 * Chaos Crucible - Phaser Bootstrap
 * 
 * This is the Phaser-based version of main.js.
 * Old canvas-based entry point backed up in main.canvas.js
 * 
 * To use this:
 *   1. npm install
 *   2. npm run dev (uses Vite)
 *   3. Load http://localhost:3000
 */

import Phaser from 'phaser';
import { gameConfig, GAME_CONSTANTS } from './config/gameConfig.js';
import { MenuScene } from './scenes/phaser/MenuScene.js';
import { CharacterSelectionScene } from './scenes/phaser/CharacterSelectionScene.js';
import { CharacterCustomizationScene } from './scenes/phaser/CharacterCustomizationScene.js';
import { ChaossCrucibleScene } from './scenes/phaser/ChaossCrucibleScene.js';
import { HostScene } from './scenes/phaser/HostScene.js';
import { OptionsScene } from './scenes/phaser/OptionsScene.js';
import { EnemyWikiScene } from './scenes/phaser/EnemyWikiScene.js';
import { gameState } from './services/gameState.js';
import { audioManager } from './services/audioManager.js';
import { generateCharacterSprite, generateEnemySprite, createAnimatedCharacter, createAnimatedCharacterWithViews } from './services/spriteGenerator.js';

// Add ONLY MenuScene to config initially - others will be added dynamically when needed
gameConfig.scene = [MenuScene];

// Create game
const game = new Phaser.Game(gameConfig);

// Store scene classes for lazy loading
window.sceneClasses = {
  'CharacterSelectionScene': CharacterSelectionScene,
  'CharacterCustomizationScene': CharacterCustomizationScene,
  'ChaossCrucibleScene': ChaossCrucibleScene,
  'HostScene': HostScene,
  'OptionsScene': OptionsScene,
  'EnemyWikiScene': EnemyWikiScene
};

// Global exports for debugging
window.game = game;
window.gameState = gameState;
window.audioManager = audioManager;
window.GAME_CONSTANTS = GAME_CONSTANTS;
window.generateCharacterSprite = generateCharacterSprite;
window.generateEnemySprite = generateEnemySprite;
window.createAnimatedCharacter = createAnimatedCharacter;
window.createAnimatedCharacterWithViews = createAnimatedCharacterWithViews;

console.log('[Chaos Crucible] Phaser game initialized');
console.log('Tips:');
console.log('  - window.gameState to access game state');
console.log('  - window.audioManager to control audio');
console.log('  - window.game.scene.scenes to list active scenes');
console.log('  - window.generateCharacterSprite(scene, role, x, y) to create sprites');
console.log('  - window.generateEnemySprite(scene, x, y) to create enemies');
