import type { FriendDef } from "./types";

// Friends are fully data-driven so new ones can be added later without
// touching FriendsLounge / dialogue logic.
export const FRIENDS: FriendDef[] = [
  {
    id: "savannah",
    name: "Savannah",
    hairColor: "#7a4a2b",
    skinTone: "#f2c9a0",
    favoriteColor: "purple",
    outfitPattern: { kind: "gradient", from: "#ff8cc6", to: "#b285ff" },
    greetings: ["Hi Penelope!", "Let's earn purple stars!"],
    cheerLines: ["Yay!! So sparkly!", "You're amazing!"],
    challengeLines: ["Earn 10 stars!", "Let's do the beam together!"],
  },
  {
    id: "isabella",
    name: "Isabella",
    hairColor: "#2b2b2b",
    skinTone: "#e8b48a",
    favoriteColor: "pink",
    favoriteTrickId: "cartwheel",
    outfitPattern: { kind: "sparkle", base: "#ff5fae", sparkle: "#fff0f7" },
    greetings: ["Hi Penelope!", "Let's do cartwheels!"],
    cheerLines: ["Woohoo!", "Cartwheel queen!"],
    challengeLines: ["Do 3 cartwheels!", "Try the floor with me!"],
  },
  {
    id: "sadie",
    name: "Sadie",
    hairColor: "#f6d67a",
    skinTone: "#f6d3b0",
    favoriteColor: "gold",
    favoriteTrickId: "somersault",
    outfitPattern: { kind: "print", base: "#ffe08a", motif: "flower", motifColor: "#ff5fae" },
    greetings: ["Hi Penelope!", "Somersault time!"],
    cheerLines: ["Roll with it!", "So good!"],
    challengeLines: ["Do a somersault!", "Try the trampoline!"],
  },
  {
    id: "other_penelope",
    name: "Penelope",
    hairColor: "#6b4423",
    skinTone: "#f2c9a0",
    favoriteColor: "purple",
    outfitPattern: { kind: "gradient", from: "#cfaeff", to: "#8438e0" },
    greetings: ["Hi! Two Penelopes!", "Let's practice!"],
    cheerLines: ["Twinning!", "Great job, Penelope!"],
    challengeLines: ["Try the beam!", "Earn 15 stars!"],
  },
];

export const FRIENDS_BY_ID: Record<string, FriendDef> = Object.fromEntries(
  FRIENDS.map((f) => [f.id, f]),
);
