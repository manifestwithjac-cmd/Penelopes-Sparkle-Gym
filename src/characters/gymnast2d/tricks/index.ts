import type { TrickAnimationDef2D } from "../poseUtils2d";
import { CARTWHEEL_2D } from "./cartwheel2d";
import { ONE_HANDED_CARTWHEEL_2D } from "./oneHandedCartwheel2d";
import { SOMERSAULT_2D } from "./somersault2d";
import { HANDSTAND_2D } from "./handstand2d";
import { BACKBEND_2D } from "./backbend2d";
import { SPLIT_JUMP_2D } from "./splitJump2d";
import { ROUND_OFF_2D } from "./roundOff2d";
import { FRONT_WALKOVER_2D } from "./frontWalkover2d";

/**
 * Registry of trick id -> flat-2D animation. Only tricks listed here get
 * the animated-rig treatment (FloorMinigame checks this and falls back to
 * the generic 2D tap-timing visualization for anything absent) — same
 * phased-rollout seam the old 3D system used: add a trick's keyframes,
 * register it here, and it's live with zero changes to FloorMinigame.
 */
export const TRICKS_2D: Record<string, TrickAnimationDef2D> = {
  cartwheel: CARTWHEEL_2D,
  one_handed_cartwheel: ONE_HANDED_CARTWHEEL_2D,
  somersault: SOMERSAULT_2D,
  handstand: HANDSTAND_2D,
  backbend: BACKBEND_2D,
  split_jump: SPLIT_JUMP_2D,
  round_off: ROUND_OFF_2D,
  front_walkover: FRONT_WALKOVER_2D,
};
