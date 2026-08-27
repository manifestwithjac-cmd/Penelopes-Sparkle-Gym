import { useState } from "react";
import { useGameStore } from "../state/gameStore";
import type { ApparatusId } from "../data/types";
import { Penelope } from "../characters/Penelope";
import { GymnastFigure } from "../characters/GymnastFigure";
import { FRIENDS_BY_ID } from "../data/friends";
import { FriendPopup } from "../friends/FriendPopup";
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
 * nav buttons, a standing flat-cutout Penelope, her companion friend (see
 * FriendPopup.tsx's "Bring to Gym" toggle) if she's picked one, and a menu
 * for the destinations that don't have a 3D home yet.
 */
export function GymScene() {
  const goToScene = useGameStore((s) => s.goToScene);
  const companionFriendId = useGameStore((s) => s.companionFriendId);
  const [showWorldMenu, setShowWorldMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCompanionPopup, setShowCompanionPopup] = useState(false);

  const companion = companionFriendId ? FRIENDS_BY_ID[companionFriendId] : undefined;

  function goToApparatus(id: ApparatusId) {
    goToScene(`apparatus:${id}`);
  }

  return (
    <div className="gym-scene">
      <div className="gym-scene__penelope">
        <Penelope pose="idle" />
      </div>

      {companion && (
        <button
          className="gym-scene__companion"
          onClick={() => setShowCompanionPopup(true)}
          aria-label={`Talk to ${companion.name}`}
        >
          <GymnastFigure
            uid={`gym-companion-${companion.id}`}
            hairColor={companion.hairColor}
            skinTone={companion.skinTone}
            leotard={companion.outfitPattern}
            pose="wave"
          />
        </button>
      )}

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
      {showCompanionPopup && companion && (
        <FriendPopup friend={companion} onClose={() => setShowCompanionPopup(false)} />
      )}
    </div>
  );
}
