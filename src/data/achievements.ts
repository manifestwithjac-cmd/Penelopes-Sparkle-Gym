import type { AchievementDef } from "./types";

// Milestones, not a "win condition" — the game has no ending, so these
// exist to celebrate progress along the way.
export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first_cartwheel",
    name: "First Cartwheel",
    description: "Performed your very first cartwheel!",
    icon: "🤸",
    condition: { type: "trick", trickId: "cartwheel" },
  },
  {
    id: "stars_100",
    name: "100 Stars",
    description: "Collected 100 sparkly stars!",
    icon: "⭐",
    condition: { type: "totalStars", amount: 100 },
  },
  {
    id: "stars_250",
    name: "250 Stars",
    description: "Collected 250 sparkly stars!",
    icon: "🌟",
    condition: { type: "totalStars", amount: 250 },
  },
  {
    id: "beam_explorer",
    name: "Beam Explorer",
    description: "Performed 5 tricks on the balance beam!",
    icon: "🩰",
    condition: { type: "trickCount", apparatusId: "beam", count: 5 },
  },
  {
    id: "trampoline_star",
    name: "Trampoline Star",
    description: "Performed 5 tricks on the trampoline!",
    icon: "✨",
    condition: { type: "trickCount", apparatusId: "trampoline", count: 5 },
  },
  {
    id: "bars_star",
    name: "Bars Star",
    description: "Performed 5 tricks on the bars!",
    icon: "🎪",
    condition: { type: "trickCount", apparatusId: "bars", count: 5 },
  },
  {
    id: "vault_star",
    name: "Vault Star",
    description: "Performed 5 tricks on the vault!",
    icon: "🏆",
    condition: { type: "trickCount", apparatusId: "vault", count: 5 },
  },
  {
    id: "first_leotard",
    name: "First New Leotard",
    description: "Unlocked your first new leotard!",
    icon: "👗",
    condition: { type: "leotardCount", count: 2 },
  },
  {
    id: "leotard_collector",
    name: "Leotard Collector",
    description: "Unlocked 10 leotards!",
    icon: "🧚",
    condition: { type: "leotardCount", count: 10 },
  },
  {
    id: "spider_master",
    name: "Spider Cartwheel Master",
    description: "Performed the incredible Spider Cartwheel!",
    icon: "🕸️",
    condition: { type: "trick", trickId: "spider_cartwheel" },
  },
];

export const ACHIEVEMENTS_BY_ID: Record<string, AchievementDef> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
);
