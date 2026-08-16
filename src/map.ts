import camera from "./camera.js";

type TileType = "Flag" | `Bomb${number}` | "Maybe";

export const html = {
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

export class GameMap {

	public static tiles: (TileType | number | undefined)[] = [];
	public static tilesDiscovered: number = 0;
	public static flagsUsed: number = 0;

	public static scale: number = 10;

	public static width: number = 0;
	public static height: number = 0;

	public static bombCount: number = 0;
	public static bombTileIndexes: number[] = [];

	public static isPlaying: boolean = false;

	public static styles = {

		colour: {
			unchecked: ["green", "limegreen"],

			safe: ["burlywood", "beige"],

			bomb: ["red", "orange"]
		},

		image: {
			bomb: new Image,
			flag: new Image,
			maybe: new Image
		}

	};

	public static reset(width: number, height: number) {
		this.width = width;
		this.height = height;

		let isGliding = true;

		if (this.tiles.length == 0) isGliding = false;

		this.tiles = new Array(width * height);

		this.tilesDiscovered = 0;
		this.flagsUsed = 0;

		this.bombTileIndexes = [];

		html.gameoverScreen.removeAttribute("show");
		html.winScreen.removeAttribute("show");

		let bombCount = Math.floor(this.width * this.height / 4);

		for (let i = 0; i < bombCount; i++) {
			let randomIndex = Math.floor(Math.random() * this.tiles.length);

			while (this.bombTileIndexes.includes(randomIndex)) {
				randomIndex = Math.floor(Math.random() * this.tiles.length);
			}

			this.bombTileIndexes[i] = randomIndex;
		}

		html.tile_count.innerText = "?";
		html.tiles_shown.innerText = "0";
		html.flag_count.innerText = "?";
		html.flags_used.innerText = "0";

		// this.drawMap();

		let zoom = 1;
		let x = (this.width * this.scale) / -2;
		let y = (this.width * this.scale) / -2;

		if (isGliding) {
			let zoomOffset = zoom - camera.zoom;
			camera.glideByZoom(zoomOffset);
			
			camera.glideByOffset(
				x - camera.x,
				y - camera.y
			)
		} else {
			camera.zoom = zoom;
			camera.x = x;
			camera.y = y;
		}
		
		
		this.isPlaying = true;
		camera.enabled = true;

	}

	public static drawMap(context: CanvasRenderingContext2D) {

		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				this.drawTile(x, y, context);
			}
		}

	}

	public static drawTile(x: number, y: number, context: CanvasRenderingContext2D) {

		if (!context) return;

		if (x < 0) return;
		if (y < 0) return;

		if (x > this.width-1) return;
		if (y > this.height-1) return;

		let tile = this.tiles[y * this.width + x];

		let colourIndex = (x + y % 2) % 2;

		if (tile == undefined || tile == "Flag" || tile == "Maybe") {
			context.fillStyle = this.styles.colour.unchecked[colourIndex]!;
		} else {
			context.fillStyle = this.styles.colour.safe[colourIndex]!;
		}

		context.save();
		context.scale(this.scale, this.scale);
		context.translate(x, y);

		context.beginPath();
		context.rect(0, 0, 1, 1);
		context.closePath();
		context.fill();


		// If current tile is a bomb
		if (typeof tile == "string" && tile.startsWith("Bomb")) {
			let index = Number(tile.replace("Bomb", ""));
			context.fillStyle = this.styles.colour.bomb[index]!;
			context.beginPath();
			let padding = 1 / 10;
			let radius = 1 / 10;
			context.roundRect(padding / 2, padding / 2, 1 - padding, 1 - padding, radius);
			context.closePath();
			context.fill();
		}

		let offset = 1 / 2;
		context.translate(offset, offset);

		if (tile == "Flag") {
			let size = 3 / 4;
			context.drawImage(this.styles.image.flag, -size / 2, -size / 2, size, size);
		}
		else if (tile == "Maybe") {
			let size = 1 / 2;
			context.drawImage(this.styles.image.maybe, -size / 2, -size / 2, size, size);
		}
		else if (typeof tile == "string" && tile.startsWith("Bomb")) {
			let size = 3 / 4;
			context.drawImage(this.styles.image.bomb, -size / 2, -size / 2, size, size);
		}
		else if (typeof tile == "number" && tile != 0) {
			context.scale(1 / this.scale, 1 / this.scale);
			context.fillStyle = "black";
			context.lineWidth = 1;
			context.font = "600 24px poppins"
			context.textAlign = "center";
			context.textBaseline = "middle";
			context.fillText(tile.toString(), offset, offset);
		}

		context.restore();
	}

	public static exploreTile(x: number, y: number, context?: CanvasRenderingContext2D, forceUpdate = false) {

		if (this.isPlaying == false && forceUpdate == false) return;

		if (y < 0) return;
		if (x < 0) return;
		if (y >= this.height) return;
		if (x >= this.width) return;

		let index = y * this.width + x;

		if (this.tiles[index] == undefined || this.tiles[index] == "Maybe") this.tilesDiscovered += 1;

		this.checkForWin();

		if (this.tiles[index] == "Flag") return;

		// If tile is a bomb
		if (this.bombTileIndexes.includes(index)) {

			let randomNumber = Math.floor(Math.random() * this.styles.colour.bomb.length);

			this.tiles[index] = `Bomb${randomNumber}`;

			if (context) this.drawTile(x, y, context);

			let tileCount = this.tiles.length - this.bombTileIndexes.length;
			html.gameoverScreen_score.innerText = "~" + (this.tilesDiscovered / tileCount * 100).toFixed(3).replace(/\.?0+$/, "") + "%";

			html.gameoverScreen.setAttribute("show", "true");
			html.reset.focus();

			this.isPlaying = false;
			camera.enabled = false;

			camera.glideByZoom(-0.5);

			return;

		}

		let getIndex = (x: number, y: number) => {
			if (x < 0 || x >= this.width) return -1;
			if (y < 0 || y >= this.height) return -1;
			return y * this.width + x;
		}

		let neighbourIndexes = [
			getIndex(x, y - 1),
			getIndex(x + 1, y - 1),
			getIndex(x + 1, y),
			getIndex(x + 1, y + 1),
			getIndex(x, y + 1),
			getIndex(x - 1, y + 1),
			getIndex(x - 1, y),
			getIndex(x - 1, y - 1)
		];

		let sumOfBombs = 0;
		let sumOfFlags = 0;

		for (let i = 0; i < neighbourIndexes.length; i++) {
			let neighbourIndex = neighbourIndexes[i]!;
			if (this.bombTileIndexes.includes(neighbourIndex)) sumOfBombs += 1;
			let tile = this.tiles[neighbourIndex];
			if (tile == "Flag") sumOfFlags += 1;
		}

		this.tiles[index] = sumOfBombs;

		html.tiles_shown.innerText = this.tilesDiscovered.toString();

		if (sumOfBombs == 0) {

			for (let i = 0; i < neighbourIndexes.length; i++) {
				let index = neighbourIndexes[i]!;
				let tile = this.tiles[index];

				if (tile != undefined && tile != "Maybe") continue;

				let y = Math.floor(index / this.width);
				let x = index % this.width;

				this.exploreTile(x, y, context, true);
			}
		} else if (sumOfBombs == sumOfFlags) {

			for (let i = 0; i < neighbourIndexes.length; i++) {
				let index = neighbourIndexes[i]!;
				let tile = this.tiles[index];

				if (tile != undefined && tile != "Maybe") continue;

				let y = Math.floor(index / this.width);
				let x = index % this.width;

				this.exploreTile(x, y, context, true);
			}
		}

		if (context) this.drawTile(x, y, context);

	}

	public static toggleFlag(x: number, y: number, context?: CanvasRenderingContext2D) {
		if (y < 0) return;
		if (x < 0) return;
		if (y > this.height) return;
		if (x > this.width) return;

		let index = y * this.width + x;

		if (this.tiles[index] == undefined || this.tiles[index] == "Maybe") {
			this.tiles[index] = "Flag";
			this.flagsUsed += 1;
		} else if (this.tiles[index] == "Flag") {
			this.tiles[index] = undefined;
			this.flagsUsed -= 1;
		}

		html.flags_used.innerText = this.flagsUsed.toString();
		this.checkForWin();

		if (context) this.drawTile(x, y, context);

	}

	public static toggleMaybe(x: number, y: number, context?: CanvasRenderingContext2D) {
		if (y < 0) return;
		if (x < 0) return;
		if (y > this.height) return;
		if (x > this.width) return;

		let index = y * this.width + x;

		if (this.tiles[index] == undefined) {
			this.tiles[index] = "Maybe";
		} else if (this.tiles[index] == "Maybe") {
			this.tiles[index] = undefined;
		}

		if (context) this.drawTile(x, y, context);

	}

	public static getTileFromPos(x: number, y: number) {
		if (y < 0) return NaN;
		if (x < 0) return NaN;
		if (y > this.height) return NaN;
		if (x > this.width - 1) return NaN;

		let index = y * this.width + x;

		if (this.bombTileIndexes.includes(index) && !this.tiles[index]) {
			return "Bomb";
		}

		return this.tiles[index];
	}

	public static checkForWin() {
		if (this.isPlaying == false) return false;
		if (this.tilesDiscovered != this.tiles.length - this.bombTileIndexes.length) return false;

		html.winScreen.setAttribute("show", "true");
		html.playAgain.focus();

		this.isPlaying = false;
		camera.enabled = false;
		
		camera.glideByZoom(-0.5);
		return true;
	}

};
