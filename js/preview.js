// ======= PREVIEW =======
// Dependencies: constants.js, state.js, cells.js, drawing.js (for getLineCells, viewport.js for getDefaultAutoType

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
