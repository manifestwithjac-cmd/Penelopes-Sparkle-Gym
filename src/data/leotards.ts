import type { LeotardDef } from "./types";

// New leotards can be added here without touching any game logic — the
// shop, dressing room, and unlock checks all read from this list.
export const LEOTARDS: LeotardDef[] = [
  {
    id: "pink_starter",
    name: "Pink",
    pattern: { kind: "solid", color: "#ff5fae" },
    unlock: { type: "always" },
  },
  {
    id: "pink_glitter",
    name: "Pink Glitter",
    pattern: { kind: "sparkle", base: "#ff8cc6", sparkle: "#fff0f7" },
    unlock: { type: "stars", amount: 10 },
  },
  {
    id: "purple_glitter",
    name: "Purple Glitter",
    pattern: { kind: "sparkle", base: "#b285ff", sparkle: "#f6f0ff" },
    unlock: { type: "stars", amount: 15 },
  },
  {
    id: "rainbow",
    name: "Rainbow",
    pattern: { kind: "gradient", from: "#ff8cc6", to: "#aee3ff" },
    unlock: { type: "stars", amount: 20 },
  },
  {
    id: "blue_glitter",
    name: "Blue Glitter",
    pattern: { kind: "sparkle", base: "#4fb8ff", sparkle: "#ffffff" },
    unlock: { type: "stars", amount: 25 },
  },
  {
    id: "flowers",
    name: "Flowers",
    pattern: { kind: "print", base: "#fff0f7", motif: "flower", motifColor: "#ff5fae" },
    unlock: { type: "stars", amount: 30 },
  },
  {
    id: "unicorn",
    name: "Unicorn",
    pattern: { kind: "gradient", from: "#e6d6ff", to: "#ffd9ec" },
    unlock: { type: "stars", amount: 35 },
  },
  {
    id: "green_glitter",
    name: "Green Glitter",
    pattern: { kind: "sparkle", base: "#3fd8a0", sparkle: "#ffffff" },
    unlock: { type: "stars", amount: 40 },
  },
  {
    id: "strawberries",
    name: "Strawberries",
    pattern: { kind: "print", base: "#fff0f7", motif: "strawberry", motifColor: "#e82280" },
    unlock: { type: "stars", amount: 45 },
  },
  {
    id: "butterflies",
    name: "Butterflies",
    pattern: { kind: "print", base: "#f6f0ff", motif: "butterfly", motifColor: "#8438e0" },
    unlock: { type: "trickCount", apparatusId: "beam", count: 5 },
  },
  {
    id: "gold_glitter",
    name: "Gold Glitter",
    pattern: { kind: "sparkle", base: "#ffcd3c", sparkle: "#fffaf3" },
    unlock: { type: "stars", amount: 55 },
  },
  {
    id: "donuts",
    name: "Donuts",
    pattern: { kind: "print", base: "#ffd9ec", motif: "donut", motifColor: "#ffb703" },
    unlock: { type: "stars", amount: 65 },
  },
  {
    id: "ice_cream",
    name: "Ice Cream",
    pattern: { kind: "print", base: "#fff0f7", motif: "icecream", motifColor: "#ff8cc6" },
    unlock: { type: "stars", amount: 75 },
  },
  {
    id: "milkshakes",
    name: "Milkshakes",
    pattern: { kind: "print", base: "#ffe08a", motif: "milkshake", motifColor: "#ff5fae" },
    unlock: { type: "stars", amount: 85 },
  },
  {
    id: "cereal",
    name: "Cereal",
    pattern: { kind: "print", base: "#aee3ff", motif: "cereal", motifColor: "#ffb703" },
    unlock: { type: "stars", amount: 95 },
  },
  {
    id: "mixed_fruits",
    name: "Mixed Fruits",
    pattern: { kind: "print", base: "#fffaf3", motif: "fruit", motifColor: "#3fd8a0" },
    unlock: { type: "stars", amount: 105 },
  },
  {
    id: "multicolor_glitter",
    name: "Multicolor Glitter",
    pattern: { kind: "sparkle", base: "#b285ff", sparkle: "#ffcd3c" },
    unlock: { type: "trickCount", apparatusId: "floor", count: 8 },
  },
  {
    id: "gems",
    name: "Gems",
    pattern: { kind: "sparkle", base: "#8438e0", sparkle: "#ff5fae" },
    unlock: { type: "achievement", achievementId: "spider_master" },
  },
];

export const LEOTARDS_BY_ID: Record<string, LeotardDef> = Object.fromEntries(
  LEOTARDS.map((l) => [l.id, l]),
);
