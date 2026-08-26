/**
 * Tiny synthesized-audio engine — no external sound/music files. Every
 * effect and the background loop are generated at runtime with the Web
 * Audio API (oscillators + gain envelopes). This sidesteps needing
 * licensed audio assets entirely and keeps the bundle tiny.
 *
 * Browsers block audio until a user gesture; `unlock()` must be called
 * synchronously inside a real click/tap handler (see App.tsx's one-time
 * pointerdown listener) before any sound will actually be heard.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  return ctx;
}

export function unlock() {
  const c = getCtx();
  if (c && c.state === "suspended") {
    c.resume().catch(() => {});
  }
}

export interface ToneOptions {
  type?: OscillatorType;
  gain?: number;
  attack?: number;
  release?: number;
  delaySec?: number;
  /** Optional pitch glide target (Hz) — for boing/whoosh style effects. */
  bendTo?: number;
}

/** Plays one short synthesized tone with a click-free attack/release envelope. */
export function playTone(freq: number, durationSec: number, opts: ToneOptions = {}) {
  const c = getCtx();
  if (!c || c.state !== "running") return;

  const { type = "sine", gain = 0.18, attack = 0.01, release = 0.08, delaySec = 0, bendTo } = opts;
  const start = c.currentTime + delaySec;
  const end = start + durationSec;

  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (bendTo) {
    osc.frequency.exponentialRampToValueAtTime(bendTo, end);
  }

  const gainNode = c.createGain();
  gainNode.gain.setValueAtTime(0, start);
  gainNode.gain.linearRampToValueAtTime(gain, start + attack);
  gainNode.gain.setValueAtTime(gain, Math.max(start + attack, end - release));
  gainNode.gain.linearRampToValueAtTime(0, end);

  osc.connect(gainNode).connect(c.destination);
  osc.start(start);
  osc.stop(end + 0.02);
}

export interface SequenceNote {
  freq: number;
  duration: number;
  delaySec: number;
  type?: OscillatorType;
  gain?: number;
}

export function playSequence(notes: SequenceNote[]) {
  for (const note of notes) {
    playTone(note.freq, note.duration, {
      type: note.type,
      gain: note.gain,
      delaySec: note.delaySec,
    });
  }
}

// ---- background music: a soft, slow looping pentatonic arpeggio ----
const MUSIC_NOTES = [523.25, 587.33, 659.25, 783.99, 880.0]; // C5 pentatonic
let musicTimer: number | null = null;

export function startMusic() {
  if (musicTimer !== null) return;
  let i = 0;
  const step = () => {
    const c = getCtx();
    if (c && c.state === "running") {
      playTone(MUSIC_NOTES[i % MUSIC_NOTES.length], 1.1, {
        type: "triangle",
        gain: 0.05,
        attack: 0.3,
        release: 0.6,
      });
      i++;
    }
    musicTimer = window.setTimeout(step, 1400);
  };
  step();
}

export function stopMusic() {
  if (musicTimer !== null) {
    window.clearTimeout(musicTimer);
    musicTimer = null;
  }
}
