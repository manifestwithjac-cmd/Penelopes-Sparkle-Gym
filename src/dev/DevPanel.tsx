import { useGameStore } from "../state/gameStore";
import { BigButton } from "../components/ui/BigButton";
import "./DevPanel.css";

/** Developer-only shortcuts (spec §36) — reached only via the hidden
 * 5-tap gesture on the settings version line, never visible in normal
 * play. Not persisted: devMode resets to off on every reload. */
export function DevPanel() {
  const devAddStars = useGameStore((s) => s.devAddStars);
  const devUnlockEverything = useGameStore((s) => s.devUnlockEverything);
  const resetProgress = useGameStore((s) => s.resetProgress);
  const goToScene = useGameStore((s) => s.goToScene);

  return (
    <div className="dev-panel">
      <p className="dev-panel__label">🛠️ Developer Mode</p>
      <div className="dev-panel__grid">
        <BigButton size="md" variant="secondary" onClick={() => devAddStars(10)}>
          +10 Stars
        </BigButton>
        <BigButton size="md" variant="secondary" onClick={() => devAddStars(100)}>
          +100 Stars
        </BigButton>
        <BigButton size="md" variant="secondary" onClick={devUnlockEverything}>
          Unlock Everything
        </BigButton>
        <BigButton size="md" variant="ghost" onClick={() => goToScene("apparatus:floor")}>
          Go: Floor
        </BigButton>
        <BigButton size="md" variant="ghost" onClick={() => goToScene("apparatus:beam")}>
          Go: Beam
        </BigButton>
        <BigButton size="md" variant="ghost" onClick={() => goToScene("apparatus:bars")}>
          Go: Bars
        </BigButton>
        <BigButton size="md" variant="ghost" onClick={() => goToScene("apparatus:trampoline")}>
          Go: Trampoline
        </BigButton>
        <BigButton size="md" variant="ghost" onClick={() => goToScene("apparatus:vault")}>
          Go: Vault
        </BigButton>
        <BigButton size="md" variant="gold" onClick={resetProgress}>
          Reset Save (instant)
        </BigButton>
      </div>
    </div>
  );
}
