// ======= FILE I/O (Save/Load) =======
// Dependencies: state.js, cells.js, history.js, connections.js, tracktable.js, routing.js (for clearGraphCache)

// Validates the map JSON structure to prevent application crashes and corrupt states
function validateMapData(data) {
    if (!data || typeof data !== 'object') return false;
    if (!data.grid || !Array.isArray(data.grid)) return false;
    
    // Validate each grid item
    for (const item of data.grid) {
        if (!item || typeof item !== 'object') return false;
        if (typeof item.key !== 'string') return false;
        const parts = item.key.split(',');
        if (parts.length !== 2 || isNaN(Number(parts[0])) || isNaN(Number(parts[1]))) return false;
        
        // item.layers is optional but must be an object if present
        if (item.layers && typeof item.layers !== 'object') return false;
    }
    
    // Validate connections if present
    if (data.connections) {
        if (!Array.isArray(data.connections)) return false;
        for (const conn of data.connections) {
            if (!conn || typeof conn !== 'object') return false;
            if (typeof conn.from !== 'string' || typeof conn.to !== 'string') return false;
        }
    }
    return true;
}

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
            if (!validateMapData(data)) { alert('Invalid map file structure.'); return; }
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

                // Sanitize layers to prevent XSS via malicious color keys
                const sanitizedLayers = {};
                const hexRegex = /^#[0-9A-Fa-f]{3,8}$/;
                if (layers) {
                    for (const color in layers) {
                        if (hexRegex.test(color) || (typeof METRO_COLORS !== 'undefined' && METRO_COLORS.includes(color))) {
                            sanitizedLayers[color] = {
                                type: layers[color].type,
                                isAuto: layers[color].isAuto || false,
                                direction: layers[color].direction !== undefined ? layers[color].direction : null
                            };
                        } else {
                            console.warn(`[Security] Blocked invalid color key: ${color}`);
                        }
                    }
                }
                layers = sanitizedLayers;

                const [gx, gy] = item.key.split(',').map(Number);
                const domNode = createCellDOM(gx, gy, layers, item.hasStation, item.stationName);
                canvas.appendChild(domNode);
                gridData.set(item.key, { layers, hasStation: item.hasStation || false, stationName: item.stationName || null, domNode });
            });

            if (data.connections && Array.isArray(data.connections)) {
                connections = data.connections.filter(c => c && typeof c.from === 'string' && typeof c.to === 'string');
            } else {
                connections = [];
            }

            renderConnections();
            if (typeof updateTrackTable === 'function') updateTrackTable();
            setTimeout(() => { if (typeof centerCameraOnMap === 'function') centerCameraOnMap(); }, 50);
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
        if (!validateMapData(data)) {
            console.error('Invalid default map format');
            return;
        }
        
        saveState();
        gridData.forEach(cell => cell.domNode.remove()); gridData.clear();
        connections = []; transferStartKey = null;
        clearGraphCache();

        data.grid.forEach(item => {
            let layers = item.layers;
            if (!layers && item.type !== undefined && item.color) {
                layers = { [item.color]: { type: item.type, isAuto: item.isAuto || false } };
            }

            // Sanitize layers to prevent XSS via malicious color keys
            const sanitizedLayers = {};
            const hexRegex = /^#[0-9A-Fa-f]{3,8}$/;
            if (layers) {
                for (const color in layers) {
                    if (hexRegex.test(color) || (typeof METRO_COLORS !== 'undefined' && METRO_COLORS.includes(color))) {
                        sanitizedLayers[color] = {
                            type: layers[color].type,
                            isAuto: layers[color].isAuto || false,
                            direction: layers[color].direction !== undefined ? layers[color].direction : null
                        };
                    } else {
                        console.warn(`[Security] Blocked invalid color key: ${color}`);
                    }
                }
            }
            layers = sanitizedLayers;

            const [gx, gy] = item.key.split(',').map(Number);
            const domNode = createCellDOM(gx, gy, layers, item.hasStation, item.stationName);
            canvas.appendChild(domNode);
            gridData.set(item.key, { layers, hasStation: item.hasStation || false, stationName: item.stationName || null, domNode });
        });

        if (data.connections && Array.isArray(data.connections)) {
            connections = data.connections.filter(c => c && typeof c.from === 'string' && typeof c.to === 'string');
        } else {
            connections = [];
        }

        renderConnections();
        if (typeof updateTrackTable === 'function') updateTrackTable();
        
        // Auto-center camera around map
        setTimeout(() => { if (typeof centerCameraOnMap === 'function') centerCameraOnMap(); }, 50);
    } catch (err) {
        console.error('Failed to load default map', err);
    }
}

