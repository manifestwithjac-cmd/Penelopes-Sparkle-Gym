import type { TrickAnimationDef } from "../types";
import { CARTWHEEL } from "./cartwheel";
import { ONE_HANDED_CARTWHEEL } from "./oneHandedCartwheel";

/**
 * Registry of trick id -> 3D animation. Only tricks listed here get the
 * 3D treatment (FloorMinigame checks this and falls back to the existing
 * 2D tap-timing visualization for anything absent) — this is the seam
 * the spec's phased rollout hangs off of: add a new trick's keyframes,
 * register it here, and it's live, with zero changes to FloorMinigame,
 * the game store, or the reward system.
 */
export const TRICKS: Record<string, TrickAnimationDef> = {
  cartwheel: CARTWHEEL,
  one_handed_cartwheel: ONE_HANDED_CARTWHEEL,
};
