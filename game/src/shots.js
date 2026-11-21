// The screenshot scenes behind ?shot=start|play|near|win. Each one plays
// the real rules forward from a fresh world — real clicks on the real
// differences, the real clock advancing — so the frame is what a short
// game really looks like, and the same seed always gives the same frame.

import { DIFFERENCES, SETS } from './config.js';
import { EVENT_SET_DONE, EVENT_WIN } from './world.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_SET_DONE, SCREEN_TITLE, SCREEN_WIN } from './render.js';

/** Click every difference of the current set except `skip` of them. */
function clickDiffs(world, skip = 0) {
  const ids = SETS[world.state.setIndex].diffs.filter((id) => !world.state.found[id]);
  let events = 0;
  for (let i = 0; i < ids.length - skip; i += 1) {
    const at = DIFFERENCES[ids[i]].at;
    events |= world.clickAt(at.x, at.y, 1);
  }
  return events;
}

/**
 * Set `world` to the named scene and return the screen to draw over it and
 * the best score to show. Unknown names stage the title scene.
 */
export function stageShot(name, world) {
  world.reset();
  if (name === 'play') {
    // Three found, five still hiding, clock already running.
    clickDiffs(world, 5);
    world.step(48);
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'near') {
    // Seven found, one left, the clock nearly half gone.
    clickDiffs(world, 1);
    world.step(200);
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'win') {
    // Both sets cleared for real: set 1, then the harder set 2.
    clickDiffs(world, 1);
    world.step(120);
    clickDiffs(world, 0);
    world.nextSet();
    clickDiffs(world, 1);
    world.step(90);
    const events = clickDiffs(world, 0);
    if (events & EVENT_WIN) {
      return { screen: SCREEN_WIN, best: world.state.score };
    }
    return { screen: SCREEN_SET_DONE, best: world.state.score };
  }
  if (name === 'over') {
    clickDiffs(world, 6);
    world.step(300);
    return { screen: SCREEN_OVER, best: 0 };
  }
  void EVENT_SET_DONE;
  return { screen: SCREEN_TITLE, best: 0 };
}
