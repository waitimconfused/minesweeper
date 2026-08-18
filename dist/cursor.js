import { canvasTransformations, DEBUG } from "./index.js";
import camera from "./camera.js";
import * as map from "./map.js";
import * as section from "./section_cache.js";
import { html } from "./index.js";
var cursorTransformation = null;
export function draw(context) {
    cursorTransformation = context.getTransform().inverse();
    let domPoint = new DOMPoint(camera.mouse.x, camera.mouse.y);
    domPoint = domPoint.matrixTransform(canvasTransformations.cameraToWorld);
    let point = {
        x: Math.floor(domPoint.x / map.option.scale),
        y: Math.floor(domPoint.y / map.option.scale)
    };
    context.strokeStyle = "white";
    context.lineWidth = map.option.scale / 20;
    context.globalAlpha = 0.5;
    context.setLineDash([20, 20]);
    context.lineDashOffset = performance.now() / 100;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.rect(point.x * map.option.scale, point.y * map.option.scale, map.option.scale, map.option.scale);
    context.closePath();
    context.stroke();
    context.globalAlpha = 1;
    if (DEBUG) {
        context.fillStyle = "black";
        context.beginPath();
        context.arc(domPoint.x, domPoint.y, 4, 0, Math.PI * 2);
        context.closePath();
        context.fill();
    }
}
export function click(type) {
    if (map.option.is_playing == false)
        return;
    let domPoint = new DOMPoint(camera.mouse.x, camera.mouse.y);
    domPoint = domPoint.matrixTransform(cursorTransformation);
    let point = {
        x: Math.floor(domPoint.x / map.option.scale),
        y: Math.floor(domPoint.y / map.option.scale)
    };
    if (point.x < 0 || point.x >= map.width)
        return;
    if (point.y < 0 || point.y >= map.height)
        return;
    if (type == "reveal") {
        if (map.tilesDiscovered == 0) {
            let autoclearInitialState = map.option.autoclear;
            map.option.autoclear = true;
            for (let y = 0; y < map.option.safeZone.height; y++) {
                for (let x = 0; x < map.option.safeZone.width; x++) {
                    let position = {
                        x: point.x - Math.floor(map.option.safeZone.width / 2) + x,
                        y: point.y - Math.floor(map.option.safeZone.height / 2) + y
                    };
                    let tileIndex = position.y * map.width + position.x;
                    let bombIndex = map.bombTileIndexes.indexOf(tileIndex);
                    map.bombTileIndexes.splice(bombIndex, 1);
                }
            }
            html.tile_count.innerText = String(map.tiles.length - map.bombTileIndexes.length);
            html.flag_count.innerText = String(map.bombTileIndexes.length);
            map.exploreTile(point.x, point.y);
            map.option.autoclear = autoclearInitialState;
        }
        map.exploreTile(point.x, point.y);
        section.redraw();
    }
    else if (type == "flag") {
        map.toggleFlag(point.x, point.y);
        section.redraw();
    }
    else if (type == "maybe") {
        map.toggleMaybe(point.x, point.y);
        section.redraw();
    }
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
//# sourceMappingURL=cursor.js.map