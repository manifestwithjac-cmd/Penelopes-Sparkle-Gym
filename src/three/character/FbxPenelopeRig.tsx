import { useEffect, useRef, useState } from "react";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { Box3, Group, SkinnedMesh, Skeleton, Vector3, type Bone, type Object3D } from "three";
import type { RigRefs } from "./useCharacterRig";
import { createBoneProxy } from "./boneProxy";

// Same reasoning as GltfPenelopeRig.tsx — the candidate is auto-scaled to
// roughly match the procedural rig's standing height so she fits the gym
// environment/camera framing.
const TARGET_HEIGHT = 1.56;
const HIP_BONE_NAME = "mixamorigHips";

// This candidate's FBX exported one SEPARATE, DUPLICATE bone hierarchy per
// clothing/hair mesh instead of one skeleton shared across all of them —
// confirmed by dumping node names (see CandidatePreview.tsx's list-names
// debug mode) and by a pose test where posing "the" arm moved only one
// mesh's copy, leaving a shoe floating near the head. Posing every same-
// named bone independently is fragile (each duplicate can drift). This
// instead picks one canonical bone per name and repoints every mesh's
// skeleton at those same bone objects, so there's only ever one true
// skeleton driving all of them — the standard fix for this FBX-export
// pattern.
function dedupeSkeletons(root: Object3D) {
  const skinned: SkinnedMesh[] = [];
  root.traverse((c) => {
    if (c instanceof SkinnedMesh) skinned.push(c);
  });
  if (skinned.length === 0) return;

  const canonical = new Map<string, Bone>();
  for (const mesh of skinned) {
    for (const bone of mesh.skeleton.bones) {
      if (!canonical.has(bone.name)) canonical.set(bone.name, bone);
    }
  }
  for (const mesh of skinned) {
    const newBones = mesh.skeleton.bones.map((b) => canonical.get(b.name) ?? b);
    mesh.skeleton = new Skeleton(newBones, mesh.skeleton.boneInverses);
  }
}

interface FbxPenelopeRigProps {
  rig: RigRefs;
  url: string;
  boneMap: Partial<Record<keyof RigRefs, string>>;
  facingYaw?: number;
}

/** FBX counterpart to GltfPenelopeRig.tsx — same joint-name-to-bone
 * mapping strategy, plus the skeleton dedup pass this candidate needs. */
export function FbxPenelopeRig({ rig, url, boneMap, facingYaw = 0 }: FbxPenelopeRigProps) {
  const mountRef = useRef<Group>(null);
  const [object, setObject] = useState<Object3D | null>(null);

  useEffect(() => {
    rig.root.current = mountRef.current;
  }, [rig]);

  useEffect(() => {
    let cancelled = false;
    new FBXLoader().load(url, (loaded) => {
      if (cancelled) return;
      loaded.rotation.y = facingYaw;

      const box = new Box3().setFromObject(loaded);
      const size = box.getSize(new Vector3());
      const center = box.getCenter(new Vector3());
      const scale = size.y > 0 ? TARGET_HEIGHT / size.y : 1;
      loaded.scale.setScalar(scale);
      loaded.position.x -= center.x * scale;
      loaded.position.z -= center.z * scale;

      loaded.updateMatrixWorld(true);
      const hipBone = loaded.getObjectByName(HIP_BONE_NAME);
      const hipWorldY = hipBone ? hipBone.getWorldPosition(new Vector3()).y : 0;
      loaded.position.y -= hipWorldY;

      dedupeSkeletons(loaded);

      for (const [joint, boneName] of Object.entries(boneMap)) {
        const bone = loaded.getObjectByName(boneName as string) as Bone | undefined;
        if (bone) {
          rig[joint as keyof RigRefs].current = createBoneProxy(bone);
        }
      }
      setObject(loaded);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return (
    <group ref={mountRef} position={[0, 0, 0]}>
      {object && <primitive object={object} />}
    </group>
  );
}
