import * as map from "./map.js";

export type MouseButtons = "left" | "right" | "wheel" | "back" | "forward" | "eraser";

var actualZoom = 1;

const camera = {

	enabled: false,

	inputMethod: "mouse" as "mouse" | "keyboard" | "touch",

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

	async glideByOffset(x: number, y: number) {

		for (let i = 0; i < 4; i ++) {
			this.x += x / 4;
			this.y += y / 4;
			await timeout(20);
		}
	},

	async glideByBlockOffset(x: number, y: number) {
		await this.glideByOffset(-x * map.option.scale, -y * map.option.scale);
	},

	async glideByZoom(zoomOffset: number, step = 0) {

		for (let i = 0; i < 4; i ++) {
			this.zoom += zoomOffset / 4;
	
			this.zoom = Math.min(this.zoom, this.maxZoom);
			this.zoom = Math.max(this.zoom, this.minZoom);

			await timeout(20);
		}

	}
};
export default camera;

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

/**
 * Wraps `setTimeout(handler, timeout)` to be a `Promise`
 * 
 * @param timeout	Duration in *milliseconds*
 */
function timeout(timeout: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, timeout);
	})
}