import * as map from "./map.js";
import camera from "./camera.js";
import * as cursor from "./cursor.js";
import * as section from "./section_cache.js";
map.styles.colour.unchecked = ["#A2D149", "#AAD751"];
map.styles.colour.safe = ["#D7B899", "#E5C29F"];
map.styles.colour.bomb = ["#DB3236", "#F4840D", "#F4C20D", "#48E6F1", "#B648F2", "#ED44B5"];
map.styles.image.bomb = new Image;
map.styles.image.bomb.src = "./assets/bomb.svg";
map.styles.image.flag = new Image;
map.styles.image.flag.src = "./assets/flag.svg";
map.styles.image.maybe = new Image;
map.styles.image.maybe.src = "./assets/maybe.svg";
const canvas = document.getElementById("screen");
const context = canvas.getContext("2d");
export const html = {
    canvas,
    flag_count: document.getElementById("flag-count"),
    flags_used: document.getElementById("flags-used"),
    tile_count: document.getElementById("tile-count"),
    tiles_shown: document.getElementById("tiles-shown"),
    gameoverScreen: document.getElementById("gameover"),
    gameoverScreen_score: document.getElementById("score"),
    winScreen: document.getElementById("win"),
    reset: document.getElementById("reset"),
    playAgain: document.getElementById("again")
};
export const canvasTransformations = {
    cameraToWorld: new DOMMatrix,
    worldToCamera: new DOMMatrix
};
let size = (localStorage.getItem("option-map-size") ?? "16x16").split("x");
map.reset(Number(size[0] ?? 16), Number(size[1] ?? 16));
var timestamp = performance.now();
var delta = 0;
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
    if (camera.inputMethod == "mouse" || map.option.is_playing == false) {
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
    section.reload();
    if (section.canvas.width > 0 && section.canvas.height > 0) {
        context.globalCompositeOperation = "destination-over";
        context.drawImage(section.canvas, section.offset.x, section.offset.y, section.canvas.width / camera.zoom, section.canvas.height / camera.zoom);
        context.globalCompositeOperation = "source-over";
    }
    if (map.option.is_playing)
        cursor.draw(context);
    context.restore();
    context.fillStyle = "black";
    context.font = "16px monospace";
    context.textAlign = "left";
    context.textBaseline = "top";
    context.fillText(`DELTA: ${delta} ms`, 16, 16);
    context.fillText(`FPS: ${roundToNearest(1000 / delta, 10)}`, 16, 32);
    timestamp = performance.now();
    window.requestAnimationFrame(tick);
}
tick();
function roundToNearest(value, interval) {
    return Math.floor(value / interval) * interval;
}
html.reset.addEventListener("click", () => {
    camera.x = (map.width * map.option.scale) / -2;
    camera.y = (map.height * map.option.scale) / -2;
    map.reset(map.width, map.height);
});
html.playAgain.addEventListener("click", () => {
    map.reset(map.width, map.height);
});
//# sourceMappingURL=index.js.map