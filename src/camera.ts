type mouseButtons = "left" | "right" | "wheel" | "back" | "forward" | "eraser";

type CameraStorage = {
	enabled: boolean,

	inputMethod: "mouse" | "keyboard",

	x: number,
	y: number,
	zoom: number,

	mouse: { x: number, y: number },

	buttons: { [x in mouseButtons]: boolean } & {
		ctrl: boolean,
		shift: boolean,
		alt: boolean
	},
}

const camera:CameraStorage = {
	
	enabled: false,

	/** @type { "mouse" | "keyboard" } */
	inputMethod: "mouse",

	x: 0,
	y: 0,
	zoom: 1,

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
};

document.addEventListener("pointermove", (e) => {
	camera.mouse.x = e.clientX;
	camera.mouse.y = e.clientY;
	camera.inputMethod = "mouse";
});

document.addEventListener("pointerdown", (e) => {
	let mouseButtonNames:mouseButtons[] = ["left", "right", "wheel", "back", "forward", "eraser"];

	for (let buttonName of mouseButtonNames) {
		let isPressed = Boolean(e.buttons & (1 << mouseButtonNames.indexOf(buttonName)));
		camera.buttons[buttonName] = isPressed;
	}

	if (camera.inputMethod != "mouse") return;
	camera.mouse.x = e.clientX;
	camera.mouse.y = e.clientY;
});
document.addEventListener("pointerup", (e) => {

	let mouseButtonNames:mouseButtons[] = ["left", "right", "wheel", "back", "forward", "eraser"];

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

document.addEventListener("wheel", scrollEventCallback, {passive:false});
document.addEventListener("keydown", scrollEventCallback);

function scrollEventCallback(e:WheelEvent|KeyboardEvent) {

	if (e instanceof WheelEvent && e.ctrlKey) e.preventDefault();

	if (camera.enabled == false) return;

	if (e instanceof WheelEvent) {
		e.preventDefault();
		if (e.ctrlKey) {
			camera.zoom -= e.deltaY * camera.zoom / 200;
		} else {
			camera.x += e.deltaX / camera.zoom;
			camera.y += e.deltaY / camera.zoom;
		}
	} else if (e instanceof KeyboardEvent) {
		if (!e.ctrlKey) return;

		let scale = null;

		if (["+", "="].includes(e.key)) scale = 1;
		if (["-", "_"].includes(e.key)) scale = -1;
		if (["0"].includes(e.key)) scale = 0.0;

		if (scale != null) e.preventDefault(); else return;
		if (e.repeat) return;

		camera.zoom += scale;
		if (e.key == "0") camera.zoom = 1;
	} else {
		throw new Error("The function scrollEventCallback requires a parameter of type WheelEvent or KeyboardEvent");
	}

	camera.zoom = Math.min(camera.zoom, 1);

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


export default camera;