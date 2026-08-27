import type { TrickAnimationDef2D } from "../poseUtils2d";
import { easeInOutQuad2D, easeOutBack2D, linear2D } from "../poseUtils2d";

/**
 * Same wheeling full-360° starfish spin as cartwheel2d.ts, but faster
 * (shorter duration = "a powerful cartwheel") and — its real visual
 * signature — the landing snaps her feet together into a sharp, chest-up
 * "stuck it" pose (arms out to the sides, legs together) instead of
 * settling into a loose standing pose like Cartwheel's landing does.
 */
export const ROUND_OFF_2D: TrickAnimationDef2D = {
  id: "round_off",
  durationMs: 1300,
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
      t: 0.1,
      label: "windup",
      ease: easeInOutQuad2D,
      pose: {
        root: { x: -15, y: 3, rot: -14 },
        shoulderL: { rot: 32 },
        shoulderR: { rot: -32 },
        hipL: { rot: 14 },
        hipR: { rot: -14 },
        kneeL: { rot: 10 },
        kneeR: { rot: -10 },
      },
    },
    {
      t: 0.28,
      label: "launch-star",
      ease: linear2D,
      pose: {
        root: { x: -8, y: -7, rot: -100 },
        shoulderL: { rot: 100 },
        shoulderR: { rot: -100 },
        hipL: { rot: -72 },
        hipR: { rot: 72 },
        kneeL: { rot: 8 },
        kneeR: { rot: -8 },
      },
    },
    {
      t: 0.48,
      label: "inverted",
      ease: linear2D,
      pose: {
        root: { x: 0, y: -11, rot: -185 },
        shoulderL: { rot: 112 },
        shoulderR: { rot: -112 },
        hipL: { rot: -80 },
        hipR: { rot: 80 },
        kneeL: { rot: 12 },
        kneeR: { rot: -12 },
      },
    },
    {
      t: 0.68,
      label: "snap-together",
      ease: linear2D,
      pose: {
        root: { x: 8, y: -4, rot: -280 },
        shoulderL: { rot: 60 },
        shoulderR: { rot: -60 },
        // Legs snap toward each other (same value, not mirrored apart)
        // ahead of the stuck landing, instead of gathering symmetrically
        // like Cartwheel's more relaxed "gather" phase.
        hipL: { rot: -10 },
        hipR: { rot: -10 },
        kneeL: { rot: 4 },
        kneeR: { rot: 4 },
      },
    },
    {
      t: 0.82,
      label: "stick-landing",
      ease: easeOutBack2D,
      pose: {
        root: { x: 15, y: -2, rot: -360 },
        // Chest-up, arms out to the sides, feet together — a sharp
        // "stuck it" finish rather than a loose standing pose.
        shoulderL: { rot: 78 },
        shoulderR: { rot: -78 },
        hipL: { rot: 2 },
        hipR: { rot: -2 },
        kneeL: { rot: -6 },
        kneeR: { rot: -6 },
      },
    },
    {
      t: 1,
      label: "celebrate",
      ease: easeOutBack2D,
      pose: {
        root: { x: 15, y: -8, rot: -360 },
        shoulderL: { rot: 130 },
        shoulderR: { rot: -130 },
        hipL: { rot: 2 },
        hipR: { rot: -2 },
      },
    },
  ],
};
