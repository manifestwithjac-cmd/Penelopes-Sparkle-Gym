import type { TrickAnimationDef2D } from "../poseUtils2d";
import { easeInOutQuad2D, easeOutBack2D, linear2D } from "../poseUtils2d";

/**
 * No root rotation at all — unlike every other trick, a backbend is a
 * held ARCH, not a spin or a jump. Torso and head tip back together,
 * arms reach up and back overhead, knees soften, and she holds the arch
 * before curling back up to standing.
 */
export const BACKBEND_2D: TrickAnimationDef2D = {
  id: "backbend",
  durationMs: 1800,
  keyframes: [
    {
      t: 0,
      label: "ready",
      ease: easeInOutQuad2D,
      pose: {
        root: { x: 0, y: 0, rot: 0 },
        shoulderL: { rot: 6 },
        shoulderR: { rot: -6 },
        hipL: { rot: 2 },
        hipR: { rot: -2 },
      },
    },
    {
      t: 0.25,
      label: "reach-up",
      ease: easeInOutQuad2D,
      pose: {
        root: { x: 0, y: 3, rot: 0 },
        torso: { rot: 16 },
        head: { rot: 18 },
        shoulderL: { rot: 100 },
        shoulderR: { rot: -100 },
        hipL: { rot: 4 },
        hipR: { rot: -4 },
        kneeL: { rot: -8 },
        kneeR: { rot: 8 },
      },
    },
    {
      t: 0.45,
      label: "arch-1",
      ease: linear2D,
      pose: {
        // Head rotates further than torso (matching how a real backbend
        // drops the head back most dramatically), and root.y sinks more —
        // pushed well past the first pass since a front-facing flat
        // cutout can't show a true side-view arch silhouette, so the
        // lean needs to be exaggerated to read as "backbend" at all.
        root: { x: 3, y: 9, rot: 0 },
        torso: { rot: 32 },
        head: { rot: 42 },
        shoulderL: { rot: 128 },
        shoulderR: { rot: -128 },
        hipL: { rot: 8 },
        hipR: { rot: -8 },
        kneeL: { rot: -20 },
        kneeR: { rot: 20 },
      },
    },
    {
      t: 0.65,
      label: "arch-hold",
      ease: linear2D,
      pose: {
        root: { x: 3, y: 10, rot: 0 },
        torso: { rot: 35 },
        head: { rot: 46 },
        shoulderL: { rot: 130 },
        shoulderR: { rot: -130 },
        hipL: { rot: 8 },
        hipR: { rot: -8 },
        kneeL: { rot: -22 },
        kneeR: { rot: 22 },
      },
    },
    {
      t: 0.85,
      label: "curl-back-up",
      ease: easeInOutQuad2D,
      pose: {
        root: { x: 1, y: 1, rot: 0 },
        torso: { rot: 6 },
        head: { rot: 4 },
        shoulderL: { rot: 40 },
        shoulderR: { rot: -40 },
        hipL: { rot: 3 },
        hipR: { rot: -3 },
        kneeL: { rot: -4 },
        kneeR: { rot: 4 },
      },
    },
    {
      t: 1,
      label: "stand-celebrate",
      ease: easeOutBack2D,
      pose: {
        root: { x: 0, y: -5, rot: 0 },
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
