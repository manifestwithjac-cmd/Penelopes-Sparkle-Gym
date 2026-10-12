import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  LUDO_BUMP_LINES,
  LUDO_HOME_LINES,
  LUDO_SEATS,
  LUDO_TURN_ORDER,
  type LudoPlayerKind,
  type LudoSeatId,
} from "../data/ludoSeats";
import { useGameStore } from "../state/gameStore";
import {
  FIRST_HOME_STEP,
  LAST_LOOP_STEP,
  freshTokens,
  hasFinished,
  stepPath,
  legalMoves,
  nextSeat,
  nothingOnLoop,
  piecePoint,
  rollDie,
  type LudoMove,
  type Tokens,
} from "./ludoRules";

/*
  Sparkle Ludo game state. Every transition is a store action; the scene
  only decides *when* to call them (dice tumble time, step speed, computer
  thinking pauses). That keeps a half-finished game resumable: if the iPad
  sleeps mid-move, the saved phase picks up exactly where it stopped.
*/

export type LudoPhase = "roll" | "rolling" | "pick" | "moving" | "pass" | "won";

/** Stars Penelope's gym save earns when a kid player wins a game. */
export const LUDO_WIN_STARS = 3;

interface MovingPiece {
  token: number;
  path: number[];
  step: number;
  bumps: LudoMove["bumps"];
}

export interface LudoBurst {
  key: number;
  point: [number, number];
  big: boolean;
}

interface LudoData {
  kinds: Record<LudoSeatId, LudoPlayerKind>;
  names: Record<LudoSeatId, string>;
  bumps: Record<LudoSeatId, number>;
  tokens: Tokens;
  turn: LudoSeatId;
  dice: number;
  rollCount: number;
  phase: LudoPhase;
  triesLeft: number;
  moves: LudoMove[];
  moving: MovingPiece | null;
  message: string;
  winner: LudoSeatId | null;
  burst: LudoBurst | null;
  /** Makes 6s come up more often so pieces get out of the locker room sooner. */
  luckySixes: boolean;
}

interface LudoActions {
  roll: () => void;
  settleRoll: () => void;
  pickMove: (token: number) => void;
  stepMove: () => void;
  endPass: () => void;
  newGame: () => void;
  setPlayer: (seat: LudoSeatId, change: { name?: string; kind?: LudoPlayerKind }) => void;
  toggleLuckySixes: () => void;
}

export type LudoState = LudoData & LudoActions;

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

export function activeSeats(kinds: Record<LudoSeatId, LudoPlayerKind>): LudoSeatId[] {
  return LUDO_TURN_ORDER.filter((s) => kinds[s] !== "off");
}

function turnStart(data: Pick<LudoData, "tokens" | "names">, seat: LudoSeatId): Partial<LudoData> {
  return {
    turn: seat,
    phase: "roll",
    moves: [],
    moving: null,
    triesLeft: nothingOnLoop(data.tokens[seat]) ? 3 : 1,
    message: `${data.names[seat]}'s turn!`,
  };
}

function initialData(
  kinds?: Record<LudoSeatId, LudoPlayerKind>,
  names?: Record<LudoSeatId, string>,
  luckySixes = true,
): LudoData {
  const seatKinds = kinds ?? (Object.fromEntries(LUDO_SEATS.map((s) => [s.id, s.defaultKind])) as LudoData["kinds"]);
  const seatNames = names ?? (Object.fromEntries(LUDO_SEATS.map((s) => [s.id, s.defaultName])) as LudoData["names"]);
  const tokens = freshTokens();
  const first = activeSeats(seatKinds)[0] ?? "pink";
  const base: LudoData = {
    kinds: seatKinds,
    names: seatNames,
    bumps: { pink: 0, sky: 0, gold: 0, purple: 0 },
    tokens,
    turn: first,
    dice: 6,
    rollCount: 0,
    phase: "roll",
    triesLeft: 3,
    moves: [],
    moving: null,
    message: "",
    winner: null,
    burst: null,
    luckySixes,
  };
  return { ...base, ...turnStart(base, first) };
}

export const useLudoStore = create<LudoState>()(
  persist(
    (set, get) => ({
      ...initialData(),

      roll: () => {
        const s = get();
        if (s.phase !== "roll" || s.winner) return;
        set({
          dice: rollDie(s.luckySixes),
          rollCount: s.rollCount + 1,
          phase: "rolling",
          message: `${s.names[s.turn]} is rolling…`,
        });
      },

      settleRoll: () => {
        const s = get();
        if (s.phase !== "rolling") return;
        const name = s.names[s.turn];
        const moves = legalMoves(s.tokens, s.turn, s.dice, activeSeats(s.kinds));
        if (moves.length > 0) {
          set({
            phase: "pick",
            moves,
            message:
              s.kinds[s.turn] === "computer"
                ? `${name} rolled a ${s.dice}!`
                : moves.length === 1
                  ? `${name} rolled a ${s.dice}! Here we go!`
                  : `${name} rolled a ${s.dice}! Tap a sparkly piece!`,
          });
        } else if (s.triesLeft > 1) {
          const left = s.triesLeft - 1;
          set({
            phase: "roll",
            triesLeft: left,
            message: `Need a 6 to come out! ${left} more ${left === 1 ? "try" : "tries"}!`,
          });
        } else if (s.dice === 6) {
          set({ phase: "roll", triesLeft: 1, message: `A 6! ${name} rolls again!` });
        } else {
          set({ phase: "pass", moves: [], message: `No moves for ${name} this time!` });
        }
      },

      pickMove: (token) => {
        const s = get();
        if (s.phase !== "pick") return;
        const move = s.moves.find((m) => m.token === token);
        if (!move) return;
        set({
          phase: "moving",
          moves: [],
          moving: { token, path: stepPath(move.from, move.to), step: 0, bumps: move.bumps },
        });
      },

      stepMove: () => {
        const s = get();
        const moving = s.moving;
        if (s.phase !== "moving" || !moving) return;

        const seat = s.turn;
        const from = s.tokens[seat][moving.token];
        const to = moving.path[moving.step];
        const tokens: Tokens = { ...s.tokens, [seat]: s.tokens[seat].map((p, i) => (i === moving.token ? to : p)) };

        if (moving.step < moving.path.length - 1) {
          set({ tokens, moving: { ...moving, step: moving.step + 1 } });
          return;
        }

        // Landed — resolve bumps, home arrivals, wins and bonus rolls.
        const name = s.names[seat];
        let message = "";
        let burst: LudoBurst | null = null;
        const bumps = { ...s.bumps };
        const landing = piecePoint(seat, moving.token, to);

        if (moving.bumps) {
          const victim = moving.bumps;
          tokens[victim.seat] = tokens[victim.seat].map((p, i) => (i === victim.token ? -1 : p));
          bumps[seat] += 1;
          message = pick(LUDO_BUMP_LINES);
          burst = { key: Date.now(), point: landing, big: false };
        }
        if (from <= LAST_LOOP_STEP && to >= FIRST_HOME_STEP) {
          message = `${pick(LUDO_HOME_LINES)} ${name} made it to the podium lane!`;
          burst = { key: Date.now(), point: landing, big: true };
        }

        if (hasFinished(tokens[seat])) {
          if (s.kinds[seat] === "kid") useGameStore.getState().awardLudoWin(name, LUDO_WIN_STARS);
          set({
            tokens,
            bumps,
            moving: null,
            phase: "won",
            winner: seat,
            burst: { key: Date.now(), point: [6.5, 6.5], big: true },
            message: `${name} wins the gold medal!`,
          });
          return;
        }

        if (s.dice === 6) {
          set({
            tokens,
            bumps,
            burst: burst ?? s.burst,
            moving: null,
            phase: "roll",
            triesLeft: 1,
            message: message ? `${message} Rolled a 6, go again!` : `${name} rolled a 6, go again!`,
          });
          return;
        }

        const next = nextSeat(seat, s.kinds);
        const start = turnStart({ tokens, names: s.names }, next);
        set({ tokens, bumps, burst: burst ?? s.burst, ...start, message: message || (start.message as string) });
      },

      endPass: () => {
        const s = get();
        if (s.phase !== "pass") return;
        set(turnStart(s, nextSeat(s.turn, s.kinds)));
      },

      newGame: () => {
        const s = get();
        set(initialData(s.kinds, s.names, s.luckySixes));
      },

      toggleLuckySixes: () => set((s) => ({ luckySixes: !s.luckySixes })),

      setPlayer: (seat, change) => {
        const s = get();
        const names = { ...s.names };
        const kinds = { ...s.kinds };
        if (change.name !== undefined) names[seat] = change.name.slice(0, 14) || s.names[seat];
        if (change.kind !== undefined) {
          // Ludo needs at least two players on the board.
          if (change.kind === "off" && activeSeats(s.kinds).filter((x) => x !== seat).length < 2) return;
          kinds[seat] = change.kind;
        }
        const patch: Partial<LudoData> = { names, kinds };

        const switchedOnOrOff = (s.kinds[seat] === "off") !== (kinds[seat] === "off");
        if (switchedOnOrOff) {
          patch.tokens = { ...s.tokens, [seat]: [-1, -1, -1, -1] };
          patch.bumps = { ...s.bumps, [seat]: 0 };
        }
        if (kinds[seat] === "off" && s.turn === seat && !s.winner) {
          Object.assign(patch, turnStart({ tokens: patch.tokens ?? s.tokens, names }, nextSeat(seat, kinds)));
        } else if (s.turn === seat && s.phase === "roll") {
          patch.message = `${names[seat]}'s turn!`;
        }
        set(patch);
      },
    }),
    {
      name: "penelopes-sparkle-gym-ludo",
      version: 1,
      // The star burst is a one-shot effect, so it isn't saved (it would replay on reload).
      partialize: (state): Omit<LudoData, "burst"> => ({
        kinds: state.kinds,
        names: state.names,
        bumps: state.bumps,
        tokens: state.tokens,
        turn: state.turn,
        dice: state.dice,
        rollCount: state.rollCount,
        phase: state.phase,
        triesLeft: state.triesLeft,
        moves: state.moves,
        moving: state.moving,
        message: state.message,
        winner: state.winner,
        luckySixes: state.luckySixes,
      }),
    },
  ),
);
