import type { JointName } from "./joints";

// Maps our joint names to Candidate C's bone names, for the cleaned-up
// GLB re-export (see the Blender cleanup pass that produced
// StylizedGirl-clean.glb: removed an unused alternate "rain" outfit,
// mouth-interior geometry, ~28 animator-only IK/FK control curves, and a
// duplicate hair mesh — 106k triangles down to ~53k, 7.3MB down to
// 2.4MB), and correctly merged what was five duplicate per-mesh skeleton
// copies into one shared skeleton — so this uses GltfPenelopeRig
// directly, no skeleton-dedup workaround needed.
//
// The source glTF JSON has the original Mixamo names with colons
// ("mixamorig:Hips") — confirmed by parsing the file directly — but
// three's GLTFLoader sanitizes node names at load time (same as
// FBXLoader did for the raw FBX) and strips them, so the names actually
// reachable via getObjectByName() at runtime have none. Confirmed by
// dumping the loaded scene's real object names (CandidatePreview.tsx's
// list-names debug mode) rather than assuming.
export const CANDIDATE_C_GLB_BONE_MAP: Partial<Record<JointName, string>> = {
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
