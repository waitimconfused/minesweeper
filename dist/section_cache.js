import camera from "./camera.js";
import { canvasTransformations, html } from "./index.js";
import * as map from "./map.js";
export const canvas = document.createElement("canvas");
export const context = canvas.getContext("2d");
export const offset = { x: 0, y: 0 };
export const padding = { horizontal: 5, vertical: 5 };
const previousCamera = { x: 0, y: 0, zoom: 0 };
var was_wholeMap_visible = false;
export function redraw(force = false) {
    if (!force && !needsUpdate())
        return;
    let topLeftPoint = new DOMPoint(0, 0);
    topLeftPoint = topLeftPoint.matrixTransform(canvasTransformations.cameraToWorld);
    let bottomRightPoint = new DOMPoint(window.innerWidth, window.innerHeight);
    bottomRightPoint = bottomRightPoint.matrixTransform(canvasTransformations.cameraToWorld);
    let start = {
        x: Math.max(Math.floor(topLeftPoint.x / map.option.scale), 0) - padding.horizontal,
        y: Math.max(Math.floor(topLeftPoint.y / map.option.scale), 0) - padding.vertical
    };
    let end = {
        x: Math.min(Math.floor(bottomRightPoint.x / map.option.scale), map.width - 1) + 1 + padding.horizontal,
        y: Math.min(Math.floor(bottomRightPoint.y / map.option.scale), map.height - 1) + 1 + padding.vertical
    };
    let is_wholeMap_visible = (start.x <= 0 &&
        start.y <= 0 &&
        end.x >= map.width - 1 &&
        end.y >= map.height - 1);
    if (!force && is_wholeMap_visible && was_wholeMap_visible)
        return;
    was_wholeMap_visible = is_wholeMap_visible;
    console.log("REDRAW");
    canvas.width = Math.ceil((end.x - start.x) * map.option.scale * camera.zoom);
    canvas.height = Math.ceil((end.y - start.y) * map.option.scale * camera.zoom);
    if (canvas.width <= 0) {
        canvas.width = 1;
    }
    if (canvas.height <= 0) {
        canvas.height = 1;
    }
    offset.x = start.x * map.option.scale;
    offset.y = start.y * map.option.scale;
    context.save();
    context.scale(camera.zoom, camera.zoom);
    context.translate(-start.x * map.option.scale, -start.y * map.option.scale);
    for (let x = start.x; x <= end.x + 1; x++) {
        for (let y = start.y; y <= end.y + 1; y++) {
            map.drawTile(x, y, context);
        }
    }
    context.restore();
    context.strokeStyle = "red";
    context.lineWidth = 10;
    context.beginPath();
    context.rect(0, 0, canvas.width, canvas.height);
    context.closePath();
    context.stroke();
}
function needsUpdate() {
    let section_topLeft = new DOMPoint(offset.x, offset.y);
    section_topLeft = section_topLeft.matrixTransform(canvasTransformations.worldToCamera);
    let section_bottomRight = new DOMPoint(offset.x + canvas.width / camera.zoom, offset.y + canvas.height / camera.zoom);
    section_bottomRight = section_bottomRight.matrixTransform(canvasTransformations.worldToCamera);
    let is_revealingSpace = (section_topLeft.x > 0 ||
        section_bottomRight.x < html.canvas.width ||
        section_topLeft.y > 0 ||
        section_bottomRight.y < html.canvas.height ||
        false);
    let cameraHasMoved = (Math.abs(previousCamera.x - camera.x) > (map.option.scale) * camera.zoom ||
        Math.abs(previousCamera.y - camera.y) > (map.option.scale) * camera.zoom);
    if ((is_revealingSpace && cameraHasMoved) ||
        camera.zoom != previousCamera.zoom) {
        previousCamera.x = camera.x;
        previousCamera.y = camera.y;
        previousCamera.zoom = camera.zoom;
        return true;
    }
    return false;
}
//# sourceMappingURL=section_cache.js.map