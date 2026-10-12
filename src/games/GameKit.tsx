import type { ReactNode } from "react";
import { FRIENDS, FRIENDS_BY_ID } from "../data/friends";
import { GymnastFigure, type FigurePose } from "../characters/GymnastFigure";
import { Penelope } from "../characters/Penelope";
import { BigButton } from "../components/ui/BigButton";
import { SoundToggle } from "../components/ui/SoundToggle";
import { useGameStore } from "../state/gameStore";
import "./GameKit.css";

/*
  Shared pieces for the Game Room's games (Ludo, Match, War): the header,
  settings sheet, tap-to-pick setting rows, friend avatars and the win card.
  Each game keeps its own rules, store and table layout.
*/

export function GameHud({ title, accent, onMenu }: { title: string; accent: string; onMenu: () => void }) {
  const goToScene = useGameStore((s) => s.goToScene);
  return (
    <header className="game-hud">
      <BigButton size="md" variant="ghost" icon="⬅️" onClick={() => goToScene("gameroom")}>
        Games
      </BigButton>
      <h1 className="game-hud__title">
        {title} <span>{accent}</span>
      </h1>
      <div className="game-hud__right">
        <SoundToggle />
        <button className="game-hud__gear" onClick={onMenu} aria-label="Game menu">
          ⚙️
        </button>
      </div>
    </header>
  );
}

export function GameSheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="game-sheet-layer" onClick={onClose}>
      <div className="game-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <h2 className="game-sheet__title">{title}</h2>
        {children}
        <button className="game-sheet__close" onClick={onClose} aria-label="Close menu">
          ✕
        </button>
      </div>
    </div>
  );
}

/** A row of big tap-to-pick choices (radio group) for one game setting. */
export function GameChoice<T extends string | number>({
  label,
  help,
  options,
  value,
  onPick,
}: {
  label: string;
  help: string;
  options: { id: T; label: string; icon?: string }[];
  value: T;
  onPick: (id: T) => void;
}) {
  return (
    <div className="game-choice">
      <div className="game-choice__head">
        <span className="game-choice__label">{label}</span>
        <span className="game-choice__help">{help}</span>
      </div>
      <div className="game-choice__options" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={value === o.id}
            className={`game-choice__option ${value === o.id ? "game-choice__option--on" : ""}`}
            onClick={() => onPick(o.id)}
          >
            {o.icon && <span aria-hidden="true">{o.icon} </span>}
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** "New game" with an in-page yes/no, since a stray tap shouldn't wipe a game. */
export function NewGameRow({
  confirming,
  setConfirming,
  onConfirm,
  question = "Start over with a fresh deal?",
}: {
  confirming: boolean;
  setConfirming: (v: boolean) => void;
  onConfirm: () => void;
  question?: string;
}) {
  if (confirming) {
    return (
      <div className="game-sheet__confirm">
        <p>{question}</p>
        <div className="game-sheet__row">
          <BigButton size="md" onClick={onConfirm}>
            Yes, new game
          </BigButton>
          <BigButton size="md" variant="ghost" onClick={() => setConfirming(false)}>
            Keep playing
          </BigButton>
        </div>
      </div>
    );
  }
  return (
    <div className="game-sheet__row">
      <BigButton size="md" variant="secondary" icon="🔄" onClick={() => setConfirming(true)}>
        New game
      </BigButton>
    </div>
  );
}

export function FriendFigure({ id, pose = "idle" }: { id: string; pose?: FigurePose }) {
  const friend = FRIENDS_BY_ID[id] ?? FRIENDS[0];
  return (
    <GymnastFigure
      uid={`game-${friend.id}`}
      hairColor={friend.hairColor}
      hairHighlightColor={friend.hairHighlightColor}
      skinTone={friend.skinTone}
      leotard={friend.outfitPattern}
      eyeColor={friend.eyeColor}
      kneeBrace={friend.kneeBrace}
      crutches={friend.crutches}
      isBoy={friend.isBoy}
      scale={friend.sizeScale}
      pose={pose}
    />
  );
}

/** End-of-game card. Penelope celebrates her wins; the friend takes a bow for theirs. */
export function GameWin({
  kidWon,
  title,
  subtitle,
  opponentId,
  onPlayAgain,
}: {
  kidWon: boolean | null;
  title: string;
  subtitle: string;
  opponentId: string;
  onPlayAgain: () => void;
}) {
  const goToScene = useGameStore((s) => s.goToScene);
  return (
    <div className={`game-win ${kidWon ? "game-win--kid" : ""}`}>
      <div className="game-win__card">
        <div className="game-win__figure">
          {kidWon === false ? <FriendFigure id={opponentId} pose="bow" /> : <Penelope pose="celebrate" />}
        </div>
        <div className="game-win__medal" aria-hidden="true">
          {kidWon === false ? "🥈" : "🥇"}
        </div>
        <h2 className="game-win__title">{title}</h2>
        <p className="game-win__sub">{subtitle}</p>
        <div className="game-sheet__row">
          <BigButton size="lg" icon="🃏" onClick={onPlayAgain}>
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
