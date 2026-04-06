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

function buildStationGraph() {
    const graph = new Map();
    gridData.forEach((cell, key) => { if (cell.hasStation && cell.stationName) { if (!graph.has(key)) graph.set(key, []); } });

    const byColor = new Map();
    gridData.forEach((cell, key) => {
        for (const color in cell.layers) {
            if (!byColor.has(color)) byColor.set(color, new Map());
            byColor.get(color).set(key, { type: cell.layers[color].type, direction: cell.layers[color].direction, hasStation: cell.hasStation, stationName: cell.stationName });
        }
    });

    byColor.forEach((cellsMap, color) => {
        const getNeighbors = (k) => {
            const c = cellsMap.get(k); if (!c || c.type === 0) return [];
            const exits = TRACK_EXITS[c.type] || [];
            const [x, y] = k.split(',').map(Number);
            const nb = [];
            exits.forEach(d => {
                if (c.direction != null && c.direction !== d) return;
                const off = dirOffsets[d]; if (!off) return;
                const nk = `${x+off.x},${y+off.y}`;
                if (cellsMap.has(nk)) {
                    const nc = cellsMap.get(nk);
                    if (nc.type !== 0 && (TRACK_EXITS[nc.type]||[]).includes((d+4)%8)) {
                        if (nc.direction != null && nc.direction === (d+4)%8) return;
                        nb.push(nk);
                    }
                }
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
        exits.forEach(d => {
            if (c.direction != null && c.direction !== d) return;
            const off = dirOffsets[d]; if (!off) return; 
            const nk = `${x+off.x},${y+off.y}`; 
            if (colorCells.has(nk)) {
                const nc = colorCells.get(nk); 
                if (nc.type !== 0 && (TRACK_EXITS[nc.type]||[]).includes((d+4)%8)) {
                    if (nc.direction != null && nc.direction === (d+4)%8) return;
                    nb.push(nk);
                }
            } 
        });
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
