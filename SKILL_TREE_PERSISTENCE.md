# Skill Tree Persistence System

## Overview

The Skill Tree Persistence System automatically saves and restores your skill tree progress, ensuring that all your skill unlocks, level-ups, and token spending are preserved between game sessions.

## Architecture

### Components

#### 1. **SkillTreeHandler.js** (`handlers/SkillTreeHandler.js`)
Core persistence manager that handles all skill tree state management.

**Key Features:**
- Auto-save every 5 seconds (configurable)
- Lazy saving (only saves when changes are made)
- Skill unlock/upgrade validation
- Token spending management
- XP tracking and level-up detection

**Main Methods:**

```javascript
// Initialize for a character
skillTreeHandler.init(role)

// Load saved progress
skillTreeHandler.loadSkillTreeProgress(role)

// Save progress
skillTreeHandler.saveSkillTreeProgress(role)

// Unlock a skill (costs tokens)
skillTreeHandler.unlockSkill(role, skillBranch, tokenCost)

// Upgrade a skill level
skillTreeHandler.upgradeSkill(role, skillBranch, tokenCost)

// Add XP and detect level-ups
skillTreeHandler.addXP(role, xpAmount)

// Get current skill tree state
skillTreeHandler.getSkillTreeState(role)

// Force immediate save
skillTreeHandler.forceSave()

// Reset skill tree (for testing)
skillTreeHandler.resetSkillTree(role)
```

#### 2. **Updated GameState** (`services/gameState.js`)
Extended with skill tree persistence methods:

```javascript
// Save all character skill trees at once
gameState.saveAllSkillTrees()

// Save specific role's skill tree
gameState.saveSkillTreeForRole(role)

// Load specific role's skill tree
gameState.loadSkillTreeForRole(role)

// Get skill tree progress
gameState.getSkillTreeProgress(role)
```

#### 3. **Updated SkillTreeScene** (`scenes/phaser/SkillTreeScene.js`)
Integrated handler calls for persistence:

- Auto-loads saved progress on scene creation
- Uses SkillTreeHandler for skill unlocks
- Forces save on scene shutdown
- All skill changes trigger auto-save

#### 4. **Storage Helpers** (`helpers/storageHelpers.js`)
Low-level localStorage wrapper:

```javascript
saveToStorage(key, data)      // Save data to localStorage
loadFromStorage(key, default)  // Load data from localStorage
```

## How It Works

### Save Flow

1. **User Action** → Click to unlock a skill
2. **Validation** → Check tokens, prerequisites, etc.
3. **Update State** → SkillTreeHandler updates gameState
4. **Mark Dirty** → Flag as needing save
5. **Auto-Save Timer** → Every 5 seconds, if dirty, save to localStorage
6. **Persistence** → Data persists across browser sessions

### Load Flow

1. **Scene Creation** → SkillTreeScene calls `skillTreeHandler.init(role)`
2. **Load from Storage** → SkillTreeHandler reads from localStorage
3. **Restore State** → Updates gameState with saved values
4. **Display** → Scene shows restored progress

## Storage Format

Data is saved in localStorage with keys like:

```
skillTreeProgress_male
skillTreeProgress_archer
skillTreeProgress_brute
skillTreeProgress_gunner
```

Each saves:
```json
{
  "role": "male",
  "level": 5,
  "xp": 2500,
  "tokens": 3,
  "pendingXP": 1200,
  "skillTree": {
    "strength": {
      "unlocked": true,
      "level": 2
    }
  },
  "lastSaved": "2026-02-28T12:34:56.789Z"
}
```

## Auto-Save Configuration

The auto-save timer can be configured in `SkillTreeHandler.js`:

```javascript
this.autoSaveInterval = 5000; // 5 seconds (milliseconds)
```

Shorter intervals = more frequent saves (more overhead)
Longer intervals = less overhead (risk of losing recent changes)

## Usage Examples

### In SkillTreeScene

```javascript
import { skillTreeHandler } from '../../handlers/SkillTreeHandler.js';

// Initialize on scene create
skillTreeHandler.init(gameState.selectedRole);

// Unlock a skill
const success = skillTreeHandler.unlockSkill(role, 'skillName', tokenCost);
if (success) {
  // Scene restart or update UI
}

// Add XP from gameplay
skillTreeHandler.addXP(role, 100);

// Force save on shutdown
skillTreeHandler.forceSave();
```

### In ChaossCrucibleScene (Gameplay)

```javascript
import { skillTreeHandler } from '../handlers/SkillTreeHandler.js';

// After defeating an enemy
skillTreeHandler.addXP(gameState.selectedRole, 50);

// Auto-saves the XP after 5 seconds
```

### In MenuScene or other scenes

```javascript
// Get current progress without modifying
const progress = skillTreeHandler.getSkillTreeState(role);
console.log(`${role} is level ${progress.level} with ${progress.tokens} tokens`);
```

## Data Recovery

### Manual Save Triggers

```javascript
// Force immediate save
skillTreeHandler.forceSave()

// Save all characters
gameState.saveAllSkillTrees()
```

### Manual Load

```javascript
// Load saved data for a role
const saved = gameState.loadSkillTreeForRole(role);
if (saved) {
  console.log('Loaded saved progress:', saved);
}
```

### Data Inspection

Browser DevTools → Application → Local Storage → Look for `skillTreeProgress_*` keys

### Nuclear Option (Clear All)

```javascript
// CAUTION: This deletes ALL saved skill tree data
skillTreeHandler.clearAllSavedData()
```

## Console Debugging

Enable console to see detailed persistence logs:

```
[SkillTreeHandler] Loaded progress for male: { level: 5, tokens: 3, xp: 2500 }
[SkillTreeHandler] Saved progress for male
[SkillTreeHandler] Unlocked strength for male. Tokens remaining: 2
[SkillTreeHandler] male leveled up!
```

## Best Practices

1. **Always initialize on scene start**
   ```javascript
   skillTreeHandler.init(gameState.selectedRole);
   ```

2. **Always save on scene shutdown**
   ```javascript
   shutdown() {
     if (this.selectedRole) {
       skillTreeHandler.forceSave();
     }
   }
   ```

3. **Let auto-save work** - Don't force save constantly
   - Handler automatically saves when dirty
   - Prevents excessive I/O

4. **Validate before spending tokens**
   - SkillTreeHandler checks prerequisites
   - Don't bypass validation

5. **Monitor console logs** - Helps diagnose issues

## Troubleshooting

### Progress Not Saving

1. Check browser console for errors
2. Verify `skillTreeProgress_*` keys in localStorage
3. Check that scene shutdown is being called
4. Verify `cleanupScene()` is imported and used

### Progress Not Loading

1. Check if saved data exists in localStorage
2. Verify role name matches (case-sensitive)
3. Check console for JSON parse errors
4. Try `skillTreeHandler.clearAllSavedData()` and restart

### Tokens Not Updating

1. Ensure `unlockSkill()` returns `true`
2. Check token balance before update
3. Verify skill tree structure in `levelingSystem.js`
4. Check that `markDirty()` is being called

## Future Enhancements

Potential improvements to the system:

1. **Cloud Save** - Backend persistence
2. **Export/Import** - Save/load progression files
3. **Undo/Redo** - Revert recent skill changes
4. **Multi-character Sync** - Cross-platform saves
5. **Compression** - Reduce storage size for many characters
6. **Backup** - Automatic backup creation on save

## Testing Persistence

Quick test to verify system is working:

1. Start game and select character
2. Unlock a skill
3. Note the tokens count
4. Refresh the page (F5)
5. Navigate to Skill Tree scene
6. Verify skill is still unlocked and tokens are correct

If this passes, persistence is working correctly!
