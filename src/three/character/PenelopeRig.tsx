import type { LeotardPattern } from "../../data/types";
import { leotardLook } from "./leotardMaterial";
import type { RigRefs } from "./useCharacterRig";
import {
  HIP_HEIGHT_BASE as HIP_HEIGHT,
  THIGH_LEN,
  SHIN_LEN,
  HIP_H,
  HIP_X,
  TORSO_H,
  TORSO_W,
  SHOULDER_X,
  UPPER_ARM_LEN,
  FOREARM_LEN,
  HAND_LEN,
  HEAD_R,
} from "./proportions";

interface PenelopeRigProps {
  rig: RigRefs;
  leotard: LeotardPattern;
  hairColor: string;
  skinTone: string;
}

/**
 * The articulated character body. Every limb is its own mesh parented
 * under its own joint group (see joints.ts) — nothing here is a single
 * rigid model, so the animation system can rotate a shoulder or a knee
 * independently of the rest of the body, same as a real rig would.
 *
 * Placeholder geometry strategy: primitive capsules/boxes/spheres, no
 * imported model. Swapping in a rigged GLTF character later means
 * replacing the <mesh> children here with <primitive object={gltf.scene}>
 * and binding the same joint names to its bones — usePlayTrick and every
 * trick's keyframe data stay untouched, since they only ever address
 * joints by name.
 */
export function PenelopeRig({ rig, leotard, hairColor, skinTone }: PenelopeRigProps) {
  const leo = leotardLook(leotard);

  return (
    <group ref={rig.root} position={[0, HIP_HEIGHT, 0]}>
      <group ref={rig.hips}>
        <mesh position={[0, HIP_H / 2, 0]} castShadow>
          <boxGeometry args={[HIP_X * 2 + 0.05, HIP_H, 0.2]} />
          <meshStandardMaterial color={leo.color} metalness={leo.metalness} roughness={leo.roughness} />
        </mesh>

        {/* ---- torso / head ---- */}
        <group ref={rig.torso} position={[0, HIP_H, 0]}>
          <mesh position={[0, TORSO_H / 2, 0]} castShadow>
            <capsuleGeometry args={[TORSO_W / 2, TORSO_H * 0.55, 3, 8]} />
            <meshStandardMaterial color={leo.color} metalness={leo.metalness} roughness={leo.roughness} />
          </mesh>

          <group ref={rig.head} position={[0, TORSO_H + 0.02, 0]}>
            <mesh position={[0, HEAD_R, 0]} castShadow>
              <sphereGeometry args={[HEAD_R, 16, 12]} />
              <meshStandardMaterial color={skinTone} roughness={0.7} />
            </mesh>
            {/* hair: a full sphere set back/up so the head sphere in front
                naturally occludes its lower-front portion — avoids the
                jagged open-rim silhouette a partial sphere segment gets
                at this low a poly count. */}
            <mesh position={[0, HEAD_R + 0.06, -0.035]} scale={[1.08, 0.95, 1.05]} castShadow>
              <sphereGeometry args={[HEAD_R + 0.02, 16, 12]} />
              <meshStandardMaterial color={hairColor} roughness={0.85} />
            </mesh>
            {/* face: eyes + a simple smile */}
            <mesh position={[-0.075, HEAD_R + 0.015, HEAD_R - 0.025]}>
              <sphereGeometry args={[0.032, 8, 8]} />
              <meshStandardMaterial color="#3d6fd6" />
            </mesh>
            <mesh position={[0.075, HEAD_R + 0.015, HEAD_R - 0.025]}>
              <sphereGeometry args={[0.032, 8, 8]} />
              <meshStandardMaterial color="#3d6fd6" />
            </mesh>
            <mesh position={[-0.075, HEAD_R + 0.04, HEAD_R - 0.005]}>
              <sphereGeometry args={[0.011, 6, 6]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0.075, HEAD_R + 0.04, HEAD_R - 0.005]}>
              <sphereGeometry args={[0.011, 6, 6]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0, HEAD_R - 0.09, HEAD_R - 0.03]} rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[0.045, 0.009, 6, 10, Math.PI]} />
              <meshStandardMaterial color="#c1476b" />
            </mesh>
          </group>

          {/* ---- left arm ---- */}
          <group ref={rig.shoulderL} position={[SHOULDER_X, TORSO_H - 0.03, 0]}>
            <mesh position={[0, -UPPER_ARM_LEN / 2, 0]} castShadow>
              <capsuleGeometry args={[0.045, UPPER_ARM_LEN * 0.6, 2, 6]} />
              <meshStandardMaterial color={skinTone} roughness={0.7} />
            </mesh>
            <group ref={rig.elbowL} position={[0, -UPPER_ARM_LEN, 0]}>
              <mesh position={[0, -FOREARM_LEN / 2, 0]} castShadow>
                <capsuleGeometry args={[0.038, FOREARM_LEN * 0.6, 2, 6]} />
                <meshStandardMaterial color={skinTone} roughness={0.7} />
              </mesh>
              <group ref={rig.wristL} position={[0, -FOREARM_LEN, 0]}>
                <mesh position={[0, -HAND_LEN / 2, 0]} castShadow>
                  <sphereGeometry args={[0.045, 8, 8]} />
                  <meshStandardMaterial color={skinTone} roughness={0.7} />
                </mesh>
              </group>
            </group>
          </group>

          {/* ---- right arm ---- */}
          <group ref={rig.shoulderR} position={[-SHOULDER_X, TORSO_H - 0.03, 0]}>
            <mesh position={[0, -UPPER_ARM_LEN / 2, 0]} castShadow>
              <capsuleGeometry args={[0.045, UPPER_ARM_LEN * 0.6, 2, 6]} />
              <meshStandardMaterial color={skinTone} roughness={0.7} />
            </mesh>
            <group ref={rig.elbowR} position={[0, -UPPER_ARM_LEN, 0]}>
              <mesh position={[0, -FOREARM_LEN / 2, 0]} castShadow>
                <capsuleGeometry args={[0.038, FOREARM_LEN * 0.6, 2, 6]} />
                <meshStandardMaterial color={skinTone} roughness={0.7} />
              </mesh>
              <group ref={rig.wristR} position={[0, -FOREARM_LEN, 0]}>
                <mesh position={[0, -HAND_LEN / 2, 0]} castShadow>
                  <sphereGeometry args={[0.045, 8, 8]} />
                  <meshStandardMaterial color={skinTone} roughness={0.7} />
                </mesh>
              </group>
            </group>
          </group>
        </group>

        {/* ---- left leg ---- */}
        <group ref={rig.hipL} position={[HIP_X, HIP_H * 0.3, 0]}>
          <mesh position={[0, -THIGH_LEN / 2, 0]} castShadow>
            <capsuleGeometry args={[0.06, THIGH_LEN * 0.55, 2, 6]} />
            <meshStandardMaterial color={skinTone} roughness={0.7} />
          </mesh>
          <group ref={rig.kneeL} position={[0, -THIGH_LEN, 0]}>
            <mesh position={[0, -SHIN_LEN / 2, 0]} castShadow>
              <capsuleGeometry args={[0.05, SHIN_LEN * 0.55, 2, 6]} />
              <meshStandardMaterial color={skinTone} roughness={0.7} />
            </mesh>
            <group ref={rig.ankleL} position={[0, -SHIN_LEN, 0]}>
              <mesh position={[0, -0.02, 0.045]} castShadow>
                <boxGeometry args={[0.09, 0.05, 0.16]} />
                <meshStandardMaterial color="#ffffff" roughness={0.6} />
              </mesh>
            </group>
          </group>
        </group>

        {/* ---- right leg ---- */}
        <group ref={rig.hipR} position={[-HIP_X, HIP_H * 0.3, 0]}>
          <mesh position={[0, -THIGH_LEN / 2, 0]} castShadow>
            <capsuleGeometry args={[0.06, THIGH_LEN * 0.55, 2, 6]} />
            <meshStandardMaterial color={skinTone} roughness={0.7} />
          </mesh>
          <group ref={rig.kneeR} position={[0, -THIGH_LEN, 0]}>
            <mesh position={[0, -SHIN_LEN / 2, 0]} castShadow>
              <capsuleGeometry args={[0.05, SHIN_LEN * 0.55, 2, 6]} />
              <meshStandardMaterial color={skinTone} roughness={0.7} />
            </mesh>
            <group ref={rig.ankleR} position={[0, -SHIN_LEN, 0]}>
              <mesh position={[0, -0.02, 0.045]} castShadow>
                <boxGeometry args={[0.09, 0.05, 0.16]} />
                <meshStandardMaterial color="#ffffff" roughness={0.6} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
