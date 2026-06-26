import { GameMap } from "./map.js";
const camera = {
    enabled: false,
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
    glideByBlockOffset(x, y, step = 1) {
        if (step >= 5)
            return;
        camera.x -= x * GameMap.scale / 4;
        camera.y -= y * GameMap.scale / 4;
        setTimeout(() => this.glideByBlockOffset(x, y, step + 1), 20);
    },
    glideByZoom(zoomOffset, step = 1) {
        if (step >= 5)
            return;
        camera.zoom += zoomOffset / 4;
        let minZoom = Math.min((window.innerHeight - 100) / (GameMap.height * GameMap.scale), (window.innerWidth - 100) / (GameMap.width * GameMap.scale));
        let maxZoom = 1;
        camera.zoom = Math.min(camera.zoom, maxZoom);
        camera.zoom = Math.max(camera.zoom, minZoom);
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
    let mouseButtonNames = ["left", "right", "wheel", "back", "forward", "eraser"];
    for (let buttonName of mouseButtonNames) {
        let isPressed = Boolean(e.buttons & (1 << mouseButtonNames.indexOf(buttonName)));
        camera.buttons[buttonName] = isPressed;
    }
    if (camera.inputMethod != "mouse")
        return;
    camera.mouse.x = e.clientX;
    camera.mouse.y = e.clientY;
});
document.addEventListener("pointerup", (e) => {
    let mouseButtonNames = ["left", "right", "wheel", "back", "forward", "eraser"];
    for (let buttonName of mouseButtonNames) {
        let isPressed = Boolean(e.buttons & (1 << mouseButtonNames.indexOf(buttonName)));
        camera.buttons[buttonName] = isPressed;
    }
    if (camera.inputMethod != "mouse")
        return;
    camera.mouse.x = e.clientX;
    camera.mouse.y = e.clientY;
});
document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
});
document.addEventListener("wheel", scrollEventCallback, { passive: false });
document.addEventListener("keydown", scrollEventCallback);
function scrollEventCallback(e) {
    if (e instanceof WheelEvent && e.ctrlKey)
        e.preventDefault();
    if (camera.enabled == false)
        return;
    if (e instanceof WheelEvent) {
        e.preventDefault();
        if (e.ctrlKey) {
            camera.zoom -= e.deltaY * camera.zoom / 200;
        }
        else {
            camera.x += e.deltaX / camera.zoom;
            camera.y += e.deltaY / camera.zoom;
        }
    }
    else if (e instanceof KeyboardEvent) {
        if (!e.ctrlKey)
            return;
        let scale = null;
        if (["+", "="].includes(e.key))
            scale = 1;
        if (["-", "_"].includes(e.key))
            scale = -1;
        if (["0"].includes(e.key))
            scale = 0.0;
        if (scale != null)
            e.preventDefault();
        else
            return;
        if (e.repeat)
            return;
        camera.zoom += scale;
        if (e.key == "0")
            camera.zoom = 1;
    }
    else {
        throw new Error("The function scrollEventCallback requires a parameter of type WheelEvent or KeyboardEvent");
    }
    let minZoom = Math.min((window.innerHeight - 100) / (GameMap.height * GameMap.scale), (window.innerWidth - 100) / (GameMap.width * GameMap.scale));
    let maxZoom = 1;
    camera.zoom = Math.min(camera.zoom, maxZoom);
    camera.zoom = Math.max(camera.zoom, minZoom);
}
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
//# sourceMappingURL=camera.js.map