import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { PenelopeRig } from "./character/PenelopeRig";
import { useCharacterRig } from "./character/useCharacterRig";
import { applyPose, resolvePose, samplePoseAt, linear } from "./animation/poseUtils";
import { TRICKS } from "./animation/tricks";
import { CARTWHEEL } from "./animation/tricks/cartwheel";

function AimCamera() {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, 0.75, 0);
  }, [camera]);
  return null;
}

const FRAME_TEST_TRICKS: Record<string, typeof CARTWHEEL> = {
  cartwheel: CARTWHEEL,
  oneHandedCartwheel: TRICKS.one_handed_cartwheel,
};

function FrameHold({ t, trickId }: { t: number; trickId: string }) {
  const rig = useCharacterRig();
  useEffect(() => {
    const trick = FRAME_TEST_TRICKS[trickId] ?? CARTWHEEL;
    const resolved = trick.keyframes
      .slice()
      .sort((a, b) => a.t - b.t)
      .map((k) => ({ t: k.t, pose: resolvePose(k.pose), ease: k.ease ?? linear }));
    applyPose(rig, samplePoseAt(resolved, t));
  }, [rig, t, trickId]);
  return (
    <PenelopeRig rig={rig} leotard={{ kind: "solid", color: "#ff5fae" }} hairColor="#9c6b3e" skinTone="#f4c9a0" />
  );
}

export function AnimFrameTest() {
  const params = new URLSearchParams(window.location.search);
  const t = Number(params.get("t") ?? "0");
  const trickId = params.get("trick") ?? "cartwheel";

  return (
    <Canvas camera={{ position: [0, 1.05, 3.2], fov: 45 }} shadows>
      <color attach="background" args={["#f3e6ff"]} />
      <AimCamera />
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 3, 2]} intensity={1.4} castShadow />
      <FrameHold t={t} trickId={trickId} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#ffd9ec" />
      </mesh>
      {/* center + travel-range reference markers */}
      <mesh position={[-0.36, 0.01, 0]}>
        <boxGeometry args={[0.02, 0.02, 0.4]} />
        <meshStandardMaterial color="#8438e0" />
      </mesh>
      <mesh position={[0.34, 0.01, 0]}>
        <boxGeometry args={[0.02, 0.02, 0.4]} />
        <meshStandardMaterial color="#3fd8a0" />
      </mesh>
    </Canvas>
  );
}
