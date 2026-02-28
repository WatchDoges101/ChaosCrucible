# Code Quality & Optimization Guide

## Purpose
This document outlines best practices, completed improvements, and recommendations for maintaining maximum efficiency and readability in the Chaos Crucible codebase.

---

## ✅ Completed Improvements

### 1. Debug Statement Removal
**Status**: ✅ COMPLETED
**Files Modified**: 2
- `scenes/phaser/ChaossCrucibleScene.js` (3 statements removed)
- `scenes/phaser/CharacterSelectionScene.js` (1 statement removed)

**Impact**: Cleaner production builds, no dev noise in console

### 2. Color Palette Centralization
**Status**: ✅ COMPLETED  
**File Modified**: `constants/gameConstants.js`

**Added**: `COLOR_PALETTE` object with 30+ named colors
```javascript
COLOR_PALETTE = {
  RED: 0xff0000,
  DARK_RED: 0x990000,
  LIGHT_RED: 0xff4d4d,
  // ... and 27 more
}
```

**Benefits**:
- Single source of truth for all colors
- Easy to implement dark mode or theme changes
- Improved readability (COLOR_PALETTE.RED vs 0xff0000)
- Consistent naming convention

### 3. Animation Configuration Constants
**Status**: ✅ COMPLETED
**File Created**: `constants/animationConstants.js`

**Includes**:
- IDLE_ANIMATIONS: Breathing, arm, weapon animations
- COMBAT_ANIMATIONS: Impact, arc, damage flash effects
- ENEMY_ANIMATIONS: Bob, attack telegraph
- UI_ANIMATIONS: Float damage, points, buttons, notifications
- PARTICLE_ANIMATIONS: Burst, wave effects

**Benefits**:
- Centralized animation timings for consistency
- Easy to adjust game feel globally
- Better code documentation
- Reduces magic numbers scattered throughout code

### 4. Animation Helper Function
**Status**: ✅ COMPLETED
**File Modified**: `helpers/animationHelpers.js`

**Added Function**: `createIdleLimbAnimations(scene, spriteGroup, config)`

**Before** (42 lines of duplicated code):
```javascript
if (this.player.frontSprite.leftArm) {
  this.tweens.add({ targets: this.player.frontSprite.leftArm, rotation: -0.5, ... });
}
if (this.player.frontSprite.rightArm) {
  this.tweens.add({ targets: this.player.frontSprite.rightArm, rotation: 0.5, ... });
}
// ... repeated for back sprite and more limbs
```

**After** (2 lines per sprite):
```javascript
createIdleLimbAnimations(this, this.player.frontSprite);
createIdleLimbAnimations(this, this.player.backSprite);
```

**Impact**: Reduced duplicate code, improved maintainability, easier to tweak animation behavior

---

## 🎯 Recommended Next Steps

### High Priority (1-2 hours)

#### 1. Update ChaossCrucibleScene to Use New Constants
**File**: `scenes/phaser/ChaossCrucibleScene.js`

**Action**: Import and replace hardcoded values
```javascript
import { COLOR_PALETTE, IDLE_ANIMATIONS } from '../constants/gameConstants.js';
import { IDLE_ANIMATIONS } from '../constants/animationConstants.js';
import { createIdleLimbAnimations } from '../helpers/animationHelpers.js';
```

**Locations to Update**:
- Line 17-25: Import statements (add new imports)
- Lines 190-250: Limb/weapon animations → use `createIdleLimbAnimations()`
- Lines 328+: Replace `0xff0000` with `COLOR_PALETTE.RED`
- Lines 345+: Replace `0x990000` with `COLOR_PALETTE.DARK_RED`
- Lines 380+: Replace color values with named constants

**Estimated Time**: 45 minutes
**Impact**: Major readability improvement, easier color/animation adjustments

#### 2. Extract Arena Creation to Handler/Helper
**Current**: Arena setup scattered in create() method
**Proposal**: Create `ArenaHandler.js` 

**Would Include**:
- Arena border creation
- Lava setup
- Terrain generation
- Structure placement

**Benefits**: 
- Reduce ChaossCrucibleScene by ~300 lines
- Reusable arena generation
- Better testability

**Estimated Time**: 90 minutes
**Impact**: Scene length reduction, improved separation of concerns

### Medium Priority (2-4 hours)

#### 3. Replace Math.random() Usage with Utilities
**Status**: 232 instances found
**Action**: Use `Phaser.Math.Between()` and `Phaser.Math.FloatBetween()`

**Example**:
```javascript
// Before
const randomDamage = baseDamage + Math.random() * 10;

// After
const randomDamage = baseDamage + Phaser.Math.Between(0, 10);
```

**File**: Consider creating `src/helpers/randomHelpers.js` with:
- `getRandomEnemy(distribution)` - Weighted random selection
- `getRandomSpawnPoint(arena)` - Safe spawn locations
- `getRandomEntityVariation()` - Stat variations

**Estimated Time**: 120 minutes
**Impact**: Better randomness quality, easier to control RNG for testing

#### 4. Optimize EnemySpawnHandler Distribution Logic
**File**: `handlers/EnemySpawnHandler.js` (lines 114-124)

**Current Pattern**:
```javascript
const rand = Math.random();
if (rand < 0.10) type = 'skeleton';
else if (rand < 0.20) type = 'devil';
// ... repeated 6 times
```

**Improved Pattern**:
```javascript
const distribution = [
  { type: 'skeleton', weight: 0.10 },
  { type: 'devil', weight: 0.10 },
  // ... all 6
];

type = selectFromWeightedDistribution(distribution);
```

**Benefits**: 
- Easier to balance spawn rates
- More scalable if adding enemies
- Clearer intent

**Estimated Time**: 30 minutes
**Impact**: Better code organization, improved game balance flexibility

### Lower Priority (4+ hours)

#### 5. Extract UI Creation Methods
**Proposal**: Create `UIHandler.js` or `UIHelpers.js`

**Would Include**:
- Health bar creation
- Buff display setup
- Minimap initialization (partly already done)
- Wave notification display

**Benefits**: Cleaner main scene, reusable UI components

**Estimated Time**: 180 minutes

#### 6. Performance Profiling & Optimization
**Actions**:
- Profile main update loop with max enemies
- Identify GC pressure points
- Implement object pooling for:
  - Projectiles (already done, good!)
  - Particles (check existing)
  - UI elements (if dynamically created)

**Tools**: Use Chrome DevTools Performance tab or Phaser built-in stats

**Estimated Time**: 240 minutes

---

## 📋 Best Practices to Maintain

### 1. Naming Conventions
✅ **DO**:
- Use descriptive variable names: `playerHealthBar` not `bar`
- Use camelCase for variables: `playerX`, `selectedCharacter`
- Use UPPER_SNAKE_CASE for constants: `COLOR_PALETTE.RED`
- Prefix private methods with underscore: `_updatePlayerPosition()`

### 2. Code Organization
✅ **DO**:
- Keep methods in logical groups (init → create → update → cleanup)
- Use JSDoc comments for public methods
- Keep methods under 50 lines when possible
- Group related properties together in constructors

✅ **DON'T**:
- Create methods over 100 lines without breaking them down
- Mix game logic with rendering code
- Hardcode values outside of constants
- Leave console.log() statements in production code

### 3. Scene Size Management
| Scene Size | Status | Action |
|------------|--------|--------|
| < 500 lines | ✅ Good | Keep as is |
| 500-1000 lines | ⚠️ Monitor | Plan refactoring |
| 1000-2000 lines | 🔴 Large | Extract handlers/helpers |
| > 2000 lines | 🔴 Very Large | Break into multiple handlers |

**Current Status**:
- ChaossCrucibleScene: 4,646 lines → Should target 2,500-3,000 lines

### 4. Handler Pattern
✅ **Method**:
1. Each handler manages one game system
2. Scene calls handler methods in update/create
3. Handler is stateful, maintains own data
4. Returns events/callbacks for scene to handle

✅ **Goal**: Keep scene as a coordinator, not a doer

### 5. Helper Pattern  
✅ **Method**:
1. Helper functions are pure or mostly pure
2. No side effects on game state
3. Take parameters, return values
4. Reusable across scenes/handlers

✅ **Goal**: Utilities that reduce code duplication

### 6. Constants & Configuration
✅ **DO**:
- All magic numbers in constants
- All colors in COLOR_PALETTE
- All timings in animation/game constants
- All configuration in gameConstants.js

✅ **DON'T**:
- Hardcoded values in methods
- Magic strings for scene/handler names
- Duplicate constant definitions

---

## 🔍 Code Review Checklist

Before committing changes:

- [ ] No `console.log()` or `debugger` statements (except intentional debug mode)
- [ ] All colors use `COLOR_PALETTE` or scene constants
- [ ] All timing values are in named constants
- [ ] Methods are under 100 lines and focused on one task
- [ ] JSDoc comments on public methods/functions
- [ ] No code duplication (especially in animation setups)
- [ ] Proper error handling for null/undefined
- [ ] Handlers used appropriately (not scene logic)
- [ ] Performance: no obvious inefficiencies (nested loops, repeated calculations)
- [ ] File is properly formatted and indented

---

## 📊 Current Codebase Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Main Scene Lines | 4,646 | < 3,500 | 🔴 Over |
| Debug Statements | 0 | 0 | ✅ Good |
| Hardcoded Colors | ~65 | 0 | 🔴 Over |
| Duplicate Code Blocks | 3+ | < 2 | ⚠️ Monitor |
| Handler Classes | 9 | 8-12 | ✅ Good |
| Helper Modules | 15+ | 12-18 | ✅ Good |
| Method Count (Main Scene) | 89 | < 60 | 🔴 Over |

---

## 🚀 Performance Tips

### Most Impactful (Do First)
1. **Object Pooling**: Reuse objects instead of creating/destroying
   - ✅Already implemented for projectiles
   - Consider for particles, UI elements
   
2. **Update Loop Optimization**: 
   - Minimize calculations in update()
   - Use spatial partitioning for collisions (consider improving)
   - Cache expensive values
   
3. **Asset Loading**:
   - Preload assets before scene start
   - Use sprite sheets instead of individual images
   - Lazy-load non-essential assets

### Medium Impact
4. **Tween Optimization**:
   - Consider caching tween configurations
   - Reuse tweens when possible
   - Monitor GC from tween cleanup

5. **Rendering Optimization**:
   - Use multiple cameras wisely (UI vs game)
   - Layer objects appropriately (depth)
   - Consider using graphics batching

---

## 🔧 Tools & Commands

### Find All Hardcoded Colors
```bash
grep -rn "0x[0-9a-fA-F]\{6\}" src/ --include="*.js"
```

### Find Debug Statements  
```bash
grep -rn "console\.\|debugger" src/ --include="*.js"
```

### Find Magic Numbers
```bash
grep -rn "[0-9]\{3,\}" src/ --include="*.js" | grep -v "0x"
```

### Count Lines per File
```bash
wc -l src/**/*.js | sort -n
```

---

## 📝 Next Commit Messages

1. **Debug Cleanup**: "chore: remove console.log statements from scene files"
2. **Color Constants**: "refactor: centralize color values to COLOR_PALETTE constant"
3. **Animation Config**: "refactor: extract animation configurations to constants"
4. **Animation Helper**: "refactor: create createIdleLimbAnimations helper function"
5. **Update Scene**: "refactor(ChaossCrucibleScene): use color and animation constants"

---

**Last Updated**: February 28, 2026  
**Author**: Code Audit System  
**Version**: 1.0
