import { Canvas } from "@react-three/fiber";
import { GymEnvironment } from "./scenes/GymEnvironment";
import { CameraRig } from "./camera/CameraRig";
import { useSceneBridge } from "./sceneBridge";

/**
 * The one persistent <Canvas> for the game's 3D backdrop — mounted
 * whenever the app is on the gym or the Floor apparatus (see App.tsx) so
 * the camera can smoothly travel between them instead of hard-cutting.
 * Penelope herself is a flat 2D cutout rendered as an HTML/SVG overlay on
 * top of this (see characters/gymnast2d/) rather than a 3D character in
 * this scene — everything else (HUD, trick picker, result panel, her own
 * figure) is HTML rendered on top, per the "3D scene as background + HTML
 * overlay" architecture direction.
 */
export function GymCanvas() {
  const cameraTarget = useSceneBridge((s) => s.cameraTarget);

  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      gl={{ antialias: true, powerPreference: "low-power" }}
      camera={{ position: [0, 2.05, 5.6], fov: 42 }}
      style={{ position: "fixed", inset: 0, zIndex: 0 }}
    >
      <color attach="background" args={["#f3e6ff"]} />
      <fog attach="fog" args={["#f3e6ff", 8, 16]} />
      <CameraRig state={cameraTarget} />
      <GymEnvironment />
    </Canvas>
  );
}

// Default export exists solely so App.tsx can React.lazy() this module —
// three.js + @react-three/fiber + drei are large, and code-splitting them
// out of the main bundle keeps the title screen's first paint fast on
// mobile (spec's explicit performance requirement) instead of blocking on
// a 3D engine nothing is shown yet.
export default GymCanvas;
