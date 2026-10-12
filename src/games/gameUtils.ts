import { FRIENDS, FRIENDS_BY_ID } from "../data/friends";

/** Friends who can sit across the table as the computer player. */
export const OPPONENTS = FRIENDS.filter((f) => f.id !== "other_penelope").map((f) => ({ id: f.id, name: f.name }));

export function opponentName(id: string): string {
  return FRIENDS_BY_ID[id]?.name ?? "Sadie";
}

export type ComputerLevel = "easy" | "medium" | "hard";

export const LEVEL_OPTIONS: { id: ComputerLevel; label: string; icon: string }[] = [
  { id: "easy", label: "Easy", icon: "🧸" },
  { id: "medium", label: "Medium", icon: "🌟" },
  { id: "hard", label: "Hard", icon: "🔥" },
];

export function shuffle<T>(list: T[], random: () => number = Math.random): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
