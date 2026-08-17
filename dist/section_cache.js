import camera from "./camera.js";
import { canvasTransformations } from "./index.js";
import * as map from "./map.js";
export const canvas = document.createElement("canvas");
export const context = canvas.getContext("2d");
export const offset = { x: 0, y: 0 };
const padding = 3;
const previousCamera = { x: 0, y: 0, zoom: 0 };
export function reload() {
    let topLeftPoint = new DOMPoint(0, 0);
    topLeftPoint = topLeftPoint.matrixTransform(canvasTransformations.cameraToWorld);
    let bottomRightPoint = new DOMPoint(canvas.width, canvas.height);
    bottomRightPoint = bottomRightPoint.matrixTransform(canvasTransformations.cameraToWorld);
    let sectionIsRevealingSpace = (topLeftPoint.x < offset.x ||
        bottomRightPoint.x > offset.x + canvas.width / camera.zoom ||
        topLeftPoint.y < offset.y ||
        bottomRightPoint.y > offset.y + canvas.height / camera.zoom);
    let cameraHasMoved = (Math.abs(previousCamera.x - camera.x) > (map.option.scale / 4) * camera.zoom ||
        Math.abs(previousCamera.y - camera.y) > (map.option.scale / 4) * camera.zoom);
    if ((sectionIsRevealingSpace && cameraHasMoved) ||
        camera.zoom != previousCamera.zoom) {
        redraw();
        if (cameraHasMoved) {
            previousCamera.x = camera.x;
            previousCamera.y = camera.y;
        }
        previousCamera.zoom = camera.zoom;
    }
}
export function redraw() {
    let topLeftPoint = new DOMPoint(0, 0);
    topLeftPoint = topLeftPoint.matrixTransform(canvasTransformations.cameraToWorld);
    let bottomRightPoint = new DOMPoint(window.innerWidth, window.innerHeight);
    bottomRightPoint = bottomRightPoint.matrixTransform(canvasTransformations.cameraToWorld);
    let start = {
        x: Math.max(Math.floor(topLeftPoint.x / map.option.scale), 0) - padding,
        y: Math.max(Math.floor(topLeftPoint.y / map.option.scale), 0) - padding
    };
    let end = {
        x: Math.min(Math.floor(bottomRightPoint.x / map.option.scale), map.width - 1) + 1 + padding * 2,
        y: Math.min(Math.floor(bottomRightPoint.y / map.option.scale), map.height - 1) + 1 + padding * 2
    };
    canvas.width = Math.ceil((end.x - start.x) * map.option.scale * camera.zoom);
    canvas.height = Math.ceil((end.y - start.y) * map.option.scale * camera.zoom);
    if (canvas.width <= 0)
        return;
    if (canvas.height <= 0)
        return;
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
}
//# sourceMappingURL=section_cache.js.map