import type { TrickAnimationDef2D } from "../poseUtils2d";
import { easeInOutQuad2D, easeOutBack2D, linear2D } from "../poseUtils2d";

/**
 * A flat-cutout cartwheel: root spins a full 360° (the "wheel") while
 * traveling sideways, with arms/legs flinging out into a wide star/X at
 * the inverted point and gathering back in to land — the 2D-cutout
 * equivalent of the old 3D rig's root.rz + limb-articulation approach
 * (three/animation/tricks/cartwheel.ts), re-authored from scratch since a
 * flat side-view spin can't reuse rotation values tuned for a 3D camera.
 *
 * Phases mirror the 3D version's: ready -> windup -> launch(star) ->
 * inverted -> gather/land -> stand -> celebrate.
 */
export const CARTWHEEL_2D: TrickAnimationDef2D = {
  id: "cartwheel",
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
        shoulderL: { rot: 30 },
        shoulderR: { rot: -30 },
        elbowL: { rot: 15 },
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
        shoulderL: { rot: -105 },
        shoulderR: { rot: 105 },
        elbowL: { rot: -10 },
        elbowR: { rot: 10 },
        hipL: { rot: -50 },
        hipR: { rot: 50 },
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
        shoulderL: { rot: -115 },
        shoulderR: { rot: 115 },
        elbowL: { rot: -15 },
        elbowR: { rot: 15 },
        hipL: { rot: -58 },
        hipR: { rot: 58 },
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
        shoulderL: { rot: -60 },
        shoulderR: { rot: 60 },
        hipL: { rot: -25 },
        hipR: { rot: 25 },
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
        shoulderL: { rot: 22 },
        shoulderR: { rot: -22 },
        elbowL: { rot: 8 },
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
        // +130/-130 swings each arm up and outward (a "cheer" V) from its
        // hanging-down rest angle — capped short of straight-up so the
        // tip stays outside the hair's silhouette (hair paints last/on
        // top of the arms for every other pose, where that's correct,
        // but a raised-enough arm would otherwise end up hidden under it).
        shoulderL: { rot: 130 },
        shoulderR: { rot: -130 },
        hipL: { rot: 2 },
        hipR: { rot: -2 },
      },
    },
  ],
};
