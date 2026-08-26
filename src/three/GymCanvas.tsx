import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PenelopeRig } from "./character/PenelopeRig";
import { GltfPenelopeRig } from "./character/GltfPenelopeRig";
import { CANDIDATE_A_BONE_MAP } from "./character/gltfBoneMap";
import { CANDIDATE_C_GLB_BONE_MAP } from "./character/mixamoGlbBoneMap";
import { useCharacterRig } from "./character/useCharacterRig";
import { usePlayTrick } from "./animation/usePlayTrick";
import { GymEnvironment } from "./scenes/GymEnvironment";
import { CameraRig } from "./camera/CameraRig";
import { StarBurst3D } from "./effects/StarBurst3D";
import { useSceneBridge } from "./sceneBridge";
import { useGameStore } from "../state/gameStore";
import { LEOTARDS_BY_ID } from "../data/leotards";
import { TRICKS } from "./animation/tricks";

const PENELOPE_HAIR = "#9c6b3e";
const PENELOPE_SKIN = "#f4c9a0";
const CARTWHEEL_END_POSITION: [number, number, number] = [0.34, 1.1, 0.4];

// Validation-only escape hatch (?candidate-rig=a) for evaluating a rigged
// GLB character candidate inside the real game — camera, gym, trick
// system untouched. Procedural PenelopeRig stays the default; nothing
// here changes what a normal player sees. See gltfBoneMap.ts.
const CANDIDATE_RIG =
  typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("candidate-rig") : null;

function PenelopeSceneActor() {
  const rig = useCharacterRig();
  const { play } = usePlayTrick(rig);
  const trickRequest = useSceneBridge((s) => s.trickRequest);
  const markTrickComplete = useSceneBridge((s) => s.markTrickComplete);
  const [burstKey, setBurstKey] = useState(0);
  const handledNonce = useRef(0);

  const equippedLeotardId = useGameStore((s) => s.equippedLeotardId);
  const leotard = LEOTARDS_BY_ID[equippedLeotardId]?.pattern ?? { kind: "solid" as const, color: "#ff5fae" };

  useEffect(() => {
    if (!trickRequest || trickRequest.nonce === handledNonce.current) return;
    handledNonce.current = trickRequest.nonce;
    const anim = TRICKS[trickRequest.trickId];
    if (!anim) {
      // No 3D animation registered for this trick yet — resolve
      // immediately so the caller's HTML flow isn't left hanging.
      markTrickComplete(trickRequest.nonce);
      return;
    }
    play(anim, () => {
      setBurstKey((k) => k + 1);
      markTrickComplete(trickRequest.nonce);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trickRequest]);

  return (
    <>
      {CANDIDATE_RIG === "a" ? (
        <GltfPenelopeRig
          rig={rig}
          url="/candidate-preview/candidate-a.glb"
          boneMap={CANDIDATE_A_BONE_MAP}
          facingYaw={Math.PI}
        />
      ) : CANDIDATE_RIG === "c" ? (
        <GltfPenelopeRig
          rig={rig}
          url="/candidate-preview/c-clean/StylizedGirl-clean.glb"
          boneMap={CANDIDATE_C_GLB_BONE_MAP}
          hipBoneName="mixamorigHips"
          // Set only by a self-contained single-page preview build (see
          // GltfPenelopeRig.tsx) that embeds the GLB bytes directly rather
          // than serving this file over HTTP — never set in the real game.
          arrayBuffer={(window as unknown as { __CANDIDATE_C_ARRAY_BUFFER?: ArrayBuffer }).__CANDIDATE_C_ARRAY_BUFFER}
        />
      ) : (
        <PenelopeRig rig={rig} leotard={leotard} hairColor={PENELOPE_HAIR} skinTone={PENELOPE_SKIN} />
      )}
      <StarBurst3D triggerKey={burstKey} position={CARTWHEEL_END_POSITION} />
    </>
  );
}

/**
 * The one persistent <Canvas> for the game's 3D layer — mounted whenever
 * the app is on the gym or the Floor apparatus (see App.tsx) so the
 * camera can smoothly travel between them instead of hard-cutting.
 * Everything else (HUD, trick picker, result panel) is HTML rendered on
 * top of this, per spec's "3D scene as background + HTML overlay"
 * architecture direction.
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
      <PenelopeSceneActor />
    </Canvas>
  );
}

// Default export exists solely so App.tsx can React.lazy() this module —
// three.js + @react-three/fiber + drei are large, and code-splitting them
// out of the main bundle keeps the title screen's first paint fast on
// mobile (spec's explicit performance requirement) instead of blocking on
// a 3D engine nothing is shown yet.
export default GymCanvas;
