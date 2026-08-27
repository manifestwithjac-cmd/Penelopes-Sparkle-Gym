import type { TrickAnimationDef2D } from "../poseUtils2d";
import { easeInOutQuad2D, easeOutBack2D, linear2D } from "../poseUtils2d";

/**
 * Rolls forward AWAY from the camera rather than spinning in-plane —
 * same reasoning as somersault2d.ts's squash (root.scaleY dips through
 * the middle of the roll instead of root.rot sweeping through a big
 * in-plane arc, since a real walkover's rotation axis points at the
 * viewer, which this flat cutout has no perspective to actually show).
 * One leg leads the whole way through as a scissoring split (unlike
 * handstand2d.ts's legs-together hold), and instead of landing upright
 * she flows into a held arch (torso/head tip, matching backbend2d.ts's
 * finish) before curling back up — "flip forward into a graceful
 * bridge." Slower than the other tricks — graceful, not powerful.
 */
export const FRONT_WALKOVER_2D: TrickAnimationDef2D = {
  id: "front_walkover",
  durationMs: 2200,
  keyframes: [
    {
      t: 0,
      label: "ready",
      ease: easeInOutQuad2D,
      pose: {
        root: { x: -14, y: 0, rot: 0, scaleY: 1 },
        shoulderL: { rot: 6 },
        shoulderR: { rot: -6 },
        hipL: { rot: 2 },
        hipR: { rot: -2 },
      },
    },
    {
      t: 0.15,
      label: "lead-kick",
      ease: easeInOutQuad2D,
      pose: {
        root: { x: -10, y: 3, rot: -8, scaleY: 0.9 },
        shoulderL: { rot: 40 },
        shoulderR: { rot: -40 },
        hipL: { rot: -60 },
        hipR: { rot: 10 },
      },
    },
    {
      t: 0.32,
      label: "reach-through",
      ease: linear2D,
      pose: {
        root: { x: -4, y: -1, rot: -10, scaleY: 0.62 },
        shoulderL: { rot: 90 },
        shoulderR: { rot: -90 },
        hipL: { rot: -90 },
        hipR: { rot: 30 },
        kneeR: { rot: -10 },
      },
    },
    {
      t: 0.5,
      label: "split-inverted",
      ease: linear2D,
      pose: {
        root: { x: 2, y: -3, rot: 0, scaleY: 0.5 },
        shoulderL: { rot: 12 },
        shoulderR: { rot: -12 },
        // Scissored split while at the deepest point of the tumble — one
        // leg still trailing up-and-back, the other swinging through to
        // lead the landing — instead of Handstand's legs held together.
        hipL: { rot: -70 },
        hipR: { rot: 55 },
      },
    },
    {
      t: 0.68,
      label: "second-leg-leads",
      ease: linear2D,
      pose: {
        root: { x: 8, y: -1, rot: 8, scaleY: 0.68 },
        shoulderL: { rot: 40 },
        shoulderR: { rot: -40 },
        hipL: { rot: 10 },
        hipR: { rot: -55 },
        kneeR: { rot: 10 },
      },
    },
    {
      t: 0.85,
      label: "arch-finish",
      ease: linear2D,
      pose: {
        root: { x: 13, y: 3, rot: 0, scaleY: 0.9 },
        torso: { rot: 16 },
        head: { rot: 14 },
        shoulderL: { rot: 105 },
        shoulderR: { rot: -105 },
        hipL: { rot: 6 },
        hipR: { rot: -14 },
        kneeL: { rot: -10 },
        kneeR: { rot: 6 },
      },
    },
    {
      t: 1,
      label: "curl-up-celebrate",
      ease: easeOutBack2D,
      pose: {
        root: { x: 13, y: -4, rot: 0, scaleY: 1 },
        torso: { rot: 0 },
        head: { rot: 0 },
        shoulderL: { rot: 130 },
        shoulderR: { rot: -130 },
        hipL: { rot: 2 },
        hipR: { rot: -2 },
      },
    },
  ],
};
