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
  const container = scene.add.container(x, y);
  
  // Generate color palette for this character
  const colors = customColors || generateColorPalette(role);
  
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

  container.add(bodyGraphics);

  addLegLimbs(scene, container, {
    color: colors.primary,
    width: 3,
    height: 8,
    leftX: -2.5,
    rightX: 2.5,
    y: 12
  });

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

  container.add(bodyGraphics);

  addLegLimbs(scene, container, {
    color: colors.primary,
    width: 3,
    height: 8,
    leftX: -2.5,
    rightX: 2.5,
    y: 12
  });

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

  container.add(bodyGraphics);

  addLegLimbs(scene, container, {
    color: colors.primary,
    width: 4,
    height: 8,
    leftX: -3,
    rightX: 3,
    y: 12
  });

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

  container.add(bodyGraphics);

  addLegLimbs(scene, container, {
    color: colors.primary,
    width: 3,
    height: 8,
    leftX: -2.5,
    rightX: 2.5,
    y: 12
  });

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
 * Generate a random enemy sprite
 */
export function generateEnemySprite(scene, x = 0, y = 0, type = 'slime') {
  const container = scene.add.container(x, y);

  if (type === 'slime') {
    drawSlimeEnemy(scene, container);
  } else if (type === 'devil') {
    drawDevilEnemy(scene, container);
  } else if (type === 'skeleton') {
    drawSkeletonEnemy(scene, container);
  } else if (type === 'frost_wraith') {
    drawFrostWraithEnemy(scene, container);
  } else if (type === 'bomber_beetle') {
    drawBomberBeetleEnemy(scene, container);
  } else if (type === 'storm_mage') {
    drawStormMageEnemy(scene, container);
  } else if (type === 'anomaly_rift') {
    drawAnomalyRiftEnemy(scene, container);
  } else if (type === 'ironbound_colossus') {
    drawIronboundColossusEnemy(scene, container);
  } else if (type === 'crucible_knight') {
    drawCrucibleKnightEnemy(scene, container);
  } else if (type === 'ember_witch') {
    drawEmberWitchEnemy(scene, container);
  } else {
    drawSlimeEnemy(scene, container);
  }

  container.setData('type', type);
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
 * Draw a devil enemy with wings, tail, and trident
 */
function drawDevilEnemy(scene, container) {
  const glow = scene.add.graphics();
  glow.fillStyle(0xff3a1a, 0.25);
  glow.fillCircle(0, 0, 20);
  container.add(glow);
  container.glow = glow;

  const body = scene.add.graphics();
  body.fillStyle(0x6f0f12, 1);
  body.fillEllipse(0, 6, 30, 28);
  body.fillStyle(0x8b1a1d, 1);
  body.fillEllipse(0, -2, 24, 20);
  body.fillStyle(0x1c0a0a, 1);
  body.fillCircle(-6, -6, 2.5);
  body.fillCircle(6, -6, 2.5);
  body.fillStyle(0xff6a00, 1);
  body.fillCircle(-6, -6, 1);
  body.fillCircle(6, -6, 1);
  container.add(body);

  const horns = scene.add.graphics();
  horns.fillStyle(0xe6d6c7, 1);
  horns.fillTriangleShape(new Phaser.Geom.Triangle(-10, -16, -4, -8, -12, -8));
  horns.fillTriangleShape(new Phaser.Geom.Triangle(10, -16, 4, -8, 12, -8));
  container.add(horns);

  const wings = scene.add.graphics();
  wings.fillStyle(0x3a0b0c, 0.9);
  wings.fillTriangleShape(new Phaser.Geom.Triangle(-18, -2, -36, 8, -16, 8));
  wings.fillTriangleShape(new Phaser.Geom.Triangle(18, -2, 36, 8, 16, 8));
  wings.fillStyle(0x5a1315, 0.8);
  wings.fillTriangleShape(new Phaser.Geom.Triangle(-18, 0, -30, 14, -12, 10));
  wings.fillTriangleShape(new Phaser.Geom.Triangle(18, 0, 30, 14, 12, 10));
  container.add(wings);
  container.wings = wings;

  const tail = scene.add.graphics();
  tail.lineStyle(3, 0x2b0809, 1);
  tail.beginPath();
  tail.moveTo(6, 14);
  tail.lineTo(18, 22);
  tail.lineTo(24, 28);
  tail.strokePath();
  tail.fillStyle(0xffa319, 1);
  tail.fillTriangleShape(new Phaser.Geom.Triangle(24, 28, 30, 30, 24, 32));
  container.add(tail);
  container.tail = tail;

  const trident = scene.add.graphics();
  trident.lineStyle(2, 0x2b1c1c, 1);
  trident.lineBetween(0, 0, 0, -18);
  trident.lineBetween(-6, -14, 6, -14);
  trident.fillStyle(0xffaa33, 1);
  trident.fillTriangleShape(new Phaser.Geom.Triangle(-6, -14, -3, -20, 0, -14));
  trident.fillTriangleShape(new Phaser.Geom.Triangle(0, -14, 3, -20, 6, -14));
  trident.fillTriangleShape(new Phaser.Geom.Triangle(6, -14, 9, -20, 12, -14));
  trident.x = 12;
  trident.y = 10;
  container.add(trident);
  container.weapon = trident;
}

/**
 * Draw a skeleton enemy with bow
 */
function drawSkeletonEnemy(scene, container) {
  // Skull
  const skull = scene.add.graphics();
  skull.fillStyle(0xe8dcc8, 1);
  skull.fillEllipse(0, -8, 16, 18);
  // Eye sockets
  skull.fillStyle(0x1a1a1a, 1);
  skull.fillEllipse(-4, -10, 5, 7);
  skull.fillEllipse(4, -10, 5, 7);
  // Glowing eyes
  skull.fillStyle(0xff3300, 0.9);
  skull.fillCircle(-4, -10, 2);
  skull.fillCircle(4, -10, 2);
  // Nose hole
  skull.fillStyle(0x1a1a1a, 1);
  skull.fillTriangleShape(new Phaser.Geom.Triangle(-2, -6, 2, -6, 0, -2));
  // Jaw line
  skull.lineStyle(1.5, 0x2a2a2a, 0.6);
  skull.lineBetween(-6, -2, 6, -2);
  container.add(skull);
  container.skull = skull;

  // Ribcage
  const ribs = scene.add.graphics();
  ribs.fillStyle(0xd4c4b0, 1);
  ribs.fillEllipse(0, 4, 18, 20);
  // Rib lines
  ribs.lineStyle(1.5, 0x9a8a76, 0.8);
  for (let i = 0; i < 4; i++) {
    const y = -2 + i * 4;
    ribs.beginPath();
    ribs.arc(0, y, 8, -2.8, -0.3, false);
    ribs.strokePath();
    ribs.beginPath();
    ribs.arc(0, y, 8, 0.3, 2.8, false);
    ribs.strokePath();
  }
  container.add(ribs);

  // Pelvis
  const pelvis = scene.add.graphics();
  pelvis.fillStyle(0xcab8a4, 1);
  pelvis.fillEllipse(0, 14, 14, 8);
  pelvis.lineStyle(1.5, 0x8a7a66, 0.6);
  pelvis.strokeEllipse(0, 14, 14, 8);
  container.add(pelvis);

  // Left arm bones
  const leftArm = scene.add.graphics();
  leftArm.lineStyle(3, 0xd4c4b0, 1);
  leftArm.lineBetween(0, 0, 0, 10);
  leftArm.fillStyle(0xc4b4a0, 1);
  leftArm.fillCircle(0, 0, 2.5);
  leftArm.fillCircle(0, 10, 2);
  leftArm.x = -10;
  leftArm.y = 2;
  container.add(leftArm);
  container.leftArm = leftArm;

  // Right arm bones
  const rightArm = scene.add.graphics();
  rightArm.lineStyle(3, 0xd4c4b0, 1);
  rightArm.lineBetween(0, 0, 0, 10);
  rightArm.fillStyle(0xc4b4a0, 1);
  rightArm.fillCircle(0, 0, 2.5);
  rightArm.fillCircle(0, 10, 2);
  rightArm.x = 10;
  rightArm.y = 2;
  container.add(rightArm);
  container.rightArm = rightArm;

  // Bow
  const bow = scene.add.graphics();
  bow.lineStyle(2.5, 0x5a3a1a, 1);
  bow.beginPath();
  bow.arc(0, 0, 8, -1.2, 1.2, false);
  bow.strokePath();
  // Bowstring
  bow.lineStyle(1, 0x8a8a8a, 0.9);
  bow.lineBetween(0, -8, 0, 8);
  bow.x = 12;
  bow.y = 6;
  container.add(bow);
  container.weapon = bow;

  // Arrow (initially at rest)
  const arrow = scene.add.graphics();
  arrow.lineStyle(1.5, 0x7a5a3a, 1);
  arrow.lineBetween(-6, 0, 2, 0);
  arrow.fillStyle(0x9a9a9a, 1);
  arrow.fillTriangleShape(new Phaser.Geom.Triangle(2, 0, 4, -2, 4, 2));
  arrow.x = 12;
  arrow.y = 6;
  arrow.visible = false;
  container.add(arrow);
  container.arrow = arrow;
}

/**
 * Draw a frost wraith enemy (ghost-like ice creature)
 */
function drawFrostWraithEnemy(scene, container) {
  const aura = scene.add.graphics();
  aura.fillStyle(0x00d4ff, 0.15);
  aura.fillCircle(0, 0, 24);
  aura.fillStyle(0x00f4ff, 0.1);
  aura.fillCircle(0, 0, 32);
  container.add(aura);
  container.aura = aura;

  const body = scene.add.graphics();
  body.fillStyle(0xb3e5fc, 0.85);
  body.fillEllipse(0, -4, 26, 30);
  body.fillStyle(0x81d4fa, 0.9);
  body.fillEllipse(0, 0, 22, 24);
  container.add(body);

  const crystals = scene.add.graphics();
  crystals.fillStyle(0xe1f5fe, 1);
  crystals.fillTriangleShape(new Phaser.Geom.Triangle(-6, -8, -4, -14, -2, -8));
  crystals.fillTriangleShape(new Phaser.Geom.Triangle(2, -10, 4, -16, 6, -10));
  crystals.fillTriangleShape(new Phaser.Geom.Triangle(-8, 2, -6, -2, -4, 2));
  crystals.fillTriangleShape(new Phaser.Geom.Triangle(4, 4, 6, 0, 8, 4));
  container.add(crystals);
  container.crystals = crystals;

  const eyes = scene.add.graphics();
  eyes.fillStyle(0x00bcd4, 1);
  eyes.fillCircle(-5, -4, 3);
  eyes.fillCircle(5, -4, 3);
  eyes.fillStyle(0xffffff, 0.8);
  eyes.fillCircle(-5, -4, 1.5);
  eyes.fillCircle(5, -4, 1.5);
  container.add(eyes);

  const tail = scene.add.graphics();
  tail.fillStyle(0xb3e5fc, 0.6);
  tail.fillEllipse(0, 12, 18, 10);
  tail.fillStyle(0x81d4fa, 0.5);
  tail.fillEllipse(-2, 18, 12, 8);
  tail.fillEllipse(2, 16, 10, 6);
  tail.fillStyle(0xb3e5fc, 0.4);
  tail.fillEllipse(0, 22, 8, 6);
  container.add(tail);
  container.tail = tail;

  const shards = scene.add.graphics();
  shards.fillStyle(0xe1f5fe, 0.9);
  shards.fillTriangleShape(new Phaser.Geom.Triangle(-18, -6, -16, -10, -14, -6));
  shards.fillTriangleShape(new Phaser.Geom.Triangle(14, -8, 16, -12, 18, -8));
  shards.fillTriangleShape(new Phaser.Geom.Triangle(-16, 8, -14, 4, -12, 8));
  container.add(shards);
  container.shards = shards;
}

/**
 * Draw a bomber beetle enemy (explosive bug)
 */
function drawBomberBeetleEnemy(scene, container) {
  const shadow = scene.add.graphics();
  shadow.fillStyle(0x000000, 0.2);
  shadow.fillEllipse(0, 18, 24, 8);
  container.add(shadow);

  const body = scene.add.graphics();
  body.fillStyle(0x3e2723, 1);
  body.fillEllipse(0, 0, 28, 32);
  body.lineStyle(2, 0x1a1007, 0.8);
  body.lineBetween(-8, -8, 8, -8);
  body.lineBetween(-10, 0, 10, 0);
  body.lineBetween(-8, 8, 8, 8);
  body.fillStyle(0xf57c00, 0.8);
  body.fillRect(-12, -4, 24, 3);
  body.fillRect(-12, 4, 24, 3);
  container.add(body);

  const head = scene.add.graphics();
  head.fillStyle(0x5d4037, 1);
  head.fillEllipse(0, -18, 16, 14);
  head.fillStyle(0xff6f00, 1);
  head.fillCircle(-4, -18, 3);
  head.fillCircle(4, -18, 3);
  head.fillStyle(0x000000, 1);
  head.fillCircle(-4, -18, 1.5);
  head.fillCircle(4, -18, 1.5);
  container.add(head);

  const antennae = scene.add.graphics();
  antennae.lineStyle(2, 0x5d4037, 1);
  antennae.lineBetween(-4, -24, -8, -30);
  antennae.lineBetween(4, -24, 8, -30);
  antennae.fillStyle(0xff6f00, 1);
  antennae.fillCircle(-8, -30, 2);
  antennae.fillCircle(8, -30, 2);
  container.add(antennae);
  container.antennae = antennae;

  const legs = scene.add.graphics();
  legs.lineStyle(2.5, 0x3e2723, 1);
  legs.lineBetween(-12, -6, -18, -2);
  legs.lineBetween(-12, 0, -20, 4);
  legs.lineBetween(-12, 6, -18, 12);
  legs.lineBetween(12, -6, 18, -2);
  legs.lineBetween(12, 0, 20, 4);
  legs.lineBetween(12, 6, 18, 12);
  container.add(legs);
  container.legs = legs;

  const bomb = scene.add.graphics();
  bomb.fillStyle(0xff3d00, 0.3);
  bomb.fillCircle(0, 4, 10);
  bomb.fillStyle(0x212121, 1);
  bomb.fillCircle(0, 4, 6);
  bomb.fillStyle(0xff6f00, 1);
  bomb.fillCircle(0, 4, 3);
  bomb.lineStyle(1.5, 0x424242, 1);
  bomb.beginPath();
  bomb.moveTo(0, -2);
  bomb.lineTo(-2, -6);
  bomb.lineTo(0, -10);
  bomb.strokePath();
  bomb.fillStyle(0xff9800, 1);
  bomb.fillCircle(0, -10, 1.5);
  container.add(bomb);
  container.bomb = bomb;
}

/**
 * Draw a storm mage enemy (lightning wielding wizard)
 */
function drawStormMageEnemy(scene, container) {
  const aura = scene.add.graphics();
  aura.fillStyle(0x9c27b0, 0.15);
  aura.fillCircle(0, 0, 28);
  aura.fillStyle(0x7b1fa2, 0.1);
  aura.fillCircle(0, 0, 36);
  container.add(aura);
  container.aura = aura;

  const robe = scene.add.graphics();
  robe.fillStyle(0x4a148c, 1);
  robe.fillEllipse(0, 8, 32, 30);
  robe.fillStyle(0x6a1b9a, 1);
  robe.fillRect(-14, -4, 28, 12);
  robe.lineStyle(2, 0x9c27b0, 0.9);
  robe.lineBetween(-14, -4, 14, -4);
  robe.lineBetween(-14, 8, 14, 8);
  robe.fillStyle(0xba68c8, 0.6);
  robe.fillCircle(-8, 0, 2);
  robe.fillCircle(0, 2, 2);
  robe.fillCircle(8, 0, 2);
  container.add(robe);

  const head = scene.add.graphics();
  head.fillStyle(0x4a148c, 1);
  head.fillEllipse(0, -12, 18, 20);
  head.fillStyle(0x311b92, 1);
  head.fillEllipse(0, -8, 16, 12);
  head.fillStyle(0xe1bee7, 1);
  head.fillCircle(-4, -12, 3);
  head.fillCircle(4, -12, 3);
  head.fillStyle(0xce93d8, 1);
  head.fillCircle(-4, -12, 1.5);
  head.fillCircle(4, -12, 1.5);
  container.add(head);

  const hat = scene.add.graphics();
  hat.fillStyle(0x4a148c, 1);
  hat.fillTriangleShape(new Phaser.Geom.Triangle(-10, -18, 10, -18, 0, -32));
  hat.lineStyle(1.5, 0x9c27b0, 1);
  hat.strokeTriangle(-10, -18, 10, -18, 0, -32);
  hat.fillStyle(0xba68c8, 1);
  hat.fillRect(-10, -20, 20, 3);
  hat.fillStyle(0xffd700, 1);
  hat.fillTriangleShape(new Phaser.Geom.Triangle(0, -32, -1.5, -26, 1.5, -26));
  hat.fillTriangleShape(new Phaser.Geom.Triangle(3, -26.5, 4, -23, 1, -24));
  hat.fillTriangleShape(new Phaser.Geom.Triangle(2, -21, 4.5, -20, 2, -24));
  hat.fillTriangleShape(new Phaser.Geom.Triangle(-2, -21, -4.5, -20, -2, -24));
  hat.fillTriangleShape(new Phaser.Geom.Triangle(-3, -26.5, -4, -23, -1, -24));
  container.add(hat);

  const leftArm = scene.add.graphics();
  leftArm.fillStyle(0x6a1b9a, 1);
  leftArm.fillRect(-2, 0, 4, 12);
  leftArm.fillCircle(0, 12, 3);
  leftArm.x = -14;
  leftArm.y = -2;
  container.add(leftArm);
  container.leftArm = leftArm;

  const rightArm = scene.add.graphics();
  rightArm.fillStyle(0x6a1b9a, 1);
  rightArm.fillRect(-2, 0, 4, 12);
  rightArm.fillCircle(0, 12, 3);
  rightArm.x = 14;
  rightArm.y = -2;
  container.add(rightArm);
  container.rightArm = rightArm;

  const staff = scene.add.graphics();
  staff.lineStyle(3, 0x5d4037, 1);
  staff.lineBetween(0, 0, 0, -20);
  staff.fillStyle(0x9c27b0, 0.8);
  staff.fillCircle(0, -22, 5);
  staff.fillStyle(0xe1bee7, 0.6);
  staff.fillCircle(0, -22, 3);
  staff.lineStyle(2, 0xba68c8, 1);
  staff.lineBetween(0, -22, -4, -28);
  staff.lineBetween(0, -22, 4, -26);
  staff.x = 18;
  staff.y = 8;
  container.add(staff);
  container.staff = staff;
}

function drawAnomalyRiftEnemy(scene, container) {
  const aura = scene.add.graphics();
  aura.fillStyle(0x9a5cff, 0.16);
  aura.fillCircle(0, 0, 30);
  aura.fillStyle(0xd6b7ff, 0.08);
  aura.fillCircle(0, 0, 40);
  container.add(aura);
  container.aura = aura;

  const voidRing = scene.add.graphics();
  voidRing.lineStyle(3, 0xd7b8ff, 0.9);
  voidRing.strokeCircle(0, 0, 18);
  voidRing.lineStyle(2, 0x8a54e2, 0.75);
  voidRing.strokeCircle(0, 0, 24);
  container.add(voidRing);

  const core = scene.add.graphics();
  core.fillStyle(0x51208f, 1);
  core.fillEllipse(0, 0, 26, 30);
  core.fillStyle(0x7f36d8, 0.95);
  core.fillEllipse(0, -2, 18, 22);
  core.fillStyle(0xf0dcff, 0.95);
  core.fillCircle(0, -2, 4);
  container.add(core);

  const shards = scene.add.graphics();
  shards.fillStyle(0xe3cbff, 0.9);
  shards.fillTriangleShape(new Phaser.Geom.Triangle(-20, -6, -14, -14, -12, -4));
  shards.fillTriangleShape(new Phaser.Geom.Triangle(18, -10, 24, -4, 14, -2));
  shards.fillTriangleShape(new Phaser.Geom.Triangle(-18, 10, -12, 14, -10, 6));
  shards.fillTriangleShape(new Phaser.Geom.Triangle(12, 12, 18, 16, 14, 8));
  container.add(shards);
  container.shards = shards;
}

function drawIronboundColossusEnemy(scene, container) {
  const aura = scene.add.graphics();
  aura.fillStyle(0x94a0b0, 0.15);
  aura.fillCircle(0, 2, 32);
  container.add(aura);
  container.aura = aura;

  const body = scene.add.graphics();
  body.fillStyle(0x596575, 1);
  body.fillRoundedRect(-18, -16, 36, 44, 8);
  body.fillStyle(0x7e8897, 1);
  body.fillRoundedRect(-13, -10, 26, 24, 6);
  body.fillStyle(0xcfd7df, 0.85);
  body.fillRect(-10, 2, 20, 2);
  body.fillRect(-8, 8, 16, 2);
  body.lineStyle(2, 0x3c4450, 0.9);
  body.strokeRoundedRect(-18, -16, 36, 44, 8);
  container.add(body);

  const helm = scene.add.graphics();
  helm.fillStyle(0x525e6d, 1);
  helm.fillRoundedRect(-14, -30, 28, 18, 5);
  helm.fillStyle(0xadb8c4, 1);
  helm.fillCircle(-5, -22, 2.5);
  helm.fillCircle(5, -22, 2.5);
  helm.fillStyle(0x2b3139, 1);
  helm.fillRect(-6, -18, 12, 3);
  container.add(helm);

  const weapon = scene.add.graphics();
  weapon.lineStyle(4, 0x3c2b20, 1);
  weapon.lineBetween(0, 0, 0, -22);
  weapon.fillStyle(0x9ea7b1, 1);
  weapon.fillRoundedRect(-8, -32, 16, 10, 2);
  weapon.fillStyle(0x6f7781, 1);
  weapon.fillRect(-6, -30, 12, 3);
  weapon.x = 20;
  weapon.y = 8;
  container.add(weapon);
  container.weapon = weapon;
}

function drawCrucibleKnightEnemy(scene, container) {
  const aura = scene.add.graphics();
  aura.fillStyle(0xffb062, 0.14);
  aura.fillCircle(0, 2, 30);
  container.add(aura);
  container.aura = aura;

  const body = scene.add.graphics();
  body.fillStyle(0x6f3116, 1);
  body.fillRoundedRect(-15, -14, 30, 40, 7);
  body.fillStyle(0xc46f2f, 0.95);
  body.fillRoundedRect(-10, -8, 20, 24, 5);
  body.fillStyle(0x2f1810, 0.85);
  body.fillRect(-2, -8, 4, 24);
  container.add(body);

  const helm = scene.add.graphics();
  helm.fillStyle(0x7d3a1f, 1);
  helm.fillRoundedRect(-12, -28, 24, 16, 4);
  helm.fillStyle(0xffd39a, 1);
  helm.fillCircle(-4, -20, 2);
  helm.fillCircle(4, -20, 2);
  helm.fillStyle(0xd78239, 1);
  helm.fillTriangleShape(new Phaser.Geom.Triangle(0, -32, -3, -26, 3, -26));
  container.add(helm);

  const shield = scene.add.graphics();
  shield.fillStyle(0x8f4422, 1);
  shield.fillRoundedRect(-8, -10, 16, 22, 5);
  shield.lineStyle(2, 0xffbe79, 0.9);
  shield.strokeRoundedRect(-8, -10, 16, 22, 5);
  shield.x = -22;
  shield.y = 6;
  container.add(shield);

  const blade = scene.add.graphics();
  blade.lineStyle(2.5, 0xd8d8d8, 1);
  blade.lineBetween(0, 0, 0, -18);
  blade.fillStyle(0x8a4e29, 1);
  blade.fillRect(-3, 0, 6, 3);
  blade.x = 20;
  blade.y = 10;
  container.add(blade);
  container.weapon = blade;
}

function drawEmberWitchEnemy(scene, container) {
  const aura = scene.add.graphics();
  aura.fillStyle(0xff6630, 0.18);
  aura.fillCircle(0, 0, 30);
  aura.fillStyle(0xffb36b, 0.08);
  aura.fillCircle(0, 0, 40);
  container.add(aura);
  container.aura = aura;

  const robe = scene.add.graphics();
  robe.fillStyle(0x5d1f14, 1);
  robe.fillEllipse(0, 8, 34, 34);
  robe.fillStyle(0x8a2f1b, 1);
  robe.fillRect(-14, -5, 28, 14);
  robe.fillStyle(0xff8f52, 0.55);
  robe.fillCircle(-8, 0, 2.5);
  robe.fillCircle(0, 3, 2.5);
  robe.fillCircle(8, 0, 2.5);
  container.add(robe);

  const head = scene.add.graphics();
  head.fillStyle(0x6a2516, 1);
  head.fillEllipse(0, -12, 18, 20);
  head.fillStyle(0xffc57a, 1);
  head.fillCircle(-4, -12, 2.5);
  head.fillCircle(4, -12, 2.5);
  head.fillStyle(0x2d0f0b, 1);
  head.fillCircle(-4, -12, 1.2);
  head.fillCircle(4, -12, 1.2);
  container.add(head);

  const hat = scene.add.graphics();
  hat.fillStyle(0x42160d, 1);
  hat.fillTriangleShape(new Phaser.Geom.Triangle(-10, -20, 10, -20, 0, -35));
  hat.fillStyle(0xd04c25, 1);
  hat.fillRect(-10, -22, 20, 3);
  container.add(hat);

  const staff = scene.add.graphics();
  staff.lineStyle(3, 0x5a311e, 1);
  staff.lineBetween(0, 0, 0, -20);
  staff.fillStyle(0xff6f35, 0.95);
  staff.fillCircle(0, -22, 5);
  staff.fillStyle(0xffcf8a, 0.8);
  staff.fillCircle(0, -22, 2.5);
  staff.x = 18;
  staff.y = 8;
  container.add(staff);
  container.staff = staff;
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
 * Add animatable leg limbs to a character container
 */
function addLegLimbs(scene, container, {
  color,
  width = 3,
  height = 8,
  leftX = -2.5,
  rightX = 2.5,
  y = 12
}) {
  const leftLegGraphics = scene.add.graphics();
  leftLegGraphics.fillStyle(color, 1);
  leftLegGraphics.fillRect(-width / 2, 0, width, height);
  leftLegGraphics.x = leftX;
  leftLegGraphics.y = y;
  leftLegGraphics.baseY = y;
  container.add(leftLegGraphics);
  container.leftLeg = leftLegGraphics;

  const rightLegGraphics = scene.add.graphics();
  rightLegGraphics.fillStyle(color, 1);
  rightLegGraphics.fillRect(-width / 2, 0, width, height);
  rightLegGraphics.x = rightX;
  rightLegGraphics.y = y;
  rightLegGraphics.baseY = y;
  container.add(rightLegGraphics);
  container.rightLeg = rightLegGraphics;
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

  container.add(bodyGraphics);

  addLegLimbs(scene, container, {
    color: colors.primary,
    width: 3,
    height: 8,
    leftX: -2.5,
    rightX: 2.5,
    y: 12
  });

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

  container.add(bodyGraphics);

  addLegLimbs(scene, container, {
    color: colors.primary,
    width: 3,
    height: 8,
    leftX: -2.5,
    rightX: 2.5,
    y: 12
  });

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

  container.add(bodyGraphics);

  addLegLimbs(scene, container, {
    color: colors.primary,
    width: 4,
    height: 8,
    leftX: -3,
    rightX: 3,
    y: 12
  });

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

  container.add(bodyGraphics);

  addLegLimbs(scene, container, {
    color: colors.primary,
    width: 3,
    height: 8,
    leftX: -2.5,
    rightX: 2.5,
    y: 12
  });

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
