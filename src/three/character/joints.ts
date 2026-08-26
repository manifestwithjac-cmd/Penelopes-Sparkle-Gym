// The character "skeleton": a fixed list of named joints, each an
// Object3D group in a parent-child hierarchy (see PenelopeRig.tsx). This
// is a simplified stand-in for real bone/skinning — appropriate for a
// stylized low-poly placeholder character — but it's a genuine articulated
// hierarchy: rotating "shoulderR" swings everything downstream of it
// (elbowR, wristR) exactly like a real joint would, satisfying the "limbs
// must move, not just the whole body" requirement.
//
// Swapping in a rigged GLB later means replacing PenelopeRig's meshes with
// SkinnedMesh + a real THREE.Skeleton and mapping these same joint names
// to bone names — the animation system (pose keyframes + interpolation)
// doesn't need to change, since it only ever reads/writes rotation values
// by joint name.
export const JOINT_NAMES = [
  "root", // whole-body position + the big cartwheel rotation
  "hips",
  "torso",
  "head",
  "shoulderL",
  "elbowL",
  "wristL",
  "shoulderR",
  "elbowR",
  "wristR",
  "hipL",
  "kneeL",
  "ankleL",
  "hipR",
  "kneeR",
  "ankleR",
] as const;

export type JointName = (typeof JOINT_NAMES)[number];

/** Local rotation (radians) + optional root-only position, in a plain
 * serializable shape so keyframe data can be plain object literals. */
export interface JointTransform {
  rx?: number;
  ry?: number;
  rz?: number;
  /** Root joint only — lateral/vertical travel across the floor mat. */
  px?: number;
  py?: number;
  pz?: number;
}

export type Pose = Partial<Record<JointName, JointTransform>>;

export const REST_POSE: Required<Pick<Pose, (typeof JOINT_NAMES)[number]>> = {
  root: { px: 0, py: 0, pz: 0, rx: 0, ry: 0, rz: 0 },
  hips: { rx: 0, rz: 0 },
  torso: { rx: 0, rz: 0 },
  head: { rx: 0, ry: 0 },
  shoulderL: { rx: 0.15, rz: 0.2 },
  elbowL: { rx: 0.1 },
  wristL: { rx: 0 },
  shoulderR: { rx: 0.15, rz: -0.2 },
  elbowR: { rx: 0.1 },
  wristR: { rx: 0 },
  hipL: { rx: 0, rz: 0.05 },
  kneeL: { rx: 0 },
  ankleL: { rx: 0 },
  hipR: { rx: 0, rz: -0.05 },
  kneeR: { rx: 0 },
  ankleR: { rx: 0 },
};
