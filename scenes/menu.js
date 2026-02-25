import { backGroundImageMenu } from "../assets/enemyimageAssets.js"

import * as characterSelection from "./characterSelection.js";
import * as options from "./options.js";

let state;
let menuCanvas;
const BUTTON_WIDTH = 200;
const BUTTON_HEIGHT = 60;
const BUTTON_GAP = 20;
const ANIMATION_SPEED = 0.1;
const BORDER_RADIUS = 10;

const buttons = [
    {
        x: 0, y: 0,
        width: BUTTON_WIDTH, height: BUTTON_HEIGHT,
        label: "Chaos",
        color: "red",
        hoverColor: "darkred",
        vis: true,
        scale: 1,
        targetScale: 1,
        onClick: () => switchScene(characterSelection)
    },
    {
        x: 0, y: 0,
        width: BUTTON_WIDTH, height: BUTTON_HEIGHT,
        label: "Options",
        color: "green",
        hoverColor: "darkgreen",
        vis: true,
        scale: 1,
        targetScale: 1,
        onClick: () => switchScene(options)
    }
];

export function onEnter(dep, canvas) {
    state = dep;
    menuCanvas = canvas;
    updateButtonPositions(canvas);
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("mousemove", handleMouseMove);
}

export function onExit() {
    menuCanvas.removeEventListener("click", handleClick);
    menuCanvas.removeEventListener("mousemove", handleMouseMove);
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
    if (state.sceneName !== "menu") return;
    
    const rect = menuCanvas.getBoundingClientRect();
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
        }
    });
}

function handleMouseMove(event) {
    const rect = menuCanvas.getBoundingClientRect();
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

export function switchScene(newScene) {
    state.currentState.onExit();
    state.currentState = newScene;
    state.sceneName = newScene === characterSelection ? "characterSelection" : newScene === options ? "options" : "menu";
    newScene.onEnter(state, menuCanvas);
}

function drawUI(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    if (backGroundImageMenu.complete) {
        ctx.drawImage(backGroundImageMenu, 0, 0, canvas.width, canvas.height);
    }

    // Draw title
    ctx.fillStyle = "white";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Luke's Games", canvas.width / 2, 50);
    
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
        
        // Draw button text
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(button.label, 
            button.x + button.width / 2, 
            button.y + button.height / 2);

        ctx.restore();
    });
}