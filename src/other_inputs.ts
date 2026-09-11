import camera from "./camera.js";
import { canvasTransformations } from "./index.js";
import * as map from "./map.js";
import * as cursor from "./cursor.js";

const reset: HTMLButtonElement = document.getElementById("reset") as HTMLButtonElement;
const playAgain: HTMLButtonElement = document.getElementById("again") as HTMLButtonElement;

const canvas: HTMLCanvasElement = document.getElementById("screen") as HTMLCanvasElement;

function button_keydown(e: KeyboardEvent) {

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

	if (e.target != document.body) return;

	if (map.option.is_playing == false) return;
	if (canvas.matches(":hover") == false) return;

	camera.inputMethod = "keyboard";

	let key = e.key;

	switch (key) {
		case "a":
			key = "ArrowLeft";
			break;
		case "d":
			key = "ArrowRight";
			break;
		case "w":
			key = "ArrowUp";
			break;
		case "s":
			key = "ArrowDown";
			break;
	}

	if (
		key == "ArrowUp" ||
		key == "ArrowDown" ||
		key == "ArrowLeft" ||
		key == "ArrowRight"
	) {
		let cameraPoint = new DOMPoint(canvas.width/2, canvas.height/2).matrixTransform(canvasTransformations.cameraToWorld);
		let offsetPoint = DOMPoint.fromPoint(cameraPoint);
		
		offsetPoint.y += map.option.scale * Number(key == "ArrowUp");
		offsetPoint.y -= map.option.scale * Number(key == "ArrowDown");
		offsetPoint.x += map.option.scale * Number(key == "ArrowLeft");
		offsetPoint.x -= map.option.scale * Number(key == "ArrowRight");
		
		let difference = {
			x: offsetPoint.x - cameraPoint.x,
			y: offsetPoint.y - cameraPoint.y
		};
		
		camera.mouse.x = canvas.width / 2;
		camera.mouse.y = canvas.height / 2;
		
		camera.glideByOffset(difference.x, difference.y);
		return;
		
	}
	
	if (e.repeat) return;
	key = key.toLowerCase();
	
	switch (key) {

		case "n":
			cursor.click("reveal");
			break;

		case "m":
			cursor.click("flag");
			break;

		case "b":
			cursor.click("maybe");
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

});