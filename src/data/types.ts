// Shared content types. Keeping these separate from data + logic lets us
// add new tricks/leotards/friends/etc. by editing data files only.

export type ApparatusId =
  | "floor"
  | "beam"
  | "bars"
  | "trampoline"
  | "vault";

export interface ApparatusDef {
  id: ApparatusId;
  name: string;
  shortName: string;
  /** Emoji/icon glyph used across nav + world (placeholder art strategy). */
  icon: string;
  /** Position of this zone along the gym's virtual world track, 0..1. */
  worldPosition: number;
  colorFrom: string;
  colorTo: string;
  description: string;
}

export type UnlockRequirement =
  | { type: "always" }
  | { type: "stars"; amount: number }
  | { type: "trick"; trickId: string }
  | { type: "trickCount"; apparatusId: ApparatusId; count: number }
  | { type: "achievement"; achievementId: string };

export interface TrickDef {
  id: string;
  name: string;
  apparatusIds: ApparatusId[];
  level: 1 | 2 | 3 | 4 | 5;
  description: string;
  icon: string;
  unlock: UnlockRequirement;
  special?: boolean;
  starReward: { min: number; max: number };
  pointReward: { min: number; max: number };
}

export type LeotardPattern =
  | { kind: "solid"; color: string }
  | { kind: "gradient"; from: string; to: string }
  | { kind: "sparkle"; base: string; sparkle: string }
  | { kind: "print"; base: string; motif: string; motifColor: string };

export interface LeotardDef {
  id: string;
  name: string;
  pattern: LeotardPattern;
  unlock: UnlockRequirement;
}

export interface FriendDef {
  id: string;
  name: string;
  hairColor: string;
  /** Optional thin highlight streaks over the base hair color (e.g. a
   * couple of blonde streaks through light brown hair). Purely cosmetic —
   * omit for a single flat hair color. */
  hairHighlightColor?: string;
  skinTone: string;
  /** Defaults to GymnastFigure's own default (blue) when omitted. */
  eyeColor?: string;
  favoriteColor: string;
  favoriteTrickId?: string;
  outfitPattern: LeotardPattern;
  /** Boy vs. girl silhouette — shorter hair and a two-piece shirt/shorts
   * outfit instead of the default longer hair and one-piece leotard/dress
   * (see GymnastFigure.tsx). Also suppresses the sparkle-eyelash
   * decoration by default. */
  isBoy?: boolean;
  /** Scales the whole figure down (e.g. 0.85), anchored to her feet so
   * she still stands on the same ground line as everyone else — for a
   * friend who's simply smaller/younger than Penelope. Static-figure
   * only, like kneeBrace/crutches below. */
  sizeScale?: number;
  /** Optional black knee brace/immobilizer on this leg (viewer-facing
   * figure, so "left"/"right" is the character's own anatomical side —
   * mirrored on screen). Cosmetic, static-figure only (see
   * GymnastFigure.tsx) — she isn't drawn with it mid-trick. */
  kneeBrace?: "left" | "right";
  /** Optional pair of underarm crutches, static-figure only like
   * kneeBrace above. */
  crutches?: boolean;
  greetings: string[];
  cheerLines: string[];
  challengeLines: string[];
  /** Position along the gym world track, 0..1 (see GymScene). */
  worldPosition: number;
}

export type ChallengeGoal =
  | { type: "performTrick"; trickId: string; count: number }
  | { type: "earnStars"; count: number }
  | { type: "visitApparatus"; apparatusId: ApparatusId; count: number };

export interface ChallengeDef {
  id: string;
  friendId: string;
  prompt: string;
  goal: ChallengeGoal;
  starReward: number;
  leotardRewardId?: string;
}

export type AchievementCondition =
  | { type: "totalStars"; amount: number }
  | { type: "trick"; trickId: string }
  | { type: "trickCount"; apparatusId: ApparatusId; count: number }
  | { type: "leotardCount"; count: number }
  | { type: "special"; key: string };

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: AchievementCondition;
}
