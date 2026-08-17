import { GameMap, html } from "./map.js";
import camera from "./camera.js";
import * as cursor from "./cursor.js";
import * as section from "./section_cache.js";
GameMap.styles.colour.unchecked = ["#A2D149", "#AAD751"];
GameMap.styles.colour.safe = ["#D7B899", "#E5C29F"];
GameMap.styles.colour.bomb = ["#DB3236", "#F4840D", "#F4C20D", "#48E6F1", "#B648F2", "#ED44B5"];
GameMap.styles.image.bomb = new Image;
GameMap.styles.image.bomb.src = "./assets/bomb.svg";
GameMap.styles.image.flag = new Image;
GameMap.styles.image.flag.src = "./assets/flag.svg";
GameMap.styles.image.maybe = new Image;
GameMap.styles.image.maybe.src = "./assets/maybe.svg";
GameMap.scale = 100;
const canvas = document.getElementById("screen");
const context = canvas.getContext("2d");
const playAgainButton = document.getElementById("again");
export const canvasTransformations = {
    cameraToWorld: new DOMMatrix,
    worldToCamera: new DOMMatrix
};
let size = (localStorage.getItem("minesweeper-size") ?? "16x16").split("x");
GameMap.reset(Number(size[0] ?? 16), Number(size[1] ?? 16));
var timestamp = performance.now();
var delta = 0;
var previousCamera = { x: 0, y: 0, zoom: 0 };
function tick() {
    let time = performance.now();
    delta = time - timestamp;
    let scaling = window.devicePixelRatio ?? 1;
    let width = roundToNearest(canvas.clientWidth * scaling, 2);
    let height = roundToNearest(canvas.clientHeight * scaling, 2);
    if (canvas.width != width)
        canvas.width = width;
    if (canvas.height != height)
        canvas.height = height;
    if (camera.inputMethod == "mouse" || GameMap.isPlaying == false) {
        canvas.style.setProperty("cursor", "");
    }
    else {
        canvas.style.setProperty("cursor", "none");
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.scale(camera.zoom, camera.zoom);
    context.translate(Math.round(camera.x), Math.round(camera.y));
    canvasTransformations.worldToCamera = context.getTransform();
    canvasTransformations.cameraToWorld = canvasTransformations.worldToCamera.inverse();
    let topLeftPoint = new DOMPoint(0, 0);
    topLeftPoint = topLeftPoint.matrixTransform(canvasTransformations.cameraToWorld);
    let bottomRightPoint = new DOMPoint(canvas.width, canvas.height);
    bottomRightPoint = bottomRightPoint.matrixTransform(canvasTransformations.cameraToWorld);
    let sectionIsRevealingSpace = (topLeftPoint.x < section.offset.x ||
        bottomRightPoint.x > section.offset.x + section.canvas.width / camera.zoom ||
        topLeftPoint.y < section.offset.y ||
        bottomRightPoint.y > section.offset.y + section.canvas.height / camera.zoom);
    let cameraHasMoved = (Math.abs(previousCamera.x - camera.x) > (GameMap.scale / 4) * camera.zoom ||
        Math.abs(previousCamera.y - camera.y) > (GameMap.scale / 4) * camera.zoom);
    if ((sectionIsRevealingSpace && cameraHasMoved) ||
        camera.zoom != previousCamera.zoom) {
        section.reload();
        if (cameraHasMoved) {
            previousCamera.x = camera.x;
            previousCamera.y = camera.y;
        }
        previousCamera.zoom = camera.zoom;
    }
    if (section.canvas.width > 0 && section.canvas.height > 0) {
        context.globalCompositeOperation = "destination-over";
        context.drawImage(section.canvas, section.offset.x, section.offset.y, section.canvas.width / camera.zoom, section.canvas.height / camera.zoom);
        context.globalCompositeOperation = "source-over";
    }
    if (GameMap.isPlaying)
        cursor.draw(context);
    context.restore();
    timestamp = performance.now();
    window.requestAnimationFrame(tick);
}
tick();
function roundToNearest(value, interval) {
    return Math.floor(value / interval) * interval;
}
html.reset.addEventListener("click", () => {
    camera.x = (GameMap.width * GameMap.scale) / -2;
    camera.y = (GameMap.height * GameMap.scale) / -2;
    GameMap.reset(GameMap.width, GameMap.height);
});
playAgainButton.addEventListener("click", () => {
    GameMap.reset(GameMap.width, GameMap.height);
});
//# sourceMappingURL=index.js.map