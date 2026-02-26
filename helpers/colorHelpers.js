/**
 * Color Helper Functions
 * 
 * Utilities for color manipulation, conversion, and generation.
 * Supports hex, RGB, and HSL color spaces.
 * 
 * @module helpers/colorHelpers
 */

/**
 * Convert hex color to RGB object
 * @param {string} hex - Hex color string (e.g. "#FFFFFF" or "FFFFFF")
 * @returns {Object} Object with r, g, b properties (0-255)
 * @example
 * const rgb = hexToRgb("#FF0000"); // { r: 255, g: 0, b: 0 }
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB values to hex color string
 * @param {number} r - Red component (0-255)
 * @param {number} g - Green component (0-255)
 * @param {number} b - Blue component (0-255)
 * @returns {string} Hex color string (with #)
 * @example
 * const hex = rgbToHex(255, 0, 0); // "#FF0000"
 */
export function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("").toUpperCase();
}

/**
 * Convert hex number to RGB object
 * @param {number} hexNum - Hex number (e.g. 0xFF0000)
 * @returns {Object} Object with r, g, b properties (0-255)
 * @example
 * const rgb = hexNumToRgb(0xFF0000); // { r: 255, g: 0, b: 0 }
 */
export function hexNumToRgb(hexNum) {
  return {
    r: (hexNum >> 16) & 255,
    g: (hexNum >> 8) & 255,
    b: hexNum & 255
  };
}

/**
 * Convert RGB to hex number
 * @param {number} r - Red component (0-255)
 * @param {number} g - Green component (0-255)
 * @param {number} b - Blue component (0-255)
 * @returns {number} Hex number (e.g. 0xFF0000)
 */
export function rgbToHexNum(r, g, b) {
  return (r << 16) | (g << 8) | b;
}

/**
 * Adjust color brightness
 * @param {number} hexNum - Hex color number
 * @param {number} percent - Percentage to adjust (-100 to 100)
 * @returns {number} Adjusted hex color
 */
export function adjustBrightness(hexNum, percent) {
  const rgb = hexNumToRgb(hexNum);
  const factor = 1 + (percent / 100);
  
  return rgbToHexNum(
    Math.min(255, Math.floor(rgb.r * factor)),
    Math.min(255, Math.floor(rgb.g * factor)),
    Math.min(255, Math.floor(rgb.b * factor))
  );
}

/**
 * Randomize a color by a variance amount
 * @param {number} baseColor - Base hex color number
 * @param {number} variance - Amount to vary each component (0-255)
 * @returns {number} Randomized hex color
 */
export function randomizeColor(baseColor, variance = 20) {
  const rgb = hexNumToRgb(baseColor);
  
  const randomizeComponent = (val) => {
    const change = Math.floor(Math.random() * variance * 2) - variance;
    return Math.max(0, Math.min(255, val + change));
  };
  
  return rgbToHexNum(
    randomizeComponent(rgb.r),
    randomizeComponent(rgb.g),
    randomizeComponent(rgb.b)
  );
}

/**
 * Blend two colors together
 * @param {number} color1 - First hex color number
 * @param {number} color2 - Second hex color number
 * @param {number} amount - Blend amount (0-1, where 0.5 is 50/50)
 * @returns {number} Blended hex color
 */
export function blendColors(color1, color2, amount = 0.5) {
  const rgb1 = hexNumToRgb(color1);
  const rgb2 = hexNumToRgb(color2);
  
  return rgbToHexNum(
    Math.floor(rgb1.r * (1 - amount) + rgb2.r * amount),
    Math.floor(rgb1.g * (1 - amount) + rgb2.g * amount),
    Math.floor(rgb1.b * (1 - amount) + rgb2.b * amount)
  );
}

/**
 * Generate a random color
 * @returns {number} Random hex color
 */
export function randomColor() {
  return Math.floor(Math.random() * 0xFFFFFF);
}

/**
 * Generate complementary color
 * @param {number} color - Hex color number
 * @returns {number} Complementary hex color
 */
export function getComplementary(color) {
  return color ^ 0xFFFFFF;
}

export default {
  hexToRgb,
  rgbToHex,
  hexNumToRgb,
  rgbToHexNum,
  adjustBrightness,
  randomizeColor,
  blendColors,
  randomColor,
  getComplementary
};
