function random(...items) {
	return items[ Math.floor( Math.random() * items.length ) ];
}

let resetButtons = document.querySelectorAll("[resetbutton]");

for (let button of resetButtons) {
	button.addEventListener("click", () => {
		GAMEOVER_SCREEN.removeAttribute("show");
		WIN_SCREEN.removeAttribute("show");
		map.generateBombs();
		renderMap();
	});
}

let nextButtons = document.querySelectorAll("[nextbutton]");

for (let button of nextButtons) {
	button.addEventListener("click", () => {
		
		GAMEOVER_SCREEN.removeAttribute("show");
		WIN_SCREEN.removeAttribute("show");
		
		map.width *= 2;
		map.width = Math.ceil(map.width);
		
		map.height *= 2;
		map.height = Math.ceil(map.height);
		
		map.bombCount = Math.floor(map.width * map.height / 4);
		
		localStorage.setItem("minesweeper-highest", map.width+":"+map.height);
		console.log("Set map size to", map.width, map.height, "with", map.bombCount, "bombs");

		CANVAS.width = map.width * tileDisplaySize;
		CANVAS.height = map.height * tileDisplaySize;

		viewport.x = -CANVAS.width/2;
		viewport.y = -CANVAS.height/2;

		map.generateBombs();
		renderMap();

	})
}