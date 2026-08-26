/**
 * Converts "how far through a target's lifespan was it tapped" into a 0..1
 * accuracy score, peaking at `sweetCenter`. Shared by every timing-based
 * minigame so their difficulty tuning stays consistent and forgiving.
 */
export function computeTapAccuracy(
  fraction: number,
  sweetCenter = 0.62,
  sweetWidth = 0.4,
): number {
  const distance = Math.abs(fraction - sweetCenter);
  const accuracy = 1 - distance / sweetWidth;
  return Math.max(0, Math.min(1, accuracy));
}
