import * as MenuScene from './scenes/menu.js';

//import * as options from "./scenes/options.js";
//import * as level2Scene from "./scenes/level2.js";
const canvas = document.getElementById("gameCanvas"); //Canvas Where the game is drawn
const ctx = canvas.getContext('2d'); //Context by which you draw. 2d context can draw lines circles,ect. piece them together to make complex characters. I havent worked with 3d context yet
const state = {
    gameRunning: false,
    isPaused: false,
    currentState: MenuScene,
    sceneName: "menu"
};
canvas.width = 1920;
canvas.height = 1080;

function gameLoop() {
    state.currentState.loop(ctx, canvas);
    requestAnimationFrame(gameLoop);
}

state.currentState.onEnter(state, canvas);
requestAnimationFrame(gameLoop);


















































