/**
 * Performance Helpers
 * Utilities to optimize game performance
 */

/**
 * Simple spatial grid for efficient collision detection
 */
export class SpatialGrid {
	/**
	 * @param {number} width - Grid width
	 * @param {number} height - Grid height
	 * @param {number} cellSize - Size of each cell
	 */
	constructor(width, height, cellSize = 100) {
		this.width = width;
		this.height = height;
		this.cellSize = cellSize;
		this.cols = Math.ceil(width / cellSize);
		this.rows = Math.ceil(height / cellSize);
		this.grid = {};
	}
	
	/**
	 * Get cell key for position
	 * @param {number} x - X position
	 * @param {number} y - Y position
	 * @returns {string}
	 */
	getCellKey(x, y) {
		const col = Math.floor(x / this.cellSize);
		const row = Math.floor(y / this.cellSize);
		return `${col},${row}`;
	}
	
	/**
	 * Clear all cells
	 */
	clear() {
		this.grid = {};
	}
	
	/**
	 * Insert object into grid
	 * @param {Object} obj - Object with x, y properties
	 * @param {number} radius - Object radius
	 */
	insert(obj, radius = 0) {
		// Get all cells the object touches
		const minX = obj.x - radius;
		const maxX = obj.x + radius;
		const minY = obj.y - radius;
		const maxY = obj.y + radius;
		
		const minCol = Math.floor(minX / this.cellSize);
		const maxCol = Math.floor(maxX / this.cellSize);
		const minRow = Math.floor(minY / this.cellSize);
		const maxRow = Math.floor(maxY / this.cellSize);
		
		for (let col = minCol; col <= maxCol; col++) {
			for (let row = minRow; row <= maxRow; row++) {
				const key = `${col},${row}`;
				if (!this.grid[key]) {
					this.grid[key] = [];
				}
				this.grid[key].push(obj);
			}
		}
	}
	
	/**
	 * Query objects near a position
	 * @param {number} x - X position
	 * @param {number} y - Y position
	 * @param {number} radius - Search radius
	 * @returns {Array} - Objects in range (may contain duplicates)
	 */
	query(x, y, radius = 0) {
		const minX = x - radius;
		const maxX = x + radius;
		const minY = y - radius;
		const maxY = y + radius;
		
		const minCol = Math.floor(minX / this.cellSize);
		const maxCol = Math.floor(maxX / this.cellSize);
		const minRow = Math.floor(minY / this.cellSize);
		const maxRow = Math.floor(maxY / this.cellSize);
		
		const results = [];
		
		for (let col = minCol; col <= maxCol; col++) {
			for (let row = minRow; row <= maxRow; row++) {
				const key = `${col},${row}`;
				if (this.grid[key]) {
					results.push(...this.grid[key]);
				}
			}
		}
		
		return results;
	}
	
	/**
	 * Query unique objects near a position (removes duplicates)
	 * @param {number} x - X position
	 * @param {number} y - Y position
	 * @param {number} radius - Search radius
	 * @returns {Array} - Unique objects in range
	 */
	queryUnique(x, y, radius = 0) {
		const results = this.query(x, y, radius);
		return [...new Set(results)];
	}
}

/**
 * Object pool for reusing objects instead of creating/destroying
 */
export class ObjectPool {
	/**
	 * @param {Function} createFn - Function to create new objects
	 * @param {Function} resetFn - Function to reset objects for reuse
	 * @param {number} initialSize - Initial pool size
	 */
	constructor(createFn, resetFn, initialSize = 10) {
		this.createFn = createFn;
		this.resetFn = resetFn;
		this.pool = [];
		this.active = [];
		
		// Pre-populate pool
		for (let i = 0; i < initialSize; i++) {
			this.pool.push(createFn());
		}
	}
	
	/**
	 * Get an object from the pool
	 * @param {Object} config - Configuration to pass to reset function
	 * @returns {Object}
	 */
	get(config) {
		let obj;
		
		if (this.pool.length > 0) {
			obj = this.pool.pop();
			this.resetFn(obj, config);
		} else {
			obj = this.createFn();
			this.resetFn(obj, config);
		}
		
		this.active.push(obj);
		return obj;
	}
	
	/**
	 * Return an object to the pool
	 * @param {Object} obj - Object to return
	 */
	release(obj) {
		const index = this.active.indexOf(obj);
		if (index !== -1) {
			this.active.splice(index, 1);
			this.pool.push(obj);
		}
	}
	
	/**
	 * Clear all pooled objects
	 */
	clear() {
		this.pool = [];
		this.active = [];
	}
	
	/**
	 * Get pool statistics
	 * @returns {Object}
	 */
	getStats() {
		return {
			available: this.pool.length,
			active: this.active.length,
			total: this.pool.length + this.active.length
		};
	}
}

/**
 * Throttle function calls to improve performance
 * @param {Function} fn - Function to throttle
 * @param {number} delay - Minimum delay between calls in ms
 * @returns {Function} - Throttled function
 */
export function throttle(fn, delay) {
	let lastCall = 0;
	return function (...args) {
		const now = Date.now();
		if (now - lastCall >= delay) {
			lastCall = now;
			return fn.apply(this, args);
		}
	};
}

/**
 * Debounce function calls
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in ms
 * @returns {Function} - Debounced function
 */
export function debounce(fn, delay) {
	let timeoutId;
	return function (...args) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn.apply(this, args), delay);
	};
}

/**
 * RAF-based frame limiter for consistent performance
 */
export class FrameLimiter {
	/**
	 * @param {number} targetFPS - Target frames per second
	 */
	constructor(targetFPS = 60) {
		this.targetFPS = targetFPS;
		this.frameDelay = 1000 / targetFPS;
		this.lastFrameTime = 0;
	}
	
	/**
	 * Check if enough time has passed for next frame
	 * @param {number} currentTime - Current timestamp
	 * @returns {boolean}
	 */
	shouldUpdate(currentTime) {
		if (currentTime - this.lastFrameTime >= this.frameDelay) {
			this.lastFrameTime = currentTime;
			return true;
		}
		return false;
	}
	
	/**
	 * Get time since last frame
	 * @param {number} currentTime - Current timestamp
	 * @returns {number} - Delta time in ms
	 */
	getDelta(currentTime) {
		return currentTime - this.lastFrameTime;
	}
}

/**
 * Batch update helper to process updates in chunks
 * @param {Array} items - Items to process
 * @param {Function} updateFn - Update function for each item
 * @param {number} batchSize - Items per batch
 */
export function batchUpdate(items, updateFn, batchSize = 10) {
	let processedCount = 0;
	
	const processBatch = () => {
		const end = Math.min(processedCount + batchSize, items.length);
		
		for (let i = processedCount; i < end; i++) {
			updateFn(items[i], i);
		}
		
		processedCount = end;
		
		if (processedCount < items.length) {
			requestAnimationFrame(processBatch);
		}
	};
	
	processBatch();
}

/**
 * Distance check with early exit (squared distance to avoid sqrt)
 * @param {number} x1 - First X
 * @param {number} y1 - First Y
 * @param {number} x2 - Second X
 * @param {number} y2 - Second Y
 * @param {number} maxDist - Maximum distance
 * @returns {boolean} - True if within distance
 */
export function isWithinDistance(x1, y1, x2, y2, maxDist) {
	const dx = x2 - x1;
	const dy = y2 - y1;
	const distSq = dx * dx + dy * dy;
	return distSq <= maxDist * maxDist;
}

/**
 * Get squared distance (faster than Math.hypot)
 * @param {number} x1 - First X
 * @param {number} y1 - First Y
 * @param {number} x2 - Second X
 * @param {number} y2 - Second Y
 * @returns {number} - Squared distance
 */
export function distanceSquared(x1, y1, x2, y2) {
	const dx = x2 - x1;
	const dy = y2 - y1;
	return dx * dx + dy * dy;
}

/**
 * Normalize vector in place (modifies object)
 * @param {Object} vec - Vector with x, y properties
 * @returns {Object} - Same vector normalized
 */
export function normalizeInPlace(vec) {
	const len = Math.hypot(vec.x, vec.y) || 1;
	vec.x /= len;
	vec.y /= len;
	return vec;
}

/**
 * Memory-efficient array clearing
 * @param {Array} arr - Array to clear
 */
export function fastClear(arr) {
	arr.length = 0;
}

/**
 * Faster array removal (swaps with last element)
 * @param {Array} arr - Array to modify
 * @param {number} index - Index to remove
 */
export function fastRemove(arr, index) {
	if (index < 0 || index >= arr.length) return;
	arr[index] = arr[arr.length - 1];
	arr.pop();
}
