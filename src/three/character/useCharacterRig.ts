import { useMemo } from "react";
import type { Group } from "three";
import { JOINT_NAMES, type JointName } from "./joints";

export type RigRefs = Record<JointName, React.RefObject<Group | null>>;

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
