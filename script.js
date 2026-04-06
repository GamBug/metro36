const CELL_SIZE = 40;

const TRACK_TYPES = [
    { type: 'empty', html: '' },
    { type: 'horiz', html: '<use href="#track-horiz" />' },
    { type: 'vert', html: '<use href="#track-horiz" transform="rotate(90 20 20)" />' },
    { type: 'curve-tr', html: '<use href="#track-curve" />' },
    { type: 'curve-br', html: '<use href="#track-curve" transform="rotate(90 20 20)" />' },
    { type: 'curve-bl', html: '<use href="#track-curve" transform="rotate(180 20 20)" />' },
    { type: 'curve-tl', html: '<use href="#track-curve" transform="rotate(270 20 20)" />' },
    { type: 'diag-tl-br', html: '<use href="#track-diag" />' },
    { type: 'diag-tr-bl', html: '<use href="#track-diag" transform="rotate(90 20 20)" />' },
    { type: 'straight-diag-dr', html: '<use href="#track-turn-dr" />' },
    { type: 'straight-diag-dl', html: '<use href="#track-turn-dr" transform="rotate(90 20 20)" />' },
    { type: 'straight-diag-ul', html: '<use href="#track-turn-dr" transform="rotate(180 20 20)" />' },
    { type: 'straight-diag-ur', html: '<use href="#track-turn-dr" transform="rotate(270 20 20)" />' },
    { type: 'straight-diag-ur-alt', html: '<use href="#track-turn-ur" />' },
    { type: 'straight-diag-dr-alt', html: '<use href="#track-turn-ur" transform="rotate(90 20 20)" />' },
    { type: 'straight-diag-dl-alt', html: '<use href="#track-turn-ur" transform="rotate(180 20 20)" />' },
    { type: 'straight-diag-ul-alt', html: '<use href="#track-turn-ur" transform="rotate(270 20 20)" />' },
    { type: 'fill-tl', html: '<use href="#corner-fill" />' },
    { type: 'fill-tr', html: '<use href="#corner-fill" transform="rotate(90 20 20)" />' },
    { type: 'fill-br', html: '<use href="#corner-fill" transform="rotate(180 20 20)" />' },
    { type: 'fill-bl', html: '<use href="#corner-fill" transform="rotate(270 20 20)" />' },
    { type: 'cross', html: '<use href="#track-horiz" /><use href="#track-horiz" transform="rotate(90 20 20)" />' },
    { type: 'cross-diag', html: '<use href="#track-diag" /><use href="#track-diag" transform="rotate(90 20 20)" />' },
    { type: 't-top', html: '<use href="#track-t-bot" transform="rotate(180 20 20)" />' },
    { type: 't-right', html: '<use href="#track-t-bot" transform="rotate(270 20 20)" />' },
    { type: 't-bot', html: '<use href="#track-t-bot" />' },
    { type: 't-left', html: '<use href="#track-t-bot" transform="rotate(90 20 20)" />' },
    { type: 'auto', html: '' },
    { type: 'station', html: '' },
    { type: 'transfer', html: '' }
];

const AUTO_MAP = {
    "0,2": 3, "2,0": 3, "2,4": 4, "4,2": 4, "4,6": 5, "6,4": 5, "6,0": 6, "0,6": 6,
    "2,6": 1, "6,2": 1, "0,4": 2, "4,0": 2, "3,7": 7, "7,3": 7, "1,5": 8, "5,1": 8,
    "6,3": 9, "3,6": 9, "0,5": 10, "5,0": 10, "2,7": 11, "7,2": 11, "4,1": 12, "1,4": 12,
    "6,1": 13, "1,6": 13, "0,3": 14, "3,0": 14, "2,5": 15, "5,2": 15, "4,7": 16, "7,4": 16
};

const METRO_COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#0ea5e9', '#6366f1', '#ec4899', '#94a3b8'
];

const TRACK_EXITS = {
    1: [2, 6], 2: [0, 4], 3: [0, 2], 4: [2, 4], 5: [4, 6], 6: [6, 0],
    7: [3, 7], 8: [1, 5], 9: [3, 6], 10: [0, 5], 11: [2, 7], 12: [1, 4],
    13: [1, 6], 14: [0, 3], 15: [2, 5], 16: [4, 7],
    21: [0, 2, 4, 6], 22: [1, 3, 5, 7], 23: [0, 2, 6], 24: [0, 2, 4], 25: [2, 4, 6], 26: [0, 4, 6]
};

const dirOffsets = [
    {x: 0, y: -1}, {x: 1, y: -1}, {x: 1, y: 0}, {x: 1, y: 1},
    {x: 0, y: 1}, {x: -1, y: 1}, {x: -1, y: 0}, {x: -1, y: -1}
];

const colorNames = {
    '#ef4444': 'Red', '#f97316': 'Orange', '#eab308': 'Yellow', '#22c55e': 'Green',
    '#0ea5e9': 'Blue', '#6366f1': 'Indigo', '#ec4899': 'Pink', '#94a3b8': 'Silver'
};

// Core Application State
let selectedColor = METRO_COLORS[0];
let selectedTrackType = 1;

// gridData: key="x,y", value={ layers:{color:{type,isAuto}}, hasStation, stationName, domNode }
const gridData = new Map();
let connections = [];
let transferStartKey = null;

// History
const undoStack = [];
const redoStack = [];
const MAX_HISTORY = 100;

function snapshotCell(val) {
    const layers = {};
    for (const c in val.layers) layers[c] = { type: val.layers[c].type, isAuto: val.layers[c].isAuto };
    return { layers, hasStation: val.hasStation, stationName: val.stationName };
}

function saveState() {
    const snapshot = new Map();
    gridData.forEach((val, key) => snapshot.set(key, snapshotCell(val)));
    undoStack.push({ grid: snapshot, conns: JSON.parse(JSON.stringify(connections)) });
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack.length = 0;
}

function undo() {
    if (undoStack.length === 0) return;
    const cur = new Map();
    gridData.forEach((val, key) => cur.set(key, snapshotCell(val)));
    redoStack.push({ grid: cur, conns: JSON.parse(JSON.stringify(connections)) });
    restoreState(undoStack.pop());
}

function redo() {
    if (redoStack.length === 0) return;
    const cur = new Map();
    gridData.forEach((val, key) => cur.set(key, snapshotCell(val)));
    undoStack.push({ grid: cur, conns: JSON.parse(JSON.stringify(connections)) });
    restoreState(redoStack.pop());
}

function restoreState(stateObj) {
    const snapshot = stateObj.grid || stateObj;
    connections = stateObj.conns ? JSON.parse(JSON.stringify(stateObj.conns)) : [];
    if (transferStartKey && gridData.has(transferStartKey)) {
        gridData.get(transferStartKey).domNode.classList.remove('station-selected');
    }
    transferStartKey = null;
    gridData.forEach(cell => cell.domNode.remove());
    gridData.clear();
    snapshot.forEach((val, key) => {
        const [gx, gy] = key.split(',').map(Number);
        const domNode = createCellDOM(gx, gy, val.layers, val.hasStation, val.stationName);
        canvas.appendChild(domNode);
        gridData.set(key, { layers: val.layers, hasStation: val.hasStation, stationName: val.stationName, domNode });
    });
    renderConnections();
    if (typeof updateTrackTable === 'function') updateTrackTable();
}

// Viewport
const viewport = document.getElementById('grid-viewport');
const canvas = document.getElementById('grid-canvas');
let cameraX = 0, cameraY = 0, cameraZoom = 1;
let isDrawing = false, isPanning = false;
let startGX = 0, startGY = 0, currentGX = 0, currentGY = 0;
let lastMouseX = 0, lastMouseY = 0;
let refImgX = 0, refImgY = 0, refImgScale = 1, refImgOpacity = 0.5, isMoveRefMode = false;

const previewCanvas = document.getElementById('grid-preview');
const refImage = document.getElementById('ref-image');
const gridCursorHighlight = document.getElementById('grid-cursor-highlight');

function initApp() {
    initToolbar();
    initViewport();
    const rect = viewport.getBoundingClientRect();
    cameraX = rect.width / 2;
    cameraY = rect.height / 2;
    updateTransform();
}

function initToolbar() {
    const colorPalette = document.getElementById('colorPalette');
    METRO_COLORS.forEach(color => {
        const btn = document.createElement('div');
        btn.className = `color-btn ${color === selectedColor ? 'active' : ''}`;
        btn.style.backgroundColor = color;
        btn.style.boxShadow = color === selectedColor ? `0 0 15px ${color}A0` : '';
        btn.addEventListener('click', () => {
            selectedColor = color;
            document.querySelectorAll('.color-btn').forEach(b => { b.classList.remove('active'); b.style.boxShadow = ''; });
            btn.classList.add('active');
            btn.style.boxShadow = `0 0 15px ${color}A0`;
        });
        colorPalette.appendChild(btn);
    });

    const trackPalette = document.getElementById('trackPalette');
    TRACK_TYPES.forEach((track, index) => {
        const btn = document.createElement('div');
        btn.className = `track-btn ${index === selectedTrackType ? 'active' : ''}`;
        btn.title = track.type;
        if (track.type === 'empty') {
            btn.classList.add('eraser-btn');
            btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20H7L3 16C2.5 15.5 2.5 14.5 3 14L13 4C13.5 3.5 14.5 3.5 15 4L20 9C20.5 9.5 20.5 10.5 20 11L11 20"/><line x1="16" y1="15" x2="21" y2="20"/></svg> Eraser`;
        } else if (track.type === 'auto') {
            btn.classList.add('magic-btn');
            btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg> Magic Tool`;
        } else if (track.type === 'station') {
            btn.classList.add('station-btn');
            btn.innerHTML = `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="10" fill="white" stroke="#38bdf8" stroke-width="6" /></svg> Station Tool`;
        } else if (track.type === 'transfer') {
            btn.classList.add('station-btn');
            btn.innerHTML = `<svg viewBox="0 0 40 40"><rect x="10" y="16" width="20" height="8" fill="white" stroke="#38bdf8" stroke-width="2" /><line x1="5" y1="20" x2="35" y2="20" stroke="white" stroke-width="6" stroke-dasharray="4,4" /><line x1="5" y1="20" x2="35" y2="20" stroke="black" stroke-width="4" stroke-dasharray="2,6" /></svg> Connect Tool`;
        } else {
            btn.innerHTML = `<svg viewBox="0 0 40 40">${track.html}</svg>`;
        }
        btn.addEventListener('click', () => {
            selectedTrackType = index;
            document.querySelectorAll('.track-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
        trackPalette.appendChild(btn);
    });
}

function initViewport() {
    viewport.addEventListener('contextmenu', e => e.preventDefault());
    let isPanningModeForRef = false;

    viewport.addEventListener('mousedown', (e) => {
        if (e.button === 1 || e.button === 2) {
            isPanning = true; lastMouseX = e.clientX; lastMouseY = e.clientY;
            viewport.classList.add('panning');
        } else if (e.button === 0) {
            if (isMoveRefMode || e.shiftKey) {
                isPanningModeForRef = true; lastMouseX = e.clientX; lastMouseY = e.clientY;
            } else {
                isDrawing = true;
                const { gx, gy } = getGridCoords(e.clientX, e.clientY);
                startGX = gx; startGY = gy; currentGX = gx; currentGY = gy;
                updatePreview();
            }
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (isPanning) {
            cameraX += e.clientX - lastMouseX; cameraY += e.clientY - lastMouseY;
            lastMouseX = e.clientX; lastMouseY = e.clientY; updateTransform();
        } else if (isPanningModeForRef) {
            refImgX += (e.clientX - lastMouseX) / cameraZoom;
            refImgY += (e.clientY - lastMouseY) / cameraZoom;
            lastMouseX = e.clientX; lastMouseY = e.clientY; updateRefTransform();
        } else if (isDrawing) {
            const { gx, gy } = getGridCoords(e.clientX, e.clientY);
            if (gx !== currentGX || gy !== currentGY) { currentGX = gx; currentGY = gy; updatePreview(); }
        }
        const { gx, gy } = getGridCoords(e.clientX, e.clientY);
        gridCursorHighlight.style.transform = `translate(${gx * CELL_SIZE}px, ${gy * CELL_SIZE}px)`;
    });

    window.addEventListener('mouseup', () => {
        if (isDrawing) { commitLine(); isDrawing = false; previewCanvas.innerHTML = ''; }
        isPanning = false; isPanningModeForRef = false; viewport.classList.remove('panning');
    });

    viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect = viewport.getBoundingClientRect();
        const mouseX = e.clientX - rect.left, mouseY = e.clientY - rect.top;
        const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
        let newZoom = Math.max(0.2, Math.min(cameraZoom * zoomDelta, 3));
        const gx = (mouseX - cameraX) / cameraZoom, gy = (mouseY - cameraY) / cameraZoom;
        cameraX = mouseX - gx * newZoom; cameraY = mouseY - gy * newZoom; cameraZoom = newZoom;
        updateTransform();
    }, { passive: false });
}

function updateTransform() {
    const t = `translate(${cameraX}px, ${cameraY}px) scale(${cameraZoom})`;
    canvas.style.transform = t; previewCanvas.style.transform = t;
    const s = CELL_SIZE * cameraZoom;
    viewport.style.backgroundSize = `${s}px ${s}px`;
    viewport.style.backgroundPosition = `${cameraX}px ${cameraY}px`;
}

function getGridCoords(clientX, clientY) {
    const rect = viewport.getBoundingClientRect();
    return {
        gx: Math.floor((clientX - rect.left - cameraX) / (CELL_SIZE * cameraZoom)),
        gy: Math.floor((clientY - rect.top - cameraY) / (CELL_SIZE * cameraZoom))
    };
}

function getDefaultAutoType(dx, dy) {
    let adx = Math.abs(dx), ady = Math.abs(dy);
    if (adx === 0 && ady === 0) return 1;
    if (adx > 2 * ady) return 1;
    if (ady > 2 * adx) return 2;
    return Math.sign(dx) === Math.sign(dy) ? 7 : 8;
}

// ======= CELL DOM (Multi-Layer) =======

function createCellDOM(gx, gy, layers, hasStation, stationName) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.style.width = `${CELL_SIZE}px`;
    cell.style.height = `${CELL_SIZE}px`;
    cell.style.left = `${gx * CELL_SIZE}px`;
    cell.style.top = `${gy * CELL_SIZE}px`;
    updateCellDOM(cell, layers, hasStation, stationName);
    return cell;
}

function updateCellDOM(cell, layers, hasStation, stationName) {
    let svgInner = '';
    const colors = Object.keys(layers);
    colors.forEach(color => {
        const layer = layers[color];
        const trackDef = TRACK_TYPES[layer.type];
        if (trackDef && trackDef.html) {
            svgInner += `<g style="color:${color}">${trackDef.html}</g>`;
        }
    });
    // Station circle: use first layer color or default
    const stationColor = colors[0] || '#94a3b8';
    if (hasStation) {
        svgInner += `<circle cx="20" cy="20" r="10" fill="white" stroke="${stationColor}" stroke-width="6" />`;
    }
    let html = `<svg class="track-svg" viewBox="0 0 40 40" overflow="visible">${svgInner}</svg>`;
    if (hasStation && stationName) {
        html += `<div class="station-label">${stationName}</div>`;
    }
    cell.innerHTML = html;
}

// Helper: get first color of a cell (for backward compat)
function cellFirstColor(cell) {
    const keys = Object.keys(cell.layers);
    return keys.length > 0 ? keys[0] : '#94a3b8';
}

// ======= PREVIEW =======

function updatePreview() {
    previewCanvas.innerHTML = '';
    const selectedDef = TRACK_TYPES[selectedTrackType];
    if (selectedDef.type === 'transfer' || selectedDef.type === 'empty') return;

    const isStationTool = selectedDef.type === 'station';
    let cells = getLineCells(startGX, startGY, currentGX, currentGY);
    if (isStationTool) cells = [{ x: startGX, y: startGY }];

    const isAutoTool = selectedDef.type === 'auto';
    let placedType = selectedTrackType;
    if (isAutoTool) placedType = getDefaultAutoType(currentGX - startGX, currentGY - startGY);

    cells.forEach(c => {
        const key = `${c.x},${c.y}`;
        const existing = gridData.get(key);
        // Build preview layers: existing layers + new layer for selected color
        let previewLayers = {};
        if (existing) {
            for (const col in existing.layers) previewLayers[col] = { ...existing.layers[col] };
        }
        if (!isStationTool) {
            previewLayers[selectedColor] = { type: placedType, isAuto: isAutoTool };
        }
        const dom = createCellDOM(c.x, c.y, previewLayers,
            isStationTool || (existing && existing.hasStation),
            existing ? existing.stationName : null);
        previewCanvas.appendChild(dom);
    });
}

// ======= COMMIT =======

function commitLine() {
    const selectedDef = TRACK_TYPES[selectedTrackType];
    const isStationTool = selectedDef.type === 'station';
    const isTransferTool = selectedDef.type === 'transfer';

    if (isTransferTool) {
        const key = `${currentGX},${currentGY}`;
        if (gridData.has(key) && gridData.get(key).hasStation) {
            if (transferStartKey === null) {
                transferStartKey = key;
                gridData.get(key).domNode.classList.add('station-selected');
            } else if (transferStartKey !== key) {
                saveState();
                connections.push({ from: transferStartKey, to: key });
                const startCell = gridData.get(transferStartKey);
                const endCell = gridData.get(key);
                if (startCell && endCell && startCell.stationName && !endCell.stationName) {
                    endCell.stationName = startCell.stationName;
                    updateCellDOM(endCell.domNode, endCell.layers, endCell.hasStation, endCell.stationName);
                }
                if (gridData.has(transferStartKey)) gridData.get(transferStartKey).domNode.classList.remove('station-selected');
                transferStartKey = null;
                renderConnections();
                if (typeof updateTrackTable === 'function') updateTrackTable();
            }
        } else {
            if (transferStartKey && gridData.has(transferStartKey)) gridData.get(transferStartKey).domNode.classList.remove('station-selected');
            transferStartKey = null;
        }
        return;
    }

    saveState();
    let cells = getLineCells(startGX, startGY, currentGX, currentGY);
    if (isStationTool) cells = [{ x: startGX, y: startGY }];
    const affectedKeys = new Set();
    let dx = currentGX - startGX, dy = currentGY - startGY;
    let defaultAutoType = getDefaultAutoType(dx, dy);

    cells.forEach(c => {
        const key = `${c.x},${c.y}`;

        if (selectedDef.type === 'empty') {
            // Eraser: remove entire cell
            if (gridData.has(key)) {
                const cell = gridData.get(key);
                cell.domNode.remove();
                gridData.delete(key);
                affectedKeys.add(key);
            }
        } else if (isStationTool) {
            if (gridData.has(key)) {
                const cell = gridData.get(key);
                let name = prompt("Enter station name:", cell.stationName || "New Station");
                if (name !== null) {
                    cell.hasStation = true; cell.stationName = name;
                    updateCellDOM(cell.domNode, cell.layers, cell.hasStation, cell.stationName);
                }
            } else {
                let name = prompt("Enter station name:", "New Station");
                if (name !== null) {
                    const layers = {};
                    const domNode = createCellDOM(c.x, c.y, layers, true, name);
                    canvas.appendChild(domNode);
                    gridData.set(key, { layers, hasStation: true, stationName: name, domNode });
                }
            }
        } else {
            // Track: add/update layer for selectedColor
            let placedType = selectedDef.type === 'auto' ? defaultAutoType : selectedTrackType;
            if (gridData.has(key)) {
                const cell = gridData.get(key);
                cell.layers[selectedColor] = { type: placedType, isAuto: selectedDef.type === 'auto' };
                updateCellDOM(cell.domNode, cell.layers, cell.hasStation, cell.stationName);
            } else {
                const layers = { [selectedColor]: { type: placedType, isAuto: selectedDef.type === 'auto' } };
                const domNode = createCellDOM(c.x, c.y, layers, false, null);
                canvas.appendChild(domNode);
                gridData.set(key, { layers, hasStation: false, stationName: null, domNode });
            }
            affectedKeys.add(key);
        }
    });

    // Resolve auto for affected + neighbors
    const toResolve = new Set();
    affectedKeys.forEach(k => {
        const [gx, gy] = k.split(',').map(Number);
        toResolve.add(k);
        for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) toResolve.add(`${gx+ox},${gy+oy}`);
    });
    toResolve.forEach(k => {
        if (gridData.has(k)) {
            const cell = gridData.get(k);
            // Resolve auto for each color layer that is auto
            let changed = false;
            for (const color in cell.layers) {
                if (cell.layers[color].isAuto) {
                    const newType = resolveAutoForColor(k, color);
                    if (newType !== cell.layers[color].type) { cell.layers[color].type = newType; changed = true; }
                }
            }
            if (changed) updateCellDOM(cell.domNode, cell.layers, cell.hasStation, cell.stationName);
        }
    });

    if (typeof updateTrackTable === 'function') updateTrackTable();
}

// ======= AUTO RESOLVE (per color layer) =======

function resolveAutoForColor(key, color) {
    const cell = gridData.get(key);
    if (!cell || !cell.layers[color]) return 1;
    const layer = cell.layers[color];
    const myExits = TRACK_EXITS[layer.type] || [];
    const [gx, gy] = key.split(',').map(Number);
    const neighbors = [];

    dirOffsets.forEach((off, i) => {
        const nk = `${gx + off.x},${gy + off.y}`;
        if (gridData.has(nk)) {
            const nCell = gridData.get(nk);
            const nLayer = nCell.layers[color];
            if (nLayer) {
                const nExits = TRACK_EXITS[nLayer.type] || [];
                if (nExits.includes((i + 4) % 8) || myExits.includes(i)) neighbors.push(i);
            }
        }
    });

    let resolved = layer.type;
    if (resolved === 27 || resolved === 0) resolved = 1;

    if (neighbors.length === 2) {
        const pair = `${neighbors[0]},${neighbors[1]}`;
        if (AUTO_MAP[pair]) resolved = AUTO_MAP[pair];
    } else if (neighbors.length === 3) {
        const s = neighbors.join(',');
        if (s === '0,2,4') resolved = 24;
        else if (s === '2,4,6') resolved = 25;
        else if (s === '0,4,6') resolved = 26;
        else if (s === '0,2,6') resolved = 23;
    } else if (neighbors.length === 1) {
        const d = neighbors[0];
        resolved = d % 2 === 0 ? ((d === 0 || d === 4) ? 2 : 1) : ((d === 1 || d === 5) ? 8 : 7);
    } else if (neighbors.length === 4) {
        if (neighbors.join(',') === '0,2,4,6') resolved = 21;
        else if (neighbors.join(',') === '1,3,5,7') resolved = 22;
    }
    return resolved;
}

// ======= LINE ALGORITHM =======

function getLineCells(x1, y1, x2, y2) {
    let dx = x2 - x1, dy = y2 - y1;
    let adx = Math.abs(dx), ady = Math.abs(dy);
    if (adx > 2 * ady) dy = 0;
    else if (ady > 2 * adx) dx = 0;
    else { const size = Math.max(adx, ady); dx = size * Math.sign(dx || 1); dy = size * Math.sign(dy || 1); }
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    if (steps === 0) return [{ x: x1, y: y1 }];
    const cells = [], xStep = dx / steps, yStep = dy / steps;
    for (let i = 0; i <= steps; i++) cells.push({ x: Math.round(x1 + i * xStep), y: Math.round(y1 + i * yStep) });
    return cells;
}

// ======= CLEAR / CONNECTIONS =======

function clearBoard() {
    if (gridData.size === 0 && connections.length === 0) return;
    if (!confirm('Clear the entire board? This action can be undone with Ctrl+Z.')) return;
    saveState();
    gridData.forEach(cell => cell.domNode.remove());
    gridData.clear(); connections = []; transferStartKey = null;
    renderConnections();
    if (typeof updateTrackTable === 'function') updateTrackTable();
}

function renderConnections() {
    const layer = document.getElementById('connections-layer');
    if (!layer) return;
    layer.innerHTML = '';
    connections.forEach(conn => {
        const [fx, fy] = conn.from.split(',').map(Number);
        const [tx, ty] = conn.to.split(',').map(Number);
        const cx1 = fx * CELL_SIZE + CELL_SIZE / 2 + 10000, cy1 = fy * CELL_SIZE + CELL_SIZE / 2 + 10000;
        const cx2 = tx * CELL_SIZE + CELL_SIZE / 2 + 10000, cy2 = ty * CELL_SIZE + CELL_SIZE / 2 + 10000;
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        bg.setAttribute('x1', cx1); bg.setAttribute('y1', cy1); bg.setAttribute('x2', cx2); bg.setAttribute('y2', cy2);
        bg.setAttribute('stroke', '#000'); bg.setAttribute('stroke-width', '10'); bg.setAttribute('stroke-linecap', 'round');
        const fg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        fg.setAttribute('x1', cx1); fg.setAttribute('y1', cy1); fg.setAttribute('x2', cx2); fg.setAttribute('y2', cy2);
        fg.setAttribute('stroke', '#fff'); fg.setAttribute('stroke-width', '8'); fg.setAttribute('stroke-linecap', 'round');
        fg.setAttribute('stroke-dasharray', '10,12');
        layer.appendChild(bg); layer.appendChild(fg);
    });
}

document.getElementById('clearBtn').addEventListener('click', clearBoard);

// ======= SAVE / LOAD =======

function saveMapToFile() {
    const data = { version: 2, grid: [], connections: JSON.parse(JSON.stringify(connections)) };
    gridData.forEach((cell, key) => {
        data.grid.push({ key, layers: cell.layers, hasStation: cell.hasStation || false, stationName: cell.stationName || null });
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'metro-map.json'; a.click();
    URL.revokeObjectURL(url);
}

function loadMapFromFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (!data.grid || !Array.isArray(data.grid)) { alert('Invalid map file.'); return; }
            saveState();
            gridData.forEach(cell => cell.domNode.remove()); gridData.clear();
            connections = []; transferStartKey = null;

            data.grid.forEach(item => {
                // Support v1 (single type/color) and v2 (layers)
                let layers = item.layers;
                if (!layers && item.type !== undefined && item.color) {
                    layers = { [item.color]: { type: item.type, isAuto: item.isAuto || false } };
                }
                const [gx, gy] = item.key.split(',').map(Number);
                const domNode = createCellDOM(gx, gy, layers, item.hasStation, item.stationName);
                canvas.appendChild(domNode);
                gridData.set(item.key, { layers, hasStation: item.hasStation || false, stationName: item.stationName || null, domNode });
            });
            if (data.connections) connections = data.connections;
            renderConnections();
            if (typeof updateTrackTable === 'function') updateTrackTable();
        } catch (err) { alert('Error reading map file: ' + err.message); }
    };
    reader.readAsText(file);
}

document.getElementById('saveMapBtn').addEventListener('click', saveMapToFile);
document.getElementById('loadMapBtn').addEventListener('click', () => document.getElementById('loadMapFile').click());
document.getElementById('loadMapFile').addEventListener('change', (e) => {
    const file = e.target.files[0]; if (file) loadMapFromFile(file); e.target.value = '';
});

// ======= KEYBOARD SHORTCUTS =======

window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    const key = e.key.toLowerCase();
    const isCtrl = e.ctrlKey || e.metaKey;
    let newIndex = -1;
    if (isCtrl) {
        if (key === 'e') { e.preventDefault(); clearBoard(); }
        else if (key === 'z') { e.preventDefault(); undo(); }
        else if (key === 'y') { e.preventDefault(); redo(); }
        return;
    }
    if (key === 'e') newIndex = TRACK_TYPES.findIndex(t => t.type === 'empty');
    else if (key === 'm') newIndex = TRACK_TYPES.findIndex(t => t.type === 'auto');
    else if (key === 's') newIndex = TRACK_TYPES.findIndex(t => t.type === 'station');
    else if (key === 't') newIndex = TRACK_TYPES.findIndex(t => t.type === 'transfer');
    if (newIndex !== -1) {
        if (isDrawing) { isDrawing = false; previewCanvas.innerHTML = ''; }
        if (transferStartKey && gridData.has(transferStartKey)) gridData.get(transferStartKey).domNode.classList.remove('station-selected');
        transferStartKey = null;
        selectedTrackType = newIndex;
        const trackBtns = document.querySelectorAll('.track-btn');
        trackBtns.forEach(btn => btn.classList.remove('active'));
        if (trackBtns[newIndex]) trackBtns[newIndex].classList.add('active');
    }
});

// ======= REF IMAGE =======

document.getElementById('refUpload').addEventListener('change', (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { refImage.src = ev.target.result; refImage.style.display = 'block'; updateRefTransform(); };
    reader.readAsDataURL(file);
});
document.getElementById('refOpacity').addEventListener('input', (e) => { refImgOpacity = e.target.value / 100; refImage.style.opacity = refImgOpacity; });
document.getElementById('refScale').addEventListener('input', (e) => { refImgScale = e.target.value / 100; updateRefTransform(); });
document.getElementById('toggleMoveRef').addEventListener('click', (e) => { isMoveRefMode = !isMoveRefMode; e.target.classList.toggle('active', isMoveRefMode); });
function updateRefTransform() { refImage.style.transform = `translate(${refImgX}px, ${refImgY}px) scale(${refImgScale})`; refImage.style.opacity = refImgOpacity; }

// ======= TRACK TABLE =======

function updateTrackTable() {
    const trackListDiv = document.getElementById('trackList');
    if (!trackListDiv) return;

    // Build byColor: color -> Map<key, {type, hasStation, stationName}>
    const byColor = new Map();
    gridData.forEach((cell, key) => {
        for (const color in cell.layers) {
            const layer = cell.layers[color];
            if (!byColor.has(color)) byColor.set(color, new Map());
            byColor.get(color).set(key, { type: layer.type, hasStation: cell.hasStation, stationName: cell.stationName });
        }
        // Station-only cells (no layers)
        if (Object.keys(cell.layers).length === 0 && cell.hasStation) {
            // Don't show in track lists
        }
    });

    const transferMap = new Map();
    connections.forEach(conn => {
        if (!transferMap.has(conn.from)) transferMap.set(conn.from, new Set());
        if (!transferMap.has(conn.to)) transferMap.set(conn.to, new Set());
        transferMap.get(conn.from).add(conn.to);
        transferMap.get(conn.to).add(conn.from);
    });

    if (byColor.size === 0) {
        trackListDiv.innerHTML = '<div style="color:#94a3b8;font-size:0.9rem;">No tracks placed.</div>';
        updateRouteDropdowns();
        return;
    }

    let html = '';
    byColor.forEach((cellsMap, color) => {
        const unvisited = new Set(cellsMap.keys());
        const lines = [];

        const getEdges = (k) => {
            const c = cellsMap.get(k);
            if (!c || c.type === 0) return [];
            const exits = TRACK_EXITS[c.type] || [];
            const [x, y] = k.split(',').map(Number);
            const edges = [];
            exits.forEach(exitDir => {
                const off = dirOffsets[exitDir]; if (!off) return;
                const nk = `${x + off.x},${y + off.y}`;
                if (cellsMap.has(nk)) {
                    const nc = cellsMap.get(nk);
                    if (nc.type !== 0 && (TRACK_EXITS[nc.type] || []).includes((exitDir + 4) % 8)) edges.push(nk);
                }
            });
            return edges;
        };

        while (unvisited.size > 0) {
            let startKey = null, minDeg = 999;
            for (let k of unvisited) { const d = getEdges(k).length; if (d < minDeg) { minDeg = d; startKey = k; } }
            const stationsList = [];
            const queue = [startKey]; const visited = new Set();
            while (queue.length > 0) {
                const curr = queue.shift();
                if (visited.has(curr)) continue;
                visited.add(curr); unvisited.delete(curr);
                const c = cellsMap.get(curr);
                if (c.hasStation && c.stationName) {
                    let stHtml = c.stationName;
                    if (transferMap.has(curr)) {
                        const tLines = [];
                        transferMap.get(curr).forEach(tk => {
                            if (gridData.has(tk)) {
                                const tCell = gridData.get(tk);
                                for (const tc in tCell.layers) {
                                    if (tc !== color) tLines.push(`${colorNames[tc] || 'Unknown'} Line`);
                                }
                            }
                        });
                        if (tLines.length > 0) stHtml += ` <span style="font-size:0.75rem; color:#facc15; font-style:italic;">(To ${[...new Set(tLines)].join(', ')})</span>`;
                    }
                    stationsList.push(stHtml);
                }
                getEdges(curr).forEach(e => { if (!visited.has(e)) queue.push(e); });
            }
            if (stationsList.length > 0) lines.push(stationsList);
        }

        if (lines.length > 0) {
            const cName = colorNames[color] || 'Track';
            lines.forEach((stations, li) => {
                html += `<div class="track-list-item"><div class="track-list-title"><span class="track-list-color" style="background-color:${color};box-shadow:0 0 5px ${color};"></span>${cName} Line ${lines.length > 1 ? `(#${li+1})` : ''}</div>`;
                stations.forEach(st => html += `<div class="station-item">${st}</div>`);
                html += `</div>`;
            });
        }
    });

    if (html === '') html = '<div style="color:#94a3b8;font-size:0.9rem;">No stations placed on tracks.</div>';
    trackListDiv.innerHTML = html;
    updateRouteDropdowns();
}

// ======= ROUTE FINDER =======

let routeHighlightedKeys = [];

function getAllStations() {
    const stations = [];
    gridData.forEach((cell, key) => {
        if (cell.hasStation && cell.stationName) {
            stations.push({ key, name: cell.stationName, color: cellFirstColor(cell) });
        }
    });
    stations.sort((a, b) => a.name.localeCompare(b.name));
    return stations;
}

function updateRouteDropdowns() {
    const fromSelect = document.getElementById('routeFrom');
    const toSelect = document.getElementById('routeTo');
    if (!fromSelect || !toSelect) return;
    const prevFrom = fromSelect.value, prevTo = toSelect.value;
    const stations = getAllStations();
    const build = (sel) => {
        let h = '<option value="">-- Select Station --</option>';
        stations.forEach(st => { h += `<option value="${st.key}"${st.key === sel ? ' selected' : ''}>${st.name} (${colorNames[st.color] || ''})</option>`; });
        return h;
    };
    fromSelect.innerHTML = build(prevFrom);
    toSelect.innerHTML = build(prevTo);
}

function buildStationGraph() {
    const graph = new Map();
    gridData.forEach((cell, key) => { if (cell.hasStation && cell.stationName) { if (!graph.has(key)) graph.set(key, []); } });

    // For each color, build track adjacency and find connected stations
    const byColor = new Map();
    gridData.forEach((cell, key) => {
        for (const color in cell.layers) {
            if (!byColor.has(color)) byColor.set(color, new Map());
            byColor.get(color).set(key, { type: cell.layers[color].type, hasStation: cell.hasStation, stationName: cell.stationName });
        }
    });

    byColor.forEach((cellsMap, color) => {
        const getNeighbors = (k) => {
            const c = cellsMap.get(k); if (!c || c.type === 0) return [];
            const exits = TRACK_EXITS[c.type] || [];
            const [x, y] = k.split(',').map(Number);
            const nb = [];
            exits.forEach(d => {
                const off = dirOffsets[d]; if (!off) return;
                const nk = `${x+off.x},${y+off.y}`;
                if (cellsMap.has(nk)) { const nc = cellsMap.get(nk); if (nc.type !== 0 && (TRACK_EXITS[nc.type]||[]).includes((d+4)%8)) nb.push(nk); }
            });
            return nb;
        };

        const stationsInColor = [];
        cellsMap.forEach((c, k) => { if (c.hasStation && c.stationName) stationsInColor.push(k); });

        stationsInColor.forEach(sk => {
            const visited = new Set([sk]); const queue = [sk];
            while (queue.length > 0) {
                const curr = queue.shift();
                for (const nk of getNeighbors(curr)) {
                    if (visited.has(nk)) continue; visited.add(nk);
                    const nc = cellsMap.get(nk);
                    if (nc && nc.hasStation && nc.stationName && nk !== sk) {
                        if (!graph.has(sk)) graph.set(sk, []);
                        if (!graph.get(sk).some(e => e.to === nk && e.color === color))
                            graph.get(sk).push({ to: nk, color, viaTransfer: false });
                    }
                    queue.push(nk);
                }
            }
        });
    });

    connections.forEach(conn => {
        const fc = gridData.get(conn.from), tc = gridData.get(conn.to);
        if (fc && tc && fc.hasStation && tc.hasStation) {
            if (!graph.has(conn.from)) graph.set(conn.from, []);
            if (!graph.has(conn.to)) graph.set(conn.to, []);
            if (!graph.get(conn.from).some(e => e.to === conn.to && e.viaTransfer)) graph.get(conn.from).push({ to: conn.to, color: null, viaTransfer: true });
            if (!graph.get(conn.to).some(e => e.to === conn.from && e.viaTransfer)) graph.get(conn.to).push({ to: conn.from, color: null, viaTransfer: true });
        }
    });
    return graph;
}

function findRoute(fromKey, toKey) {
    const graph = buildStationGraph();
    if (!graph.has(fromKey) || !graph.has(toKey)) return null;
    const visited = new Map(); const queue = [fromKey];
    visited.set(fromKey, { prev: null, edgeColor: null, viaTransfer: false });
    while (queue.length > 0) {
        const curr = queue.shift();
        if (curr === toKey) {
            const path = []; let node = toKey;
            while (node !== null) { const info = visited.get(node); path.unshift({ stationKey: node, edgeColor: info.edgeColor, viaTransfer: info.viaTransfer }); node = info.prev; }
            return path;
        }
        for (const edge of (graph.get(curr) || [])) {
            if (!visited.has(edge.to)) { visited.set(edge.to, { prev: curr, edgeColor: edge.color, viaTransfer: edge.viaTransfer }); queue.push(edge.to); }
        }
    }
    return null;
}

function getTrackCellsBetweenStations(fromKey, toKey, color) {
    const cells = new Set();
    const colorCells = new Map();
    gridData.forEach((cell, key) => { if (cell.layers[color] && (cell.layers[color].type !== 0 || cell.hasStation)) colorCells.set(key, cell.layers[color]); });

    const getNeighbors = (k) => {
        const c = colorCells.get(k); if (!c || c.type === 0) return [];
        const exits = TRACK_EXITS[c.type] || [];
        const [x, y] = k.split(',').map(Number); const nb = [];
        exits.forEach(d => { const off = dirOffsets[d]; if (!off) return; const nk = `${x+off.x},${y+off.y}`; if (colorCells.has(nk)) { const nc = colorCells.get(nk); if (nc.type !== 0 && (TRACK_EXITS[nc.type]||[]).includes((d+4)%8)) nb.push(nk); } });
        return nb;
    };

    const visited = new Map([[fromKey, null]]); const queue = [fromKey];
    while (queue.length > 0) {
        const curr = queue.shift();
        if (curr === toKey) { let n = toKey; while (n !== null) { cells.add(n); n = visited.get(n); } return cells; }
        for (const nk of getNeighbors(curr)) { if (!visited.has(nk)) { visited.set(nk, curr); queue.push(nk); } }
    }
    cells.add(fromKey); cells.add(toKey); return cells;
}

function highlightRoute(path) {
    clearRouteHighlight();
    for (let i = 0; i < path.length; i++) {
        const step = path[i]; const cell = gridData.get(step.stationKey);
        if (cell && cell.domNode) { cell.domNode.classList.add('route-highlight'); routeHighlightedKeys.push(step.stationKey); }
        if (i > 0 && !step.viaTransfer && step.edgeColor) {
            getTrackCellsBetweenStations(path[i-1].stationKey, step.stationKey, step.edgeColor).forEach(tk => {
                const tc = gridData.get(tk);
                if (tc && tc.domNode) { tc.domNode.classList.add('route-highlight'); routeHighlightedKeys.push(tk); }
            });
        }
    }
}

function clearRouteHighlight() {
    routeHighlightedKeys.forEach(key => { const cell = gridData.get(key); if (cell && cell.domNode) cell.domNode.classList.remove('route-highlight'); });
    routeHighlightedKeys = [];
}

function renderRouteResult(path) {
    if (!path || path.length === 0) return '';
    const legs = []; let currentLeg = null;
    for (let i = 0; i < path.length; i++) {
        const step = path[i]; const cell = gridData.get(step.stationKey);
        const name = cell ? cell.stationName : '?';
        if (i === 0) { currentLeg = { color: step.edgeColor || cellFirstColor(cell), stations: [name] }; }
        else if (step.viaTransfer) { if (currentLeg) legs.push(currentLeg); currentLeg = { color: cellFirstColor(cell), stations: [name], isTransfer: true }; }
        else {
            if (step.edgeColor && currentLeg && step.edgeColor !== currentLeg.color) {
                if (currentLeg) legs.push(currentLeg);
                const prev = gridData.get(path[i-1].stationKey);
                currentLeg = { color: step.edgeColor, stations: [prev ? prev.stationName : '?', name] };
            } else { currentLeg.stations.push(name); }
        }
    }
    if (currentLeg) legs.push(currentLeg);
    // Fix first leg color if it was null
    if (legs.length > 0 && !legs[0].color) {
        if (path.length > 1 && path[1].edgeColor) legs[0].color = path[1].edgeColor;
        else { const c = gridData.get(path[0].stationKey); legs[0].color = c ? cellFirstColor(c) : '#94a3b8'; }
    }

    let transfers = 0;
    for (let i = 1; i < legs.length; i++) if (legs[i].isTransfer) transfers++;
    let html = '<div class="route-success">';
    html += `<div class="route-summary"><span class="route-stations-count">${path.length} trạm</span><span class="route-transfers-count">${transfers > 0 ? transfers + ' chuyển tuyến' : 'Trực tiếp'}</span></div>`;
    legs.forEach((leg, idx) => {
        const cName = colorNames[leg.color] || 'Track';
        if (idx > 0 && leg.isTransfer) html += `<div class="route-transfer-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10M17 7L7 17"/></svg>Chuyển sang ${cName} Line</div>`;
        html += `<div class="route-leg"><div class="route-leg-header"><span class="route-leg-color" style="background:${leg.color};box-shadow:0 0 6px ${leg.color};"></span>${cName} Line</div><div class="route-leg-stations">`;
        leg.stations.forEach((st, si) => {
            let cls = 'route-stop';
            if (si === 0 && idx === 0) cls += ' route-stop-first';
            if (si === leg.stations.length - 1 && idx === legs.length - 1) cls += ' route-stop-last';
            html += `<div class="${cls}">${st}</div>`;
        });
        html += '</div></div>';
    });
    html += '</div>';
    return html;
}

function initRouteFinder() {
    const findBtn = document.getElementById('findRouteBtn');
    const clearBtn = document.getElementById('clearRouteBtn');
    const swapBtn = document.getElementById('routeSwapBtn');
    const resultDiv = document.getElementById('routeResult');
    const fromSelect = document.getElementById('routeFrom');
    const toSelect = document.getElementById('routeTo');
    if (!findBtn) return;

    findBtn.addEventListener('click', () => {
        const fk = fromSelect.value, tk = toSelect.value;
        if (!fk || !tk) { resultDiv.innerHTML = '<div class="route-error">Vui lòng chọn trạm đi và trạm đến.</div>'; return; }
        if (fk === tk) { resultDiv.innerHTML = '<div class="route-error">Trạm đi và trạm đến giống nhau!</div>'; return; }
        const path = findRoute(fk, tk);
        if (!path) { resultDiv.innerHTML = '<div class="route-error">Không tìm thấy đường đi giữa hai trạm này.</div>'; clearRouteHighlight(); clearBtn.style.display = 'none'; return; }
        resultDiv.innerHTML = renderRouteResult(path); highlightRoute(path); clearBtn.style.display = 'block';
    });
    clearBtn.addEventListener('click', () => { clearRouteHighlight(); resultDiv.innerHTML = ''; clearBtn.style.display = 'none'; });
    swapBtn.addEventListener('click', () => { const tmp = fromSelect.value; fromSelect.value = toSelect.value; toSelect.value = tmp; });
}

initApp();
initRouteFinder();