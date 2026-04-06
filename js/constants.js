const CELL_SIZE = 40;

const TRACK_TYPES = [
    { type: 'empty', html: '' },
    { type: 'horiz', html: '<use href="#track-horiz" />' },
    { type: 'vert', html: '<use href="#track-horiz" transform="rotate(90 20 20)" />' },
    { type: 'curve-tr', html: '<use href="#track-curve" />' },
    { type: 'curve-br', html: '<use href="#track-curve" transform="rotate(90 20 20)" />' },
    { type: 'curve-bl', html: '<use href="#track-curve" transform="rotate(180 20 20)" />' },
    { type: 'curve-tl', html: '<use href="#track-curve" transform="rotate(270 20 20)" />' },
    { type: 'diag-tl-br', html: '<use href="#track-diag" />' },
    { type: 'diag-tr-bl', html: '<use href="#track-diag" transform="rotate(90 20 20)" />' },
    { type: 'straight-diag-dr', html: '<use href="#track-turn-dr" />' },
    { type: 'straight-diag-dl', html: '<use href="#track-turn-dr" transform="rotate(90 20 20)" />' },
    { type: 'straight-diag-ul', html: '<use href="#track-turn-dr" transform="rotate(180 20 20)" />' },
    { type: 'straight-diag-ur', html: '<use href="#track-turn-dr" transform="rotate(270 20 20)" />' },
    { type: 'straight-diag-ur-alt', html: '<use href="#track-turn-ur" />' },
    { type: 'straight-diag-dr-alt', html: '<use href="#track-turn-ur" transform="rotate(90 20 20)" />' },
    { type: 'straight-diag-dl-alt', html: '<use href="#track-turn-ur" transform="rotate(180 20 20)" />' },
    { type: 'straight-diag-ul-alt', html: '<use href="#track-turn-ur" transform="rotate(270 20 20)" />' },
    { type: 'fill-tl', html: '<use href="#corner-fill" />' },
    { type: 'fill-tr', html: '<use href="#corner-fill" transform="rotate(90 20 20)" />' },
    { type: 'fill-br', html: '<use href="#corner-fill" transform="rotate(180 20 20)" />' },
    { type: 'fill-bl', html: '<use href="#corner-fill" transform="rotate(270 20 20)" />' },
    { type: 'cross', html: '<use href="#track-horiz" /><use href="#track-horiz" transform="rotate(90 20 20)" />' },
    { type: 'cross-diag', html: '<use href="#track-diag" /><use href="#track-diag" transform="rotate(90 20 20)" />' },
    { type: 't-top', html: '<use href="#track-t-bot" transform="rotate(180 20 20)" />' },
    { type: 't-right', html: '<use href="#track-t-bot" transform="rotate(270 20 20)" />' },
    { type: 't-bot', html: '<use href="#track-t-bot" />' },
    { type: 't-left', html: '<use href="#track-t-bot" transform="rotate(90 20 20)" />' },
    { type: 'auto', html: '' },
    { type: 'station', html: '' },
    { type: 'pan', html: '' },
    { type: 'oneway', html: '' },
    { type: 'transfer', html: '' }
];

const AUTO_MAP = {
    "0,2": 3, "2,0": 3, "2,4": 4, "4,2": 4, "4,6": 5, "6,4": 5, "6,0": 6, "0,6": 6,
    "2,6": 1, "6,2": 1, "0,4": 2, "4,0": 2, "3,7": 7, "7,3": 7, "1,5": 8, "5,1": 8,
    "6,3": 9, "3,6": 9, "0,5": 10, "5,0": 10, "2,7": 11, "7,2": 11, "4,1": 12, "1,4": 12,
    "6,1": 13, "1,6": 13, "0,3": 14, "3,0": 14, "2,5": 15, "5,2": 15, "4,7": 16, "7,4": 16
};

const METRO_COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#0ea5e9', '#6366f1', '#ec4899', '#94a3b8'
];

const TRACK_EXITS = {
    1: [2, 6], 2: [0, 4], 3: [0, 2], 4: [2, 4], 5: [4, 6], 6: [6, 0],
    7: [3, 7], 8: [1, 5], 9: [3, 6], 10: [0, 5], 11: [2, 7], 12: [1, 4],
    13: [1, 6], 14: [0, 3], 15: [2, 5], 16: [4, 7],
    21: [0, 2, 4, 6], 22: [1, 3, 5, 7], 23: [0, 2, 6], 24: [0, 2, 4], 25: [2, 4, 6], 26: [0, 4, 6]
};

const dirOffsets = [
    {x: 0, y: -1}, {x: 1, y: -1}, {x: 1, y: 0}, {x: 1, y: 1},
    {x: 0, y: 1}, {x: -1, y: 1}, {x: -1, y: 0}, {x: -1, y: -1}
];

const colorNames = {
    '#ef4444': 'Red', '#f97316': 'Orange', '#eab308': 'Yellow', '#22c55e': 'Green',
    '#0ea5e9': 'Blue', '#6366f1': 'Indigo', '#ec4899': 'Pink', '#94a3b8': 'Silver'
};
