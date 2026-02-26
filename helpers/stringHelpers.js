/**
 * String and Text Helper Functions
 * 
 * Utilities for string manipulation, formatting, and text processing.
 * 
 * @module helpers/stringHelpers
 */

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 * @example
 * capitalize("hello"); // "Hello"
 */
export function capitalize(str) {
  if (typeof str !== 'string' || str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert string to title case
 * @param {string} str - String to convert
 * @returns {string} Title cased string
 * @example
 * titleCase("hello world"); // "Hello World"
 */
export function titleCase(str) {
  if (typeof str !== 'string') return str;
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))