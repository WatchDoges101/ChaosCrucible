/**
 * Animation Helper Functions
 * 
 * Helper utilities for creating common Phaser animations and tweens.
 * Centralizes animation logic to promote reusability and consistency.
 * 
 * @module helpers/animationHelpers
 */

/**
 * Create a pulsing scale animation (breathing effect)
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {Phaser.GameObjects.GameObject} target - Object to animate
 * @param {Object} config - Animation configuration
 * @param {number} [config.from=1] - Starting scale
 * @param {number} [config.to=1.05] - Target scale
 * @param {number} [config.duration=1500] - Animation duration in ms
 * @returns {Phaser.Tweens.Tween} The created tween
 * @example
 * createPulseAnimation(this, mySprite, { to: 1.1, duration: 1000 });
 */
export function createPulseAnimation(scene, target, config = {}) {
  const {
    from = 1,
    to = 1.05,
    duration = 1500
  } = config;

  return scene.tweens.add({
    targets: target,
    scale: { from, to },
    duration,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
}

/**
 * Create a floating/hovering animation
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {Phaser.GameObjects.GameObject} target - Object to animate
 * @param {Object} config - Animation configuration
 * @param {number} [config.distance=10] - Distance to float (pixels)
 * @param {number} [config.duration=1500] - Animation duration in ms
 * @returns {Phaser.Tweens.Tween} The created tween
 * @example
 * createFloatingAnimation(this, mySprite, { distance: 20, duration: 2000 });
 */
export function createFloatingAnimation(scene, target, config = {}) {
  const {
    distance = 10,
    duration = 1500
  } = config;

  const originalY = target.y;

  return scene.tweens.add({
    targets: target,
    y: originalY - distance,
    duration,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
}

/**
 * Create a shake/wiggle animation
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {Phaser.GameObjects.GameObject} target - Object to animate
 * @param {Object} config - Animation configuration
 * @param {number} [config.distance=3] - Shake distance (pixels)
 * @param {number} [config.duration=90] - Animation duration in ms
 * @returns {Phaser.Tweens.Tween} The created tween
 * @example
 * createShakeAnimation(this, mySprite, { distance: 5, duration: 100 });
 */
export function createShakeAnimation(scene, target, config = {}) {
  const {
    distance = 3,
    duration = 90
  } = config;

  const originalX = target.x;

  return scene.tweens.add({
    targets: target,
    x: originalX + distance,
    duration,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.inOut'
  });
}

/**
 * Create a color cycle animation for text
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {Phaser.GameObjects.Text} target - Text object to animate
 * @param {string[]} colors - Array of color strings to cycle through
 * @param {number} [interval=100] - Time between color changes in ms
 * @returns {Phaser.Time.TimerEvent} The timer event
 * @example
 * createColorCycleAnimation(this, myText, ['#ff0000', '#00ff00', '#0000ff'], 200);
 */
export function createColorCycleAnimation(scene, target, colors, interval = 100) {
  let colorIndex = 0;
  
  return scene.time.addEvent({
    delay: interval,
    callback: () => {
      colorIndex = (colorIndex + 1) % colors.length;
      target.setFill(colors[colorIndex]);
    },
    loop: true
  });
}

/**
 * Create a rotation wiggle animation
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {Phaser.GameObjects.GameObject} target - Object to animate
 * @param {Object} config - Animation configuration
 * @param {number} [config.from=-2] - Starting angle (degrees)
 * @param {number} [config.to=2] - Target angle (degrees)
 * @param {number} [config.duration=1200] - Animation duration in ms
 * @returns {Phaser.Tweens.Tween} The created tween
 * @example
 * createRotationWiggle(this, mySprite, { from: -5, to: 5, duration: 1000 });
 */
export function createRotationWiggle(scene, target, config = {}) {
  const {
    from = -2,
    to = 2,
    duration = 1200
  } = config;

  return scene.tweens.add({
    targets: target,
    angle: { from, to },
    duration,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
}

/**
 * Create an alpha fade-in animation
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {Phaser.GameObjects.GameObject} target - Object to animate
 * @param {Object} config - Animation configuration
 * @param {number} [config.from=0] - Starting alpha
 * @param {number} [config.to=1] - Target alpha
 * @param {number} [config.duration=600] - Animation duration in ms
 * @param {Function} [config.onComplete] - Callback when animation completes
 * @returns {Phaser.Tweens.Tween} The created tween
 * @example
 * createFadeIn(this, mySprite, { duration: 1000, onComplete: () => console.log('Faded in!') });
 */
export function createFadeIn(scene, target, config = {}) {
  const {
    from = 0,
    to = 1,
    duration = 600,
    onComplete
  } = config;

  return scene.tweens.add({
    targets: target,
    alpha: { from, to },
    duration,
    ease: 'Power2',
    onComplete
  });
}

/**
 * Create an alpha fade-out animation
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {Phaser.GameObjects.GameObject} target - Object to animate
 * @param {Object} config - Animation configuration
 * @param {number} [config.from=1] - Starting alpha
 * @param {number} [config.to=0] - Target alpha
 * @param {number} [config.duration=600] - Animation duration in ms
 * @param {boolean} [config.destroy=false] - Destroy object after fade
 * @param {Function} [config.onComplete] - Callback when animation completes
 * @returns {Phaser.Tweens.Tween} The created tween
 * @example
 * createFadeOut(this, mySprite, { duration: 500, destroy: true });
 */
export function createFadeOut(scene, target, config = {}) {
  const {
    from = 1,
    to = 0,
    duration = 600,
    destroy = false,
    onComplete
  } = config;

  return scene.tweens.add({
    targets: target,
    alpha: { from, to },
    duration,
    ease: 'Power2',
    onComplete: () => {
      if (destroy && target.destroy) {
        target.destroy();
      }
      if (onComplete) {
        onComplete();
      }
    }
  });
}

/**
 * Create a scale-up entrance animation
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {Phaser.GameObjects.GameObject} target - Object to animate
 * @param {Object} config - Animation configuration
 * @param {number} [config.from=0] - Starting scale
 * @param {number} [config.to=1] - Target scale
 * @param {number} [config.duration=300] - Animation duration in ms
 * @returns {Phaser.Tweens.Tween} The created tween
 * @example
 * createScaleIn(this, mySprite, { from: 0.5, duration: 400 });
 */
export function createScaleIn(scene, target, config = {}) {
  const {
    from = 0,
    to = 1,
    duration = 300
  } = config;

  return scene.tweens.add({
    targets: target,
    scale: { from, to },
    duration,
    ease: 'Back.easeOut'
  });
}

/**
 * Create a flickering alpha animation (damage flash)
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {Phaser.GameObjects.GameObject} target - Object to animate
 * @param {Object} config - Animation configuration
 * @param {number} [config.minAlpha=0.3] - Minimum alpha value
 * @param {number} [config.maxAlpha=1] - Maximum alpha value
 * @param {number} [config.duration=400] - Animation duration in ms
 * @returns {Phaser.Tweens.Tween} The created tween
 * @example
 * createFlickerAnimation(this, mySprite, { duration: 300 });
 */
export function createFlickerAnimation(scene, target, config = {}) {
  const {
    minAlpha = 0.3,
    maxAlpha = 1,
    duration = 400
  } = config;

  return scene.tweens.add({
    targets: target,
    alpha: { from: maxAlpha, to: minAlpha },
    duration,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
}

/**
 * Create a button hover scale animation
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {Phaser.GameObjects.GameObject|Phaser.GameObjects.GameObject[]} targets - Button object(s) to animate
 * @param {Object} config - Animation configuration
 * @param {number} [config.to=1.15] - Hover scale
 * @param {number} [config.duration=200] - Animation duration in ms
 * @returns {Phaser.Tweens.Tween} The created tween
 * @example
 * createButtonHoverScale(this, [button, text], { to: 1.1 });
 */
export function createButtonHoverScale(scene, targets, config = {}) {
  const {
    to = 1.15,
    duration = 200
  } = config;

  return scene.tweens.add({
    targets,
    scaleX: to,
    scaleY: to,
    duration,
    ease: 'Power2'
  });
}

/**
 * Create a button unhover scale animation (return to normal)
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {Phaser.GameObjects.GameObject|Phaser.GameObjects.GameObject[]} targets - Button object(s) to animate
 * @param {Object} config - Animation configuration
 * @param {number} [config.to=1] - Normal scale
 * @param {number} [config.duration=200] - Animation duration in ms
 * @returns {Phaser.Tweens.Tween} The created tween
 * @example
 * createButtonUnhoverScale(this, [button, text]);
 */
export function createButtonUnhoverScale(scene, targets, config = {}) {
  const {
    to = 1,
    duration = 200
  } = config;

  return scene.tweens.add({
    targets,
    scaleX: to,
    scaleY: to,
    duration,
    ease: 'Power2'
  });
}

/**
 * Create a flash/hit tint animation
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {Phaser.GameObjects.GameObject} target - Object to tint
 * @param {Object} config - Animation configuration
 * @param {number} [config.tintColor=0xff6666] - Tint color
 * @param {number} [config.duration=80] - Flash duration in ms
 * @returns {void}
 * @example
 * createFlashTint(this, enemy, { tintColor: 0xff0000, duration: 100 });
 */
export function createFlashTint(scene, target, config = {}) {
  const {
    tintColor = 0xff6666,
    duration = 80
  } = config;

  if (target.setTint) {
    target.setTint(tintColor);
    scene.time.delayedCall(duration, () => {
      if (target.clearTint) {
        target.clearTint();
      }
    });
  }
}

/**
 * Create an explosion scale effect
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {Phaser.GameObjects.GameObject} target - Object to animate
 * @param {Object} config - Animation configuration
 * @param {number} [config.scale=1.1] - Target scale
 * @param {number} [config.duration=220] - Animation duration in ms
 * @param {boolean} [config.destroy=true] - Destroy after animation
 * @returns {Phaser.Tweens.Tween} The created tween
 * @example
 * createExplosionEffect(this, explosionGraphic, { scale: 1.5, duration: 300 });
 */
export function createExplosionEffect(scene, target, config = {}) {
  const {
    scale = 1.1,
    duration = 220,
    destroy = true
  } = config;

  return scene.tweens.add({
    targets: target,
    scale,
    alpha: 0,
    duration,
    ease: 'Power2',
    onComplete: () => {
      if (destroy && target.destroy) {
        target.destroy();
      }
    }
  });
}

/**
 * Create a floating points text animation (score popup)
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} x - World X coordinate
 * @param {number} y - World Y coordinate
 * @param {string} text - Text to display
 * @param {Object} config - Animation configuration
 * @param {number} [config.distance=80] - Float distance (pixels)
 * @param {number} [config.duration=1200] - Animation duration in ms
 * @param {Object} [config.style] - Text style object
 * @param {Phaser.Cameras.Scene2D.Camera} [config.ignoreCamera] - Camera to ignore (for world space)
 * @returns {Phaser.GameObjects.Text} The created text object
 * @example
 * createFloatingText(this, 100, 100, '+50', { distance: 100, duration: 1500 });
 */
export function createFloatingText(scene, x, y, text, config = {}) {
  const {
    distance = 80,
    duration = 1200,
    style = {
      font: 'bold 24px Arial',
      fill: '#FFD700',
      stroke: '#FF8C00',
      strokeThickness: 2
    },
    ignoreCamera = null
  } = config;

  const textObj = scene.add.text(x, y, text, style);
  textObj.setOrigin(0.5, 0.5);
  textObj.setDepth(1000);

  if (ignoreCamera) {
    ignoreCamera.ignore(textObj);
  }

  scene.tweens.add({
    targets: textObj,
    y: y - distance,
    alpha: 0,
    duration,
    ease: 'Quad.easeOut',
    onComplete: () => {
      textObj.destroy();
    }
  });

  return textObj;
}

/**
 * Create an arm swing animation (attack motion)
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {Phaser.GameObjects.GameObject} arm - Arm object to animate
 * @param {Object} config - Animation configuration
 * @param {number} [config.rotation=0.7] - Rotation amount (radians)
 * @param {number} [config.duration=120] - Animation duration in ms
 * @param {boolean} [config.isLeft=true] - Is this the left arm?
 * @returns {Phaser.Tweens.Tween} The created tween
 * @example
 * createArmSwing(this, leftArm, { rotation: 0.8, isLeft: true });
 */
export function createArmSwing(scene, arm, config = {}) {
  const {
    rotation = 0.7,
    duration = 120,
    isLeft = true
  } = config;

  const rotAmount = isLeft ? -rotation : rotation;

  return scene.tweens.add({
    targets: arm,
    rotation: arm.rotation + rotAmount,
    duration,
    yoyo: true,
    repeat: 0,
    ease: 'Sine.out'
  });
}

/**
 * Create a weapon swing animation
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {Phaser.GameObjects.GameObject} weapon - Weapon object to animate
 * @param {Object} config - Animation configuration
 * @param {number} [config.rotation=1.2] - Rotation amount (radians)
 * @param {number} [config.duration=150] - Animation duration in ms
 * @returns {Phaser.Tweens.Tween} The created tween
 * @example
 * createWeaponSwing(this, sword, { rotation: 1.5, duration: 120 });
 */
export function createWeaponSwing(scene, weapon, config = {}) {
  const {
    rotation = 1.2,
    duration = 150
  } = config;

  return scene.tweens.add({
    targets: weapon,
    rotation: weapon.rotation + rotation,
    duration,
    yoyo: true,
    repeat: 0,
    ease: 'Sine.out'
  });
}
