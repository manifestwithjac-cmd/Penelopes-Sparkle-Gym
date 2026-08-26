// The flat 2D figure's "skeleton": a fixed list of named joints, each an
// <g> in a parent-child SVG hierarchy (see RiggedGymnastFigure.tsx).
// Deliberately smaller than the old 3D rig's joint list (no wrists/ankles)
// — at the size this figure renders on screen, per-limb-segment rotation
// already reads clearly; wrist/ankle detail would be invisible and just
// more keyframe numbers to author per trick.
export const JOINT_NAMES_2D = [
  "root", // whole-figure position (px, py) + the big cartwheel spin (rot)
  "torso",
  "head",
  "shoulderL",
  "elbowL",
  "shoulderR",
  "elbowR",
  "hipL",
  "kneeL",
  "hipR",
  "kneeR",
] as const;

export type JointName2D = (typeof JOINT_NAMES_2D)[number];

/** Local rotation in degrees (SVG's rotate(), clockwise-positive) +
 * optional root-only translation across the floor mat, in the SVG's own
 * viewBox units. */
export interface JointTransform2D {
  rot?: number;
  /** Root joint only. */
  x?: number;
  y?: number;
}

export type Pose2D = Partial<Record<JointName2D, JointTransform2D>>;

/** Center point (in the figure's own viewBox units) that root.rot spins
 * around — roughly her torso/hip center, so a cartwheel's 360° reads as
 * her wheeling around her own body instead of orbiting the SVG's corner. */
export const ROOT_PIVOT = { x: 50, y: 80 };

/** Arms-down, standing-straight default — matches the proportions/limb
 * rest angles of the original static GymnastFigure.tsx so she reads as
 * the same character standing still. */
export const REST_POSE_2D: Required<Pick<Pose2D, (typeof JOINT_NAMES_2D)[number]>> = {
  root: { x: 0, y: 0, rot: 0 },
  torso: { rot: 0 },
  head: { rot: 0 },
  shoulderL: { rot: 6 },
  elbowL: { rot: 4 },
  shoulderR: { rot: -6 },
  elbowR: { rot: -4 },
  hipL: { rot: 2 },
  kneeL: { rot: 0 },
  hipR: { rot: -2 },
  kneeR: { rot: 0 },
};
