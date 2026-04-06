function commitLine() {
    const selectedDef = TRACK_TYPES[selectedTrackType];
    if (selectedDef.type === 'pan') return;
    const isStationTool = selectedDef.type === 'station';
    const isTransferTool = selectedDef.type === 'transfer';
    const isOneWayTool = selectedDef.type === 'oneway';

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

        if (isOneWayTool) {
            if (gridData.has(key)) {
                const cell = gridData.get(key);
                let targetLayer = cell.layers[selectedColor];
                
                // If the selected color isn't in this cell, find the first available track layer
                if (!targetLayer || targetLayer.type === 0 || targetLayer.type === 'empty') {
                    for (const color in cell.layers) {
                        if (cell.layers[color].type !== 0 && cell.layers[color].type !== 'empty') {
                            targetLayer = cell.layers[color];
                            break;
                        }
                    }
                }

                if (targetLayer && targetLayer.type !== 0 && targetLayer.type !== 'empty') {
                    const exits = TRACK_EXITS[targetLayer.type] || [];
                    if (exits.length > 0) {
                        let curIdx = exits.indexOf(targetLayer.direction);
                        if (curIdx === -1) targetLayer.direction = exits[0];
                        else if (curIdx + 1 < exits.length) targetLayer.direction = exits[curIdx + 1];
                        else targetLayer.direction = null;
                        updateCellDOM(cell.domNode, cell.layers, cell.hasStation, cell.stationName);
                        affectedKeys.add(key);
                    }
                }
            }
        } else if (selectedDef.type === 'empty') {
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
