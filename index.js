/** @type {HTMLCanvasElement} */
const SCREEN = document.getElementById("screen");

/** @type {CanvasRenderingContext2D} */
const SCREEN_CONTEXT = SCREEN.getContext("2d");

/** @type {HTMLCanvasElement} */
const CANVAS = document.createElement("canvas");

/** @type {CanvasRenderingContext2D} */
const CONTEXT = CANVAS.getContext("2d");

const GAMEOVER_SCREEN = document.getElementById("gameover");
const WIN_SCREEN = document.getElementById("win");
const HIGHSCORE_SCREEN = document.getElementById("high-score");

const FLAG_COUNT = document.getElementById("flag-count");
const SCORE = document.getElementById("score");

const UNCHECKED_COLOURS = [ "#A2D149", "#AAD751" ];
const SAVE_COLOURS = [ "#D7B899", "#E5C29F" ]
const BOMB_COLOURS = { A: "#DB3236", B: "#F4840D", C: "#F4C20D", D: "#48E6F1", E: "#B648F2", F: "#ED44B5" };

const BOMB_SVG = new Image;
BOMB_SVG.src = "./assets/bomb.svg";

const FLAG_SVG = new Image;
FLAG_SVG.src = "./assets/flag.svg";

let tileDisplaySize = 100;

var viewport = {
	x: 0, y: 0,
	zoom: 1,
};

let save = localStorage.getItem("minesweeper-highest") || "10:10";

map.width = save.split(":")[0] || 10;
map.height = save.split(":")[1] || 10;
map.bombCount = Math.floor(map.width * map.height / 4);
map.generateBombs();

CANVAS.width = map.width * tileDisplaySize;
CANVAS.height = map.height * tileDisplaySize;

viewport.x = -CANVAS.width/2;
viewport.y = -CANVAS.height/2;

renderMap();




function tick() {
	// renderMap();
	
	if (SCREEN.width != window.innerWidth) {
		SCREEN.width = window.innerWidth;
	}
	if (SCREEN.height != window.innerHeight) {
		SCREEN.height = window.innerHeight;
	}
	
	SCREEN_CONTEXT.clearRect(0, 0, SCREEN.width, SCREEN.height);
	
	SCREEN_CONTEXT.save();
	SCREEN_CONTEXT.translate(SCREEN.width/2, SCREEN.height/2);
	SCREEN_CONTEXT.scale(viewport.zoom, viewport.zoom);
	SCREEN_CONTEXT.translate(viewport.x, viewport.y);
	
	SCREEN_CONTEXT.drawImage(CANVAS, 0, 0);
	
	cursor();
	
	SCREEN_CONTEXT.restore();

	window.requestAnimationFrame(tick);
}

function renderMap() {
	// console.groupCollapsed("Rendering world");
	for (let y = 0; y < map.height; y ++) {
		for (let x = 0; x < map.width; x++) {
			renderBlock(x, y);
		}
	}
	// console.groupEnd();
}

function renderBlock(x, y) {
	// console.log(x, y);
	let tile = map.tiles[ y * map.width + x ];

	let colourIndex = (y * map.width + x + y%2) % 2;

	if (tile == undefined || tile == "FLAG") {
		CONTEXT.fillStyle = UNCHECKED_COLOURS[colourIndex];
	} else {
		CONTEXT.fillStyle = SAVE_COLOURS[colourIndex];
	}

	CONTEXT.beginPath();
	CONTEXT.rect(x*tileDisplaySize, y*tileDisplaySize, tileDisplaySize, tileDisplaySize);
	CONTEXT.closePath();
	CONTEXT.fill();

	if (typeof tile == "string" && /^[a-zA-Z]+$/.test(tile)) {
		CONTEXT.fillStyle = BOMB_COLOURS[tile];
		CONTEXT.beginPath();
		let padding = 10;
		let radius = 5;
		CONTEXT.roundRect(x*tileDisplaySize + padding/2, y*tileDisplaySize + padding/2, tileDisplaySize-padding, tileDisplaySize-padding, radius);
		CONTEXT.closePath();
		CONTEXT.fill();
	}
	let dx = x * tileDisplaySize + tileDisplaySize/2;
	let dy = y * tileDisplaySize + tileDisplaySize/2;

	if (tile == "FLAG") {
		let size = tileDisplaySize*0.75;
		CONTEXT.drawImage(FLAG_SVG, dx-size/2, dy-size/2, size, size);
		return;
	} else if (typeof tile == "string" && /[a-zA-Z]/.test(tile)) {
		let size = tileDisplaySize*0.75;
		CONTEXT.drawImage(BOMB_SVG, dx-size/2, dy-size/2, size, size);
		return;
	}
	if (tile == 0) return;
	if (tile == undefined) return;

	CONTEXT.fillStyle = "black";
	CONTEXT.lineWidth = 1;
	CONTEXT.font = "600 24px poppins"
	CONTEXT.textAlign = "center";
	CONTEXT.textBaseline = "middle";
	CONTEXT.fillText(tile, dx, dy);
}

function cursor() {
	if (GAMEOVER_SCREEN.matches(":hover") || WIN_SCREEN.matches(":hover")) return;
	
	let tileX = Math.floor( mouse.x / tileDisplaySize );
	let tileY = Math.floor( mouse.y / tileDisplaySize );
	
	SCREEN_CONTEXT.beginPath();
	SCREEN_CONTEXT.strokeStyle = "#FFFFFF70";
	SCREEN_CONTEXT.lineWidth = 3;
	SCREEN_CONTEXT.lineJoin = "miter";
	SCREEN_CONTEXT.setLineDash([10, 5]);
	SCREEN_CONTEXT.rect(tileX * tileDisplaySize, tileY * tileDisplaySize, tileDisplaySize, tileDisplaySize);
	SCREEN_CONTEXT.closePath();
	SCREEN_CONTEXT.stroke();

	if (mouse.buttons.left) {
		if (
			tileX >= 0 && tileX < map.width &&
			tileY >= 0 && tileY < map.height
		) {
			let tile = map.getTileFromPos(tileX, tileY);

			if (map.tilesDiscovered == 0) {
				function removeBombFrom(x, y) {
					let possibleBombIndex = map.bombTileIndexes.indexOf(y * map.width + x);
					if (possibleBombIndex != -1) {
						map.bombTileIndexes.splice(possibleBombIndex, 1)
						map.bombCount -= 1;
					}
				}
				tile = 0;
				removeBombFrom(tileX, tileY);
				removeBombFrom(tileX, tileY-1);
				removeBombFrom(tileX+1, tileY-1);
				removeBombFrom(tileX+1, tileY);
				removeBombFrom(tileX+1, tileY+1);
				removeBombFrom(tileX, tileY+1);
				removeBombFrom(tileX-1, tileY+1);
				removeBombFrom(tileX-1, tileY);
				removeBombFrom(tileX-1, tileY-1);

				map.exploreTile(tileX, tileY);

				renderMap();
				FLAG_COUNT.innerText = map.bombCount;
				TOTAL_TILES.innerText = map.width * map.height - map.bombCount;
			} else if (typeof tile == "number" && tile != 0) {
				// console.log("Attempting auto-clearing");
				let bombCount = map.getTileFromPos(tileX, tileY);
				// console.log("Total tile bombs:", bombCount);

				let nn = map.getTileFromPos(tileX,   tileY-1) == "FLAG";
				let ne = map.getTileFromPos(tileX+1, tileY-1) == "FLAG";
				let ee = map.getTileFromPos(tileX+1, tileY) == "FLAG";
				let es = map.getTileFromPos(tileX+1, tileY+1) == "FLAG";
				let ss = map.getTileFromPos(tileX,   tileY+1) == "FLAG";
				let sw = map.getTileFromPos(tileX-1, tileY+1) == "FLAG";
				let ww = map.getTileFromPos(tileX-1, tileY) == "FLAG";
				let wn = map.getTileFromPos(tileX-1, tileY-1) == "FLAG";

				
				let sumOfFlags = Number(0 +nn +ne +ee +es +ss +sw +ww +wn);
				// console.log("Neighboring flags:", sumOfFlags);

				if ( sumOfFlags == bombCount ) {
					// console.log("Clearing other tiles");
					map.exploreTile(tileX,   tileY-1);
					map.exploreTile(tileX+1, tileY-1);
					map.exploreTile(tileX+1, tileY);
					map.exploreTile(tileX+1, tileY+1);
					map.exploreTile(tileX,   tileY+1);
					map.exploreTile(tileX-1, tileY+1);
					map.exploreTile(tileX-1, tileY);
					map.exploreTile(tileX-1, tileY-1);
					renderMap();
				}
			}

			map.exploreTile(tileX, tileY);
			renderBlock(tileX, tileY);
			renderBlock(tileX,   tileY-1);
			renderBlock(tileX+1, tileY-1);
			renderBlock(tileX+1, tileY);
			renderBlock(tileX+1, tileY+1);
			renderBlock(tileX,   tileY+1);
			renderBlock(tileX-1, tileY+1);
			renderBlock(tileX-1, tileY);
			renderBlock(tileX-1, tileY-1);

			// console.log(tile);

			if (tile == "_") {
			}

			mouse.buttons.left = false;

		}
	} else if (mouse.buttons.right) {
		if (
			tileX >= 0 && tileX < map.width &&
			tileY >= 0 && tileY < map.height
		) {
			let tile = map.tiles[tileY * map.width + tileX];
			if (tile == undefined) map.placeFlag(tileX, tileY);
			else if (tile == "FLAG") map.destroyFlag(tileX, tileY);
			mouse.buttons.right = false;
			renderBlock(tileX, tileY);
			renderBlock(tileX, tileY);
			renderBlock(tileX,   tileY-1);
			renderBlock(tileX+1, tileY-1);
			renderBlock(tileX+1, tileY);
			renderBlock(tileX+1, tileY+1);
			renderBlock(tileX,   tileY+1);
			renderBlock(tileX-1, tileY+1);
			renderBlock(tileX-1, tileY);
			renderBlock(tileX-1, tileY-1);
		}
	}
}

tick();


HIGHSCORE_SCREEN.addEventListener("animationend", (e) => {
	if (e.animationName == "high-score-out") {
		HIGHSCORE_SCREEN.style.display = "none";
		HIGHSCORE_SCREEN.style.animation = null;
		return;
	}
	
	setTimeout(() => {
		HIGHSCORE_SCREEN.style.animation = "high-score-out 1s cubic-bezier(0.5, 0, 0, 1)";
	}, 1000);

});