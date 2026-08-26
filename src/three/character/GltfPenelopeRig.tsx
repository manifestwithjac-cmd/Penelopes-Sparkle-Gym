import { useEffect, useRef, useState } from "react";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Box3, Group, Vector3, type Bone, type Object3D } from "three";
import type { RigRefs } from "./useCharacterRig";
import { createBoneProxy } from "./boneProxy";

// Rough total standing height of the procedural rig (HIP_HEIGHT_BASE plus
// torso+head above the hips) — the candidate is auto-scaled to match so
// she fits the gym environment/camera framing without hand-tuning a magic
// number per asset. Validation-only: exact proportions get revisited in
// the art-cleanup pass.
const TARGET_HEIGHT = 1.56;

// A candidate rig can fail invisibly — the loader errors, or a NaN sneaks
// into the scale/position math — leaving nothing on screen and nothing in
// a console the person testing on their phone can see. Surface it as a
// plain on-page banner instead of hoping someone has devtools attached.
// Only ever fires on the debug candidate-rig path (see GymCanvas.tsx) —
// invisible in normal play.
function showLoadError(context: string, err: unknown) {
  // eslint-disable-next-line no-console
  console.error(`[GltfPenelopeRig] ${context}:`, err);
  if (typeof document === "undefined") return;
  const banner = document.createElement("div");
  banner.style.cssText =
    "position:fixed;top:0;left:0;right:0;z-index:99999;background:#c0202080;" +
    "color:#fff;font:12px monospace;padding:8px;white-space:pre-wrap;max-height:40vh;overflow:auto;";
  banner.textContent = `${context}: ${err instanceof Error ? `${err.message}\n${err.stack ?? ""}` : String(err)}`;
  document.body.appendChild(banner);
}

interface GltfPenelopeRigProps {
  rig: RigRefs;
  url: string;
  boneMap: Partial<Record<keyof RigRefs, string>>;
  /** Yaw correction (radians) — the candidate's authored "forward" doesn't
   * necessarily match ours; baked into the loaded mesh (not the root
   * wrapper, which applyPose() overwrites every frame). */
  facingYaw?: number;
  /** applyPose() (poseUtils.ts) always forces root.position.y to
   * HIP_HEIGHT_BASE + py, exactly like the procedural rig where "root"
   * means "hip height above the floor" and the leg meshes are authored to
   * reach from there down to y=0. To get the same behavior out of a
   * foreign skeleton, we align the loaded mesh so its own hip bone sits
   * at local y=0 — then when root's y gets forced to HIP_HEIGHT_BASE, the
   * skeleton's own leg length (now scaled to roughly match ours) carries
   * the feet down toward the floor, same as the procedural rig. */
  hipBoneName?: string;
  /** Optional pre-fetched GLB bytes — when set, skips GLTFLoader's own
   * network fetch of `url` entirely and parses this buffer instead.
   * Exists for embedding a candidate directly in a self-contained preview
   * page (see the mobile-preview debugging in this project's history): a
   * sandboxed viewer refused to fetch() a blob: URL at all ("Load
   * failed"), even though the exact same bytes were already sitting in
   * memory from decoding a base64 payload — so the fix is to hand
   * GLTFLoader those bytes directly via .parse() and never ask it to
   * fetch anything. `url` is still required as GLTFLoader.parse()'s path
   * argument (used only to resolve any relative resource references). */
  arrayBuffer?: ArrayBuffer;
}

/**
 * Drop-in replacement for PenelopeRig.tsx that loads a rigged GLB instead
 * of drawing procedural primitives. Maps our joint names onto the loaded
 * skeleton's real bones (see boneProxy.ts for why that needs more than
 * "point the ref at the bone") so usePlayTrick/poseUtils drive it with
 * zero changes — same keyframe data, same call sites.
 */
export function GltfPenelopeRig({
  rig,
  url,
  boneMap,
  facingYaw = 0,
  hipBoneName = "Hip",
  arrayBuffer,
}: GltfPenelopeRigProps) {
  const mountRef = useRef<Group>(null);
  const [scene, setScene] = useState<Object3D | null>(null);

  useEffect(() => {
    rig.root.current = mountRef.current;
  }, [rig]);

  useEffect(() => {
    let cancelled = false;

    const onLoad = (gltf: GLTF) => {
      if (cancelled) return;
      try {
        gltf.scene.rotation.y = facingYaw;
        const box = new Box3().setFromObject(gltf.scene);
        const size = box.getSize(new Vector3());
        const center = box.getCenter(new Vector3());
        if (!isFinite(size.x) || !isFinite(size.y) || !isFinite(size.z)) {
          throw new Error(`non-finite bounding box: ${JSON.stringify(size)}`);
        }
        const scale = size.y > 0 ? TARGET_HEIGHT / size.y : 1;
        gltf.scene.scale.setScalar(scale);
        gltf.scene.position.x -= center.x * scale;
        gltf.scene.position.z -= center.z * scale;

        gltf.scene.updateMatrixWorld(true);
        const hipBone = gltf.scene.getObjectByName(hipBoneName);
        if (!hipBone) {
          showLoadError(url, `hip bone "${hipBoneName}" not found in loaded scene`);
        }
        const hipWorldY = hipBone ? hipBone.getWorldPosition(new Vector3()).y : 0;
        gltf.scene.position.y -= hipWorldY;

        let mappedBones = 0;
        for (const [joint, boneName] of Object.entries(boneMap)) {
          const bone = gltf.scene.getObjectByName(boneName as string) as Bone | undefined;
          if (bone) {
            rig[joint as keyof RigRefs].current = createBoneProxy(bone);
            mappedBones++;
          }
        }
        if (mappedBones === 0) {
          showLoadError(url, "none of boneMap's bone names were found in the loaded scene");
        }
        setScene(gltf.scene);
      } catch (err) {
        showLoadError(`${url} (post-load processing)`, err);
      }
    };
    const onError = (err: unknown) => showLoadError(`${url} (load failed)`, err);

    const loader = new GLTFLoader();
    if (arrayBuffer) {
      loader.parse(arrayBuffer, url, onLoad, onError);
    } else {
      loader.load(url, onLoad, undefined, onError);
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, arrayBuffer]);

  return (
    <group ref={mountRef} position={[0, 0, 0]}>
      {scene && <primitive object={scene} />}
    </group>
  );
}
