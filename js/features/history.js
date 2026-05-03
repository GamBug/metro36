// ======= HISTORY / UNDO-REDO =======
// Dependencies: state.js

function snapshotCell(val) {
    const layers = {};
    for (const c in val.layers) layers[c] = { type: val.layers[c].type, isAuto: val.layers[c].isAuto, direction: val.layers[c].direction };
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
    clearGraphCache();
    if (typeof updateTrackTable === 'function') updateTrackTable();
}
