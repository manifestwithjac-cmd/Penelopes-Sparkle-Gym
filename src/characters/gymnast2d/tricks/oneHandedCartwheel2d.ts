import type { TrickAnimationDef2D } from "../poseUtils2d";
import { easeInOutQuad2D, easeOutBack2D, linear2D } from "../poseUtils2d";

/**
 * Same wheeling spin/travel and leg-splay as cartwheel2d.ts, but only the
 * right arm reaches up into the big starfish spread — the left arm stays
 * low and close to her side through the whole trick, so only one hand is
 * ever "up," matching the trick's name.
 */
export const ONE_HANDED_CARTWHEEL_2D: TrickAnimationDef2D = {
  id: "one_handed_cartwheel",
  durationMs: 1600,
  keyframes: [
    {
      t: 0,
      label: "ready",
      ease: easeInOutQuad2D,
      pose: {
        root: { x: -18, y: 0, rot: 0 },
        shoulderL: { rot: 6 },
        shoulderR: { rot: -6 },
        hipL: { rot: 2 },
        hipR: { rot: -2 },
      },
    },
    {
      t: 0.12,
      label: "windup",
      ease: easeInOutQuad2D,
      pose: {
        root: { x: -15, y: 4, rot: -12 },
        shoulderL: { rot: 15 },
        shoulderR: { rot: -30 },
        elbowR: { rot: -15 },
        hipL: { rot: 12 },
        hipR: { rot: -12 },
        kneeL: { rot: 10 },
        kneeR: { rot: -10 },
      },
    },
    {
      t: 0.3,
      label: "launch-star",
      ease: linear2D,
      pose: {
        root: { x: -8, y: -6, rot: -95 },
        // Same near-horizontal/straight-elbow reach as cartwheel2d.ts's
        // starfish frames (see the comment there) — negative rotation is
        // what actually swings the RIGHT arm outward past the head.
        shoulderL: { rot: 18 },
        shoulderR: { rot: -100 },
        elbowR: { rot: 0 },
        hipL: { rot: -70 },
        hipR: { rot: 70 },
        kneeL: { rot: 8 },
        kneeR: { rot: -8 },
      },
    },
    {
      t: 0.5,
      label: "inverted",
      ease: linear2D,
      pose: {
        root: { x: 0, y: -10, rot: -180 },
        shoulderL: { rot: 18 },
        shoulderR: { rot: -112 },
        elbowR: { rot: 0 },
        hipL: { rot: -78 },
        hipR: { rot: 78 },
        kneeL: { rot: 12 },
        kneeR: { rot: -12 },
      },
    },
    {
      t: 0.7,
      label: "gather",
      ease: linear2D,
      pose: {
        root: { x: 8, y: -6, rot: -265 },
        shoulderL: { rot: 12 },
        shoulderR: { rot: -75 },
        elbowR: { rot: -5 },
        hipL: { rot: -35 },
        hipR: { rot: 35 },
        kneeL: { rot: 6 },
        kneeR: { rot: -6 },
      },
    },
    {
      t: 0.85,
      label: "stand",
      ease: easeInOutQuad2D,
      pose: {
        root: { x: 16, y: 2, rot: -360 },
        shoulderL: { rot: 10 },
        shoulderR: { rot: -22 },
        elbowR: { rot: -8 },
        hipL: { rot: 6 },
        hipR: { rot: -6 },
        kneeL: { rot: -8 },
        kneeR: { rot: 8 },
      },
    },
    {
      t: 1,
      label: "celebrate",
      ease: easeOutBack2D,
      pose: {
        root: { x: 16, y: -6, rot: -360 },
        // Only the right arm throws up in celebration too, staying
        // consistent with "one hand up" for the whole trick.
        shoulderL: { rot: 6 },
        shoulderR: { rot: -130 },
        hipL: { rot: 2 },
        hipR: { rot: -2 },
      },
    },
  ],
};
