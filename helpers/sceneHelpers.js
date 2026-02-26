/**
 * Camera Helper Functions
 * 
 * Helper utilities for camera setup, transitions, and effects.
 * Simplifies camera management across scenes.
 * 
 * @module helpers/cameraHelpers
 */

/**
 * Setup a camera to follow a target
 * @param {Phaser.Cameras.Scene2D.Camera} camera - The camera to configure
 * @param {Phaser.GameObjects.GameObject} target - Target to follow
 * @param {Object} [config] - Camera configuration
 * @param {number} [config.zoom=1] - Camera zoom level
 * @param {number} [config.lerpX=0.1] - Horizontal lerp (smoothing)
 * @param {number} [config.lerpY=0.1] - Vertical lerp (smoothing)
 * @param {Object} [config.bounds] - Camera bounds { x, y, width, height }
 * @param {Object} [config.deadzone] - Follow deadzone { x, y, width, height }
 * @returns {Phaser.Cameras.Scene2D.Camera} The configured camera
 * @example
 * setupFollowCamera(this.cameras.main, player, {
 *   zoom: 2.5,
 *   bounds: { x: 0, y: 0, width: 5000, height: 5000 }
 * });
 */
export function setupFollowCamera(camera, target, config = {}) {
  const {
    zoom = 1,
    lerpX = 0.1,
    lerpY = 0.1,
    bounds = null,
    deadzone = null
  } = config;

  if (bounds) {
    camera.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
  }

  camera.setZoom(zoom);
  camera.setLerp(lerpX, lerpY);
  camera.startFollow(target);

  if (deadzone) {
    camera.setDeadzone(deadzone.width, deadzone.height);
  }

  return camera;
}

/**
 * Create a fixed UI camera overlay
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} width - Viewport width
 * @param {number} height - Viewport height
 * @param {Array} [ignoreObjects=[]] - Objects for UI camera to ignore (world objects)
 * @returns {Phaser.Cameras.Scene2D.Camera} The UI camera
 * @example
 * const uiCamera = createUICamera(this, 1920, 1080, [player, ...enemies]);
 */
export function createUICamera(scene, width, height, ignoreObjects = []) {
  const uiCamera = scene.cameras.add(0, 0, width, height);
  uiCamera.setViewport(0, 0, width, height);
  uiCamera.setZoom(1);

  // Make UI camera ignore all world objects
  ignoreObjects.forEach(obj => {
    if (obj) {
      uiCamera.ignore(obj);
    }
  });

  return uiCamera;
}

/**
 * Camera shake effect
 * @param {Phaser.Cameras.Scene2D.Camera} camera - The camera to shake
 * @param {Object} [config] - Shake configuration
 * @param {number} [config.duration=100] - Shake duration in ms
 * @param {number} [config.intensity=0.005] - Shake intensity
 * @returns {void}
 * @example
 * shakeCamer a(this.cameras.main, { duration: 200, intensity: 0.01 });
 */
export function shakeCamera(camera, config = {}) {
  const {
    duration = 100,
    intensity = 0.005
  } = config;

  camera.shake(duration, intensity);
}

/**
 * Camera flash effect
 * @param {Phaser.Cameras.Scene2D.Camera} camera - The camera to flash
 * @param {Object} [config] - Flash configuration
 * @param {number} [config.duration=100] - Flash duration in ms
 * @param {number} [config.red=255] - Red component (0-255)
 * @param {number} [config.green=255] - Green component (0-255)
 * @param {number} [config.blue=255] - Blue component (0-255)
 * @param {boolean} [config.force=false] - Force flash
 * @returns {void}
 * @example
 * flashCamera(this.cameras.main, { red: 255, green: 0, blue: 0, duration: 200 });
 */
export function flashCamera(camera, config = {}) {
  const {
    duration = 100,
    red = 255,
    green = 255,
    blue = 255,
    force = false
  } = config;

  camera.flash(duration, red, green, blue, force);
}

/**
 * Camera fade effect
 * @param {Phaser.Cameras.Scene2D.Camera} camera - The camera to fade
 * @param {Object} [config] - Fade configuration
 * @param {number} [config.duration=1000] - Fade duration in ms
 * @param {number} [config.red=0] - Red component (0-255)
 * @param {number} [config.green=0] - Green component (0-255)
 * @param {number} [config.blue=0] - Blue component (0-255)
 * @param {boolean} [config.force=false] - Force fade
 * @param {Function} [config.callback] - Callback when fade completes
 * @returns {void}
 * @example
 * fadeCamera(this.cameras.main, { duration: 1000, callback: () => this.scene.start('NextScene') });
 */
export function fadeCamera(camera, config = {}) {
  const {
    duration = 1000,
    red = 0,
    green = 0,
    blue = 0,
    force = false,
    callback = null
  } = config;

  camera.fade(duration, red, green, blue, force, callback);
}

/**
 * Pan camera to position
 * @param {Phaser.Cameras.Scene2D.Camera} camera - The camera to pan
 * @param {number} x - Target X position
 * @param {number} y - Target Y position
 * @param {Object} [config] - Pan configuration
 * @param {number} [config.duration=1000] - Pan duration in ms
 * @param {string} [config.ease='Linear'] - Easing function
 * @param {Function} [config.callback] - Callback when pan completes
 * @returns {void}
 * @example
 * panCamera(this.cameras.main, 1000, 1000, { duration: 2000, ease: 'Sine.easeInOut' });
 */
export function panCamera(camera, x, y, config = {}) {
  const {
    duration = 1000,
    ease = 'Linear',
    callback = null
  } = config;

  camera.pan(x, y, duration, ease, false, callback);
}

/**
 * Zoom camera to level
 * @param {Phaser.Cameras.Scene2D.Camera} camera - The camera to zoom
 * @param {number} zoom - Target zoom level
 * @param {Object} [config] - Zoom configuration
 * @param {number} [config.duration=1000] - Zoom duration in ms
 * @param {string} [config.ease='Linear'] - Easing function
 * @param {Function} [config.callback] - Callback when zoom completes
 * @returns {void}
 * @example
 * zoomCamera(this.cameras.main, 3, { duration: 1500, ease: 'Power2' });
 */
export function zoomCamera(camera, zoom, config = {}) {
  const {
    duration = 1000,
    ease = 'Linear',
    callback = null
  } = config;

  camera.zoomTo(zoom, duration, ease, false, callback);
}

/**
 * Reset camera effects
 * @param {Phaser.Cameras.Scene2D.Camera} camera - The camera to reset
 * @returns {void}
 * @example
 * resetCamera(this.cameras.main);
 */
export function resetCamera(camera) {
  camera.resetFX();
}

/**
 * Set camera background color
 * @param {Phaser.Cameras.Scene2D.Camera} camera - The camera
 * @param {number|string} color - Color value (hex number or string)
 * @returns {void}
 * @example
 * setCameraBackgroundColor(this.cameras.main, 0x1a1a1a);
 */
export function setCameraBackgroundColor(camera, color) {
  camera.setBackgroundColor(color);
}

/**
 * Make camera ignore objects (for UI camera)
 * @param {Phaser.Cameras.Scene2D.Camera} camera - The camera
 * @param {Array|Phaser.GameObjects.GameObject} objects - Object(s) to ignore
 * @returns {void}
 * @example
 * ignoreObjects(uiCamera, [player, enemy1, enemy2]);
 */
export function ignoreObjects(camera, objects) {
  const objectArray = Array.isArray(objects) ? objects : [objects];
  objectArray.forEach(obj => {
    if (obj) {
      camera.ignore(obj);
    }
  });
}

/**
 * Scene Helper Functions
 * 
 * Helper utilities for scene management, transitions, and lifecycle.
 * 
 * @module helpers/sceneHelpers
 */

/**
 * Safely stop and clean up a scene
 * @param {Phaser.Scene} scene - The scene initiating the stop
 * @param {string} sceneKey - Key of scene to stop
 * @returns {void}
 * @example
 * stopScene(this, 'GameScene');
 */
export function stopScene(scene, sceneKey) {
  const targetScene = scene.scene.get(sceneKey);
  
  if (targetScene) {
    scene.scene.stop(sceneKey);
    
    // Clean up display objects
    if (targetScene.children && targetScene.children.list) {
      targetScene.children.list.forEach(child => {
        try {
          child.destroy();
        } catch (e) {
          // Ignore errors during cleanup
        }
      });
    }
  }
}

/**
 * Stop multiple scenes
 * @param {Phaser.Scene} scene - The scene initiating the stops
 * @param {string[]} sceneKeys - Array of scene keys to stop
 * @returns {void}
 * @example
 * stopScenes(this, ['GameScene', 'UIScene', 'PauseScene']);
 */
export function stopScenes(scene, sceneKeys) {
  sceneKeys.forEach(key => stopScene(scene, key));
}

/**
 * Start a scene (with optional data)
 * @param {Phaser.Scene} scene - The scene initiating the start
 * @param {string} sceneKey - Key of scene to start
 * @param {Object} [data={}] - Data to pass to new scene
 * @returns {void}
 * @example
 * startScene(this, 'GameScene', { level: 2, difficulty: 'hard' });
 */
export function startScene(scene, sceneKey, data = {}) {
  scene.scene.start(sceneKey, data);
}

/**
 * Transition to another scene with fade effect
 * @param {Phaser.Scene} scene - The current scene
 * @param {string} targetSceneKey - Key of scene to transition to
 * @param {Object} [config] - Transition configuration
 * @param {number} [config.duration=1000] - Fade duration in ms
 * @param {Object} [config.data={}] - Data to pass to new scene
 * @returns {void}
 * @example
 * transitionToScene(this, 'GameScene', { duration: 1500, data: { level: 1 } });
 */
export function transitionToScene(scene, targetSceneKey, config = {}) {
  const {
    duration = 1000,
    data = {}
  } = config;

  fadeCamera(scene.cameras.main, {
    duration: duration / 2,
    callback: () => {
      scene.scene.start(targetSceneKey, data);
    }
  });
}

/**
 * Launch a scene in parallel (doesn't stop current scene)
 * @param {Phaser.Scene} scene - The current scene
 * @param {string} sceneKey - Key of scene to launch
 * @param {Object} [data={}] - Data to pass to launched scene
 * @returns {void}
 * @example
 * launchScene(this, 'PauseMenu', { previousScene: 'GameScene' });
 */
export function launchScene(scene, sceneKey, data = {}) {
  scene.scene.launch(sceneKey, data);
}

/**
 * Pause a scene
 * @param {Phaser.Scene} scene - The scene to pause
 * @param {string} [sceneKey] - Scene key (if pausing another scene)
 * @returns {void}
 * @example
 * pauseScene(this); // Pause current scene
 * pauseScene(this, 'GameScene'); // Pause another scene
 */
export function pauseScene(scene, sceneKey = null) {
  if (sceneKey) {
    scene.scene.pause(sceneKey);
  } else {
    scene.scene.pause();
  }
}

/**
 * Resume a scene
 * @param {Phaser.Scene} scene - The scene to resume
 * @param {string} [sceneKey] - Scene key (if resuming another scene)
 * @returns {void}
 * @example
 * resumeScene(this); // Resume current scene
 * resumeScene(this, 'GameScene'); // Resume another scene
 */
export function resumeScene(scene, sceneKey = null) {
  if (sceneKey) {
    scene.scene.resume(sceneKey);
  } else {
    scene.scene.resume();
  }
}

/**
 * Reset scene timing systems (fixes pause issues)
 * @param {Phaser.Scene} scene - The scene to reset
 * @returns {void}
 * @example
 * resetSceneTiming(this);
 */
export function resetSceneTiming(scene) {
  scene.tweens.timeScale = 1;
  scene.tweens.resumeAll();
  scene.time.timeScale = 1;
}

/**
 * Add a scene dynamically
 * @param {Phaser.Scene} scene - The current scene
 * @param {string} sceneKey - Key for the new scene
 * @param {Phaser.Scene} sceneClass - Scene class instance
 * @param {boolean} [autoStart=false] - Auto-start after adding
 * @param {Object} [data={}] - Data to pass if auto-starting
 * @returns {void}
 * @example
 * addScene(this, 'NewScene', NewSceneClass, true);
 */
export function addScene(scene, sceneKey, sceneClass, autoStart = false, data = {}) {
  if (!scene.scene.get(sceneKey)) {
    scene.scene.add(sceneKey, sceneClass, autoStart, data);
  } else if (autoStart) {
    scene.scene.start(sceneKey, data);
  }
}

/**
 * Check if scene is active
 * @param {Phaser.Scene} scene - The current scene
 * @param {string} sceneKey - Scene key to check
 * @returns {boolean} True if scene is active
 * @example
 * if (isSceneActive(this, 'PauseMenu')) { // ... }
 */
export function isSceneActive(scene, sceneKey) {
  return scene.scene.isActive(sceneKey);
}

/**
 * Restart current scene
 * @param {Phaser.Scene} scene - The scene to restart
 * @param {Object} [data={}] - Data to pass on restart
 * @returns {void}
 * @example
 * restartScene(this, { lives: 3 });
 */
export function restartScene(scene, data = {}) {
  scene.scene.restart(data);
}

/**
 * Get data passed from previous scene
 * @param {Phaser.Scene} scene - The current scene
 * @param {string} key - Data key
 * @param {*} [defaultValue=null] - Default value if key doesn't exist
 * @returns {*} The data value
 * @example
 * const level = getSceneData(this, 'level', 1);
 */
export function getSceneData(scene, key, defaultValue = null) {
  return scene.scene.settings.data[key] || defaultValue;
}
