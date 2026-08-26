import type { TrickAnimationDef } from "../types";
import { easeInOutQuad, easeOutBack, linear } from "../poseUtils";

const UP = Math.PI;
const OUT = 0.05;

// The free arm (shoulderL) needs to read as "staying out, away from the
// floor" through the whole rotation, not just hold a fixed local angle —
// root spins the body about world Z, and any local arm direction with an
// X/Y component sweeps around WITH that spin, so a "fixed" local angle
// still ends up pointing at the floor exactly when the reaching arm does
// (verified by rendering it — first attempt, counter-rotating rx, made
// them symmetric instead of different). The actual fix: root's Z-rotation
// only mixes X and Y — a direction pointing purely along local Z (i.e.
// rx = ±PI/2, arm aimed forward/back rather than up/down) is invariant
// under it, so holding the free arm there keeps it reading as "extended,
// not reaching for the ground" at every point in the spin.
const FREE_ARM_RX = Math.PI / 2;

/**
 * Penelope's signature move. Shares the cartwheel's body-wheeling motion
 * (root rotation + travel) but only the right hand ever plants — the left
 * arm stays extended up/out through the whole rotation instead of also
 * reaching down, which is the one visible difference the spec calls for.
 */
export const ONE_HANDED_CARTWHEEL: TrickAnimationDef = {
  id: "one_handed_cartwheel",
  durationMs: 1600,
  keyframes: [
    {
      t: 0,
      label: "ready",
      ease: easeInOutQuad,
      pose: {
        root: { px: -0.36, rz: 0 },
        shoulderL: { rx: FREE_ARM_RX, rz: 0.3 },
        shoulderR: { rx: UP, rz: -0.15 },
        hipL: { rz: 0.05 },
        hipR: { rz: -0.05 },
      },
    },
    {
      t: 0.12,
      label: "windup",
      ease: easeInOutQuad,
      pose: {
        root: { px: -0.32, rz: -0.35, py: -0.04 },
        shoulderR: { rx: UP * 0.55, rz: -0.3 },
        shoulderL: { rx: FREE_ARM_RX, rz: 0.3 },
        hipL: { rx: -0.3 },
      },
    },
    {
      t: 0.3,
      label: "hand-down",
      ease: linear,
      pose: {
        root: { px: -0.12, rz: -1.15, py: 0 },
        shoulderR: { rx: OUT, rz: -0.1 },
        shoulderL: { rx: FREE_ARM_RX, rz: 0.3 },
        hipL: { rx: -0.9, rz: 0.35 },
        hipR: { rx: 0.15 },
        kneeL: { rx: 0.2 },
      },
    },
    {
      t: 0.5,
      label: "inverted-one-hand",
      ease: linear,
      pose: {
        root: { px: 0.1, rz: -Math.PI, py: 0.06 },
        shoulderL: { rx: FREE_ARM_RX, rz: 0.3 },
        shoulderR: { rx: OUT, rz: -0.1 },
        hipL: { rx: 0, rz: 1.15 },
        hipR: { rx: 0, rz: -1.15 },
        kneeL: { rx: 0.15 },
        kneeR: { rx: 0.15 },
      },
    },
    {
      t: 0.7,
      label: "leg1-down-hand-lifts",
      ease: linear,
      pose: {
        root: { px: 0.22, rz: -Math.PI * 1.62, py: 0 },
        shoulderR: { rx: UP * 0.6, rz: -0.25 },
        shoulderL: { rx: FREE_ARM_RX, rz: 0.3 },
        hipR: { rx: -0.6, rz: -0.3 },
        hipL: { rx: 0.2, rz: 0.3 },
        kneeR: { rx: 0.2 },
      },
    },
    {
      t: 0.85,
      label: "stand",
      ease: easeInOutQuad,
      pose: {
        root: { px: 0.34, rz: -Math.PI * 2, py: -0.03 },
        shoulderL: { rx: FREE_ARM_RX, rz: 0.35 },
        shoulderR: { rx: UP * 0.7, rz: -0.35 },
        hipL: { rz: 0.05 },
        hipR: { rz: -0.05 },
        kneeL: { rx: 0.1 },
        kneeR: { rx: 0.1 },
      },
    },
    {
      t: 1,
      label: "celebrate",
      ease: easeOutBack,
      pose: {
        root: { px: 0.34, rz: -Math.PI * 2, py: 0.1 },
        shoulderL: { rx: FREE_ARM_RX, rz: 0.5 },
        shoulderR: { rx: UP, rz: -0.5 },
        hipL: { rz: 0.05 },
        hipR: { rz: -0.05 },
      },
    },
  ],
};
