// The pure game state: which set is being hunted, which differences are
// found, the clock, hints, mistakes and score. No drawing and no DOM here,
// so the rules can be driven from Node as well as from the browser.

import { CLICK_RADIUS, DIFFERENCES, FIND_POINTS, HINTS_PER_SET, HINT_TIME_COST, SETS } from './config.js';

export const EVENT_FOUND = 1;
export const EVENT_WRONG = 2;
export const EVENT_SET_DONE = 4;
export const EVENT_WIN = 8;
export const EVENT_TIME_UP = 16;
export const EVENT_HINT = 32;

export function createWorld() {
  const state = freshState();
  return {
    state,
    reset() {
      Object.assign(state, freshState());
    },
    /** The differences of the set being hunted right now. */
    currentDiffs() {
      return SETS[state.setIndex].diffs;
    },
    foundCount() {
      return SETS[state.setIndex].diffs.filter((id) => state.found[id]).length;
    },
    remainCount() {
      return SETS[state.setIndex].diffs.length - this.foundCount();
    },
    /**
     * A click in panel-local coordinates on either panel. Returns an event
     * bitmask; a find marks the difference on both panels at once.
     */
    clickAt(x, y, panel = 0) {
      if (state.over || state.setDone) return 0;
      let best = null;
      let bestDistance = CLICK_RADIUS;
      for (const id of SETS[state.setIndex].diffs) {
        if (state.found[id]) continue;
        const at = DIFFERENCES[id].at;
        const distance = Math.hypot(x - at.x, y - at.y);
        if (distance <= bestDistance) {
          best = id;
          bestDistance = distance;
        }
      }
      if (best === null) {
        state.mistakes += 1;
        state.lastWrong = { x, y, panel, until: state.elapsed + 0.8 };
        return EVENT_WRONG;
      }
      state.found[best] = true;
      state.score += FIND_POINTS;
      state.lastFound = { id: best, until: state.elapsed + 1.2 };
      if (this.remainCount() === 0) {
        state.setDone = true;
        const bonus = Math.max(0, Math.round(state.timeLeft)) * 2;
        state.score += bonus;
        state.setBonus = bonus;
        return state.setIndex + 1 >= SETS.length ? EVENT_FOUND | EVENT_WIN : EVENT_FOUND | EVENT_SET_DONE;
      }
      return EVENT_FOUND;
    },
    /** Move on to the next, harder set after a set is cleared. */
    nextSet() {
      if (!state.setDone || state.setIndex + 1 >= SETS.length) return false;
      state.setIndex += 1;
      state.timeLeft = SETS[state.setIndex].seconds;
      state.setDone = false;
      state.hintsLeft = HINTS_PER_SET;
      state.hintAt = null;
      return true;
    },
    /** Spend a hint: briefly ring one difference that is still unfound. */
    useHint() {
      if (state.over || state.setDone || state.hintsLeft <= 0) return 0;
      const remaining = SETS[state.setIndex].diffs.filter((id) => !state.found[id]);
      if (remaining.length === 0) return 0;
      const id = remaining[Math.floor(Math.random() * remaining.length)];
      state.hintsLeft -= 1;
      state.timeLeft = Math.max(0, state.timeLeft - HINT_TIME_COST);
      state.hintAt = { id, until: state.elapsed + 3 };
      return EVENT_HINT;
    },
    /** Advance the clock; returns EVENT_TIME_UP when the clock runs out. */
    step(seconds) {
      if (state.over || state.setDone) return 0;
      state.elapsed += seconds;
      state.timeLeft -= seconds;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        state.over = true;
        return EVENT_TIME_UP;
      }
      return 0;
    },
  };
}

function freshState() {
  return {
    setIndex: 0,
    found: {},
    score: 0,
    mistakes: 0,
    elapsed: 0,
    timeLeft: SETS[0].seconds,
    hintsLeft: HINTS_PER_SET,
    hintAt: null,
    lastFound: null,
    lastWrong: null,
    setDone: false,
    setBonus: 0,
    over: false,
  };
}
