/**
 * Skill Tree Handler
 * 
 * Manages skill tree progression, persistence, and state management.
 * Handles auto-saving of skill tree progress to localStorage.
 * Validates skill unlocks and manages token/XP spending.
 * 
 * @module handlers/SkillTreeHandler
 */

import { gameState } from '../services/gameState.js';
import { saveToStorage, loadFromStorage } from '../helpers/storageHelpers.js';

export class SkillTreeHandler {
  constructor() {
    this.storageKey = 'skillTreeProgress';
    this.autoSaveInterval = 5000; // Auto-save every 5 seconds
    this.isDirty = false; // Track if changes need saving
    this.autoSaveTimer = null;
  }

  mergeSkillTreeState(targetTree, savedTree) {
    if (!targetTree || !savedTree) {
      return;
    }

    Object.keys(savedTree).forEach((key) => {
      if (!targetTree[key]) {
        return;
      }

      const targetNode = targetTree[key];
      const savedNode = savedTree[key];

      targetNode.unlocked = Boolean(savedNode.unlocked);
      targetNode.level = savedNode.level || 0;

      if (targetNode.children && savedNode.children) {
        this.mergeSkillTreeState(targetNode.children, savedNode.children);
      }
    });
  }

  serializeSkillTree(skillTree) {
    const serialized = {};
    if (!skillTree) {
      return serialized;
    }

    Object.keys(skillTree).forEach((key) => {
      const node = skillTree[key];
      serialized[key] = {
        unlocked: Boolean(node.unlocked),
        level: node.level || 0,
        children: this.serializeSkillTree(node.children)
      };
    });

    return serialized;
  }

  resetSkillTreeState(skillTree) {
    if (!skillTree) {
      return;
    }

    Object.keys(skillTree).forEach((key) => {
      const node = skillTree[key];
      node.unlocked = false;
      node.level = 0;
      if (node.children) {
        this.resetSkillTreeState(node.children);
      }
    });
  }

  /**
   * Initialize skill tree handler for a character
   * @param {string} role - Character role
   */
  init(role) {
    this.currentRole = role;
    this.loadSkillTreeProgress(role);
    this.startAutoSave();
  }

  /**
   * Load saved skill tree progress from localStorage
   * @param {string} role - Character role
   * @returns {Object} Loaded progress or null
   */
  loadSkillTreeProgress(role) {
    try {
      const savedData = loadFromStorage(`${this.storageKey}_${role}`);
      if (savedData && gameState.characters[role]) {
        const leveling = gameState.characters[role].leveling;
        
        // Restore unlocked skills (including nested child nodes)
        if (savedData.skillTree) {
          this.mergeSkillTreeState(leveling.skillTree, savedData.skillTree);
        }

        // Restore tokens and XP
        if (savedData.tokens !== undefined) {
          leveling.tokens = savedData.tokens;
        }
        if (savedData.pendingXP !== undefined) {
          leveling.pendingXP = savedData.pendingXP;
        }
        if (savedData.level !== undefined) {
          leveling.level = savedData.level;
        }
        if (savedData.xp !== undefined) {
          leveling.xp = savedData.xp;
        }

        console.log(`[SkillTreeHandler] Loaded progress for ${role}:`, {
          level: leveling.level,
          tokens: leveling.tokens,
          xp: leveling.xp
        });
        return savedData;
      }
    } catch (error) {
      console.error(`[SkillTreeHandler] Failed to load skill tree progress for ${role}:`, error);
    }
    return null;
  }

  /**
   * Save skill tree progress to localStorage
   * @param {string} role - Character role
   * @returns {boolean} Success status
   */
  saveSkillTreeProgress(role = this.currentRole) {
    if (!role || !gameState.characters[role]) {
      return false;
    }

    try {
      const leveling = gameState.characters[role].leveling;
      const dataToSave = {
        role: role,
        level: leveling.level,
        xp: leveling.xp,
        tokens: leveling.tokens,
        pendingXP: leveling.pendingXP || 0,
        skillTree: {},
        lastSaved: new Date().toISOString()
      };

      // Save skill tree state (including nested child nodes)
      dataToSave.skillTree = this.serializeSkillTree(leveling.skillTree);

      const success = saveToStorage(`${this.storageKey}_${role}`, dataToSave);
      if (success) {
        console.log(`[SkillTreeHandler] Saved progress for ${role}`);
        this.isDirty = false;
      }
      return success;
    } catch (error) {
      console.error(`[SkillTreeHandler] Failed to save skill tree progress for ${role}:`, error);
      return false;
    }
  }

  /**
   * Unlock a skill node (costs tokens)
   * @param {string} role - Character role
   * @param {string} skillBranch - Branch name
   * @param {number} cost - Token cost
   * @returns {boolean} Success status
   */
  unlockSkill(role, skillBranch, cost = 1) {
    if (!gameState.characters[role]) {
      console.warn(`[SkillTreeHandler] Invalid role: ${role}`);
      return false;
    }

    const leveling = gameState.characters[role].leveling;
    const skillNode = leveling.skillTree[skillBranch];

    if (!skillNode) {
      console.warn(`[SkillTreeHandler] Skill not found: ${skillBranch}`);
      return false;
    }

    if (skillNode.unlocked) {
      console.warn(`[SkillTreeHandler] Skill already unlocked: ${skillBranch}`);
      return false;
    }

    if (leveling.tokens < cost) {
      console.warn(`[SkillTreeHandler] Insufficient tokens. Need ${cost}, have ${leveling.tokens}`);
      return false;
    }

    // Unlock skill and spend tokens
    skillNode.unlocked = true;
    leveling.tokens -= cost;
    this.markDirty();

    console.log(`[SkillTreeHandler] Unlocked ${skillBranch} for ${role}. Tokens remaining: ${leveling.tokens}`);
    return true;
  }

  /**
   * Upgrade a skill (increase its level)
   * @param {string} role - Character role
   * @param {string} skillBranch - Branch name
   * @param {number} cost - Token cost per level
   * @returns {boolean} Success status
   */
  upgradeSkill(role, skillBranch, cost = 1) {
    if (!gameState.characters[role]) {
      console.warn(`[SkillTreeHandler] Invalid role: ${role}`);
      return false;
    }

    const leveling = gameState.characters[role].leveling;
    const skillNode = leveling.skillTree[skillBranch];

    if (!skillNode) {
      console.warn(`[SkillTreeHandler] Skill not found: ${skillBranch}`);
      return false;
    }

    if (!skillNode.unlocked) {
      console.warn(`[SkillTreeHandler] Skill not unlocked: ${skillBranch}`);
      return false;
    }

    if (leveling.tokens < cost) {
      console.warn(`[SkillTreeHandler] Insufficient tokens for upgrade`);
      return false;
    }

    // Upgrade skill and spend tokens
    skillNode.level = (skillNode.level || 0) + 1;
    leveling.tokens -= cost;
    this.markDirty();

    console.log(`[SkillTreeHandler] Upgraded ${skillBranch} to level ${skillNode.level} for ${role}`);
    return true;
  }

  /**
   * Add XP and handle level ups
   * @param {string} role - Character role
   * @param {number} xpAmount - XP to add
   * @returns {Object} Level up info or null if no level up
   */
  addXP(role, xpAmount) {
    if (!gameState.characters[role]) {
      return null;
    }

    const leveling = gameState.characters[role].leveling;
    leveling.xp += xpAmount;
    this.markDirty();

    // Check for level ups
    const levelUpInfo = leveling.updateLevel();
    if (levelUpInfo) {
      console.log(`[SkillTreeHandler] ${role} leveled up!`, levelUpInfo);
    }

    return levelUpInfo;
  }

  /**
   * Mark data as dirty (needs saving)
   */
  markDirty() {
    this.isDirty = true;
  }

  /**
   * Start auto-save timer
   */
  startAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    this.autoSaveTimer = setInterval(() => {
      if (this.isDirty && this.currentRole) {
        this.saveSkillTreeProgress(this.currentRole);
      }
    }, this.autoSaveInterval);
  }

  /**
   * Stop auto-save timer
   */
  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * Force immediate save
   */
  forceSave() {
    if (this.currentRole) {
      return this.saveSkillTreeProgress(this.currentRole);
    }
    return false;
  }

  /**
   * Get skill tree state
   * @param {string} role - Character role
   * @returns {Object} Skill tree data
   */
  getSkillTreeState(role) {
    if (!gameState.characters[role]) {
      return null;
    }

    const leveling = gameState.characters[role].leveling;
    return {
      level: leveling.level,
      xp: leveling.xp,
      tokens: leveling.tokens,
      pendingXP: leveling.pendingXP || 0,
      skillTree: leveling.skillTree,
      totalSpent: leveling.totalTokensSpent || 0
    };
  }

  /**
   * Get leveling data (for display in UI)
   * @param {string} role - Character role
   * @returns {Object} Leveling data with level, xp, tokens
   */
  getLevelingData(role) {
    if (!gameState.characters[role]) {
      return { level: 0, xp: 0, tokens: 0 };
    }

    const leveling = gameState.characters[role].leveling;
    return {
      level: leveling.level,
      xp: leveling.xp,
      tokens: leveling.tokens,
      pendingXP: leveling.pendingXP || 0
    };
  }

  /**
   * Get skill tree data (for display in UI)
   * @param {string} role - Character role
   * @returns {Object} Complete skill tree structure
   */
  getSkillTree(role) {
    if (!gameState.characters[role]) {
      return {};
    }

    return gameState.characters[role].leveling.skillTree || {};
  }

  /**
   * Reset skill tree for a role (for testing)
   * @param {string} role - Character role
   */
  resetSkillTree(role) {
    if (gameState.characters[role]) {
      const leveling = gameState.characters[role].leveling;
      
      // Reset all skills to locked (including nested child nodes)
      this.resetSkillTreeState(leveling.skillTree);

      leveling.tokens = 0;
      leveling.level = 1;
      leveling.xp = 0;
      leveling.pendingXP = 0;

      this.markDirty();
      this.saveSkillTreeProgress(role);
      
      console.log(`[SkillTreeHandler] Reset skill tree for ${role}`);
    }
  }

  /**
   * Clear all saved skill tree data (nuclear option)
   */
  clearAllSavedData() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storageKey)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(`[SkillTreeHandler] Cleared ${keysToRemove.length} saved skill tree records`);
      return true;
    } catch (error) {
      console.error('[SkillTreeHandler] Failed to clear saved data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const skillTreeHandler = new SkillTreeHandler();
