import type { LeotardDef } from "../data/types";
import { GymnastFigure } from "../characters/GymnastFigure";
import { requirementLabel } from "../state/unlocks";
import "./LeotardCard.css";

const PENELOPE_HAIR = "#9c6b3e";
const PENELOPE_SKIN = "#f4c9a0";

interface LeotardCardProps {
  leotard: LeotardDef;
  unlocked: boolean;
  equipped: boolean;
  onSelect: () => void;
}

export function LeotardCard({ leotard, unlocked, equipped, onSelect }: LeotardCardProps) {
  return (
    <button
      className={`leotard-card ${equipped ? "leotard-card--equipped" : ""} ${
        unlocked ? "" : "leotard-card--locked"
      }`}
      onClick={onSelect}
      disabled={!unlocked}
    >
      <div className="leotard-card__figure">
        <GymnastFigure
          uid={leotard.id}
          hairColor={PENELOPE_HAIR}
          skinTone={PENELOPE_SKIN}
          leotard={leotard.pattern}
          pose="idle"
        />
      </div>
      <span className="leotard-card__name">{leotard.name}</span>
      {!unlocked && <span className="leotard-card__lock">🔒 {requirementLabel(leotard.unlock)}</span>}
      {equipped && <span className="leotard-card__badge">Wearing!</span>}
    </button>
  );
}
