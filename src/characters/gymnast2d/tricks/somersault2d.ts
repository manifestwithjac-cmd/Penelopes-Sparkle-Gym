import type { TrickAnimationDef2D } from "../poseUtils2d";
import { easeInOutQuad2D, easeOutBack2D, linear2D } from "../poseUtils2d";

/**
 * A forward tuck roll: unlike cartwheel2d.ts's wide-open starfish spin,
 * a somersault stays curled up small the whole way around — both knees
 * pulled up together (not splayed apart) and both arms wrapped in tight
 * — so root still spins a full 360° and travels forward, but the
 * silhouette reads as a compact tumbling ball instead of a spread cross.
 * RiggedGymnastFigure's head has a real back-of-head view that swaps in
 * automatically partway through root's rotation (see poseUtils2d.ts's
 * applyPose2D), so the spin itself now reads as an actual roll rather
 * than the same face staying visible at every angle.
 */
export const SOMERSAULT_2D: TrickAnimationDef2D = {
  id: "somersault",
  durationMs: 1500,
  keyframes: [
    {
      t: 0,
      label: "ready",
      ease: easeInOutQuad2D,
      pose: {
        root: { x: -14, y: 0, rot: 0 },
        shoulderL: { rot: 6 },
        shoulderR: { rot: -6 },
        hipL: { rot: 2 },
        hipR: { rot: -2 },
      },
    },
    {
      t: 0.15,
      label: "crouch",
      ease: easeInOutQuad2D,
      pose: {
        root: { x: -11, y: 10, rot: 0 },
        shoulderL: { rot: 40 },
        shoulderR: { rot: -40 },
        elbowL: { rot: 60 },
        elbowR: { rot: -60 },
        hipL: { rot: -60 },
        hipR: { rot: -60 },
        kneeL: { rot: 90 },
        kneeR: { rot: 90 },
      },
    },
    {
      t: 0.35,
      label: "tuck-roll-1",
      ease: linear2D,
      pose: {
        root: { x: -4, y: 4, rot: -130 },
        shoulderL: { rot: 55 },
        shoulderR: { rot: -55 },
        elbowL: { rot: 85 },
        elbowR: { rot: -85 },
        hipL: { rot: -110 },
        hipR: { rot: -110 },
        kneeL: { rot: 120 },
        kneeR: { rot: 120 },
      },
    },
    {
      t: 0.55,
      label: "tuck-roll-2",
      ease: linear2D,
      pose: {
        root: { x: 3, y: 4, rot: -230 },
        shoulderL: { rot: 55 },
        shoulderR: { rot: -55 },
        elbowL: { rot: 85 },
        elbowR: { rot: -85 },
        hipL: { rot: -110 },
        hipR: { rot: -110 },
        kneeL: { rot: 120 },
        kneeR: { rot: 120 },
      },
    },
    {
      t: 0.78,
      label: "unfold",
      ease: linear2D,
      pose: {
        root: { x: 9, y: 6, rot: -335 },
        shoulderL: { rot: 30 },
        shoulderR: { rot: -30 },
        elbowL: { rot: 30 },
        elbowR: { rot: -30 },
        hipL: { rot: -40 },
        hipR: { rot: -40 },
        kneeL: { rot: 40 },
        kneeR: { rot: 40 },
      },
    },
    {
      t: 0.9,
      label: "stand",
      ease: easeInOutQuad2D,
      pose: {
        root: { x: 13, y: 2, rot: -360 },
        shoulderL: { rot: 20 },
        shoulderR: { rot: -20 },
        elbowL: { rot: 6 },
        elbowR: { rot: -6 },
        hipL: { rot: 6 },
        hipR: { rot: -6 },
        kneeL: { rot: -6 },
        kneeR: { rot: 6 },
      },
    },
    {
      t: 1,
      label: "celebrate",
      ease: easeOutBack2D,
      pose: {
        root: { x: 13, y: -6, rot: -360 },
        shoulderL: { rot: 130 },
        shoulderR: { rot: -130 },
        hipL: { rot: 2 },
        hipR: { rot: -2 },
      },
    },
  ],
};
