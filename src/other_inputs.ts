import camera from "./camera.js";
import { click } from "./index.js";
import { GameMap } from "./map.js";

const reset:HTMLButtonElement = document.getElementById("reset") as HTMLButtonElement;
const playAgain:HTMLButtonElement = document.getElementById("again") as HTMLButtonElement;

const canvas:HTMLCanvasElement = document.getElementById("screen") as HTMLCanvasElement;

function glideCameraByBlockOffset(x:number, y:number, c=1) {
	if (c >= 5) return;
	camera.x -= x * GameMap.scale / 4;
	camera.y -= y * GameMap.scale / 4;
	setTimeout(()=>glideCameraByBlockOffset(x,y,c+1), 20);
}

function glideCameraByZoom(desiredZoom:number, step=1) {
	if (step >= 5) return;
	camera.zoom += desiredZoom / 4;

	let minZoom = Math.min(
		(window.innerHeight-100) / (GameMap.height * GameMap.scale),
		(window.innerWidth-100) / (GameMap.width * GameMap.scale)
	);
	let maxZoom = 1;

	camera.zoom = Math.min(camera.zoom, maxZoom);
	camera.zoom = Math.max(camera.zoom, minZoom);

	setTimeout(()=>glideCameraByZoom(desiredZoom, step+1), 20);
}

function button_keydown(e:KeyboardEvent) {

	let key = e.key.toLowerCase();

	switch (key) {
		case "n":
			GameMap.reset(GameMap.width, GameMap.height);
			break;
		case "m":
			GameMap.reset(GameMap.width, GameMap.height);
			break;
		case "space":
			GameMap.reset(GameMap.width, GameMap.height);
			break;
	}

}

reset.addEventListener("keydown", button_keydown);
playAgain.addEventListener("keydown", button_keydown);


document.addEventListener("keydown", (e) => {

	if (e.target != document.body) return;

	camera.inputMethod = "keyboard";

	if (GameMap.isPlaying == false) return;
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
			camera.mouse.x = window.innerWidth/2 - GameMap.scale * camera.zoom / 2;
			camera.mouse.y = window.innerHeight/2 - GameMap.scale * camera.zoom / 2;
			break;

		case "d":
			glideCameraByBlockOffset(1, 0);
			camera.mouse.x = window.innerWidth/2 - GameMap.scale * camera.zoom / 2;
			camera.mouse.y = window.innerHeight/2 - GameMap.scale * camera.zoom / 2;
			break;

		case "w":
			glideCameraByBlockOffset(0, -1);
			camera.mouse.x = window.innerWidth/2 - GameMap.scale * camera.zoom / 2;
			camera.mouse.y = window.innerHeight/2 - GameMap.scale * camera.zoom / 2;
			break;

		case "s":
			glideCameraByBlockOffset(0, 1);
			camera.mouse.x = window.innerWidth/2 - GameMap.scale * camera.zoom / 2;
			camera.mouse.y = window.innerHeight/2 - GameMap.scale * camera.zoom / 2;
			break;

		case "n":
			click("reveal");
			break;

		case "m":
			click("flag");
			break;

		case "b":
			click("maybe");
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