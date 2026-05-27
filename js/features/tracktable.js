// ======= TRACK TABLE =======
// Dependencies: constants.js, state.js, cells.js, routing.js (for updateRouteDropdowns)

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
                    let stHtml = escapeHTML(c.stationName);
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
