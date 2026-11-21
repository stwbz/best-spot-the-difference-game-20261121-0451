// All drawing: the header with its counter, timer and score, the two
// panels with their markers, and the title / pause / set-done / win /
// game-over screens. The scene itself lives in scene.js.

import { DIFFERENCES, FONT, LAYOUT, PALETTE, SETS } from './config.js';
import { changedForSet, drawScene } from './scene.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_SET_DONE = 'setdone';
export const SCREEN_WIN = 'win';
export const SCREEN_OVER = 'over';

function pill(ctx, x, y, w, h, text, fill, colour) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 9);
  ctx.fill();
  ctx.fillStyle = colour;
  ctx.font = `700 17px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + w / 2, y + h / 2 + 1);
}

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function drawMarker(ctx, x, y, radius, colour, pulse) {
  const r = radius * (pulse ? 1 + 0.12 * Math.sin(performance.now() / 180) : 1);
  ctx.strokeStyle = colour;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawCheck(ctx, x, y, colour) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 8, y);
  ctx.lineTo(x - 2, y + 7);
  ctx.lineTo(x + 9, y - 7);
  ctx.stroke();
}

function drawPanel(ctx, panel, altered, world, screen) {
  const { x, y, w, h } = panel;
  ctx.fillStyle = PALETTE.panelEdge;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#0e2a3d';
  ctx.fillRect(x + 4, y + 4, w - 8, h - 8);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 4, y + 4, w - 8, h - 8);
  ctx.clip();
  ctx.translate(x + 4, y + 4);
  drawScene(ctx, altered ? changedForSet(world.state.setIndex) : new Set());
  ctx.restore();
  // Markers for the differences already found, on both panels alike.
  const state = world.state;
  for (const id of SETS[state.setIndex].diffs) {
    if (!state.found[id]) continue;
    const at = DIFFERENCES[id].at;
    const pulse = state.lastFound !== null && state.lastFound.id === id && state.elapsed < state.lastFound.until;
    drawMarker(ctx, x + 4 + at.x, y + 4 + at.y, 22, PALETTE.found, pulse);
    drawCheck(ctx, x + 4 + at.x, y + 4 + at.y, PALETTE.found);
  }
  // A spent hint rings one unfound difference in amber on both panels.
  if (state.hintAt !== null && state.elapsed < state.hintAt.until) {
    const at = DIFFERENCES[state.hintAt.id].at;
    drawMarker(ctx, x + 4 + at.x, y + 4 + at.y, 26, PALETTE.hint, true);
  }
  // A wrong click leaves a red cross where it landed, on its own panel.
  if (state.lastWrong !== null && state.elapsed < state.lastWrong.until) {
    const wrongPanel = state.lastWrong.panel === 1 ? LAYOUT.rightPanel : LAYOUT.leftPanel;
    if (wrongPanel === panel) {
      const wx = x + 4 + state.lastWrong.x;
      const wy = y + 4 + state.lastWrong.y;
      ctx.strokeStyle = PALETTE.wrong;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(wx - 12, wy - 12);
      ctx.lineTo(wx + 12, wy + 12);
      ctx.moveTo(wx + 12, wy - 12);
      ctx.lineTo(wx - 12, wy + 12);
      ctx.stroke();
    }
  }
  // Panel label, readable at a glance when the shot is shrunk.
  ctx.fillStyle = 'rgba(11,34,49,0.85)';
  ctx.beginPath();
  ctx.roundRect(x + 12, y + 12, altered ? 150 : 118, 30, 8);
  ctx.fill();
  ctx.fillStyle = PALETTE.text;
  ctx.font = `700 16px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(altered ? 'B · CHANGED' : 'A · ORIGINAL', x + 24, y + 28);
  void screen;
}

function drawOverlay(ctx, lines, accent) {
  ctx.fillStyle = 'rgba(7,20,30,0.72)';
  ctx.fillRect(0, 0, 1280, 720);
  ctx.textAlign = 'center';
  let y = 210;
  for (const line of lines) {
    ctx.fillStyle = line.colour ?? PALETTE.text;
    ctx.font = line.font;
    ctx.fillText(line.text, 640, y);
    y += line.gap;
  }
  void accent;
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  function draw(world, screen, best) {
    const state = world.state;
    const set = SETS[state.setIndex];
    const found = world.foundCount();
    const remain = world.remainCount();
    ctx.clearRect(0, 0, 1280, 720);
    ctx.fillStyle = PALETTE.backdrop;
    ctx.fillRect(0, 0, 1280, 720);
    // Header: title on the left, the counter, clock, hints and score right.
    ctx.fillStyle = PALETTE.header;
    ctx.fillRect(0, 0, 1280, 88);
    ctx.fillStyle = PALETTE.headerEdge;
    ctx.fillRect(0, 86, 1280, 2);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `800 34px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('TWIN TIDES', 24, 34);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `400 16px ${FONT}`;
    ctx.fillText('Spot the Difference  ·  a quiet harbour hunt', 24, 66);
    pill(ctx, 560, 22, 240, 44, `FOUND ${found} / ${set.diffs.length}  ·  ${remain} REMAIN`, '#123246', found === set.diffs.length ? PALETTE.found : PALETTE.text);
    const lowTime = state.timeLeft <= 30;
    pill(ctx, 812, 22, 110, 44, `⏱ ${formatTime(state.timeLeft)}`, lowTime ? '#5a1a12' : '#123246', lowTime ? PALETTE.danger : PALETTE.text);
    pill(ctx, 934, 22, 110, 44, `HINTS ${state.hintsLeft}`, '#123246', PALETTE.text);
    pill(ctx, 1056, 22, 200, 44, `SCORE ${state.score}`, '#123246', PALETTE.text);
    // The two pictures, side by side.
    drawPanel(ctx, LAYOUT.leftPanel, false, world, screen);
    drawPanel(ctx, LAYOUT.rightPanel, true, world, screen);
    // Found-dots under the panels, and the set name.
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `600 15px ${FONT}`;
    ctx.fillText(set.name, 24, 664);
    for (let i = 0; i < set.diffs.length; i += 1) {
      const id = set.diffs[i];
      ctx.fillStyle = state.found[id] ? PALETTE.found : '#3a5a6e';
      ctx.beginPath();
      ctx.arc(300 + i * 26, 664, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.textAlign = 'right';
    ctx.fillStyle = PALETTE.muted;
    ctx.fillText(`Click a difference  ·  H hint (−${15}s)  ·  P pause  ·  R restart${state.mistakes > 0 ? `  ·  misses ${state.mistakes}` : ''}`, 1256, 664);
    ctx.fillStyle = PALETTE.headerEdge;
    ctx.fillRect(0, 688, 1280, 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#6a8a9a';
    ctx.font = `400 13px ${FONT}`;
    ctx.fillText('Every difference is really there — the right picture hides it, the left picture shows it. Best score ' + best, 640, 706);
    if (screen === SCREEN_TITLE) {
      drawOverlay(ctx, [
        { text: 'TWIN TIDES', font: `800 64px ${FONT}`, gap: 76 },
        { text: 'Spot the Difference', font: `400 28px ${FONT}`, colour: PALETTE.muted, gap: 46 },
        { text: 'Two pictures of the same harbour. Eight differences hide in the right one.', font: `400 20px ${FONT}`, gap: 36 },
        { text: 'Click a difference to ring it on both pictures. Find all 8 before the clock runs out —', font: `400 20px ${FONT}`, gap: 32 },
        { text: 'then a harder set hides eight more.', font: `400 20px ${FONT}`, gap: 56 },
        { text: 'CLICK  or  SPACE  to start', font: `700 24px ${FONT}`, colour: PALETTE.hint, gap: 40 },
        { text: best > 0 ? `Best score ${best}` : 'H — hint (costs 15s) · R — restart · P — pause', font: `400 17px ${FONT}`, colour: PALETTE.muted, gap: 0 },
      ]);
    } else if (screen === SCREEN_PAUSED) {
      drawOverlay(ctx, [
        { text: 'PAUSED', font: `800 56px ${FONT}`, gap: 64 },
        { text: 'The harbour waits. Press P or click to keep hunting.', font: `400 20px ${FONT}`, colour: PALETTE.muted, gap: 0 },
      ]);
    } else if (screen === SCREEN_SET_DONE) {
      drawOverlay(ctx, [
        { text: `${SETS[state.setIndex].name} — CLEAR!`, font: `800 48px ${FONT}`, gap: 60 },
        { text: `All 8 found · time bonus +${state.setBonus} · score ${state.score}`, font: `400 22px ${FONT}`, colour: PALETTE.muted, gap: 48 },
        { text: 'The next set hides eight subtler differences — and a shorter clock.', font: `400 20px ${FONT}`, gap: 56 },
        { text: 'CLICK  or  N  for the harder set', font: `700 24px ${FONT}`, colour: PALETTE.hint, gap: 0 },
      ]);
    } else if (screen === SCREEN_WIN) {
      drawOverlay(ctx, [
        { text: 'EVERY DIFFERENCE FOUND!', font: `800 52px ${FONT}`, gap: 62 },
        { text: 'Both sets, all sixteen — nothing left hiding in the harbour.', font: `400 22px ${FONT}`, colour: PALETTE.muted, gap: 44 },
        { text: `Score ${state.score}  ·  ${state.mistakes} miss${state.mistakes === 1 ? '' : 'es'}  ·  best ${Math.max(best, state.score)}`, font: `700 24px ${FONT}`, colour: PALETTE.hint, gap: 56 },
        { text: 'R — play again', font: `400 20px ${FONT}`, colour: PALETTE.muted, gap: 0 },
      ]);
    } else if (screen === SCREEN_OVER) {
      drawOverlay(ctx, [
        { text: "TIME'S UP", font: `800 56px ${FONT}`, gap: 62 },
        { text: `The clock ran out with ${remain} difference${remain === 1 ? '' : 's'} still hiding in ${set.name}.`, font: `400 22px ${FONT}`, colour: PALETTE.muted, gap: 48 },
        { text: `Score ${state.score}  ·  ${found} of ${set.diffs.length} found`, font: `700 22px ${FONT}`, colour: PALETTE.hint, gap: 56 },
        { text: 'R — try again', font: `400 20px ${FONT}`, colour: PALETTE.muted, gap: 0 },
      ]);
    }
  }
  return { draw };
}
