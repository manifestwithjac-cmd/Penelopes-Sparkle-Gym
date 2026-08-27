import type { TrickAnimationDef2D } from "../poseUtils2d";
import { easeInOutQuad2D, easeOutBack2D, linear2D } from "../poseUtils2d";

/**
 * Front Walkover tumbles first and arches at the end; this reverses that
 * order — she opens into the arch FIRST (same backward lean backbend2d.ts
 * uses), then that lean carries straight into a real root.rot rotation
 * (a full 360° over the course of the trick, same mechanic cartwheel2d.ts
 * and frontWalkover2d.ts use — no squash/scaleY illusion), scissoring
 * through a split while inverted, traveling in the opposite (negative x)
 * direction from Front Walkover to read as going backward rather than
 * forward. RiggedGymnastFigure's head swaps to a real back-of-head view
 * while root is rotated past the camera (see poseUtils2d.ts's
 * applyPose2D).
 */
export const BACK_WALKOVER_2D: TrickAnimationDef2D = {
  id: "back_walkover",
  durationMs: 2200,
  keyframes: [
    {
      t: 0,
      label: "ready",
      ease: easeInOutQuad2D,
      pose: {
        root: { x: 14, y: 0, rot: 0 },
        shoulderL: { rot: 6 },
        shoulderR: { rot: -6 },
        hipL: { rot: 2 },
        hipR: { rot: -2 },
      },
    },
    {
      t: 0.18,
      label: "arch-back",
      ease: easeInOutQuad2D,
      pose: {
        root: { x: 12, y: 4, rot: 25 },
        torso: { rot: 22 },
        head: { rot: 20 },
        shoulderL: { rot: 110 },
        shoulderR: { rot: -110 },
        hipL: { rot: 4 },
        hipR: { rot: -4 },
        kneeL: { rot: -12 },
        kneeR: { rot: 12 },
      },
    },
    {
      t: 0.35,
      label: "kick-over",
      ease: linear2D,
      pose: {
        root: { x: 6, y: -2, rot: 100 },
        shoulderL: { rot: 90 },
        shoulderR: { rot: -90 },
        hipL: { rot: -55 },
        hipR: { rot: 60 },
      },
    },
    {
      t: 0.52,
      label: "tumble-peak",
      ease: linear2D,
      pose: {
        root: { x: -2, y: -5, rot: 180 },
        shoulderL: { rot: 15 },
        shoulderR: { rot: -15 },
        // Scissored split at the fully-inverted point, same idea as
        // frontWalkover2d.ts's split-inverted.
        hipL: { rot: -70 },
        hipR: { rot: 55 },
      },
    },
    {
      t: 0.7,
      label: "second-leg-follows",
      ease: linear2D,
      pose: {
        root: { x: -8, y: -1, rot: 260 },
        shoulderL: { rot: 40 },
        shoulderR: { rot: -40 },
        hipL: { rot: -20 },
        hipR: { rot: 15 },
        kneeR: { rot: 10 },
      },
    },
    {
      t: 0.85,
      label: "land",
      ease: easeInOutQuad2D,
      pose: {
        root: { x: -13, y: 2, rot: 330 },
        shoulderL: { rot: 20 },
        shoulderR: { rot: -20 },
        hipL: { rot: 6 },
        hipR: { rot: -6 },
        kneeL: { rot: -8 },
        kneeR: { rot: 8 },
      },
    },
    {
      t: 1,
      label: "stand-celebrate",
      ease: easeOutBack2D,
      pose: {
        root: { x: -13, y: -6, rot: 360 },
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
