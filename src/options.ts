import * as map from "./map.js";


const inputs = {
	menu: document.getElementById("options") as HTMLElement,
	menuToggle: document.getElementById("options-toggle") as HTMLImageElement,
	newGame: document.getElementById("opt-reset") as HTMLButtonElement,

	sizeInput: document.getElementById("opt-size") as HTMLInputElement,
	autoclear: document.getElementById("opt-autoclear") as HTMLInputElement
}

function toggleMenu() {
	let state: boolean = inputs.menu.hasAttribute("show");

	if (state == false) {
		inputs.menu.setAttribute("show", "");
		map.option.is_playing = false;
	}
	else {
		inputs.menu.removeAttribute("show");
		map.option.is_playing = true;
	}
}

document.addEventListener("keyup", (e: KeyboardEvent) => {

	if (e.ctrlKey == false) return;
	if (e.key != ",") return;

	toggleMenu();

});

inputs.menuToggle.addEventListener("click", toggleMenu);

inputs.newGame.addEventListener("click", () => {

	let size = inputs.sizeInput.valueAsNumber || 16;

	size = Math.max(size, 8);

	localStorage.setItem("option-map-size", `${size}x${size}`);

	map.reset(size, size);
	inputs.menu.removeAttribute("show");

});

inputs.autoclear.addEventListener("change", () => {

	let state = inputs.autoclear.checked;
	map.option.autoclear = state;

	localStorage.setItem("option-autoclear", String(state));

});

inputs.autoclear.checked = Boolean( localStorage.getItem("option-autoclear") );
map.option.autoclear = inputs.autoclear.checked;