/**
 * MinimapHandler
 * Manages minimap rendering and enemy tracking indicators
 * 
 * Features:
 * - Real-time player and enemy position tracking
 * - Color-coded enemy indicators
 * - Off-screen enemy directional indicators with distance
 * - Automatic scaling based on arena size
 */
export class MinimapHandler {
	/**
	 * @param {Phaser.Scene} scene - The game scene
	 * @param {Object} options - Configuration options
	 */
	constructor(scene, options = {}) {
		this.scene = scene;
		
		// Minimap configuration
		this.config = {
			size: options.size || 180,
			x: null, // Will be calculated
			y: options.y || 20,
			arenaWidth: options.arenaWidth || 5000,
			arenaHeight: options.arenaHeight || 5000,
			...options
		};
		
		// Minimap elements
		this.elements = {
			background: null,
			border: null,
			label: null,
			playerDot: null,
			enemyDots: []
		};
		
		// Enemy indicator elements (for off-screen enemies)
		this.indicators = [];
		
		// Calculate minimap scale
		this.scale = this.config.size / Math.max(this.config.arenaWidth, this.config.arenaHeight);
	}
	
	/**
	 * Create minimap UI elements
	 * @param {number} displayWidth - Screen width
	 * @param {Phaser.Cameras.Scene2D.Camera} mainCamera - Main game camera
	 * @param {Phaser.Cameras.Scene2D.Camera} uiCamera - UI overlay camera
	 */
	createUI(displayWidth, mainCamera, uiCamera) {
		const minimapSize = this.config.size;
		const minimapX = displayWidth - minimapSize - 20;
		const minimapY = this.config.y;
		
		// Store calculated position
		this.config.x = minimapX;
		
		// Background
		this.elements.background = this.scene.add.rectangle(
			minimapX + minimapSize / 2,
			minimapY + minimapSize / 2,
			minimapSize,
			minimapSize,
			0x000000,
			0.7
		);
		
		// Border
		this.elements.border = this.scene.add.rectangle(
			minimapX + minimapSize / 2,
			minimapY + minimapSize / 2,
			minimapSize,
			minimapSize
		);
		this.elements.border.setStrokeStyle(3, 0x00FFFF);
		this.elements.border.isFilled = false;
		
		// Label
		this.elements.label = this.scene.add.text(
			minimapX + minimapSize / 2,
			minimapY - 8,
			'MAP',
			{
				font: 'bold 14px Arial',
				fill: '#00FFFF',
				stroke: '#000000',
				strokeThickness: 3
			}
		);
		this.elements.label.setOrigin(0.5, 1);
		
		// Player dot
		this.elements.playerDot = this.scene.add.circle(
			minimapX + minimapSize / 2,
			minimapY + minimapSize / 2,
			4,
			0x00FF00,
			1
		);
		
		// Hide from main camera (show only on UI camera)
		const uiElements = [
			this.elements.background,
			this.elements.border,
			this.elements.label,
			this.elements.playerDot
		];
		
		uiElements.forEach(element => mainCamera.ignore(element));
	}
	
	/**
	 * Update minimap with current player and enemy positions
	 * @param {Object} player - Player object with x, y properties
	 * @param {Array} enemies - Array of enemy data objects
	 * @param {Phaser.Cameras.Scene2D.Camera} mainCamera - Main game camera
	 */
	update(player, enemies, mainCamera) {
		if (!player || !this.elements.playerDot) return;
		
		const minimapX = this.config.x;
		const minimapY = this.config.y;
		
		// Update player position on minimap
		const playerMapX = minimapX + (player.x * this.scale);
		const playerMapY = minimapY + (player.y * this.scale);
		this.elements.playerDot.setPosition(playerMapX, playerMapY);
		
		// Clear old enemy dots
		this.elements.enemyDots.forEach(dot => dot.destroy());
		this.elements.enemyDots = [];
		
		// Add enemy dots
		enemies.forEach(enemyData => {
			const enemy = enemyData.enemy;
			if (!enemy) return;
			
			const enemyMapX = minimapX + (enemy.x * this.scale);
			const enemyMapY = minimapY + (enemy.y * this.scale);
			
			// Color based on enemy type
			let color = 0xFF6B00; // Slime - orange
			if (enemyData.type === 'devil') {
				color = 0xFF0000; // Devil - red
			} else if (enemyData.type === 'skeleton') {
				color = 0xCCCCCC; // Skeleton - gray
			} else if (enemyData.type === 'frost_wraith') {
				color = 0x66ccff; // Frost Wraith - ice blue
			}
			
			const dot = this.scene.add.circle(enemyMapX, enemyMapY, 2.5, color, 1);
			mainCamera.ignore(dot);
			this.elements.enemyDots.push(dot);
		});
	}
	
	/**
	 * Update off-screen enemy tracking indicators
	 * @param {Object} player - Player object with x, y
	 * @param {Array} enemies - Array of enemy data objects
	 * @param {Phaser.Cameras.Scene2D.Camera} mainCamera - Main game camera
	 * @param {number} displayWidth - Screen width
	 * @param {number} displayHeight - Screen height
	 */
	updateIndicators(player, enemies, mainCamera, displayWidth, displayHeight) {
		if (!player) return;
		
		// Clear old indicators
		this.indicators.forEach(indicator => {
			if (indicator.arrow) indicator.arrow.destroy();
			if (indicator.text) indicator.text.destroy();
		});
		this.indicators = [];
		
		// Get camera bounds
		const camCenterX = mainCamera.worldView.centerX;
		const camCenterY = mainCamera.worldView.centerY;
		const viewWidth = mainCamera.worldView.width;
		const viewHeight = mainCamera.worldView.height;
		
		// Track enemies outside view
		enemies.forEach(enemyData => {
			const enemy = enemyData.enemy;
			if (!enemy) return;
			
			const dx = enemy.x - camCenterX;
			const dy = enemy.y - camCenterY;
			
			// Check if enemy is outside camera view
			const isOutside = Math.abs(dx) > viewWidth / 2 || Math.abs(dy) > viewHeight / 2;
			
			if (isOutside) {
				// Calculate angle to enemy
				const angle = Math.atan2(dy, dx);
				
				// Calculate indicator position at edge of screen
				const margin = 40;
				let indicatorX, indicatorY;
				
				// Determine which edge to place indicator on
				const normalized = Math.abs(Math.cos(angle)) / (viewWidth / viewHeight);
				
				if (normalized > Math.abs(Math.sin(angle)) / 1) {
					// Left or right edge
					indicatorX = dx > 0 ? displayWidth - margin : margin;
					indicatorY = displayHeight / 2 + (dy / viewHeight) * (displayHeight - 2 * margin);
				} else {
					// Top or bottom edge
					indicatorY = dy > 0 ? displayHeight - margin : margin;
					indicatorX = displayWidth / 2 + (dx / viewWidth) * (displayWidth - 2 * margin);
				}
				
				// Clamp to screen bounds
				indicatorX = Phaser.Math.Clamp(indicatorX, margin, displayWidth - margin);
				indicatorY = Phaser.Math.Clamp(indicatorY, margin, displayHeight - margin);
				
				// Color based on enemy type
				let color = 0xFF6B00;
				if (enemyData.type === 'devil') {
					color = 0xFF0000;
				} else if (enemyData.type === 'skeleton') {
					color = 0xCCCCCC;
				} else if (enemyData.type === 'frost_wraith') {
					color = 0x66ccff;
				}
				
				// Create arrow indicator
				const arrow = this.scene.add.text(indicatorX, indicatorY, '▸', {
					font: 'bold 20px Arial',
					fill: '#' + color.toString(16).padStart(6, '0'),
					stroke: '#000000',
					strokeThickness: 3
				});
				arrow.setOrigin(0.5, 0.5);
				arrow.setRotation(angle);
				mainCamera.ignore(arrow);
				
				// Distance text
				const distance = Math.floor(Math.hypot(dx, dy) / 10);
				const distText = this.scene.add.text(indicatorX, indicatorY - 15, `${distance}`, {
					font: 'bold 12px Arial',
					fill: '#FFFFFF',
					stroke: '#000000',
					strokeThickness: 2
				});
				distText.setOrigin(0.5, 1);
				mainCamera.ignore(distText);
				
				this.indicators.push({ arrow, text: distText });
			}
		});
	}
	
	/**
	 * Clean up minimap resources
	 */
	destroy() {
		// Destroy main minimap elements
		Object.values(this.elements).forEach(element => {
			if (element && element.destroy) {
				element.destroy();
			} else if (Array.isArray(element)) {
				element.forEach(e => e && e.destroy && e.destroy());
			}
		});
		
		// Destroy indicators
		this.indicators.forEach(indicator => {
			if (indicator.arrow) indicator.arrow.destroy();
			if (indicator.text) indicator.text.destroy();
		});
		
		// Clear arrays
		this.elements.enemyDots = [];
		this.indicators = [];
	}
}
