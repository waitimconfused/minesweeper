import { canvasTransformations } from "./index.js";
import camera from "./camera.js";
import { GameMap, html } from "./map.js";
import * as section from "./section_cache.js";

var cursorTransformation: DOMMatrix | null = null;

export function draw(context: CanvasRenderingContext2D) {
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
	context.rect(
		point.x * GameMap.scale,
		point.y * GameMap.scale,
		GameMap.scale,
		GameMap.scale
	);
	context.closePath();

	context.stroke();

	context.globalAlpha = 1;

}
	
export function click(type: "reveal" | "flag" | "maybe") {

	if (GameMap.isPlaying == false) return;

	let domPoint = new DOMPoint(camera.mouse.x, camera.mouse.y);
	domPoint = domPoint.matrixTransform(cursorTransformation!);

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
					}

					let tileIndex = position.y * GameMap.width + position.x;
					let bombIndex = GameMap.bombTileIndexes.indexOf(tileIndex);

					GameMap.bombTileIndexes.splice(bombIndex, 1);

				}

			}

			html.tile_count.innerText = String(GameMap.tiles.length - GameMap.bombTileIndexes.length);
			html.flag_count.innerText = String(GameMap.bombTileIndexes.length);
		}

		GameMap.exploreTile(point.x, point.y);
		section.reload();

	} else if (type == "flag") {
		GameMap.toggleFlag(point.x, point.y);
		section.reload();

	} else if (type == "maybe") {
		GameMap.toggleMaybe(point.x, point.y);
		section.reload();
	}

}

document.addEventListener("click", (e) => {

	if (camera.inputMethod != "mouse") return;

	if (!e.shiftKey) click("reveal");
	else click("maybe");
});

document.addEventListener("contextmenu", (e) => {

	if (camera.inputMethod != "mouse") return;

	if (!e.shiftKey) click("flag");
	else click("maybe");

});