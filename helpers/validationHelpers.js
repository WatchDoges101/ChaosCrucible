/**
 * Validation and Type Check Helper Functions
 * 
 * Utility functions for validating data, checking types, and sanitizing inputs.
 * 
 * @module helpers/validationHelpers
 */

/**
 * Check if value is a valid number
 * @param {*} value - Value to check
 * @returns {boolean} Whether value is a valid number
 * @example
 * isValidNumber(42); // true
 * isValidNumber("not a number"); // false
 */
export function isValidNumber(value) {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Check if value is within range
 * @param {number} value - Value to check
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {boolean} Whether value is in range
 */
export function isInRange(value, min, max) {
  return isValidNumber(value) && value >= min && value <= max;
}

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} Whether object is empty
 */
export function isEmptyObject(obj) {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
}

/**
 * Check if value is a valid role
 * @param {string} role - Role to validate
 * @param {string[]} validRoles - Array of valid roles
 * @returns {boolean} Whether role is valid
 */
export function isValidRole(role, validRoles = ['Male', 'archer', 'brute', 'gunner']) {
  return typeof role === 'string' && validRoles.includes(role);
}

/**
 * Validate character data object