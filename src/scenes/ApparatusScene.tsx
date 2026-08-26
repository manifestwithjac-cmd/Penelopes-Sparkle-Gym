import { APPARATUS_BY_ID } from "../data/apparatus";
import type { ApparatusId } from "../data/types";
import { useGameStore } from "../state/gameStore";
import { StarCounter, PointCounter } from "../components/ui/Counters";
import { SoundToggle } from "../components/ui/SoundToggle";
import { BigButton } from "../components/ui/BigButton";
import { FloorMinigame } from "../minigames/FloorMinigame";
import { BeamMinigame } from "../minigames/BeamMinigame";
import { BarsMinigame } from "../minigames/BarsMinigame";
import { TrampolineMinigame } from "../minigames/TrampolineMinigame";
import { VaultMinigame } from "../minigames/VaultMinigame";
import "./ApparatusScene.css";

const MINIGAMES: Record<ApparatusId, () => React.ReactElement> = {
  floor: FloorMinigame,
  beam: BeamMinigame,
  bars: BarsMinigame,
  trampoline: TrampolineMinigame,
  vault: VaultMinigame,
};

export function ApparatusScene({ apparatusId }: { apparatusId: ApparatusId }) {
  const apparatus = APPARATUS_BY_ID[apparatusId];
  const goToScene = useGameStore((s) => s.goToScene);
  const Minigame = MINIGAMES[apparatusId];

  return (
    <div
      className="apparatus-scene"
      style={{
        background: `linear-gradient(180deg, ${apparatus.colorFrom}33, ${apparatus.colorTo}55)`,
      }}
    >
      <header className="apparatus-scene__hud">
        <BigButton size="md" variant="ghost" icon="⬅️" onClick={() => goToScene("gym")}>
          Gym
        </BigButton>
        <div className="apparatus-scene__hud-right">
          <StarCounter />
          <PointCounter />
          <SoundToggle />
        </div>
      </header>

      <h2 className="apparatus-scene__title">
        {apparatus.icon} {apparatus.name}
      </h2>

      <div className="apparatus-scene__stage">
        <Minigame />
      </div>
    </div>
  );
}
