import * as map from "./map.js";
const inputs = {
    menu: document.getElementById("options"),
    menuToggle: document.getElementById("options-toggle"),
    newGame: document.getElementById("opt-reset"),
    sizeInput: document.getElementById("opt-size"),
    autoclear: document.getElementById("opt-autoclear")
};
function toggleMenu() {
    let state = inputs.menu.hasAttribute("show");
    if (state == false) {
        inputs.menu.setAttribute("show", "");
        map.option.is_playing = false;
    }
    else {
        inputs.menu.removeAttribute("show");
        map.option.is_playing = true;
    }
}
document.addEventListener("keyup", (e) => {
    if (e.ctrlKey == false)
        return;
    if (e.key != ",")
        return;
    toggleMenu();
});
inputs.menuToggle.addEventListener("click", toggleMenu);
inputs.newGame.addEventListener("click", () => {
    let size = inputs.sizeInput.valueAsNumber || 16;
    size = Math.max(size, 8);
    localStorage.setItem("option-map-size", `${size}x${size}`);
    map.reset(size, size);
    inputs.menu.removeAttribute("show");
});
inputs.autoclear.addEventListener("change", () => {
    let state = inputs.autoclear.checked;
    map.option.autoclear = state;
    localStorage.setItem("option-autoclear", String(state));
});
inputs.autoclear.checked = Boolean(localStorage.getItem("option-autoclear"));
map.option.autoclear = inputs.autoclear.checked;
//# sourceMappingURL=options.js.map