/**
 * GameState
 * Central state machine. Replaces the old `state` object.
 * Patterns:
 *  - Keep all game state here (not scattered in scenes)
 *  - Emit events when state changes so scenes can react
 *  - Use localStorage for persistence
 */
class GameState {
  constructor() {
    this.gameRunning = false;
    this.isPaused = false;
    this.currentScene = null;
    this.selectedRole = null;
    this.character = null;
    this.settings = { soundVolume: 0.5, musicVolume: 0.5, graphicsQuality: 'medium' };
    this._listeners = {};
  }

  /**
   * Update selected role (called from characterSelection scene)
   */
  setSelectedRole(role) {
    this.selectedRole = role;
    this.emit('roleSelected', role);
  }

  /**
   * Initialize character from role
   */
  initCharacter(role) {
    this.character = {
      x: 100,
      y: 100,
      radius: 20,
      role: role,
      hp: 100,
      maxHp: 100,
      speed: 5
    };
    this.emit('characterInitialized', this.character);
  }

  /**
   * Save character to localStorage
   */
  saveCharacter() {
    try {
      localStorage.setItem('chaosCrucibleCharacter', JSON.stringify(this.character));
    } catch (e) {
      console.error('Failed to save character:', e);
    }
  }

  /**
   * Load character from localStorage
   */
  loadCharacter() {
    try {
      const saved = localStorage.getItem('chaosCrucibleCharacter');
      if (saved) {
        this.character = JSON.parse(saved);
        return this.character;
      }
    } catch (e) {
      console.error('Failed to load character:', e);
    }
    return null;
  }

  /**
   * Save settings to localStorage
   */
  saveSettings() {
    try {
      localStorage.setItem('gameSettings', JSON.stringify(this.settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }

  /**
   * Load settings from localStorage
   */
  loadSettings() {
    try {
      const saved = localStorage.getItem('gameSettings');
      if (saved) {
        this.settings = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  }

  /**
   * Event emitter pattern for state changes
   */
  on(event, callback) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(callback);
  }

  off(event, callback) {
    if (this._listeners[event]) {
      this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, ...args) {
    if (this._listeners[event]) {
      this._listeners[event].forEach(cb => cb(...args));
    }
  }
}

export const gameState = new GameState();
