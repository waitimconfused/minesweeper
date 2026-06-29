import { GameMap } from "./map.js";
const html = {
    menu: document.getElementById("options"),
    menuToggle: document.getElementById("options-toggle"),
    sizeInput: document.getElementById("opt-size"),
    newGame: document.getElementById("opt-reset")
};
function toggleMenu() {
    let state = html.menu.hasAttribute("show");
    if (state == false)
        html.menu.setAttribute("show", "");
    else
        html.menu.removeAttribute("show");
}
document.addEventListener("keyup", (e) => {
    if (e.ctrlKey == false)
        return;
    if (e.key != ",")
        return;
    toggleMenu();
});
html.menuToggle.addEventListener("click", toggleMenu);
html.newGame.addEventListener("click", () => {
    let size = html.sizeInput.valueAsNumber || 16;
    size = Math.max(size, 8);
    if (!confirm("Warning: Map sizes greater than 64 are not suggested.")) {
        size = 64;
    }
    localStorage.setItem("minesweeper-size", `${size}x${size}`);
    GameMap.reset(size, size);
    html.menu.removeAttribute("show");
});
//# sourceMappingURL=options.js.map