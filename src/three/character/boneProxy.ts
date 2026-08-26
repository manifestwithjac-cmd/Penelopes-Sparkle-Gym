import { Bone, Euler, Quaternion } from "three";
import type { RigTarget } from "./useCharacterRig";

// A rigged GLB bone's bind-pose local rotation is almost never identity —
// it carries whatever orientation the rig author's DCC tool baked in. Our
// keyframe data (poseUtils.ts) writes small ABSOLUTE Euler values authored
// against the procedural rig, whose <group> joints start at identity, so
// "absolute" and "authored delta" are the same thing there. For a real
// bone they aren't: naively overwriting bone.rotation would discard the
// bind pose and snap the mesh into a broken shape. This proxy captures the
// bind quaternion once, then treats every applyPose() write as a delta
// composed on top of it — same call site, correct result either way.
const tmpEuler = new Euler();
const tmpQuat = new Quaternion();

export function createBoneProxy(bone: Bone): RigTarget {
  const restQuat = bone.quaternion.clone();
  return {
    rotation: {
      set(x: number, y: number, z: number) {
        tmpEuler.set(x, y, z, "XYZ");
        tmpQuat.setFromEuler(tmpEuler);
        bone.quaternion.copy(restQuat).multiply(tmpQuat);
      },
    },
    // Only the root joint's position is ever written by applyPose(), and
    // root is mapped to a wrapper group we create ourselves (see
    // GltfPenelopeRig.tsx), never to a bone proxy — this exists purely so
    // BoneProxy structurally satisfies RigTarget.
    position: bone.position,
  };
}
