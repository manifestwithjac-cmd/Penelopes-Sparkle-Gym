import { shuffle } from "../games/gameUtils";

/*
  Sparkle War: the classic flip-and-compare card game, Penelope against a
  computer friend. Pure rules only, no React.

  A 52-card deck with sparkly suits (suits never matter in War). Ranks run
  2-10, then Jack 11, Queen 12, King 13, Ace 14.
*/

export type WarSuit = "heart" | "star" | "diamond" | "flower";
export type WarSide = "kid" | "cpu";

export interface WarCard {
  id: number;
  rank: number;
  suit: WarSuit;
}

export const WAR_SUITS: WarSuit[] = ["heart", "star", "diamond", "flower"];
export const SUIT_SYMBOL: Record<WarSuit, string> = { heart: "♥", star: "★", diamond: "♦", flower: "✿" };

export function rankLabel(rank: number): string {
  return { 11: "J", 12: "Q", 13: "K", 14: "A" }[rank] ?? String(rank);
}

export function rankName(rank: number): string {
  return { 11: "Jack", 12: "Queen", 13: "King", 14: "Ace" }[rank] ?? String(rank);
}

export function buildDeck(): WarCard[] {
  const cards: WarCard[] = [];
  let id = 0;
  for (const suit of WAR_SUITS) for (let rank = 2; rank <= 14; rank++) cards.push({ id: id++, rank, suit });
  return cards;
}

/**
 * Deals the deck in half. A lucky deal hands Penelope the higher card of
 * each pair about 70% of the time, so she starts with more big cards.
 */
export function dealWar(lucky: boolean, random: () => number = Math.random): Record<WarSide, WarCard[]> {
  const deck = shuffle(buildDeck(), random);
  const kid: WarCard[] = [];
  const cpu: WarCard[] = [];
  for (let i = 0; i < deck.length; i += 2) {
    const [a, b] = [deck[i], deck[i + 1]];
    const high = a.rank >= b.rank ? a : b;
    const low = high === a ? b : a;
    const kidGetsHigh = lucky ? random() < 0.7 : random() < 0.5;
    kid.push(kidGetsHigh ? high : low);
    cpu.push(kidGetsHigh ? low : high);
  }
  return { kid, cpu };
}

/** In a war each player lays 3 cards face down, then 1 face up (fewer if that's all they have left). */
export const WAR_FACE_DOWN = 3;
