import { create } from "zustand";
import { persist } from "zustand/middleware";
import { opponentName, shuffle, type ComputerLevel } from "../games/gameUtils";
import { useGameStore } from "../state/gameStore";
import {
  MATCH_COLOR_NAMES,
  canPlay,
  chooseCpuCard,
  chooseWildColor,
  deal,
  isWild,
  sortHand,
  type MatchCard,
  type MatchColor,
  type MatchSide,
} from "./matchRules";

/*
  Sparkle Match game state. Like Ludo, every transition is a store action
  and the scene only times the computer's turns, so a game survives the
  iPad going to sleep.
*/

export const MATCH_WIN_STARS = 2;
export const HAND_SIZES = [5, 7] as const;
export type HandSize = (typeof HAND_SIZES)[number];

export interface MatchSettings {
  level: ComputerLevel;
  handSize: HandSize;
  opponentId: string;
}

export const DEFAULT_MATCH_SETTINGS: MatchSettings = { level: "easy", handSize: 7, opponentId: "isabella" };

export type MatchPhase = "play" | "chooseColor" | "won";

interface MatchData {
  draw: MatchCard[];
  discard: MatchCard[];
  hands: Record<MatchSide, MatchCard[]>;
  /** The color in play (a rainbow card's chosen color, else the top card's). */
  color: MatchColor;
  turn: MatchSide;
  phase: MatchPhase;
  /** Penelope drew a card this turn that she can play: play it or pass. */
  drewPlayable: boolean;
  /** The card she just drew (the only one she may play after drawing). */
  drawnId: number | null;
  lastPlayedBy: MatchSide | null;
  message: string;
  winner: MatchSide | null;
  /** Bumps whenever someone says "Sparkle!" (one card left), to fire the burst. */
  sparkleKey: number;
  settings: MatchSettings;
}

interface MatchActions {
  kidPlay: (cardId: number) => void;
  chooseColor: (color: MatchColor) => void;
  kidDraw: () => void;
  kidPass: () => void;
  cpuTurn: () => void;
  callSparkle: () => void;
  newGame: () => void;
  setLevel: (level: ComputerLevel) => void;
  setOpponent: (id: string) => void;
  setHandSize: (size: HandSize) => void;
}

export type MatchState = MatchData & MatchActions;

function freshGame(settings: MatchSettings): MatchData {
  const d = deal(settings.handSize);
  return {
    draw: d.draw,
    discard: d.discard,
    hands: { kid: d.kid, cpu: d.cpu },
    color: d.discard[0].color as MatchColor,
    turn: "kid",
    phase: "play",
    drewPlayable: false,
    drawnId: null,
    lastPlayedBy: null,
    message: "Your turn! Match the color or the number.",
    winner: null,
    sparkleKey: 0,
    settings,
  };
}

/** Takes `n` cards off the draw pile, reshuffling the played cards (all but the top) when it runs out. */
function drawCards(s: Pick<MatchData, "draw" | "discard">, n: number) {
  let draw = [...s.draw];
  let discard = [...s.discard];
  const cards: MatchCard[] = [];
  for (let i = 0; i < n; i++) {
    if (draw.length === 0) {
      if (discard.length <= 1) break;
      draw = shuffle(discard.slice(0, -1));
      discard = discard.slice(-1);
    }
    cards.push(draw.shift()!);
  }
  return { draw, discard, cards };
}

const other = (side: MatchSide): MatchSide => (side === "kid" ? "cpu" : "kid");

export const useMatchStore = create<MatchState>()(
  persist(
    (set, get) => {
      const names = (side: MatchSide) => (side === "kid" ? "Penelope" : opponentName(get().settings.opponentId));

      /** A card has landed on the pile (and its color is settled): apply its effect and pass the turn. */
      function finishPlay(by: MatchSide, card: MatchCard, color: MatchColor, base: Partial<MatchData>) {
        const s = { ...get(), ...base };
        const hand = s.hands[by];
        const friend = names("cpu");

        if (hand.length === 0) {
          if (by === "kid") useGameStore.getState().awardGameWin("Sparkle Match", "Penelope", MATCH_WIN_STARS);
          set({ ...base, color, phase: "won", winner: by, message: by === "kid" ? "You matched them all!" : `${friend} wins!` });
          return;
        }

        const target = other(by);
        const penalty = card.kind === "plus2" ? 2 : card.kind === "wild4" ? 4 : 0;
        let draw = s.draw;
        let discard = s.discard;
        let hands = s.hands;
        if (penalty) {
          const d = drawCards(s, penalty);
          draw = d.draw;
          discard = d.discard;
          hands = { ...hands, [target]: target === "kid" ? sortHand([...hands[target], ...d.cards]) : [...hands[target], ...d.cards] };
        }

        const colorNote = isWild(card) ? ` ${MATCH_COLOR_NAMES[color]} it is!` : "";
        const loseTurn = card.kind === "skip" || penalty > 0;
        let message: string;
        if (loseTurn) {
          const what = penalty ? `${names(target)} picks up ${penalty}` : `${names(target)} is skipped`;
          message = by === "kid" ? `${what}! Go again!${colorNote}` : `Oops! ${what}.${colorNote}`;
        } else {
          message = by === "kid" ? `${friend}'s turn…${colorNote}` : `Your turn!${colorNote}`;
        }
        if (hand.length === 1) {
          message = by === "kid" ? "One card left! Tap SPARKLE!" : `${friend} says SPARKLE! One card left!`;
        }

        set({
          ...base,
          draw,
          discard,
          hands,
          color,
          phase: "play",
          turn: loseTurn ? by : target,
          drewPlayable: false,
          drawnId: null,
          lastPlayedBy: by,
          message,
          sparkleKey: by === "cpu" && hand.length === 1 ? Date.now() : s.sparkleKey,
        });
      }

      return {
        ...freshGame(DEFAULT_MATCH_SETTINGS),

        kidPlay: (cardId) => {
          const s = get();
          if (s.turn !== "kid" || s.phase !== "play") return;
          const card = s.hands.kid.find((c) => c.id === cardId);
          const top = s.discard[s.discard.length - 1];
          if (!card || !canPlay(card, top, s.color)) return;
          // After drawing, only the card she just drew can be played.
          if (s.drewPlayable && card.id !== s.drawnId) return;

          const base: Partial<MatchData> = {
            hands: { ...s.hands, kid: s.hands.kid.filter((c) => c.id !== cardId) },
            discard: [...s.discard, card],
            lastPlayedBy: "kid",
          };
          if (isWild(card)) {
            set({ ...base, phase: "chooseColor", drewPlayable: false, drawnId: null, message: "Pick a color!" });
            return;
          }
          finishPlay("kid", card, card.color as MatchColor, base);
        },

        chooseColor: (color) => {
          const s = get();
          if (s.phase !== "chooseColor") return;
          finishPlay("kid", s.discard[s.discard.length - 1], color, {});
        },

        kidDraw: () => {
          const s = get();
          if (s.turn !== "kid" || s.phase !== "play" || s.drewPlayable) return;
          const d = drawCards(s, 1);
          const card = d.cards[0];
          const top = d.discard[d.discard.length - 1];
          const hands = { ...s.hands, kid: sortHand([...s.hands.kid, ...d.cards]) };
          if (card && canPlay(card, top, s.color)) {
            set({ draw: d.draw, discard: d.discard, hands, drewPlayable: true, drawnId: card.id, message: "You can play it! Or pass." });
          } else {
            set({ draw: d.draw, discard: d.discard, hands, turn: "cpu", message: `No match. ${names("cpu")}'s turn…` });
          }
        },

        kidPass: () => {
          const s = get();
          if (s.turn !== "kid" || !s.drewPlayable) return;
          set({ turn: "cpu", drewPlayable: false, drawnId: null, message: `${names("cpu")}'s turn…` });
        },

        cpuTurn: () => {
          const s = get();
          if (s.turn !== "cpu" || s.phase !== "play") return;
          const { level } = s.settings;
          const top = s.discard[s.discard.length - 1];
          let hand = s.hands.cpu;
          let pick = chooseCpuCard(hand.filter((c) => canPlay(c, top, s.color)), s.hands.kid.length, level);
          let draw = s.draw;
          let discard = s.discard;

          if (!pick) {
            const d = drawCards(s, 1);
            draw = d.draw;
            discard = d.discard;
            hand = [...hand, ...d.cards];
            const drawn = d.cards[0];
            if (drawn && canPlay(drawn, top, s.color)) pick = chooseCpuCard([drawn], s.hands.kid.length, level);
            if (!pick) {
              set({ draw, discard, hands: { ...s.hands, cpu: hand }, turn: "kid", message: `${names("cpu")} picked up a card. Your turn!` });
              return;
            }
          }

          const card = pick;
          const color = isWild(card) ? chooseWildColor(hand.filter((c) => c.id !== card.id), level) : (card.color as MatchColor);
          finishPlay("cpu", card, color, {
            draw,
            discard: [...discard, card],
            hands: { ...s.hands, cpu: hand.filter((c) => c.id !== card.id) },
          });
        },

        callSparkle: () => {
          const s = get();
          if (s.hands.kid.length !== 1 || s.winner) return;
          set({ sparkleKey: Date.now(), message: "SPARKLE! ✨ One card to go!" });
        },

        newGame: () => set(freshGame(get().settings)),
        setLevel: (level) => set((s) => ({ settings: { ...s.settings, level } })),
        setOpponent: (opponentId) => set((s) => ({ settings: { ...s.settings, opponentId } })),
        setHandSize: (handSize) => set((s) => freshGame({ ...s.settings, handSize })),
      };
    },
    { name: "penelopes-sparkle-gym-match", version: 1 },
  ),
);
