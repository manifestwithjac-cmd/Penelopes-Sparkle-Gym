// Sparkle Ludo seats — one per board corner. Pure data: who sits where by
// default, what color their pieces are, and which little charm is stamped
// on them. Corner order matches the Ludo board Penelope already knows from
// the iPad app (Penelope bottom-left, Mommy bottom-right, two computer
// friends up top).

export type LudoSeatId = "pink" | "sky" | "gold" | "purple";
export type LudoPlayerKind = "kid" | "computer" | "off";
export type LudoCharm = "bow" | "star" | "flower" | "crown";

export interface LudoSeatDef {
  id: LudoSeatId;
  corner: "bottom-left" | "top-left" | "top-right" | "bottom-right";
  defaultName: string;
  defaultKind: LudoPlayerKind;
  charm: LudoCharm;
  /** Main piece/base color. */
  color: string;
  /** Lighter tint for home-lane spots and badge glow. */
  light: string;
  /** Darker shade for outlines and text on light backgrounds. */
  deep: string;
}

export const LUDO_SEATS: LudoSeatDef[] = [
  {
    id: "pink",
    corner: "bottom-left",
    defaultName: "Penelope",
    defaultKind: "kid",
    charm: "bow",
    color: "#ff4fa6",
    light: "#ffc2e1",
    deep: "#c11569",
  },
  {
    id: "sky",
    corner: "top-left",
    defaultName: "Crissy",
    defaultKind: "computer",
    charm: "star",
    color: "#4fb3ff",
    light: "#c4e7ff",
    deep: "#1f6fb5",
  },
  {
    id: "gold",
    corner: "top-right",
    defaultName: "Sadie",
    defaultKind: "computer",
    charm: "flower",
    color: "#ffbf1f",
    light: "#ffe7a3",
    deep: "#b07800",
  },
  {
    id: "purple",
    corner: "bottom-right",
    defaultName: "Mommy",
    defaultKind: "kid",
    charm: "crown",
    color: "#9a5cf5",
    light: "#dcc6ff",
    deep: "#5f22b0",
  },
];

export const LUDO_SEATS_BY_ID = Object.fromEntries(LUDO_SEATS.map((s) => [s.id, s])) as Record<
  LudoSeatId,
  LudoSeatDef
>;

/** Clockwise turn order, the same direction the pieces travel. */
export const LUDO_TURN_ORDER: LudoSeatId[] = ["pink", "sky", "gold", "purple"];

/** Cheers shown when someone bumps a piece back to its locker room. */
export const LUDO_BUMP_LINES = [
  "Boing! Back to the locker room!",
  "Bumped! Time to warm up again!",
  "Whoopsie cartwheel! Back home you go!",
];

export const LUDO_HOME_LINES = ["Stuck the landing!", "Onto the podium!", "Perfect 10!"];
