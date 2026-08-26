import { create } from "zustand";
import type { CameraState } from "./camera/CameraRig";

interface TrickRequest {
  trickId: string;
  nonce: number;
}

interface SceneBridgeState {
  cameraTarget: CameraState;
  setCameraTarget: (target: CameraState) => void;

  /** Set by a minigame to ask the persistent 3D scene to play a trick;
   * cleared once the scene starts it. Kept separate from the main game
   * store (state/gameStore.ts) — this is transient cross-tree signaling
   * for the 3D layer only, never save data. The minigame already knows
   * the trick's success/tier from its own tap-timing before it calls
   * requestTrick, so completion just needs to say "which nonce finished",
   * not carry a result back. */
  trickRequest: TrickRequest | null;
  requestTrick: (trickId: string) => number;

  /** Registered once by whichever minigame is currently waiting; called
   * by the 3D scene with the nonce whose animation just finished. */
  onTrickResolved: ((nonce: number) => void) | null;
  setOnTrickResolved: (cb: ((nonce: number) => void) | null) => void;
  markTrickComplete: (nonce: number) => void;
}

let nonceCounter = 0;

export const useSceneBridge = create<SceneBridgeState>((set, get) => ({
  cameraTarget: "gym-overview",
  setCameraTarget: (target) => set({ cameraTarget: target }),

  trickRequest: null,
  requestTrick: (trickId) => {
    nonceCounter += 1;
    const nonce = nonceCounter;
    set({ trickRequest: { trickId, nonce } });
    return nonce;
  },

  onTrickResolved: null,
  setOnTrickResolved: (cb) => set({ onTrickResolved: cb }),
  markTrickComplete: (nonce) => {
    set({ trickRequest: null });
    get().onTrickResolved?.(nonce);
  },
}));
