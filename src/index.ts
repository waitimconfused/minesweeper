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

const canvas: HTMLCanvasElement = document.getElementById("screen") as HTMLCanvasElement;

const context: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;

const playAgainButton: HTMLButtonElement = document.getElementById("again") as HTMLButtonElement;


GameMap.scale = 100;

let size = (localStorage.getItem("minesweeper-size") ?? "16x16").split("x")
GameMap.reset(
	Number(size[0] ?? 16),
	Number(size[1] ?? 16)
);

var cursorTransformation: DOMMatrix | null = null;

function tick() {

	if (canvas.width != window.innerWidth) {
		canvas.width = window.innerWidth;
	}
	if (canvas.height != window.innerHeight) {
		canvas.height = window.innerHeight;
	}

	if (GameMap.isPlaying == false) {

		let targetZoom = Math.min(
			(window.innerHeight - 100) / (GameMap.height * GameMap.scale),
			(window.innerWidth - 100) / (GameMap.width * GameMap.scale)
		);
		let targetX = (GameMap.width * GameMap.scale) / -2;
		let targetY = (GameMap.height * GameMap.scale) / -2;

		if (camera.enabled == false) {
			let factor = 1 / 16;
			camera.zoom = camera.zoom + (targetZoom - camera.zoom) * factor;
			camera.x = Math.round(camera.x + (targetX - camera.x) * factor);
			camera.y = Math.round(camera.y + (targetY - camera.y) * factor);
		}

	}

	context.clearRect(0, 0, canvas.width, canvas.height);

	context.save();
	context.translate(canvas.width / 2, canvas.height / 2);
	context.scale(camera.zoom, camera.zoom);
	context.translate(camera.x, camera.y);

	if (GameMap.canvas) context.drawImage(GameMap.canvas, 0, 0);

	if (GameMap.isPlaying) drawCursor();

	context.restore();

	window.requestAnimationFrame(tick);
}

tick();



function drawCursor() {
	cursorTransformation = context.getTransform().inverse();

	let domPoint = new DOMPoint(camera.mouse.x, camera.mouse.y);
	domPoint = domPoint.matrixTransform(cursorTransformation!);

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

	if (canvas.matches(":hover") == false) return;

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

	} else if (type == "flag") {
		GameMap.toggleFlag(point.x, point.y);
	} else if (type == "maybe") {
		GameMap.toggleMaybe(point.x, point.y);
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


html.reset.addEventListener("click", () => {
	camera.x = (GameMap.width * GameMap.scale) / -2;
	camera.y = (GameMap.height * GameMap.scale) / -2;
	GameMap.reset(GameMap.width, GameMap.height);
});

playAgainButton.addEventListener("click", () => {
	GameMap.reset(GameMap.width, GameMap.height);
});