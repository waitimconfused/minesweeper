var mouse = {
	x: 0,
	y: 0,

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
	mouse.x = (e.clientX - SCREEN.width/2) / viewport.zoom  - viewport.x;
	mouse.y = (e.clientY - SCREEN.height/2) / viewport.zoom - viewport.y;
});

document.addEventListener("pointerdown", (e) => {
	let mouseButtonNames = ["left", "right", "wheel", "back", "forward", "eraser"];

	for (let buttonName of mouseButtonNames) {
		let isPressed = Boolean(e.buttons & (1 << mouseButtonNames.indexOf(buttonName)));
		mouse.buttons[buttonName] = isPressed;
	}
});
document.addEventListener("pointerup", (e) => {

	let mouseButtonNames = ["left", "right", "wheel", "back", "forward", "eraser"];

	for (let buttonName of mouseButtonNames) {
		let isPressed = Boolean(e.buttons & (1 << mouseButtonNames.indexOf(buttonName)));
		mouse.buttons[buttonName] = isPressed;
	}
});

document.addEventListener("contextmenu", (e) => {
	e.preventDefault();
})


document.addEventListener("wheel", scrollEventCallback, {passive:false});
document.addEventListener("keydown", scrollEventCallback);

function scrollEventCallback(e) {
	if (e instanceof WheelEvent) {
		if (e.ctrlKey) {
			e.preventDefault();
			// if (PROJECT.options.canZoom == false) return;

			viewport.zoom -= e.deltaY * viewport.zoom / 200;
		} else {
			e.preventDefault();
			// if (PROJECT.options.canPan == false) return;
			viewport.x += e.deltaX / viewport.zoom;
			viewport.y += e.deltaY / viewport.zoom;
		}
	} else if (e instanceof KeyboardEvent) {
		if (!e.ctrlKey) return;

		let scale = null;

		if (["+", "="].includes(e.key)) scale = 1;
		if (["-", "_"].includes(e.key)) scale = -1;
		if (["0"].includes(e.key)) scale = 0.0;

		if (scale != null) e.preventDefault(); else return;
		if (e.repeat) return;
		// if (PROJECT.options.canZoom == false) return;

		viewport.zoom += scale;
		if (e.key == "0") {
			viewport.zoom = 1;
			// viewport.x = 0;
			// viewport.y = 0;
		}
	} else {
		throw new Error("The function scrollEventCallback requires a parameter of type WheelEvent or KeyboardEvent");
	}

	viewport.zoom = Math.min(viewport.zoom, 1);

	mouse.x = (e.clientX - SCREEN.width/2) / viewport.zoom  - viewport.x;
	mouse.y = (e.clientY - SCREEN.height/2) / viewport.zoom - viewport.y;
}



document.addEventListener("keydown", (e) => {
	if (e.repeat) return;

	mouse.buttons.ctrl = e.ctrlKey;
	mouse.buttons.shift = e.shiftKey;
	mouse.buttons.alt = e.altKey;

});

document.addEventListener("keyup", (e) => {
	if (e.repeat) return;

	mouse.buttons.ctrl = e.ctrlKey;
	mouse.buttons.shift = e.shiftKey;
	mouse.buttons.alt = e.altKey;

});