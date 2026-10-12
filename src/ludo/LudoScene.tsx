import { useEffect, useRef, useState } from "react";
import { LUDO_SEATS, LUDO_SEATS_BY_ID, type LudoPlayerKind, type LudoSeatId } from "../data/ludoSeats";
import { useGameStore } from "../state/gameStore";
import { useSound } from "../audio/useSound";
import { Penelope } from "../characters/Penelope";
import { BigButton } from "../components/ui/BigButton";
import { SoundToggle } from "../components/ui/SoundToggle";
import { LudoBoard } from "./LudoBoard";
import { LudoPiece } from "./LudoPiece";
import { chooseComputerMove } from "./ludoRules";
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
          ? chooseComputerMove(s.tokens, s.turn, s.moves, activeSeats(s.kinds))
          : s.moves[0];
        s.pickMove(move.token);
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
          {kind === "off" ? "Tap to join" : `${KIND_ICON[kind]} ${home}/4 home · ${bumps} bumps`}
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

function GameMenu({ onClose, showGymExit }: { onClose: () => void; showGymExit: boolean }) {
  const newGame = useLudoStore((s) => s.newGame);
  const luckySixes = useLudoStore((s) => s.luckySixes);
  const toggleLuckySixes = useLudoStore((s) => s.toggleLuckySixes);
  const goToScene = useGameStore((s) => s.goToScene);
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="ludo-sheet-layer" onClick={onClose}>
      <div className="ludo-sheet ludo-sheet--menu" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Game menu">
        <h2 className="ludo-sheet__title">Sparkle Ludo</h2>
        <ul className="ludo-rules">
          <li>Roll a <b>6</b> to bring a piece out of the locker room.</li>
          <li>Nothing out yet? You get <b>3 tries</b> to roll that 6.</li>
          <li>Rolled a 6? <b>Roll again!</b></li>
          <li>Land on someone to <b>bump</b> them back to their locker room.</li>
          <li>Get all 4 pieces up your beam to the podium to win the gold medal.</li>
        </ul>
        <button
          type="button"
          className={`ludo-lucky ${luckySixes ? "ludo-lucky--on" : ""}`}
          aria-pressed={luckySixes}
          onClick={toggleLuckySixes}
        >
          <span className="ludo-lucky__text">
            <span className="ludo-lucky__title">🍀 Lucky 6s</span>
            <span className="ludo-lucky__sub">
              {luckySixes ? "6 comes up 1 roll in 3" : "Regular dice: 6 comes up 1 roll in 6"}
            </span>
          </span>
          <span className="ludo-lucky__switch" aria-hidden="true" />
        </button>
        {confirming ? (
          <div className="ludo-sheet__confirm">
            <p>Start over? Every piece goes back to its locker room.</p>
            <div className="ludo-sheet__row">
              <BigButton
                size="md"
                onClick={() => {
                  newGame();
                  onClose();
                }}
              >
                Yes, new game
              </BigButton>
              <BigButton size="md" variant="ghost" onClick={() => setConfirming(false)}>
                Keep playing
              </BigButton>
            </div>
          </div>
        ) : (
          <div className="ludo-sheet__row">
            <BigButton size="md" variant="secondary" icon="🔄" onClick={() => setConfirming(true)}>
              New game
            </BigButton>
            {showGymExit && (
              <BigButton size="md" variant="ghost" icon="🤸‍♀️" onClick={() => goToScene("gym")}>
                Back to gym
              </BigButton>
            )}
          </div>
        )}
        <button className="ludo-sheet__close" onClick={onClose} aria-label="Close menu">
          ✕
        </button>
      </div>
    </div>
  );
}

function WinOverlay({ showGymExit }: { showGymExit: boolean }) {
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
          {showGymExit && (
            <BigButton size="lg" variant="ghost" icon="🤸‍♀️" onClick={() => goToScene("gym")}>
              Gym
            </BigButton>
          )}
        </div>
      </div>
    </div>
  );
}

/** `showGymExit={false}` drops the "back to gym" buttons, for when the game runs on its own page. */
export function LudoScene({ showGymExit = true }: { showGymExit?: boolean }) {
  const goToScene = useGameStore((s) => s.goToScene);
  const message = useLudoStore((s) => s.message);
  const turn = useLudoStore((s) => s.turn);
  const [setupSeat, setSetupSeat] = useState<LudoSeatId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const play = useSound();
  useLudoDriver(play);
  useLudoSounds(play);

  const turnSeat = LUDO_SEATS_BY_ID[turn];

  return (
    <div className="ludo-scene">
      <header className="ludo-scene__hud">
        {showGymExit ? (
          <BigButton size="md" variant="ghost" icon="⬅️" onClick={() => goToScene("gym")}>
            Gym
          </BigButton>
        ) : (
          <span className="ludo-scene__hud-spacer" />
        )}
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

      <div className="ludo-scene__table">
        <div className="ludo-table">
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
      {menuOpen && <GameMenu showGymExit={showGymExit} onClose={() => setMenuOpen(false)} />}
      <WinOverlay showGymExit={showGymExit} />
    </div>
  );
}
