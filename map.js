const FLAGS_USED = document.getElementById("flags-used");

const TILES_SHOWN = document.getElementById("tiles-shown");
const TOTAL_TILES = document.getElementById("total-tiles");

var map = {
	tiles: [],
	tilesDiscovered: 0,
	flagsUsed: 0,

	width: 0,
	height: 0,

	bombCount: 0,
	bombTileIndexes: [],


	generateBombs() {
		let length = this.width * this.height;
		this.tiles = new Array(length);
		this.tilesDiscovered = 0;

		for (let i = 0; i < this.bombCount; i ++) {
			let randomIndex = Math.floor(Math.random() * length);

			while (this.bombTileIndexes.includes(randomIndex)) {
				randomIndex = Math.floor(Math.random() * length);
			}

			this.bombTileIndexes[i] = randomIndex;
		}

		this.flagsUsed = 0;
		FLAGS_USED.innerText = 0;
		FLAG_COUNT.innerText = this.bombCount;
		TILES_SHOWN.innerText = 0;
		TOTAL_TILES.innerText = this.width * this.height - this.bombCount;

	},

	/**
	 * @param {number} x 
	 * @param {number} y 
	 */
	exploreTile(x, y) {
		if (y < 0) return;
		if (x < 0) return;
		if (y >= this.height) return;
		if (x >= this.width) return;

		
		let index = y * this.width + x;

		if (map.tiles[index] != undefined) return;
		
		let tileValue = this.getTileFromPos(x, y);
		if (tileValue == "FLAG") return;
		if (typeof tileValue == "string") {
			if (tileValue == "_") this.tiles[index] = random(...Object.keys(BOMB_COLOURS));
			SCORE.innerText = (map.tilesDiscovered / (map.width * map.height - map.bombCount) * 100).toFixed(2);
			GAMEOVER_SCREEN.setAttribute("show", "");
			return true;
		}
		if (this.getTileFromPos(x, y) != undefined) return;
		
		let nn = typeof this.getTileFromPos(x,   y-1) == "string";
		let ne = typeof this.getTileFromPos(x+1, y-1) == "string";
		let ee = typeof this.getTileFromPos(x+1, y) == "string";
		let es = typeof this.getTileFromPos(x+1, y+1) == "string";
		let ss = typeof this.getTileFromPos(x,   y+1) == "string";
		let sw = typeof this.getTileFromPos(x-1, y+1) == "string";
		let ww = typeof this.getTileFromPos(x-1, y) == "string";
		let wn = typeof this.getTileFromPos(x-1, y-1) == "string";
		
		let sum = Number(0 +nn +ne +ee +es +ss +sw +ww +wn);
		this.tiles[index] = sum;

		this.tilesDiscovered += 1;
		TILES_SHOWN.innerText = this.tilesDiscovered;

		if (this.tilesDiscovered == this.width * this.height - this.bombCount) {
			WIN_SCREEN.setAttribute("show", "");
			if (localStorage.getItem("minesweeper-highest") == this.width+":"+this.height) {
				HIGHSCORE_SCREEN.getElementsByTagName("p")[0].innerText = "You just beat "+this.width+"x"+this.height+"!";
				HIGHSCORE_SCREEN.style.display = null;
				HIGHSCORE_SCREEN.style.animation = "high-score-in 1s cubic-bezier(0.5, 0, 0, 1)";
			}
			return;
		}

		
		if (sum == 0) {
			if (this.getTileFromPos(x,   y-1) == undefined) this.exploreTile(x,   y-1);
			if (this.getTileFromPos(x+1, y-1) == undefined) this.exploreTile(x+1, y-1);
			if (this.getTileFromPos(x+1, y)   == undefined) this.exploreTile(x+1, y);
			if (this.getTileFromPos(x+1, y+1) == undefined) this.exploreTile(x+1, y+1);
			if (this.getTileFromPos(x,   y+1) == undefined) this.exploreTile(x,   y+1);
			if (this.getTileFromPos(x-1, y+1) == undefined) this.exploreTile(x-1, y+1);
			if (this.getTileFromPos(x-1, y)   == undefined) this.exploreTile(x-1, y);
			if (this.getTileFromPos(x-1, y-1) == undefined) this.exploreTile(x-1, y-1);
		}

		return false;
		
	},

	/**
	 * @param {number} x 
	 * @param {number} y 
	 */
	placeFlag(x, y) {
		if (y < 0) return;
		if (x < 0) return;
		if (y > this.height) return;
		if (x > this.width) return;

		if (this.tiles[y * this.width + x] == undefined) {
			this.tiles[y * this.width + x] = "FLAG";
			this.flagsUsed += 1;
			FLAGS_USED.innerText = this.flagsUsed;
		}
		
	},

	/**
	 * @param {number} x 
	 * @param {number} y 
	 */
	destroyFlag(x, y) {
		if (y < 0) return;
		if (x < 0) return;
		if (y > this.height) return;
		if (x > this.width) return;

		if (this.tiles[y * this.width + x] == "FLAG") {
			this.tiles[y * this.width + x] = undefined;
			this.flagsUsed -= 1;
			FLAGS_USED.innerText = this.flagsUsed;
		}
	},

	/**
	 * @param {number} x 
	 * @param {number} y 
	 */
	getTileFromPos(x, y) {
		if (y < 0) return NaN;
		if (x < 0) return NaN;
		if (y > this.height) return NaN;
		if (x > this.width-1) return NaN;

		let index = y * this.width + x;

		if (this.bombTileIndexes.includes(index) && !this.tiles[index]) {
			return "_";
		}

		return this.tiles[index];
	},

	reveal() {
		for (let i = 0; i < this.tiles.length; i ++) {
			this.exploreTile()
		}
	},

	toString() {
		let string = "";
		for (let y = 0; y < this.height; y ++) {
			let line = "";
			for (let x = 0; x < this.width; x++) {
				let tile = this.tiles[ y * this.width + x ];
				if (typeof tile == "number") line += tile;
				else if (typeof tile == "string") line += "#";
				else line += " ";
			}
			string += line + "\n";
		}
		string = string.slice(0, -1);
		return string;
	},

};
