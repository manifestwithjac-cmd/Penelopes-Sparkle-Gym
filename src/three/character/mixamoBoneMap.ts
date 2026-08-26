import type { JointName } from "./joints";

// Maps our joint names to Candidate C's bone names — a standard Mixamo-
// convention humanoid skeleton. Three's FBXLoader strips the ":" from the
// source file's "mixamorig:LeftArm"-style names, so these have none.
// "root" is absent for the same reason as gltfBoneMap.ts: it's driven by
// a wrapper <group> we create ourselves, not a skeleton bone.
export const CANDIDATE_C_BONE_MAP: Partial<Record<JointName, string>> = {
  hips: "mixamorigHips",
  torso: "mixamorigSpine1",
  head: "mixamorigHead",
  shoulderL: "mixamorigLeftArm",
  elbowL: "mixamorigLeftForeArm",
  wristL: "mixamorigLeftHand",
  shoulderR: "mixamorigRightArm",
  elbowR: "mixamorigRightForeArm",
  wristR: "mixamorigRightHand",
  hipL: "mixamorigLeftUpLeg",
  kneeL: "mixamorigLeftLeg",
  ankleL: "mixamorigLeftFoot",
  hipR: "mixamorigRightUpLeg",
  kneeR: "mixamorigRightLeg",
  ankleR: "mixamorigRightFoot",
};
