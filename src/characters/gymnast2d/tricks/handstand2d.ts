import type { TrickAnimationDef2D } from "../poseUtils2d";
import { easeInOutQuad2D, easeOutBack2D, linear2D } from "../poseUtils2d";

/**
 * Kicks up to a HALF root rotation (180°, not the full 360° wheel a
 * cartwheel/somersault does) and holds there — legs stay together
 * (straight, near their rest angle) rather than splitting or splaying,
 * since root's own rotation is what carries them "up." Arms, though,
 * rotate almost all the way around (~175°, nearly the reverse of their
 * hanging-at-the-side rest angle) so that once root's own -180° flip is
 * applied, they end up extending straight past her head toward the
 * ground — reading as planted, weight-bearing arms, not arms left
 * hanging at her sides (which is what kept this looking like a headstand
 * instead of a handstand). Elbows stay near their straight rest angle for
 * a rigid, weight-bearing line. The hold spans a real chunk of the
 * timeline (t 0.35-0.65) so it reads as "balancing," not a blink-and-miss
 * beat.
 */
export const HANDSTAND_2D: TrickAnimationDef2D = {
  id: "handstand",
  durationMs: 2000,
  keyframes: [
    {
      t: 0,
      label: "ready",
      ease: easeInOutQuad2D,
      pose: {
        root: { x: -10, y: 0, rot: 0 },
        shoulderL: { rot: 6 },
        shoulderR: { rot: -6 },
        hipL: { rot: 2 },
        hipR: { rot: -2 },
      },
    },
    {
      t: 0.18,
      label: "kick-up",
      ease: easeInOutQuad2D,
      pose: {
        root: { x: -6, y: 2, rot: -90 },
        shoulderL: { rot: 95 },
        shoulderR: { rot: -95 },
        elbowL: { rot: 10 },
        elbowR: { rot: -10 },
        hipL: { rot: -20 },
        hipR: { rot: 40 },
        kneeR: { rot: 25 },
      },
    },
    {
      t: 0.35,
      label: "handstand-hold-1",
      ease: easeInOutQuad2D,
      pose: {
        root: { x: -2, y: -4, rot: -178 },
        shoulderL: { rot: 172 },
        shoulderR: { rot: -172 },
        elbowL: { rot: 4 },
        elbowR: { rot: -4 },
        hipL: { rot: -4 },
        hipR: { rot: 4 },
      },
    },
    {
      t: 0.5,
      label: "handstand-hold-2",
      ease: easeInOutQuad2D,
      pose: {
        root: { x: 0, y: -4, rot: -182 },
        shoulderL: { rot: 176 },
        shoulderR: { rot: -176 },
        elbowL: { rot: 2 },
        elbowR: { rot: -2 },
        hipL: { rot: 4 },
        hipR: { rot: -4 },
      },
    },
    {
      t: 0.65,
      label: "handstand-hold-3",
      ease: linear2D,
      pose: {
        root: { x: 2, y: -4, rot: -178 },
        shoulderL: { rot: 172 },
        shoulderR: { rot: -172 },
        elbowL: { rot: 4 },
        elbowR: { rot: -4 },
        hipL: { rot: -3 },
        hipR: { rot: 3 },
      },
    },
    {
      t: 0.82,
      label: "descend",
      ease: easeInOutQuad2D,
      pose: {
        root: { x: 6, y: 2, rot: -90 },
        shoulderL: { rot: 95 },
        shoulderR: { rot: -95 },
        elbowL: { rot: 10 },
        elbowR: { rot: -10 },
        hipL: { rot: 40 },
        hipR: { rot: -20 },
        kneeL: { rot: 25 },
      },
    },
    {
      t: 0.92,
      label: "stand",
      ease: easeInOutQuad2D,
      pose: {
        // Handstand only ever rotates down to -180 and back — unlike the
        // full-spin tricks, "upright again" here means back to 0, not
        // another -360 (which would read as one extra wild spin).
        root: { x: 10, y: 2, rot: 0 },
        shoulderL: { rot: 20 },
        shoulderR: { rot: -20 },
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
        root: { x: 10, y: -6, rot: 0 },
        shoulderL: { rot: 130 },
        shoulderR: { rot: -130 },
        hipL: { rot: 2 },
        hipR: { rot: -2 },
      },
    },
  ],
};
