// ======= FILE I/O (Save/Load) =======
// Dependencies: state.js, cells.js, history.js, connections.js, tracktable.js, routing.js (for clearGraphCache)

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
            clearGraphCache();

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

async function loadMapFromUrl(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) return;
        const data = await response.json();
        if (!data.grid || !Array.isArray(data.grid)) return;
        
        saveState();
        gridData.forEach(cell => cell.domNode.remove()); gridData.clear();
        connections = []; transferStartKey = null;
        clearGraphCache();

        data.grid.forEach(item => {
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
        
        // Auto-center camera around map
        if (data.grid.length > 0) {
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            data.grid.forEach(item => {
                const [gx, gy] = item.key.split(',').map(Number);
                if (gx < minX) minX = gx; if (gx > maxX) maxX = gx;
                if (gy < minY) minY = gy; if (gy > maxY) maxY = gy;
            });
            const midX = (minX + maxX) / 2;
            const midY = (minY + maxY) / 2;
            const rect = viewport.getBoundingClientRect();
            cameraX = (rect.width / 2) - midX * CELL_SIZE;
            cameraY = (rect.height / 2) - midY * CELL_SIZE;
            updateTransform();
        }
    } catch (err) {
        console.error('Failed to load default map', err);
    }
}
