import type { LeotardPattern } from "../../data/types";

export interface LeotardLook {
  color: string;
  metalness: number;
  roughness: number;
}

/**
 * Reduces any leotard pattern to one material look for the 3D torso/hips.
 * Solid → its color. Gradient → the midpoint (cheap, reads fine at this
 * scale). Sparkle/print → the base color with a slight shimmer (lower
 * roughness, a touch of metalness) so glitter leotards still read as
 * distinct from a flat solid even without a real texture yet.
 *
 * This is the seam described in data/types.ts's LeotardPattern: swapping
 * in real fabric textures later means only this function changes, not any
 * caller (PenelopeRig, the shop, etc.).
 */
export function leotardLook(pattern: LeotardPattern): LeotardLook {
  switch (pattern.kind) {
    case "solid":
      return { color: pattern.color, metalness: 0, roughness: 0.6 };
    case "gradient":
      return { color: mixHex(pattern.from, pattern.to, 0.5), metalness: 0.05, roughness: 0.5 };
    case "sparkle":
      return { color: pattern.base, metalness: 0.35, roughness: 0.25 };
    case "print":
      return { color: pattern.base, metalness: 0, roughness: 0.55 };
  }
}

function mixHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `#${[r, g, bl].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
