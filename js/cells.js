// ======= CELL DOM (Multi-Layer) =======
// Dependencies: constants.js, state.js

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
            svgInner += `<g class="track-layer" style="color:${color}" data-color="${color}">${trackDef.html}</g>`;
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

// Helper: get first color of a cell (for backward compat)
function cellFirstColor(cell) {
    const keys = Object.keys(cell.layers);
    return keys.length > 0 ? keys[0] : '#94a3b8';
}
