/**
 * Procedural Sprite Generator
 * Creates random 2D sprites based on character role.
 * Uses Phaser graphics to draw pixel-art style characters.
 * 
 * No image files needed—all generated in code!
 */

/**
 * Generate a random character sprite
 * Returns a Phaser container with the character drawn
 */
export function generateCharacterSprite(scene, role = 'Male', x = 0, y = 0, customColors = null) {
  console.log(`[SpriteGen] Creating sprite for role: ${role} at (${x}, ${y})`);
  console.log(`[SpriteGen] Scene key: ${scene.scene.key}`);
  console.trace();  // Log the call stack to see where this was called from
  
  const container = scene.add.container(x, y);
  
  // Generate color palette for this character
  const colors = customColors || generateColorPalette(role);
  console.log(`[SpriteGen] Colors:`, colors);
  
  // Draw character based on role
  switch (role) {
    case 'Male':
      drawMaleCharacter(scene, container, colors);
      break;
    case 'archer':
      drawArcherCharacter(scene, container, colors);
      break;
    case 'brute':
      drawBruteCharacter(scene, container, colors);
      break;
    case 'gunner':
      drawGunnerCharacter(scene, container, colors);
      break;
    default:
      drawMaleCharacter(scene, container, colors);
  }

  console.log(`[SpriteGen] Container children count:`, container.length);
  console.log(`[SpriteGen] Container:`, container);
  
  // Store metadata
  container.setData('role', role);
  container.setData('colors', colors);
  
  return container;
}

/**
 * Generate random colors for a character
 */
function generateColorPalette(role) {
  const baseColors = {
    Male: [0x2c3e50, 0x3498db, 0x95a5a6],      // Blue warrior
    archer: [0x27ae60, 0xf39c12, 0x95a5a6],   // Green archer
    brute: [0x8b4513, 0x7f3f00, 0xb8860b],    // Brown brute
    gunner: [0x34495e, 0xec7063, 0x2c3e50]    // Dark gunner
  };

  const colors = baseColors[role] || baseColors['Male'];
  
  // Add random variation to colors
  return {
    primary: randomizeColor(colors[0]),
    secondary: randomizeColor(colors[1]),
    accent: randomizeColor(colors[2]),
    skin: 0xf4a460
  };
}

/**
 * Randomize a color slightly
 */
function randomizeColor(baseColor) {
  const r = (baseColor >> 16) & 255;
  const g = (baseColor >> 8) & 255;
  const b = baseColor & 255;

  const variance = 20;
  const rr = Math.max(0, Math.min(255, r + random(-variance, variance)));
  const gg = Math.max(0, Math.min(255, g + random(-variance, variance)));
  const bb = Math.max(0, Math.min(255, b + random(-variance, variance)));

  return (rr << 16) | (gg << 8) | bb;
}

/**
 * Draw Male character (basic warrior) with animatable limbs
 */
function drawMaleCharacter(scene, container, colors) {
  console.log('[SpriteGen] Drawing Male character...');

  // Draw body (static)
  const bodyGraphics = scene.add.graphics();
  
  // Head
  bodyGraphics.fillStyle(colors.skin, 1);
  bodyGraphics.fillCircle(0, -8, 6);

  // Body
  bodyGraphics.fillStyle(colors.primary, 1);
  bodyGraphics.fillRect(-5, 0, 10, 12);

  // Chest plate
  bodyGraphics.fillStyle(colors.secondary, 1);
  bodyGraphics.fillRect(-4, 2, 8, 6);
  bodyGraphics.lineStyle(1, 0x000000, 0.5);
  bodyGraphics.strokeRect(-4, 2, 8, 6);

  // Legs
  bodyGraphics.fillStyle(colors.primary, 1);
  bodyGraphics.fillRect(-4, 12, 3, 8);
  bodyGraphics.fillRect(1, 12, 3, 8);

  container.add(bodyGraphics);

  // Create left arm graphics (will be animated)
  const leftArmGraphics = scene.add.graphics();
  leftArmGraphics.fillStyle(colors.skin, 1);
  leftArmGraphics.fillRect(-1.5, 0, 3, 10);
  leftArmGraphics.x = -7;
  leftArmGraphics.y = 4;
  container.add(leftArmGraphics);
  container.leftArm = leftArmGraphics;

  // Create right arm graphics (will be animated)
  const rightArmGraphics = scene.add.graphics();
  rightArmGraphics.fillStyle(colors.skin, 1);
  rightArmGraphics.fillRect(-1.5, 0, 3, 10);
  rightArmGraphics.x = 7;
  rightArmGraphics.y = 4;
  container.add(rightArmGraphics);
  container.rightArm = rightArmGraphics;

  // Create sword graphics (will be animated)
  const swordGraphics = scene.add.graphics();
  swordGraphics.lineStyle(2, colors.accent, 1);
  swordGraphics.lineBetween(0, 0, 2, -8);
  swordGraphics.x = 8;
  swordGraphics.y = 6;
  container.add(swordGraphics);
  container.weapon = swordGraphics;

  console.log('[SpriteGen] Male character complete with animatable parts');
}

/**
 * Draw Archer character (with bow) - with animatable limbs
 */
function drawArcherCharacter(scene, container, colors) {
  // Draw body (static)
  const bodyGraphics = scene.add.graphics();

  // Head
  bodyGraphics.fillStyle(colors.skin, 1);
  bodyGraphics.fillCircle(0, -8, 6);

  // Body
  bodyGraphics.fillStyle(colors.primary, 1);
  bodyGraphics.fillRect(-5, 0, 10, 12);

  // Chest armor
  bodyGraphics.fillStyle(colors.secondary, 1);
  bodyGraphics.fillRect(-4, 2, 8, 5);

  // Legs
  bodyGraphics.fillStyle(colors.primary, 1);
  bodyGraphics.fillRect(-4, 12, 3, 8);
  bodyGraphics.fillRect(1, 12, 3, 8);

  container.add(bodyGraphics);

  // Create left arm graphics (will be animated)
  const leftArmGraphics = scene.add.graphics();
  leftArmGraphics.fillStyle(colors.skin, 1);
  leftArmGraphics.fillRect(-1.5, 0, 3, 10);
  leftArmGraphics.x = -7;
  leftArmGraphics.y = 4;
  container.add(leftArmGraphics);
  container.leftArm = leftArmGraphics;

  // Create right arm graphics (will be animated)
  const rightArmGraphics = scene.add.graphics();
  rightArmGraphics.fillStyle(colors.skin, 1);
  rightArmGraphics.fillRect(-1.5, 0, 3, 10);
  rightArmGraphics.x = 7;
  rightArmGraphics.y = 4;
  container.add(rightArmGraphics);
  container.rightArm = rightArmGraphics;

  // Create bow graphics (will be animated)
  const bowGraphics = scene.add.graphics();
  bowGraphics.lineStyle(2, colors.accent, 1);
  bowGraphics.beginPath();
  bowGraphics.arc(0, 0, 4, -0.7, 0.7, false);
  bowGraphics.strokePath();
  
  // Arrow
  bowGraphics.lineStyle(1, 0xd4af37, 1);
  bowGraphics.lineBetween(0, -4, -1, 0);
  
  bowGraphics.x = 7;
  bowGraphics.y = 4;
  container.add(bowGraphics);
  container.weapon = bowGraphics;
}

/**
 * Draw Brute character (heavy armor) - with animatable limbs
 */
function drawBruteCharacter(scene, container, colors) {
  // Draw body (static)
  const bodyGraphics = scene.add.graphics();

  // Head
  bodyGraphics.fillStyle(colors.skin, 1);
  bodyGraphics.fillCircle(0, -8, 7);

  // Helmet
  bodyGraphics.fillStyle(colors.primary, 1);
  bodyGraphics.fillRect(-6, -14, 12, 6);
  bodyGraphics.lineStyle(1, 0x000000, 0.5);
  bodyGraphics.strokeRect(-6, -14, 12, 6);

  // Body
  bodyGraphics.fillStyle(colors.primary, 1);
  bodyGraphics.fillRect(-7, 0, 14, 12);

  // Chest plate (heavy)
  bodyGraphics.fillStyle(colors.secondary, 1);
  bodyGraphics.fillRect(-6, 2, 12, 6);
  bodyGraphics.lineStyle(2, 0x000000, 0.5);
  bodyGraphics.strokeRect(-6, 2, 12, 6);

  // Legs
  bodyGraphics.fillStyle(colors.primary, 1);
  bodyGraphics.fillRect(-5, 12, 4, 8);
  bodyGraphics.fillRect(1, 12, 4, 8);

  container.add(bodyGraphics);

  // Create left arm graphics (will be animated)
  const leftArmGraphics = scene.add.graphics();
  leftArmGraphics.fillStyle(colors.primary, 1);
  leftArmGraphics.fillRect(-1.5, 0, 3, 10);
  leftArmGraphics.x = -9;
  leftArmGraphics.y = 4;
  container.add(leftArmGraphics);
  container.leftArm = leftArmGraphics;

  // Create right arm graphics (will be animated)
  const rightArmGraphics = scene.add.graphics();
  rightArmGraphics.fillStyle(colors.primary, 1);
  rightArmGraphics.fillRect(-1.5, 0, 3, 10);
  rightArmGraphics.x = 9;
  rightArmGraphics.y = 4;
  container.add(rightArmGraphics);
  container.rightArm = rightArmGraphics;

  // Create axe graphics (will be animated)
  const axeGraphics = scene.add.graphics();
  axeGraphics.fillStyle(colors.accent, 1);
  axeGraphics.fillRect(-2, -7, 4, 14);
  axeGraphics.fillTriangleShape([
    { x: -2, y: -8 },
    { x: 2, y: -8 },
    { x: 0, y: -13 }
  ]);
  axeGraphics.x = 8;
  axeGraphics.y = -2;
  container.add(axeGraphics);
  container.weapon = axeGraphics;
}

/**
 * Draw Gunner character (with gun) - with animatable limbs
 */
function drawGunnerCharacter(scene, container, colors) {
  // Draw body (static)
  const bodyGraphics = scene.add.graphics();

  // Head
  bodyGraphics.fillStyle(colors.skin, 1);
  bodyGraphics.fillCircle(0, -8, 6);

  // Goggle/Hat
  bodyGraphics.fillStyle(colors.secondary, 1);
  bodyGraphics.fillRect(-6, -10, 12, 3);

  // Body
  bodyGraphics.fillStyle(colors.primary, 1);
  bodyGraphics.fillRect(-5, 0, 10, 12);

  // Gear vest
  bodyGraphics.fillStyle(0x696969, 1);
  bodyGraphics.fillRect(-5, 1, 4, 6);
  bodyGraphics.fillRect(1, 1, 4, 6);
  bodyGraphics.lineStyle(1, 0xffd700, 0.6);
  bodyGraphics.lineBetween(-3, 1, -3, 7);
  bodyGraphics.lineBetween(3, 1, 3, 7);

  // Legs
  bodyGraphics.fillStyle(colors.primary, 1);
  bodyGraphics.fillRect(-4, 12, 3, 8);
  bodyGraphics.fillRect(1, 12, 3, 8);

  container.add(bodyGraphics);

  // Create left arm graphics (will be animated)
  const leftArmGraphics = scene.add.graphics();
  leftArmGraphics.fillStyle(colors.accent, 1);
  leftArmGraphics.fillRect(-1.5, 0, 3, 10);
  leftArmGraphics.x = -7;
  leftArmGraphics.y = 4;
  container.add(leftArmGraphics);
  container.leftArm = leftArmGraphics;

  // Create right arm graphics (will be animated)
  const rightArmGraphics = scene.add.graphics();
  rightArmGraphics.fillStyle(colors.accent, 1);
  rightArmGraphics.fillRect(-1.5, 0, 3, 10);
  rightArmGraphics.x = 7;
  rightArmGraphics.y = 4;
  container.add(rightArmGraphics);
  container.rightArm = rightArmGraphics;

  // Create gun graphics (will be animated)
  const gunGraphics = scene.add.graphics();
  gunGraphics.fillStyle(0x2f3f4f, 1);
  gunGraphics.fillRect(-3, -1.5, 6, 3);
  gunGraphics.fillRect(1, -2.5, 2, 5);
  
  // Muzzle
  gunGraphics.fillStyle(0x808080, 1);
  gunGraphics.fillCircle(3, 0, 1.5);
  
  gunGraphics.x = 6;
  gunGraphics.y = 4;
  container.add(gunGraphics);
  container.weapon = gunGraphics;
}

/**
 * Generate a random enemy sprite (slime for now)
 */
export function generateEnemySprite(scene, x = 0, y = 0, type = 'slime') {
  const container = scene.add.container(x, y);

  if (type === 'slime') {
    drawSlimeEnemy(scene, container);
  }

  return container;
}

/**
 * Draw a simple slime enemy
 */
function drawSlimeEnemy(scene, container) {
  const graphics = scene.add.graphics();
  
  // Random slime color (red variants)
  const slimeColor = randomChoice([0xcc1a1a, 0xee2b2b, 0xdd4444, 0xb31515]);
  
  // Body
  graphics.fillStyle(slimeColor, 0.8);
  graphics.fillEllipse(0, 0, 28, 24);  // fillEllipse(x, y, width, height)

  // Eyes
  graphics.fillStyle(0x000000, 1);
  graphics.fillCircle(-5, -2, 2);
  graphics.fillCircle(5, -2, 2);

  // Shine
  graphics.fillStyle(0xffffff, 0.4);
  graphics.fillCircle(-4, -6, 3);

  container.add(graphics);
}

/**
 * Utility: Random integer between min and max
 */
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Utility: Pick random item from array
 */
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Draw Male character back view
 */
function drawMaleCharacterBack(scene, container, colors) {
  // Draw body (static)
  const bodyGraphics = scene.add.graphics();
  
  // Head (back view - same)
  bodyGraphics.fillStyle(colors.skin, 1);
  bodyGraphics.fillCircle(0, -8, 6);

  // Body
  bodyGraphics.fillStyle(colors.primary, 1);
  bodyGraphics.fillRect(-5, 0, 10, 12);

  // Back plate detail
  bodyGraphics.fillStyle(colors.secondary, 1);
  bodyGraphics.fillRect(-4, 3, 8, 5);
  bodyGraphics.lineStyle(1, 0x000000, 0.5);
  bodyGraphics.strokeRect(-4, 3, 8, 5);

  // Legs
  bodyGraphics.fillStyle(colors.primary, 1);
  bodyGraphics.fillRect(-4, 12, 3, 8);
  bodyGraphics.fillRect(1, 12, 3, 8);

  container.add(bodyGraphics);

  // Create left arm graphics (back view - reversed position)
  const leftArmGraphics = scene.add.graphics();
  leftArmGraphics.fillStyle(colors.skin, 1);
  leftArmGraphics.fillRect(-1.5, 0, 3, 10);
  leftArmGraphics.x = 7;  // Reversed
  leftArmGraphics.y = 4;
  container.add(leftArmGraphics);
  container.leftArm = leftArmGraphics;

  // Create right arm graphics (back view - reversed position)
  const rightArmGraphics = scene.add.graphics();
  rightArmGraphics.fillStyle(colors.skin, 1);
  rightArmGraphics.fillRect(-1.5, 0, 3, 10);
  rightArmGraphics.x = -7;  // Reversed
  rightArmGraphics.y = 4;
  container.add(rightArmGraphics);
  container.rightArm = rightArmGraphics;

  // Create sword graphics (back view - on back)
  const swordGraphics = scene.add.graphics();
  swordGraphics.lineStyle(2, colors.accent, 1);
  swordGraphics.lineBetween(0, 0, -2, -8);  // Mirrored
  swordGraphics.x = -8;  // On left side in back view
  swordGraphics.y = 6;
  container.add(swordGraphics);
  container.weapon = swordGraphics;
}

/**
 * Draw Archer character back view
 */
function drawArcherCharacterBack(scene, container, colors) {
  // Draw body (static)
  const bodyGraphics = scene.add.graphics();

  // Head
  bodyGraphics.fillStyle(colors.skin, 1);
  bodyGraphics.fillCircle(0, -8, 6);

  // Body
  bodyGraphics.fillStyle(colors.primary, 1);
  bodyGraphics.fillRect(-5, 0, 10, 12);

  // Back detail
  bodyGraphics.fillStyle(colors.secondary, 1);
  bodyGraphics.fillRect(-4, 2, 8, 5);

  // Legs
  bodyGraphics.fillStyle(colors.primary, 1);
  bodyGraphics.fillRect(-4, 12, 3, 8);
  bodyGraphics.fillRect(1, 12, 3, 8);

  container.add(bodyGraphics);

  // Create left arm graphics (back view - reversed)
  const leftArmGraphics = scene.add.graphics();
  leftArmGraphics.fillStyle(colors.skin, 1);
  leftArmGraphics.fillRect(-1.5, 0, 3, 10);
  leftArmGraphics.x = 7;
  leftArmGraphics.y = 4;
  container.add(leftArmGraphics);
  container.leftArm = leftArmGraphics;

  // Create right arm graphics (back view - reversed)
  const rightArmGraphics = scene.add.graphics();
  rightArmGraphics.fillStyle(colors.skin, 1);
  rightArmGraphics.fillRect(-1.5, 0, 3, 10);
  rightArmGraphics.x = -7;
  rightArmGraphics.y = 4;
  container.add(rightArmGraphics);
  container.rightArm = rightArmGraphics;

  // Create bow graphics (back view - on back)
  const bowGraphics = scene.add.graphics();
  bowGraphics.lineStyle(2, colors.accent, 1);
  bowGraphics.beginPath();
  bowGraphics.arc(0, 0, 4, -0.7, 0.7, false);
  bowGraphics.strokePath();
  
  // Arrow on back
  bowGraphics.lineStyle(1, 0xd4af37, 1);
  bowGraphics.lineBetween(0, -4, 1, 0);
  
  bowGraphics.x = -7;
  bowGraphics.y = 4;
  container.add(bowGraphics);
  container.weapon = bowGraphics;
}

/**
 * Draw Brute character back view
 */
function drawBruteCharacterBack(scene, container, colors) {
  // Draw body (static)
  const bodyGraphics = scene.add.graphics();

  // Head
  bodyGraphics.fillStyle(colors.skin, 1);
  bodyGraphics.fillCircle(0, -8, 7);

  // Helmet
  bodyGraphics.fillStyle(colors.primary, 1);
  bodyGraphics.fillRect(-6, -14, 12, 6);
  bodyGraphics.lineStyle(1, 0x000000, 0.5);
  bodyGraphics.strokeRect(-6, -14, 12, 6);

  // Body
  bodyGraphics.fillStyle(colors.primary, 1);
  bodyGraphics.fillRect(-7, 0, 14, 12);

  // Back plate (heavy)
  bodyGraphics.fillStyle(colors.secondary, 1);
  bodyGraphics.fillRect(-6, 2, 12, 6);
  bodyGraphics.lineStyle(2, 0x000000, 0.5);
  bodyGraphics.strokeRect(-6, 2, 12, 6);

  // Legs
  bodyGraphics.fillStyle(colors.primary, 1);
  bodyGraphics.fillRect(-5, 12, 4, 8);
  bodyGraphics.fillRect(1, 12, 4, 8);

  container.add(bodyGraphics);

  // Create left arm graphics (back view - reversed)
  const leftArmGraphics = scene.add.graphics();
  leftArmGraphics.fillStyle(colors.primary, 1);
  leftArmGraphics.fillRect(-1.5, 0, 3, 10);
  leftArmGraphics.x = 9;
  leftArmGraphics.y = 4;
  container.add(leftArmGraphics);
  container.leftArm = leftArmGraphics;

  // Create right arm graphics (back view - reversed)
  const rightArmGraphics = scene.add.graphics();
  rightArmGraphics.fillStyle(colors.primary, 1);
  rightArmGraphics.fillRect(-1.5, 0, 3, 10);
  rightArmGraphics.x = -9;
  rightArmGraphics.y = 4;
  container.add(rightArmGraphics);
  container.rightArm = rightArmGraphics;

  // Create axe graphics (back view - on back)
  const axeGraphics = scene.add.graphics();
  axeGraphics.fillStyle(colors.accent, 1);
  axeGraphics.fillRect(-2, -7, 4, 14);
  axeGraphics.fillTriangleShape([
    { x: -2, y: -8 },
    { x: 2, y: -8 },
    { x: 0, y: -13 }
  ]);
  axeGraphics.x = -8;
  axeGraphics.y = -2;
  container.add(axeGraphics);
  container.weapon = axeGraphics;
}

/**
 * Draw Gunner character back view
 */
function drawGunnerCharacterBack(scene, container, colors) {
  // Draw body (static)
  const bodyGraphics = scene.add.graphics();

  // Head
  bodyGraphics.fillStyle(colors.skin, 1);
  bodyGraphics.fillCircle(0, -8, 6);

  // Goggle/Hat (back view)
  bodyGraphics.fillStyle(colors.secondary, 1);
  bodyGraphics.fillRect(-6, -10, 12, 3);

  // Body
  bodyGraphics.fillStyle(colors.primary, 1);
  bodyGraphics.fillRect(-5, 0, 10, 12);

  // Gear vest (back view)
  bodyGraphics.fillStyle(0x696969, 1);
  bodyGraphics.fillRect(-5, 1, 4, 6);
  bodyGraphics.fillRect(1, 1, 4, 6);
  bodyGraphics.lineStyle(1, 0xffd700, 0.6);
  bodyGraphics.lineBetween(-3, 1, -3, 7);
  bodyGraphics.lineBetween(3, 1, 3, 7);

  // Legs
  bodyGraphics.fillStyle(colors.primary, 1);
  bodyGraphics.fillRect(-4, 12, 3, 8);
  bodyGraphics.fillRect(1, 12, 3, 8);

  container.add(bodyGraphics);

  // Create left arm graphics (back view - reversed)
  const leftArmGraphics = scene.add.graphics();
  leftArmGraphics.fillStyle(colors.accent, 1);
  leftArmGraphics.fillRect(-1.5, 0, 3, 10);
  leftArmGraphics.x = 7;
  leftArmGraphics.y = 4;
  container.add(leftArmGraphics);
  container.leftArm = leftArmGraphics;

  // Create right arm graphics (back view - reversed)
  const rightArmGraphics = scene.add.graphics();
  rightArmGraphics.fillStyle(colors.accent, 1);
  rightArmGraphics.fillRect(-1.5, 0, 3, 10);
  rightArmGraphics.x = -7;
  rightArmGraphics.y = 4;
  container.add(rightArmGraphics);
  container.rightArm = rightArmGraphics;

  // Create gun graphics (back view - on back)
  const gunGraphics = scene.add.graphics();
  gunGraphics.fillStyle(0x2f3f4f, 1);
  gunGraphics.fillRect(-3, -1.5, 6, 3);
  gunGraphics.fillRect(-3, -2.5, 2, 5);
  
  // Muzzle (mirrored)
  gunGraphics.fillStyle(0x808080, 1);
  gunGraphics.fillCircle(-3, 0, 1.5);
  
  gunGraphics.x = -6;
  gunGraphics.y = 4;
  container.add(gunGraphics);
  container.weapon = gunGraphics;
}

/**
 * Generate a character sprite with both front and back views
 * Returns a container with frontSprite and backSprite properties
 */
export function generateCharacterSpriteWithViews(scene, role = 'Male', x = 0, y = 0, customColors = null) {
  const mainContainer = scene.add.container(x, y);
  const colors = customColors || generateColorPalette(role);

  // Create front sprite container
  const frontContainer = scene.add.container(0, 0);
  
  switch (role) {
    case 'Male':
      drawMaleCharacter(scene, frontContainer, colors);
      break;
    case 'archer':
      drawArcherCharacter(scene, frontContainer, colors);
      break;
    case 'brute':
      drawBruteCharacter(scene, frontContainer, colors);
      break;
    case 'gunner':
      drawGunnerCharacter(scene, frontContainer, colors);
      break;
    default:
      drawMaleCharacter(scene, frontContainer, colors);
  }

  // Create back sprite container
  const backContainer = scene.add.container(0, 0);
  backContainer.setVisible(false);

  switch (role) {
    case 'Male':
      drawMaleCharacterBack(scene, backContainer, colors);
      break;
    case 'archer':
      drawArcherCharacterBack(scene, backContainer, colors);
      break;
    case 'brute':
      drawBruteCharacterBack(scene, backContainer, colors);
      break;
    case 'gunner':
      drawGunnerCharacterBack(scene, backContainer, colors);
      break;
    default:
      drawMaleCharacterBack(scene, backContainer, colors);
  }

  mainContainer.add(frontContainer);
  mainContainer.add(backContainer);

  // Store references
  mainContainer.frontSprite = frontContainer;
  mainContainer.backSprite = backContainer;
  mainContainer.setData('role', role);
  mainContainer.setData('colors', colors);

  return mainContainer;
}

/**
 * Animate this character with a bobbing effect and support front/back views
 */
export function createAnimatedCharacterWithViews(scene, role = 'Male', x = 0, y = 0, customColors = null) {
  const sprite = generateCharacterSpriteWithViews(scene, role, x, y, customColors);
  
  // Add a subtle bobbing animation to the main container
  scene.tweens.add({
    targets: sprite,
    y: y - 3,
    duration: 1000,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.inOut'
  });

  return sprite;
}

/**
 * Animate this character with a bobbing effect
 */
export function createAnimatedCharacter(scene, role = 'Male', x = 0, y = 0, customColors = null) {
  const sprite = generateCharacterSprite(scene, role, x, y, customColors);
  
  // Add a subtle bobbing animation
  scene.tweens.add({
    targets: sprite,
    y: y - 3,
    duration: 1000,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.inOut'
  });

  return sprite;
}
