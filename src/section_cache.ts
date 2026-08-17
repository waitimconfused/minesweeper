import camera from "./camera.js";
import { canvasTransformations } from "./index.js";
import { GameMap } from "./map.js";

export const canvas = document.createElement("canvas");
export const context = canvas.getContext("2d")!;

export const offset = { x: 0, y: 0 };

const padding = 3;

export function reload() {

	let topLeftPoint = new DOMPoint(0, 0);
	topLeftPoint = topLeftPoint.matrixTransform(canvasTransformations.cameraToWorld);

	let bottomRightPoint = new DOMPoint(window.innerWidth, window.innerHeight);
	bottomRightPoint = bottomRightPoint.matrixTransform(canvasTransformations.cameraToWorld);

	let start = {
		x: Math.max(Math.floor(topLeftPoint.x / GameMap.scale), 0) - padding,
		y: Math.max(Math.floor(topLeftPoint.y / GameMap.scale), 0) - padding
	};

	let end = {
		x: Math.min(Math.floor(bottomRightPoint.x / GameMap.scale), GameMap.width - 1) + 1 + padding * 2,
		y: Math.min(Math.floor(bottomRightPoint.y / GameMap.scale), GameMap.height - 1) + 1 + padding * 2
	};

	canvas.width = Math.ceil((end.x - start.x) * GameMap.scale * camera.zoom);
	canvas.height = Math.ceil((end.y - start.y) * GameMap.scale * camera.zoom);

	if (canvas.width <= 0) return;
	if (canvas.height <= 0) return;

	offset.x = start.x * GameMap.scale;
	offset.y = start.y * GameMap.scale;

	context.save();
	context.scale(camera.zoom, camera.zoom);
	context.translate(-start.x * GameMap.scale, -start.y * GameMap.scale);

	for (let x = start.x; x <= end.x + 1; x++) {
		for (let y = start.y; y <= end.y + 1; y++) {
			GameMap.drawTile(x, y, context);
		}
	}

	context.restore();
}