import { JOINT_NAMES, REST_POSE, type Pose } from "../character/joints";
import { HIP_HEIGHT_BASE } from "../character/proportions";
import type { ResolvedPose, ResolvedTransform, Easing } from "./types";
import type { RigRefs } from "../character/useCharacterRig";

const ZERO: ResolvedTransform = { rx: 0, ry: 0, rz: 0, px: 0, py: 0, pz: 0 };

/** Fills a partial, hand-authored pose out to every joint using REST_POSE
 * as the default for anything not mentioned — lets trick data only
 * specify what actually moves for a given keyframe. */
export function resolvePose(overrides: Pose): ResolvedPose {
  const resolved = {} as ResolvedPose;
  for (const name of JOINT_NAMES) {
    const rest = REST_POSE[name];
    const override = overrides[name];
    resolved[name] = {
      rx: override?.rx ?? rest.rx ?? 0,
      ry: override?.ry ?? rest.ry ?? 0,
      rz: override?.rz ?? rest.rz ?? 0,
      px: override?.px ?? rest.px ?? 0,
      py: override?.py ?? rest.py ?? 0,
      pz: override?.pz ?? rest.pz ?? 0,
    };
  }
  return resolved;
}

export const REST_RESOLVED: ResolvedPose = resolvePose({});

export const easeInOutQuad: Easing = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const easeOutBack: Easing = (t) => {
  const c1 = 1.7;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
export const linear: Easing = (t) => t;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpTransform(a: ResolvedTransform, b: ResolvedTransform, t: number): ResolvedTransform {
  return {
    rx: lerp(a.rx, b.rx, t),
    ry: lerp(a.ry, b.ry, t),
    rz: lerp(a.rz, b.rz, t),
    px: lerp(a.px, b.px, t),
    py: lerp(a.py, b.py, t),
    pz: lerp(a.pz, b.pz, t),
  };
}

/** Given resolved keyframe poses + their t-breakpoints, find the pose at
 * an arbitrary normalized time by lerping the two surrounding keyframes. */
export function samplePoseAt(
  resolvedKeyframes: { t: number; pose: ResolvedPose; ease: Easing }[],
  t: number,
): ResolvedPose {
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

  const out = {} as ResolvedPose;
  for (const name of JOINT_NAMES) {
    out[name] = lerpTransform(lo.pose[name] ?? ZERO, hi.pose[name] ?? ZERO, localT);
  }
  return out;
}

/** Writes a resolved pose straight into the rig's Object3D refs. Called
 * every frame from useFrame — must stay allocation-free-ish and cheap. */
export function applyPose(rig: RigRefs, pose: ResolvedPose) {
  for (const name of JOINT_NAMES) {
    const group = rig[name].current;
    if (!group) continue;
    const t = pose[name];
    group.rotation.set(t.rx, t.ry, t.rz);
    if (name === "root") {
      group.position.set(t.px, group.position.y, t.pz);
      // root.position.y is set once at mount (hip height) and modulated
      // additively here so a trick can add a small hop without needing to
      // know the base hip height.
      group.position.y = HIP_HEIGHT_BASE + t.py;
    }
  }
}
