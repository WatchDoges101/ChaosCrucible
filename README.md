# ⚔️ Chaos Crucible

> A **fun, experimental 2D arena game** built with Phaser 3 and vanilla JavaScript.

## 🎮 About

Chaos Crucible is a passion project—a barbaric 2D arena game where players battle slime enemies in an increasingly hostile environment. It's a playground for learning game development, experimenting with procedural graphics, and having fun with creative code.

**This project is made for fun and learning. No commercial intentions.**

---

## 📋 Development Journey

### Phase 1: Core Architecture (✅ Complete)
- **Transitioned from pure Canvas to Phaser 3** for better scene management and rendering
- **Implemented dual-camera system**: 
  - Main camera (2.5× zoom) follows player in the arena
  - UI camera (1× fixed) displays HUD elements without distortion
- **Scene management**: MenuScene → CharacterSelectionScene → CharacterCustomizationScene → ChaossCrucibleScene
- **Lazy-loading scenes** to prevent UI clutter and unnecessary memory usage

### Phase 2: Visual Polish (✅ Complete)
- **Procedural sprite generation** for all characters (no image files—all drawn with Phaser graphics)
- **Barbaric arena environment**:
  - Solid grey stone floor with rocky texture speckles
  - Blood stains for atmosphere
  - 6 glowing lava pools with animated bubbling effects
  - 4 corner torches with dynamic flickering fire
- **Enemy variety**: 
  - Red slime enemies with variable sizes (0.6× to 1.2× scale)
  - Size-aware health bars and spawn mechanics
- **Menu design**: CHAOS CRUCIBLE title with subtle shake animation

### Phase 3: Menu & Settings (✅ Complete)
- **MenuScene**: Clean start screen with Start Game and Options buttons
- **OptionsScene**: Settings for sound volume, music volume, and graphics quality
- **CharacterSelectionScene**: Choose from 4 roles (Male, Archer, Brute, Gunner)
- **CharacterCustomizationScene**: Name your character and select color schemes

### Phase 4: Gameplay Foundation (🔄 In Progress)
- **Player movement**: WASD controls with diagonal movement support
- **Enemy spawning**: Random slimes spawn periodically (max 10 at a time)
- **Collision detection**: Basic boundary checking and enemy-player interactions
- **Health system**: Player and enemy health bars with visual feedback

---

## 🎯 Current Features

### Gameplay
- ✅ Large 5000×5000 arena world with camera following the player
- ✅ Procedurally spawned enemy slimes with variable sizes
- ✅ Basic physics and collision detection
- ✅ Health bar system for player and enemies
- ✅ WASD movement with smooth diagonal support
- ✅ Pause and options during gameplay (partial)

### Graphics
- ✅ Barbaric arena with lava pools, torches, and rocky floor
- ✅ Procedural sprite generation for all characters and enemies
- ✅ Smooth camera zoom and tracking
- ✅ Layered visual effects (glow, shadows, particle-like bubbles)

### UI/UX
- ✅ Multi-scene navigation with smooth transitions
- ✅ Character customization (role + color scheme)
- ✅ Settings menu (volume, graphics quality)
- ✅ HUD system (health bar, enemy count, character name)

---

## 🛠️ Tech Stack

| Component | Technology | Notes |
|-----------|-----------|-------|
| **Game Engine** | Phaser 3 | Scene management, rendering, input, tweens |
| **Language** | JavaScript (ES6 modules) | Modular architecture for maintainability |
| **Build System** | Vite | Fast dev server, optimized builds |
| **Graphics** | Phaser Graphics API | All sprites drawn procedurally (no image files) |
| **Audio** | Howler.js (planned) | For sound and music management |
| **State Management** | Custom GameState class | Centralized game state with event emitters |

---

## 📂 Project Structure

```
ChaosCrucible/
├── index.html                   # Entry point (loads main.phaser.js)
├── main.phaser.js               # Phaser 3 bootstrap
├── config/
│   └── gameConfig.js            # Phaser game configuration
├── scenes/phaser/
│   ├── MenuScene.js             # Main menu
│   ├── OptionsScene.js          # Settings menu
│   ├── CharacterSelectionScene.js
│   ├── CharacterCustomizationScene.js
│   ├── ChaossCrucibleScene.js   # Main arena gameplay
│   └── HostScene.js             # Legacy scene (can be deprecated)
├── services/
│   ├── gameState.js             # Centralized game state
│   ├── spriteGenerator.js       # Procedural character/enemy rendering
│   └── audioManager.js          # Audio control system
├── assets/
│   ├── Entities/                # Character sprite asset references
│   ├── playerimageAssets.js
│   └── enemyimageAssets.js
└── style.css                    # Global styles
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/WatchDoges101/ChaosCrucible.git
cd ChaosCrucible

# Install dependencies
npm install

# Start dev server (opens http://localhost:3001)
npm run dev

# Build for production
npm run build
```

### Game Controls
| Key | Action |
|-----|--------|
| WASD | Move character |
| Mouse | Navigate menus |

---

## 🎨 Architecture Highlights

### Dual-Camera System
The game uses two cameras to separate gameplay from UI:
```javascript
// Main camera: Tracks player at 2.5× zoom
mainCamera.setZoom(2.5);
mainCamera.startFollow(player);

// UI camera: Fixed at 1× for HUD elements
uiCamera.setOrigin(0, 0);
uiCamera.setScroll(0, 0);
```

### Procedural Sprite Generation
All characters are generated on-the-fly using Phaser's graphics API:
```javascript
generateCharacterSprite(scene, 'archer', x, y, customColors)
// Returns a Phaser container with drawn graphics (no image files)
```

### Lazy-Loading Scenes
Scenes are only instantiated when the user navigates to them:
```javascript
// Main menu loads MenuScene only
gameConfig.scene = [MenuScene];

// Other scenes added dynamically when needed
button.on('click', () => {
  this.scene.add('CharacterSelectionScene', CharacterSelectionScene, true);
});
```

---

## 📝 Recent Updates

### Latest Session
- ✅ Fixed character icon appearing on menu (lazy-load scenes)
- ✅ Created OptionsScene with volume sliders and graphics settings
- ✅ Removed quit button from menu
- ✅ Updated main branch to match develop
- ✅ All branches synchronized

---

## 🐛 Known Issues & TODOs

### Bug Fixes Needed
- [ ] Smooth volume slider interaction
- [ ] Graphics quality settings implementation
- [ ] Pause scene full integration
- [ ] Enemy attack mechanics

### Features to Implement
- [ ] Combat system (slime attacks, player damage)
- [ ] Enemy A.I. improvements (targeting, aggro)
- [ ] Sound effects and background music
- [ ] Particle effects for damage/spells
- [ ] Difficulty scaling
- [ ] Leaderboard/scoring system
- [ ] Power-ups and special abilities
- [ ] Boss battles

### Code Cleanup
- [ ] Remove legacy canvas-based code (main.js, scenes/)
- [ ] Full migration to Phaser 3 architecture
- [ ] Add JSDoc comments to all functions
- [ ] Write unit tests

---

## 🧠 Development Philosophy

This project embraces a **modular, iterative approach**:
- Each scene is self-contained and manages its own logic
- Procedural graphics keep file size minimal
- Game state is centralized for easier debugging
- Scenes are lazy-loaded to reduce memory footprint
- Code is written for clarity over optimization (premature optimization is the root of all evil!)

---

## 📚 Learning Resources Used

- [Phaser 3 Official Documentation](https://photonstorm.github.io/phaser3-docs/)
- Procedural graphics techniques
- Canvas 2D context manipulation
- JavaScript ES6 modules and classes
- Game state management patterns

---

## 👨‍💻 Contributing

This is a **personal fun project**. If you'd like to suggest ideas or report bugs, feel free to open an issue!

---

## 📄 License

Feel free to use this code for learning and fun. No restrictions.

---

## 🎯 Final Notes

**Chaos Crucible is made for fun and experimentation.** It's a space to:
- Learn game development concepts
- Experiment with new ideas
- Have fun building something creative
- Push JavaScript to its limits
- Create cool barbaric vibes ⚔️

The codebase prioritizes **clarity and learning** over production-ready polish. Enjoy!

---

**Last Updated:** February 26, 2026  
**Current Status:** 🔄 Active Development (Phase 4: Gameplay)
