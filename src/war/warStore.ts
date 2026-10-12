import { create } from "zustand";
import { persist } from "zustand/middleware";
import { opponentName, shuffle } from "../games/gameUtils";
import { useGameStore } from "../state/gameStore";
import { WAR_FACE_DOWN, dealWar, rankName, type WarCard, type WarSide } from "./warRules";

/*
  Sparkle War game state. Penelope's tap flips; the scene's timer drives
  the reveal, the war and the card collection, each as a store action.
*/

export const WAR_WIN_STARS = 2;

/** Flips before the game ends and the bigger pile wins (0 = play until someone runs out). */
export const WAR_LENGTHS = [10, 20, 0] as const;
export type WarLength = (typeof WAR_LENGTHS)[number];

export interface WarSettings {
  length: WarLength;
  luckyDeal: boolean;
  opponentId: string;
}

export const DEFAULT_WAR_SETTINGS: WarSettings = { length: 10, luckyDeal: true, opponentId: "sadie" };

export interface PotCard {
  card: WarCard;
  faceUp: boolean;
}

export type WarPhase = "flip" | "reveal" | "war" | "collect" | "won";

interface WarData {
  decks: Record<WarSide, WarCard[]>;
  pot: Record<WarSide, PotCard[]>;
  phase: WarPhase;
  roundWinner: WarSide | null;
  /** How many wars in a row this battle has had (0 = a plain flip). */
  wars: number;
  flips: number;
  message: string;
  winner: WarSide | "tie" | null;
  settings: WarSettings;
}

interface WarActions {
  flip: () => void;
  resolve: () => void;
  goToWar: () => void;
  collect: () => void;
  newGame: () => void;
  setLength: (length: WarLength) => void;
  setLuckyDeal: (lucky: boolean) => void;
  setOpponent: (id: string) => void;
}

export type WarState = WarData & WarActions;

function freshGame(settings: WarSettings): WarData {
  return {
    decks: dealWar(settings.luckyDeal),
    pot: { kid: [], cpu: [] },
    phase: "flip",
    roundWinner: null,
    wars: 0,
    flips: 0,
    message: "Tap your cards to flip!",
    winner: null,
    settings,
  };
}

const faceUpTop = (pot: PotCard[]) => pot[pot.length - 1].card;

export const useWarStore = create<WarState>()(
  persist(
    (set, get) => {
      const friend = () => opponentName(get().settings.opponentId);

      function finish(decks: Record<WarSide, WarCard[]>, flips: number) {
        const kid = decks.kid.length;
        const cpu = decks.cpu.length;
        const winner: WarSide | "tie" = kid === cpu ? "tie" : kid > cpu ? "kid" : "cpu";
        if (winner !== "cpu") {
          useGameStore.getState().awardGameWin("Sparkle War", "Penelope", winner === "kid" ? WAR_WIN_STARS : 1);
        }
        set({
          decks,
          pot: { kid: [], cpu: [] },
          flips,
          phase: "won",
          winner,
          roundWinner: null,
          message: winner === "tie" ? "It's a tie!" : winner === "kid" ? "You win!" : `${friend()} wins!`,
        });
      }

      return {
        ...freshGame(DEFAULT_WAR_SETTINGS),

        flip: () => {
          const s = get();
          if (s.phase !== "flip") return;
          const [kidCard, ...kidRest] = s.decks.kid;
          const [cpuCard, ...cpuRest] = s.decks.cpu;
          if (!kidCard || !cpuCard) {
            finish(s.decks, s.flips);
            return;
          }
          set({
            decks: { kid: kidRest, cpu: cpuRest },
            pot: { kid: [{ card: kidCard, faceUp: true }], cpu: [{ card: cpuCard, faceUp: true }] },
            phase: "reveal",
            wars: 0,
            roundWinner: null,
            message: `Your ${rankName(kidCard.rank)} and ${friend()}'s ${rankName(cpuCard.rank)}…`,
          });
        },

        resolve: () => {
          const s = get();
          if (s.phase !== "reveal") return;
          const kid = faceUpTop(s.pot.kid);
          const cpu = faceUpTop(s.pot.cpu);
          const count = s.pot.kid.length + s.pot.cpu.length;
          if (kid.rank === cpu.rank) {
            set({ phase: "war", message: `Two ${rankName(kid.rank)}s! It's WAR! ⚔️` });
          } else if (kid.rank > cpu.rank) {
            set({
              phase: "collect",
              roundWinner: "kid",
              message: `${rankName(kid.rank)} is bigger than ${rankName(cpu.rank)}! You win ${count} cards!`,
            });
          } else {
            set({
              phase: "collect",
              roundWinner: "cpu",
              message: `${rankName(cpu.rank)} is bigger than ${rankName(kid.rank)}. ${friend()} gets ${count} cards.`,
            });
          }
        },

        goToWar: () => {
          const s = get();
          if (s.phase !== "war") return;
          const kidLeft = s.decks.kid.length;
          const cpuLeft = s.decks.cpu.length;
          // Someone has nothing left to put down: the other player takes the pile.
          if (kidLeft === 0 || cpuLeft === 0) {
            const taker: WarSide = kidLeft === 0 && cpuLeft === 0 ? "kid" : kidLeft === 0 ? "cpu" : "kid";
            set({ phase: "collect", roundWinner: taker, message: "Out of cards for the war!" });
            return;
          }
          const lay = (deck: WarCard[]) => {
            const down = Math.min(WAR_FACE_DOWN, deck.length - 1);
            const cards: PotCard[] = deck.slice(0, down).map((card) => ({ card, faceUp: false }));
            cards.push({ card: deck[down], faceUp: true });
            return { cards, rest: deck.slice(down + 1) };
          };
          const kid = lay(s.decks.kid);
          const cpu = lay(s.decks.cpu);
          set({
            decks: { kid: kid.rest, cpu: cpu.rest },
            pot: { kid: [...s.pot.kid, ...kid.cards], cpu: [...s.pot.cpu, ...cpu.cards] },
            phase: "reveal",
            wars: s.wars + 1,
            message: "3 cards down, 1 card up…",
          });
        },

        collect: () => {
          const s = get();
          if (s.phase !== "collect" || !s.roundWinner) return;
          const won = shuffle([...s.pot.kid, ...s.pot.cpu].map((p) => p.card));
          const decks = { ...s.decks, [s.roundWinner]: [...s.decks[s.roundWinner], ...won] };
          const flips = s.flips + 1;
          const limit = s.settings.length;
          if (decks.kid.length === 0 || decks.cpu.length === 0 || (limit > 0 && flips >= limit)) {
            finish(decks, flips);
            return;
          }
          set({
            decks,
            pot: { kid: [], cpu: [] },
            flips,
            phase: "flip",
            roundWinner: null,
            message: "Tap your cards to flip!",
          });
        },

        newGame: () => set(freshGame(get().settings)),
        setLength: (length) => set((s) => ({ settings: { ...s.settings, length } })),
        setLuckyDeal: (luckyDeal) => set((s) => ({ settings: { ...s.settings, luckyDeal } })),
        setOpponent: (opponentId) => set((s) => ({ settings: { ...s.settings, opponentId } })),
      };
    },
    { name: "penelopes-sparkle-gym-war", version: 1 },
  ),
);
