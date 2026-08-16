import { GameMap, html } from "./map.js";
import camera from "./camera.js";
GameMap.styles.colour.unchecked = ["#A2D149", "#AAD751"];
GameMap.styles.colour.safe = ["#D7B899", "#E5C29F"];
GameMap.styles.colour.bomb = ["#DB3236", "#F4840D", "#F4C20D", "#48E6F1", "#B648F2", "#ED44B5"];
GameMap.styles.image.bomb = new Image;
GameMap.styles.image.bomb.src = "./assets/bomb.svg";
GameMap.styles.image.flag = new Image;
GameMap.styles.image.flag.src = "./assets/flag.svg";
GameMap.styles.image.maybe = new Image;
GameMap.styles.image.maybe.src = "./assets/maybe.svg";
const canvas = document.getElementById("screen");
const context = canvas.getContext("2d");
const playAgainButton = document.getElementById("again");
const cachedSection = {
    canvas: document.createElement("canvas"),
    context: canvas.getContext("2d"),
    offset: { x: 0, y: 0 }
};
cachedSection.context = cachedSection.canvas.getContext("2d");
export const canvasTransformations = {
    cameraToWorld: new DOMMatrix,
    worldToCamera: new DOMMatrix
};
GameMap.scale = 100;
let size = (localStorage.getItem("minesweeper-size") ?? "16x16").split("x");
GameMap.reset(Number(size[0] ?? 16), Number(size[1] ?? 16));
var cursorTransformation = null;
var timestamp = performance.now();
var delta = 0;
var fps = 0;
var previousCamera = { x: 0, y: 0, zoom: 0 };
function tick() {
    let time = performance.now();
    delta = time - timestamp;
    fps = 1000 / delta;
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
    let sectionIsRevealingSpace = (topLeftPoint.x < cachedSection.offset.x ||
        bottomRightPoint.x > cachedSection.offset.x + cachedSection.canvas.width / camera.zoom ||
        topLeftPoint.y < cachedSection.offset.y ||
        bottomRightPoint.y > cachedSection.offset.y + cachedSection.canvas.height / camera.zoom);
    let cameraHasMoved = (Math.abs(previousCamera.x - camera.x) > (GameMap.scale / 4) * camera.zoom ||
        Math.abs(previousCamera.y - camera.y) > (GameMap.scale / 4) * camera.zoom);
    if ((sectionIsRevealingSpace && cameraHasMoved) ||
        camera.zoom != previousCamera.zoom) {
        reloadSection();
        if (cameraHasMoved) {
            previousCamera.x = camera.x;
            previousCamera.y = camera.y;
        }
        previousCamera.zoom = camera.zoom;
    }
    if (cachedSection.canvas.width > 0 && cachedSection.canvas.height > 0) {
        context.globalCompositeOperation = "destination-over";
        context.drawImage(cachedSection.canvas, cachedSection.offset.x, cachedSection.offset.y, cachedSection.canvas.width / camera.zoom, cachedSection.canvas.height / camera.zoom);
        context.globalCompositeOperation = "source-over";
    }
    if (GameMap.isPlaying)
        drawCursor();
    context.restore();
    timestamp = performance.now();
    window.requestAnimationFrame(tick);
}
tick();
function reloadSection() {
    let topLeftPoint = new DOMPoint(0, 0);
    topLeftPoint = topLeftPoint.matrixTransform(canvasTransformations.cameraToWorld);
    let bottomRightPoint = new DOMPoint(canvas.width, canvas.height);
    bottomRightPoint = bottomRightPoint.matrixTransform(canvasTransformations.cameraToWorld);
    let padding = 3;
    let start = {
        x: Math.max(Math.floor(topLeftPoint.x / GameMap.scale), 0) - padding,
        y: Math.max(Math.floor(topLeftPoint.y / GameMap.scale), 0) - padding
    };
    let end = {
        x: Math.min(Math.floor(bottomRightPoint.x / GameMap.scale), GameMap.width - 1) + 1 + padding * 2,
        y: Math.min(Math.floor(bottomRightPoint.y / GameMap.scale), GameMap.height - 1) + 1 + padding * 2
    };
    cachedSection.canvas.width = Math.ceil((end.x - start.x) * GameMap.scale * camera.zoom);
    cachedSection.canvas.height = Math.ceil((end.y - start.y) * GameMap.scale * camera.zoom);
    if (cachedSection.canvas.width <= 0)
        return;
    if (cachedSection.canvas.height <= 0)
        return;
    cachedSection.offset.x = start.x * GameMap.scale;
    cachedSection.offset.y = start.y * GameMap.scale;
    cachedSection.context.save();
    cachedSection.context.scale(camera.zoom, camera.zoom);
    cachedSection.context.translate(-start.x * GameMap.scale, -start.y * GameMap.scale);
    for (let x = start.x; x <= end.x + 1; x++) {
        for (let y = start.y; y <= end.y + 1; y++) {
            GameMap.drawTile(x, y, cachedSection.context);
        }
    }
    cachedSection.context.restore();
}
function drawCursor() {
    cursorTransformation = context.getTransform().inverse();
    let domPoint = new DOMPoint(camera.mouse.x, camera.mouse.y);
    domPoint = domPoint.matrixTransform(canvasTransformations.cameraToWorld);
    let point = {
        x: Math.floor(domPoint.x / GameMap.scale),
        y: Math.floor(domPoint.y / GameMap.scale)
    };
    context.strokeStyle = "white";
    context.lineWidth = GameMap.scale / 20;
    context.globalAlpha = 0.5;
    context.setLineDash([20, 20]);
    context.lineDashOffset = performance.now() / 100;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.rect(point.x * GameMap.scale, point.y * GameMap.scale, GameMap.scale, GameMap.scale);
    context.closePath();
    context.stroke();
    context.globalAlpha = 1;
}
export function click(type) {
    if (canvas.matches(":hover") == false)
        return;
    if (GameMap.isPlaying == false)
        return;
    let domPoint = new DOMPoint(camera.mouse.x, camera.mouse.y);
    domPoint = domPoint.matrixTransform(cursorTransformation);
    let point = {
        x: Math.floor(domPoint.x / GameMap.scale),
        y: Math.floor(domPoint.y / GameMap.scale)
    };
    if (type == "reveal") {
        if (GameMap.tilesDiscovered == 0) {
            let clearSize = 3;
            for (let y = 0; y < clearSize; y++) {
                for (let x = 0; x < clearSize; x++) {
                    let position = {
                        x: point.x - Math.floor(clearSize / 2) + x,
                        y: point.y - Math.floor(clearSize / 2) + y
                    };
                    let tileIndex = position.y * GameMap.width + position.x;
                    let bombIndex = GameMap.bombTileIndexes.indexOf(tileIndex);
                    GameMap.bombTileIndexes.splice(bombIndex, 1);
                }
            }
            html.tile_count.innerText = String(GameMap.tiles.length - GameMap.bombTileIndexes.length);
            html.flag_count.innerText = String(GameMap.bombTileIndexes.length);
        }
        GameMap.exploreTile(point.x, point.y);
        reloadSection();
    }
    else if (type == "flag") {
        GameMap.toggleFlag(point.x, point.y);
        reloadSection();
    }
    else if (type == "maybe") {
        GameMap.toggleMaybe(point.x, point.y);
        reloadSection();
    }
}
function roundToNearest(value, interval) {
    return Math.floor(value / interval) * interval;
}
document.addEventListener("click", (e) => {
    if (camera.inputMethod != "mouse")
        return;
    if (!e.shiftKey)
        click("reveal");
    else
        click("maybe");
});
document.addEventListener("contextmenu", (e) => {
    if (camera.inputMethod != "mouse")
        return;
    if (!e.shiftKey)
        click("flag");
    else
        click("maybe");
});
html.reset.addEventListener("click", () => {
    camera.x = (GameMap.width * GameMap.scale) / -2;
    camera.y = (GameMap.height * GameMap.scale) / -2;
    GameMap.reset(GameMap.width, GameMap.height);
});
playAgainButton.addEventListener("click", () => {
    GameMap.reset(GameMap.width, GameMap.height);
});
//# sourceMappingURL=index.js.map