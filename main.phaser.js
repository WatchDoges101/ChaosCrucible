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
import { HostScene } from './scenes/phaser/HostScene.js';
import { gameState } from './services/gameState.js';
import { audioManager } from './services/audioManager.js';

// Add scenes to config
gameConfig.scene = [MenuScene, CharacterSelectionScene, HostScene];

// Create game
const game = new Phaser.Game(gameConfig);

// Global exports for debugging
window.game = game;
window.gameState = gameState;
window.audioManager = audioManager;
window.GAME_CONSTANTS = GAME_CONSTANTS;

console.log('[Chaos Crucible] Phaser game initialized');
console.log('Tips:');
console.log('  - window.gameState to access game state');
console.log('  - window.audioManager to control audio');
console.log('  - window.game.scene.scenes to list active scenes');
