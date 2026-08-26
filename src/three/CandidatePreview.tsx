import { useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

// TEMPORARY evaluation harness for candidate rigged base-character assets —
// NOT part of the shipped game. Gated behind ?candidate-preview. Loads
// public/candidate-preview/<file> and frames it so we can actually see the
// asset's real quality instead of guessing from marketplace text.
function Loader({ file }: { file: string }) {
  const { scene, camera } = useThree();
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    new GLTFLoader().load(`/candidate-preview/${file}`, (gltf) => {
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      gltf.scene.position.sub(center);
      scene.add(gltf.scene);
      const dist = Math.max(size.x, size.y, size.z) * 1.6;
      camera.position.set(0, size.y * 0.15, dist);
      camera.lookAt(0, size.y * 0.15, 0);
    });
  }, [file, scene, camera]);

  return null;
}

export function CandidatePreview() {
  const params = new URLSearchParams(window.location.search);
  const file = params.get("file") ?? "rpm-half-body.glb";
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Canvas shadows camera={{ position: [0, 0.3, 1.2], fov: 35 }}>
        <color attach="background" args={["#e8e0f5"]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 3, 2]} intensity={1.4} castShadow />
        <hemisphereLight args={["#fff", "#ccc", 0.4]} />
        <Loader file={file} />
      </Canvas>
    </div>
  );
}

export default CandidatePreview;
