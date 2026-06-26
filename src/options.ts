import { GameMap } from "./map.js";


const html = {
	menu: document.getElementById("options") as HTMLElement,
	menuToggle: document.getElementById("options-toggle") as HTMLImageElement,
	sizeInput: document.getElementById("opt-size") as HTMLInputElement,
	newGame: document.getElementById("opt-reset") as HTMLButtonElement
}

function toggleMenu() {
	let state:boolean = html.menu.hasAttribute("show");

	if (state == false) html.menu.setAttribute("show", "");
	else html.menu.removeAttribute("show");
}

document.addEventListener("keyup", (e:KeyboardEvent) => {

	if (e.ctrlKey == false) return;
	if (e.key != ",") return;

	toggleMenu();

});

html.menuToggle.addEventListener("click", toggleMenu);

html.newGame.addEventListener("click", () => {

	let size = html.sizeInput.valueAsNumber || 16;

	localStorage.setItem("minesweeper-size", `${size}x${size}`);

	GameMap.reset(size, size);
	html.menu.removeAttribute("show");

});