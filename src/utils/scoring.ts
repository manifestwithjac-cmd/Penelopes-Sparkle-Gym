export type PerformanceTier = "try" | "good" | "great" | "amazing" | "sparkle_perfect";

export const TIER_LABEL: Record<PerformanceTier, string> = {
  try: "YOU GOT THIS!",
  good: "GOOD!",
  great: "GREAT!",
  amazing: "AMAZING!",
  sparkle_perfect: "SPARKLE PERFECT!",
};

const TIER_FACTOR: Record<PerformanceTier, number> = {
  try: 0,
  good: 0.35,
  great: 0.62,
  amazing: 0.85,
  sparkle_perfect: 1,
};

/** Maps a 0..1 timing/accuracy score to a friendly performance tier. */
export function tierFromAccuracy(accuracy: number): PerformanceTier {
  if (accuracy >= 0.95) return "sparkle_perfect";
  if (accuracy >= 0.8) return "amazing";
  if (accuracy >= 0.55) return "great";
  return "good";
}

export function lerpReward(range: { min: number; max: number }, tier: PerformanceTier): number {
  if (tier === "try") return Math.max(1, Math.round(range.min * 0.4));
  const t = TIER_FACTOR[tier];
  return Math.round(range.min + (range.max - range.min) * t);
}

const ENCOURAGEMENT = [
  "You got this!",
  "Try again!",
  "So close!",
  "Let's do it!",
  "Almost there!",
];

export function randomEncouragement(): string {
  return ENCOURAGEMENT[Math.floor(Math.random() * ENCOURAGEMENT.length)];
}

/** Turns a list of per-step tap accuracies (0..1, 0 = missed) into an
 * overall trick outcome. Forgiving by design (spec §15): landing even one
 * step reasonably well counts as a success. */
export function summarizeAttempt(accuracies: number[]): {
  success: boolean;
  tier: PerformanceTier;
} {
  const hits = accuracies.filter((a) => a > 0.15);
  if (hits.length === 0) return { success: false, tier: "try" };
  const avg = hits.reduce((sum, a) => sum + a, 0) / hits.length;
  return { success: true, tier: tierFromAccuracy(avg) };
}
