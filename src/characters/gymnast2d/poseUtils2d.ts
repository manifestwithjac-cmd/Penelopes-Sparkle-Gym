import { JOINT_NAMES_2D, REST_POSE_2D, ROOT_PIVOT, type Pose2D } from "./rig2d";
import type { RigRefs2D } from "./useCharacterRig2d";

interface ResolvedTransform2D {
  rot: number;
  x: number;
  y: number;
}
export type ResolvedPose2D = Record<(typeof JOINT_NAMES_2D)[number], ResolvedTransform2D>;

export type Easing2D = (t: number) => number;

export interface Keyframe2D {
  /** Normalized time within the trick, 0..1, strictly increasing. */
  t: number;
  pose: Pose2D;
  ease?: Easing2D;
  label?: string;
}

export interface TrickAnimationDef2D {
  id: string;
  durationMs: number;
  keyframes: Keyframe2D[];
}

const ZERO: ResolvedTransform2D = { rot: 0, x: 0, y: 0 };

/** Fills a partial, hand-authored pose out to every joint using
 * REST_POSE_2D as the default — same fan-out pattern as the old 3D
 * poseUtils.ts's resolvePose. */
export function resolvePose2D(overrides: Pose2D): ResolvedPose2D {
  const resolved = {} as ResolvedPose2D;
  for (const name of JOINT_NAMES_2D) {
    const rest = REST_POSE_2D[name];
    const override = overrides[name];
    resolved[name] = {
      rot: override?.rot ?? rest.rot ?? 0,
      x: override?.x ?? rest.x ?? 0,
      y: override?.y ?? rest.y ?? 0,
    };
  }
  return resolved;
}

export const REST_RESOLVED_2D: ResolvedPose2D = resolvePose2D({});

export const easeInOutQuad2D: Easing2D = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const easeOutBack2D: Easing2D = (t) => {
  const c1 = 1.7;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
export const linear2D: Easing2D = (t) => t;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpTransform2D(a: ResolvedTransform2D, b: ResolvedTransform2D, t: number): ResolvedTransform2D {
  return { rot: lerp(a.rot, b.rot, t), x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

/** Given resolved keyframe poses + their t-breakpoints, find the pose at
 * an arbitrary normalized time by lerping the two surrounding keyframes. */
export function samplePoseAt2D(
  resolvedKeyframes: { t: number; pose: ResolvedPose2D; ease: Easing2D }[],
  t: number,
): ResolvedPose2D {
  const clamped = Math.max(0, Math.min(1, t));
  let lo = resolvedKeyframes[0];
  let hi = resolvedKeyframes[resolvedKeyframes.length - 1];
  for (let i = 0; i < resolvedKeyframes.length - 1; i++) {
    if (clamped >= resolvedKeyframes[i].t && clamped <= resolvedKeyframes[i + 1].t) {
      lo = resolvedKeyframes[i];
      hi = resolvedKeyframes[i + 1];
      break;
    }
  }
  const span = hi.t - lo.t;
  const localT = span > 0 ? hi.ease((clamped - lo.t) / span) : 1;

  const out = {} as ResolvedPose2D;
  for (const name of JOINT_NAMES_2D) {
    out[name] = lerpTransform2D(lo.pose[name] ?? ZERO, hi.pose[name] ?? ZERO, localT);
  }
  return out;
}

/** Writes a resolved pose straight into the rig's SVGGElement refs via the
 * `transform` attribute — imperative, no React state, so a fast trick
 * animation never triggers a re-render. */
export function applyPose2D(rig: RigRefs2D, pose: ResolvedPose2D) {
  for (const name of JOINT_NAMES_2D) {
    const el = rig[name].current;
    if (!el) continue;
    const t = pose[name];
    if (name === "root") {
      el.setAttribute(
        "transform",
        `translate(${t.x} ${t.y}) rotate(${t.rot} ${ROOT_PIVOT.x} ${ROOT_PIVOT.y})`,
      );
    } else {
      el.setAttribute("transform", `rotate(${t.rot})`);
    }
  }
}
