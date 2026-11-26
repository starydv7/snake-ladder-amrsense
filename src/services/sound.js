// Tiny WebAudio sound effects. No audio files, works offline.
let ctx;
let enabled = true;

export const setSoundEnabled = (v) => { enabled = !!v; };
export const isSoundEnabled = () => enabled;

function tone(freq, dur = 0.12, type = 'sine', vol = 0.15, delay = 0) {
  if (!enabled) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    const t = ctx.currentTime + delay;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur);
  } catch { /* audio unavailable */ }
}

export const sfx = {
  dice: () => [0, 1, 2, 3].forEach((i) => tone(200 + i * 40, 0.06, 'square', 0.08, i * 0.07)),
  step: () => tone(520, 0.05, 'triangle', 0.08),
  ladder: () => [440, 554, 659, 880].forEach((f, i) => tone(f, 0.15, 'triangle', 0.14, i * 0.1)),
  snake: () => [400, 330, 260, 190].forEach((f, i) => tone(f, 0.18, 'sawtooth', 0.1, i * 0.1)),
  correct: () => [660, 880].forEach((f, i) => tone(f, 0.15, 'sine', 0.16, i * 0.1)),
  wrong: () => tone(180, 0.3, 'square', 0.1),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.2, 'triangle', 0.16, i * 0.12))
};
