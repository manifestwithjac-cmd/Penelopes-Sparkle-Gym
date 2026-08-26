import { useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import * as THREE from "three";

// TEMPORARY evaluation harness for candidate rigged base-character assets —
// NOT part of the shipped game. Gated behind ?candidate-preview. Loads
// public/candidate-preview/<file> and frames it so we can actually see the
// asset's real quality instead of guessing from marketplace text.
function Loader({
  file,
  angleDeg,
  zoom,
  pose,
}: {
  file: string;
  angleDeg: number;
  zoom: string | null;
  pose: string | null;
}) {
  const { scene, camera } = useThree();
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    const frame = (object: THREE.Object3D) => {
      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      object.position.sub(center);
      scene.add(object);

      if (pose === "cartwheel-mid") {
        // Rough sanity pose test — NOT the real retargeted animation, just
        // proof the skeleton deforms this mesh sensibly: raise both arms
        // overhead, spread legs, tip the spine, so we can see whether skin
        // weights hold up under a big pose instead of tearing/collapsing.
        const bone = (n: string) => object.getObjectByName(n);
        bone("L_Upperarm")?.rotation.set(0, 0, -2.6);
        bone("R_Upperarm")?.rotation.set(0, 0, 2.6);
        bone("L_Thigh")?.rotation.set(0, 0, 0.9);
        bone("R_Thigh")?.rotation.set(0, 0, -0.9);
        bone("Spine01")?.rotation.set(1.1, 0, 0);
        bone("Spine02")?.rotation.set(0.6, 0, 0);
        bone("Head")?.rotation.set(-0.8, 0, 0);
      }

      const rad = (angleDeg * Math.PI) / 180;
      const isFace = zoom === "face";
      const dist = (isFace ? size.y * 0.5 : Math.max(size.x, size.y, size.z)) * 1.6;
      const heightTarget = isFace ? size.y * 0.42 : size.y * 0.15;
      camera.position.set(Math.sin(rad) * dist, heightTarget, Math.cos(rad) * dist);
      camera.lookAt(0, heightTarget, 0);
    };

    if (file.endsWith(".obj")) {
      const dir = file.slice(0, file.lastIndexOf("/") + 1);
      const objName = file.slice(file.lastIndexOf("/") + 1);
      const mtlName = objName.replace(/\.obj$/, ".mtl");
      new MTLLoader().setPath(`/candidate-preview/${dir}`).load(mtlName, (materials) => {
        materials.preload();
        new OBJLoader()
          .setMaterials(materials)
          .setPath(`/candidate-preview/${dir}`)
          .load(objName, frame);
      });
    } else {
      new GLTFLoader().load(`/candidate-preview/${file}`, (gltf) => frame(gltf.scene));
    }
  }, [file, angleDeg, zoom, pose, scene, camera]);

  return null;
}

export function CandidatePreview() {
  const params = new URLSearchParams(window.location.search);
  const file = params.get("file") ?? "rpm-half-body.glb";
  const angleDeg = Number(params.get("angle") ?? "0");
  const zoom = params.get("zoom");
  const pose = params.get("pose");
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Canvas shadows camera={{ position: [0, 0.3, 1.2], fov: 35 }}>
        <color attach="background" args={["#e8e0f5"]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 3, 2]} intensity={1.4} castShadow />
        <hemisphereLight args={["#fff", "#ccc", 0.4]} />
        <Loader file={file} angleDeg={angleDeg} zoom={zoom} pose={pose} />
      </Canvas>
    </div>
  );
}

export default CandidatePreview;
