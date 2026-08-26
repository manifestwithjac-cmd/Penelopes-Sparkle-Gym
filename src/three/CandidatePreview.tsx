import { useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import * as THREE from "three";

// TEMPORARY evaluation harness for candidate rigged base-character assets —
// NOT part of the shipped game. Gated behind ?candidate-preview. Loads
// public/candidate-preview/<file> and frames it so we can actually see the
// asset's real quality instead of guessing from marketplace text.
// Debug-only: assigns a distinct, stable color per mesh name so a texture-
// less load (e.g. an FBX exported without embedded/side-by-side textures)
// is still readable — lets us judge sculpting/shading and verify "separate
// mesh parts" claims instead of staring at a silhouette.
function applyDebugColors(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    let hash = 0;
    for (const ch of child.name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
    const hue = Math.abs(hash) % 360;
    child.material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(`hsl(${hue}, 55%, 65%)`),
      roughness: 0.7,
    });
  });
}

function Loader({
  file,
  angleDeg,
  zoom,
  pose,
  debugColors,
}: {
  file: string;
  angleDeg: number;
  zoom: string | null;
  pose: string | null;
  debugColors: boolean;
}) {
  const { scene, camera } = useThree();
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    const frame = (object: THREE.Object3D) => {
      if (debugColors) applyDebugColors(object);
      if (new URLSearchParams(window.location.search).has("tri-count")) {
        let tris = 0;
        object.traverse((c) => {
          if (c instanceof THREE.Mesh) {
            const geo = c.geometry;
            tris += geo.index ? geo.index.count / 3 : (geo.attributes.position?.count ?? 0) / 3;
          }
        });
        // eslint-disable-next-line no-console
        console.log("TRI_COUNT", tris);
      }
      if (new URLSearchParams(window.location.search).has("mesh-stats")) {
        const stats: { name: string; verts: number; tris: number }[] = [];
        object.traverse((c) => {
          if (c instanceof THREE.Mesh) {
            const geo = c.geometry;
            const verts = geo.attributes.position?.count ?? 0;
            const tris = geo.index ? geo.index.count / 3 : verts / 3;
            stats.push({ name: c.name, verts, tris });
          }
        });
        // eslint-disable-next-line no-console
        console.log("MESH_STATS", JSON.stringify(stats));
      }
      if (new URLSearchParams(window.location.search).has("list-names")) {
        const names: string[] = [];
        object.traverse((c) => names.push(`${c.type}:${c.name}`));
        // eslint-disable-next-line no-console
        console.log("OBJECT_NAMES", JSON.stringify(names));
      }
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
      } else if (pose === "cartwheel-mid-mixamo") {
        // three's FBXLoader strips the ":" from "mixamorig:LeftArm" names.
        // Also: this rig has one skinned mesh per clothing/hair layer, and
        // each layer got its OWN duplicate bone hierarchy on import — pose
        // every same-named bone found, not just the first match, or the
        // clothes/hair won't follow the body.
        const poseAll = (n: string, rx: number, ry: number, rz: number) => {
          object.traverse((c) => {
            if (c.name === n) c.rotation.set(rx, ry, rz);
          });
        };
        poseAll("mixamorigLeftArm", 0, 0, -2.6);
        poseAll("mixamorigRightArm", 0, 0, 2.6);
        poseAll("mixamorigLeftUpLeg", 0, 0, 0.9);
        poseAll("mixamorigRightUpLeg", 0, 0, -0.9);
        poseAll("mixamorigSpine", 0.5, 0, 0);
        poseAll("mixamorigSpine1", 0.4, 0, 0);
        poseAll("mixamorigSpine2", 0.3, 0, 0);
        poseAll("mixamorigHead", -0.8, 0, 0);
      }

      const rad = (angleDeg * Math.PI) / 180;
      const isFace = zoom === "face";
      const dist = (isFace ? size.y * 0.5 : Math.max(size.x, size.y, size.z)) * 1.6;
      const heightTarget = isFace ? size.y * 0.42 : size.y * 0.15;
      camera.position.set(Math.sin(rad) * dist, heightTarget, Math.cos(rad) * dist);
      camera.lookAt(0, heightTarget, 0);
    };

    if (file.endsWith(".fbx")) {
      new FBXLoader().load(`/candidate-preview/${file}`, frame);
    } else if (file.endsWith(".obj")) {
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
  }, [file, angleDeg, zoom, pose, debugColors, scene, camera]);

  return null;
}

export function CandidatePreview() {
  const params = new URLSearchParams(window.location.search);
  const file = params.get("file") ?? "rpm-half-body.glb";
  const angleDeg = Number(params.get("angle") ?? "0");
  const zoom = params.get("zoom");
  const pose = params.get("pose");
  const debugColors = params.has("debug-colors");
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Canvas shadows camera={{ position: [0, 0.3, 1.2], fov: 35 }}>
        <color attach="background" args={["#e8e0f5"]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 3, 2]} intensity={1.4} castShadow />
        <hemisphereLight args={["#fff", "#ccc", 0.4]} />
        <Loader file={file} angleDeg={angleDeg} zoom={zoom} pose={pose} debugColors={debugColors} />
      </Canvas>
    </div>
  );
}

export default CandidatePreview;
