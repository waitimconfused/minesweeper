import camera from "./camera.js";
import { canvasTransformations } from "./index.js";
import * as map from "./map.js";
import * as cursor from "./cursor.js";
const reset = document.getElementById("reset");
const playAgain = document.getElementById("again");
const canvas = document.getElementById("screen");
function button_keydown(e) {
    let key = e.key.toLowerCase();
    switch (key) {
        case "n":
            map.reset(map.width, map.height);
            break;
        case "m":
            map.reset(map.width, map.height);
            break;
        case "space":
            map.reset(map.width, map.height);
            break;
    }
}
reset.addEventListener("keydown", button_keydown);
playAgain.addEventListener("keydown", button_keydown);
document.addEventListener("keydown", (e) => {
    if (e.target != document.body)
        return;
    if (map.option.is_playing == false)
        return;
    if (canvas.matches(":hover") == false)
        return;
    camera.inputMethod = "keyboard";
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
    let cameraPoint = new DOMPoint(canvas.width / 2, canvas.height / 2).matrixTransform(canvasTransformations.cameraToWorld);
    let offsetPoint = DOMPoint.fromPoint(cameraPoint);
    switch (key) {
        case "a":
            offsetPoint.x += map.option.scale;
            break;
        case "d":
            offsetPoint.x -= map.option.scale;
            break;
        case "w":
            offsetPoint.y += map.option.scale;
            break;
        case "s":
            offsetPoint.y -= map.option.scale;
            break;
        case "n":
            cursor.click("reveal");
            break;
        case "m":
            cursor.click("flag");
            break;
        case "b":
            cursor.click("maybe");
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
    let difference = {
        x: offsetPoint.x - cameraPoint.x,
        y: offsetPoint.y - cameraPoint.y
    };
    camera.mouse.x = canvas.width / 2;
    camera.mouse.y = canvas.height / 2;
    camera.glideByOffset(difference.x, difference.y);
});
//# sourceMappingURL=other_inputs.js.map