import { playSequence, playTone } from "./audioEngine";

// Named, reusable SFX. Everything is synthesized (see audioEngine.ts) —
// this file is just musical recipes, no asset loading involved.

export function playTapTick() {
  playTone(880, 0.05, { type: "sine", gain: 0.1, attack: 0.005, release: 0.04 });
}

export function playLandingThud() {
  playTone(180, 0.16, { type: "sine", gain: 0.14, attack: 0.005, release: 0.12 });
}

export function playTrampolineBoing() {
  playTone(300, 0.22, { type: "sine", gain: 0.16, bendTo: 620, attack: 0.005, release: 0.12 });
}

/** Gentle, upbeat — never a "you failed" buzzer (spec §15). */
export function playTryAgainChime() {
  playSequence([
    { freq: 392, duration: 0.14, delaySec: 0, type: "sine", gain: 0.12 },
    { freq: 440, duration: 0.16, delaySec: 0.12, type: "sine", gain: 0.12 },
  ]);
}

export function playSuccessCheer(big: boolean) {
  const notes = big
    ? [523.25, 659.25, 783.99, 1046.5]
    : [523.25, 659.25, 783.99];
  playSequence(
    notes.map((freq, i) => ({
      freq,
      duration: 0.18,
      delaySec: i * 0.09,
      type: "triangle" as const,
      gain: 0.15,
    })),
  );
}

export function playSparkleChime() {
  playSequence([
    { freq: 987.77, duration: 0.12, delaySec: 0, type: "sine", gain: 0.1 },
    { freq: 1174.66, duration: 0.14, delaySec: 0.08, type: "sine", gain: 0.1 },
  ]);
}

/** The Spider Cartwheel's own unique flourish — bigger and twinklier than
 * the normal success cheer (spec §11). */
export function playSpiderSpecial() {
  const run = [523.25, 659.25, 783.99, 987.77, 1174.66, 1567.98];
  playSequence(
    run.map((freq, i) => ({
      freq,
      duration: 0.2,
      delaySec: i * 0.07,
      type: "triangle" as const,
      gain: 0.16,
    })),
  );
}
