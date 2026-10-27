import * as map from "./map.js";
var actualZoom = 1;
const camera = {
    enabled: false,
    inputMethod: "mouse",
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
    get zoom() {
        return actualZoom;
    },
    set zoom(value) {
        value = Math.min(value, this.maxZoom);
        value = Math.max(value, this.minZoom);
        actualZoom = value;
    },
    get minZoom() {
        let minZoom = Math.min((window.innerHeight - 100) / (map.height * map.option.scale), (window.innerWidth - 100) / (map.width * map.option.scale));
        return minZoom;
    },
    get maxZoom() {
        return 1;
    },
    async glideByOffset(x, y) {
        for (let i = 0; i < 4; i++) {
            this.x += x / 4;
            this.y += y / 4;
            await timeout(20);
        }
    },
    async glideByBlockOffset(x, y) {
        await this.glideByOffset(-x * map.option.scale, -y * map.option.scale);
    },
    async glideByZoom(zoomOffset, step = 0) {
        for (let i = 0; i < 4; i++) {
            this.zoom += zoomOffset / 4;
            this.zoom = Math.min(this.zoom, this.maxZoom);
            this.zoom = Math.max(this.zoom, this.minZoom);
            await timeout(20);
        }
    }
};
export default camera;
document.addEventListener("keydown", (e) => {
    if (e.repeat)
        return;
    camera.buttons.ctrl = e.ctrlKey;
    camera.buttons.shift = e.shiftKey;
    camera.buttons.alt = e.altKey;
});
document.addEventListener("keyup", (e) => {
    if (e.repeat)
        return;
    camera.buttons.ctrl = e.ctrlKey;
    camera.buttons.shift = e.shiftKey;
    camera.buttons.alt = e.altKey;
});
function timeout(timeout) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
}
//# sourceMappingURL=camera.js.map