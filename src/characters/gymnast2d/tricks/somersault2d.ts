import type { TrickAnimationDef2D } from "../poseUtils2d";
import { easeInOutQuad2D, easeOutBack2D, linear2D } from "../poseUtils2d";

/**
 * A forward tuck roll AWAY from the camera, not an in-plane spin. A real
 * somersault rotates around an axis pointing straight at the viewer —
 * an axis this flat front-facing cutout has no art or perspective to
 * actually depict (unlike Cartwheel, whose sideways wheel really does
 * rotate in the plane you're viewing it from, which is why that one
 * keeps its root.rot spin). Root barely rotates here at all; instead
 * root.scaleY squashes down toward the middle of the roll — the classic
 * 2D "squash" trick for suggesting a body tipping away from/back toward
 * the camera — while the tuck itself (knees pulled up together, arms
 * wrapped in) still does the work of reading as a curled, rolling ball.
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
        root: { x: -14, y: 0, rot: 0, scaleY: 1 },
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
        root: { x: -11, y: 9, rot: 0, scaleY: 0.85 },
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
        root: { x: -4, y: 5, rot: -8, scaleY: 0.48 },
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
        root: { x: 3, y: 5, rot: 8, scaleY: 0.46 },
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
        root: { x: 9, y: 6, rot: 0, scaleY: 0.78 },
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
        root: { x: 13, y: 2, rot: 0, scaleY: 1 },
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
        root: { x: 13, y: -6, rot: 0, scaleY: 1 },
        shoulderL: { rot: 130 },
        shoulderR: { rot: -130 },
        hipL: { rot: 2 },
        hipR: { rot: -2 },
      },
    },
  ],
};
