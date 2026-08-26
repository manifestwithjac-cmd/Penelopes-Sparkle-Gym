import type { LeotardPattern } from "../data/types";

const MOTIF_EMOJI: Record<string, string> = {
  flower: "🌸",
  strawberry: "🍓",
  donut: "🍩",
  icecream: "🍦",
  milkshake: "🥤",
  cereal: "🥣",
  fruit: "🍇",
  butterfly: "🦋",
};

/**
 * SVG placeholder rendering for a leotard pattern: solid fills are trivial,
 * gradients get a <linearGradient> def, sparkle/print add a few small
 * decorative glyphs scattered on top. Swap-friendly — replace with real
 * artwork later without touching callers of `leotardFillRef`.
 */
export function LeotardDecor({ pattern, uid }: { pattern: LeotardPattern; uid: string }) {
  if (pattern.kind === "gradient") {
    return (
      <defs>
        <linearGradient id={`leo-grad-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={pattern.from} />
          <stop offset="100%" stopColor={pattern.to} />
        </linearGradient>
      </defs>
    );
  }
  if (pattern.kind === "sparkle") {
    const dots = [
      [40, 58],
      [58, 68],
      [46, 80],
      [54, 50],
    ];
    return (
      <g pointerEvents="none">
        {dots.map(([x, y], i) => (
          <path
            key={i}
            d="M0,-4 L1.2,-1.2 L4,0 L1.2,1.2 L0,4 L-1.2,1.2 L-4,0 L-1.2,-1.2 Z"
            fill={pattern.sparkle}
            transform={`translate(${x} ${y}) scale(${0.7 + (i % 2) * 0.3})`}
          />
        ))}
      </g>
    );
  }
  if (pattern.kind === "print") {
    const emoji = MOTIF_EMOJI[pattern.motif] ?? "✨";
    const spots = [
      [38, 56],
      [58, 62],
      [48, 78],
    ];
    return (
      <g pointerEvents="none" fontSize="10">
        {spots.map(([x, y], i) => (
          <text key={i} x={x} y={y} textAnchor="middle">
            {emoji}
          </text>
        ))}
      </g>
    );
  }
  return null;
}
