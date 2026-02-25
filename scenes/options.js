import { backgroundImage } from "../assets/enemyimageAssets.js";
import * as menu from "./menu.js";

let state;
let optionsCanvas;
const BUTTON_WIDTH = 200;
const BUTTON_HEIGHT = 60;
const BUTTON_GAP = 20;
const ANIMATION_SPEED = 0.1;
const BORDER_RADIUS = 10;

// Settings storage
let settings = {
    soundVolume: 0.5,
    musicVolume: 0.5,
    graphicsQuality: "medium", // Options: low, medium, high
};

// Options for dropdown
const graphicsOptions = ["low", "medium", "high"];

// Buttons for the options menu
const buttons = [
    {
        x: 0, y: 0,
        width: BUTTON_WIDTH, height: BUTTON_HEIGHT,
        label: "Sound Volume: 50%",
        color: "purple",
        hoverColor: "#800080", // Lighter purple for better contrast
        vis: true,
        scale: 1,
        targetScale: 1,
        onClick: () => adjustSoundVolume()
    },
    {
        x: 0, y: 0,
        width: BUTTON_WIDTH, height: BUTTON_HEIGHT,
        label: "Music Volume: 50%",
        color: "purple",
        hoverColor: "#800080",
        vis: true,
        scale: 1,
        targetScale: 1,
        onClick: () => adjustMusicVolume()
    },
    {
        x: 0, y: 0,
        width: BUTTON_WIDTH, height: BUTTON_HEIGHT,
        label: "Graphics: medium",
        color: "purple",
        hoverColor: "#800080",
        vis: true,
        scale: 1,
        targetScale: 1,
        onClick: () => cycleGraphicsQuality()
    },
    {
        x: 0, y: 0,
        width: BUTTON_WIDTH, height: BUTTON_HEIGHT,
        label: "Back",
        color: "red",
        hoverColor: "#cc0000", // Lighter red for contrast
        vis: true,
        scale: 1,
        targetScale: 1,
        onClick: () => switchScene(menu) // Pass menu directly
    }
];

const backGroundImageOptions = new Image();
backGroundImageOptions.src = backgroundImage; // Reuse menu background

export function onEnter(dep, canvas) {
    state = dep;
    optionsCanvas = canvas;
    loadSettings();
    updateButtonPositions(canvas);
    updateButtonLabels();
    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("mousemove", handleMouseMove);
}

export function onExit() {
    saveSettings();
    window.removeEventListener('keydown', handleKeyDown);
    optionsCanvas.removeEventListener("click", handleClick);
    optionsCanvas.removeEventListener("mousemove", handleMouseMove);
}

export function loop(ctx, canvas) {
    updateAnimations();
    drawUI(ctx, canvas);
}

function updateButtonPositions(canvas) {
    const totalHeight = buttons.length * BUTTON_HEIGHT + (buttons.length - 1) * BUTTON_GAP;
    const startY = (canvas.height - totalHeight) / 2;
    
    buttons.forEach((button, index) => {
        button.x = (canvas.width - BUTTON_WIDTH) / 2;
        button.y = startY + index * (BUTTON_HEIGHT + BUTTON_GAP);
    });
}

function updateAnimations() {
    buttons.forEach(button => {
        if (button.vis) {
            button.scale += (button.targetScale - button.scale) * ANIMATION_SPEED;
        }
    });
}

function handleClick(event) {
    if (state.sceneName !== "options") return;
    
    const rect = optionsCanvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    buttons.forEach(button => {
        if (!button.vis) return;
        
        const scaledWidth = button.width * button.scale;
        const scaledHeight = button.height * button.scale;
        const offsetX = (button.width - scaledWidth) / 2;
        const offsetY = (button.height - scaledHeight) / 2;

        if (mouseX >= button.x + offsetX && 
            mouseX <= button.x + offsetX + scaledWidth &&
            mouseY >= button.y + offsetY && 
            mouseY <= button.y + offsetY + scaledHeight) {
            button.onClick();
            updateButtonLabels();
        }
    });
}

function handleMouseMove(event) {
    const rect = optionsCanvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    buttons.forEach(button => {
        if (!button.vis) return;
        
        const scaledWidth = button.width * button.scale;
        const scaledHeight = button.height * button.scale;
        const offsetX = (button.width - scaledWidth) / 2;
        const offsetY = (button.height - scaledHeight) / 2;

        const isHovering = mouseX >= button.x + offsetX && 
                         mouseX <= button.x + offsetX + scaledWidth &&
                         mouseY >= button.y + offsetY && 
                         mouseY <= button.y + offsetY + scaledHeight;

        button.targetScale = isHovering ? 1.1 : 1;
    });
}

function handleKeyDown(e) {
    if (e.key === 'Escape') {
        switchScene(menu);
    }
}

export function switchScene(newScene) {
    saveSettings();
    state.currentState.onExit();
    state.currentState = newScene;
    state.sceneName = newScene === menu ? "menu" : state.sceneName; // Update sceneName
    newScene.onEnter(state, optionsCanvas);
}

function drawUI(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    if (backGroundImageOptions.complete) {
        ctx.drawImage(backGroundImageOptions, 0, 0, canvas.width, canvas.height);
    }

    // Draw title
    ctx.fillStyle = "white";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Options", canvas.width / 2, 50);
    
    // Draw buttons
    buttons.forEach(button => {
        if (!button.vis) return;

        ctx.save();
        
        // Apply scale transformation
        const scaledWidth = button.width * button.scale;
        const scaledHeight = button.height * button.scale;
        const offsetX = (button.width - scaledWidth) / 2;
        const offsetY = (button.height - scaledHeight) / 2;

        // Draw button with rounded corners
        ctx.fillStyle = button.targetScale > 1 ? button.hoverColor : button.color;
        ctx.beginPath();
        ctx.roundRect(button.x + offsetX, button.y + offsetY, scaledWidth, scaledHeight, BORDER_RADIUS);
        ctx.fill();
        
        // Draw button border with rounded corners
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(button.x + offsetX, button.y + offsetY, scaledWidth, scaledHeight, BORDER_RADIUS);
        ctx.stroke();
        
        // Draw button text (black on hover for visibility)
        ctx.fillStyle = button.targetScale > 1 ? "black" : "white";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(button.label, 
            button.x + button.width / 2, 
            button.y + button.height / 2);

        ctx.restore();
    });
}

function adjustSoundVolume() {
    settings.soundVolume = Math.min(1, Math.max(0, settings.soundVolume + 0.1));
    if (settings.soundVolume > 0.99) settings.soundVolume = 0; // Cycle back to 0
}

function adjustMusicVolume() {
    settings.musicVolume = Math.min(1, Math.max(0, settings.musicVolume + 0.1));
    if (settings.musicVolume > 0.99) settings.musicVolume = 0; // Cycle back to 0
}

function cycleGraphicsQuality() {
    const currentIndex = graphicsOptions.indexOf(settings.graphicsQuality);
    const nextIndex = (currentIndex + 1) % graphicsOptions.length;
    settings.graphicsQuality = graphicsOptions[nextIndex];
}

function updateButtonLabels() {
    buttons[0].label = `Sound Volume: ${Math.round(settings.soundVolume * 100)}%`;
    buttons[1].label = `Music Volume: ${Math.round(settings.musicVolume * 100)}%`;
    buttons[2].label = `Graphics: ${settings.graphicsQuality}`;
}

function saveSettings() {
    try {
        localStorage.setItem("gameSettings", JSON.stringify(settings));
    } catch (e) {
        console.error("Failed to save settings:", e);
    }
}

function loadSettings() {
    try {
        const saved = localStorage.getItem("gameSettings");
        if (saved) {
            settings = JSON.parse(saved);
        }
    } catch (e) {
        console.error("Failed to load settings:", e);
    }
}