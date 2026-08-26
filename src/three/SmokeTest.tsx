import { Canvas } from "@react-three/fiber";

export function SmokeTest() {
  return (
    <Canvas camera={{ position: [0, 1, 4] }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 2]} intensity={1.2} />
      <mesh rotation={[0.4, 0.4, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff5fae" />
      </mesh>
    </Canvas>
  );
}
