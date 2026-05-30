// ======= ROUTE FINDER =======
// Dependencies: constants.js, state.js, cells.js, tracktable.js

// Graph caching with state hash
let cachedGraph = null;
let cachedGridStateHash = null;

function getGridStateHash() {
    let hash = '';
    const keys = Array.from(gridData.keys()).sort();
    keys.forEach(key => {
        const cell = gridData.get(key);
        for (const color in cell.layers) {
            hash += `${key}:${color}:${cell.layers[color].type}:${cell.layers[color].direction || 0};`;
        }
    });
    connections.forEach(conn => {
        hash += `conn:${conn.from}-${conn.to};`;
    });
    hash += `exc:${Array.from(excludedColors).sort().join(',')}`;
    return hash;
}

function getCachedGraph() {
    const currentHash = getGridStateHash();
    if (cachedGraph && cachedGridStateHash === currentHash) {
        return cachedGraph;
    }
    cachedGraph = buildStationGraph();
    cachedGridStateHash = currentHash;
    return cachedGraph;
}

function clearGraphCache() {
    cachedGraph = null;
    cachedGridStateHash = null;
}

let routeHighlightedKeys = [];

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

function updateRouteDropdowns() {
    const fromSelect = document.getElementById('routeFrom');
    const toSelect = document.getElementById('routeTo');
    if (!fromSelect || !toSelect) return;
    const prevFrom = fromSelect.value, prevTo = toSelect.value;
    const stations = getAllStations();
    const build = (sel) => {
        let h = '<option value="" style="color:#94a3b8">-- Select Station --</option>';
        stations.forEach(st => {
            h += `<option value="${st.key}" style="color:${st.color}; font-weight:600;"${st.key === sel ? ' selected' : ''}>${escapeHTML(st.name)}</option>`;
        });
        return h;
    };
    fromSelect.innerHTML = build(prevFrom);
    toSelect.innerHTML = build(prevTo);
    syncSelectColor(fromSelect);
    syncSelectColor(toSelect);
}

function syncSelectColor(select) {
    const option = select.options[select.selectedIndex];
    if (option && option.value) {
        select.style.color = option.style.color;
    } else {
        select.style.color = '#94a3b8';
    }
}

function buildStationGraph() {
    const graph = new Map();
    gridData.forEach((cell, key) => { if (cell.hasStation && cell.stationName) { if (!graph.has(key)) graph.set(key, []); } });

    // For each color, build track adjacency and find connected stations
    const byColor = new Map();
    gridData.forEach((cell, key) => {
        for (const color in cell.layers) {
            if (excludedColors.has(color)) continue;
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
                const nk = `${x + off.x},${y + off.y}`;
                if (cellsMap.has(nk)) {
                    const nc = cellsMap.get(nk);
                    if (nc.type !== 0 && (TRACK_EXITS[nc.type] || []).includes((d + 4) % 8)) {
                        if (nc.direction != null && nc.direction === (d + 4) % 8) return;
                        nb.push(nk);
                    }
                }
            });
            return nb;
        };

        const stationsInColor = [];
        cellsMap.forEach((c, k) => { if (c.hasStation && c.stationName) stationsInColor.push(k); });

        stationsInColor.forEach(sk => {
            const visited = new Set([sk]); const queue = [{key: sk, dist: 0}];
            while (queue.length > 0) {
                const curr = queue.shift();
                for (const nk of getNeighbors(curr.key)) {
                    if (visited.has(nk)) continue; visited.add(nk);
                    const nc = cellsMap.get(nk);
                    const [cx, cy] = curr.key.split(',').map(Number);
                    const [nx, ny] = nk.split(',').map(Number);
                    const stepDist = Math.sqrt(Math.pow(nx - cx, 2) + Math.pow(ny - cy, 2));
                    const newDist = curr.dist + stepDist;

                    if (nc && nc.hasStation && nc.stationName && nk !== sk) {
                        if (!graph.has(sk)) graph.set(sk, []);
                        if (!graph.get(sk).some(e => e.to === nk && e.color === color))
                            graph.get(sk).push({ to: nk, color, viaTransfer: false, gridDist: newDist });
                        // Stop at intermediate stations — don't expand through them
                    } else {
                        queue.push({key: nk, dist: newDist});
                    }
                }
            }
        });
    });

    connections.forEach(conn => {
        const fc = gridData.get(conn.from), tc = gridData.get(conn.to);
        if (fc && tc && fc.hasStation && tc.hasStation) {
            const [fx, fy] = conn.from.split(',').map(Number);
            const [tx, ty] = conn.to.split(',').map(Number);
            const dist = Math.sqrt(Math.pow(tx - fx, 2) + Math.pow(ty - fy, 2));
            if (!graph.has(conn.from)) graph.set(conn.from, []);
            if (!graph.has(conn.to)) graph.set(conn.to, []);
            if (!graph.get(conn.from).some(e => e.to === conn.to && e.viaTransfer)) graph.get(conn.from).push({ to: conn.to, color: null, viaTransfer: true, gridDist: dist });
            if (!graph.get(conn.to).some(e => e.to === conn.from && e.viaTransfer)) graph.get(conn.to).push({ to: conn.from, color: null, viaTransfer: true, gridDist: dist });
        }
    });
    return graph;
}

function findRoute(fromKey, toKey) {
    const graph = getCachedGraph();
    if (!graph.has(fromKey) || !graph.has(toKey)) return null;

    const [targetX, targetY] = toKey.split(',').map(Number);

    const CELL_KM = 0.25;
    const V_TRAIN = 35; // km/h
    const V_WALK = 4.5; // km/h
    const T_DWELL = 0.5 / 60; // hours (0.5 mins)

    // Heuristic: Optimistic time to reach destination in hours
    function getHeuristic(key) {
        const [x, y] = key.split(',').map(Number);
        const a = Math.abs(x - targetX);
        const b = Math.abs(y - targetY);
        const gridDist = Math.abs(a - b) + (Math.SQRT2) * Math.min(a, b);
        const distKm = gridDist * CELL_KM;
        return distKm / V_TRAIN;
    }

    const openSet = [fromKey];
    const closedSet = new Set();
    const visited = new Map();
    const gScore = new Map();
    const fScore = new Map();

    gScore.set(fromKey, 0);
    fScore.set(fromKey, getHeuristic(fromKey));
    visited.set(fromKey, { prev: null, edgeColor: null, viaTransfer: false });

    while (openSet.length > 0) {
        // Sort openSet by fScore (Min-priority queue behavior)
        openSet.sort((a, b) => fScore.get(a) - fScore.get(b));
        const curr = openSet.shift();

        // Skip if already fully processed
        if (closedSet.has(curr)) continue;
        closedSet.add(curr);

        if (curr === toKey) {
            const path = [];
            let node = toKey;
            while (node !== null) {
                const info = visited.get(node);
                path.unshift({
                    stationKey: node,
                    edgeColor: info.edgeColor,
                    viaTransfer: info.viaTransfer
                });
                node = info.prev;
            }
            return path;
        }

        const edges = graph.get(curr) || [];
        for (const edge of edges) {
            if (closedSet.has(edge.to)) continue;
            
            let weight;
            if (edge.viaTransfer) {
                const walkDistKm = edge.gridDist * CELL_KM;
                weight = walkDistKm / V_WALK;
            } else {
                const trainDistKm = edge.gridDist * CELL_KM;
                weight = (trainDistKm / V_TRAIN) + T_DWELL;
                
                // Thêm phạt thời gian chuyển tuyến (3 phút) nếu đổi màu tàu tại ga này
                const currInfo = visited.get(curr);
                if (currInfo && currInfo.edgeColor && edge.color && currInfo.edgeColor !== edge.color) {
                    weight += 3.0 / 60;
                }
            }
            const tentativeGScore = gScore.get(curr) + weight;

            if (!gScore.has(edge.to) || tentativeGScore < gScore.get(edge.to)) {
                visited.set(edge.to, { prev: curr, edgeColor: edge.color, viaTransfer: edge.viaTransfer });
                gScore.set(edge.to, tentativeGScore);
                fScore.set(edge.to, tentativeGScore + getHeuristic(edge.to));

                if (!openSet.includes(edge.to)) {
                    openSet.push(edge.to);
                }
            }
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
            const nk = `${x + off.x},${y + off.y}`;
            if (colorCells.has(nk)) {
                const nc = colorCells.get(nk);
                if (nc.type !== 0 && (TRACK_EXITS[nc.type] || []).includes((d + 4) % 8)) {
                    if (nc.direction != null && nc.direction === (d + 4) % 8) return;
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

function highlightLayer(cellNode, color) {
    if (!cellNode || !color) return;
    cellNode.querySelectorAll(`.track-layer[data-color="${color}"]`).forEach(g => {
        g.classList.add('layer-highlight');
    });
}

function highlightRoute(path) {
    clearRouteHighlight();
    const canvas = document.getElementById('grid-canvas');
    if (canvas) canvas.classList.add('has-route-active');

    if (path.length > 0) {
        const startStep = path[0];
        const endStep = path[path.length - 1];

        const addHighlight = (step, type, label) => {
            const [gx, gy] = step.stationKey.split(',').map(Number);
            const overlay = document.createElement('div');
            overlay.className = `route-endpoint-overlay ${type}`;
            overlay.style.width = `${CELL_SIZE * 2}px`;
            overlay.style.height = `${CELL_SIZE * 2}px`;
            overlay.style.left = `${(gx - 0.5) * CELL_SIZE}px`;
            overlay.style.top = `${(gy - 0.5) * CELL_SIZE}px`;

            if (label) {
                const labelEl = document.createElement('div');
                labelEl.className = 'route-endpoint-label';
                labelEl.textContent = label;
                overlay.appendChild(labelEl);
            }

            canvas.appendChild(overlay);
        };

        addHighlight(startStep, 'start', 'A');
        if (startStep.stationKey !== endStep.stationKey) {
            addHighlight(endStep, 'end', 'B');
        }
    }

    for (let i = 0; i < path.length; i++) {
        const step = path[i]; const cell = gridData.get(step.stationKey);
        if (cell && cell.domNode) {
            cell.domNode.classList.add('route-highlight');
            routeHighlightedKeys.push(step.stationKey);

            // Highlight the layer used to reach this station
            if (step.edgeColor) highlightLayer(cell.domNode, step.edgeColor);

            // If there's a next step on the same line, highlight that too
            if (i + 1 < path.length && !path[i + 1].viaTransfer) {
                highlightLayer(cell.domNode, path[i + 1].edgeColor);
            }
        }

        if (i > 0 && step.viaTransfer) {
            const connKey = `conn-${path[i - 1].stationKey}-${step.stationKey}`;
            document.querySelectorAll(`.${CSS.escape(connKey)}`).forEach(line => {
                line.classList.add('route-highlight-line');
            });
        }
        if (i > 0 && !step.viaTransfer && step.edgeColor) {
            getTrackCellsBetweenStations(path[i - 1].stationKey, step.stationKey, step.edgeColor).forEach(tk => {
                const tc = gridData.get(tk);
                if (tc && tc.domNode) {
                    tc.domNode.classList.add('route-highlight');
                    highlightLayer(tc.domNode, step.edgeColor);
                    routeHighlightedKeys.push(tk);
                }
            });
        }
    }
}

function clearRouteHighlight() {
    const canvas = document.getElementById('grid-canvas');
    if (canvas) canvas.classList.remove('has-route-active');

    document.querySelectorAll('.route-endpoint-overlay').forEach(el => el.remove());

    routeHighlightedKeys.forEach(key => {
        const cell = gridData.get(key);
        if (cell && cell.domNode) {
            cell.domNode.classList.remove('route-highlight');
            cell.domNode.querySelectorAll('.layer-highlight').forEach(l => l.classList.remove('layer-highlight'));
        }
    });
    document.querySelectorAll('.route-highlight-line').forEach(line => line.classList.remove('route-highlight-line'));
    routeHighlightedKeys = [];
}

function calculateRouteMetrics(path) {
    if (!path || path.length < 2) return { trainDist: 0, walkDist: 0, totalDist: 0, time: 0 };
    
    let totalTrainDistKm = 0;
    let totalWalkDistKm = 0;
    let totalTimeMin = 0;
    
    const CELL_KM = 0.25;
    const V_TRAIN = 35; // km/h
    const V_WALK = 4.5; // km/h
    const T_DWELL = 0.5; // phút dừng mỗi ga trung gian (30 giây)
    const T_WAIT = 3.0; // phút chờ tàu (khởi hành hoặc khi đổi tuyến)
    
    const graph = getCachedGraph();
    let lastColor = null;
    
    for (let i = 1; i < path.length; i++) {
        const fromKey = path[i - 1].stationKey;
        const toKey = path[i].stationKey;
        const viaTransfer = path[i].viaTransfer;
        const color = path[i].edgeColor;
        
        const edges = graph.get(fromKey) || [];
        const edge = edges.find(e => e.to === toKey && e.viaTransfer === viaTransfer && (viaTransfer || e.color === color));
        
        if (edge) {
            const distKm = edge.gridDist * CELL_KM;
            if (viaTransfer) {
                totalWalkDistKm += distKm;
                totalTimeMin += (distKm / V_WALK) * 60;
                lastColor = null;
            } else {
                totalTrainDistKm += distKm;
                totalTimeMin += (distKm / V_TRAIN) * 60 + T_DWELL;
                
                if (i === 1) {
                    totalTimeMin += T_WAIT;
                    lastColor = color;
                } else if (lastColor && color && lastColor !== color) {
                    totalTimeMin += T_WAIT;
                    lastColor = color;
                }
            }
        }
    }
    
    return {
        trainDist: totalTrainDistKm,
        walkDist: totalWalkDistKm,
        totalDist: totalTrainDistKm + totalWalkDistKm,
        time: Math.max(1, Math.round(totalTimeMin))
    };
}

function renderRouteResult(path) {
    if (!path || path.length === 0) return '';
    const legs = []; let currentLeg = null;
    for (let i = 0; i < path.length; i++) {
        const step = path[i]; const cell = gridData.get(step.stationKey);
        const name = cell ? escapeHTML(cell.stationName) : '?';
        if (i === 0) { currentLeg = { color: step.edgeColor || cellFirstColor(cell), stations: [name] }; }
        else if (step.viaTransfer) { if (currentLeg) legs.push(currentLeg); currentLeg = { color: cellFirstColor(cell), stations: [name], isTransfer: true }; }
        else {
            if (step.edgeColor && currentLeg && step.edgeColor !== currentLeg.color) {
                if (currentLeg) legs.push(currentLeg);
                const prev = gridData.get(path[i - 1].stationKey);
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
    
    // Tính toán chỉ số thực tế
    const metrics = calculateRouteMetrics(path);
    
    let html = '<div class="route-success">';
    html += `<div class="route-summary" style="display:flex; flex-direction:column; gap:4px; padding:10px;">`;
    html += `<div style="display:flex; justify-content:space-between; width:100%; border-bottom:1px solid var(--border-secondary); padding-bottom:6px; margin-bottom:6px;">`;
    html += `<span class="route-stations-count">${path.length} ga dừng</span>`;
    html += `<span class="route-transfers-count">${transfers > 0 ? transfers + ' lần đổi tuyến' : 'Đi thẳng'}</span>`;
    html += `</div>`;
    html += `<div style="display:flex; justify-content:space-between; width:100%; font-size:0.8rem; color:var(--text-secondary);">`;
    html += `<span>📏 Quãng đường: <strong>${metrics.totalDist.toFixed(2)} km</strong></span>`;
    html += `<span>⏱️ Dự kiến: <strong>${metrics.time} phút</strong></span>`;
    html += `</div>`;
    if (metrics.walkDist > 0) {
        html += `<div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">(Tàu chạy: ${metrics.trainDist.toFixed(2)} km | Đi bộ: ${metrics.walkDist.toFixed(2)} km)</div>`;
    }
    html += `</div>`;
    
    legs.forEach((leg, idx) => {
        const cName = colorNames[leg.color] || 'Track';
        if (idx > 0 && leg.isTransfer) html += `<div class="route-transfer-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10M17 7L7 17"/></svg>Chuyển sang tuyến ${cName}</div>`;
        html += `<div class="route-leg"><div class="route-leg-header"><span class="route-leg-color" style="background:${leg.color};box-shadow:0 0 6px ${leg.color};"></span>Tuyến ${cName}</div><div class="route-leg-stations">`;
        leg.stations.forEach((st, si) => {
            let cls = 'route-stop';
            let displayName = st;
            if (si === 0 && idx === 0) {
                cls += ' route-stop-first';
                displayName = st;
            }
            if (si === leg.stations.length - 1 && idx === legs.length - 1) cls += ' route-stop-last';
            html += `<div class="${cls}">${displayName}</div>`;
        });
        html += '</div></div>';
    });
    html += '</div>';
    return html;
}

function pickRandomStations() {
    const stations = getAllStations();
    if (stations.length < 2) return null;

    // Pick two distinct random stations using modular arithmetic (no loop)
    const idx1 = Math.floor(Math.random() * stations.length);
    const idx2 = (idx1 + 1 + Math.floor(Math.random() * (stations.length - 1))) % stations.length;

    return { from: stations[idx1].key, to: stations[idx2].key };
}

function clearMeasureMarkers() {
    document.querySelectorAll('.measure-marker').forEach(el => el.remove());
}

function handleMeasureClick(gx, gy) {
    const key = `${gx},${gy}`;
    const resultDiv = document.getElementById('routeResult');
    const canvas = document.getElementById('grid-canvas');
    if (!resultDiv || !canvas) return;

    if (measureStartKey === null) {
        // Chọn điểm thứ nhất
        measureStartKey = key;
        clearMeasureMarkers();
        clearRouteHighlight();
        
        // Hiển thị marker 1
        const overlay = document.createElement('div');
        overlay.className = 'route-endpoint-overlay start measure-marker';
        overlay.style.width = `${CELL_SIZE * 2}px`;
        overlay.style.height = `${CELL_SIZE * 2}px`;
        overlay.style.left = `${(gx - 0.5) * CELL_SIZE}px`;
        overlay.style.top = `${(gy - 0.5) * CELL_SIZE}px`;
        const labelEl = document.createElement('div');
        labelEl.className = 'route-endpoint-label';
        labelEl.textContent = 'M1';
        overlay.appendChild(labelEl);
        canvas.appendChild(overlay);

        const cell = gridData.get(key);
        const name = (cell && cell.hasStation && cell.stationName) ? `Ga ${cell.stationName}` : `Tọa độ (${gx},${gy})`;
        resultDiv.innerHTML = `<div style="color:var(--text-secondary); font-size:0.8rem; font-family:monospace; padding:8px; border:1px dashed var(--border-primary); border-radius:4px; text-align:center;">📍 Đã chọn điểm 1: <strong>${name}</strong>.<br>Hãy click chọn điểm thứ 2 trên bản đồ.</div>`;
    } else {
        // Chọn điểm thứ hai
        const startKey = measureStartKey;
        const [x1, y1] = startKey.split(',').map(Number);
        const x2 = gx, y2 = gy;
        
        // Hiển thị marker 2
        const overlay = document.createElement('div');
        overlay.className = 'route-endpoint-overlay end measure-marker';
        overlay.style.width = `${CELL_SIZE * 2}px`;
        overlay.style.height = `${CELL_SIZE * 2}px`;
        overlay.style.left = `${(gx - 0.5) * CELL_SIZE}px`;
        overlay.style.top = `${(gy - 0.5) * CELL_SIZE}px`;
        const labelEl = document.createElement('div');
        labelEl.className = 'route-endpoint-label';
        labelEl.textContent = 'M2';
        overlay.appendChild(labelEl);
        canvas.appendChild(overlay);

        const cell1 = gridData.get(startKey);
        const cell2 = gridData.get(key);
        
        let html = '<div class="route-success" style="padding:10px; background:var(--route-summary-bg); border:1px solid var(--route-summary-border); border-radius:4px; font-family:monospace;">';
        html += `<div style="font-weight:800; border-bottom:1px solid var(--border-secondary); padding-bottom:6px; margin-bottom:6px; color:var(--accent-primary);">📏 KẾT QUẢ ĐO KHOẢNG CÁCH</div>`;
        
        const name1 = (cell1 && cell1.hasStation && cell1.stationName) ? `Ga ${cell1.stationName}` : `Điểm (${x1},${y1})`;
        const name2 = (cell2 && cell2.hasStation && cell2.stationName) ? `Ga ${cell2.stationName}` : `Điểm (${x2},${y2})`;
        
        html += `<div style="font-size:0.8rem; margin-bottom:8px;"><strong>Từ:</strong> ${name1}<br><strong>Đến:</strong> ${name2}</div>`;

        // Tính khoảng cách tuyến đường ray nếu cả 2 là Ga và có kết nối
        let hasTrackRoute = false;
        if (cell1 && cell1.hasStation && cell2 && cell2.hasStation) {
            const path = findRoute(startKey, key);
            if (path) {
                hasTrackRoute = true;
                highlightRoute(path);
                const metrics = calculateRouteMetrics(path);
                
                html += `<div style="font-size:0.8rem; color:var(--text-primary); margin-bottom:6px; background:rgba(34, 197, 94, 0.05); padding:6px; border:1px solid #22c55e; border-radius:2px;">`;
                html += `🛤️ <strong>Khoảng cách dọc đường ray:</strong><br>`;
                html += `• Tổng độ dài: <strong style="font-size:0.95rem; color:#22c55e;">${metrics.totalDist.toFixed(2)} km</strong><br>`;
                if (metrics.walkDist > 0) {
                    html += `  <span style="font-size:0.7rem; color:var(--text-muted);">(Tàu chạy: ${metrics.trainDist.toFixed(2)} km, đi bộ: ${metrics.walkDist.toFixed(2)} km)</span><br>`;
                }
                html += `• Thời gian di chuyển ước tính: <strong>${metrics.time} phút</strong>`;
                html += `</div>`;
            }
        }

        // Tính khoảng cách địa lý (chim bay - octile)
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const gridDist = Math.abs(dx - dy) + (Math.SQRT2) * Math.min(dx, dy);
        const distKm = gridDist * 0.25;

        html += `<div style="font-size:0.8rem; color:var(--text-secondary);">`;
        html += `🕊️ <strong>Khoảng cách địa lý (chim bay):</strong><br>`;
        html += `• Khoảng cách: <strong>${distKm.toFixed(2)} km</strong> (${Math.round(gridDist)} ô lưới)`;
        html += `</div>`;
        
        html += `<div style="font-size:0.7rem; color:var(--text-muted); border-top:1px dashed var(--border-primary); margin-top:8px; padding-top:6px; text-align:center;">`;
        html += `Click nút <strong>Đo khoảng cách</strong> lần nữa để tắt chế độ đo.`;
        html += `</div>`;
        html += '</div>';
        
        resultDiv.innerHTML = html;
        
        // Reset ga bắt đầu để đo lượt tiếp theo, nhưng vẫn giữ chế độ đo
        measureStartKey = null;
    }
}

function initRouteFinder() {
    const findBtn = document.getElementById('findRouteBtn');
    const randomBtn = document.getElementById('randomRouteBtn');
    const clearBtn = document.getElementById('clearRouteBtn');
    const swapBtn = document.getElementById('routeSwapBtn');
    const measureBtn = document.getElementById('measureBtn');
    const resultDiv = document.getElementById('routeResult');
    const fromSelect = document.getElementById('routeFrom');
    const toSelect = document.getElementById('routeTo');
    const pickFromBtn = document.getElementById('pickFromBtn');
    const pickToBtn = document.getElementById('pickToBtn');

    if (!findBtn) return;

    function updatePickModeUI() {
        document.querySelectorAll('.btn-pick').forEach(b => b.classList.remove('active'));
        viewport.classList.remove('picking-route');
        viewport.classList.remove('measuring-route');
        if (measureBtn) measureBtn.classList.remove('active');
        isMeasuringMode = false;
        measureStartKey = null;

        if (pickingRouteTarget) {
            const btnId = pickingRouteTarget === 'from' ? 'pickFromBtn' : 'pickToBtn';
            const btn = document.getElementById(btnId);
            if (btn) btn.classList.add('active');
            viewport.classList.add('picking-route');
        }
    }

    if (pickFromBtn) pickFromBtn.addEventListener('click', () => {
        pickingRouteTarget = pickingRouteTarget === 'from' ? null : 'from';
        updatePickModeUI();
    });

    if (pickToBtn) pickToBtn.addEventListener('click', () => {
        pickingRouteTarget = pickingRouteTarget === 'to' ? null : 'to';
        updatePickModeUI();
    });

    if (measureBtn) {
        measureBtn.addEventListener('click', () => {
            isMeasuringMode = !isMeasuringMode;
            measureStartKey = null;
            clearMeasureMarkers();
            clearRouteHighlight();
            
            // Hủy chế độ pick thông thường
            pickingRouteTarget = null;
            document.querySelectorAll('.btn-pick').forEach(b => b.classList.remove('active'));
            viewport.classList.remove('picking-route');
            
            if (isMeasuringMode) {
                measureBtn.classList.add('active');
                viewport.classList.add('measuring-route');
                resultDiv.innerHTML = `<div style="color:var(--text-secondary); font-size:0.8rem; font-family:monospace; padding:8px; border:1px dashed var(--border-primary); border-radius:4px; text-align:center;">📏 Đang ở chế độ đo. Hãy click chọn điểm thứ 1 trên bản đồ.</div>`;
                if (clearBtn) clearBtn.style.display = 'block';
            } else {
                measureBtn.classList.remove('active');
                viewport.classList.remove('measuring-route');
                resultDiv.innerHTML = '';
                if (clearBtn) clearBtn.style.display = 'none';
            }
        });
    }

    if (randomBtn) randomBtn.addEventListener('click', () => {
        // Hủy chế độ đo nếu đang bật
        if (isMeasuringMode) {
            if (measureBtn) measureBtn.click();
        }
        const picked = pickRandomStations();
        if (!picked) {
            resultDiv.innerHTML = '<div class="route-error">At least 2 stations are needed to use this feature.</div>';
            return;
        }
        fromSelect.value = picked.from;
        toSelect.value = picked.to;
        syncSelectColor(fromSelect);
        syncSelectColor(toSelect);
        findBtn.click(); // Trigger search immediately
    });

    findBtn.addEventListener('click', () => {
        // Hủy chế độ đo nếu đang bật
        if (isMeasuringMode) {
            if (measureBtn) measureBtn.click();
        }
        const fk = fromSelect.value, tk = toSelect.value;
        if (!fk || !tk) { resultDiv.innerHTML = '<div class="route-error">Please select both a departure and a destination station.</div>'; return; }
        if (fk === tk) { resultDiv.innerHTML = '<div class="route-error">Departure and destination stations are the same!</div>'; return; }
        const path = findRoute(fk, tk);
        if (!path) { resultDiv.innerHTML = '<div class="route-error">No route found between these two stations.</div>'; clearRouteHighlight(); clearBtn.style.display = 'none'; return; }
        resultDiv.innerHTML = renderRouteResult(path); highlightRoute(path); clearBtn.style.display = 'block';
    });
    if (clearBtn) clearBtn.addEventListener('click', () => {
        clearRouteHighlight();
        clearMeasureMarkers();
        isMeasuringMode = false;
        measureStartKey = null;
        if (measureBtn) measureBtn.classList.remove('active');
        viewport.classList.remove('measuring-route');
        resultDiv.innerHTML = '';
        clearBtn.style.display = 'none';
    });
    if (swapBtn) swapBtn.addEventListener('click', () => {
        const tmp = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = tmp;
        syncSelectColor(fromSelect);
        syncSelectColor(toSelect);
        
        // Auto-refresh route if a route was already being shown
        if (resultDiv.children.length > 0 && !resultDiv.querySelector('.route-error')) {
            findBtn.click();
        }
    });

    fromSelect.addEventListener('change', () => syncSelectColor(fromSelect));
    toSelect.addEventListener('change', () => syncSelectColor(toSelect));

    initColorExcludePalette();
}

function initColorExcludePalette() {
    const palette = document.getElementById('routeExcludePalette');
    if (!palette) return;

    function render() {
        palette.innerHTML = '';
        METRO_COLORS.forEach(color => {
            const btn = document.createElement('div');
            btn.className = 'color-exclude-btn';
            btn.style.backgroundColor = color;
            const isExcluded = excludedColors.has(color);
            if (isExcluded) {
                btn.classList.add('excluded');
            } else {
                btn.classList.add('active');
            }
            btn.title = isExcluded ? `Include ${colorNames[color]} Line` : `Exclude ${colorNames[color]} Line`;

            btn.addEventListener('click', () => {
                if (excludedColors.has(color)) {
                    excludedColors.delete(color);
                } else {
                    excludedColors.add(color);
                }
                clearGraphCache();
                render();
            });
            palette.appendChild(btn);
        });
    }
    render();
}