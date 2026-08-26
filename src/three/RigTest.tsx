import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { PenelopeRig } from "./character/PenelopeRig";
import { useCharacterRig } from "./character/useCharacterRig";
import { applyPose, REST_RESOLVED } from "./animation/poseUtils";

function AimCamera() {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, 0.9, 0);
  }, [camera]);
  return null;
}

function RigStanding() {
  const rig = useCharacterRig();
  useEffect(() => {
    applyPose(rig, REST_RESOLVED);
  }, [rig]);
  return (
    <PenelopeRig rig={rig} leotard={{ kind: "solid", color: "#ff5fae" }} hairColor="#9c6b3e" skinTone="#f4c9a0" />
  );
}

export function RigTest() {
  return (
    <Canvas camera={{ position: [0, 1.1, 2.4], fov: 40 }} shadows>
      <color attach="background" args={["#f3e6ff"]} />
      <AimCamera />
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 3, 2]} intensity={1.4} castShadow />
      <RigStanding />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#ffd9ec" />
      </mesh>
    </Canvas>
  );
}
