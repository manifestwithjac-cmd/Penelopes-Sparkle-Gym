import type { ApparatusId, UnlockRequirement } from "../data/types";
import { TRICKS } from "../data/tricks";

export interface TrickStat {
  attempts: number;
  successes: number;
}

export interface ProgressContext {
  stars: number;
  trickStats: Record<string, TrickStat>;
  unlockedAchievementIds: string[];
}

/** Total successful performances of tricks belonging to one apparatus. */
export function trickSuccessCountForApparatus(
  apparatusId: ApparatusId,
  trickStats: Record<string, TrickStat>,
): number {
  let total = 0;
  for (const trick of TRICKS) {
    if (!trick.apparatusIds.includes(apparatusId)) continue;
    total += trickStats[trick.id]?.successes ?? 0;
  }
  return total;
}

/**
 * Unlocking is derived from progress rather than stored as its own list —
 * this keeps save data small and makes it impossible for "unlocked" state
 * to drift out of sync with the stars/tricks/achievements that earned it.
 */
export function meetsRequirement(req: UnlockRequirement, ctx: ProgressContext): boolean {
  switch (req.type) {
    case "always":
      return true;
    case "stars":
      return ctx.stars >= req.amount;
    case "trick":
      return (ctx.trickStats[req.trickId]?.successes ?? 0) > 0;
    case "trickCount":
      return trickSuccessCountForApparatus(req.apparatusId, ctx.trickStats) >= req.count;
    case "achievement":
      return ctx.unlockedAchievementIds.includes(req.achievementId);
    default:
      return false;
  }
}

/** Human-readable hint for a locked item, shown under its lock icon. */
export function requirementLabel(req: UnlockRequirement): string {
  switch (req.type) {
    case "always":
      return "";
    case "stars":
      return `⭐ ${req.amount} Stars`;
    case "trick":
      return "Learn a new trick!";
    case "trickCount":
      return `Do ${req.count} ${req.apparatusId} tricks`;
    case "achievement":
      return "Special surprise!";
    default:
      return "";
  }
}
