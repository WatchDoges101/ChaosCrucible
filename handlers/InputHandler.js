/**
 * Input Handler
 * 
 * Centralized input management for scenes.
 * Handles keyboard input, mouse input, and touch controls.
 * Provides convenient methods for common input queries.
 * 
 * @module handlers/InputHandler
 */

export class InputHandler {
  /**
   * Initialize input handler for a scene
   * @param {Phaser.Scene} scene - The Phaser scene
   * @param {Object} keyMap - Custom key mapping (optional)
   */
  constructor(scene, keyMap = {}) {
    this.scene = scene;
    this.keyMap = keyMap;
  }
}