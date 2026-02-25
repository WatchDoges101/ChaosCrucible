let state;
let sceneCanvas;

export function loop(ctx, canvas) {
    drawScene(ctx, canvas);
}

export function onEnter(dep, canvas) {
    state = dep;
    sceneCanvas = canvas;
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    canvas.addEventListener("click", handleClick);
    // Initialize scene-specific stuff here
}

export function onExit() {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
    sceneCanvas.removeEventListener("click", handleClick);
    // Clean up scene-specific stuff here
}

function handleClick(event) {
    if (state.sceneName !== "yourSceneName") return;

    const rect = sceneCanvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    console.log(`Clicked at ${mouseX}, ${mouseY}`);
}

function handleKeyDown(e) {
    console.log(`Key down: ${e.key}`);
    // Add key handling logic here
}

function handleKeyUp(e) {
    console.log(`Key up: ${e.key}`);
    // Add key release logic here
}

function drawScene(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Add drawing logic here
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText("Scene Placeholder", canvas.width / 2, canvas.height / 2);
}