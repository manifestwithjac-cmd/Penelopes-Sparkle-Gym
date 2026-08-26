import { useEffect } from "react";
import { useGameStore } from "./state/gameStore";
import { TitleScreen } from "./scenes/TitleScreen";
import { GymScene } from "./scenes/GymScene";
import { ApparatusScene } from "./scenes/ApparatusScene";
import { ShopScene } from "./scenes/ShopScene";
import { SnackBarScene } from "./scenes/SnackBarScene";
import { LoungeScene } from "./scenes/LoungeScene";
import { TrophyScene } from "./scenes/TrophyScene";
import { CelebrationToast } from "./effects/CelebrationToast";
import { unlock as unlockAudio, startMusic, stopMusic } from "./audio/audioEngine";
import type { ApparatusId } from "./data/types";

// Scenes calm enough for the soft background loop; minigames stay quiet
// so it never competes with trick SFX/cheers.
const MUSIC_SCENES = new Set(["gym", "shop", "snackbar", "lounge", "trophies"]);

function App() {
  const scene = useGameStore((s) => s.scene);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const soundOn = useGameStore((s) => s.soundOn);

  useEffect(() => {
    document.documentElement.setAttribute("data-reduced-motion", String(reducedMotion));
  }, [reducedMotion]);

  useEffect(() => {
    // Browsers block audio until a real user gesture — unlock on the
    // first tap anywhere, then never again (covers both the title
    // screen's PLAY button and returning players who skip straight to
    // the gym).
    const handler = () => unlockAudio();
    document.addEventListener("pointerdown", handler, { once: true });
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  useEffect(() => {
    if (soundOn && MUSIC_SCENES.has(scene)) {
      startMusic();
    } else {
      stopMusic();
    }
    return () => stopMusic();
  }, [scene, soundOn]);

  return (
    <div className="app-root">
      {scene === "title" && <TitleScreen />}
      {scene === "gym" && <GymScene />}
      {scene.startsWith("apparatus:") && (
        <ApparatusScene apparatusId={scene.slice("apparatus:".length) as ApparatusId} />
      )}
      {scene === "shop" && <ShopScene />}
      {scene === "snackbar" && <SnackBarScene />}
      {scene === "lounge" && <LoungeScene />}
      {scene === "trophies" && <TrophyScene />}
      <CelebrationToast />
    </div>
  );
}

export default App;
