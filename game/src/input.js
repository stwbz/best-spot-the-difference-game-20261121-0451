// Keyboard and pointer input: clicks on the canvas, and the keys the
// footer advertises. A click is delivered once, with canvas coordinates.

export const ACTION_CONFIRM = 1;
export const ACTION_RESTART = 2;
export const ACTION_HINT = 4;
export const ACTION_PAUSE = 8;
export const ACTION_NEXT_SET = 16;

export function createInput(canvas) {
  let actions = 0;
  const clicks = [];
  const queueClick = (event) => {
    const rect = canvas.getBoundingClientRect();
    clicks.push({
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    });
  };
  canvas.addEventListener('pointerdown', queueClick);
  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (event.code === 'Space' || event.code === 'Enter') actions |= ACTION_CONFIRM;
    else if (event.code === 'KeyR') actions |= ACTION_RESTART;
    else if (event.code === 'KeyH') actions |= ACTION_HINT;
    else if (event.code === 'KeyP' || event.code === 'Escape') actions |= ACTION_PAUSE;
    else if (event.code === 'KeyN') actions |= ACTION_NEXT_SET;
    if (['Space', 'ArrowUp', 'ArrowDown'].includes(event.code)) event.preventDefault();
  });
  return {
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    takeClicks() {
      return clicks.splice(0, clicks.length);
    },
  };
}
