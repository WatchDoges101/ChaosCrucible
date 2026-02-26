/**
 * Game Configuration Constants
 * 
 * Central location for all game configuration constants.
 * These values control gameplay mechanics, dimensions, and timing.
 * 
 * @module constants/gameConstants
 */

/**
 * World and Arena Dimensions
 * @type {Object}
 */
export const ARENA_DIMENSIONS = {
  WORLD_WIDTH: 2000,
  WORLD_HEIGHT: 2000,
  ARENA_WIDTH: 5000,
  ARENA_HEIGHT: 5000,
  ARENA_PADDING: 200
};

/**
 * Camera and Viewport Settings
 * @type {Object}
 */
export const CAMERA_SETTINGS = {
  WIDTH: 1920,
  HEIGHT: 1080,
  ZOOM_SCALE: 1.5
};

/**
 * Player and Character Settings
 * @type {Object}
 */
export const PLAYER_SETTINGS = {
  RADIUS: 20,
  BASE_SPEED: 5,
  BASE_HP: 100,
  PLAYER_START_X: 100,
  PLAYER_START_Y: 100
};

/**
 * Enemy Settings
 * @type {Object}
 */
export const ENEMY_SETTINGS = {
  MAX_ENEMIES: 10,
  SPAWN_INTERVAL: 10,
  BASE_HEALTH: 50,
  BASE_SPEED: 3,
  DETECTION_RANGE: 300,
  ATTACK_RANGE: 100,
  ATTACK_COOLDOWN: 1500
};

/**
 * Damage and Combat Settings
 * @type {Object}
 */
export const COMBAT_SETTINGS = {
  PLAYER_DAMAGE_COOLDOWN: 500,
  LAVA_DAMAGE_COOLDOWN: 500,
  LAVA_DAMAGE_PER_TICK: 10,
  BASIC_ATTACK_DAMAGE: 15,
  ABILITY_DAMAGE: 30
};

/**
 * UI and Visual Settings
 * @type {Object}
 */
export const UI_SETTINGS = {
  BUTTON_WIDTH: 350,
  BUTTON_HEIGHT: 90,
  BUTTON_GAP: 30,
  FONT_PRIMARY: 'bold 96px Impact',
  FONT_SECONDARY: 'bold 32px Arial'
};

/**
 * Audio Settings
 * @type {Object}
 */
export const AUDIO_SETTINGS = {
  MASTER_VOLUME: 1.0,
  SFX_VOLUME: 1.0,
  MUSIC_VOLUME: 0.6,
  VOICE_VOLUME: 1.0
};

/**
 * Game States
 * @type {Object}
 */
export const GAME_STATES = {
  MENU: 'MENU',
  CHARACTER_SELECT: 'CHARACTER_SELECT',
  CHARACTER_CUSTOMIZE: 'CHARACTER_CUSTOMIZE',
  GAMEPLAY: 'GAMEPLAY',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER',
  OPTIONS: 'OPTIONS'
};

/**
 * Character Roles and Their Properties
 * @type {Object}
 */
export const CHARACTER_ROLES = {
  MALE: 'Male',
  ARCHER: 'archer',
  BRUTE: 'brute',
  GUNNER: 'gunner'
};

/**
 * Color Palettes for Characters
 * @type {Object}
 */
export const CHARACTER_COLORS = {
  Male: {
    primary: 0x2c3e50,
    secondary: 0x3498db,
    accent: 0x95a5a6,
    skin: 0xf4a460
  },
  archer: {
    primary: 0x27ae60,
    secondary: 0xf39c12,
    accent: 0x95a5a6,
    skin: 0xf4a460
  },
  brute: {
    primary: 0x8b4513,
    secondary: 0x7f3f00,
    accent: 0xb8860b,
    skin: 0xf4a460
  },
  gunner: {
    primary: 0x34495e,
    secondary: 0xec7063,
    accent: 0x2c3e50,
    skin: 0xf4a460
  }
};

/**
 * Input Keys and Controls
 * @type {Object}
 */
export const INPUT_KEYS = {
  MOVE_UP: 'W',
  MOVE_DOWN: 'S',
  MOVE_LEFT: 'A',
  MOVE_RIGHT: 'D',
  BASIC_ATTACK: 'SPACE',
  ABILITY_1: 'Q',
  ABILITY_2: 'E',
  PAUSE: 'P',
  INTERACT: 'F'
};

/**
 * Scene Names
 * @type {Object}
 */
export const SCENE_NAMES = {
  MENU: 'MenuScene',
  CHARACTER_SELECT: 'CharacterSelectionScene',
  CHARACTER_CUSTOMIZE: 'CharacterCustomizationScene',
  MAIN_GAME: 'ChaossCrucibleScene',
  HOST: 'HostScene',
  OPTIONS: 'OptionsScene',
  ENEMY_WIKI: 'EnemyWikiScene'
};

export default {
  ARENA_DIMENSIONS,
  CAMERA_SETTINGS,
  PLAYER_SETTINGS,
  ENEMY_SETTINGS,
  COMBAT_SETTINGS,
  UI_SETTINGS,
  AUDIO_SETTINGS,
  GAME_STATES,
  CHARACTER_ROLES,
  CHARACTER_COLORS,
  INPUT_KEYS,
  SCENE_NAMES
};
