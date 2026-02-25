
import * as enemyimageAssets from "../assets/enemyimageAssets.js";
import * as entityHandler from "./entityHandler.js";
import * as input from "./inputHandler.js";
import * as pause from "./pause.js";
import * as update from "./canvasUpdater.js";


let state;
let sceneCanvas;
const gameState = {
    worldHeight: 2000,
    worldWidth: 2000,
    cycle: 0,
    enemyCreation:0,
};
const camera = {
    x: 0,
    y: 0,
    width: 1920,
    height: 1080,
    frame: 0,
    megaFrame:0,
};

// Character data
let character = null;
const roleAttributes = {
    Male: { shape: "circle", color: "sprite" },
    archer: { shape: "square", color: "green" },
    brute: { shape: "triangle", color: "brown" },
    gunner: { shape: "hexagon", color: "red" }
};
const MOVE_SPEED = 5; // Pixels per frame

// Key state for movement
let keys = {};

// Pause state
export const paused = {
    pause :false,
};
//these arrays are where the objects are stores 
const playerProjectiles = [];
const enemyProjectiles = [];
const enemies = [];
const backgroundObjects = [];

export function onEnter(dep, canvas) {
    state = dep;
    sceneCanvas = canvas;
    state.sceneName = "host";

    // Load saved character or initialize new
    character = loadCharacter();
    if (!character || !state.selectedRole) {
        const role = state.selectedRole || "sorcerer";
        character = {
            x: Math.random() * gameState.worldWidth,
            y: Math.random() * gameState.worldHeight,
            radius: 20,
            role: role,
            shape: roleAttributes[role].shape,
            color: roleAttributes[role].color
        };
    }

    // Center camera on character
    centerCameraOn(camera, character.x, character.y);

    // Update pause button positions
    pause.updateButtonPositions(canvas);

    // Add event listeners
    window.addEventListener("keydown", e => input.handleKeyDown(e,keys,paused));
    window.addEventListener("keyup", e => input.handleKeyUp(e, keys));
    sceneCanvas.addEventListener("click", e => input.handleClick(e, paused, sceneCanvas));
    //sceneCanvas.addEventListener("mousemove", e => input.handleMouseMove(e, sceneCanvas));

    // Store handlers for removal
    
}

export function onExit() {
    // Remove event listeners
    
    window.removeEventListener("keydown", e=> input.handleKeyDown(e,keys,paused));
    window.removeEventListener("keyup", e => input.handleKeyUp(e, keys));
    sceneCanvas.removeEventListener("click", e => input.handleClick(e, paused, sceneCanvas));
    //sceneCanvas.removeEventListener("mousemove", e => input.handleMouseMove(e, sceneCanvas));

}

export function loop(ctx, canvas) {
    if (paused.pause === false) {
        input.updateCharacter(state, character, keys, MOVE_SPEED, gameState, camera, centerCameraOn);
        update.updatePlayer(ctx, canvas, enemyimageAssets.backgroundImage,camera,character);
        entityHandler.animationHandler(enemies,camera);
        entityHandler.updateEnemy(ctx,canvas ,camera,gameState,enemies,enemyimageAssets.greenSlime);
        return;
    }
    console.log("test5");
    pause.pause(ctx, canvas,paused);
    //
}

function centerCameraOn(camera, targetX, targetY) {
    camera.x = targetX - camera.width / 2;
    camera.y = targetY - camera.height / 2;
    camera.x = Math.max(0, Math.min(camera.x, gameState.worldWidth - camera.width));
    camera.y = Math.max(0, Math.min(camera.y, gameState.worldHeight - camera.height));
}
//unused atm
function isInView(x, y, width, height, camera) {
    return (
        x + width > camera.x &&
        x < camera.x + camera.width &&
        y + height > camera.y &&
        y < camera.y + camera.height
    );
}



function loadCharacter() {
    try {
        const saved = localStorage.getItem("chaosCrucibleCharacter");
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error("Failed to load character:", e);
    }
    return null;
}
//WIP
function isColliding(obj1, obj2, adjustment = 0) {
    if (!obj1 || !obj2) return false;

    // Player (circle) vs. other (AABB)
    if (obj1 === character || obj2 === character) {
        const circle = obj1 === character ? obj1 : obj2;
        const rect = obj1 === character ? obj2 : obj1;

        // Circle properties
        const circleX = circle.x;
        const circleY = circle.y;
        const circleRadius = (circle.radius || 20) + adjustment;

        // Rectangle properties
        const rectLeft = rect.x - (rect.width || 64) / 2 - adjustment;
        const rectRight = rect.x + (rect.width || 64) / 2 + adjustment;
        const rectTop = rect.y - (rect.height || 64) / 2 - adjustment;
        const rectBottom = rect.y + (rect.height || 64) / 2 + adjustment;

        // Find closest point on rectangle to circle center
        const closestX = Math.max(rectLeft, Math.min(circleX, rectRight));
        const closestY = Math.max(rectTop, Math.min(circleY, rectBottom));

        // Check if distance from closest point to circle center is less than radius
        const distanceX = circleX - closestX;
        const distanceY = circleY - closestY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        return distance < circleRadius;
    }

    // AABB vs. AABB (e.g., projectile vs. enemy)
    const obj1Left = obj1.x - (obj1.width || 16) / 2 - adjustment;
    const obj1Right = obj1.x + (obj1.width || 16) / 2 + adjustment;
    const obj1Top = obj1.y - (obj1.height || 16) / 2 - adjustment;
    const obj1Bottom = obj1.y + (obj1.height || 16) / 2 + adjustment;

    const obj2Left = obj2.x - (obj2.width || 64) / 2 - adjustment;
    const obj2Right = obj2.x + (obj2.width || 64) / 2 + adjustment;
    const obj2Top = obj2.y - (obj2.height || 64) / 2 - adjustment;
    const obj2Bottom = obj2.y + (obj2.height || 64) / 2 + adjustment;

    return (
        obj1Left < obj2Right &&
        obj1Right > obj2Left &&
        obj1Top < obj2Bottom &&
        obj1Bottom > obj2Top
    );
}



//current issue is it keeps double toggling my pause button. Will work more on it tomorrow