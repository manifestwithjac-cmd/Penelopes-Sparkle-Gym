import type { JointName, Pose } from "../character/joints";

export type ResolvedTransform = { rx: number; ry: number; rz: number; px: number; py: number; pz: number };
export type ResolvedPose = Record<JointName, ResolvedTransform>;

export type Easing = (t: number) => number;

export interface Keyframe {
  /** Normalized time within the trick, 0..1, strictly increasing. */
  t: number;
  /** Only joints that differ from rest need to be listed (see resolvePose). */
  pose: Pose;
  ease?: Easing;
  /** Optional label — surfaced for debugging/dev tools, not used at runtime. */
  label?: string;
}

export interface TrickAnimationDef {
  id: string;
  /** Total playback duration in milliseconds. */
  durationMs: number;
  keyframes: Keyframe[];
}
