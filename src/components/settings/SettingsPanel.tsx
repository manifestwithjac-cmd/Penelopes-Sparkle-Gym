import { useState } from "react";
import { useGameStore } from "../../state/gameStore";
import { BigButton } from "../ui/BigButton";
import { DevPanel } from "../../dev/DevPanel";
import "./SettingsPanel.css";

const DEV_UNLOCK_TAPS = 5;

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const setReducedMotion = useGameStore((s) => s.setReducedMotion);
  const resetProgress = useGameStore((s) => s.resetProgress);
  const devMode = useGameStore((s) => s.devMode);
  const toggleDevMode = useGameStore((s) => s.toggleDevMode);

  const [confirmingReset, setConfirmingReset] = useState(false);
  const [versionTaps, setVersionTaps] = useState(0);

  function handleVersionTap() {
    const next = versionTaps + 1;
    setVersionTaps(next);
    if (next >= DEV_UNLOCK_TAPS) {
      toggleDevMode();
      setVersionTaps(0);
    }
  }

  function handleResetConfirmed() {
    resetProgress();
    setConfirmingReset(false);
    onClose();
  }

  return (
    <div className="settings-layer" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <button className="settings-panel__close" onClick={onClose} aria-label="Close settings">
          ✕
        </button>

        <h2 className="settings-panel__title">⚙️ Settings</h2>

        <div className="settings-panel__row">
          <span>Reduce Motion</span>
          <BigButton
            size="md"
            variant={reducedMotion ? "primary" : "ghost"}
            onClick={() => setReducedMotion(!reducedMotion)}
            aria-pressed={reducedMotion}
          >
            {reducedMotion ? "On" : "Off"}
          </BigButton>
        </div>

        {!confirmingReset ? (
          <BigButton size="md" variant="ghost" onClick={() => setConfirmingReset(true)}>
            Reset Progress
          </BigButton>
        ) : (
          <div className="settings-panel__confirm">
            <p>Are you sure? This erases all stars, tricks, and leotards.</p>
            <div className="settings-panel__confirm-buttons">
              <BigButton size="md" variant="ghost" onClick={() => setConfirmingReset(false)}>
                Cancel
              </BigButton>
              <BigButton size="md" variant="primary" onClick={handleResetConfirmed}>
                Yes, Reset
              </BigButton>
            </div>
          </div>
        )}

        <p className="settings-panel__version" onClick={handleVersionTap}>
          Penelope's Sparkle Gym · v1.0
        </p>

        {devMode && <DevPanel />}
      </div>
    </div>
  );
}
