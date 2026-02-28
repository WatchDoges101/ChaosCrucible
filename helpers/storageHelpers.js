/**
 * Storage and Persistence Helper Functions
 * 
 * Utilities for saving and loading data from localStorage with error handling.
 * All operations are wrapped in try-catch to handle storage errors gracefully.
 * 
 * @module helpers/storageHelpers
 */

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {*} data - Data to save (will be JSON stringified)
 * @returns {boolean} Whether save was successful
 * @example
 * saveToStorage('playerData', { name: 'Hero', level: 5 }); // true
 */
export function saveToStorage(key, data) {
  try {
    const json = JSON.stringify(data);
    localStorage.setItem(key, json);
    return true;
  } catch (error) {
    console.error(`[Storage] Failed to save "${key}":`, error);
    return false;
  }
}

/**
 * Load data from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist or is invalid (default null)
 * @returns {*} Loaded data or default value
 * @example
 * const data = loadFromStorage('playerData', {}); // Returns saved object or {}
 */
export function loadFromStorage(key, defaultValue = null) {
  try {
    const json = localStorage.getItem(key);
    return json ? JSON.parse(json) : defaultValue;
  } catch (error) {
    console.error(`[Storage] Failed to load "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Remove data from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Whether removal was successful
 * @example
 * removeFromStorage('playerData'); // true
 */
export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`[Storage] Failed to remove "${key}":`, error);
    return false;
  }
}

/**
 * Clear all localStorage data
 * @returns {boolean} Whether clear was successful
 * @example
 * clearAllStorage(); // true
 */
export function clearAllStorage() {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('[Storage] Failed to clear storage:', error);
    return false;
  }
}

/**
 * Check if a key exists in localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Whether key exists
 * @example
 * if (hasStorageKey('playerData')) { ... }
 */
export function hasStorageKey(key) {
  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error(`[Storage] Failed to check key "${key}":`, error);
    return false;
  }
}