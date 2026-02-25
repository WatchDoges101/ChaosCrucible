import * as playerImageAssets from "../assets/playerimageAssets.js";

export let character = null;

export const roleAttributes = {
    Male: {
        shape: "sprite",
        color: "blue",
        animations: {
            male_left_down: playerImageAssets.maleWalkLeftDown,
            male_left_up: playerImageAssets.maleWalkLeftUp, 
            male_right_down: playerImageAssets.maleWalkRightDown,
            male_right_up: playerImageAssets.maleWalkRightUp, 
            male_walk_down: playerImageAssets.maleWalkDown,
            male_walk_up: playerImageAssets.maleWalkUp
        },
        frameRate: 150
    },
    archer: { shape: "square", color: "green" },
    brute: { shape: "triangle", color: "brown" },
    gunner: { shape: "hexagon", color: "red" }
};

export const MOVE_SPEED = 1; // Pixels per frame

export function loadCharacter() {
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

export function initializeCharacter(selectedRole, worldWidth, worldHeight) {
    character = loadCharacter();
    if (!character || !selectedRole) {
        const role = selectedRole || "Male";
        character = {
            x: 100, // Start closer to top-left for testing
            y: 100,
            radius: 20,
            role: role,
            shape: roleAttributes[role].shape,
            color: roleAttributes[role].color,
            currentAnimation: "male_walk_down",
            frameIndex: 0,
            lastFrameTime: Date.now()
        };
    }
}

export function updateCharacterAnimation(keys, vx, vy) {
    if (!character || character.role !== "Male") {
        return;
    }

    if (vx === 0 && vy === 0) {
        character.frameIndex = 0;
        return;
    }

    let newAnim;
    if (keys["a"] && keys["w"]) {
        newAnim = "male_left_up";
    } else if (keys["a"] && keys["s"]) {
        newAnim = "male_left_down";
    } else if (keys["d"] && keys["w"]) {
        newAnim = "male_right_up";
    } else if (keys["d"] && keys["s"]) {
        newAnim = "male_right_down";
    } else if (vx < 0) {
        newAnim = "male_left_down";
    } else if (vx > 0) {
        newAnim = "male_right_down";
    } else if (vy > 0) {
        newAnim = "male_walk_down";
    } else {
        newAnim = "male_walk_up";
    }

    if (newAnim !== character.currentAnimation) {
        character.currentAnimation = newAnim;
        character.frameIndex = 0;
        character.lastFrameTime = Date.now();
        return;
    }

    const now = Date.now();
    const frameRate = roleAttributes.Male.frameRate;
    if (now - character.lastFrameTime > frameRate) {
        const frames = roleAttributes.Male.animations[newAnim];
        character.frameIndex = (character.frameIndex + 1) % frames.length;
        character.lastFrameTime = now;
    }
}


export function drawCharacter(ctx, camera) {
    if (!character) {
        console.error("No character to draw!");
        return;
    }

    if (character.role === "Male") {
        const anim = roleAttributes.Male.animations[character.currentAnimation];
        if (!anim) {
            console.error("Animation not found:", character.currentAnimation);
            // Fallback to visible shape
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(character.x, character.y, character.radius, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        const frameIndex = Math.floor(character.frameIndex) % anim.length;
        const img = anim[frameIndex];

        const size = 64; // Smaller size for testing
        ctx.drawImage(img, character.x - size/2, character.y - size/2, size, size);
    } else {
        // Non-male roles
        ctx.fillStyle = character.color;
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
                i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
        }
    }
}