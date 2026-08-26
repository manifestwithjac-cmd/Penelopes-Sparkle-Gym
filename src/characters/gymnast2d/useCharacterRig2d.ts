import { useMemo } from "react";
import { JOINT_NAMES_2D, type JointName2D } from "./rig2d";

export type RigRefs2D = Record<JointName2D, React.RefObject<SVGGElement | null>>;

/** Creates one stable ref per joint. RiggedGymnastFigure attaches these to
 * its <g> elements; the animation system (usePlayTrick2d) writes directly
 * into ref.current's transform attribute every frame. */
export function useCharacterRig2d(): RigRefs2D {
  return useMemo(() => {
    const refs = {} as RigRefs2D;
    for (const name of JOINT_NAMES_2D) {
      refs[name] = { current: null };
    }
    return refs;
  }, []);
}
