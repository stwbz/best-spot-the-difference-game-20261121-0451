# TWIN TIDES — Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/stwbz/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/stwbz/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

A spot-the-difference game for the make.fun bounty **"Make the best spot the
difference game"** (`best-spot-the-difference-game-20261121-0451`, pot $50,
deadline 2026-11-21 23:51 WIB). Original idea, art, sounds and names — no
commercial game copied.

Two pictures of the same bright harbour, side by side. The right one hides
**8 differences** — a sail that changed colour, a lamp gone dark, a cat that
vanished from the dock, a seagull fewer. Click a difference to ring it on
both pictures. Find all 8 before the clock runs out, and a harder set hides
eight subtler ones on a shorter clock.

## How to play

- **Click** — mark a difference (rings it on both pictures, +100)
- **H** — hint: rings one unfound difference in amber for 3 s (costs 15 s, 3 per set)
- **P / Esc** — pause · **R** — restart · **Space / click** — start / next set
- **2 sets, 16 differences in all.** Set 1 runs 5:00, set 2 runs 4:00 and
  hides the subtler changes (a missing star, a shut shutter, a rope coil).
- A wrong click is a miss: a red cross where you clicked, no points lost,
  but the clock keeps running. Clearing a set pays a time bonus (+2 per
  second left).

## Files

```
main.ts            hands the entry in (copies game/ + screenshots/, writes dossier.json)
serve.ts           tiny local static server: node serve.ts -> http://localhost:8080
shots.json         the 4 screenshot scenes (?shot=play|start|near|win &seed=1)
LICENSE            MIT
game/
  index.html       canvas page, no external references at all
  src/
    config.js      tuning numbers, palette, panel layout, the 16 differences in 2 sets
    scene.js       the harbour itself, drawn twice: original vs changed (procedural canvas)
    world.js       pure rules: clicks, found/miss, hints, clock, sets, score
    input.js       pointer + keyboard
    audio.js       WebAudio synth sounds (find chime, miss buzz, hint, fanfares) — no files
    render.js      header/counter/timer/score, panels, markers, title/pause/win screens
    shots.js       deterministic screenshot scenes (real clicks, real clock)
    random.js      seeded RNG for the stars and wave glints
    main.js        boot + fixed-step loop + screens
screenshots/
  1-play.jpg       cover: 3 found, 5 still hiding, clock running
  2-start.jpg      title screen over the harbour
  3-near.jpg       7 of 8 found, 1 remain, 1:40 left
  4-win.jpg        win screen: both sets, all sixteen, 0 misses
```

## Test locally

```sh
node serve.ts            # play at http://localhost:8080
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # build the hand-in
```

## Verification (2026-11-21, local)

- `node --check` passes on all 9 game sources.
- `main.ts` run twice → byte-identical `out/` (`diff -r` clean). Dossier
  572,394 bytes (< 1.5 MiB cap); total `out/` ~1.0 MB; `game/` ~42 KiB.
- Screenshots are real renders of this game's own code in headless Chrome
  (Playwright `chrome-headless-shell`, 1280×720, `?shot=…&seed=1`), converted
  to JPEG q82: 81–112 KiB each (cap 256 KiB), 1280×720 (long side ≤ 1280,
  short side ≥ 480).
- No console errors on the shot pages; no network references anywhere in
  `game/` (no `http(s):`, no `fetch`, all imports relative).
- Playability, simulated in Node with the real rules: a bot clicking every
  difference in order wins both sets, score 2,680, 0 misses; a wrong click
  far from any difference counts as a miss; a hint costs 15 s and rings one
  unfound difference; the clock running out ends the game; clicking a
  found difference's neighbour 40 px away does not steal the find.
- Chrome note: the VM's `/opt/meta-chromium/chrome` (Muse Browser) refuses
  to start headless here ("Hatch WebGL domain policy is required for browser
  startup"), so screenshots were taken with Playwright's
  `chrome-headless-shell` 1255 instead — same Chromium engine, real renders.
  The game itself needs no special browser: plain Canvas 2D + WebAudio.

## Status — NOT submitted

Local entry only. Still needed before the deadline (2026-11-21 23:51 WIB):

1. Create a public GitHub repo (created after the competition opened) with
   these files + LICENSE, on the `stwbz` account.
2. Submit via make.fun (repo + commit + transcripts) and watch the dev grade.
3. Payout wallet: the agent wallet from the CSV entry, or the linked wallet
   on the make.fun profile — confirm before submitting.
