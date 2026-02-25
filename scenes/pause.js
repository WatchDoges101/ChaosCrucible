import * as menu from "./menu.js";
import {paused} from "./host.js";
const BUTTON_WIDTH = 200;
const BUTTON_HEIGHT = 60;
const BUTTON_GAP = 20;
const ANIMATION_SPEED = 0.1;
const BORDER_RADIUS = 10;

const pauseButtons = [
        {
            x: 0, y: 0,
            width: BUTTON_WIDTH, height: BUTTON_HEIGHT,
            label: "Resume",
            color: "green",
            hoverColor: "darkgreen",
            vis: true,
            scale: 1,
            targetScale: 1,
            onClick: () => { paused.pause = false; }
        },
        {
            x: 0, y: 0,
            width: BUTTON_WIDTH, height: BUTTON_HEIGHT,
            label: "Main Menu",
            color: "red",
            hoverColor: "darkred",
            vis: true,
            scale: 1,
            targetScale: 1,
            onClick: () => {
                menu.switchScene(menu);
                paused.pause = false;
            }
        }
    ];


export function updateButtonPositions(canvas) {
    const totalHeight = pauseButtons.length * BUTTON_HEIGHT + (pauseButtons.length - 1) * BUTTON_GAP;
    const startY = (canvas.height - totalHeight) / 2;

    pauseButtons.forEach((button, index) => {
        button.x = (canvas.width - BUTTON_WIDTH) / 2;
        button.y = startY + index * (BUTTON_HEIGHT + BUTTON_GAP);
    });
}

function updateAnimations() {
    pauseButtons.forEach(button => {
        button.scale += (button.targetScale - button.scale) * ANIMATION_SPEED;
    });
}

export function pause(ctx, canvas, paused) {
    console.log("test4");
    if (paused.pause === true) {
        console.log("test3");
        ctx.fillStyle = "rgba(0, 0, 0, 0.34)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "48px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText("Paused", canvas.width / 2, 50);

        updateAnimations();

        pauseButtons.forEach(button => {
            ctx.save();

            const scaledWidth = button.width * button.scale;
            const scaledHeight = button.height * button.scale;
            const offsetX = (button.width - scaledWidth) / 2;
            const offsetY = (button.height - scaledHeight) / 2;

            ctx.fillStyle = button.targetScale > 1 ? button.hoverColor : button.color;
            ctx.beginPath();
            ctx.roundRect(button.x + offsetX, button.y + offsetY, scaledWidth, scaledHeight, BORDER_RADIUS);
            ctx.fill();

            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(button.x + offsetX, button.y + offsetY, scaledWidth, scaledHeight, BORDER_RADIUS);
            ctx.stroke();

            ctx.fillStyle = "white";
            ctx.font = "20px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(button.label, button.x + button.width / 2, button.y + button.height / 2);

            ctx.restore();
        });
    }
}