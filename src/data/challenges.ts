import type { ChallengeDef } from "./types";

// Optional bonus goals offered by friends. Never blocks normal play.
export const CHALLENGES: ChallengeDef[] = [
  {
    id: "isabella_cartwheels",
    friendId: "isabella",
    prompt: "Do 3 cartwheels!",
    goal: { type: "performTrick", trickId: "cartwheel", count: 3 },
    starReward: 8,
  },
  {
    id: "sadie_somersault",
    friendId: "sadie",
    prompt: "Do a somersault!",
    goal: { type: "performTrick", trickId: "somersault", count: 1 },
    starReward: 5,
  },
  {
    id: "sadie_trampoline",
    friendId: "sadie",
    prompt: "Try the trampoline!",
    goal: { type: "visitApparatus", apparatusId: "trampoline", count: 1 },
    starReward: 5,
  },
  {
    id: "savannah_stars",
    friendId: "savannah",
    prompt: "Earn 10 stars!",
    goal: { type: "earnStars", count: 10 },
    starReward: 10,
  },
  {
    id: "savannah_beam",
    friendId: "savannah",
    prompt: "Try the beam!",
    goal: { type: "visitApparatus", apparatusId: "beam", count: 1 },
    starReward: 5,
    leotardRewardId: "purple_glitter",
  },
  {
    id: "lyla_bars",
    friendId: "lyla",
    prompt: "Try the bars with me!",
    goal: { type: "visitApparatus", apparatusId: "bars", count: 1 },
    starReward: 6,
  },
  {
    id: "jackson_vault",
    friendId: "jackson",
    prompt: "Try the vault!",
    goal: { type: "visitApparatus", apparatusId: "vault", count: 1 },
    starReward: 6,
  },
  {
    id: "crissy_stars",
    friendId: "crissy",
    prompt: "Cheer me on — earn 10 stars!",
    goal: { type: "earnStars", count: 10 },
    starReward: 8,
  },
  {
    id: "other_penelope_beam",
    friendId: "other_penelope",
    prompt: "Earn 15 stars!",
    goal: { type: "earnStars", count: 15 },
    starReward: 12,
  },
];

export const CHALLENGES_BY_ID: Record<string, ChallengeDef> = Object.fromEntries(
  CHALLENGES.map((c) => [c.id, c]),
);
