import { useEffect, useRef, useState } from "react";
import { LUDO_SEATS, LUDO_SEATS_BY_ID, type LudoPlayerKind, type LudoSeatId } from "../data/ludoSeats";
import { useGameStore } from "../state/gameStore";
import { useSound } from "../audio/useSound";
import { Penelope } from "../characters/Penelope";
import { BigButton } from "../components/ui/BigButton";
import { SoundToggle } from "../components/ui/SoundToggle";
import { GameChoice } from "../games/GameKit";
import { useBoxSize } from "../games/useBoxSize";
import { LudoBoard } from "./LudoBoard";
import { LudoPiece } from "./LudoPiece";
import {
  PIECE_COUNTS,
  SIX_BOOSTS,
  chooseComputerMove,
  sixChance,
  type ComputerLevel,
  type PieceCount,
} from "./ludoRules";
import { LUDO_WIN_STARS, activeSeats, useLudoStore } from "./ludoStore";
import "./LudoScene.css";

// Pacing, tuned for a 5-year-old watching: slow enough to follow every
// step, quick enough that computer turns don't drag.
const DICE_TUMBLE_MS = 750;
/** One spot of movement. The board's glide transition uses the same value so pieces slide without stopping. */
const STEP_MS = 240;
const PASS_MS = 1300;
const COMPUTER_ROLL_MS = 900;
const PICK_DELAY_MS = 650;

const KIND_ICON: Record<LudoPlayerKind, string> = { kid: "🙋‍♀️", computer: "🤖", off: "💤" };

const TABLE_GAP = 10;

/**
 * Picks where the four scorecards go (above/below the board, or beside it)
 * by whichever leaves the bigger board, and sizes everything in px.
 */
function tableLayout(width: number, height: number) {
  const badgeH = width < 520 ? 60 : 74;
  const badgeW = Math.round(Math.min(240, Math.max(150, width * 0.21)));
  const tall = Math.min(width, height - 2 * (badgeH + TABLE_GAP));
  const wide = Math.min(height, width - 2 * (badgeW + TABLE_GAP));
  const arrangement: "tall" | "wide" = tall >= wide ? "tall" : "wide";
  const board = Math.max(200, Math.floor(Math.max(tall, wide)));
  return { arrangement, board, badgeW, badgeH };
}

/** Drives the game clock: dice tumbles, piece steps and computer turns. */
function useLudoDriver(play: ReturnType<typeof useSound>) {
  const phase = useLudoStore((s) => s.phase);
  const turn = useLudoStore((s) => s.turn);
  const step = useLudoStore((s) => s.moving?.step ?? -1);
  const rollCount = useLudoStore((s) => s.rollCount);
  const triesLeft = useLudoStore((s) => s.triesLeft);
  const isComputer = useLudoStore((s) => s.kinds[s.turn] === "computer");

  useEffect(() => {
    const store = useLudoStore.getState();
    let delay = -1;
    let action: () => void = () => {};

    if (phase === "rolling") {
      delay = DICE_TUMBLE_MS;
      action = store.settleRoll;
    } else if (phase === "moving") {
      // The first step goes right away so the piece answers the tap; the
      // tick plays in the same moment the piece starts gliding.
      delay = step === 0 ? 0 : STEP_MS;
      action = () => {
        store.stepMove();
        play("tap");
      };
    } else if (phase === "pass") {
      delay = PASS_MS;
      action = store.endPass;
    } else if (phase === "roll" && isComputer) {
      delay = COMPUTER_ROLL_MS;
      action = store.roll;
    } else if (phase === "pick" && (isComputer || store.moves.length === 1)) {
      delay = PICK_DELAY_MS;
      action = () => {
        const s = useLudoStore.getState();
        if (s.phase !== "pick" || s.moves.length === 0) return;
        const move = isComputer
          ? chooseComputerMove(s.tokens, s.turn, s.moves, activeSeats(s.kinds), s.settings.level, s.kinds)
          : s.moves[0];
        if (move) s.pickMove(move.token);
        else s.skipKindly();
      };
    }

    if (delay < 0) return;
    const id = window.setTimeout(action, delay);
    return () => window.clearTimeout(id);
  }, [phase, turn, step, rollCount, triesLeft, isComputer, play]);
}

/** Plays sounds in response to game events (rolls, bumps, wins). Step ticks play from the driver. */
function useLudoSounds(play: ReturnType<typeof useSound>) {
  const rollCount = useLudoStore((s) => s.rollCount);
  const burstKey = useLudoStore((s) => s.burst?.key ?? 0);
  const burstBig = useLudoStore((s) => s.burst?.big ?? false);
  const winner = useLudoStore((s) => s.winner);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) return;
    play("diceRoll");
  }, [rollCount, play]);
  useEffect(() => {
    if (first.current || !burstKey) return;
    play(burstBig ? "sparkle" : "trampolineBoing");
  }, [burstKey, burstBig, play]);
  useEffect(() => {
    if (first.current || !winner) return;
    play("bigSuccessCheer");
  }, [winner, play]);
  // Skip sounds for whatever state was restored on mount.
  useEffect(() => {
    first.current = false;
  }, []);
}

function PlayerBadge({ seatId, onSetup }: { seatId: LudoSeatId; onSetup: () => void }) {
  const seat = LUDO_SEATS_BY_ID[seatId];
  const name = useLudoStore((s) => s.names[seatId]);
  const kind = useLudoStore((s) => s.kinds[seatId]);
  const bumps = useLudoStore((s) => s.bumps[seatId]);
  const isTurn = useLudoStore((s) => s.turn === seatId && !s.winner);
  const home = useLudoStore((s) => s.tokens[seatId].filter((p) => p >= 47).length);
  const pieces = useLudoStore((s) => s.tokens[seatId].length);

  return (
    <button
      type="button"
      className={`ludo-badge ludo-badge--${seat.corner} ${isTurn ? "ludo-badge--turn" : ""} ${kind === "off" ? "ludo-badge--off" : ""}`}
      style={{ "--seat": seat.color, "--seat-light": seat.light, "--seat-deep": seat.deep } as React.CSSProperties}
      onClick={onSetup}
    >
      <span className="ludo-badge__avatar">
        <LudoPiece seat={seat} />
      </span>
      <span className="ludo-badge__text">
        <span className="ludo-badge__name">{name}</span>
        <span className="ludo-badge__meta">
          {kind === "off" ? "Tap to join" : `${KIND_ICON[kind]} ${home}/${pieces} home · ${bumps} bumps`}
        </span>
      </span>
      {isTurn && <span className="ludo-badge__turn">Your turn!</span>}
    </button>
  );
}

function SetupSheet({ seatId, onClose }: { seatId: LudoSeatId; onClose: () => void }) {
  const seat = LUDO_SEATS_BY_ID[seatId];
  const name = useLudoStore((s) => s.names[seatId]);
  const kind = useLudoStore((s) => s.kinds[seatId]);
  const playerCount = useLudoStore((s) => activeSeats(s.kinds).length);
  const setPlayer = useLudoStore((s) => s.setPlayer);
  const [draft, setDraft] = useState(name);

  const close = () => {
    setPlayer(seatId, { name: draft.trim() });
    onClose();
  };

  const options: { kind: LudoPlayerKind; label: string; icon: string }[] = [
    { kind: "kid", label: "Player", icon: "🙋‍♀️" },
    { kind: "computer", label: "Computer", icon: "🤖" },
    { kind: "off", label: "Sit out", icon: "💤" },
  ];

  return (
    <div className="ludo-sheet-layer" onClick={close}>
      <div
        className="ludo-sheet"
        style={{ "--seat": seat.color, "--seat-light": seat.light, "--seat-deep": seat.deep } as React.CSSProperties}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Set up the ${seat.corner.replace("-", " ")} player`}
      >
        <div className="ludo-sheet__piece">
          <LudoPiece seat={seat} />
        </div>
        <label className="ludo-sheet__label" htmlFor={`ludo-name-${seatId}`}>
          Name
        </label>
        <input
          id={`ludo-name-${seatId}`}
          className="ludo-sheet__input"
          value={draft}
          maxLength={14}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && close()}
        />
        <div className="ludo-sheet__kinds" role="radiogroup" aria-label="Who plays this color">
          {options.map((o) => {
            const blocked = o.kind === "off" && kind !== "off" && playerCount <= 2;
            return (
              <button
                key={o.kind}
                type="button"
                role="radio"
                aria-checked={kind === o.kind}
                className={`ludo-sheet__kind ${kind === o.kind ? "ludo-sheet__kind--on" : ""}`}
                disabled={blocked}
                onClick={() => setPlayer(seatId, { kind: o.kind })}
              >
                <span className="ludo-sheet__kind-icon">{o.icon}</span>
                {o.label}
              </button>
            );
          })}
        </div>
        {playerCount <= 2 && kind !== "off" && (
          <p className="ludo-sheet__note">Ludo needs at least 2 players.</p>
        )}
        <BigButton size="md" onClick={close}>
          Done
        </BigButton>
      </div>
    </div>
  );
}

const LEVELS: { id: ComputerLevel; label: string; icon: string; help: string }[] = [
  { id: "easy", label: "Easy", icon: "🧸", help: "Computers never bump your pieces home." },
  { id: "medium", label: "Medium", icon: "🌟", help: "Computers only sometimes bump your pieces." },
  { id: "hard", label: "Hard", icon: "🔥", help: "Computers play to win and bump anyone." },
];

function GameMenu({ onClose }: { onClose: () => void }) {
  const newGame = useLudoStore((s) => s.newGame);
  const settings = useLudoStore((s) => s.settings);
  const setSixBoost = useLudoStore((s) => s.setSixBoost);
  const setLevel = useLudoStore((s) => s.setLevel);
  const setPieceCount = useLudoStore((s) => s.setPieceCount);
  const goToScene = useGameStore((s) => s.goToScene);
  // A new game, or a new piece count (which also restarts), waits for a yes.
  const [confirming, setConfirming] = useState<null | { pieces: PieceCount }>(null);

  const sixPercent = Math.round(sixChance(settings.sixBoost) * 100);

  return (
    <div className="ludo-sheet-layer" onClick={onClose}>
      <div className="ludo-sheet ludo-sheet--menu" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Game menu">
        <h2 className="ludo-sheet__title">Sparkle Ludo</h2>

        <GameChoice
          label="Computer players"
          help={LEVELS.find((l) => l.id === settings.level)!.help}
          options={LEVELS}
          value={settings.level}
          onPick={setLevel}
        />
        <GameChoice
          label="🍀 Lucky 6s"
          help={
            settings.sixBoost === 1
              ? `Regular dice: a 6 comes up ${sixPercent}% of the time.`
              : `A 6 comes up ${sixPercent}% of the time. More 6s = faster game!`
          }
          options={SIX_BOOSTS.map((b) => ({ id: b, label: b === 1 ? "Off" : `${b}×` }))}
          value={settings.sixBoost}
          onPick={setSixBoost}
        />
        <GameChoice
          label="Pieces each"
          help={
            settings.pieceCount === 4
              ? "The full game. Fewer pieces = a shorter game."
              : `A shorter game: get ${settings.pieceCount} pieces home to win.`
          }
          options={PIECE_COUNTS.map((n) => ({ id: n, label: String(n) }))}
          value={settings.pieceCount}
          onPick={(pieces) => pieces !== settings.pieceCount && setConfirming({ pieces })}
        />

        {confirming ? (
          <div className="ludo-sheet__confirm">
            <p>
              {confirming.pieces === settings.pieceCount
                ? "Start over? Every piece goes back to its locker room."
                : `Start a new game with ${confirming.pieces} pieces each?`}
            </p>
            <div className="ludo-sheet__row">
              <BigButton
                size="md"
                onClick={() => {
                  if (confirming.pieces === settings.pieceCount) newGame();
                  else setPieceCount(confirming.pieces);
                  onClose();
                }}
              >
                Yes, new game
              </BigButton>
              <BigButton size="md" variant="ghost" onClick={() => setConfirming(null)}>
                Keep playing
              </BigButton>
            </div>
          </div>
        ) : (
          <div className="ludo-sheet__row">
            <BigButton
              size="md"
              variant="secondary"
              icon="🔄"
              onClick={() => setConfirming({ pieces: settings.pieceCount })}
            >
              New game
            </BigButton>
            <BigButton size="md" variant="ghost" icon="🎲" onClick={() => goToScene("gameroom")}>
              Other games
            </BigButton>
          </div>
        )}

        <details className="ludo-howto">
          <summary>How to play</summary>
          <ul className="ludo-rules">
            <li>Roll a <b>6</b> to bring a piece out of the locker room.</li>
            <li>Nothing out yet? You get <b>3 tries</b> to roll that 6.</li>
            <li>Rolled a 6? <b>Roll again!</b></li>
            <li>Land on someone to <b>bump</b> them back to their locker room.</li>
            <li>Get all {settings.pieceCount} pieces up your beam to the podium to win the gold medal.</li>
          </ul>
        </details>

        <button className="ludo-sheet__close" onClick={onClose} aria-label="Close menu">
          ✕
        </button>
      </div>
    </div>
  );
}

function WinOverlay() {
  const winner = useLudoStore((s) => s.winner);
  const name = useLudoStore((s) => (s.winner ? s.names[s.winner] : ""));
  const kind = useLudoStore((s) => (s.winner ? s.kinds[s.winner] : "off"));
  const newGame = useLudoStore((s) => s.newGame);
  const goToScene = useGameStore((s) => s.goToScene);
  if (!winner) return null;
  const seat = LUDO_SEATS_BY_ID[winner];

  return (
    <div className="ludo-win" style={{ "--seat": seat.color, "--seat-deep": seat.deep } as React.CSSProperties}>
      <div className="ludo-win__card">
        <div className="ludo-win__penelope">
          <Penelope pose="celebrate" />
        </div>
        <div className="ludo-win__medal" aria-hidden="true">
          🥇
        </div>
        <h2 className="ludo-win__title">{name} wins!</h2>
        <p className="ludo-win__sub">
          {kind === "kid" ? `Gold medal performance! +${LUDO_WIN_STARS} ⭐ for the gym` : "What a routine! Rematch?"}
        </p>
        <div className="ludo-sheet__row">
          <BigButton size="lg" icon="🎲" onClick={newGame}>
            Play again
          </BigButton>
          <BigButton size="lg" variant="ghost" icon="🎲" onClick={() => goToScene("gameroom")}>
            Games
          </BigButton>
        </div>
      </div>
    </div>
  );
}

export function LudoScene() {
  const goToScene = useGameStore((s) => s.goToScene);
  const message = useLudoStore((s) => s.message);
  const turn = useLudoStore((s) => s.turn);
  const [setupSeat, setSetupSeat] = useState<LudoSeatId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const play = useSound();
  useLudoDriver(play);
  const { ref: tableRef, width, height } = useBoxSize<HTMLDivElement>();
  const layout = tableLayout(width, height);
  useLudoSounds(play);

  const turnSeat = LUDO_SEATS_BY_ID[turn];

  return (
    <div className="ludo-scene">
      <header className="ludo-scene__hud">
        <BigButton size="md" variant="ghost" icon="⬅️" onClick={() => goToScene("gameroom")}>
          Games
        </BigButton>
        <h1 className="ludo-scene__title">
          Sparkle <span>Ludo</span>
        </h1>
        <div className="ludo-scene__hud-right">
          <SoundToggle />
          <button className="ludo-scene__gear" onClick={() => setMenuOpen(true)} aria-label="Game menu">
            ⚙️
          </button>
        </div>
      </header>

      <p
        className="ludo-scene__message"
        style={{ "--seat": turnSeat.color, "--seat-deep": turnSeat.deep } as React.CSSProperties}
        aria-live="polite"
      >
        {message}
      </p>

      <div className="ludo-scene__table" ref={tableRef}>
        <div
          className={`ludo-table ludo-table--${layout.arrangement}`}
          style={
            {
              "--board": `${layout.board}px`,
              "--badge-w": `${layout.badgeW}px`,
              "--ludo-badge-h": `${layout.badgeH}px`,
            } as React.CSSProperties
          }
        >
          {LUDO_SEATS.map((seat) => (
            <div key={seat.id} className={`ludo-table__slot ludo-table__slot--${seat.corner}`}>
              <PlayerBadge seatId={seat.id} onSetup={() => setSetupSeat(seat.id)} />
            </div>
          ))}
          <div className="ludo-table__board">
            <LudoBoard stepMs={STEP_MS} />
          </div>
        </div>
      </div>

      {setupSeat && <SetupSheet seatId={setupSeat} onClose={() => setSetupSeat(null)} />}
      {menuOpen && <GameMenu onClose={() => setMenuOpen(false)} />}
      <WinOverlay />
    </div>
  );
}
