import type { ApparatusId } from "../../data/types";
import { tricksForApparatus } from "../../data/tricks";
import { useGameStore } from "../../state/gameStore";
import { meetsRequirement, requirementLabel } from "../../state/unlocks";
import "./TrickPicker.css";

interface TrickPickerProps {
  apparatusId: ApparatusId;
  selectedTrickId: string;
  onSelect: (trickId: string) => void;
}

/** Horizontal strip of tricks for one apparatus — unlocked ones are
 * selectable, locked ones show what's needed (spec §21's "communicate
 * requirements visually", reused here for tricks too). */
export function TrickPicker({ apparatusId, selectedTrickId, onSelect }: TrickPickerProps) {
  const stars = useGameStore((s) => s.stars);
  const trickStats = useGameStore((s) => s.trickStats);
  const unlockedAchievementIds = useGameStore((s) => s.unlockedAchievementIds);
  const ctx = { stars, trickStats, unlockedAchievementIds };

  const tricks = tricksForApparatus(apparatusId);

  return (
    <div className="trick-picker touch-scroll" role="tablist" aria-label="Choose a trick">
      {tricks.map((trick) => {
        const unlocked = meetsRequirement(trick.unlock, ctx);
        const selected = trick.id === selectedTrickId;
        return (
          <button
            key={trick.id}
            className={`trick-picker__item ${selected ? "trick-picker__item--selected" : ""} ${
              trick.special ? "trick-picker__item--special" : ""
            }`}
            disabled={!unlocked}
            onClick={() => unlocked && onSelect(trick.id)}
            role="tab"
            aria-selected={selected}
          >
            <span className="trick-picker__icon">{unlocked ? trick.icon : "🔒"}</span>
            <span className="trick-picker__name">{trick.name}</span>
            {!unlocked && <span className="trick-picker__req">{requirementLabel(trick.unlock)}</span>}
          </button>
        );
      })}
    </div>
  );
}
