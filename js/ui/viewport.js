// ======= VIEWPORT =======
// Dependencies: constants.js, state.js, cells.js, drawing.js (for commitLine), preview.js (for updatePreview)

function initViewport() {
    initRefImage();
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
                    if (typeof syncSelectColor === 'function') syncSelectColor(sel);
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

function updateTransform() {
    const t = `translate(${cameraX}px, ${cameraY}px) scale(${cameraZoom})`;
    canvas.style.transform = t; previewCanvas.style.transform = t;
    const s = CELL_SIZE * cameraZoom;
    viewport.style.backgroundSize = `${s}px ${s}px`;
    viewport.style.backgroundPosition = `${cameraX}px ${cameraY}px`;
}

function getGridCoords(clientX, clientY) {
    const rect = viewport.getBoundingClientRect();
    return {
        gx: Math.floor((clientX - rect.left - cameraX) / (CELL_SIZE * cameraZoom)),
        gy: Math.floor((clientY - rect.top - cameraY) / (CELL_SIZE * cameraZoom))
    };
}

function getDefaultAutoType(dx, dy) {
    let adx = Math.abs(dx), ady = Math.abs(dy);
    if (adx === 0 && ady === 0) return 1;
    if (adx > 2 * ady) return 1;
    if (ady > 2 * adx) return 2;
    return Math.sign(dx) === Math.sign(dy) ? 7 : 8;
}

function updateRefTransform() {
    refImage.style.transform = `translate(${refImgX}px, ${refImgY}px) scale(${refImgScale})`;
    refImage.style.opacity = refImgOpacity;
}

// ======= REFERENCE IMAGE =======
function initRefImage() {
    const uploadInput = document.getElementById('refUpload');
    if (uploadInput) {
        uploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => { refImage.src = ev.target.result; refImage.style.display = 'block'; updateRefTransform(); };
            reader.readAsDataURL(file);
        });
    }

    const opacityInput = document.getElementById('refOpacity');
    if (opacityInput) {
        opacityInput.addEventListener('input', (e) => { refImgOpacity = e.target.value / 100; refImage.style.opacity = refImgOpacity; });
    }

    const scaleInput = document.getElementById('refScale');
    if (scaleInput) {
        scaleInput.addEventListener('input', (e) => { refImgScale = e.target.value / 100; updateRefTransform(); });
    }

    const toggleMove = document.getElementById('toggleMoveRef');
    if (toggleMove) {
        toggleMove.addEventListener('click', (e) => { isMoveRefMode = !isMoveRefMode; e.target.classList.toggle('active', isMoveRefMode); });
    }
}
