export function updatePlayer(ctx, canvas, backgroundImage,camera,character) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context for camera transformation
    ctx.save();

    // Apply camera offset
    ctx.translate(-camera.x, -camera.y);

    // Draw background
    if (backgroundImage.complete) {
        const pattern = ctx.createPattern(backgroundImage, "repeat");
        ctx.fillStyle = pattern;
        ctx.fillRect(camera.x, camera.y, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = "gray";
        ctx.fillRect(camera.x, camera.y, canvas.width, canvas.height);
    }

    // Draw character
    if (character) {
        ctx.fillStyle = "black"; // Temporary black color
        const size = character.radius * 2;

        if (character.shape === "circle") {
            ctx.beginPath();
            ctx.arc(character.x, character.y, character.radius, 0, Math.PI * 2);
            ctx.fill();
        } else if (character.shape === "square") {
            ctx.fillRect(character.x - character.radius, character.y - character.radius, size, size);
        } else if (character.shape === "triangle") {
            ctx.beginPath();
            ctx.moveTo(character.x, character.y - character.radius);
            ctx.lineTo(character.x - character.radius, character.y + character.radius);
            ctx.lineTo(character.x + character.radius, character.y + character.radius);
            ctx.closePath();
            ctx.fill();
        } else if (character.shape === "hexagon") {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i + Math.PI / 6;
                const px = character.x + character.radius * Math.cos(angle);
                const py = character.y + character.radius * Math.sin(angle);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
        }
    }

    // Restore context
    ctx.restore();

    // Draw debug info (screen space)
    if (character) {
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(`Character: (${Math.round(character.x)}, ${Math.round(character.y)}) Role: ${character.role}`, 10, 10);
    }
}