import { useState } from "react";
import { useGameStore } from "../state/gameStore";
import type { ApparatusId } from "../data/types";
import { Penelope } from "../characters/Penelope";
import { StarCounter, PointCounter } from "../components/ui/Counters";
import { SoundToggle } from "../components/ui/SoundToggle";
import { ApparatusNavBar } from "../components/nav/ApparatusNavBar";
import { WorldMenu } from "../components/nav/WorldMenu";
import { SettingsPanel } from "../components/settings/SettingsPanel";
import "./GymScene.css";

/**
 * The gym has a real 3D backdrop (see three/GymCanvas.tsx, mounted once
 * in App.tsx so the camera persists smoothly between here and Floor) —
 * this component is the HTML overlay on top of it: HUD, the big apparatus
 * nav buttons, a standing flat-cutout Penelope, and a menu for the
 * destinations that don't have a 3D home yet.
 */
export function GymScene() {
  const goToScene = useGameStore((s) => s.goToScene);
  const [showWorldMenu, setShowWorldMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  function goToApparatus(id: ApparatusId) {
    goToScene(`apparatus:${id}`);
  }

  return (
    <div className="gym-scene">
      <div className="gym-scene__penelope">
        <Penelope pose="idle" />
      </div>

      <header className="gym-scene__hud">
        <div className="gym-scene__hud-left">
          <StarCounter />
          <PointCounter />
        </div>
        <div className="gym-scene__hud-right">
          <button
            className="gym-scene__settings-btn"
            onClick={() => setShowWorldMenu(true)}
            aria-label="Around the gym"
          >
            🗺️
          </button>
          <SoundToggle />
          <button
            className="gym-scene__settings-btn"
            onClick={() => setShowSettings(true)}
            aria-label="Settings"
          >
            ⚙️
          </button>
        </div>
      </header>

      <div className="gym-scene__spacer" />

      <ApparatusNavBar onSelect={goToApparatus} />

      {showWorldMenu && <WorldMenu onClose={() => setShowWorldMenu(false)} />}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}
