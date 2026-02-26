import * as pause from "./pause.js"; 

export function handleKeyDown(e, keys, paused) {
    keys[e.key.toLowerCase()] = true;
    if (e.key === "Escape") {
        paused.pause = !paused.pause;
    }
}

export function handleKeyUp(e, keys) {
    keys[e.key.toLowerCase()] = false;
}

export function handleClick(e, paused, sceneCanvas) {
    if (paused.pause === true) {
        const rect = sceneCanvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        pause.pauseButtons.forEach(button => {

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
}

//export function handleMouseMove(e, sceneCanvas) {
    //const rect = sceneCanvas.getBoundingClientRect();
    //const mouseX = e.clientX - rect.left;
    //const mouseY = e.clientY - rect.top;

   // pause.pauseButtons.forEach(button => {
    //    const scaledWidth = button.width * button.scale;
   //     const scaledHeight = button.height * button.scale;
    //    const offsetX = (button.width - scaledWidth) / 2;
    //    const offsetY = (button.height - scaledHeight) / 2;

    //    const isHovering =
    //        mouseX >= button.x + offsetX &&
    //        mouseX <= button.x + offsetX + scaledWidth &&
    //        mouseY >= button.y + offsetY &&
     //       mouseY <= button.y + offsetY + scaledHeight;

    //    button.targetScale = isHovering ? 1.1 : 1;
 //   });
//}

export function updateCharacter(character, keys, moveSpeed, gameState, camera, centerCameraOn) {
    if (!character) {
        console.error("No character to update!");
        return;
    }

    let vx = 0, vy = 0;
    const speed = moveSpeed;

    if (keys["w"]) vy -= speed;
    if (keys["s"]) vy += speed;
    if (keys["a"]) vx -= speed;
    if (keys["d"]) vx += speed;

    // Diagonal movement normalization
    if (vx !== 0 && vy !== 0) {
        const factor = 1 / Math.sqrt(2);
        vx *= factor;
        vy *= factor;
    }

    character.x += vx;
    character.y += vy;

    // Clamp to world bounds
    character.x = Math.max(0, Math.min(character.x, gameState.worldWidth));
    character.y = Math.max(0, Math.min(character.y, gameState.worldHeight));

    // Update camera
    centerCameraOn(camera, character.x, character.y);
}

