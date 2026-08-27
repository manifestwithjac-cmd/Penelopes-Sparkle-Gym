import type { TrickAnimationDef2D } from "../poseUtils2d";
import { easeInOutQuad2D, easeOutBack2D, linear2D } from "../poseUtils2d";

/**
 * A vertical jump (root.y arcs up then back down — no root rotation at
 * all) with the legs splitting at the peak, one kicked up high and one
 * trailing low. A hip near 90-115° (the arms' outward-reach sweet spot)
 * only swings a LEG to horizontal, hip height — since the hip pivot
 * sits lower on the body than the shoulder pivot does, that doesn't
 * read as "kicked up" at all. A real high kick needs to keep going
 * toward ~150-165°, well past horizontal and back up alongside the
 * torso.
 */
export const SPLIT_JUMP_2D: TrickAnimationDef2D = {
  id: "split_jump",
  durationMs: 1200,
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
      t: 0.2,
      label: "crouch",
      ease: easeInOutQuad2D,
      pose: {
        root: { x: 0, y: 8, rot: 0 },
        shoulderL: { rot: -30 },
        shoulderR: { rot: 30 },
        hipL: { rot: 20 },
        hipR: { rot: -20 },
        kneeL: { rot: 40 },
        kneeR: { rot: 40 },
      },
    },
    {
      t: 0.45,
      label: "launch",
      ease: linear2D,
      pose: {
        root: { x: 0, y: -14, rot: 0 },
        shoulderL: { rot: 70 },
        shoulderR: { rot: -70 },
        hipL: { rot: 110 },
        hipR: { rot: -25 },
        kneeL: { rot: 4 },
      },
    },
    {
      t: 0.55,
      label: "split-peak",
      ease: linear2D,
      pose: {
        root: { x: 0, y: -18, rot: 0 },
        shoulderL: { rot: 100 },
        shoulderR: { rot: -100 },
        // Front leg kicked all the way up alongside the torso (~160°,
        // well past horizontal), back leg only a small opposite
        // rotation — a leap split, not a symmetric starfish V.
        hipL: { rot: 160 },
        hipR: { rot: -35 },
        kneeL: { rot: 2 },
        kneeR: { rot: 4 },
      },
    },
    {
      t: 0.75,
      label: "descend",
      ease: linear2D,
      pose: {
        root: { x: 0, y: -6, rot: 0 },
        shoulderL: { rot: 40 },
        shoulderR: { rot: -40 },
        hipL: { rot: 90 },
        hipR: { rot: -15 },
        kneeL: { rot: 6 },
        kneeR: { rot: 15 },
      },
    },
    {
      t: 0.88,
      label: "land",
      ease: easeInOutQuad2D,
      pose: {
        root: { x: 0, y: 4, rot: 0 },
        shoulderL: { rot: 16 },
        shoulderR: { rot: -16 },
        hipL: { rot: 8 },
        hipR: { rot: -8 },
        kneeL: { rot: 22 },
        kneeR: { rot: 22 },
      },
    },
    {
      t: 1,
      label: "celebrate",
      ease: easeOutBack2D,
      pose: {
        root: { x: 0, y: -6, rot: 0 },
        shoulderL: { rot: 130 },
        shoulderR: { rot: -130 },
        hipL: { rot: 2 },
        hipR: { rot: -2 },
      },
    },
  ],
};
