function initApp() {
    initToolbar();
    initViewport();
    const rect = viewport.getBoundingClientRect();
    cameraX = rect.width / 2;
    cameraY = rect.height / 2;
    updateTransform();
    loadMapFromUrl('chicago.json').catch(e => console.log('No default map', e));
}

function initToolbar() {
    const colorPalette = document.getElementById('colorPalette');
    METRO_COLORS.forEach((color, i) => {
        const btn = document.createElement('div');
        btn.className = `color-btn ${color === selectedColor ? 'active' : ''}`;
        btn.style.backgroundColor = color;
        btn.style.boxShadow = color === selectedColor ? `0 0 15px ${color}A0` : '';
        btn.title = `Shortcut: ${i + 1}`;
        btn.addEventListener('click', () => {
            selectedColor = color;
            document.querySelectorAll('.color-btn').forEach(b => { b.classList.remove('active'); b.style.boxShadow = ''; });
            btn.classList.add('active');
            btn.style.boxShadow = `0 0 15px ${color}A0`;
        });
        colorPalette.appendChild(btn);
    });

    const trackPalette = document.getElementById('trackPalette');
    if (!trackPalette) return;
    trackPalette.innerHTML = '';
    
    const groups = {
        tools: { title: 'Tools', items: [] },
        basic: { title: 'Basic Tracks', items: [] },
        diag: { title: 'Diagonals & Corners', items: [] },
        complex: { title: 'Intersections', items: [] }
    };

    TRACK_TYPES.forEach((track, index) => {
        let cat = 'basic';
        if (['empty', 'auto', 'station', 'transfer', 'pan', 'oneway'].includes(track.type)) cat = 'tools';
        else if (track.type.startsWith('diag') || track.type.startsWith('fill') || track.type.startsWith('straight-diag')) cat = 'diag';
        else if (track.type.startsWith('cross') || track.type.startsWith('t-')) cat = 'complex';
        
        groups[cat].items.push({ track, index });
    });

    for (let g in groups) {
        if (groups[g].items.length === 0) continue;
        const groupEl = document.createElement('div');
        groupEl.className = 'track-group';
        
        const titleEl = document.createElement('h4');
        titleEl.textContent = groups[g].title;
        groupEl.appendChild(titleEl);

        const gridEl = document.createElement('div');
        gridEl.className = 'track-grid';
        if (g === 'tools') gridEl.classList.add('tools-grid');

        groups[g].items.forEach(item => {
            const index = item.index;
            const track = item.track;
            const btn = document.createElement('div');
            btn.className = `track-btn ${index === selectedTrackType ? 'active' : ''}`;
            btn.title = track.type;

            if (track.type === 'empty') {
                btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20H7L3 16C2.5 15.5 2.5 14.5 3 14L13 4C13.5 3.5 14.5 3.5 15 4L20 9C20.5 9.5 20.5 10.5 20 11L11 20"/><line x1="16" y1="15" x2="21" y2="20"/></svg> Eraser (E)`;
            } else if (track.type === 'auto') {
                btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg> Magic Tool (M)`;
            } else if (track.type === 'station') {
                btn.innerHTML = `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="10" fill="white" stroke="#38bdf8" stroke-width="6" /></svg> Station (S)`;
            } else if (track.type === 'transfer') {
                btn.innerHTML = `<svg viewBox="0 0 40 40"><rect x="10" y="16" width="20" height="8" fill="white" stroke="#38bdf8" stroke-width="2" /><line x1="5" y1="20" x2="35" y2="20" stroke="white" stroke-width="6" stroke-dasharray="4,4" /><line x1="5" y1="20" x2="35" y2="20" stroke="black" stroke-width="4" stroke-dasharray="2,6" /></svg> Connect (T)`;
            } else if (track.type === 'pan') {
                btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M19 9l3 3-3 3M9 19l3 3-3-3M2 12h20M12 2v20"/></svg> Move (V)`;
            } else if (track.type === 'oneway') {
                btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg> One-Way (O)`;
            } else {
                btn.innerHTML = `<svg viewBox="0 0 40 40">${track.html}</svg>`;
            }

            btn.addEventListener('click', () => {
                selectedTrackType = index;
                document.querySelectorAll('.track-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
            gridEl.appendChild(btn);
        });

        groupEl.appendChild(gridEl);
        trackPalette.appendChild(groupEl);
    }
}

function initViewport() {
    viewport.addEventListener('contextmenu', e => e.preventDefault());
    let isPanningModeForRef = false;

    viewport.addEventListener('mousedown', (e) => {
        if (pickingRouteTarget) {
            const { gx, gy } = getGridCoords(e.clientX, e.clientY);
            const key = `${gx},${gy}`;
            const cell = gridData.get(key);
            if (cell && cell.hasStation && cell.stationName) {
                const selectId = pickingRouteTarget === 'from' ? 'routeFrom' : 'routeTo';
                const sel = document.getElementById(selectId);
                if (Array.from(sel.options).some(opt => opt.value === key)) {
                    sel.value = key;
                }
                pickingRouteTarget = null;
                viewport.classList.remove('picking-route');
                document.querySelectorAll('.btn-pick').forEach(b => b.classList.remove('active'));
            }
            return;
        }

        const isPanTool = TRACK_TYPES[selectedTrackType] && TRACK_TYPES[selectedTrackType].type === 'pan';
        if (e.button === 1 || e.button === 2 || (e.button === 0 && isPanTool)) {
            isPanning = true; lastMouseX = e.clientX; lastMouseY = e.clientY;
            viewport.classList.add('panning');
        } else if (e.button === 0) {
            if (isMoveRefMode || e.shiftKey) {
                isPanningModeForRef = true; lastMouseX = e.clientX; lastMouseY = e.clientY;
            } else {
                isDrawing = true;
                const { gx, gy } = getGridCoords(e.clientX, e.clientY);
                startGX = gx; startGY = gy; currentGX = gx; currentGY = gy;
                updatePreview();
            }
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (isPanning) {
            cameraX += e.clientX - lastMouseX; cameraY += e.clientY - lastMouseY;
            lastMouseX = e.clientX; lastMouseY = e.clientY; updateTransform();
        } else if (isPanningModeForRef) {
            refImgX += (e.clientX - lastMouseX) / cameraZoom;
            refImgY += (e.clientY - lastMouseY) / cameraZoom;
            lastMouseX = e.clientX; lastMouseY = e.clientY; updateRefTransform();
        } else if (isDrawing) {
            const { gx, gy } = getGridCoords(e.clientX, e.clientY);
            if (gx !== currentGX || gy !== currentGY) { currentGX = gx; currentGY = gy; updatePreview(); }
        }
        const { gx, gy } = getGridCoords(e.clientX, e.clientY);
        gridCursorHighlight.style.transform = `translate(${gx * CELL_SIZE}px, ${gy * CELL_SIZE}px)`;
    });

    window.addEventListener('mouseup', () => {
        if (isDrawing) { commitLine(); isDrawing = false; previewCanvas.innerHTML = ''; }
        isPanning = false; isPanningModeForRef = false; viewport.classList.remove('panning');
    });

    viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect = viewport.getBoundingClientRect();
        const mouseX = e.clientX - rect.left, mouseY = e.clientY - rect.top;
        const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
        let newZoom = Math.max(0.2, Math.min(cameraZoom * zoomDelta, 3));
        const gx = (mouseX - cameraX) / cameraZoom, gy = (mouseY - cameraY) / cameraZoom;
        cameraX = mouseX - gx * newZoom; cameraY = mouseY - gy * newZoom; cameraZoom = newZoom;
        updateTransform();
    }, { passive: false });
}

function initRouteFinder() {
    const findBtn = document.getElementById('findRouteBtn');
    const clearBtn = document.getElementById('clearRouteBtn');
    const swapBtn = document.getElementById('routeSwapBtn');
    const resultDiv = document.getElementById('routeResult');
    const fromSelect = document.getElementById('routeFrom');
    const toSelect = document.getElementById('routeTo');
    const pickFromBtn = document.getElementById('pickFromBtn');
    const pickToBtn = document.getElementById('pickToBtn');
    
    if (!findBtn) return;

    function updatePickModeUI() {
        document.querySelectorAll('.btn-pick').forEach(b => b.classList.remove('active'));
        viewport.classList.remove('picking-route');
        if (pickingRouteTarget) {
            document.getElementById(pickingRouteTarget === 'from' ? 'pickFromBtn' : 'pickToBtn').classList.add('active');
            viewport.classList.add('picking-route');
        }
    }

    pickFromBtn.addEventListener('click', () => {
        pickingRouteTarget = pickingRouteTarget === 'from' ? null : 'from';
        updatePickModeUI();
    });

    pickToBtn.addEventListener('click', () => {
        pickingRouteTarget = pickingRouteTarget === 'to' ? null : 'to';
        updatePickModeUI();
    });

    findBtn.addEventListener('click', () => {
        const fk = fromSelect.value, tk = toSelect.value;
        if (!fk || !tk) { resultDiv.innerHTML = '<div class="route-error">Vui lòng chọn trạm đi và trạm đến.</div>'; return; }
        if (fk === tk) { resultDiv.innerHTML = '<div class="route-error">Trạm đi và trạm đến giống nhau!</div>'; return; }
        const path = findRoute(fk, tk);
        if (!path) { resultDiv.innerHTML = '<div class="route-error">Không tìm thấy đường đi giữa hai trạm này.</div>'; clearRouteHighlight(); clearBtn.style.display = 'none'; return; }
        resultDiv.innerHTML = renderRouteResult(path); highlightRoute(path); clearBtn.style.display = 'block';
    });
    clearBtn.addEventListener('click', () => { clearRouteHighlight(); resultDiv.innerHTML = ''; clearBtn.style.display = 'none'; });
    swapBtn.addEventListener('click', () => { const tmp = fromSelect.value; fromSelect.value = toSelect.value; toSelect.value = tmp; });
}

function initRefImage() {
    document.getElementById('refUpload').addEventListener('change', (e) => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => { refImage.src = ev.target.result; refImage.style.display = 'block'; updateRefTransform(); };
        reader.readAsDataURL(file);
    });
    document.getElementById('refOpacity').addEventListener('input', (e) => { refImgOpacity = e.target.value / 100; refImage.style.opacity = refImgOpacity; });
    document.getElementById('refScale').addEventListener('input', (e) => { refImgScale = e.target.value / 100; updateRefTransform(); });
    document.getElementById('toggleMoveRef').addEventListener('click', (e) => { isMoveRefMode = !isMoveRefMode; e.target.classList.toggle('active', isMoveRefMode); });
}

function updateRefTransform() { refImage.style.transform = `translate(${refImgX}px, ${refImgY}px) scale(${refImgScale})`; refImage.style.opacity = refImgOpacity; }

function initKeyboard() {
    window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        const key = e.key.toLowerCase();
        const isCtrl = e.ctrlKey || e.metaKey;
        let newIndex = -1;
        if (isCtrl) {
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
            if (trackBtns[newIndex]) trackBtns[newIndex].classList.add('active');
        }
    });
}
