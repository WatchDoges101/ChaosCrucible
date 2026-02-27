/**
 * Input Handler
 * Centralized input management for scenes.
 * @module handlers/InputHandler
 */

export class InputHandler {
  constructor(scene, keyMap = {}) {
    this.scene = scene;
    this.keyMap = keyMap;
    this.setupKeys();
  }

  setupKeys() {
    this.keys = this.scene.input.keyboard.createCursorKeys();
    this.keys.w = this.scene.input.keyboard.addKey('W');
    this.keys.a = this.scene.input.keyboard.addKey('A');
    this.keys.s = this.scene.input.keyboard.addKey('S');
    this.keys.d = this.scene.input.keyboard.addKey('D');
    this.keys.space = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keys.shift = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.keys.e = this.scene.input.keyboard.addKey('E');
  }

  getMovementInput() {
    let x = 0, y = 0;
    if (this.keys.w?.isDown || this.keys.up?.isDown) y -= 1;
    if (this.keys.s?.isDown || this.keys.down?.isDown) y += 1;
    if (this.keys.a?.isDown || this.keys.left?.isDown) x -= 1;
    if (this.keys.d?.isDown || this.keys.right?.isDown) x += 1;
    return { x, y };
  }

  isBasicAttackActive() {
    return this.keys.space?.isDown || this.scene.input.activePointer?.isDown;
  }

  isAbilityJustPressed() {
    return Phaser.Input.Keyboard.JustDown(this.keys.shift) || Phaser.Input.Keyboard.JustDown(this.keys.e);
  }

  getPointerPosition() {
    return this.scene.input.activePointer.positionToCamera(this.scene.cameras.main);
  }
}