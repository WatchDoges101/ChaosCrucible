import { LevelingSystem } from './levelingSystem.js';

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
    this.characters = {};
    this.selectedRole = null;
    this.character = null;
    this.score = 0;
    this.settings = { soundVolume: 0.5, musicVolume: 0.5, graphicsQuality: 'medium' };
    this._listeners = {};
  }

  /**
   * Update selected role (called from characterSelection scene)
   */
  setSelectedRole(role) {
    this.selectedRole = role;
    if (!this.characters[role]) {
      this.characters[role] = {
        leveling: new LevelingSystem(role),
        abilities: [],
        // Add other character-specific state here
      };
    }
    this.character = {
      ...this.characters[role],
      role: role,
      name: role,
      hp: 100,
      maxHp: 100,
      speed: 5,
      // Add other fields as needed
    };
    this.emit('roleSelected', role);
  }

  /**
   * Initialize character from role
   */
  initCharacter(role, name = null, colors = null) {
    this.character = {
      x: 100,
      y: 100,
      radius: 20,
      role: role,
      name: name || role,
      colors: colors || null,
      hp: 100,
      maxHp: 100,
      speed: 5,
      abilities: [],
      leveling: new LevelingSystem()
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
   * Add points to the score
   */
  addScore(points) {
    this.score += points;
    this.emit('scoreChanged', this.score);
  }

  /**
   * Reset score (for a new game)
   */
  resetScore() {
    this.score = 0;
    this.emit('scoreChanged', this.score);
  }

  /**
   * Save high score to localStorage
   */
  saveHighScore() {
    try {
      const saved = localStorage.getItem('gameHighScore');
      const highScore = saved ? parseInt(saved) : 0;
      if (this.score > highScore) {
        localStorage.setItem('gameHighScore', this.score.toString());
        this.emit('newHighScore', this.score);
      }
    } catch (e) {
      console.error('Failed to save high score:', e);
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

  /**
   * Save all character skill trees
   */
  saveAllSkillTrees() {
    try {
      Object.keys(this.characters).forEach(role => {
        this.saveSkillTreeForRole(role);
      });
      return true;
    } catch (e) {
      console.error('Failed to save all skill trees:', e);
      return false;
    }
  }

  /**
   * Save skill tree for specific role
   */
  saveSkillTreeForRole(role) {
    try {
      if (this.characters[role]) {
        const leveling = this.characters[role].leveling;
        const skillTreeData = {
          role: role,
          level: leveling.level,
          xp: leveling.xp,
          tokens: leveling.tokens,
          pendingXP: leveling.pendingXP || 0,
          skillTree: leveling.skillTree,
          savedAt: new Date().toISOString()
        };
        localStorage.setItem(`skillTree_${role}`, JSON.stringify(skillTreeData));
        return true;
      }
    } catch (e) {
      console.error(`Failed to save skill tree for ${role}:`, e);
    }
    return false;
  }

  /**
   * Load skill tree for specific role
   */
  loadSkillTreeForRole(role) {
    try {
      const saved = localStorage.getItem(`skillTree_${role}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(`Failed to load skill tree for ${role}:`, e);
    }
    return null;
  }

  /**
   * Get skill tree progress for role
   */
  getSkillTreeProgress(role) {
    if (!this.characters[role]) {
      return null;
    }
    const leveling = this.characters[role].leveling;
    return {
      level: leveling.level,
      xp: leveling.xp,
      tokens: leveling.tokens,
      skillTree: leveling.skillTree
    };
  }
}

export const gameState = new GameState();
