import { useEffect, useRef, useState } from "react";
import { useSound } from "../audio/useSound";
import { StarBurst } from "../effects/StarBurst";
import { FriendFigure, GameChoice, GameHud, GameSheet, GameWin, NewGameRow } from "../games/GameKit";
import { OPPONENTS, opponentName } from "../games/gameUtils";
import { useBoxSize } from "../games/useBoxSize";
import { SUIT_SYMBOL, rankLabel, rankName, type WarCard } from "./warRules";
import { WAR_LENGTHS, WAR_WIN_STARS, useWarStore, type PotCard } from "./warStore";
import "../games/GameKit.css";
import "./WarScene.css";

const REVEAL_MS = 1100;
const WAR_MS = 1500;
const COLLECT_MS = 1300;

/**
 * Card sizes from the measured table so both piles and the face-off fit
 * top to bottom: two pile rows (~0.7 card each, at least the 82px friend
 * figure) plus two battle rows (1.4 card each) plus labels and padding.
 */
function cardSizesFor(width: number, height: number) {
  if (!width || !height) return { card: 120, deck: 80 };
  const card = Math.max(56, Math.min(160, width * 0.2, (height - 280) / 2.8, (height - 120) / 4.2));
  return { card: Math.round(card), deck: Math.round(Math.max(48, Math.min(110, card * 0.62))) };
}

const FACE_PICTURE: Record<number, string> = { 11: "🤸‍♀️", 12: "👸", 13: "🤴", 14: "🌟" };

function WarCardFace({ card }: { card: WarCard }) {
  const label = rankLabel(card.rank);
  const sym = SUIT_SYMBOL[card.suit];
  const face = card.rank > 10;
  return (
    <span className={`wcard wcard--${card.suit}`} aria-label={`${rankName(card.rank)} of ${card.suit}s`}>
      <span className="wcard__corner wcard__corner--tl">
        {label}
        <span>{sym}</span>
      </span>
      {face ? (
        <span className="wcard__center">
          <span className="wcard__picture">{FACE_PICTURE[card.rank]}</span>
          <span className="wcard__value">= {card.rank}</span>
        </span>
      ) : (
        <span className="wcard__center">
          <span className="wcard__rank">{card.rank}</span>
          <span className={`wcard__pips ${card.rank > 6 ? "wcard__pips--many" : ""}`} aria-hidden="true">
            {Array.from({ length: card.rank }, (_, i) => (
              <span key={i}>{sym}</span>
            ))}
          </span>
        </span>
      )}
      <span className="wcard__corner wcard__corner--br">
        {label}
        <span>{sym}</span>
      </span>
    </span>
  );
}

function WarCardBack() {
  return (
    <span className="wcard wcard--back" aria-hidden="true">
      <span>✦</span>
    </span>
  );
}

function Pot({ cards, side, highlight, flyTo }: { cards: PotCard[]; side: "kid" | "cpu"; highlight: boolean; flyTo: string | null }) {
  return (
    <div className={`war-pot war-pot--${side} ${flyTo ? `war-pot--fly-${flyTo === side ? "home" : "away"}` : ""}`}>
      {cards.map((p, i) => (
        <span
          key={p.card.id}
          className={`war-pot__card ${p.faceUp ? "war-pot__card--up" : "war-pot__card--down"} ${highlight && i === cards.length - 1 ? "war-pot__card--win" : ""}`}
          style={{ zIndex: i }}
        >
          {p.faceUp ? <WarCardFace card={p.card} /> : <WarCardBack />}
        </span>
      ))}
    </div>
  );
}

/** Times the reveal, the war and the collection after each flip. */
function useWarDriver() {
  const phase = useWarStore((s) => s.phase);
  const wars = useWarStore((s) => s.wars);
  useEffect(() => {
    const store = useWarStore.getState();
    const step = { reveal: [REVEAL_MS, store.resolve], war: [WAR_MS, store.goToWar], collect: [COLLECT_MS, store.collect] } as const;
    if (!(phase in step)) return;
    const [delay, action] = step[phase as keyof typeof step];
    const id = window.setTimeout(action, delay);
    return () => window.clearTimeout(id);
  }, [phase, wars]);
}

function useWarSounds() {
  const play = useSound();
  const phase = useWarStore((s) => s.phase);
  const roundWinner = useWarStore((s) => s.roundWinner);
  const winner = useWarStore((s) => s.winner);
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) return;
    if (phase === "reveal") play("tap");
    if (phase === "war") play("trampolineBoing");
    if (phase === "collect") play(roundWinner === "kid" ? "successCheer" : "landing");
  }, [phase, roundWinner, play]);
  useEffect(() => {
    if (mounted.current && winner) play(winner === "cpu" ? "tryAgain" : "bigSuccessCheer");
  }, [winner, play]);
  useEffect(() => {
    mounted.current = true;
  }, []);
}

function WarMenu({ onClose }: { onClose: () => void }) {
  const settings = useWarStore((s) => s.settings);
  const setLength = useWarStore((s) => s.setLength);
  const setLuckyDeal = useWarStore((s) => s.setLuckyDeal);
  const setOpponent = useWarStore((s) => s.setOpponent);
  const newGame = useWarStore((s) => s.newGame);
  const [confirming, setConfirming] = useState(false);

  return (
    <GameSheet title="Sparkle War" onClose={onClose}>
      <GameChoice
        label="Game length"
        help={
          settings.length === 0
            ? "Play until someone has every card. This can take a long time!"
            : `After ${settings.length} flips, whoever has more cards wins.`
        }
        options={WAR_LENGTHS.map((n) => ({ id: n, label: n === 0 ? "All cards" : `${n} flips` }))}
        value={settings.length}
        onPick={setLength}
      />
      <GameChoice
        label="🍀 Lucky deal"
        help={
          settings.luckyDeal
            ? "Penelope starts with more of the big cards. Starts next game."
            : "A fair deal for everyone. Starts next game."
        }
        options={[
          { id: "on", label: "Lucky" },
          { id: "off", label: "Fair" },
        ]}
        value={settings.luckyDeal ? "on" : "off"}
        onPick={(v) => setLuckyDeal(v === "on")}
      />
      <GameChoice
        label="Play against"
        help={`${opponentName(settings.opponentId)} is sitting across the mat.`}
        options={OPPONENTS.map((o) => ({ id: o.id, label: o.name }))}
        value={settings.opponentId}
        onPick={setOpponent}
      />
      <NewGameRow
        confirming={confirming}
        setConfirming={setConfirming}
        onConfirm={() => {
          newGame();
          onClose();
        }}
      />
      <details className="game-howto">
        <summary>How to play</summary>
        <ul className="game-rules">
          <li>Tap your cards to <b>flip</b>. Your friend flips too.</li>
          <li>The <b>bigger number</b> wins both cards. J = 11, Q = 12, K = 13, A = 14.</li>
          <li>Same number? It's <b>WAR!</b> 3 cards go down, 1 goes up, and the bigger one takes them all.</li>
          <li>Win by having the most cards at the end!</li>
        </ul>
      </details>
    </GameSheet>
  );
}

export function WarScene() {
  const s = useWarStore();
  const [menuOpen, setMenuOpen] = useState(false);
  useWarDriver();
  useWarSounds();
  const { ref: tableRef, width, height } = useBoxSize<HTMLDivElement>();
  const sizes = cardSizesFor(width, height);

  const friend = opponentName(s.settings.opponentId);
  const canFlip = s.phase === "flip";
  const flying = s.phase === "collect" ? s.roundWinner : null;
  const total = s.settings.length;

  return (
    <div
      className="game-scene war-scene"
      style={{ "--w-card": `${sizes.card}px`, "--deck-w": `${sizes.deck}px` } as React.CSSProperties}
    >
      <GameHud title="Sparkle" accent="War" onMenu={() => setMenuOpen(true)} />
      <p className={`game-message ${s.phase === "war" ? "war-message--war" : ""}`} aria-live="polite">
        {s.message}
      </p>

      <div className="war-table" ref={tableRef}>
        <section className="war-side war-side--cpu">
          <div className="war-side__figure">
            <FriendFigure id={s.settings.opponentId} pose={s.roundWinner === "cpu" ? "cheer" : "idle"} />
          </div>
          <div className="war-deck" aria-label={`${friend} has ${s.decks.cpu.length} cards`}>
            {s.decks.cpu.length > 0 ? <WarCardBack /> : <span className="war-deck__empty" />}
            <span className="war-deck__count">{s.decks.cpu.length}</span>
          </div>
          <span className="war-side__name">{friend}</span>
        </section>

        <section className="war-battle">
          <Pot cards={s.pot.cpu} side="cpu" highlight={s.roundWinner === "cpu"} flyTo={flying} />
          <div className="war-battle__mid">
            {s.phase === "war" ? (
              <span className="war-battle__war">WAR!</span>
            ) : (
              <span className="war-battle__flips">{total > 0 ? `Flip ${Math.min(s.flips + 1, total)} of ${total}` : `Flip ${s.flips + 1}`}</span>
            )}
          </div>
          <Pot cards={s.pot.kid} side="kid" highlight={s.roundWinner === "kid"} flyTo={flying} />
          <div className="war-battle__burst">
            {s.phase === "collect" && s.roundWinner === "kid" && <StarBurst triggerKey={s.flips} count={14} />}
          </div>
        </section>

        <section className="war-side war-side--kid">
          <span className="war-side__name">Penelope</span>
          <button
            type="button"
            className={`war-deck war-deck--kid ${canFlip ? "war-deck--ready" : ""}`}
            onClick={s.flip}
            disabled={!canFlip}
            aria-label={`Flip a card. You have ${s.decks.kid.length} cards`}
          >
            {s.decks.kid.length > 0 ? <WarCardBack /> : <span className="war-deck__empty" />}
            <span className="war-deck__count">{s.decks.kid.length}</span>
          </button>
          <span className={`war-side__hint ${canFlip ? "" : "war-side__hint--wait"}`}>{canFlip ? "Tap to flip!" : "Watch!"}</span>
        </section>
      </div>

      {menuOpen && <WarMenu onClose={() => setMenuOpen(false)} />}
      {s.winner && (
        <GameWin
          kidWon={s.winner === "tie" ? null : s.winner === "kid"}
          title={s.winner === "tie" ? "It's a tie!" : s.winner === "kid" ? "You win!" : `${friend} wins!`}
          subtitle={
            s.winner === "kid"
              ? `${s.decks.kid.length} cards to ${s.decks.cpu.length}! +${WAR_WIN_STARS} ⭐ for the gym`
              : s.winner === "tie"
                ? "Same number of cards! +1 ⭐ for the gym"
                : `${s.decks.cpu.length} cards to ${s.decks.kid.length}. Rematch?`
          }
          opponentId={s.settings.opponentId}
          onPlayAgain={s.newGame}
        />
      )}
    </div>
  );
}
