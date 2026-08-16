import camera from "./camera.js";
import { canvasTransformations, click } from "./index.js";
import { GameMap } from "./map.js";

const reset: HTMLButtonElement = document.getElementById("reset") as HTMLButtonElement;
const playAgain: HTMLButtonElement = document.getElementById("again") as HTMLButtonElement;

const canvas: HTMLCanvasElement = document.getElementById("screen") as HTMLCanvasElement;

function button_keydown(e: KeyboardEvent) {

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

	if (GameMap.isPlaying == false) return;
	if (canvas.matches(":hover") == false) return;

	camera.inputMethod = "keyboard";
	
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

	let cameraPoint = new DOMPoint(canvas.width/2, canvas.height/2).matrixTransform(canvasTransformations.cameraToWorld);
	let offsetPoint = DOMPoint.fromPoint(cameraPoint);
	
	switch (key) {
		case "a":
			offsetPoint.x += GameMap.scale;
			break;

		case "d":
			offsetPoint.x -= GameMap.scale;
			break;

		case "w":
			offsetPoint.y += GameMap.scale;
			break;

		case "s":
			offsetPoint.y -= GameMap.scale;
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
			camera.glideByZoom(-0.25);
			break;

		case "k":
			camera.glideByZoom(0.25);
			break;

		default:
			break;
	}

	let difference = {
		x: offsetPoint.x - cameraPoint.x,
		y: offsetPoint.y - cameraPoint.y
	}

	camera.mouse.x = canvas.width / 2;
	camera.mouse.y = canvas.height / 2;

	camera.glideByOffset(difference.x, difference.y);

});