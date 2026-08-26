import type { TrickAnimationDef2D } from "../poseUtils2d";
import { CARTWHEEL_2D } from "./cartwheel2d";

/**
 * Registry of trick id -> flat-2D animation. Only tricks listed here get
 * the animated-rig treatment (FloorMinigame checks this and falls back to
 * the generic 2D tap-timing visualization for anything absent) — same
 * phased-rollout seam the old 3D system used: add a trick's keyframes,
 * register it here, and it's live with zero changes to FloorMinigame.
 */
export const TRICKS_2D: Record<string, TrickAnimationDef2D> = {
  cartwheel: CARTWHEEL_2D,
};
