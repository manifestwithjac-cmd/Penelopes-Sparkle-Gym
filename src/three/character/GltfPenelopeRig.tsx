import { useEffect, useRef, useState } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Box3, Group, Vector3, type Bone, type Object3D } from "three";
import type { RigRefs } from "./useCharacterRig";
import { createBoneProxy } from "./boneProxy";

// Rough total standing height of the procedural rig (HIP_HEIGHT_BASE plus
// torso+head above the hips) — the candidate is auto-scaled to match so
// she fits the gym environment/camera framing without hand-tuning a magic
// number per asset. Validation-only: exact proportions get revisited in
// the art-cleanup pass.
const TARGET_HEIGHT = 1.56;

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
}

/**
 * Drop-in replacement for PenelopeRig.tsx that loads a rigged GLB instead
 * of drawing procedural primitives. Maps our joint names onto the loaded
 * skeleton's real bones (see boneProxy.ts for why that needs more than
 * "point the ref at the bone") so usePlayTrick/poseUtils drive it with
 * zero changes — same keyframe data, same call sites.
 */
export function GltfPenelopeRig({ rig, url, boneMap, facingYaw = 0, hipBoneName = "Hip" }: GltfPenelopeRigProps) {
  const mountRef = useRef<Group>(null);
  const [scene, setScene] = useState<Object3D | null>(null);

  useEffect(() => {
    rig.root.current = mountRef.current;
  }, [rig]);

  useEffect(() => {
    let cancelled = false;
    new GLTFLoader().load(url, (gltf) => {
      if (cancelled) return;
      gltf.scene.rotation.y = facingYaw;
      const box = new Box3().setFromObject(gltf.scene);
      const size = box.getSize(new Vector3());
      const center = box.getCenter(new Vector3());
      const scale = size.y > 0 ? TARGET_HEIGHT / size.y : 1;
      gltf.scene.scale.setScalar(scale);
      gltf.scene.position.x -= center.x * scale;
      gltf.scene.position.z -= center.z * scale;

      gltf.scene.updateMatrixWorld(true);
      const hipBone = gltf.scene.getObjectByName(hipBoneName);
      const hipWorldY = hipBone ? hipBone.getWorldPosition(new Vector3()).y : 0;
      gltf.scene.position.y -= hipWorldY;

      for (const [joint, boneName] of Object.entries(boneMap)) {
        const bone = gltf.scene.getObjectByName(boneName as string) as Bone | undefined;
        if (bone) {
          rig[joint as keyof RigRefs].current = createBoneProxy(bone);
        }
      }
      setScene(gltf.scene);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return (
    <group ref={mountRef} position={[0, 0, 0]}>
      {scene && <primitive object={scene} />}
    </group>
  );
}
