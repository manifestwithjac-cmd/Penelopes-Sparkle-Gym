import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSound } from "../audio/useSound";
import { StarBurst } from "../effects/StarBurst";
import { FriendFigure, GameChoice, GameHud, GameSheet, GameWin, NewGameRow } from "../games/GameKit";
import { LEVEL_OPTIONS, OPPONENTS, opponentName } from "../games/gameUtils";
import { BigButton } from "../components/ui/BigButton";
import { MatchCardBack, MatchCardFace } from "./MatchCardView";
import { COLOR_CHARM, MATCH_COLORS, MATCH_COLOR_NAMES, canPlay, matchCardLabel } from "./matchRules";
import { HAND_SIZES, MATCH_WIN_STARS, useMatchStore, type HandSize } from "./matchStore";
import "../games/GameKit.css";
import "./MatchScene.css";

const CPU_THINK_MS = 1200;

const LEVEL_HELP = {
  easy: "Never plays Skip, +2 or +4 on you.",
  medium: "Plays a Skip or a + card now and then.",
  hard: "Plays to win!",
};

/** Times the computer friend's turns. */
function useCpuDriver() {
  const turn = useMatchStore((s) => s.turn);
  const phase = useMatchStore((s) => s.phase);
  const pile = useMatchStore((s) => s.discard.length + s.draw.length);
  const cpuCards = useMatchStore((s) => s.hands.cpu.length);
  useEffect(() => {
    if (turn !== "cpu" || phase !== "play") return;
    const id = window.setTimeout(() => useMatchStore.getState().cpuTurn(), CPU_THINK_MS);
    return () => window.clearTimeout(id);
  }, [turn, phase, pile, cpuCards]);
}

function useMatchSounds() {
  const play = useSound();
  const topId = useMatchStore((s) => s.discard[s.discard.length - 1].id);
  const kidCards = useMatchStore((s) => s.hands.kid.length);
  const sparkleKey = useMatchStore((s) => s.sparkleKey);
  const winner = useMatchStore((s) => s.winner);
  const prevKid = useRef(kidCards);
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) play("tap");
  }, [topId, play]);
  useEffect(() => {
    if (mounted.current && kidCards > prevKid.current) play("landing");
    prevKid.current = kidCards;
  }, [kidCards, play]);
  useEffect(() => {
    if (mounted.current && sparkleKey) play("sparkle");
  }, [sparkleKey, play]);
  useEffect(() => {
    if (mounted.current && winner) play(winner === "kid" ? "bigSuccessCheer" : "tryAgain");
  }, [winner, play]);
  useEffect(() => {
    mounted.current = true;
  }, []);
}

/** Card width and fan spacing so the hand always fits the row, however many cards she's holding. */
function useHandFit(count: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(360);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const cardW = Math.round(Math.min(150, Math.max(64, width * 0.17)));
  const pitch = count > 1 ? Math.min(cardW + 8, (width - cardW) / (count - 1)) : 0;
  return { ref, cardW, step: pitch - cardW };
}

function ColorPicker() {
  const chooseColor = useMatchStore((s) => s.chooseColor);
  return (
    <div className="game-sheet-layer">
      <div className="game-sheet match-picker" role="dialog" aria-label="Pick a color">
        <h2 className="game-sheet__title">🌈 Pick a color!</h2>
        <div className="match-picker__grid">
          {MATCH_COLORS.map((c) => (
            <button key={c} type="button" className={`match-picker__color match-picker__color--${c}`} onClick={() => chooseColor(c)}>
              <span aria-hidden="true">{COLOR_CHARM[c]}</span>
              {MATCH_COLOR_NAMES[c]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MatchMenu({ onClose }: { onClose: () => void }) {
  const settings = useMatchStore((s) => s.settings);
  const setLevel = useMatchStore((s) => s.setLevel);
  const setOpponent = useMatchStore((s) => s.setOpponent);
  const setHandSize = useMatchStore((s) => s.setHandSize);
  const newGame = useMatchStore((s) => s.newGame);
  const [confirm, setConfirm] = useState<null | HandSize>(null);

  return (
    <GameSheet title="Sparkle Match" onClose={onClose}>
      <GameChoice
        label="Computer friend"
        help={LEVEL_HELP[settings.level]}
        options={LEVEL_OPTIONS}
        value={settings.level}
        onPick={setLevel}
      />
      <GameChoice
        label="Play against"
        help={`${opponentName(settings.opponentId)} is sitting across the mat.`}
        options={OPPONENTS.map((o) => ({ id: o.id, label: o.name }))}
        value={settings.opponentId}
        onPick={setOpponent}
      />
      <GameChoice
        label="Cards to start"
        help={settings.handSize === 5 ? "A quicker game." : "The full game. 5 cards = a quicker game."}
        options={HAND_SIZES.map((n) => ({ id: n, label: `${n} cards` }))}
        value={settings.handSize}
        onPick={(n) => n !== settings.handSize && setConfirm(n)}
      />
      <NewGameRow
        confirming={confirm !== null}
        setConfirming={(v) => setConfirm(v ? settings.handSize : null)}
        question={confirm !== settings.handSize ? `Start a new game with ${confirm} cards each?` : undefined}
        onConfirm={() => {
          if (confirm !== null && confirm !== settings.handSize) setHandSize(confirm);
          else newGame();
          onClose();
        }}
      />
      <details className="game-howto">
        <summary>How to play</summary>
        <ul className="game-rules">
          <li>Play a card that matches the <b>color</b> or the <b>number</b>.</li>
          <li>No match? Tap the deck to <b>pick up</b> a card.</li>
          <li><b>✋ Skip</b>: your friend misses a turn. <b>+2</b>: they pick up 2.</li>
          <li><b>🌈 Rainbow</b> cards match anything. You pick the next color. <b>+4</b> also makes them pick up 4!</li>
          <li>One card left? Tap <b>SPARKLE!</b> First to play every card wins.</li>
        </ul>
      </details>
    </GameSheet>
  );
}

export function MatchScene() {
  const s = useMatchStore();
  const [menuOpen, setMenuOpen] = useState(false);
  // A saved game's last "Sparkle!" shouldn't burst again when the scene reopens.
  const [openedAt] = useState(() => Date.now());
  useCpuDriver();
  useMatchSounds();

  const top = s.discard[s.discard.length - 1];
  const under = s.discard.slice(-3, -1);
  const kidTurn = s.turn === "kid" && s.phase === "play" && !s.winner;
  const playableIds = new Set(
    kidTurn
      ? s.hands.kid.filter((c) => canPlay(c, top, s.color) && (!s.drewPlayable || c.id === s.drawnId)).map((c) => c.id)
      : [],
  );
  const mustDraw = kidTurn && !s.drewPlayable && playableIds.size === 0;
  const friend = opponentName(s.settings.opponentId);
  const { ref: handRef, cardW, step } = useHandFit(s.hands.kid.length);
  const backsShown = Math.min(s.hands.cpu.length, 12);

  return (
    <div className="game-scene match-scene" style={{ "--card-w": `${cardW}px` } as React.CSSProperties}>
      <GameHud title="Sparkle" accent="Match" onMenu={() => setMenuOpen(true)} />
      <p className={`game-message match-message match-message--${s.color}`} aria-live="polite">
        {s.message}
      </p>

      <div className="match-table">
        <section className={`match-opponent ${s.turn === "cpu" && !s.winner ? "match-opponent--turn" : ""}`}>
          <div className="match-opponent__who">
            <div className="match-opponent__figure">
              <FriendFigure id={s.settings.opponentId} pose={s.turn === "cpu" ? "cheer" : "idle"} />
            </div>
            <div className="match-opponent__text">
              <span className="match-opponent__name">{friend}</span>
              <span className="match-opponent__count">
                {s.hands.cpu.length} {s.hands.cpu.length === 1 ? "card" : "cards"}
              </span>
              {s.turn === "cpu" && !s.winner && <span className="match-thinking">thinking</span>}
            </div>
          </div>
          <div className="match-opponent__fan" aria-hidden="true">
            {Array.from({ length: backsShown }, (_, i) => (
              <span key={i} className="match-opponent__back" style={{ "--i": i - (backsShown - 1) / 2 } as React.CSSProperties}>
                <MatchCardBack />
              </span>
            ))}
          </div>
        </section>

        <section className="match-center">
          <button
            type="button"
            className={`match-deck ${mustDraw ? "match-deck--nudge" : ""}`}
            onClick={s.kidDraw}
            disabled={!kidTurn || s.drewPlayable}
            aria-label={`Pick up a card (${s.draw.length} left)`}
          >
            <span className="match-deck__stack" aria-hidden="true">
              <MatchCardBack />
            </span>
            <span className="match-deck__label">{mustDraw ? "Tap to pick up!" : "Pick up"}</span>
          </button>

          <div className="match-pile" aria-label={`Top card: ${matchCardLabel(top)}`}>
            {under.map((c, i) => (
              <span key={c.id} className="match-pile__under" style={{ "--tilt": `${i % 2 ? 7 : -6}deg` } as React.CSSProperties}>
                <MatchCardFace card={c} />
              </span>
            ))}
            <span key={top.id} className={`match-pile__top match-pile__top--from-${s.lastPlayedBy ?? "deal"}`}>
              <MatchCardFace card={top} chosenColor={top.color ? undefined : s.color} />
            </span>
          </div>

          <div className={`match-color match-color--${s.color}`}>
            <span aria-hidden="true">{COLOR_CHARM[s.color]}</span>
            <span>{MATCH_COLOR_NAMES[s.color]}</span>
          </div>
        </section>

        <section className={`match-kid ${kidTurn ? "match-kid--turn" : ""}`}>
          <div className="match-kid__actions">
            {s.hands.kid.length === 1 && !s.winner && (
              <BigButton size="md" variant="gold" icon="✨" onClick={s.callSparkle}>
                SPARKLE!
              </BigButton>
            )}
            {kidTurn && s.drewPlayable && (
              <BigButton size="md" variant="ghost" icon="⏭️" onClick={s.kidPass}>
                Pass
              </BigButton>
            )}
          </div>
          <div className="match-hand" ref={handRef}>
            {s.hands.kid.map((card, i) => {
              const ok = playableIds.has(card.id);
              return (
                <button
                  key={card.id}
                  type="button"
                  className={`match-hand__card ${ok ? "match-hand__card--ok" : ""} ${kidTurn && !ok ? "match-hand__card--no" : ""} ${card.id === s.drawnId ? "match-hand__card--new" : ""}`}
                  style={{ marginLeft: i === 0 ? 0 : step, zIndex: i } as React.CSSProperties}
                  disabled={!ok}
                  onClick={() => s.kidPlay(card.id)}
                  aria-label={`${matchCardLabel(card)}${ok ? ", play it" : ""}`}
                >
                  <MatchCardFace card={card} />
                </button>
              );
            })}
          </div>
          <div className="match-kid__burst">
            {s.sparkleKey > openedAt && <StarBurst triggerKey={s.sparkleKey} big count={18} />}
          </div>
        </section>
      </div>

      {s.phase === "chooseColor" && <ColorPicker />}
      {menuOpen && <MatchMenu onClose={() => setMenuOpen(false)} />}
      {s.winner && (
        <GameWin
          kidWon={s.winner === "kid"}
          title={s.winner === "kid" ? "You win!" : `${friend} wins!`}
          subtitle={s.winner === "kid" ? `Every card matched! +${MATCH_WIN_STARS} ⭐ for the gym` : "So close! Rematch?"}
          opponentId={s.settings.opponentId}
          onPlayAgain={s.newGame}
        />
      )}
    </div>
  );
}
