// ======= GLOBAL STATE =======
// Dependencies: constants.js

// Core Application State
let selectedColor = METRO_COLORS[0];
let selectedTrackType = 29; // Default to Move (pan) tool
const excludedColors = new Set();

// gridData: key="x,y", value={ layers:{color:{type,isAuto}}, hasStation, stationName, domNode }
const gridData = new Map();
let connections = [];
let transferStartKey = null;

// History
const undoStack = [];
const redoStack = [];
const MAX_HISTORY = 100;

// Viewport elements
const viewport = document.getElementById('grid-viewport');
const canvas = document.getElementById('grid-canvas');
let cameraX = 0, cameraY = 0, cameraZoom = 0.13;
let isDrawing = false, isPanning = false;
let startGX = 0, startGY = 0, currentGX = 0, currentGY = 0;
let lastMouseX = 0, lastMouseY = 0;
let refImgX = 0, refImgY = 0, refImgScale = 1, refImgOpacity = 0.5, isMoveRefMode = false;

const previewCanvas = document.getElementById('grid-preview');
const refImage = document.getElementById('ref-image');
const gridCursorHighlight = document.getElementById('grid-cursor-highlight');

let pickingRouteTarget = null;
let isMeasuringMode = false;
let measureStartKey = null;
