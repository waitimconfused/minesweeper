import { GameMap } from "./map.js";

type mouseButtons = "left" | "right" | "wheel" | "back" | "forward" | "eraser";

type CameraStorage = {
	enabled: boolean,

	inputMethod: "mouse" | "keyboard",

	x: number,
	y: number,

	zoom: number,
	minZoom: number,
	maxZoom: number

	mouse: { x: number, y: number },

	buttons: { [x in mouseButtons]: boolean } & {
		ctrl: boolean,
		shift: boolean,
		alt: boolean
	},
}

class camera {

	public static enabled: boolean = false;

	public static inputMethod: "mouse" | "keyboard" = "mouse";

	public static x: number = 0;
	public static y: number = 0;

	private static _zoom: number = 1;

	public static mouse = {
		x: 0,
		y: 0,
	};

	public static buttons = {
		left: false,
		right: false,
		wheel: false,
		back: false,
		forward: false,
		eraser: false,
		ctrl: false,
		shift: false,
		alt: false
	};

	private static _target: { position?: { x: number, y: number }, zoom?: number } = {
		position: undefined,
		zoom: undefined
	};

	public static get zoom(): number {
		return this._zoom;
	}

	public static set zoom(value: number) {
		value = Math.min(value, this.maxZoom);
		value = Math.max(value, this.minZoom);
		this._zoom = value;
	}

	public static get minZoom() {
		let minZoom = Math.min(
			(window.innerHeight - 100) / (GameMap.height * GameMap.scale),
			(window.innerWidth - 100) / (GameMap.width * GameMap.scale)
		);
		return minZoom;
	}
	public static get maxZoom() {
		return 1;
	}

	public static glideByOffset(x: number, y: number, step = 0) {
		if (step >= 4) return;

		this.x += x / 4;
		this.y += y / 4;

		setTimeout(() => this.glideByOffset(x, y, step + 1), 20);
	}

	public static glideByBlockOffset(x: number, y: number) {
		this.glideByOffset(-x * GameMap.scale, -y * GameMap.scale);
	}

	public static glideByZoom(zoomOffset: number, step = 0) {
		if (step >= 4) return;

		camera.zoom += zoomOffset / 4;

		camera.zoom = Math.min(camera.zoom, camera.maxZoom);
		camera.zoom = Math.max(camera.zoom, camera.minZoom);

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