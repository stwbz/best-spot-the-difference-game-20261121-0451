// Boot and the one loop: clicks are read every frame, the clock advances
// in fixed 1/60 s steps, and the renderer paints what is there. The game
// moves between six screens: title, play, paused, set done, win and time up.
//
// ?seed=N fixes the game. ?shot=start|play|near|win|over (with &seed=N)
// stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { BEST_KEY, LAYOUT, STEP } from './config.js';
import { createWorld, EVENT_FOUND, EVENT_HINT, EVENT_SET_DONE, EVENT_TIME_UP, EVENT_WIN, EVENT_WRONG } from './world.js';
import { ACTION_CONFIRM, ACTION_HINT, ACTION_NEXT_SET, ACTION_PAUSE, ACTION_RESTART, createInput } from './input.js';
import { createAudio } from './audio.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_SET_DONE, SCREEN_TITLE, SCREEN_WIN } from './render.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall is dropped. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld();
const renderer = createRenderer(canvas);
const audio = createAudio();
void seed;

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best then lasts one visit.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world, scene.screen, scene.best);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

/** Which panel a canvas point is in, and its panel-local coordinates. */
function locateClick(x, y) {
  for (const [panel, index] of [[LAYOUT.leftPanel, 0], [LAYOUT.rightPanel, 1]]) {
    if (x >= panel.x + 4 && x < panel.x + panel.w - 4 && y >= panel.y + 4 && y < panel.y + panel.h - 4) {
      return { panel: index, x: x - panel.x - 4, y: y - panel.y - 4 };
    }
  }
  return null;
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.reset();
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Playing. Find 8 differences in the right picture before the clock runs out.');
  }

  function endGame(won) {
    screen = won ? SCREEN_WIN : SCREEN_OVER;
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    announce(won ? `Every difference found. Score ${world.state.score}.` : `Time up. Score ${world.state.score}.`);
  }

  function handleClicks() {
    for (const click of input.takeClicks()) {
      if (screen === SCREEN_TITLE) {
        audio.unlock();
        startGame();
        return;
      }
      if (screen === SCREEN_SET_DONE) {
        if (world.nextSet()) {
          audio.unlock();
          screen = SCREEN_PLAY;
          announce('Set 2. Eight subtler differences, a shorter clock.');
        }
        return;
      }
      if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        return;
      }
      if (screen !== SCREEN_PLAY) return;
      const located = locateClick(click.x, click.y);
      if (located === null) return;
      audio.unlock();
      const events = world.clickAt(located.x, located.y, located.panel);
      if (events & EVENT_FOUND) {
        audio.found();
        announce(`${world.foundCount()} of 8 found, ${world.remainCount()} remain.`);
      }
      if (events & EVENT_WRONG) {
        audio.wrong();
        announce('Not a difference. Keep looking.');
      }
      if (events & EVENT_SET_DONE) {
        audio.setDone();
        screen = SCREEN_SET_DONE;
        announce('Set complete. A harder set is waiting.');
      }
      if (events & EVENT_WIN) {
        audio.win();
        endGame(true);
      }
    }
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_RESTART && screen !== SCREEN_TITLE) {
      audio.unlock();
      startGame();
      return;
    }
    if (actions & ACTION_NEXT_SET && screen === SCREEN_SET_DONE) {
      if (world.nextSet()) screen = SCREEN_PLAY;
      return;
    }
    if (actions & ACTION_HINT && screen === SCREEN_PLAY) {
      if (world.useHint()) {
        audio.hint();
        announce('Hint: one difference is ringing in amber. It cost 15 seconds.');
      }
      return;
    }
    if (actions & ACTION_CONFIRM && screen !== SCREEN_PLAY && screen !== SCREEN_PAUSED) {
      audio.unlock();
      if (screen === SCREEN_SET_DONE) {
        if (world.nextSet()) screen = SCREEN_PLAY;
      } else {
        startGame();
      }
    } else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (actions & (ACTION_PAUSE | ACTION_CONFIRM) && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    handleClicks();
    if (screen === SCREEN_PLAY) {
      while (accumulator >= STEP && screen === SCREEN_PLAY) {
        if (world.step(STEP) & EVENT_TIME_UP) endGame(false);
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world, screen, best);
  }

  // Leaving the tab pauses a running game rather than letting the clock run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Twin Tides. Press Space or click to start hunting differences.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
