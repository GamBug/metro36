// ======= SECURITY / VALIDATION HELPERS =======
// Client-side checks protect app state and imports. They are not a substitute for server-side auth.

const MAP_LIMITS = {
    maxFileBytes: 10 * 1024 * 1024,
    maxGridCells: 50000,
    maxConnections: 50000,
    maxCoordinateAbs: 100000,
    maxStationNameLength: 120,
    maxRefDataUrlLength: 5 * 1024 * 1024
};

const GRID_KEY_RE = /^-?\d+,-?\d+$/;
const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;

function isAdminMode() {
    return sessionStorage.getItem('metro_auth') === 'true' && sessionStorage.getItem('metro_role') === 'admin';
}

function isGuestMode() {
    return sessionStorage.getItem('metro_role') === 'guest';
}

function canEditMap() {
    return isAdminMode();
}

function isValidGridKey(key) {
    if (typeof key !== 'string' || !GRID_KEY_RE.test(key)) return false;
    const [x, y] = key.split(',').map(Number);
    return Number.isInteger(x) &&
        Number.isInteger(y) &&
        Math.abs(x) <= MAP_LIMITS.maxCoordinateAbs &&
        Math.abs(y) <= MAP_LIMITS.maxCoordinateAbs;
}

function sanitizeStationName(name) {
    if (name === null || name === undefined) return null;
    return String(name).replace(/\s+/g, ' ').trim().slice(0, MAP_LIMITS.maxStationNameLength) || null;
}

function isSafeMetroColor(color) {
    return typeof color === 'string' && (METRO_COLORS.includes(color) || HEX_COLOR_RE.test(color));
}

function sanitizeLayer(layer) {
    if (!layer || typeof layer !== 'object') return null;
    const type = Number(layer.type);
    if (!Number.isInteger(type) || type < 0 || type >= TRACK_TYPES.length) return null;
    const direction = layer.direction === null || layer.direction === undefined ? null : Number(layer.direction);
    return {
        type,
        isAuto: Boolean(layer.isAuto),
        direction: Number.isInteger(direction) && direction >= 0 && direction <= 7 ? direction : null
    };
}

function sanitizeLayers(layers) {
    const sanitized = {};
    if (!layers || typeof layers !== 'object' || Array.isArray(layers)) return sanitized;
    for (const color in layers) {
        if (!isSafeMetroColor(color)) {
            console.warn(`[Security] Blocked invalid color key: ${color}`);
            continue;
        }
        const layer = sanitizeLayer(layers[color]);
        if (layer) sanitized[color] = layer;
    }
    return sanitized;
}

function clampNumber(value, fallback, min, max) {
    const num = Number(value);
    if (!Number.isFinite(num)) return fallback;
    return Math.min(max, Math.max(min, num));
}

function sanitizeRefImageSrc(src) {
    if (typeof src !== 'string' || src.length === 0) return '';
    if (src === 'chicago.jpg' || src.endsWith('/chicago.jpg')) return 'chicago.jpg';
    if (src.startsWith('data:image/') && !src.startsWith('data:image/svg+xml') && src.length <= MAP_LIMITS.maxRefDataUrlLength) return src;
    console.warn('[Security] Blocked unsafe reference image source');
    return '';
}

function getSerializableRefImageSrc(src) {
    return sanitizeRefImageSrc(src);
}

function sanitizeConnection(conn) {
    if (!conn || typeof conn !== 'object') return null;
    if (!isValidGridKey(conn.from) || !isValidGridKey(conn.to) || conn.from === conn.to) return null;
    return { from: conn.from, to: conn.to };
}

function sanitizeConnections(rawConnections) {
    if (!Array.isArray(rawConnections)) return [];
    const seen = new Set();
    const sanitized = [];
    rawConnections.slice(0, MAP_LIMITS.maxConnections).forEach(conn => {
        const clean = sanitizeConnection(conn);
        if (!clean) return;
        if (!gridData.has(clean.from) || !gridData.has(clean.to)) return;
        const fromCell = gridData.get(clean.from);
        const toCell = gridData.get(clean.to);
        if (!fromCell.hasStation || !toCell.hasStation) return;
        const dedupeKey = [clean.from, clean.to].sort().join('|');
        if (seen.has(dedupeKey)) return;
        seen.add(dedupeKey);
        sanitized.push(clean);
    });
    return sanitized;
}
