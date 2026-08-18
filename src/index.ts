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

const canvas: HTMLCanvasElement = document.getElementById("screen") as HTMLCanvasElement;
const context: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;

export const DEBUG = (new URL( location.toString() )).searchParams.has("debug");

export const html = {
	canvas,

	flag_count: document.getElementById("flag-count") as HTMLSpanElement,
	flags_used: document.getElementById("flags-used") as HTMLSpanElement,

	tile_count: document.getElementById("tile-count") as HTMLSpanElement,
	tiles_shown: document.getElementById("tiles-shown") as HTMLSpanElement,

	gameoverScreen: document.getElementById("gameover") as HTMLElement,
	gameoverScreen_score: document.getElementById("score") as HTMLSpanElement,

	winScreen: document.getElementById("win") as HTMLElement,

	reset: document.getElementById("reset") as HTMLButtonElement,
	playAgain: document.getElementById("again") as HTMLButtonElement
};

export const canvasTransformations = {
	cameraToWorld: new DOMMatrix,
	worldToCamera: new DOMMatrix
}


let size = (localStorage.getItem("option-map-size") ?? "16x16").split("x") as [ string, string ];
map.reset(
	Number(size[0] ?? 16),
	Number(size[1] ?? 16)
);

var timestamp = performance.now();
var delta = 0;

function tick() {

	let time = performance.now();
	delta = time - timestamp;

	let scaling = window.devicePixelRatio ?? 1;
	let width = roundToNearest(canvas.clientWidth * scaling, 2);
	let height = roundToNearest(canvas.clientHeight * scaling, 2);

	if (canvas.width != width) canvas.width = width;
	if (canvas.height != height) canvas.height = height;

	if (camera.inputMethod == "mouse" || map.option.is_playing == false) {
		canvas.style.setProperty("cursor", "crosshair");
	} else {
		canvas.style.setProperty("cursor", "none");
	}

	context.clearRect(0, 0, canvas.width, canvas.height);

	context.save();
	context.translate(canvas.width / 2, canvas.height / 2);
	context.scale(camera.zoom, camera.zoom);
	context.translate(Math.round(camera.x), Math.round(camera.y));

	canvasTransformations.worldToCamera = context.getTransform();
	canvasTransformations.cameraToWorld = canvasTransformations.worldToCamera.inverse();

	section.loadIfNecessary();

	context.drawImage(
		section.canvas,

		section.offset.x,
		section.offset.y,

		section.canvas.width / camera.zoom,
		section.canvas.height / camera.zoom
	);

	if (map.option.is_playing) cursor.draw(context);

	context.restore();

	if (DEBUG) {
		context.fillStyle = "black";
		context.font = "16px monospace";
		context.textAlign = "left";
		context.textBaseline = "top";

		let lines = [
			"DEBUG STATS",
			"---",
			"Rendering:",
			`\tDelta-Time (ms): ${delta}`,
			`\tFrames per Second: ${roundToNearest(1000 / delta, 10)}`,
			"---",
			"Camera:",
			`\tPosition (in world-space): ${section.canvas.width/map.option.scale} x ${section.canvas.height/map.option.scale}`,
			`\tZoom (in screen-space): ${camera.zoom} [min=${camera.minZoom}, max=${camera.maxZoom}]`,
			"---",
			"Section:",
			`\tSize (tiles): ${section.canvas.width/map.option.scale} x ${section.canvas.height/map.option.scale}`,
			`\tPadding (tiles): ${section.padding.horizontal} x ${section.padding.vertical}`,
			`\tVisual offset (in world-space): ${section.offset.x}, ${section.offset.y}`,
			"---",
			"Map:",
			`\tIs playing? ${map.option.is_playing ? "yes" : "no"}`,
			`\tAutoclear enabled? ${map.option.autoclear ? "yes" : "no"}`,
			`\tSize (tiles): ${map.width} x ${map.height}`,
			`\tInitial bomb count: ${map.targetBombCount}`,
			`\tSafe zone size (tiles): ${map.option.safeZone.width} x ${map.option.safeZone.height}`,
			`\tBomb count: ${map.bombTileIndexes.length} // Post "safe zone" processing`,
			`\tFlag count: ${map.flagsUsed}`,
			`\tTiles revealed: ${map.tilesDiscovered}`,
			`\tSize (tiles): ${map.width} x ${map.height}`,
			"---",
			"Options:",
			"\t"
		];

		let position = { x: 16, y: 16 };

		for (let i = 0; i < lines.length; i ++) {

			let line = lines[i]!;
			
			if (line == "---") {
				context.beginPath();
				context.moveTo(position.x, position.y + 8);
				context.lineTo(position.x+100, position.y + 8);
				context.closePath();
				context.stroke();
				position.y += 16;
			} else {
				context.fillText(line, position.x, position.y);
			}

			position.y += 16;
		}

		context.save();
		context.translate(canvas.width / 2, canvas.height / 2);
		context.strokeStyle = "black";
		context.lineWidth = 2;
		context.beginPath();
		context.moveTo(0, -10);
		context.lineTo(0, 10);
		context.moveTo(-10, 0);
		context.lineTo(10, 0);
		context.closePath();
		context.stroke();
		context.restore();
	}

	timestamp = performance.now();
	window.requestAnimationFrame(tick);
}

tick();

function roundToNearest(value: number, interval: number): number {
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
