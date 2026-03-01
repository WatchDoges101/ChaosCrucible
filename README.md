# ChaosCrucible

A fast-paced action game built with Phaser 3 where players battle waves of enemies in an arena environment.

## Features

- Character customization and selection
- Role-based combat system (Warrior, Mage, Archer)
- Dynamic enemy AI with spawn management
- Particle effects and visual polish
- Enemy wiki and information system with detailed sprites and animations
- **Progressive wave system with 6 unique enemy types**
- **Enemy unlocking system: new enemies appear as difficulty increases**
- **Comprehensive handler architecture for game systems**
- **Performance-optimized collision detection with spatial partitioning**
- **Object pooling for reduced garbage collection**
- **Centralized buff, powerup, and projectile management**

## Enemy Types

ChaosCrucible features 6 unique enemy types, each with distinct abilities and visual design:

### Available From Wave 1
- **Slime** (Common): Weak blob enemy with bouncy movement.
	- HP: 40 | DMG: 8 | SPD: 60
	- Abilities: Split Bounce, Sticky Slow

- **Skeleton** (Medium): Bone warrior with ranged attacks.
	- HP: 55 | DMG: 12 | SPD: 65
	- Abilities: Bone Throw, Shielded Guard

- **Devil** (Elite): Winged demon with high damage and mobility.
	- HP: 85 | DMG: 18 | SPD: 70
	- Abilities: Hellfire Burst, Winged Dash

### Unlocked at Wave 3+
- **Frost Wraith** (Specialist): Ghostly ice entity with high speed.
	- HP: 70 | DMG: 15 | SPD: 80
	- Abilities: Freeze, Icy Dash

### Unlocked at Wave 5+
- **Bomber Beetle** (Specialist): Explosive insect with hazard pressure.
	- HP: 60 | DMG: 10 | SPD: 50
	- Abilities: Explosive Bomb, Quick Escape

### Unlocked at Wave 7+
- **Storm Mage** (Elite): Magic-focused enemy with strong burst attacks.
	- HP: 90 | DMG: 20 | SPD: 60
	- Abilities: Lightning Strike, Teleport

## Wave Progression

The game uses progressive enemy unlocking as waves increase:

- **Waves 1-2**: Slime, Skeleton, Devil
- **Waves 3-4**: Frost Wraith added
- **Waves 5-6**: Bomber Beetle added
- **Waves 7+**: Storm Mage added

Enemy count and elite frequency both scale up over time for increasing challenge.

## Recent Stability Updates

- Scene transitions now explicitly stop previous scenes to prevent hidden UI from receiving input.
- Interactive buttons are disabled during scene handoff to prevent click-through bugs.
- Combat camera shake is throttled and clamped to avoid stacked shake glitches during rapid attacks.
- Vite dev server is configured for container/forwarded-port reliability (`host: 0.0.0.0`, `strictPort: true`).

## March 2026 Gameplay & UI Updates

- **Player death flow upgraded**: Added collapse + bleed-out sequence, blood effects, red death overlay, and `HOME` return button.
- **Enemy damage reliability fixes**: Corrected missing HP initialization on advanced enemy variants that could cause invulnerability.
- **XP and leveling persistence**: XP now saves locally on gain, level-ups award unlock tokens, and skill-tree progression persists reliably.
- **Character identity persistence**: Default warrior naming is uppercase, and chosen character names are saved/reloaded locally per role.
- **Champion selection refresh**: Removed mini flavor descriptions, removed Health from visible stats, and added per-champion level progress bars.
- **Main menu fire visuals reworked**: Replaced particle-based menu flames with fully animated flame layers for a stronger title-screen look.
- **Wiki hub section added**: Added a dedicated `Wiki` scene that routes to Enemy and Powerup wiki pages with proper in-section back navigation.
- **Powerup visuals unified**: In-game and wiki now use the same shared Phaser sprite helper for consistent powerup appearance.

## March 2026 Skill Tree, Ability FX & Collision Updates

- **Skill tree unlock fixes**: Child node unlock traversal now correctly resolves nested nodes (e.g., Gunner `Burst` and `Explosive Rounds`) with proper parent + token validation.
- **Nested skill persistence fixed**: Skill tree save/load/reset now preserves nested child node unlock state, not only top-level branches.
- **Unlock celebration effects**: New unlock showcase visuals (banner, pulse, sparks, and camera feedback) trigger immediately when a skill is unlocked.
- **Ability manifestation in combat**: Unlocked abilities now visibly affect combat feedback (burst pulses, trails, and role-specific activation effects).
- **Explosive rounds wall impacts**: Gunner explosive rounds now detonate on structure/obstacle collision, with AoE splash and blast visuals.
- **Projectile-to-world collision pass**: Player projectiles now collide with obstacle geometry instead of passing through walls.
- **Structure collision improvements**: Temple, dungeon, and tower use unified frame colliders with explicit doorway gaps for cleaner movement boundaries.
- **Centerpiece depth correction**: Central statue top/head layering now correctly occludes the player when moving behind it.

## March 2026 Interface, Wiki & Menu Presentation Updates

- **HUD info panel redesign**: Replaced plain top-left labels with a styled animated stats panel for Name, Enemies, Score, and Wave.
- **Minimap visual upgrade**: Added minimap frame glow, grid lines, center marker, player heading indicator, pulse animation, and richer enemy type markers.
- **Character wiki expansion**: Added a dedicated `CharacterWikiScene` with animated character previews, role summaries, and basic/ability descriptions.
- **Wiki visual consistency pass**: Standardized Character/Enemy/Powerup wiki page sizing, panel styling, typography, spacing, and back-button design.
- **Character wiki readability updates**: Removed role tags from character titles and increased character preview sprite scale for stronger visual emphasis.
- **Online flow redirect**: Main menu `ONLINE` now routes to the enhanced `ComingSoonScene` experience.
- **Coming soon cinematic polish**: Added layered inferno background, dense embers/flames, energy rings, periodic fire bursts, and stronger animated title treatment.
- **Main menu flame overhaul**: Replaced older flame tongues with layered particle fire, wall flames, embers, and title-focused heat aura effects.

## Code Quality & Architecture (February 2026 Audit)

A comprehensive code audit was conducted to improve code organization and maintainability. See [AUDIT.md](AUDIT.md) for the full report.

### Key Improvements:
- ✅ **WaveHandler** created - Extracted 200+ lines of wave management logic from main scene
- ✅ **MinimapHandler** created - Centralized minimap and enemy tracking (150+ lines extracted)
- ✅ **UIEffectsHelper** created - Reusable UI feedback effects (floating damage, points, notifications)
- ✅ **Main scene reduced** by ~450 lines through better separation of concerns
- ✅ **Improved testability** - Handlers can now be unit tested independently
- ✅ **Comprehensive JSDoc** - All new code includes detailed documentation

### Code Metrics:
- **Handlers**: 9 specialized game system managers
- **Helpers**: 15+ utility modules with pure functions
- **Test Coverage**: Handlers designed for easy unit testing
- **Documentation**: 100% JSDoc coverage on public APIs

## Performance Optimizations

ChaosCrucible uses several optimization techniques for smooth gameplay:

- **Spatial Grid**: Efficient collision detection using spatial partitioning (O(1) lookups)
- **Object Pooling**: Reuse projectiles and effects instead of creating/destroying
- **Handler Architecture**: Centralized game systems reduce code duplication and improve maintainability
- **Delta Time Scaling**: Frame-independent movement for consistent gameplay
- **Smart Updates**: Only update UI elements when values change

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:3000/`

### Build for Production

```bash
npm run build
```

## Project Structure

```
ChaosCrucible/
├── assets/                      # Game assets and sprites
│   ├── enemyimageAssets.js     # Enemy sprite metadata
│   ├── playerimageAssets.js    # Player sprite metadata
│   └── Entities/               # Character and enemy sprite sheets
├── config/
│   └── gameConfig.js           # Phaser game configuration
├── constants/
│   └── gameConstants.js        # Game-wide constants and enums
├── handlers/                    # Input and game logic handlers
│   ├── AbilityEffectsHandler.js # Ability unlock and combat VFX routing
│   ├── BuffHandler.js          # Buff/debuff and shield management with UI
│   ├── CollisionHandler.js     # Centralized collision detection
│   ├── EnemySpawnHandler.js    # Enemy spawning and AI management
│   ├── InputHandler.js         # Input handling and player controls
│   ├── MinimapHandler.js       # Minimap and enemy tracking indicators
│   ├── PauseHandler.js         # Pause menu management
│   ├── PowerupHandler.js       # Powerup spawning and collection
│   ├── ProjectileHandler.js    # Player and enemy projectile management
│   └── WaveHandler.js          # Wave progression and difficulty scaling
├── helpers/                     # Reusable utility modules
│   ├── abilityEffectsHelpers.js # Skill unlock and combat ability visual effects
│   ├── animationHelpers.js     # Animation and tween utilities
│   ├── arenaHelpers.js         # Arena/environment creation
│   ├── colorHelpers.js         # Color manipulation utilities
│   ├── combatHelpers.js        # Combat mechanics and calculations
│   ├── mathHelpers.js          # Mathematical utilities
│   ├── particleHelpers.js      # Particle effects and visual polish
│   ├── pauseHelpers.js         # Pause menu utilities
│   ├── performanceHelpers.js   # Performance optimization utilities
│   ├── sceneCleanupHelpers.js  # Resource cleanup utilities
│   ├── sceneHelpers.js         # Scene management and cameras
│   ├── storageHelpers.js       # LocalStorage utilities
│   ├── stringHelpers.js        # String formatting utilities
│   ├── uiEffectsHelpers.js     # UI feedback effects (damage, points, notifications)
│   ├── uiHelpers.js            # UI component creation
│   └── validationHelpers.js    # Input validation
├── scenes/phaser/               # Phaser scene files
│   ├── ChaossCrucibleScene.js  # Main game scene
│   ├── CharacterCustomizationScene.js
│   ├── CharacterSelectionScene.js
│   ├── EnemyWikiScene.js       # Enemy information viewer
│   ├── HostScene.js            # Game session hosting
│   ├── MenuScene.js            # Main menu
│   └── OptionsScene.js         # Game settings
├── services/
│   ├── audioManager.js         # Audio playback management
│   ├── gameState.js            # Global game state
│   └── spriteGenerator.js      # Dynamic sprite generation
├── types/                       # Type definitions (if using)
├── utils/                       # General utilities
├── main.phaser.js              # Game entry point
├── index.html                  # HTML shell
└── HELPERS_DOCUMENTATION.md    # Comprehensive helper API docs
```

## Helper Module Architecture

This project uses a modular helper architecture to promote code reuse and maintainability. All helpers are pure functions that can be easily tested and composed.

### Core Handlers (Stateful Game Systems)

- **BuffHandler**: Manages player buffs, debuffs, shield, and displays buff UI
- **PowerupHandler**: Handles powerup spawning, collection, and effects
- **ProjectileHandler**: Manages both player and enemy projectiles with collision detection
- **CollisionHandler**: Centralized collision detection with spatial optimization
- **EnemySpawnHandler**: Enemy AI, spawning, and behavior management
- **InputHandler**: Player input processing and controls
- **WaveHandler**: Wave progression, difficulty scaling, and enemy distribution
- **MinimapHandler**: Minimap rendering and off-screen enemy indicators
- **PauseHandler**: Pause menu state and key binding management

### Core Helpers (Stateless Utilities)

- **animationHelpers**: Tween-based animations (pulse, float, fade, flash)
- **uiHelpers**: UI component factories (buttons, health bars, panels, tooltips)
- **uiEffectsHelpers**: UI feedback effects (floating damage, points, notifications, bursts)
- **combatHelpers**: Combat mechanics (damage, projectiles, knockback)
- **particleHelpers**: Visual effects (flames, explosions, lava)
- **sceneHelpers**: Scene lifecycle and camera management
- **sceneCleanupHelpers**: Resource cleanup and memory management
- **arenaHelpers**: Environment creation (floors, borders, obstacles)
- **performanceHelpers**: Optimization utilities (SpatialGrid, ObjectPool, throttle)
- **pauseHelpers**: Pause menu utilities and scene registration

### Utility Helpers

- **animationHelpers**: Tween-based animations (pulse, float, fade, flash)
- **uiHelpers**: UI component factories (buttons, health bars, panels)
- **combatHelpers**: Combat mechanics (damage, projectiles, knockback)
- **particleHelpers**: Visual effects (flames, explosions, lava)
- **sceneHelpers**: Scene lifecycle and camera management
- **arenaHelpers**: Environment creation (floors, borders, obstacles)

### Utility Helpers

- **mathHelpers**: Math operations (distance, angle, lerp, random)
- **colorHelpers**: Color manipulation and conversion
- **storageHelpers**: LocalStorage read/write
- **stringHelpers**: String formatting and manipulation
- **validationHelpers**: Input validation and sanitization

See [HELPERS_DOCUMENTATION.md](HELPERS_DOCUMENTATION.md) for complete API documentation and usage examples.

## Game Roles

### Warrior
- High health and melee damage
- Dash ability for gap closing
- Knockback on attacks

### Mage
- Ranged magic projectiles
- Lower health, higher damage
- Area-of-effect capabilities

### Archer
- Fast attack speed
- Medium range
- High mobility

## Technology Stack

- **Phaser 3.60.0**: Game engine
- **Vite 5.0.0**: Build tool and dev server
- **Howler 2.2.4**: Audio management
- **ES6 Modules**: Modern JavaScript architecture

## Development

### File Organization

- **Scenes**: Game screens and states
- **Handlers**: Complex stateful logic (enemies, input)
- **Helpers**: Pure utility functions (no state)
- **Services**: Singleton managers (audio, game state)
- **Constants**: Configuration and enums

### Adding New Helpers

1. Create file in `helpers/` directory
2. Export pure functions with JSDoc
3. Import only what you need from other helpers
4. Document in `HELPERS_DOCUMENTATION.md`

### Code Style

- Use JSDoc comments for all exported functions
- Keep helpers pure (no side effects)
- Use meaningful variable names
- Follow ES6+ best practices

## License

This project is open source and available under the MIT License.

## Authors

- WatchDoges101

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
