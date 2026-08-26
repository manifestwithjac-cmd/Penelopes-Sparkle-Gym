import { useState } from "react";
import { SNACKS } from "../data/snacks";
import { useGameStore } from "../state/gameStore";
import { Penelope } from "../characters/Penelope";
import { StarCounter, PointCounter } from "../components/ui/Counters";
import { SoundToggle } from "../components/ui/SoundToggle";
import { BigButton } from "../components/ui/BigButton";
import { CheetoIcon } from "./CheetoIcon";
import "./SnackBarScene.css";

export function SnackBarScene() {
  const goToScene = useGameStore((s) => s.goToScene);
  const [eatingId, setEatingId] = useState<string | null>(null);

  const active = eatingId ? SNACKS.find((s) => s.id === eatingId) : null;

  function handlePick(id: string) {
    setEatingId(id);
    window.setTimeout(() => setEatingId(null), 1800);
  }

  return (
    <div className="snackbar-scene">
      <header className="snackbar-scene__hud">
        <BigButton size="md" variant="ghost" icon="⬅️" onClick={() => goToScene("gym")}>
          Gym
        </BigButton>
        <div className="snackbar-scene__hud-right">
          <StarCounter />
          <PointCounter />
          <SoundToggle />
        </div>
      </header>

      <h2 className="snackbar-scene__title">🧡 Snack Bar</h2>

      <div className="snackbar-scene__stage">
        <div className="snackbar-scene__penelope">
          <Penelope pose={active ? "celebrate" : "idle"} />
          {active && <p className="snackbar-scene__bubble">{active.reaction}</p>}
        </div>
      </div>

      <div className="snackbar-scene__counter">
        {SNACKS.map((snack) => (
          <button
            key={snack.id}
            className={`snackbar-scene__snack ${snack.featured ? "snackbar-scene__snack--featured" : ""}`}
            onClick={() => handlePick(snack.id)}
          >
            {snack.id === "cheetos" ? (
              <CheetoIcon size={snack.featured ? 52 : 36} />
            ) : (
              <span className="snackbar-scene__glyph">{snack.icon}</span>
            )}
            <span className="snackbar-scene__name">{snack.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
