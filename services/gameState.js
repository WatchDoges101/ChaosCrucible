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

  mergeSkillTreeState(targetTree, savedTree) {
    if (!targetTree || !savedTree || typeof targetTree !== 'object' || typeof savedTree !== 'object') {
      return;
    }

    Object.keys(savedTree).forEach((key) => {
      if (!targetTree[key]) {
        return;
      }

      const targetNode = targetTree[key];
      const savedNode = savedTree[key];

      targetNode.unlocked = Boolean(savedNode.unlocked);
      if (Number.isFinite(savedNode.level)) {
        targetNode.level = savedNode.level;
      }

      if (targetNode.children && savedNode.children) {
        this.mergeSkillTreeState(targetNode.children, savedNode.children);
      }
    });
  }

  normalizeRole(role) {
    if (!role || typeof role !== 'string') return null;
    const trimmed = role.trim();
    if (!trimmed) return null;

    const upper = trimmed.toUpperCase();
    if (upper === 'WARRIOR' || upper === 'MALE') return 'Male';
    if (upper === 'ARCHER') return 'archer';
    if (upper === 'BRUTE') return 'brute';
    if (upper === 'GUNNER') return 'gunner';

    return trimmed;
  }

  /**
   * Update selected role (called from characterSelection scene)
   */
  setSelectedRole(role) {
    role = this.normalizeRole(role);
    if (!role) {
      return;
    }

    this.selectedRole = role;
    if (!this.characters[role]) {
      this.characters[role] = {
        leveling: new LevelingSystem(role),
        abilities: [],
        // Add other character-specific state here
      };
    }

		this.restoreLevelingProgressForRole(role);

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
   * Restore saved leveling/skill tree data for a role
   * @param {string} role - Character role key
   */
  restoreLevelingProgressForRole(role) {
    role = this.normalizeRole(role);
    if (!role || !this.characters[role]) {
      return false;
    }

    const savedData = this.loadSkillTreeForRole(role);
    if (!savedData) {
      return false;
    }

    const leveling = this.characters[role].leveling;
    if (!leveling) {
      return false;
    }

    if (Number.isFinite(savedData.level) && savedData.level >= 1) {
      leveling.level = savedData.level;
    }

    if (Number.isFinite(savedData.xp) && savedData.xp >= 0) {
      leveling.xp = savedData.xp;
    }

    if (Number.isFinite(savedData.tokens) && savedData.tokens >= 0) {
      leveling.tokens = savedData.tokens;
    }

    if (Number.isFinite(savedData.pendingXP) && savedData.pendingXP >= 0) {
      leveling.pendingXP = savedData.pendingXP;
    }

    if (savedData.skillTree && typeof savedData.skillTree === 'object') {
      this.mergeSkillTreeState(leveling.skillTree, savedData.skillTree);
    }

    return true;
  }

  /**
   * Initialize character from role
   */
  initCharacter(role, name = null, colors = null) {
    const preferredName = this.getPreferredName(role, role);
    const resolvedName = (typeof name === 'string' && name.trim()) ? name.trim() : preferredName;

    this.character = {
      x: 100,
      y: 100,
      radius: 20,
      role: role,
      name: resolvedName,
      colors: colors || null,
      hp: 100,
      maxHp: 100,
      speed: 5,
      abilities: [],
      leveling: new LevelingSystem()
    };
    this.savePreferredName(role, resolvedName);
    this.saveCharacter();
    this.emit('characterInitialized', this.character);
  }

  /**
   * Save preferred character name for a role
   * @param {string} role - Character role
   * @param {string} name - Player-chosen name
   */
  savePreferredName(role, name) {
    role = this.normalizeRole(role);
    if (!role || typeof role !== 'string') return;
    if (!name || typeof name !== 'string') return;

    try {
      localStorage.setItem(`preferredName_${role}`, name.trim());
    } catch (e) {
      console.error('Failed to save preferred name:', e);
    }
  }

  /**
   * Load preferred character name for a role
   * @param {string} role - Character role
   * @param {string} fallback - Fallback name if no saved name exists
   * @returns {string}
   */
  getPreferredName(role, fallback = 'WARRIOR') {
    role = this.normalizeRole(role);
    try {
      let saved = localStorage.getItem(`preferredName_${role}`);
      if (!saved && role === 'Male') {
        saved = localStorage.getItem('preferredName_WARRIOR');
      }
      if (saved && typeof saved === 'string' && saved.trim()) {
        return saved.trim();
      }
    } catch (e) {
      console.error('Failed to load preferred name:', e);
    }

    return fallback;
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
    role = this.normalizeRole(role);
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
    role = this.normalizeRole(role);
    try {
      let saved = localStorage.getItem(`skillTree_${role}`);
      if (!saved && role === 'Male') {
        const legacy = localStorage.getItem('skillTree_WARRIOR');
        if (legacy) {
          localStorage.setItem('skillTree_Male', legacy);
          saved = legacy;
        }
      }
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
    role = this.normalizeRole(role);
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

  /**
   * Unlock a skill and persist to storage
   * @param {string|Array} skillPath - Path to skill (e.g., "strength" or ["strength", "children", "power"])
   */
  unlockSkill(skillPath) {
    if (!this.selectedRole || !this.characters[this.selectedRole]) {
      return false;
    }

    const leveling = this.characters[this.selectedRole].leveling;

    try {
      if (typeof leveling.unlockSkill === 'function') {
        const unlocked = leveling.unlockSkill(skillPath);
        if (!unlocked) {
          return false;
        }

        this.saveSkillTreeForRole(this.selectedRole);
        return true;
      }
    } catch (e) {
      console.error('Failed to unlock skill:', e);
    }
    
    return false;
  }

  /**
   * Add XP to a role, process level-ups, and persist progress immediately
   * @param {number} amount - XP amount to award
   * @param {string} role - Optional role override (defaults to selectedRole)
   * @returns {{role:string, amount:number, level:number, levelsGained:number, xp:number, tokens:number}|null}
   */
  addXP(amount, role = this.selectedRole) {
    if (!Number.isFinite(amount) || amount <= 0) {
      return null;
    }

    role = this.normalizeRole(role);
    if (!role) {
      return null;
    }

    if (!this.characters[role]) {
      this.characters[role] = {
        leveling: new LevelingSystem(role),
        abilities: []
      };
    }

    const leveling = this.characters[role].leveling;
    const previousLevel = leveling.level;
    leveling.addXP(amount);
    const levelsGained = leveling.level - previousLevel;

    this.saveSkillTreeForRole(role);

    const payload = {
      role,
      amount,
      level: leveling.level,
      levelsGained,
      xp: leveling.xp,
      tokens: leveling.tokens
    };

    this.emit('xpChanged', payload);
    if (levelsGained > 0) {
      this.emit('levelUp', payload);
    }

    return payload;
  }
}

export const gameState = new GameState();
