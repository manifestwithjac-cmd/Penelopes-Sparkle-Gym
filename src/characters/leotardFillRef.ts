import type { LeotardPattern } from "../data/types";

/** Returns the `fill` attribute value to use on the leotard shape. */
export function leotardFillRef(pattern: LeotardPattern, uid: string): string {
  switch (pattern.kind) {
    case "solid":
      return pattern.color;
    case "gradient":
      return `url(#leo-grad-${uid})`;
    case "sparkle":
      return pattern.base;
    case "print":
      return pattern.base;
  }
}
