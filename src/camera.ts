import * as map from "./map.js";

type mouseButtons = "left" | "right" | "wheel" | "back" | "forward" | "eraser";

var actualZoom = 1;

const camera = {

	enabled: false,

	inputMethod: "mouse" as "mouse" | "keyboard",

	x: 0,
	y: 0,

	mouse: {
		x: 0,
		y: 0,
	},

	buttons: {
		left: false,
		right: false,
		wheel: false,
		back: false,
		forward: false,
		eraser: false,
		ctrl: false,
		shift: false,
		alt: false
	},

	get zoom(): number {
		return actualZoom;
	},

	set zoom(value: number) {
		value = Math.min(value, this.maxZoom);
		value = Math.max(value, this.minZoom);
		actualZoom = value;
	},

	get minZoom(): number {
		let minZoom = Math.min(
			(window.innerHeight - 100) / (map.height * map.option.scale),
			(window.innerWidth - 100) / (map.width * map.option.scale)
		);
		return minZoom;
	},

	get maxZoom(): number {
		return 1;
	},

	glideByOffset(x: number, y: number, step = 0) {
		if (step >= 4) return;

		this.x += x / 4;
		this.y += y / 4;

		setTimeout(() => this.glideByOffset(x, y, step + 1), 20);
	},

	glideByBlockOffset(x: number, y: number) {
		this.glideByOffset(-x * map.option.scale, -y * map.option.scale);
	},

	glideByZoom(zoomOffset: number, step = 0) {
		if (step >= 4) return;

		this.zoom += zoomOffset / 4;

		this.zoom = Math.min(this.zoom, this.maxZoom);
		this.zoom = Math.max(this.zoom, this.minZoom);

		setTimeout(() => this.glideByZoom(zoomOffset, step + 1), 20);

	}
};
export default camera;

document.addEventListener("pointermove", (e) => {
	camera.mouse.x = e.clientX;
	camera.mouse.y = e.clientY;
	camera.inputMethod = "mouse";
});

document.addEventListener("pointerdown", (e) => {
	let mouseButtonNames: mouseButtons[] = ["left", "right", "wheel", "back", "forward", "eraser"];

	for (let buttonName of mouseButtonNames) {
		let isPressed = Boolean(e.buttons & (1 << mouseButtonNames.indexOf(buttonName)));
		camera.buttons[buttonName] = isPressed;
	}

	if (camera.inputMethod != "mouse") return;
	camera.mouse.x = e.clientX;
	camera.mouse.y = e.clientY;
});
document.addEventListener("pointerup", (e) => {

	let mouseButtonNames: mouseButtons[] = ["left", "right", "wheel", "back", "forward", "eraser"];

	for (let buttonName of mouseButtonNames) {
		let isPressed = Boolean(e.buttons & (1 << mouseButtonNames.indexOf(buttonName)));
		camera.buttons[buttonName] = isPressed;
	}

	if (camera.inputMethod != "mouse") return;
	camera.mouse.x = e.clientX;
	camera.mouse.y = e.clientY;
});

document.addEventListener("contextmenu", (e) => {
	e.preventDefault();
});

document.addEventListener("wheel", scrollEventCallback, { passive: false });
document.addEventListener("keydown", scrollEventCallback);

function scrollEventCallback(e: WheelEvent | KeyboardEvent) {

	if (e instanceof WheelEvent && e.ctrlKey) e.preventDefault();

	if (camera.enabled == false) return;

	if (e instanceof WheelEvent && camera.inputMethod == "mouse") {
		e.preventDefault();
		if (e.ctrlKey) {
			camera.zoom -= e.deltaY * camera.zoom / 200;
		} else {
			camera.x += e.deltaX / camera.zoom;
			camera.y += e.deltaY / camera.zoom;
		}
	} else if (e instanceof KeyboardEvent) {
		if (!e.ctrlKey) return;

		let isScaling = false;

		if (e.key == "+" || e.key == "=") {
			isScaling = true;
			camera.glideByZoom(0.25);

		} else if (e.key == "-" || e.key == "_") {
			isScaling = true;
			camera.glideByZoom(-0.25);

		} else if (e.key == "0") {
			isScaling = true;
			let zoomOffset = 1 - camera.zoom;
			camera.glideByZoom(zoomOffset);
		}

		if (isScaling) e.preventDefault(); else return;
		if (e.repeat) return;

	}

	camera.zoom = Math.min(camera.zoom, camera.maxZoom);
	camera.zoom = Math.max(camera.zoom, camera.minZoom);

}



document.addEventListener("keydown", (e) => {
	if (e.repeat) return;
	camera.buttons.ctrl = e.ctrlKey;
	camera.buttons.shift = e.shiftKey;
	camera.buttons.alt = e.altKey;

});

document.addEventListener("keyup", (e) => {
	if (e.repeat) return;

	camera.buttons.ctrl = e.ctrlKey;
	camera.buttons.shift = e.shiftKey;
	camera.buttons.alt = e.altKey;

});