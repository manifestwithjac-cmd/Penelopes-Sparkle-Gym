import { useEffect, Suspense, lazy } from "react";
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
import { useSceneBridge } from "./three/sceneBridge";
import type { ApparatusId } from "./data/types";

// three.js + @react-three/fiber + drei are large — code-split them out of
// the main bundle (see GymCanvas.tsx's default export) so the title
// screen's first paint doesn't wait on a 3D engine nothing shows yet.
const GymCanvas = lazy(() => import("./three/GymCanvas"));
const SmokeTest = lazy(() => import("./three/SmokeTest").then((m) => ({ default: m.SmokeTest })));
const RigTest = lazy(() => import("./three/RigTest").then((m) => ({ default: m.RigTest })));
const AnimFrameTest = lazy(() =>
  import("./three/AnimFrameTest").then((m) => ({ default: m.AnimFrameTest })),
);

// Scenes calm enough for the soft background loop; minigames stay quiet
// so it never competes with trick SFX/cheers.
const MUSIC_SCENES = new Set(["gym", "shop", "snackbar", "lounge", "trophies"]);

// The 3D layer is mounted once and persists across these two scenes so
// the camera can travel between them instead of hard-cutting (spec's
// cinematic camera requirement). Other scenes don't have 3D content yet,
// so the canvas unmounts there to save battery/GPU.
const SHOW_3D_SCENES = new Set(["gym", "apparatus:floor"]);

function App() {
  const scene = useGameStore((s) => s.scene);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const soundOn = useGameStore((s) => s.soundOn);
  const setCameraTarget = useSceneBridge((s) => s.setCameraTarget);

  useEffect(() => {
    if (scene === "apparatus:floor") setCameraTarget("floor-focus");
    else if (scene === "gym") setCameraTarget("gym-overview");
  }, [scene, setCameraTarget]);

  useEffect(() => {
    // Warm the 3D chunk in the background as soon as the app is idle —
    // by the time a first-time player taps PLAY (or a returning player's
    // save drops them straight in the gym), it's usually already cached.
    const idle = ("requestIdleCallback" in window ? window.requestIdleCallback : setTimeout) as (
      cb: () => void,
    ) => number;
    idle(() => {
      import("./three/GymCanvas");
    });
  }, []);

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

  if (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("r3f-smoke")) {
    return (
      <div className="app-root">
        <Suspense fallback={null}>
          <SmokeTest />
        </Suspense>
      </div>
    );
  }
  if (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("rig-test")) {
    return (
      <div className="app-root">
        <Suspense fallback={null}>
          <RigTest />
        </Suspense>
      </div>
    );
  }
  if (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("anim-frame")) {
    return (
      <div className="app-root">
        <Suspense fallback={null}>
          <AnimFrameTest />
        </Suspense>
      </div>
    );
  }
  return (
    <div className="app-root">
      {SHOW_3D_SCENES.has(scene) && (
        <Suspense fallback={null}>
          <GymCanvas />
        </Suspense>
      )}
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
