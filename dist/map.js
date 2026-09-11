import camera from "./camera.js";
import { html, loadImage } from "./index.js";
const TILE = {
    UNSET: Symbol("tile.unset"),
    FLAG: Symbol("tile.flag"),
    SAFE: Symbol("tile.safe"),
    MAYBE: Symbol("tile.maybe"),
    BOMB: Symbol("tile.bomb")
};
export var tiles = [];
export var tilesDiscovered = 0;
export var flagsUsed = 0;
export var width = 0;
export var height = 0;
export var targetBombCount = 0;
export var bombTileIndexes = [];
export const option = {
    is_playing: false,
    autoclear: false,
    scale: 100,
    safeZone: { width: 3, height: 3 }
};
export const styles = {
    colour: {
        unchecked: ["#A2D149", "#AAD751"],
        safe: ["#D7B899", "#E5C29F"],
        bomb: ["#DB3236", "#F4840D", "#F4C20D", "#48E6F1", "#B648F2", "#ED44B5"]
    },
    image: {
        bomb: await loadImage("./assets/bomb.svg"),
        flag: await loadImage("./assets/flag.svg"),
        maybe: await loadImage("./assets/maybe.svg")
    }
};
export function reset(count_x, count_y) {
    width = count_x;
    height = count_y;
    let isGliding = true;
    if (tiles.length == 0)
        isGliding = false;
    tiles = new Array(count_x * count_y);
    for (let i = 0; i < tiles.length; i++) {
        tiles[i] = TILE.UNSET;
    }
    tilesDiscovered = 0;
    flagsUsed = 0;
    bombTileIndexes = [];
    html.gameoverScreen.removeAttribute("show");
    html.winScreen.removeAttribute("show");
    targetBombCount = Math.floor(width * height / 4);
    for (let i = 0; i < targetBombCount; i++) {
        let randomIndex = Math.floor(Math.random() * tiles.length);
        while (bombTileIndexes.includes(randomIndex)) {
            randomIndex = Math.floor(Math.random() * tiles.length);
        }
        bombTileIndexes[i] = randomIndex;
    }
    html.tile_count.innerText = "?";
    html.tiles_shown.innerText = "0";
    html.flag_count.innerText = "?";
    html.flags_used.innerText = "0";
    let zoom = 1;
    let x = (width * option.scale) / -2;
    let y = (height * option.scale) / -2;
    if (isGliding) {
        let zoomOffset = zoom - camera.zoom;
        camera.glideByZoom(zoomOffset);
        camera.glideByOffset(x - camera.x, y - camera.y);
    }
    else {
        camera.zoom = zoom;
        camera.x = x;
        camera.y = y;
    }
    option.is_playing = true;
    camera.enabled = true;
}
export function drawMap(context) {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            drawTile(x, y, context);
        }
    }
}
export function drawTile(x, y, context) {
    if (!context)
        return;
    if (x < 0)
        return;
    if (y < 0)
        return;
    if (x > width - 1)
        return;
    if (y > height - 1)
        return;
    let tile = tiles[y * width + x];
    let colourIndex = (x + y % 2) % 2;
    if (tile == TILE.UNSET || tile == TILE.FLAG || tile == TILE.MAYBE) {
        context.fillStyle = styles.colour.unchecked[colourIndex];
    }
    else {
        context.fillStyle = styles.colour.safe[colourIndex];
    }
    context.save();
    context.scale(option.scale, option.scale);
    context.translate(x, y);
    context.beginPath();
    context.rect(0, 0, 1, 1);
    context.closePath();
    context.fill();
    if (tile == TILE.BOMB) {
        let index = (x * y) % styles.colour.bomb.length;
        context.fillStyle = styles.colour.bomb[index];
        context.beginPath();
        let padding = 1 / 10;
        let radius = 1 / 10;
        context.roundRect(padding / 2, padding / 2, 1 - padding, 1 - padding, radius);
        context.closePath();
        context.fill();
    }
    let offset = 1 / 2;
    context.translate(offset, offset);
    if (tile == TILE.FLAG) {
        let size = 3 / 4;
        context.drawImage(styles.image.flag, -size / 2, -size / 2, size, size);
    }
    else if (tile == TILE.MAYBE) {
        let size = 1 / 2;
        context.drawImage(styles.image.maybe, -size / 2, -size / 2, size, size);
    }
    else if (tile == TILE.BOMB) {
        let size = 3 / 4;
        context.drawImage(styles.image.bomb, -size / 2, -size / 2, size, size);
    }
    else if (typeof tile == "number" && tile != 0) {
        context.scale(1 / option.scale, 1 / option.scale);
        context.fillStyle = "black";
        context.lineWidth = 1;
        context.font = "600 24px poppins";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(tile.toString(), offset, offset);
    }
    context.restore();
}
export function exploreTile(x, y, context, forceUpdate = false) {
    if (option.is_playing == false && forceUpdate == false)
        return;
    if (y < 0)
        return;
    if (x < 0)
        return;
    if (y >= height)
        return;
    if (x >= width)
        return;
    let index = y * width + x;
    if (tiles[index] == TILE.UNSET || tiles[index] == TILE.MAYBE)
        tilesDiscovered += 1;
    checkForWin();
    if (tiles[index] == TILE.FLAG)
        return;
    if (bombTileIndexes.includes(index)) {
        tiles[index] = TILE.BOMB;
        if (context)
            drawTile(x, y, context);
        let tileCount = tiles.length - bombTileIndexes.length;
        html.gameoverScreen_score.innerText = "~" + (tilesDiscovered / tileCount * 100).toFixed(3).replace(/\.?0+$/, "") + "%";
        html.gameoverScreen.setAttribute("show", "true");
        html.reset.focus();
        option.is_playing = false;
        camera.enabled = false;
        camera.glideByZoom(-0.5);
        return;
    }
    if (context)
        drawTile(x, y, context);
    let getIndex = (x, y) => {
        if (x < 0 || x >= width)
            return -1;
        if (y < 0 || y >= height)
            return -1;
        return y * width + x;
    };
    let neighbourIndexes = [
        getIndex(x, y - 1),
        getIndex(x + 1, y - 1),
        getIndex(x + 1, y),
        getIndex(x + 1, y + 1),
        getIndex(x, y + 1),
        getIndex(x - 1, y + 1),
        getIndex(x - 1, y),
        getIndex(x - 1, y - 1)
    ];
    let sumOfBombs = 0;
    let sumOfFlags = 0;
    for (let i = 0; i < neighbourIndexes.length; i++) {
        let neighbourIndex = neighbourIndexes[i];
        if (bombTileIndexes.includes(neighbourIndex))
            sumOfBombs += 1;
        let tile = tiles[neighbourIndex];
        if (tile == TILE.FLAG)
            sumOfFlags += 1;
    }
    tiles[index] = sumOfBombs;
    html.tiles_shown.innerText = tilesDiscovered.toString();
    if (option.autoclear == false)
        return;
    if (sumOfBombs == 0) {
        for (let i = 0; i < neighbourIndexes.length; i++) {
            let index = neighbourIndexes[i];
            let tile = tiles[index];
            if (tile != TILE.UNSET && tile != TILE.MAYBE)
                continue;
            let y = Math.floor(index / width);
            let x = index % width;
            exploreTile(x, y, context, true);
        }
    }
    else if (sumOfBombs == sumOfFlags) {
        for (let i = 0; i < neighbourIndexes.length; i++) {
            let index = neighbourIndexes[i];
            let tile = tiles[index];
            if (tile != TILE.UNSET && tile != TILE.MAYBE)
                continue;
            let y = Math.floor(index / width);
            let x = index % width;
            exploreTile(x, y, context, true);
        }
    }
}
export function toggleFlag(x, y, context) {
    if (y < 0)
        return;
    if (x < 0)
        return;
    if (y > height)
        return;
    if (x > width)
        return;
    let index = y * width + x;
    if (tiles[index] == TILE.UNSET || tiles[index] == TILE.MAYBE) {
        tiles[index] = TILE.FLAG;
        flagsUsed += 1;
    }
    else if (tiles[index] == TILE.FLAG) {
        tiles[index] = TILE.UNSET;
        flagsUsed -= 1;
    }
    html.flags_used.innerText = flagsUsed.toString();
    checkForWin();
    if (context)
        drawTile(x, y, context);
}
export function toggleMaybe(x, y, context) {
    if (y < 0)
        return;
    if (x < 0)
        return;
    if (y > height)
        return;
    if (x > width)
        return;
    let index = y * width + x;
    if (tiles[index] == TILE.UNSET) {
        tiles[index] = TILE.MAYBE;
    }
    else if (tiles[index] == TILE.MAYBE) {
        tiles[index] = TILE.UNSET;
    }
    if (context)
        drawTile(x, y, context);
}
export function getTileFromPos(x, y) {
    if (y < 0)
        return TILE.UNSET;
    if (x < 0)
        return TILE.UNSET;
    if (y > height)
        return TILE.UNSET;
    if (x > width - 1)
        return TILE.UNSET;
    let index = y * width + x;
    if (bombTileIndexes.includes(index) && !tiles[index]) {
        return TILE.BOMB;
    }
    return tiles[index] || TILE.UNSET;
}
export function checkForWin() {
    if (option.is_playing == false)
        return false;
    if (tilesDiscovered != tiles.length - bombTileIndexes.length)
        return false;
    html.winScreen.setAttribute("show", "true");
    html.playAgain.focus();
    option.is_playing = false;
    camera.enabled = false;
    camera.glideByZoom(-0.5);
    return true;
}
//# sourceMappingURL=map.js.map