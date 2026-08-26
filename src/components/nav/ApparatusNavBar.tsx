import { APPARATUS } from "../../data/apparatus";
import type { ApparatusId } from "../../data/types";
import "./ApparatusNavBar.css";

interface ApparatusNavBarProps {
  onSelect: (id: ApparatusId, worldPosition: number) => void;
  activeId?: ApparatusId;
}

/** Always-visible, large picture-based nav — guarantees every apparatus is
 * reachable even if a child can't precisely tap it in the world (spec §7). */
export function ApparatusNavBar({ onSelect, activeId }: ApparatusNavBarProps) {
  return (
    <nav className="apparatus-nav" aria-label="Go to apparatus">
      {APPARATUS.map((a) => (
        <button
          key={a.id}
          className={`apparatus-nav__item ${activeId === a.id ? "apparatus-nav__item--active" : ""}`}
          style={{ background: `linear-gradient(160deg, ${a.colorFrom}, ${a.colorTo})` }}
          onClick={() => onSelect(a.id, a.worldPosition)}
        >
          <span className="apparatus-nav__icon">{a.icon}</span>
          <span className="apparatus-nav__label">{a.shortName}</span>
        </button>
      ))}
    </nav>
  );
}
