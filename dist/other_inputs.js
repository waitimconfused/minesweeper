import camera from "./camera.js";
import { click } from "./index.js";
import { GameMap } from "./map.js";
const reset = document.getElementById("reset");
const playAgain = document.getElementById("again");
const canvas = document.getElementById("screen");
function button_keydown(e) {
    let key = e.key.toLowerCase();
    switch (key) {
        case "n":
            GameMap.reset(GameMap.width, GameMap.height);
            break;
        case "m":
            GameMap.reset(GameMap.width, GameMap.height);
            break;
        case "space":
            GameMap.reset(GameMap.width, GameMap.height);
            break;
    }
}
reset.addEventListener("keydown", button_keydown);
playAgain.addEventListener("keydown", button_keydown);
document.addEventListener("keydown", (e) => {
    if (e.target != document.body)
        return;
    camera.inputMethod = "keyboard";
    if (GameMap.isPlaying == false)
        return;
    if (canvas.matches(":hover") == false)
        return;
    if (e.repeat)
        return;
    let key = e.key;
    switch (key) {
        case "ArrowLeft":
            key = "a";
            break;
        case "ArrowRight":
            key = "d";
            break;
        case "ArrowUp":
            key = "w";
            break;
        case "ArrowDown":
            key = "s";
            break;
    }
    key = key.toLowerCase();
    switch (key) {
        case "a":
            camera.glideByBlockOffset(-1, 0);
            camera.mouse.x = window.innerWidth / 2 - GameMap.scale * camera.zoom / 2;
            camera.mouse.y = window.innerHeight / 2 - GameMap.scale * camera.zoom / 2;
            break;
        case "d":
            camera.glideByBlockOffset(1, 0);
            camera.mouse.x = window.innerWidth / 2 - GameMap.scale * camera.zoom / 2;
            camera.mouse.y = window.innerHeight / 2 - GameMap.scale * camera.zoom / 2;
            break;
        case "w":
            camera.glideByBlockOffset(0, -1);
            camera.mouse.x = window.innerWidth / 2 - GameMap.scale * camera.zoom / 2;
            camera.mouse.y = window.innerHeight / 2 - GameMap.scale * camera.zoom / 2;
            break;
        case "s":
            camera.glideByBlockOffset(0, 1);
            camera.mouse.x = window.innerWidth / 2 - GameMap.scale * camera.zoom / 2;
            camera.mouse.y = window.innerHeight / 2 - GameMap.scale * camera.zoom / 2;
            break;
        case "n":
            click("reveal");
            break;
        case "m":
            click("flag");
            break;
        case "b":
            click("maybe");
            break;
        case "j":
            camera.glideByZoom(-0.25);
            break;
        case "k":
            camera.glideByZoom(0.25);
            break;
        default:
            break;
    }
});
//# sourceMappingURL=other_inputs.js.map