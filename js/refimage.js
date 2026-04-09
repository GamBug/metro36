// ======= REFERENCE IMAGE =======
// Dependencies: state.js, viewport.js (for updateRefTransform)

document.getElementById('refUpload').addEventListener('change', (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { refImage.src = ev.target.result; refImage.style.display = 'block'; updateRefTransform(); };
    reader.readAsDataURL(file);
});

document.getElementById('refOpacity').addEventListener('input', (e) => { refImgOpacity = e.target.value / 100; refImage.style.opacity = refImgOpacity; });

document.getElementById('refScale').addEventListener('input', (e) => { refImgScale = e.target.value / 100; updateRefTransform(); });

document.getElementById('toggleMoveRef').addEventListener('click', (e) => { isMoveRefMode = !isMoveRefMode; e.target.classList.toggle('active', isMoveRefMode); });
