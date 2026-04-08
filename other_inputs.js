import camera from "./camera.js";
import { click } from "./index.js";
import map from "./map.js";

const reset = document.getElementById("reset");
const playAgain = document.getElementById("again");

const canvas = document.getElementById("screen");

function glideCameraByBlockOffset(x, y, c=1) {
	if (c >= 5) return;
	camera.x -= x * map.scale / 4;
	camera.y -= y * map.scale / 4;
	setTimeout(()=>glideCameraByBlockOffset(x,y,c+1), 20);
}

function glideCameraByZoom(z, c=1) {
	if (c >= 5) return;
	camera.zoom += z / 4;
	
	let minZoom = Math.min(
		(window.innerHeight-100) / (map.height * map.scale),
		(window.innerWidth-100) / (map.width * map.scale)
	);
	let maxZoom = 1;
	
	camera.zoom = Math.min(camera.zoom, maxZoom);
	camera.zoom = Math.max(camera.zoom, minZoom);

	setTimeout(()=>glideCameraByZoom(z, c+1), 20);
}

/** @param {KeyboardEvent} e */
function button_keydown(e) {
	
	let key = e.key.toLowerCase();
	
	switch (key) {
		case "n":
			map.reset(map.width, map.height);
			break;
		case "m":
			map.reset(map.width, map.height);
			break;
		case "space":
			map.reset(map.width, map.height);
			break;
	}

}

reset.addEventListener("keydown", button_keydown);
playAgain.addEventListener("keydown", button_keydown);


document.addEventListener("keydown", (e) => {

	camera.inputMethod = "keyboard";

	if (map.isPlaying == false) return;
	if (canvas.matches(":hover") == false) return;
	
	if (e.repeat) return;

	let key = e.key;

	switch (key) {
		case "ArrowLeft":
			key = "a";
			break;
		case "ArrowRight":
			key = "d";
			break;
		case "ArrowUp":
			key = "w";
			break;
		case "ArrowDown":
			key = "s";
			break;
	}

	key = key.toLowerCase();
	
	switch (key) {
		case "a":
			glideCameraByBlockOffset(-1, 0);
			camera.mouse.x = window.innerWidth/2 - map.scale * camera.zoom / 2;
			camera.mouse.y = window.innerHeight/2 - map.scale * camera.zoom / 2;
			break;

		case "d":
			glideCameraByBlockOffset(1, 0);
			camera.mouse.x = window.innerWidth/2 - map.scale * camera.zoom / 2;
			camera.mouse.y = window.innerHeight/2 - map.scale * camera.zoom / 2;
			break;

		case "w":
			glideCameraByBlockOffset(0, -1);
			camera.mouse.x = window.innerWidth/2 - map.scale * camera.zoom / 2;
			camera.mouse.y = window.innerHeight/2 - map.scale * camera.zoom / 2;
			break;

		case "s":
			glideCameraByBlockOffset(0, 1);
			camera.mouse.x = window.innerWidth/2 - map.scale * camera.zoom / 2;
			camera.mouse.y = window.innerHeight/2 - map.scale * camera.zoom / 2;
			break;

		case "n":
			click("reveal");
			break;
		
		case "m":
			click("flag");
			break;

		case "j":
			glideCameraByZoom(-0.25);
			break;
		
		case "k":
			glideCameraByZoom(0.25);
			break;
	
		default:
			break;
	}

});