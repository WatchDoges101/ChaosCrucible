/**
 * Math and Geometry Helper Functions
 * 
 * Utility functions for common mathematical operations, vector calculations,
 * and geometric operations needed throughout the game.
 * 
 * @module helpers/mathHelpers
 */

/**
 * Calculate distance between two points
 * @param {number} x1 - First point X coordinate
 * @param {number} y1 - First point Y coordinate
 * @param {number} x2 - Second point X coordinate
 * @param {number} y2 - Second point Y coordinate
 * @returns {number} Distance between the two points
 * @example
 * const distance = getDistance(0, 0, 3, 4); // Returns 5
 */
export function getDistance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate angle between two points (in radians)
 * @param {number} x1 - Starting point X coordinate
 * @param {number} y1 - Starting point Y coordinate
 * @param {number} x2 - Ending point X coordinate
 * @param {number} y2 - Ending point Y coordinate
 * @returns {number} Angle in radians
 * @example
 * const angle = getAngle(0, 0, 1, 1); // Returns Math.PI / 4
 */
export function getAngle(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Convert angle in radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
export function radiansToDegrees(radians) {
  return radians * (180 / Math.PI);
}

/**
 * Convert angle in degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
export function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Clamp a value between min and max
 * @param {number} value - The value to clamp
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} Clamped value
 * @example
 * const clamped = clamp(150, 0, 100); // Returns 100
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Generate random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 * @example
 * const random = randomInt(1, 10); // Random number 1-10
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random float between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random float
 */
export function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Lerp (linear interpolation) between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 * @example
 * const midpoint = lerp(0, 100, 0.5); // Returns 50
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Check if a point is within a circle
 * @param {number} px - Point X coordinate
 * @param {number} py - Point Y coordinate
 * @param {number} cx - Circle center X coordinate
 * @param {number} cy - Circle center Y coordinate
 * @param {number} radius - Circle radius
 * @returns {boolean} Whether point is in circle
 */
export function isPointInCircle(px, py, cx, cy, radius) {
  return getDistance(px, py, cx, cy) <= radius;
}

/**
 * Check if two circles overlap
 * @param {number} x1 - First circle center X
 * @param {number} y1 - First circle center Y
 * @param {number} r1 - First circle radius
 * @param {number} x2 - Second circle center X
 * @param {number} y2 - Second circle center Y
 * @param {number} r2 - Second circle radius
 * @returns {boolean} Whether circles overlap
 */
export function circlesOverlap(x1, y1, r1, x2, y2, r2) {
  return getDistance(x1, y1, x2, y2) <= (r1 + r2);
}

/**
 * Check if a point is within a rectangular area
 * @param {number} px - Point X coordinate
 * @param {number} py - Point Y coordinate
 * @param {number} rx - Rectangle X coordinate (top-left)
 * @param {number} ry - Rectangle Y coordinate (top-left)
 * @param {number} width - Rectangle width
 * @param {number} height - Rectangle height
 * @returns {boolean} Whether point is in rectangle
 */
export function isPointInRectangle(px, py, rx, ry, width, height) {
  return px >= rx && px <= rx + width && py >= ry && py <= ry + height;
}

/**
 * Get normalized direction vector from angle
 * @param {number} angle - Angle in radians
 * @param {number} magnitude - Length of vector (default 1)
 * @returns {Object} Object with x and y components
 * @example
 * const dir = getDirectionFromAngle(Math.PI / 4); // Returns { x: ~0.707, y: ~0.707 }
 */
export function getDirectionFromAngle(angle, magnitude = 1) {
  return {
    x: Math.cos(angle) * magnitude,
    y: Math.sin(angle) * magnitude
  };
}

/**
 * Normalize a vector (make its length 1)
 * @param {number} x - X component
 * @param {number} y - Y component
 * @returns {Object} Normalized vector
 */
export function normalizeVector(x, y) {
  const length = Math.sqrt(x * x + y * y);
  if (length === 0) return { x: 0, y: 0 };
  return {
    x: x / length,
    y: y / length
  };
}

export default {
  getDistance,
  getAngle,
  radiansToDegrees,
  degreesToRadians,
  clamp,
  randomInt,
  randomFloat,
  lerp,
  isPointInCircle,
  circlesOverlap,
  isPointInRectangle,
  getDirectionFromAngle,
  normalizeVector
};
