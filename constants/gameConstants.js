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
 * Universal Color Palette for UI, Effects, and Game Objects
 * @type {Object}
 */
export const COLOR_PALETTE = {
  // Reds
  RED: 0xff0000,
  DARK_RED: 0x990000,
  LIGHT_RED: 0xff4d4d,
  
  // Greens
  GREEN: 0x00ff00,
  DARK_GREEN: 0x00aa00,
  
  // Blues
  BLUE: 0x0000ff,
  LIGHT_BLUE: 0x66ccff,
  SKY_BLUE: 0x99ccff,
  DARK_BLUE: 0x001a33,
  CYAN: 0x00FFFF,
  SHIELD_BLUE: 0x88ccff,
  
  // Yellows & Golds
  YELLOW: 0xffff00,
  GOLD: 0xd4af37,
  LIGHT_GOLD: 0xffdd55,
  ORANGE: 0xffaa33,
  LIGHT_ORANGE: 0xffaa00,
  MUZZLE_YELLOW: 0xffdd00,
  LIGHT_YELLOW: 0xffee88,
  
  // Whites & Grays
  WHITE: 0xffffff,
  LIGHT_GRAY: 0x999999,
  MEDIUM_GRAY: 0x666666,
  DARK_GRAY: 0x333333,
  DARKER_GRAY: 0x1a1a1a,
  BLACK: 0x000000,
  
  // Special Effects Colors
  FIRE_RING: 0xffcc55,
  FIRE_GLOW: 0xffcc55,
  FIRE_MUZZLE: 0xffcc55,
  BUFF_BAR: 0x00ff00,
  ARC_PRIMARY: 0xffffff,
  ARC_SECONDARY: 0xffcc55
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
  COLOR_PALETTE,
  INPUT_KEYS,
  SCENE_NAMES
};
