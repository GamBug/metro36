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

function updateTrackTable() {
    const trackListDiv = document.getElementById('trackList');
    if (!trackListDiv) return;

    const byColor = new Map();
    gridData.forEach((cell, key) => {
        for (const color in cell.layers) {
            const layer = cell.layers[color];
            if (!byColor.has(color)) byColor.set(color, new Map());
            byColor.get(color).set(key, { type: layer.type, hasStation: cell.hasStation, stationName: cell.stationName });
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
