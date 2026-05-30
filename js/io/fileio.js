// ======= FILE I/O (Save/Load) =======
// Dependencies: state.js, security.js, cells.js, history.js, connections.js, tracktable.js, routing.js

function validateMapData(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
    if (!Array.isArray(data.grid) || data.grid.length > MAP_LIMITS.maxGridCells) return false;

    for (const item of data.grid) {
        if (!item || typeof item !== 'object') return false;
        if (!isValidGridKey(item.key)) return false;
        if (item.layers && (typeof item.layers !== 'object' || Array.isArray(item.layers))) return false;
        if (item.stationName !== undefined && item.stationName !== null && typeof item.stationName !== 'string') return false;
    }

    if (data.connections && (!Array.isArray(data.connections) || data.connections.length > MAP_LIMITS.maxConnections)) {
        return false;
    }

    if (data.refImage && (typeof data.refImage !== 'object' || Array.isArray(data.refImage))) return false;
    return true;
}

function normalizeMapItem(item) {
    let layers = item.layers;
    if (!layers && item.type !== undefined && item.color) {
        layers = { [item.color]: { type: item.type, isAuto: item.isAuto || false } };
    }

    return {
        key: item.key,
        layers: sanitizeLayers(layers),
        hasStation: Boolean(item.hasStation),
        stationName: sanitizeStationName(item.stationName)
    };
}

function applyRefImage(rawRefImage) {
    if (rawRefImage) {
        refImgX = clampNumber(rawRefImage.x, 0, -MAP_LIMITS.maxCoordinateAbs, MAP_LIMITS.maxCoordinateAbs);
        refImgY = clampNumber(rawRefImage.y, 0, -MAP_LIMITS.maxCoordinateAbs, MAP_LIMITS.maxCoordinateAbs);
        refImgScale = clampNumber(rawRefImage.scale, 1, 0.01, 10);
        refImgOpacity = clampNumber(rawRefImage.opacity, 0.5, 0, 1);

        const safeSrc = sanitizeRefImageSrc(rawRefImage.src);
        refImage.src = safeSrc;
        refImage.style.display = safeSrc ? 'block' : 'none';
    } else {
        refImgX = 0;
        refImgY = 0;
        refImgScale = 1;
        refImgOpacity = 0.5;
        refImage.src = 'chicago.jpg';
        refImage.style.display = 'block';
    }

    if (typeof updateRefTransform === 'function') updateRefTransform();
    if (typeof syncRefSlidersUI === 'function') syncRefSlidersUI();
}

function applyMapData(data, options = {}) {
    if (!validateMapData(data)) {
        if (options.showAlert) alert('Invalid map file structure.');
        else console.error('Invalid map format');
        return false;
    }

    if (options.requireEditPermission && !canEditMap()) return false;
    if (options.saveUndo !== false) saveState();

    gridData.forEach(cell => cell.domNode.remove());
    gridData.clear();
    connections = [];
    transferStartKey = null;
    clearGraphCache();

    data.grid.forEach(item => {
        const normalized = normalizeMapItem(item);
        const [gx, gy] = normalized.key.split(',').map(Number);
        const domNode = createCellDOM(gx, gy, normalized.layers, normalized.hasStation, normalized.stationName);
        canvas.appendChild(domNode);
        gridData.set(normalized.key, {
            layers: normalized.layers,
            hasStation: normalized.hasStation,
            stationName: normalized.stationName,
            domNode
        });
    });

    connections = sanitizeConnections(data.connections);
    renderConnections();
    if (typeof updateTrackTable === 'function') updateTrackTable();

    applyRefImage(data.refImage);
    setTimeout(() => { if (typeof centerCameraOnMap === 'function') centerCameraOnMap(); }, 50);
    return true;
}

function saveMapToFile() {
    if (!canEditMap()) return;

    const data = {
        version: 2,
        grid: [],
        connections: JSON.parse(JSON.stringify(connections)),
        refImage: {
            src: getSerializableRefImageSrc(refImage.src),
            x: refImgX,
            y: refImgY,
            scale: refImgScale,
            opacity: refImgOpacity
        }
    };

    gridData.forEach((cell, key) => {
        data.grid.push({
            key,
            layers: cell.layers,
            hasStation: cell.hasStation || false,
            stationName: sanitizeStationName(cell.stationName)
        });
    });

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'metro-map.json';
    a.click();
    URL.revokeObjectURL(url);
}

function loadMapFromFile(file) {
    if (!canEditMap()) return;
    if (!file || file.size > MAP_LIMITS.maxFileBytes) {
        alert('Map file is too large or invalid.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            applyMapData(data, { showAlert: true, requireEditPermission: true });
        } catch (err) {
            alert('Error reading map file: ' + err.message);
        }
    };
    reader.readAsText(file);
}

document.getElementById('saveMapBtn').addEventListener('click', saveMapToFile);
document.getElementById('loadMapBtn').addEventListener('click', () => {
    if (canEditMap()) document.getElementById('loadMapFile').click();
});
document.getElementById('loadMapFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) loadMapFromFile(file);
    e.target.value = '';
});

async function loadMapFromUrl(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) return;
        const data = await response.json();
        applyMapData(data, { saveUndo: false });
    } catch (err) {
        console.error('Failed to load default map', err);
    }
}

function syncRefSlidersUI() {
    const opacityInput = document.getElementById('refOpacity');
    if (opacityInput) opacityInput.value = Math.round(refImgOpacity * 100);
    const scaleInput = document.getElementById('refScale');
    if (scaleInput) scaleInput.value = Math.round(refImgScale * 100);
}
