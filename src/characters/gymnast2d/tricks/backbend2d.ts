import type { TrickAnimationDef2D } from "../poseUtils2d";
import { easeInOutQuad2D, easeOutBack2D, linear2D } from "../poseUtils2d";

/**
 * No root SPIN at all — unlike every other trick, a backbend is a held
 * ARCH, not a wheel or a jump. Root does tip back a little (up to -12°)
 * so the whole figure leans together rather than just her head/torso
 * swiveling while her legs stand planted, but it never comes close to
 * the ~90° threshold that would swap in the back-of-head view (see
 * poseUtils2d.ts's applyPose2D) — she stays facing the camera the whole
 * time, which is the point of this being an arch and not a walkover.
 * Torso carries most of the arch's rotation now; head only tips a
 * little (previously the head rotated further than the torso to fake
 * an arch, but the head's side-hair strands are long rects offset from
 * its pivot, so anything past ~20° of head rotation swept them out into
 * a visible diagonal streak past her shoulder — torso has no such
 * side-effect, so it does the heavy lifting instead). Knees soften more
 * than before for a genuine athletic crouch under the arch.
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
        root: { x: 0, y: 2, rot: -4 },
        torso: { rot: 14 },
        head: { rot: 8 },
        shoulderL: { rot: 95 },
        shoulderR: { rot: -95 },
        hipL: { rot: 4 },
        hipR: { rot: -4 },
        kneeL: { rot: -6 },
        kneeR: { rot: 6 },
      },
    },
    {
      t: 0.45,
      label: "arch-1",
      ease: linear2D,
      pose: {
        root: { x: 2, y: 7, rot: -10 },
        torso: { rot: 28 },
        head: { rot: 14 },
        shoulderL: { rot: 120 },
        shoulderR: { rot: -120 },
        hipL: { rot: 8 },
        hipR: { rot: -8 },
        kneeL: { rot: -18 },
        kneeR: { rot: 18 },
      },
    },
    {
      t: 0.65,
      label: "arch-hold",
      ease: linear2D,
      pose: {
        root: { x: 2, y: 8, rot: -12 },
        torso: { rot: 30 },
        head: { rot: 16 },
        shoulderL: { rot: 122 },
        shoulderR: { rot: -122 },
        hipL: { rot: 8 },
        hipR: { rot: -8 },
        kneeL: { rot: -20 },
        kneeR: { rot: 20 },
      },
    },
    {
      t: 0.85,
      label: "curl-back-up",
      ease: easeInOutQuad2D,
      pose: {
        root: { x: 1, y: 1, rot: -4 },
        torso: { rot: 6 },
        head: { rot: 3 },
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
