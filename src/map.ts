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

	public static tiles:(TileType|number|undefined)[] = [];
	public static tilesDiscovered:number = 0;
	public static flagsUsed:number = 0;

	public static scale:number = 10;

	public static width:number = 0;
	public static height:number = 0;

	public static bombCount:number = 0;
	public static bombTileIndexes:number[] = [];

	public static canvas:HTMLCanvasElement|null = null;

	public static context:CanvasRenderingContext2D|null = null;

	public static isPlaying: boolean = false;

	public static styles = {

		colour: {
			unchecked: [ "green", "limegreen" ],

			safe: [ "burlywood", "beige" ],

			bomb: [ "red", "orange" ]
		},

		image: {
			bomb: new Image,
			flag: new Image,
			maybe: new Image
		}

	};

	public static reset(width:number, height:number) {
		this.width = width;
		this.height = height;

		this.tiles = new Array(width*height);

		this.tilesDiscovered = 0;
		this.flagsUsed = 0;

		this.bombTileIndexes = [];

		html.gameoverScreen.removeAttribute("show");
		html.winScreen.removeAttribute("show");

		this.canvas = document.createElement("canvas") as HTMLCanvasElement;
		this.canvas.width = width*this.scale;
		this.canvas.height = height*this.scale;
		this.context = this.canvas.getContext("2d");

		let bombCount = Math.floor(this.width * this.height / 4);

		for (let i = 0; i < bombCount; i ++) {
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

		this.drawMap();

		this.isPlaying = true;
		camera.zoom = 1;
		camera.x = (this.width * this.scale) / -2;
		camera.y = (this.height * this.scale) / -2;
		camera.enabled = true;

	}

	public static drawMap() {

		for (let y = 0; y < this.height; y ++) {
			for (let x = 0; x < this.width; x++) {
				this.drawTile(x, y);
			}
		}

	}

	public static drawTile(x:number, y:number) {

		if (!this.context) return;

		let tile = this.tiles[ y * this.width + x ];

		let colourIndex = (y * this.width + x + y%2) % 2;

		if (tile == undefined || tile == "Flag" || tile == "Maybe") {
			this.context.fillStyle = this.styles.colour.unchecked[colourIndex]!;
		} else {
			this.context.fillStyle = this.styles.colour.safe[colourIndex]!;
		}

		this.context.beginPath();
		this.context.rect(x*this.scale, y*this.scale, this.scale, this.scale);
		this.context.closePath();
		this.context.fill();

		// If current tile is a bomb
		if (typeof tile == "string" && tile.startsWith("Bomb")) {
			let index = Number( tile.replace("Bomb", "") );
			this.context.fillStyle = this.styles.colour.bomb[index]!;
			this.context.beginPath();
			let padding = this.scale/10;
			let radius = this.scale/10;
			this.context.roundRect(x*this.scale + padding/2, y*this.scale + padding/2, this.scale-padding, this.scale-padding, radius);
			this.context.closePath();
			this.context.fill();
		}
		let dx = x * this.scale + this.scale/2;
		let dy = y * this.scale + this.scale/2;

		if (tile == "Flag") {
			let size = this.scale*0.75;
			this.context.drawImage(this.styles.image.flag, dx-size/2, dy-size/2, size, size);
			return;

		} else if (tile == "Maybe") {
			let size = this.scale*0.5;
			this.context.drawImage(this.styles.image.maybe, dx-size/2, dy-size/2, size, size);
			return;

		} else if (typeof tile == "string" && tile.startsWith("Bomb")) {
			let size = this.scale*0.75;
			this.context.drawImage(this.styles.image.bomb, dx-size/2, dy-size/2, size, size);
			return;
		}
		if (tile == 0) return;
		if (tile == undefined) return;

		this.context.fillStyle = "black";
		this.context.lineWidth = 1;
		this.context.font = "600 24px poppins"
		this.context.textAlign = "center";
		this.context.textBaseline = "middle";
		this.context.fillText(tile.toString(), dx, dy);
	}

	public static exploreTile(x:number, y:number, forceUpdate=false) {

		if (this.isPlaying == false && forceUpdate == false) return;

		if (y < 0) return;
		if (x < 0) return;
		if (y >= this.height) return;
		if (x >= this.width) return;

		let index = y * this.width + x;

		if (this.tiles[index] == undefined || this.tiles[index] == "Maybe") this.tilesDiscovered += 1;

		this.checkForWin();

		if ( this.tiles[index] == "Flag" ) return;

		// If tile is a bomb
		if ( this.bombTileIndexes.includes(index) ) {

			let randomNumber = Math.floor( Math.random()*this.styles.colour.bomb.length );

			this.tiles[index] = `Bomb${randomNumber}`;

			this.drawTile(x, y);

			html.gameoverScreen_score.innerText = "~"+(this.tilesDiscovered / this.tiles.length * 100).toFixed(3)+"%";

			html.gameoverScreen.setAttribute("show", "true");
			html.reset.focus();

			this.isPlaying = false;
			camera.enabled = false;

			return;

		}

		let getIndex = (x:number, y:number) => {
			if ( x < 0 || x >= this.width ) return -1;
			if ( y < 0 || y >= this.height ) return -1;
			return y * this.width + x;
		} 

		let neighbourIndexes = [
			getIndex(x,   y-1),
			getIndex(x+1, y-1),
			getIndex(x+1, y),
			getIndex(x+1, y+1),
			getIndex(x,   y+1),
			getIndex(x-1, y+1),
			getIndex(x-1, y),
			getIndex(x-1, y-1)
		];

		let sumOfBombs = 0;
		let sumOfFlags = 0;

		for (let i = 0; i < neighbourIndexes.length; i ++) {
			let neighbourIndex = neighbourIndexes[i]!;
			if ( this.bombTileIndexes.includes(neighbourIndex) ) sumOfBombs += 1;
			let tile = this.tiles[neighbourIndex];
			if ( tile == "Flag" ) sumOfFlags += 1;
		}

		this.tiles[index] = sumOfBombs;

		html.tiles_shown.innerText = this.tilesDiscovered.toString();

		if (sumOfBombs == 0) {

			for (let i = 0; i < neighbourIndexes.length; i ++) {
				let index = neighbourIndexes[i]!;
				let tile = this.tiles[index];

				if (tile != undefined && tile != "Maybe") continue;

				let y = Math.floor( index / this.width );
				let x = index % this.width;

				this.exploreTile(x, y, true);
			}
		} else if (sumOfBombs == sumOfFlags) {

			for (let i = 0; i < neighbourIndexes.length; i ++) {
				let index = neighbourIndexes[i]!;
				let tile = this.tiles[index];

				if (tile != undefined && tile != "Maybe") continue;

				let y = Math.floor( index / this.width );
				let x = index % this.width;

				this.exploreTile(x, y, true);
			}
		}

		this.drawTile(x, y);

		return false;

	}

	public static toggleFlag(x:number, y:number) {
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

		this.drawTile(x, y);

	}

	public static toggleMaybe(x:number, y:number) {
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

		this.drawTile(x, y);

	}

	public static getTileFromPos(x:number, y:number) {
		if (y < 0) return NaN;
		if (x < 0) return NaN;
		if (y > this.height) return NaN;
		if (x > this.width-1) return NaN;

		let index = y * this.width + x;

		if (this.bombTileIndexes.includes(index) && !this.tiles[index]) {
			return "Bomb";
		}

		return this.tiles[index];
	}

	public static checkForWin() {
		if ( this.isPlaying == false ) return false;
		if (this.tilesDiscovered != this.tiles.length - this.bombTileIndexes.length) return false;

		html.winScreen.setAttribute("show", "true");
		html.playAgain.focus();

		this.isPlaying = false;
		camera.enabled = false;
		return true;
	}

};
