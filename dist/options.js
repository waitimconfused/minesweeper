import * as map from "./map.js";
const inputs = {
    menu: document.getElementById("options"),
    newGame: document.getElementById("opt-reset"),
    sizeX: document.getElementById("opt-size-x"),
    sizeY: document.getElementById("opt-size-y"),
    autoclear: document.getElementById("opt-autoclear")
};
function toggleMenu() {
    let state = inputs.menu.hasAttribute("open");
    if (state == false)
        inputs.menu.showModal();
    else
        inputs.menu.close();
}
inputs.menu.addEventListener("toggle", () => {
    map.option.is_playing = !inputs.menu.hasAttribute("open");
    console.log(map.option.is_playing);
});
document.addEventListener("keyup", (e) => {
    if (e.ctrlKey == false)
        return;
    if (e.key != ",")
        return;
    toggleMenu();
});
inputs.sizeX.addEventListener("input", () => {
    if (inputs.sizeY.value != "")
        return;
    inputs.sizeY.setAttribute("placeholder", inputs.sizeX.value || inputs.sizeX.placeholder);
});
inputs.newGame.addEventListener("click", () => {
    let sizeX = inputs.sizeX.valueAsNumber || 16;
    let sizeY = inputs.sizeY.valueAsNumber || sizeX;
    sizeX = Math.max(sizeX, 8);
    sizeY = Math.max(sizeY, 8);
    localStorage.setItem("option-map-size", `${sizeX}x${sizeY}`);
    map.reset(sizeX, sizeY);
    inputs.menu.close();
});
inputs.autoclear.addEventListener("change", () => {
    let state = inputs.autoclear.checked;
    map.option.autoclear = state;
    localStorage.setItem("option-autoclear", String(state));
});
inputs.autoclear.checked = localStorage.getItem("option-autoclear") == "true";
map.option.autoclear = inputs.autoclear.checked;
//# sourceMappingURL=options.js.map