import { LUDO_TURN_ORDER, type LudoPlayerKind, type LudoSeatId } from "../data/ludoSeats";

/*
  Sparkle Ludo board + rules — pure functions only, no React, no store.

  The board is a 13x13 grid (same shape as the iPad Ludo app): a 48-spot
  loop around the outside of a plus sign, a 4-spot home lane up the middle
  of each arm, a 4-piece "locker room" in each corner and the dice on the
  podium in the center. Pieces travel clockwise.

  A piece's position is its *progress* along its own route:
    -1        in the locker room (base)
    0..46     on the shared loop (0 = its own start spot)
    47..50    in its home lane (50 = the podium end)
*/

export const GRID = 13;
export const LOOP_LENGTH = 48;
export const LAST_LOOP_STEP = 46;
export const FIRST_HOME_STEP = 47;
export const FINAL_STEP = 50;
export const IN_BASE = -1;

export type Cell = readonly [col: number, row: number];

/** The shared loop, clockwise, starting at gold's start spot (top-right arrow). */
export const LOOP: Cell[] = [
  [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [9, 4], [10, 4], [11, 4], [12, 4], [12, 5], [12, 6], [12, 7],
  [12, 8], [11, 8], [10, 8], [9, 8], [8, 8], [8, 9], [8, 10], [8, 11], [8, 12], [7, 12], [6, 12], [5, 12],
  [4, 12], [4, 11], [4, 10], [4, 9], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8], [0, 7], [0, 6], [0, 5],
  [0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [4, 3], [4, 2], [4, 1], [4, 0], [5, 0], [6, 0], [7, 0],
];

/** Where each seat's route joins the loop (index into LOOP). */
export const START_OFFSET: Record<LudoSeatId, number> = { gold: 0, purple: 12, pink: 24, sky: 36 };

export const HOME_LANE: Record<LudoSeatId, Cell[]> = {
  gold: [[6, 1], [6, 2], [6, 3], [6, 4]],
  purple: [[11, 6], [10, 6], [9, 6], [8, 6]],
  pink: [[6, 11], [6, 10], [6, 9], [6, 8]],
  sky: [[1, 6], [2, 6], [3, 6], [4, 6]],
};

/** Center of each corner locker room, in grid units (cell centers are x.5). */
export const BASE_CENTER: Record<LudoSeatId, readonly [number, number]> = {
  sky: [2, 2],
  gold: [11, 2],
  pink: [2, 11],
  purple: [11, 11],
};

/** Arrow direction on each start spot — the way pieces leave it. */
export const START_ARROW_DEG: Record<LudoSeatId, number> = { gold: 90, purple: 180, pink: 270, sky: 0 };

export function loopIndex(seat: LudoSeatId, progress: number): number {
  return (START_OFFSET[seat] + progress) % LOOP_LENGTH;
}

const BASE_SLOT_OFFSETS: readonly [number, number][] = [
  [-0.62, -0.62],
  [0.62, -0.62],
  [-0.62, 0.62],
  [0.62, 0.62],
];

/** Center point of a piece in grid units (0..13), ready to turn into percentages. */
export function piecePoint(seat: LudoSeatId, tokenIndex: number, progress: number): [number, number] {
  if (progress === IN_BASE) {
    const [cx, cy] = BASE_CENTER[seat];
    const [dx, dy] = BASE_SLOT_OFFSETS[tokenIndex];
    return [cx + dx, cy + dy];
  }
  const cell =
    progress <= LAST_LOOP_STEP ? LOOP[loopIndex(seat, progress)] : HOME_LANE[seat][progress - FIRST_HOME_STEP];
  return [cell[0] + 0.5, cell[1] + 0.5];
}

// ---------------------------------------------------------------------------
// Rules

export type Tokens = Record<LudoSeatId, number[]>;

export interface LudoMove {
  token: number;
  from: number;
  to: number;
  /** Seat + token index of an opponent piece this move lands on, if any. */
  bumps: { seat: LudoSeatId; token: number } | null;
}

export const PIECE_COUNTS = [2, 3, 4] as const;
export type PieceCount = (typeof PIECE_COUNTS)[number];

/** Everyone starts in their locker room. Fewer pieces each = a shorter game. */
export function freshTokens(pieceCount: PieceCount = 4): Tokens {
  const base = () => Array.from({ length: pieceCount }, () => IN_BASE);
  return { pink: base(), sky: base(), gold: base(), purple: base() };
}

export function hasFinished(tokens: number[]): boolean {
  return tokens.every((p) => p >= FIRST_HOME_STEP);
}

/** True when nothing is out on the loop — the player gets 3 tries to roll a 6. */
export function nothingOnLoop(tokens: number[]): boolean {
  return tokens.every((p) => p === IN_BASE || p >= FIRST_HOME_STEP);
}

function opponentAt(
  tokens: Tokens,
  seat: LudoSeatId,
  progress: number,
  active: LudoSeatId[],
): { seat: LudoSeatId; token: number } | null {
  if (progress > LAST_LOOP_STEP) return null;
  const target = loopIndex(seat, progress);
  for (const other of active) {
    if (other === seat) continue;
    const idx = tokens[other].findIndex((p) => p >= 0 && p <= LAST_LOOP_STEP && loopIndex(other, p) === target);
    if (idx !== -1) return { seat: other, token: idx };
  }
  return null;
}

export function legalMoves(tokens: Tokens, seat: LudoSeatId, roll: number, active: LudoSeatId[]): LudoMove[] {
  const mine = tokens[seat];
  const moves: LudoMove[] = [];
  mine.forEach((from, token) => {
    let to: number;
    if (from === IN_BASE) {
      if (roll !== 6) return;
      to = 0;
    } else {
      to = from + roll;
      if (to > FINAL_STEP) return;
    }
    // Two of your own pieces can never share a spot.
    if (mine.some((p, i) => i !== token && p === to)) return;
    moves.push({ token, from, to, bumps: opponentAt(tokens, seat, to, active) });
  });
  return moves;
}

/** Spots a piece passes through on the way, one entry per step of the glide. */
export function stepPath(from: number, to: number): number[] {
  if (from === IN_BASE) return [0];
  const path: number[] = [];
  for (let p = from + 1; p <= to; p++) path.push(p);
  return path;
}

/** "Lucky 6s" settings: how many times more likely a 6 is than each other face (1 = a fair die). */
export const SIX_BOOSTS = [1, 2, 3, 4, 5, 6] as const;
export type SixBoost = (typeof SIX_BOOSTS)[number];

/** Chance a roll comes up 6: the 6 face counts `boost` times, 1-5 count once each. */
export function sixChance(boost: SixBoost): number {
  return boost / (5 + boost);
}

export function rollDie(boost: SixBoost, random: () => number = Math.random): number {
  const r = random() * (5 + boost);
  return r >= 5 ? 6 : 1 + Math.floor(r);
}

export function nextSeat(current: LudoSeatId, kinds: Record<LudoSeatId, LudoPlayerKind>): LudoSeatId {
  const start = LUDO_TURN_ORDER.indexOf(current);
  for (let i = 1; i <= LUDO_TURN_ORDER.length; i++) {
    const seat = LUDO_TURN_ORDER[(start + i) % LUDO_TURN_ORDER.length];
    if (kinds[seat] !== "off") return seat;
  }
  return current;
}

// ---------------------------------------------------------------------------
// Computer players

/** How many opponent pieces could land on this loop spot next turn. */
function threatsAt(tokens: Tokens, seat: LudoSeatId, progress: number, active: LudoSeatId[]): number {
  if (progress < 0 || progress > LAST_LOOP_STEP) return 0;
  const target = loopIndex(seat, progress);
  let threats = 0;
  for (const other of active) {
    if (other === seat) continue;
    for (const p of tokens[other]) {
      if (p < 0 || p > LAST_LOOP_STEP) continue;
      const gap = (target - loopIndex(other, p) + LOOP_LENGTH) % LOOP_LENGTH;
      // The opponent must still be on the loop when it gets there.
      if (gap >= 1 && gap <= 6 && p + gap <= LAST_LOOP_STEP) threats++;
    }
  }
  return threats;
}

export type ComputerLevel = "easy" | "medium" | "hard";

/**
 * Picks a computer player's move, or `null` when an easy computer would
 * rather skip than bump a real player's piece.
 *
 *   easy    never bumps a real player (skips its move if that's all it has),
 *           plays loosely, doesn't bother staying safe
 *   medium  usually steers around real players' pieces, bumps other computers on purpose
 *   hard    plays to win: finish, bump anyone, come out, stay safe, push ahead
 */
export function chooseComputerMove(
  tokens: Tokens,
  seat: LudoSeatId,
  moves: LudoMove[],
  active: LudoSeatId[],
  level: ComputerLevel,
  kinds: Record<LudoSeatId, LudoPlayerKind>,
  random: () => number = Math.random,
): LudoMove | null {
  const bumpsKid = (m: LudoMove) => m.bumps !== null && kinds[m.bumps.seat] === "kid";
  let options = moves;
  if (level === "easy") {
    options = moves.filter((m) => !bumpsKid(m));
    if (options.length === 0) return null;
  }

  let best = options[0];
  let bestScore = -Infinity;
  for (const move of options) {
    let score: number;
    if (level === "easy") {
      score = random() * 30;
      if (move.from <= LAST_LOOP_STEP && move.to >= FIRST_HOME_STEP) score += 20;
      if (move.from === IN_BASE) score += 10;
    } else {
      const hard = level === "hard";
      score = random() * (hard ? 4 : 15);
      if (move.from <= LAST_LOOP_STEP && move.to >= FIRST_HOME_STEP) score += 60;
      if (move.bumps && (hard || !bumpsKid(move))) score += 50 + tokens[move.bumps.seat][move.bumps.token] / 2;
      if (!hard && bumpsKid(move)) score -= 45;
      if (move.from === IN_BASE) score += 40;
      const safety = hard ? 1 : 0.4;
      score -= threatsAt(tokens, seat, move.to, active) * 25 * safety;
      score += threatsAt(tokens, seat, move.from, active) * 20 * safety;
      score += move.to / 10;
    }
    if (score > bestScore) {
      bestScore = score;
      best = move;
    }
  }
  return best;
}
