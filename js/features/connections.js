// ======= CONNECTIONS =======
// Dependencies: constants.js, state.js, cells.js, history.js, tracktable.js

function renderConnections() {
    const layer = document.getElementById('connections-layer');
    if (!layer) return;
    layer.innerHTML = '';
    sanitizeConnections(connections).forEach(conn => {
        const [fx, fy] = conn.from.split(',').map(Number);
        const [tx, ty] = conn.to.split(',').map(Number);
        const cx1 = fx * CELL_SIZE + CELL_SIZE / 2 + 10000, cy1 = fy * CELL_SIZE + CELL_SIZE / 2 + 10000;
        const cx2 = tx * CELL_SIZE + CELL_SIZE / 2 + 10000, cy2 = ty * CELL_SIZE + CELL_SIZE / 2 + 10000;
        const connKey = `conn-${conn.from}-${conn.to}`;
        const connKeyRev = `conn-${conn.to}-${conn.from}`;
        
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        bg.setAttribute('x1', cx1); bg.setAttribute('y1', cy1); bg.setAttribute('x2', cx2); bg.setAttribute('y2', cy2);
        bg.setAttribute('stroke', '#000'); bg.setAttribute('stroke-width', '10'); bg.setAttribute('stroke-linecap', 'round');
        bg.classList.add('connection-line', connKey, connKeyRev);
        
        const fg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        fg.setAttribute('x1', cx1); fg.setAttribute('y1', cy1); fg.setAttribute('x2', cx2); fg.setAttribute('y2', cy2);
        fg.setAttribute('stroke', '#fff'); fg.setAttribute('stroke-width', '8'); fg.setAttribute('stroke-linecap', 'round');
        fg.setAttribute('stroke-dasharray', '10,12');
        fg.classList.add('connection-line', connKey, connKeyRev);
        
        layer.appendChild(bg); layer.appendChild(fg);
    });
}

function clearBoard() {
    if (!canEditMap()) return;
    if (gridData.size === 0 && connections.length === 0) return;
    if (!confirm('Clear the entire board? This action can be undone with Ctrl+Z.')) return;
    saveState();
    gridData.forEach(cell => cell.domNode.remove());
    gridData.clear(); connections = []; transferStartKey = null;
    clearGraphCache(); // Invalidate route cache
    renderConnections();
    if (typeof updateTrackTable === 'function') updateTrackTable();
}

document.getElementById('clearBtn').addEventListener('click', clearBoard);
