import type { JointName } from "./joints";

// Maps our joint names to Candidate C's bone names, for the cleaned-up
// GLB re-export (see the Blender cleanup pass that produced
// StylizedGirl-clean.glb: removed an unused alternate "rain" outfit,
// mouth-interior geometry, ~28 animator-only IK/FK control curves, and a
// duplicate hair mesh — 106k triangles down to ~53k, 7.3MB down to
// 2.4MB). Unlike the raw FBX loaded via three's FBXLoader, glTF's loader
// does NOT strip the ":" from Mixamo-convention names, and Blender's
// glTF export correctly merged what was five duplicate per-mesh skeleton
// copies into one shared skeleton — so this uses GltfPenelopeRig directly,
// no skeleton-dedup workaround needed (contrast with mixamoBoneMap.ts).
export const CANDIDATE_C_GLB_BONE_MAP: Partial<Record<JointName, string>> = {
  hips: "mixamorig:Hips",
  torso: "mixamorig:Spine1",
  head: "mixamorig:Head",
  shoulderL: "mixamorig:LeftArm",
  elbowL: "mixamorig:LeftForeArm",
  wristL: "mixamorig:LeftHand",
  shoulderR: "mixamorig:RightArm",
  elbowR: "mixamorig:RightForeArm",
  wristR: "mixamorig:RightHand",
  hipL: "mixamorig:LeftUpLeg",
  kneeL: "mixamorig:LeftLeg",
  ankleL: "mixamorig:LeftFoot",
  hipR: "mixamorig:RightUpLeg",
  kneeR: "mixamorig:RightLeg",
  ankleR: "mixamorig:RightFoot",
};
