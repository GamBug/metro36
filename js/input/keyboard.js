// ======= KEYBOARD SHORTCUTS =======
// Dependencies: constants.js, state.js, history.js, fileio.js, drawing.js (for isDrawing, previewCanvas)

window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    const isGuest = sessionStorage.getItem('metro_role') === 'guest';
    const key = e.key.toLowerCase();
    const isCtrl = e.ctrlKey || e.metaKey;
    let newIndex = -1;
    if (isCtrl) {
        if (isGuest) return; // Block all Ctrl shortcuts for guests
        if (key === 's') { e.preventDefault(); saveMapToFile(); }
        else if (key === 'o') { e.preventDefault(); document.getElementById('loadMapFile').click(); }
        else if (key === 'e') { e.preventDefault(); clearBoard(); }
        else if (key === 'z') { e.preventDefault(); undo(); }
        else if (key === 'y') { e.preventDefault(); redo(); }
        return;
    }
    if (key >= '1' && key <= '8') {
        const colorIndex = parseInt(key) - 1;
        if (colorIndex < METRO_COLORS.length) {
            document.querySelectorAll('.color-btn')[colorIndex].click();
        }
        return;
    }
    if (key === 'enter') {
        const findBtn = document.getElementById('findRouteBtn');
        if (findBtn) findBtn.click();
        return;
    }
    // Block all tool shortcuts for guests
    if (isGuest) return;
    if (key === 'e') newIndex = TRACK_TYPES.findIndex(t => t.type === 'empty');
    else if (key === 'm') newIndex = TRACK_TYPES.findIndex(t => t.type === 'auto');
    else if (key === 's') newIndex = TRACK_TYPES.findIndex(t => t.type === 'station');
    else if (key === 't') newIndex = TRACK_TYPES.findIndex(t => t.type === 'transfer');
    else if (key === 'v') newIndex = TRACK_TYPES.findIndex(t => t.type === 'pan');
    else if (key === 'o') newIndex = TRACK_TYPES.findIndex(t => t.type === 'oneway');
    if (newIndex !== -1) {
        if (isDrawing) { isDrawing = false; previewCanvas.innerHTML = ''; }
        if (transferStartKey && gridData.has(transferStartKey)) gridData.get(transferStartKey).domNode.classList.remove('station-selected');
        transferStartKey = null;
        selectedTrackType = newIndex;
        const trackBtns = document.querySelectorAll('.track-btn');
        trackBtns.forEach(btn => btn.classList.remove('active'));
        const targetBtn = document.querySelector(`.track-btn[data-track-index="${newIndex}"]`);
        if (targetBtn) targetBtn.classList.add('active');
    }
});
