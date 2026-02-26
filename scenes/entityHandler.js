export function createEntity(camera, gameState, enemies, spriteArray) {
    if (camera.megaFrame - gameState.enemyCreation < 10) {
        return;
    }
    const newEntity = {
        x: 150,
        y: 150,
        width: 64,
        height: 64,
        speed: 0,
        direction: "down",
        action: "idle",
        spriteFrames: 6,
        type: "slime",
        spriteList: spriteArray,
        sprite: spriteArray[0][0],
        maxHp: 100,
        hp: 100,
        timer: 0,
        lastAction: 0,
    };
    gameState.enemyCreation = camera.megaFrame;
    enemies.push(newEntity);
}

export function updateEnemy(ctx, canvas, camera, gamestate, enemies, spriteArray) {
    if (enemies.length < 10) {
        if (enemies.length !== 0) {
            if (camera.frame === 60) {
                createEntity(camera, gamestate, enemies, spriteArray);
            }
        }
        createEntity(camera, gamestate, enemies, spriteArray);
    }
    for (let i = 0; i < enemies.length; i++) {
        if (enemies[i].direction === "right") {
            enemies[i].action = "walk";
            enemies[i].x += 2;
        }
        if (enemies[i].direction === "left") {
            enemies[i].action = "walk";
            enemies[i].x -= 2;
        }
        if (enemies[i].x >= 900) {
            if (enemies[i].action !== "idle" && enemies[i].timer === 0) {
                enemies[i].direction = "down";
                enemies[i].action = "attack";
                enemies[i].timer = 6;
                enemies[i].lastAction = camera.megaFrame;
            } else {
                if (enemies[i].timer === 0) {
                    enemies[i].action = "walk";
                    enemies[i].direction = "left";
                }
            }
        }
        if (enemies[i].x <= 250) {
            enemies[i].direction = "right";
        }

        if (enemies[i].sprite) {
            ctx.drawImage(
                enemies[i].sprite,
                enemies[i].x - enemies[i].width / 2 - camera.x,
                enemies[i].y - enemies[i].height / 2 - camera.y,
                enemies[i].width,
                enemies[i].height
            );
        } else {
            console.error("Sprite is not set for enemy:", enemies[i]);
        }
    }
    if (camera.frame < 60) {
        camera.frame += 1;
    } else {
        camera.megaFrame += 1;
        camera.frame = 0;
    }
}

export function animationHandler(array, camera) {
    for (let i = 0; i < array.length; i++) {
        const currentFrameIndex = Math.floor((camera.frame / 60) * array[i].spriteFrames) % array[i].spriteFrames;
        let A = 0;
        if (array[i].action === "idle"){
            if (array[i].direction === "up"){
                A = 0;
            } 
            if (array[i].direction === "down"){
                A = 1;
            }
            if (array[i].direction === "left"){
                 A = 2;
            } 
            if (array[i].direction === "right"){
                 A = 3;
            } 
        }
        if (array[i].action === "walk"){
            if (array[i].direction === "up"){
                 A = 4;
            } 
            if (array[i].direction === "down"){
                 A = 5;
            }
            if (array[i].direction === "left"){
                 A = 6;
            } 
            if (array[i].direction === "right"){
                 A = 7;
            }
        }
        if (array[i].action === "attack"){
            if (array[i].direction === "up"){
                 A = 8;
            } 
            if (array[i].direction === "down"){
                 A = 9;
            }
            if (array[i].direction === "left"){
                 A = 10;
            } 
            if (array[i].direction === "right"){
                A = 11;
            }  
        }
        if (array[i].action === "death"){
            //run death animation here//
        }
        if (array[i].timer > 0) {
            const ind = Math.floor(array[i].spriteFrames - array[i].timer);
            array[i].sprite = array[i].spriteList[A][ind];
            const gameFramesPerFrame = 60 / array[i].spriteFrames;
            array[i].timer -= 1 / gameFramesPerFrame;
            if (array[i].timer <= 0) {
                array[i].action = "idle";
                array[i].timer = 0;
            }
        }
        if (array[i].timer <= 0) {
            array[i].sprite = array[i].spriteList[A][currentFrameIndex];
        }
        
        
    }
}


