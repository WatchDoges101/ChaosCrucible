/**
 * Phaser Game Configuration
 * Central config for the Chaos Crucible game.
 */

export const gameConfig = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1920,
    height: 1080,
    expandParent: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
      enableBody: true
    }
  },
  render: {
    pixelArt: false,
    antialias: true,
    smoothstep: false
  },
  backgroundColor: '#1a1a1a',
  scene: [] // Scenes will be added dynamically
};

/**
 * Game constants
 */
export const GAME_CONSTANTS = {
  WORLD_WIDTH: 2000,
  WORLD_HEIGHT: 2000,
  MOVE_SPEED: 5,
  PLAYER_RADIUS: 20,
  CAMERA_WIDTH: 1920,
  CAMERA_HEIGHT: 1080,
  MAX_ENEMIES: 10,
  ENEMY_SPAWN_INTERVAL: 10
};
