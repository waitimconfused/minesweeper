import camera from "../camera.js";
import * as cursor from "../cursor.js";
import { html } from "../index.js";
import * as map from "../map.js";

type Finger = { x: number, y: number };

const REVEAL_DURATION = 100
const FLAG_DURATION = 500;

var fingers: Finger[] = [];
var fingerHoldStart: number | null = null;
var fingerDragDistance: number | null = null;

document.addEventListener("touchstart", (e) => {

	if (e.target != document.body) return;

	reloadFingers(e);

	if (fingers.length == 1) fingerHoldStart = performance.now();
	else return;

	camera.inputMethod = "touch";
	
	if (fingers[0]) {
		camera.mouse.x = fingers[0].x;
		camera.mouse.y = fingers[0].y;
	}

})

document.addEventListener("touchmove", (e) => {

	if (e.target != document.body) return;
	if (camera.inputMethod != "touch") return;

	e.preventDefault();

	if (e.touches.length == 1) {

		let finger: Finger = {
			x: e.touches[0]!.clientX,
			y: e.touches[0]!.clientY
		}

		let delta: Finger = {
			x: fingers[0]!.x - finger.x,
			y: fingers[0]!.y - finger.y
		};

		if (Math.hypot(delta.x, delta.y) > 10) {
			fingerHoldStart = null;
		}

		
		camera.x -= delta.x;
		camera.y -= delta.y;

		camera.mouse.x = finger.x;
		camera.mouse.y = finger.y;
	}

	else if (e.touches.length == 2) {

		let finger1: Finger = {
			x: e.touches[0]!.clientX,
			y: e.touches[0]!.clientY
		};

		let finger2: Finger = {
			x: e.touches[1]!.clientX,
			y: e.touches[1]!.clientY
		};

		let distance = Math.hypot(finger2.x - finger1.x, finger2.y - finger1.y);

		
		if (fingerDragDistance) {
			let delta = fingerDragDistance - distance;
			camera.zoom -= delta / 100;
		}

		fingerDragDistance = distance;

		fingerHoldStart = null;

	}

	reloadFingers(e);

}, { passive: false });

document.addEventListener("touchend", (e) => {

	if (e.target != document.body) return;
	if (camera.inputMethod != "touch") return;

	if ( map.option.is_playing ) e.preventDefault();
	else return;
	
	if (e.touches.length < 2) {
		if (fingerHoldStart == null) return;
		
		let fingerHoldDuration = performance.now() - fingerHoldStart;
		fingerHoldStart = null;
		
		camera.mouse.x = fingers[0]!.x;
		camera.mouse.y = fingers[0]!.y;
		
		if (fingerHoldDuration < REVEAL_DURATION) {
			cursor.click("reveal");
		}
	}
	
	reloadFingers(e);
});

function reloadFingers(e: TouchEvent) {

	fingers = [];

	for (let i = 0; i < e.touches.length; i ++) {
		let touch = e.touches[i]!;
		fingers.push({
			x: touch.clientX,
			y: touch.clientY
		})
	}

}

function holdFingers() {

	if (fingerHoldStart != null) {

		let fingerHoldDuration = performance.now() - fingerHoldStart;
		
		if (fingerHoldDuration < REVEAL_DURATION) {
			window.requestAnimationFrame(holdFingers);
			return;
		}

		if (fingerHoldDuration < FLAG_DURATION){
			cursor.click("flag");
			fingerHoldStart = null;
		}
	}

	window.requestAnimationFrame(holdFingers);
}

holdFingers();