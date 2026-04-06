// Application Entry Point
// This file initializes all modules and sets up the global environment.

document.addEventListener('DOMContentLoaded', () => {
    // Basic setup
    initApp();
    initRouteFinder();
    initRefImage();
    initKeyboard();
    
    // UI Event Listeners for main buttons
    document.getElementById('clearBtn').addEventListener('click', clearBoard);
    document.getElementById('saveMapBtn').addEventListener('click', saveMapToFile);
    document.getElementById('loadMapBtn').addEventListener('click', () => document.getElementById('loadMapFile').click());
    document.getElementById('loadMapFile').addEventListener('change', (e) => {
        const file = e.target.files[0]; if (file) loadMapFromFile(file); e.target.value = '';
    });

    // Initialize track table based on loaded map (if any)
    updateTrackTable();
});