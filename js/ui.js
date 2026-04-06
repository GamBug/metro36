function createCellDOM(gx, gy, layers, hasStation, stationName) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.style.width = `${CELL_SIZE}px`;
    cell.style.height = `${CELL_SIZE}px`;
    cell.style.left = `${gx * CELL_SIZE}px`;
    cell.style.top = `${gy * CELL_SIZE}px`;
    updateCellDOM(cell, layers, hasStation, stationName);
    return cell;
}

function updateCellDOM(cell, layers, hasStation, stationName) {
    let svgInner = '';
    const colors = Object.keys(layers);
    colors.forEach(color => {
        const layer = layers[color];
        const trackDef = TRACK_TYPES[layer.type];
        if (trackDef && trackDef.html) {
            svgInner += `<g style="color:${color}">${trackDef.html}</g>`;
            if (layer.direction != null) {
                let angle = 0;
                switch(layer.direction) {
                    case 0: angle = -90; break;
                    case 1: angle = -45; break;
                    case 2: angle = 0; break;
                    case 3: angle = 45; break;
                    case 4: angle = 90; break;
                    case 5: angle = 135; break;
                    case 6: angle = 180; break;
                    case 7: angle = -135; break;
                }
                svgInner += `<use href="#track-oneway-arrow" transform="rotate(${angle} 20 20)" style="color:${color}" />`;
            }
        }
    });
    // Station circle: use first layer color or default
    const stationColor = colors[0] || '#94a3b8';
    if (hasStation) {
        svgInner += `<circle cx="20" cy="20" r="10" fill="white" stroke="${stationColor}" stroke-width="6" />`;
    }
    let html = `<svg class="track-svg" viewBox="0 0 40 40" overflow="visible">${svgInner}</svg>`;
    if (hasStation && stationName) {
        html += `<div class="station-label">${stationName}</div>`;
    }
    cell.innerHTML = html;
}

function cellFirstColor(cell) {
    const keys = Object.keys(cell.layers);
    return keys.length > 0 ? keys[0] : '#94a3b8';
}

function renderConnections() {
    const layer = document.getElementById('connections-layer');
    if (!layer) return;
    layer.innerHTML = '';
    connections.forEach(conn => {
        const [fx, fy] = conn.from.split(',').map(Number);
        const [tx, ty] = conn.to.split(',').map(Number);
        const cx1 = fx * CELL_SIZE + CELL_SIZE / 2 + 10000, cy1 = fy * CELL_SIZE + CELL_SIZE / 2 + 10000;
        const cx2 = tx * CELL_SIZE + CELL_SIZE / 2 + 10000, cy2 = ty * CELL_SIZE + CELL_SIZE / 2 + 10000;
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        bg.setAttribute('x1', cx1); bg.setAttribute('y1', cy1); bg.setAttribute('x2', cx2); bg.setAttribute('y2', cy2);
        bg.setAttribute('stroke', '#000'); bg.setAttribute('stroke-width', '10'); bg.setAttribute('stroke-linecap', 'round');
        const fg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        fg.setAttribute('x1', cx1); fg.setAttribute('y1', cy1); fg.setAttribute('x2', cx2); fg.setAttribute('y2', cy2);
        fg.setAttribute('stroke', '#fff'); fg.setAttribute('stroke-width', '8'); fg.setAttribute('stroke-linecap', 'round');
        fg.setAttribute('stroke-dasharray', '10,12');
        layer.appendChild(bg); layer.appendChild(fg);
    });
}
