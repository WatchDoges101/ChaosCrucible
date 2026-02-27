/**
 * Scene Cleanup Helpers
 * Provides utility functions for properly cleaning up Phaser scenes
 * Prevents buttons from being clickable when hidden and removes memory leaks
 */

/**
 * Clean up all tweens in a scene
 */
export function stopAllTweens(scene) {
  if (scene && scene.tweens) {
    scene.tweens.killAll();
  }
}

/**
 * Clean up all timers in a scene
 */
export function stopAllTimers(scene) {
  if (scene && scene.time) {
    scene.time.removeAllEvents();
  }
}

/**
 * Clean up all particle emitters in a scene
 */
export function destroyAllParticles(scene) {
  if (!scene || !scene.children) return;
  
  const children = scene.children.list.slice(); // Copy to avoid mutation during iteration
  children.forEach(child => {
    if (child && child.emitters) {
      // Particle emitter manager
      child.emitters.forEach(emitter => {
        try { emitter.stop(); emitter.emitZoneObject.destroy(); } catch(e) {}
      });
    } else if (child && child.type === 'ParticleEmitter') {
      try { child.stop(); } catch(e) {}
    }
  });
}

/**
 * Remove all input listeners from scene objects
 */
export function removeAllInputListeners(scene) {
  if (!scene || !scene.children) return;
  
  const children = scene.children.list.slice();
  children.forEach(child => {
    if (child && child.input) {
      child.input.enabled = false;
      child.removeAllListeners();
      try { child.disableInteractive(); } catch(e) {}
    }
  });
}

/**
 * Destroy all graphics objects in a scene
 */
export function destroyAllGraphics(scene) {
  if (!scene || !scene.children) return;
  
  const children = scene.children.list.slice();
  children.forEach(child => {
    if (child && child.type === 'Graphics') {
      try { child.destroy(); } catch(e) {}
    }
  });
}

/**
 * Comprehensive scene cleanup function
 * Call this in shutdown/sleep events
 */
export function cleanupScene(scene) {
  stopAllTimers(scene);
  stopAllTweens(scene);
  removeAllInputListeners(scene);
  destroyAllParticles(scene);
}
