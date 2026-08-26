import type { JointName } from "./joints";

// Maps our joint names to this specific candidate GLB's bone names —
// inspected directly from the file (see the candidate evaluation), not
// guessed. "root" is deliberately absent: it's driven by a wrapper <group>
// we create ourselves (GltfPenelopeRig.tsx), not a skeleton bone, so the
// existing floor-position/big-spin semantics in poseUtils.ts need no
// special-casing. "Waist", "Spine02", "NeckTwist01/2", "Pelvis", and every
// *Twist* bone are intentionally left unmapped for this validation pass —
// they stay in their bind pose, which is a known, acceptable rough edge
// until the art-cleanup phase.
export const CANDIDATE_A_BONE_MAP: Partial<Record<JointName, string>> = {
  hips: "Hip",
  torso: "Spine01",
  head: "Head",
  shoulderL: "L_Upperarm",
  elbowL: "L_Forearm",
  wristL: "L_Hand",
  shoulderR: "R_Upperarm",
  elbowR: "R_Forearm",
  wristR: "R_Hand",
  hipL: "L_Thigh",
  kneeL: "L_Calf",
  ankleL: "L_Foot",
  hipR: "R_Thigh",
  kneeR: "R_Calf",
  ankleR: "R_Foot",
};
