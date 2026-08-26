import { useEffect } from "react";
import { useGameStore } from "./state/gameStore";
import { TitleScreen } from "./scenes/TitleScreen";
import { GymScene } from "./scenes/GymScene";
import { ApparatusScene } from "./scenes/ApparatusScene";
import { CelebrationToast } from "./effects/CelebrationToast";
import type { ApparatusId } from "./data/types";

function App() {
  const scene = useGameStore((s) => s.scene);
  const reducedMotion = useGameStore((s) => s.reducedMotion);

  useEffect(() => {
    document.documentElement.setAttribute("data-reduced-motion", String(reducedMotion));
  }, [reducedMotion]);

  return (
    <div className="app-root">
      {scene === "title" && <TitleScreen />}
      {scene === "gym" && <GymScene />}
      {scene.startsWith("apparatus:") && (
        <ApparatusScene apparatusId={scene.slice("apparatus:".length) as ApparatusId} />
      )}
      <CelebrationToast />
    </div>
  );
}

export default App;
