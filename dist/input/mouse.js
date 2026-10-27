import camera from "../camera.js";
import * as cursor from "../cursor.js";
document.addEventListener("pointermove", (e) => {
    if (e.pointerType == "touch")
        return;
    camera.inputMethod = "mouse";
    camera.mouse.x = e.clientX;
    camera.mouse.y = e.clientY;
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
    if (e instanceof WheelEvent && camera.inputMethod == "mouse") {
        e.preventDefault();
        if (e.ctrlKey) {
            camera.zoom -= e.deltaY * camera.zoom / 200;
        }
        else {
            camera.x += (e.shiftKey == false ? e.deltaX : e.deltaY) / camera.zoom;
            camera.y += (e.shiftKey == false ? e.deltaY : e.deltaX) / camera.zoom;
        }
    }
    else if (e instanceof KeyboardEvent) {
        if (!e.ctrlKey)
            return;
        let isScaling = false;
        if (e.key == "+" || e.key == "=") {
            isScaling = true;
            camera.glideByZoom(0.25);
        }
        else if (e.key == "-" || e.key == "_") {
            isScaling = true;
            camera.glideByZoom(-0.25);
        }
        else if (e.key == "0") {
            isScaling = true;
            let zoomOffset = 1 - camera.zoom;
            camera.glideByZoom(zoomOffset);
        }
        if (isScaling)
            e.preventDefault();
        else
            return;
        if (e.repeat)
            return;
    }
    camera.zoom = Math.min(camera.zoom, camera.maxZoom);
    camera.zoom = Math.max(camera.zoom, camera.minZoom);
}
document.addEventListener("click", (e) => {
    if (camera.inputMethod != "mouse")
        return;
    if (!e.shiftKey)
        cursor.click("reveal");
    else
        cursor.click("maybe");
});
document.addEventListener("contextmenu", (e) => {
    if (camera.inputMethod != "mouse")
        return;
    if (!e.shiftKey)
        cursor.click("flag");
    else
        cursor.click("maybe");
});
//# sourceMappingURL=mouse.js.map