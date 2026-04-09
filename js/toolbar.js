// ======= TOOLBAR INITIALIZATION =======
// Dependencies: constants.js, state.js

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
