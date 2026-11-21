// The cove itself: one bright harbour scene, drawn twice — the left panel
// is the original, the right panel is the same drawing with the current
// set's differences applied. Everything is procedural canvas drawing, no
// images, so the two panels can only ever differ where a difference says so.

import { DIFFERENCES, PALETTE, SCENE, SETS } from './config.js';
import { createRandom } from './random.js';

const STARS = (() => {
  const rng = createRandom(20261121);
  const stars = [{ x: 214, y: 42 }];
  for (let i = 0; i < 14; i += 1) stars.push({ x: 20 + rng() * 560, y: 12 + rng() * 90 });
  return stars;
})();

const GLINTS = (() => {
  const rng = createRandom(77);
  const glints = [];
  for (let i = 0; i < 26; i += 1) glints.push({ x: 12 + rng() * 576, y: 306 + rng() * 150, w: 8 + rng() * 22 });
  return glints;
})();

function cloud(ctx, x, y, scale) {
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.beginPath();
  ctx.arc(x, y, 18 * scale, 0, Math.PI * 2);
  ctx.arc(x + 20 * scale, y - 8 * scale, 15 * scale, 0, Math.PI * 2);
  ctx.arc(x + 40 * scale, y, 17 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x - 18 * scale, y, 78 * scale, 12 * scale);
}

function gull(ctx, x, y, scale) {
  ctx.strokeStyle = '#274b5f';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 10 * scale, y);
  ctx.quadraticCurveTo(x - 4 * scale, y - 8 * scale, x, y);
  ctx.quadraticCurveTo(x + 4 * scale, y - 8 * scale, x + 10 * scale, y);
  ctx.stroke();
}

function drawCottage(ctx, changed) {
  // Walls, red roof, door, and two windows on the left shore.
  ctx.fillStyle = PALETTE.cottage;
  ctx.fillRect(62, 232, 130, 68);
  ctx.fillStyle = PALETTE.cottageRoof;
  ctx.beginPath();
  ctx.moveTo(52, 234);
  ctx.lineTo(127, 196);
  ctx.lineTo(202, 234);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5a3a1a';
  ctx.fillRect(118, 266, 20, 34);
  ctx.fillStyle = '#f5c542';
  ctx.fillRect(122, 272, 4, 4);
  // Window 1: lit warm yellow, or dark when the difference hides it.
  ctx.fillStyle = changed.has('window') ? '#3a4a55' : '#ffd97a';
  ctx.fillRect(96, 256, 24, 24);
  ctx.strokeStyle = '#5a3a1a';
  ctx.lineWidth = 2;
  ctx.strokeRect(96, 256, 24, 24);
  ctx.beginPath();
  ctx.moveTo(108, 256);
  ctx.lineTo(108, 280);
  ctx.moveTo(96, 268);
  ctx.lineTo(120, 268);
  ctx.stroke();
  // Window 2: shutter open, or shut when the difference hides it.
  ctx.fillStyle = '#bfe6f2';
  ctx.fillRect(146, 256, 24, 24);
  ctx.strokeRect(146, 256, 24, 24);
  ctx.beginPath();
  ctx.moveTo(158, 256);
  ctx.lineTo(158, 280);
  ctx.moveTo(146, 268);
  ctx.lineTo(170, 268);
  ctx.stroke();
  if (changed.has('shutter')) {
    ctx.fillStyle = '#7a9a3a';
    ctx.fillRect(146, 256, 24, 24);
    ctx.strokeStyle = '#4a6a1a';
    ctx.strokeRect(146, 256, 24, 24);
  }
  // Chimney with a curl of smoke.
  ctx.fillStyle = '#9a8a7a';
  ctx.fillRect(168, 200, 14, 26);
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(175, 198);
  ctx.quadraticCurveTo(185, 182, 175, 168);
  ctx.quadraticCurveTo(168, 156, 176, 146);
  ctx.stroke();
}

function drawLighthouse(ctx, changed) {
  // A white tower with red bands on the rocks at the right shore.
  ctx.fillStyle = '#8a8a92';
  ctx.beginPath();
  ctx.moveTo(452, 302);
  ctx.lineTo(470, 268);
  ctx.lineTo(516, 268);
  ctx.lineTo(534, 302);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PALETTE.lighthouse;
  ctx.beginPath();
  ctx.moveTo(470, 268);
  ctx.lineTo(478, 78);
  ctx.lineTo(506, 78);
  ctx.lineTo(514, 268);
  ctx.closePath();
  ctx.fill();
  // Red bands: three, or two when the difference hides one.
  ctx.fillStyle = PALETTE.lighthouseRed;
  ctx.fillRect(475, 118, 34, 18);
  ctx.fillRect(472, 178, 40, 18);
  if (!changed.has('stripes')) ctx.fillRect(470, 232, 44, 18);
  // Lamp room and its light: glowing, or dark when the difference hides it.
  ctx.fillStyle = '#274b5f';
  ctx.fillRect(474, 58, 36, 22);
  if (changed.has('lamp')) {
    ctx.fillStyle = '#3a4a55';
    ctx.fillRect(478, 62, 28, 14);
  } else {
    ctx.fillStyle = '#ffe27a';
    ctx.fillRect(478, 62, 28, 14);
    ctx.fillStyle = 'rgba(255,226,122,0.35)';
    ctx.beginPath();
    ctx.arc(492, 69, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,226,122,0.18)';
    ctx.beginPath();
    ctx.arc(492, 69, 48, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#274b5f';
  ctx.beginPath();
  ctx.moveTo(470, 58);
  ctx.lineTo(492, 38);
  ctx.lineTo(514, 58);
  ctx.closePath();
  ctx.fill();
  // Flag on top: red, or yellow when the difference changes it.
  ctx.strokeStyle = '#274b5f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(492, 38);
  ctx.lineTo(492, 14);
  ctx.stroke();
  ctx.fillStyle = changed.has('flag') ? '#f5c542' : PALETTE.lighthouseRed;
  ctx.beginPath();
  ctx.moveTo(492, 14);
  ctx.lineTo(514, 19);
  ctx.lineTo(492, 25);
  ctx.closePath();
  ctx.fill();
}

function drawPalm(ctx, changed) {
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(556, 300);
  ctx.quadraticCurveTo(548, 252, 556, 214);
  ctx.stroke();
  ctx.strokeStyle = PALETTE.palm;
  ctx.lineWidth = 7;
  for (const [dx, dy] of [[-26, -14], [-18, -26], [0, -30], [18, -26], [26, -12], [12, -6], [-12, -6]]) {
    ctx.beginPath();
    ctx.moveTo(556, 214);
    ctx.quadraticCurveTo(556 + dx, 214 + dy, 556 + dx * 1.5, 214 + dy + 12);
    ctx.stroke();
  }
  // Coconuts: three, or two when the difference hides one.
  ctx.fillStyle = '#6b4423';
  ctx.beginPath();
  ctx.arc(548, 222, 6, 0, Math.PI * 2);
  ctx.arc(562, 224, 6, 0, Math.PI * 2);
  if (!changed.has('coconuts')) ctx.arc(556, 230, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawBoat(ctx, changed) {
  // A little wooden boat with one sail, anchored off the left shore.
  ctx.fillStyle = changed.has('sail') ? PALETTE.sailBlue : PALETTE.sailRed;
  ctx.beginPath();
  ctx.moveTo(168, 296);
  ctx.lineTo(168, 356);
  ctx.lineTo(206, 356);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.moveTo(160, 302);
  ctx.lineTo(160, 356);
  ctx.lineTo(128, 356);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5a3a1a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(168, 292);
  ctx.lineTo(168, 360);
  ctx.stroke();
  ctx.fillStyle = PALETTE.boat;
  ctx.beginPath();
  ctx.moveTo(118, 360);
  ctx.lineTo(214, 360);
  ctx.lineTo(198, 386);
  ctx.lineTo(134, 386);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#a8763e';
  ctx.fillRect(118, 360, 96, 6);
  // Anchor over the side, or gone when the difference hides it.
  if (!changed.has('anchor')) {
    ctx.strokeStyle = '#274b5f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(208, 396, 7, 0, Math.PI * 1.5);
    ctx.moveTo(208, 388);
    ctx.lineTo(208, 400);
    ctx.moveTo(201, 392);
    ctx.lineTo(215, 392);
    ctx.stroke();
  }
}

function drawDock(ctx, changed) {
  // Planks running out from the sand into the sea, with a rope coil and a cat.
  ctx.fillStyle = PALETTE.dock;
  ctx.fillRect(336, 438, 150, 16);
  ctx.fillStyle = PALETTE.dockDark;
  for (let x = 336; x < 486; x += 18) ctx.fillRect(x, 438, 2, 16);
  ctx.fillStyle = '#5a3a1a';
  ctx.fillRect(344, 454, 8, 22);
  ctx.fillRect(470, 454, 8, 22);
  if (!changed.has('rope')) {
    ctx.strokeStyle = '#d9b380';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(372, 452, 9, 0, Math.PI * 2);
    ctx.arc(372, 452, 5, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (!changed.has('cat')) {
    // A ginger cat asleep on the dock, tail curled.
    ctx.fillStyle = '#e8913a';
    ctx.beginPath();
    ctx.ellipse(442, 440, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(454, 434, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(449, 428);
    ctx.lineTo(451, 421);
    ctx.lineTo(455, 428);
    ctx.closePath();
    ctx.moveTo(455, 428);
    ctx.lineTo(458, 421);
    ctx.lineTo(460, 429);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#e8913a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(428, 442);
    ctx.quadraticCurveTo(418, 436, 422, 428);
    ctx.stroke();
  }
}

/**
 * Draw the cove into `ctx` at panel-local coordinates. `changed` is the
 * set of difference ids that differ on this panel (empty for the original,
 * the current set for the altered panel), and `found` marks nothing — the
 * renderer draws the markers, not the scene.
 */
export function drawScene(ctx, changed) {
  const sky = ctx.createLinearGradient(0, 0, 0, 290);
  sky.addColorStop(0, PALETTE.skyTop);
  sky.addColorStop(1, PALETTE.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, SCENE.width, 290);
  // Faint morning stars, one of which the right panel can lose.
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (const star of STARS) {
    if (changed.has('star') && star.x === 214 && star.y === 42) continue;
    ctx.beginPath();
    ctx.arc(star.x, star.y, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  // Sun with rays, top left.
  ctx.fillStyle = '#ffd97a';
  ctx.beginPath();
  ctx.arc(70, 64, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffd97a';
  ctx.lineWidth = 4;
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(70 + Math.cos(a) * 32, 64 + Math.sin(a) * 32);
    ctx.lineTo(70 + Math.cos(a) * 42, 64 + Math.sin(a) * 42);
    ctx.stroke();
  }
  cloud(ctx, 250, 52, 1);
  cloud(ctx, 420, 96, 0.7);
  if (!changed.has('cloud')) cloud(ctx, 386, 58, 0.45);
  // Sea, with wave lines and glints.
  const sea = ctx.createLinearGradient(0, 290, 0, 470);
  sea.addColorStop(0, PALETTE.sea);
  sea.addColorStop(1, PALETTE.seaDeep);
  ctx.fillStyle = sea;
  ctx.fillRect(0, 290, SCENE.width, 180);
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 2;
  for (let y = 312; y < 470; y += 26) {
    ctx.beginPath();
    for (let x = 0; x < SCENE.width; x += 24) {
      const yy = y + Math.sin((x + y * 3) / 40) * 3;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (const glint of GLINTS) ctx.fillRect(glint.x, glint.y, glint.w, 2);
  // Sand at the bottom, with a few shells.
  ctx.fillStyle = PALETTE.sand;
  ctx.fillRect(0, 470, SCENE.width, 62);
  ctx.fillStyle = PALETTE.sandDark;
  ctx.beginPath();
  ctx.ellipse(90, 500, 30, 8, 0, 0, Math.PI * 2);
  ctx.ellipse(300, 514, 40, 9, 0, 0, Math.PI * 2);
  ctx.ellipse(520, 496, 26, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff9fb2';
  ctx.beginPath();
  ctx.arc(140, 508, 4, 0, Math.PI * 2);
  ctx.arc(340, 496, 4, 0, Math.PI * 2);
  ctx.fill();
  // A rock in the shallows, or gone when the difference hides it.
  if (!changed.has('rock')) {
    ctx.fillStyle = '#7a8a92';
    ctx.beginPath();
    ctx.ellipse(478, 428, 16, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#9aa8ad';
    ctx.beginPath();
    ctx.ellipse(474, 424, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  drawCottage(ctx, changed);
  drawLighthouse(ctx, changed);
  drawPalm(ctx, changed);
  drawDock(ctx, changed);
  drawBoat(ctx, changed);
  // Buoy bobbing off the lighthouse rocks: orange, or green.
  ctx.fillStyle = changed.has('buoy') ? '#39d98a' : '#ff7a2a';
  ctx.beginPath();
  ctx.arc(520, 392, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillRect(517, 378, 6, 8);
  // A fish jumping clear of the water, or gone when hidden.
  if (!changed.has('fish')) {
    ctx.fillStyle = '#5f9ea0';
    ctx.beginPath();
    ctx.ellipse(262, 406, 12, 5, -0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(272, 400);
    ctx.lineTo(280, 404);
    ctx.lineTo(272, 408);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(258, 418, 10, 0.3, Math.PI - 0.3);
    ctx.stroke();
  }
  // Seagulls: three, or two when the difference hides one.
  gull(ctx, 282, 74, 1);
  gull(ctx, 318, 62, 0.9);
  if (!changed.has('gulls')) gull(ctx, 300, 88, 0.8);
}

/** The ids that differ on the altered (right) panel for a given set. */
export function changedForSet(setIndex) {
  return new Set(SETS[setIndex].diffs);
}

export { DIFFERENCES };
