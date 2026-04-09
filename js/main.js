// ======= MAIN APPLICATION INITIALIZATION =======
// Dependencies: All other modules

function initApp() {
    initToolbar();
    initViewport();
    const rect = viewport.getBoundingClientRect();
    cameraX = rect.width / 2;
    cameraY = rect.height / 2;
    updateTransform();
    loadMapFromUrl('chicago.json').catch(e => console.log('No default map', e));
}

// Initialize everything
initApp();
initRouteFinder();
