import * as pause from "./pause.js"; 

export function handleKeyDown(e, keys, paused) {
    keys[e.key.toLowerCase()] = true;
    if (e.key === "Escape") {
        console.log("escape pressed");
        console.log("Before toggle:", paused);
        paused.pause = !paused.pause; // Toggle the paused state
        console.log("After toggle:", paused);
    }
    return paused; // Return the paused object
}

export function handleKeyUp(e, keys) {
    keys[e.key.toLowerCase()] = false;
}

export function handleClick(e, paused, sceneCanvas) {
    if (paused.pause === "true") {
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
    } else {
        const rect = sceneCanvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        console.log(`Clicked at ${mouseX}, ${mouseY}`);
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

export function updateCharacter(state, character, keys, moveSpeed, gameState, camera, centerCameraOn) {
    if (!character) {
        console.error("No character to update!");
        return;
    }

    let vx = 0, vy = 0;
    const speed = 5; // Increase speed for testing

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

    // Update position with console logging
    const oldX = character.x;
    const oldY = character.y;
    character.x += vx;
    character.y += vy;

    if (oldX !== character.x || oldY !== character.y) {
        console.log("Character moved:", {
            from: { x: oldX, y: oldY },
            to: { x: character.x, y: character.y }
        });
    }

    // Clamp to world bounds
    character.x = Math.max(0, Math.min(character.x, gameState.worldWidth));
    character.y = Math.max(0, Math.min(character.y, gameState.worldHeight));

    // Update camera and log position
    centerCameraOn(camera, character.x, character.y);
    console.log("Camera position:", camera);
}

