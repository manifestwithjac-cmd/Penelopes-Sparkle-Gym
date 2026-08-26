import { useCallback } from "react";
import { useGameStore } from "../state/gameStore";
import {
  playTapTick,
  playLandingThud,
  playTrampolineBoing,
  playTryAgainChime,
  playSuccessCheer,
  playSparkleChime,
  playSpiderSpecial,
} from "./sounds";

const SOUND_MAP = {
  tap: playTapTick,
  landing: playLandingThud,
  trampolineBoing: playTrampolineBoing,
  tryAgain: playTryAgainChime,
  successCheer: () => playSuccessCheer(false),
  bigSuccessCheer: () => playSuccessCheer(true),
  sparkle: playSparkleChime,
  spiderSpecial: playSpiderSpecial,
} as const;

export type SoundName = keyof typeof SOUND_MAP;

/** All game code should play sounds through this hook, never call
 * audio/sounds.ts directly — it's the one place that checks the sound
 * on/off setting, so muting can never be bypassed. */
export function useSound() {
  const soundOn = useGameStore((s) => s.soundOn);

  return useCallback(
    (name: SoundName) => {
      if (!soundOn) return;
      SOUND_MAP[name]();
    },
    [soundOn],
  );
}
