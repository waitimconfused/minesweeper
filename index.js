import { default as map, html } from "./map.js";
import camera from "./camera.js";

map.styles.colour.unchecked = [ "#A2D149", "#AAD751" ];
map.styles.colour.safe = [ "#D7B899", "#E5C29F" ];
map.styles.colour.bomb = [ "#DB3236", "#F4840D", "#F4C20D", "#48E6F1", "#B648F2", "#ED44B5" ];

map.styles.image.bomb = new Image;
map.styles.image.bomb.src = "./assets/bomb.svg";

map.styles.image.flag = new Image;
map.styles.image.flag.src = "./assets/flag.svg";

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("screen");

/** @type {CanvasRenderingContext2D} */
const context = canvas.getContext("2d");

const playAgainButton = document.getElementById("again");


map.scale = 100;
map.reset(16, 16);

var cursorTransformation;

function tick() {

	if (canvas.width != window.innerWidth) {
		canvas.width = window.innerWidth;
	}
	if (canvas.height != window.innerHeight) {
		canvas.height = window.innerHeight;
	}

	if (map.isPlaying == false) {

		let targetZoom = Math.min(
			(window.innerHeight-100) / (map.height * map.scale),
			(window.innerWidth-100) / (map.width * map.scale)
		);
		let targetX = (map.width * map.scale) / -2;
		let targetY = (map.height * map.scale) / -2;

		if (
			camera.enabled == false &&
			camera.zoom < targetZoom + 0.001 &&
			Math.abs(camera.x) < Math.abs(targetX) + 0.001 &&
			Math.abs(camera.y) < Math.abs(targetY) + 0.001
		) {
			camera.enabled = true;
		} else {
			let factor = 1/16;
			camera.zoom = camera.zoom + ( targetZoom - camera.zoom ) * factor;
			camera.x = Math.round(camera.x + ( targetX - camera.x ) * factor);
			camera.y = Math.round(camera.y + ( targetY - camera.y ) * factor);
		}

	}
	
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	context.save();
	context.translate(canvas.width/2, canvas.height/2);
	context.scale(camera.zoom, camera.zoom);
	context.translate(camera.x, camera.y);

	context.drawImage(map.canvas, 0, 0);

	if (map.isPlaying) drawCursor();
	
	context.restore();

	window.requestAnimationFrame(tick);
}

tick();



function drawCursor() {
	cursorTransformation = context.getTransform().inverse();

	let point = new DOMPoint(camera.mouse.x, camera.mouse.y);
	point = point.matrixTransform(cursorTransformation);
	
	point = {
		x: Math.floor( point.x / map.scale),
		y: Math.floor( point.y / map.scale)
	};

	context.strokeStyle = "white";
	context.lineWidth = map.scale / 20;
	context.globalAlpha = 0.5;

	context.setLineDash([20, 20]);
	context.lineDashOffset = performance.now() / 100;
	context.lineCap = "round";
	context.lineJoin = "round";

	context.beginPath();
	context.rect(
		point.x*map.scale,
		point.y*map.scale,
		map.scale,
		map.scale
	);
	context.closePath();

	context.stroke();

	context.globalAlpha = 1;
}


document.addEventListener("click", (e) => {

	if (canvas.matches(":hover") == false) return;

	if (map.isPlaying == false) return;

	let point = new DOMPoint(camera.mouse.x, camera.mouse.y);
	point = point.matrixTransform(cursorTransformation);
	
	point = {
		x: Math.floor( point.x / map.scale),
		y: Math.floor( point.y / map.scale)
	};

	if ( map.tilesDiscovered == 0 ) {
		
		let clearSize = 3;

		for (let y = 0; y < clearSize; y ++) {

			for (let x = 0; x < clearSize; x ++) {

				let position = {
					x: point.x - Math.floor(clearSize/2) + x,
					y: point.y - Math.floor(clearSize/2) + y
				}

				let tileIndex = position.y * map.width + position.x;
				let bombIndex = map.bombTileIndexes.indexOf(tileIndex);

				map.bombTileIndexes.splice(bombIndex, 1);

			}

		}
		html.tile_count.innerText = map.tiles.length - map.bombTileIndexes.length;
		html.flag_count.innerText = map.bombTileIndexes.length;
	}

	map.exploreTile(point.x, point.y);

});

document.addEventListener("contextmenu", (e) => {

	if (canvas.matches(":hover") == false) return;

	let point = new DOMPoint(camera.mouse.x, camera.mouse.y);
	point = point.matrixTransform(cursorTransformation);
	
	point = {
		x: Math.floor( point.x / map.scale),
		y: Math.floor( point.y / map.scale)
	};

	map.toggleFlag(point.x, point.y);

});


html.reset.addEventListener("click", () => {
	camera.x = (map.width * map.scale) / -2;
	camera.y = (map.height * map.scale) / -2;
	map.reset( map.width, map.height );
});

playAgainButton.addEventListener("click", () => {
	map.reset( map.width, map.height );
});