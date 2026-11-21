// Synthesised WebAudio sounds — a chime for a find, a dull buzz for a
// miss, a soft tick for a hint, a little fanfare for a win. No sound files.

export function createAudio() {
  let context = null;
  function ensure() {
    if (context === null) {
      try {
        const AudioContext = window.AudioContext ?? window.webkitAudioContext;
        context = new AudioContext();
      } catch {
        context = null;
      }
    }
    if (context !== null && context.state === 'suspended') void context.resume();
    return context;
  }
  function tone(frequency, seconds, type, gainValue, when = 0) {
    const ctx = ensure();
    if (ctx === null) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    const start = ctx.currentTime + when;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(gainValue, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, start + seconds);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + seconds + 0.05);
  }
  return {
    unlock() {
      ensure();
    },
    found() {
      tone(660, 0.16, 'sine', 0.16);
      tone(990, 0.24, 'sine', 0.14, 0.08);
    },
    wrong() {
      tone(140, 0.22, 'sawtooth', 0.08);
    },
    hint() {
      tone(520, 0.12, 'triangle', 0.12);
      tone(780, 0.12, 'triangle', 0.1, 0.1);
    },
    setDone() {
      tone(523, 0.14, 'sine', 0.14);
      tone(659, 0.14, 'sine', 0.14, 0.12);
      tone(784, 0.22, 'sine', 0.14, 0.24);
    },
    win() {
      [523, 659, 784, 1047].forEach((frequency, i) => tone(frequency, 0.22, 'sine', 0.14, i * 0.13));
    },
  };
}
