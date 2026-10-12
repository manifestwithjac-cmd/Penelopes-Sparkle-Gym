import { shuffle, type ComputerLevel } from "../games/gameUtils";

/*
  Sparkle Match: a match-the-color-or-number card game (Uno-style) for
  Penelope against one computer friend. Pure rules only, no React.

  Deck (100 cards): in each of 4 colors one 0, two each of 1-9, two Skips
  and two +2s; plus 4 Rainbow wilds and 4 Rainbow +4s.
*/

export type MatchColor = "pink" | "purple" | "sky" | "gold";
export type MatchKind = "number" | "skip" | "plus2" | "wild" | "wild4";
export type MatchSide = "kid" | "cpu";

export interface MatchCard {
  id: number;
  kind: MatchKind;
  /** null for rainbow (wild) cards. */
  color: MatchColor | null;
  /** 0-9 for number cards, -1 otherwise. */
  value: number;
}

export const MATCH_COLORS: MatchColor[] = ["pink", "purple", "sky", "gold"];

export const MATCH_COLOR_NAMES: Record<MatchColor, string> = {
  pink: "Pink",
  purple: "Purple",
  sky: "Blue",
  gold: "Gold",
};

/** Each color carries the same little charm as its Ludo pieces, so colors are told apart by shape too. */
export const COLOR_CHARM: Record<MatchColor, string> = { pink: "🎀", purple: "👑", sky: "⭐", gold: "🌼" };

export function buildDeck(): MatchCard[] {
  const cards: MatchCard[] = [];
  let id = 0;
  for (const color of MATCH_COLORS) {
    cards.push({ id: id++, kind: "number", color, value: 0 });
    for (let v = 1; v <= 9; v++) {
      cards.push({ id: id++, kind: "number", color, value: v });
      cards.push({ id: id++, kind: "number", color, value: v });
    }
    for (const kind of ["skip", "plus2"] as const) {
      cards.push({ id: id++, kind, color, value: -1 });
      cards.push({ id: id++, kind, color, value: -1 });
    }
  }
  for (let i = 0; i < 4; i++) {
    cards.push({ id: id++, kind: "wild", color: null, value: -1 });
    cards.push({ id: id++, kind: "wild4", color: null, value: -1 });
  }
  return cards;
}

/** Skip, +2 and +4 make the other player miss a turn. */
export function isAttack(card: MatchCard): boolean {
  return card.kind === "skip" || card.kind === "plus2" || card.kind === "wild4";
}

export function isWild(card: MatchCard): boolean {
  return card.kind === "wild" || card.kind === "wild4";
}

/** Match the color in play, or the same number/symbol. Rainbow cards always match. */
export function canPlay(card: MatchCard, top: MatchCard, color: MatchColor): boolean {
  if (isWild(card)) return true;
  if (card.color === color) return true;
  if (card.kind !== top.kind) return false;
  return card.kind !== "number" || card.value === top.value;
}

/** Penelope's hand, sorted by color then number so matches sit together. */
export function sortHand(hand: MatchCard[]): MatchCard[] {
  const colorRank = (c: MatchCard) => (c.color ? MATCH_COLORS.indexOf(c.color) : 4);
  const kindRank: Record<MatchKind, number> = { number: 0, skip: 1, plus2: 2, wild: 3, wild4: 4 };
  return [...hand].sort(
    (a, b) => colorRank(a) - colorRank(b) || kindRank[a.kind] - kindRank[b.kind] || a.value - b.value,
  );
}

export interface Deal {
  draw: MatchCard[];
  discard: MatchCard[];
  kid: MatchCard[];
  cpu: MatchCard[];
}

/** Shuffles, deals `handSize` each and turns over a plain number card to start. */
export function deal(handSize: number, random: () => number = Math.random): Deal {
  const deck = shuffle(buildDeck(), random);
  const kid = sortHand(deck.splice(0, handSize));
  const cpu = deck.splice(0, handSize);
  const startIdx = deck.findIndex((c) => c.kind === "number");
  const [start] = deck.splice(startIdx, 1);
  return { draw: deck, discard: [start], kid, cpu };
}

/** The color a computer names after a rainbow card: what it holds most of (easy picks at random). */
export function chooseWildColor(hand: MatchCard[], level: ComputerLevel, random: () => number = Math.random): MatchColor {
  if (level === "easy") return MATCH_COLORS[Math.floor(random() * MATCH_COLORS.length)];
  const counts = MATCH_COLORS.map((c) => hand.filter((h) => h.color === c).length);
  return MATCH_COLORS[counts.indexOf(Math.max(...counts))];
}

/**
 * The computer's pick from its playable cards, or null to draw instead.
 *
 *   easy    never plays Skip, +2 or +4 on Penelope (draws rather than attack)
 *   medium  mostly plays plain cards; attacks now and then
 *   hard    attacks when Penelope is close to winning, saves rainbows for last
 */
export function chooseCpuCard(
  playable: MatchCard[],
  kidCards: number,
  level: ComputerLevel,
  random: () => number = Math.random,
): MatchCard | null {
  if (playable.length === 0) return null;
  const pickRandom = (list: MatchCard[]) => list[Math.floor(random() * list.length)];

  if (level === "easy") {
    const gentle = playable.filter((c) => !isAttack(c));
    return gentle.length ? pickRandom(gentle) : null;
  }
  if (level === "medium") {
    const gentle = playable.filter((c) => !isAttack(c));
    if (gentle.length) return random() < 0.85 ? pickRandom(gentle) : pickRandom(playable);
    return random() < 0.5 ? pickRandom(playable) : null;
  }

  const scored = playable.map((c) => {
    let s = random();
    if (isAttack(c)) s += kidCards <= 2 ? 30 : 5;
    if (isWild(c)) s -= 20;
    if (c.kind === "number") s += c.value / 3;
    return { c, s };
  });
  return scored.reduce((best, x) => (x.s > best.s ? x : best)).c;
}

/** Spoken name for screen readers, e.g. "blue 7" or "rainbow plus 4". */
export function matchCardLabel(card: MatchCard): string {
  const color = card.color ? `${card.color === "sky" ? "blue" : card.color} ` : "rainbow ";
  const what =
    card.kind === "number" ? String(card.value) : { skip: "skip", plus2: "plus 2", wild: "wild", wild4: "plus 4" }[card.kind];
  return `${color}${what}`;
}
