import type { TrickAnimationDef } from "../types";
import { easeInOutQuad, easeOutBack, linear } from "../poseUtils";

const UP = Math.PI; // shoulder rx that points the arm straight up from its hanging rest
const OUT = 0.05; // shoulder rx that points the arm down, extended (the "spoke")

/**
 * A cartwheel is modeled as the whole body wheeling around the Z axis
 * (root.rz, a full ~360°) while traveling sideways (root.px) — like a real
 * cartwheel's silhouette — *combined with* the arms/legs actively
 * articulating (reaching down in sequence, legs splitting into a straddle
 * at the inverted point, landing softly) so the motion reads as limbs
 * doing the work, not a rigid model spinning in place.
 *
 * Phases: ready -> lean/reach -> hand1 down -> inverted straddle ->
 * leg1 down/hand1 lifts -> stand -> celebrate.
 */
export const CARTWHEEL: TrickAnimationDef = {
  id: "cartwheel",
  durationMs: 1600,
  keyframes: [
    {
      t: 0,
      label: "ready",
      ease: easeInOutQuad,
      pose: {
        root: { px: -0.36, rz: 0 },
        shoulderL: { rx: UP, rz: 0.15 },
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
        shoulderL: { rx: UP, rz: 0.15 },
        hipL: { rx: -0.3 },
      },
    },
    {
      t: 0.3,
      label: "hand1-down",
      ease: linear,
      pose: {
        root: { px: -0.12, rz: -1.15, py: 0 },
        shoulderR: { rx: OUT, rz: -0.1 },
        shoulderL: { rx: UP * 0.75, rz: 0.2 },
        hipL: { rx: -0.9, rz: 0.35 },
        hipR: { rx: 0.15 },
        kneeL: { rx: 0.2 },
      },
    },
    {
      t: 0.5,
      label: "inverted-straddle",
      ease: linear,
      pose: {
        root: { px: 0.1, rz: -Math.PI, py: 0.06 },
        shoulderL: { rx: OUT, rz: 0.1 },
        shoulderR: { rx: OUT, rz: -0.1 },
        hipL: { rx: 0, rz: 1.15 },
        hipR: { rx: 0, rz: -1.15 },
        kneeL: { rx: 0.15 },
        kneeR: { rx: 0.15 },
      },
    },
    {
      t: 0.7,
      label: "leg1-down-hand1-lifts",
      ease: linear,
      pose: {
        root: { px: 0.22, rz: -Math.PI * 1.62, py: 0 },
        shoulderR: { rx: UP * 0.6, rz: -0.25 },
        shoulderL: { rx: OUT, rz: 0.1 },
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
        shoulderL: { rx: UP * 0.7, rz: 0.35 },
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
        shoulderL: { rx: UP, rz: 0.5 },
        shoulderR: { rx: UP, rz: -0.5 },
        hipL: { rz: 0.05 },
        hipR: { rz: -0.05 },
      },
    },
  ],
};
