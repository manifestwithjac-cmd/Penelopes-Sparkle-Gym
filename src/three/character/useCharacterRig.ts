import { useMemo } from "react";
import { JOINT_NAMES, type JointName } from "./joints";

// The minimal surface applyPose() actually touches. A real THREE.Group
// satisfies this structurally as-is (PenelopeRig's procedural rig), and so
// does a BoneProxy wrapping a loaded skeleton's bone (see boneProxy.ts) —
// this is the seam that lets a rigged GLB character drive the exact same
// keyframe data without poseUtils/usePlayTrick knowing which kind it has.
export interface RigTarget {
  rotation: { set(x: number, y: number, z: number): void };
  position: { x: number; y: number; z: number; set(x: number, y: number, z: number): void };
}

export type RigRefs = Record<JointName, React.RefObject<RigTarget | null>>;

/** Creates one stable ref per joint. PenelopeRig attaches these to its
 * <group> elements; the animation system (usePlayTrick) writes directly
 * into ref.current.rotation/position every frame — imperative, no React
 * state, so a 30-tween-per-frame animation never triggers a re-render. */
export function useCharacterRig(): RigRefs {
  return useMemo(() => {
    const refs = {} as RigRefs;
    for (const name of JOINT_NAMES) {
      refs[name] = { current: null };
    }
    return refs;
  }, []);
}
