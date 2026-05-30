// ======= VIEWPORT =======
// Dependencies: constants.js, state.js, cells.js, drawing.js (for commitLine), preview.js (for updatePreview)

// ======= VIEWPORT =======
// Dependencies: constants.js, state.js, cells.js, drawing.js (for commitLine), preview.js (for updatePreview)

function initViewport() {
    initRefImage();
    if (typeof updateRefTransform === 'function') updateRefTransform();
    viewport.addEventListener('contextmenu', e => e.preventDefault());
    let isPanningModeForRef = false;

    viewport.addEventListener('mousedown', (e) => {
        const { gx, gy } = getGridCoords(e.clientX, e.clientY);

        if (isMeasuringMode) {
            if (e.button === 0) {
                if (typeof handleMeasureClick === 'function') {
                    handleMeasureClick(gx, gy);
                }
            }
            return;
        }

        if (pickingRouteTarget) {
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
            if (!canEditMap()) return;
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
        zoomAtViewportPoint(mouseX, mouseY, zoomDelta);
    }, { passive: false });

    initZoomControls();
}

function updateTransform() {
    const t = `translate(${cameraX}px, ${cameraY}px) scale(${cameraZoom})`;
    canvas.style.transform = t; previewCanvas.style.transform = t;
    const s = CELL_SIZE * cameraZoom;
    viewport.style.backgroundSize = `${s}px ${s}px`;
    viewport.style.backgroundPosition = `${cameraX}px ${cameraY}px`;
}

function zoomAtViewportPoint(viewportX, viewportY, zoomDelta) {
    const newZoom = Math.max(0.13, Math.min(cameraZoom * zoomDelta, 3));
    const gx = (viewportX - cameraX) / cameraZoom;
    const gy = (viewportY - cameraY) / cameraZoom;
    cameraX = viewportX - gx * newZoom;
    cameraY = viewportY - gy * newZoom;
    cameraZoom = newZoom;
    updateTransform();
}

function zoomAtViewportCenter(zoomDelta) {
    const rect = viewport.getBoundingClientRect();
    zoomAtViewportPoint(rect.width / 2, rect.height / 2, zoomDelta);
}

function initZoomControls() {
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => zoomAtViewportCenter(1.15));
    }
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => zoomAtViewportCenter(1 / 1.15));
    }
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
    const uploadBtn = document.getElementById('refUploadBtn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            if (canEditMap() && uploadInput) uploadInput.click();
        });
    }
    if (uploadInput) {
        uploadInput.addEventListener('change', (e) => {
            if (!canEditMap()) return;
            const file = e.target.files[0]; if (!file) return;
            if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.size > MAP_LIMITS.maxRefDataUrlLength) {
                alert('Reference image is too large or is not an image.');
                e.target.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => { refImage.src = ev.target.result; refImage.style.display = 'block'; updateRefTransform(); };
            reader.readAsDataURL(file);
        });
    }

    const opacityInput = document.getElementById('refOpacity');
    if (opacityInput) {
        opacityInput.addEventListener('input', (e) => {
            if (!canEditMap()) return;
            refImgOpacity = clampNumber(e.target.value / 100, 0.5, 0, 1);
            refImage.style.opacity = refImgOpacity;
        });
    }

    const scaleInput = document.getElementById('refScale');
    if (scaleInput) {
        scaleInput.addEventListener('input', (e) => {
            if (!canEditMap()) return;
            refImgScale = clampNumber(e.target.value / 100, 1, 0.01, 10);
            updateRefTransform();
        });
    }

    const toggleMove = document.getElementById('toggleMoveRef');
    if (toggleMove) {
        toggleMove.addEventListener('click', (e) => {
            if (!canEditMap()) return;
            isMoveRefMode = !isMoveRefMode;
            e.target.classList.toggle('active', isMoveRefMode);
        });
    }
}

function centerCameraOnMap() {
    if (gridData.size === 0) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    gridData.forEach((cell, key) => {
        const [gx, gy] = key.split(',').map(Number);
        if (gx < minX) minX = gx; if (gx > maxX) maxX = gx;
        if (gy < minY) minY = gy; if (gy > maxY) maxY = gy;
    });
    const midX = (minX + maxX) / 2 + 0.5;
    const midY = (minY + maxY) / 2 + 0.5;
    const rect = viewport.getBoundingClientRect();
    cameraX = (rect.width / 2) - (midX * CELL_SIZE) * cameraZoom;
    cameraY = (rect.height / 2) - (midY * CELL_SIZE) * cameraZoom;
    updateTransform();
}
