import type { ApparatusDef } from "./types";

// worldPosition spaces the five events plus social zones along the gym's
// horizontal track (see GymScene). Kept 0..1 so the track width can change
// without touching this data.
export const APPARATUS: ApparatusDef[] = [
  {
    id: "floor",
    name: "Floor",
    shortName: "Floor",
    icon: "🤸",
    worldPosition: 0.1,
    colorFrom: "#ff8cc6",
    colorTo: "#ff5fae",
    description: "Bouncy pink mats for tumbling tricks!",
  },
  {
    id: "beam",
    name: "Balance Beam",
    shortName: "Beam",
    icon: "🌟",
    worldPosition: 0.3,
    colorFrom: "#cfaeff",
    colorTo: "#9a5cf5",
    description: "Walk, pose, and balance along the sparkly beam!",
  },
  {
    id: "bars",
    name: "Uneven Bars",
    shortName: "Bars",
    icon: "🎪",
    worldPosition: 0.5,
    colorFrom: "#aee3ff",
    colorTo: "#4fb8ff",
    description: "Swing and catch with perfect timing!",
  },
  {
    id: "trampoline",
    name: "Trampoline",
    shortName: "Trampoline",
    icon: "✨",
    worldPosition: 0.7,
    colorFrom: "#ffe08a",
    colorTo: "#ffb703",
    description: "Bounce high and stick a trick at the top!",
  },
  {
    id: "vault",
    name: "Vault",
    shortName: "Vault",
    icon: "🏆",
    worldPosition: 0.9,
    colorFrom: "#a4f0d1",
    colorTo: "#3fd8a0",
    description: "Run, jump, and land safely in the foam pit!",
  },
];

export const APPARATUS_BY_ID: Record<string, ApparatusDef> = Object.fromEntries(
  APPARATUS.map((a) => [a.id, a]),
);
