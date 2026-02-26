
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
    enemyCreation: 0,
};
const camera = {
    x: 0,
    y: 0,
    width: 1920,
    height: 1080,
    frame: 0,
    megaFrame: 0,
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
let keyDownHandler;
let keyUpHandler;
let clickHandler;

// Pause state
export const paused = {
    pause: false,
};
const enemies = [];

export function onEnter(dep, canvas) {
    state = dep;
    sceneCanvas = canvas;
    state.sceneName = "host";

    // Load saved character or initialize new
    character = loadCharacter();
    if (!character || !state.selectedRole) {
        const role = state.selectedRole || "Male";
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
    keyDownHandler = (e) => input.handleKeyDown(e, keys, paused);
    keyUpHandler = (e) => input.handleKeyUp(e, keys);
    clickHandler = (e) => input.handleClick(e, paused, sceneCanvas);

    window.addEventListener("keydown", keyDownHandler);
    window.addEventListener("keyup", keyUpHandler);
    sceneCanvas.addEventListener("click", clickHandler);
}

export function onExit() {
    window.removeEventListener("keydown", keyDownHandler);
    window.removeEventListener("keyup", keyUpHandler);
    sceneCanvas.removeEventListener("click", clickHandler);
}

export function loop(ctx, canvas) {
    if (paused.pause === false) {
        input.updateCharacter(character, keys, MOVE_SPEED, gameState, camera, centerCameraOn);
        update.updatePlayer(ctx, canvas, enemyimageAssets.backgroundImage, camera, character);
        entityHandler.animationHandler(enemies, camera);
        entityHandler.updateEnemy(ctx, canvas, camera, gameState, enemies, enemyimageAssets.greenSlime);
        return;
    }
    pause.pause(ctx, canvas, paused);
}

function centerCameraOn(camera, targetX, targetY) {
    camera.x = targetX - camera.width / 2;
    camera.y = targetY - camera.height / 2;
    camera.x = Math.max(0, Math.min(camera.x, gameState.worldWidth - camera.width));
    camera.y = Math.max(0, Math.min(camera.y, gameState.worldHeight - camera.height));
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