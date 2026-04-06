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

function updatePreview() {
    previewCanvas.innerHTML = '';
    const selectedDef = TRACK_TYPES[selectedTrackType];
    if (selectedDef.type === 'transfer' || selectedDef.type === 'empty' || selectedDef.type === 'pan' || selectedDef.type === 'oneway') return;

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
