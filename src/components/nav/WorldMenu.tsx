import { useGameStore, type SceneId } from "../../state/gameStore";
import { BigButton } from "../ui/BigButton";
import "./WorldMenu.css";

const DESTINATIONS: { id: SceneId; label: string; icon: string }[] = [
  { id: "shop", label: "Leotard Shop", icon: "👗" },
  { id: "lounge", label: "Friends Lounge", icon: "🛋️" },
  { id: "snackbar", label: "Snack Bar", icon: "🧡" },
  { id: "trophies", label: "Trophy Wall", icon: "🏆" },
];

/**
 * Places that don't have a 3D home yet (spec's vertical slice covers
 * Floor only). Replaces the old flat-card world map's zone buttons for
 * these destinations — same one-tap reach, just a compact list instead
 * of cards scattered across a 2D track that no longer exists.
 */
export function WorldMenu({ onClose }: { onClose: () => void }) {
  const goToScene = useGameStore((s) => s.goToScene);

  return (
    <div className="world-menu-layer" onClick={onClose}>
      <div className="world-menu" onClick={(e) => e.stopPropagation()}>
        <button className="world-menu__close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h2 className="world-menu__title">Around the Gym</h2>
        <div className="world-menu__grid">
          {DESTINATIONS.map((d) => (
            <BigButton
              key={d.id}
              size="lg"
              variant="ghost"
              icon={d.icon}
              onClick={() => {
                goToScene(d.id);
                onClose();
              }}
            >
              {d.label}
            </BigButton>
          ))}
        </div>
      </div>
    </div>
  );
}
