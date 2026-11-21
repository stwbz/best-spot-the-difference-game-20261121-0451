// TWIN TIDES — Spot the Difference. Every tuning number, colour, panel
// geometry and difference definition in one place. The playfield is a fixed
// 1280x720 logical area; the renderer scales it to the window, so no rule
// depends on the screen size. Two pictures sit side by side: the left one
// is the original cove, the right one hides the changes.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second. */
export const STEP = 1 / 60;

/** Header bar, panels and footer, in logical pixels. */
export const LAYOUT = {
  header: { x: 0, y: 0, w: 1280, h: 88 },
  leftPanel: { x: 16, y: 100, w: 608, h: 540 },
  rightPanel: { x: 656, y: 100, w: 608, h: 540 },
  footer: { x: 0, y: 652, w: 1280, h: 68 },
};

/** The scene drawn inside each panel, in panel-local coordinates. */
export const SCENE = { width: 600, height: 532 };

/** How close a click must land to a difference's centre to count. */
export const CLICK_RADIUS = 30;

/** Points for a find, and the hint's price. */
export const FIND_POINTS = 100;
export const HINTS_PER_SET = 3;
export const HINT_TIME_COST = 15;

/** Two sets of eight differences on the same cove. Set 1 is the fair,
 * easy set; set 2 hides subtler changes and runs on a shorter clock. */
export const SETS = [
  { name: 'Set 1 · Tide Cove', seconds: 300, diffs: ['lamp', 'sail', 'gulls', 'cat', 'buoy', 'window', 'fish', 'coconuts'] },
  { name: 'Set 2 · Hidden Tide', seconds: 240, diffs: ['star', 'cloud', 'rope', 'stripes', 'anchor', 'shutter', 'rock', 'flag'] },
];

/**
 * Every difference the cove can hide. `at` is its centre in panel-local
 * coordinates, `label` is what the win screen names it, and `hard` is a
 * 1–3 difficulty hint shown in the dossier's outline only.
 */
export const DIFFERENCES = {
  lamp: { at: { x: 492, y: 62 }, label: 'Lighthouse lamp lit', hard: 1 },
  sail: { at: { x: 168, y: 342 }, label: 'Boat sail colour', hard: 1 },
  gulls: { at: { x: 300, y: 74 }, label: 'A seagull is missing', hard: 1 },
  cat: { at: { x: 442, y: 452 }, label: 'Cat on the dock', hard: 1 },
  buoy: { at: { x: 520, y: 392 }, label: 'Buoy colour', hard: 1 },
  window: { at: { x: 108, y: 268 }, label: 'Cottage window lit', hard: 2 },
  fish: { at: { x: 262, y: 412 }, label: 'Jumping fish', hard: 2 },
  coconuts: { at: { x: 556, y: 208 }, label: 'Palm coconuts', hard: 2 },
  star: { at: { x: 214, y: 42 }, label: 'A morning star', hard: 3 },
  cloud: { at: { x: 386, y: 58 }, label: 'A small cloud', hard: 3 },
  rope: { at: { x: 372, y: 462 }, label: 'Rope coil on the dock', hard: 3 },
  stripes: { at: { x: 492, y: 150 }, label: 'Lighthouse stripes', hard: 2 },
  anchor: { at: { x: 208, y: 392 }, label: 'Anchor on the boat', hard: 3 },
  shutter: { at: { x: 158, y: 268 }, label: 'Cottage shutter', hard: 3 },
  rock: { at: { x: 478, y: 428 }, label: 'A rock in the shallows', hard: 2 },
  flag: { at: { x: 492, y: 22 }, label: 'Lighthouse flag', hard: 2 },
};

export const PALETTE = {
  backdrop: '#0e2a3d',
  header: '#0b2231',
  headerEdge: '#1d4a63',
  panelEdge: '#f4e9c8',
  panelEdgeDim: '#9fb8c8',
  skyTop: '#6ec1f2',
  skyBottom: '#dff3ff',
  sea: '#2fa8c9',
  seaDeep: '#1d7fa6',
  sand: '#f2d8a0',
  sandDark: '#e0bd76',
  dock: '#8a5a33',
  dockDark: '#6b4423',
  lighthouse: '#fdf6e3',
  lighthouseRed: '#e5484d',
  cottage: '#fff3d6',
  cottageRoof: '#d96a4a',
  boat: '#7a4a21',
  sailRed: '#e5484d',
  sailBlue: '#3a7bd5',
  palm: '#2f9e5f',
  palmDark: '#227a46',
  text: '#f2ead8',
  muted: '#a9c6d4',
  panel: '#123246',
  panelEdgeGold: '#f5c542',
  found: '#39d98a',
  foundDark: '#1d7a4c',
  wrong: '#ff5a3c',
  hint: '#f5c542',
  danger: '#ff6b57',
  safe: '#39d98a',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'twintides.best';
