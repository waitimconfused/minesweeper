import camera from "../camera.js";
import * as cursor from "../cursor.js";
import { html } from "../index.js";
import * as map from "../map.js";
const REVEAL_DURATION = 300;
const FLAG_DURATION = 400;
const MAYBE_DURATION = 800;
var fingers = [];
var fingerHoldStart = null;
var fingerDragDistance = null;
document.addEventListener("touchstart", (e) => {
    if (e.target != html.canvas)
        return;
    reloadFingers(e);
    if (fingers.length == 1)
        fingerHoldStart = performance.now();
    else
        return;
    camera.inputMethod = "touch";
    if (fingers[0]) {
        camera.mouse.x = fingers[0].x;
        camera.mouse.y = fingers[0].y;
    }
});
document.addEventListener("touchmove", (e) => {
    if (e.target != html.canvas)
        return;
    if (camera.inputMethod != "touch")
        return;
    e.preventDefault();
    if (e.touches.length == 1) {
        let finger = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
        let delta = {
            x: fingers[0].x - finger.x,
            y: fingers[0].y - finger.y
        };
        if (Math.hypot(delta.x, delta.y) > 10) {
            fingerHoldStart = null;
        }
        if (fingerHoldStart == null) {
            camera.x -= delta.x / camera.zoom;
            camera.y -= delta.y / camera.zoom;
            camera.mouse.x = finger.x;
            camera.mouse.y = finger.y;
        }
    }
    else if (e.touches.length == 2) {
        let finger1 = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
        let finger2 = {
            x: e.touches[1].clientX,
            y: e.touches[1].clientY
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
    if (e.target != html.canvas)
        return;
    if (camera.inputMethod != "touch")
        return;
    if (map.option.is_playing)
        e.preventDefault();
    else
        return;
    if (e.touches.length < 2) {
        if (fingerHoldStart == null)
            return;
        let fingerHoldDuration = performance.now() - fingerHoldStart;
        fingerHoldStart = null;
        camera.mouse.x = fingers[0].x;
        camera.mouse.y = fingers[0].y;
        if (fingerHoldDuration < REVEAL_DURATION) {
            cursor.click("reveal");
        }
    }
    reloadFingers(e);
});
function reloadFingers(e) {
    fingers = [];
    for (let i = 0; i < e.touches.length; i++) {
        let touch = e.touches[i];
        fingers.push({
            x: touch.clientX,
            y: touch.clientY
        });
    }
}
function holdFingers() {
    if (fingerHoldStart != null) {
        let fingerHoldDuration = performance.now() - fingerHoldStart;
        if (fingerHoldDuration < REVEAL_DURATION) {
            window.requestAnimationFrame(holdFingers);
            return;
        }
        if (fingerHoldDuration < REVEAL_DURATION + FLAG_DURATION) {
            cursor.click("flag");
            fingerHoldStart = null;
        }
    }
    window.requestAnimationFrame(holdFingers);
}
holdFingers();
//# sourceMappingURL=touchscreen.js.map