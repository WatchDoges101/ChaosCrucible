const maleIcon = new Image();
maleIcon.src = "./assets/Entities/Male/male_walk/male_walk_down/tile000.png";

import * as host from "./host.js";

let state;
let selectionCanvas;
const BUTTON_WIDTH = 300;
const BUTTON_HEIGHT = 100;
const BUTTON_GAP = 20;
const ANIMATION_SPEED = 0.1;
const BORDER_RADIUS = 10;

const roles = [
    {
        name: "Male",
        label: "Male",
        shape: "sprite",
        color: "blue",
        hoverColor: "#333333",
        x: 0,
        y: 0,
        width: BUTTON_WIDTH,
        height: BUTTON_HEIGHT,
        vis: true,
        scale: 1,
        targetScale: 1,
        onClick: () => selectRole("Male")
    },
    {
        name: "archer",
        label: "Archer",
        shape: "square",
        color: "green",
        hoverColor: "#333333",
        x: 0,
        y: 0,
        width: BUTTON_WIDTH,
        height: BUTTON_HEIGHT,
        vis: true,
        scale: 1,
        targetScale: 1,
        onClick: () => selectRole("archer")
    },
    {
        name: "brute",
        label: "Brute",
        shape: "triangle",
        color: "brown",
        hoverColor: "#333333",
        x: 0,
        y: 0,
        width: BUTTON_WIDTH,
        height: BUTTON_HEIGHT,
        vis: true,
        scale: 1,
        targetScale: 1,
        onClick: () => selectRole("brute")
    },
    {
        name: "gunner",
        label: "Gunner",
        shape: "hexagon",
        color: "red",
        hoverColor: "#333333",
        x: 0,
        y: 0,
        width: BUTTON_WIDTH,
        height: BUTTON_HEIGHT,
        vis: true,
        scale: 1,
        targetScale: 1,
        onClick: () => selectRole("gunner")
    }
];

const backGroundImage = new Image();
backGroundImage.src = "./assets/menubackground.jpg";

export function onEnter(dep, canvas) {
    state = dep;
    selectionCanvas = canvas;
    state.sceneName = "characterSelection";
    updateButtonPositions(canvas);
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("mousemove", handleMouseMove);
}

export function onExit() {
    selectionCanvas.removeEventListener("click", handleClick);
    selectionCanvas.removeEventListener("mousemove", handleMouseMove);
}

export function loop(ctx, canvas) {
    updateAnimations();
    drawUI(ctx, canvas);
}

function updateButtonPositions(canvas) {
    const totalHeight = roles.length * BUTTON_HEIGHT + (roles.length - 1) * BUTTON_GAP;
    const startY = (canvas.height - totalHeight) / 2;

    roles.forEach((button, index) => {
        button.x = (canvas.width - BUTTON_WIDTH) / 2;
        button.y = startY + index * (BUTTON_HEIGHT + BUTTON_GAP);
    });
}

function updateAnimations() {
    roles.forEach(button => {
        if (button.vis) {
            button.scale += (button.targetScale - button.scale) * ANIMATION_SPEED;
        }
    });
}

function handleClick(event) {
    if (state.sceneName !== "characterSelection") return;

    const rect = selectionCanvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    roles.forEach(button => {
        if (!button.vis) return;

        const scaledWidth = button.width * button.scale;
        const scaledHeight = button.height * button.scale;
        const offsetX = (button.width - scaledWidth) / 2;
        const offsetY = (button.height - scaledHeight) / 2;

        if (
            mouseX >= button.x + offsetX &&
            mouseX <= button.x + offsetX + scaledWidth &&
            mouseY >= button.y + offsetY &&
            mouseY <= button.y + offsetY + scaledHeight
        ) {
            button.onClick();
        }
    });
}

function handleMouseMove(event) {
    const rect = selectionCanvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    roles.forEach(button => {
        if (!button.vis) return;

        const scaledWidth = button.width * button.scale;
        const scaledHeight = button.height * button.scale;
        const offsetX = (button.width - scaledWidth) / 2;
        const offsetY = (button.height - scaledHeight) / 2;

        const isHovering =
            mouseX >= button.x + offsetX &&
            mouseX <= button.x + offsetX + scaledWidth &&
            mouseY >= button.y + offsetY &&
            mouseY <= button.y + offsetY + scaledHeight;

        button.targetScale = isHovering ? 1.1 : 1;
    });
}

function selectRole(roleName) {
    state.selectedRole = roleName;
    switchScene(host);
}

function switchScene(newScene) {
    state.currentState.onExit();
    state.currentState = newScene;
    state.sceneName = newScene === host ? "host" : "characterSelection";
    newScene.onEnter(state, selectionCanvas);
}

function drawUI(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    if (backGroundImage.complete) {
        ctx.drawImage(backGroundImage, 0, 0, canvas.width, canvas.height);
    }

    // Draw title
    ctx.fillStyle = "white";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Choose Your Role", canvas.width / 2, 50);

    // Draw buttons
    roles.forEach(button => {
        if (!button.vis) return;

        ctx.save();

        const scaledWidth = button.width * button.scale;
        const scaledHeight = button.height * button.scale;
        const offsetX = (button.width - scaledWidth) / 2;
        const offsetY = (button.height - scaledHeight) / 2;

        // Draw button with rounded corners
        ctx.fillStyle = button.targetScale > 1 ? button.hoverColor : button.color;
        ctx.beginPath();
        ctx.roundRect(button.x + offsetX, button.y + offsetY, scaledWidth, scaledHeight, BORDER_RADIUS);
        ctx.fill();

        // Glowing border on hover
        if (button.targetScale > 1) {
            ctx.shadowColor = "white";
            ctx.shadowBlur = 10;
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(button.x + offsetX, button.y + offsetY, scaledWidth, scaledHeight, BORDER_RADIUS);
            ctx.stroke();
            ctx.shadowBlur = 0;
        } else {
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(button.x + offsetX, button.y + offsetY, scaledWidth, scaledHeight, BORDER_RADIUS);
            ctx.stroke();
        }

          // Draw placeholder icon for the role
          const shapeX = button.x + 50;
          const shapeY = button.y + button.height / 2;
          const shapeSize = 30;
          const spriteSize = 150;
  
          if (button.shape === "circle") {
              ctx.fillStyle = "white";
              ctx.beginPath();
              ctx.arc(shapeX, shapeY, shapeSize / 2, 0, Math.PI * 2);
              ctx.fill();
          } else if (button.shape === "square") {
              ctx.fillStyle = "white";
              ctx.fillRect(shapeX - shapeSize / 2, shapeY - shapeSize / 2, shapeSize, shapeSize);
          } else if (button.shape === "triangle") {
              ctx.fillStyle = "white";
              ctx.beginPath();
              ctx.moveTo(shapeX, shapeY - shapeSize / 2);
              ctx.lineTo(shapeX - shapeSize / 2, shapeY + shapeSize / 2);
              ctx.lineTo(shapeX + shapeSize / 2, shapeY + shapeSize / 2);
              ctx.closePath();
              ctx.fill();
          } else if (button.shape === "hexagon") {
              ctx.fillStyle = "white";
              ctx.beginPath();
              for (let i = 0; i < 6; i++) {
                  const angle = (Math.PI / 3) * i + Math.PI / 6;
                  const px = shapeX + (shapeSize / 2) * Math.cos(angle);
                  const py = shapeY + (shapeSize / 2) * Math.sin(angle);
                  if (i === 0) ctx.moveTo(px, py);
                  else ctx.lineTo(px, py);
              }
              ctx.closePath();
              ctx.fill();
          } else if (button.shape === "sprite") {
              // Draw the male icon as a placeholder for the sprite role.
              if (maleIcon.complete) {
                  ctx.drawImage(maleIcon, shapeX - spriteSize / 2, shapeY - spriteSize / 2, spriteSize, spriteSize);
              } else {
                  ctx.fillStyle = "white";
                  ctx.beginPath();
                  ctx.arc(shapeX, shapeY, shapeSize / 2, 0, Math.PI * 2);
                  ctx.fill();
              }
          }
  
          // Draw button text
          ctx.fillStyle = "white";
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText(button.label, button.x + 100, button.y + button.height / 2);
  
          ctx.restore();
      });
  }