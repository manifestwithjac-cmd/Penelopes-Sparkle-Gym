import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";

export type CameraState = "gym-overview" | "floor-focus";

const PRESETS: Record<CameraState, { pos: Vector3; look: Vector3 }> = {
  "gym-overview": { pos: new Vector3(0, 2.05, 5.6), look: new Vector3(0, 1.05, -0.6) },
  "floor-focus": { pos: new Vector3(0, 1.25, 2.5), look: new Vector3(0, 0.85, 0.3) },
};

/**
 * Smoothly lerps the camera between named states rather than cutting —
 * "camera travels toward the area" per spec, not a hard scene swap. Uses
 * exponential smoothing (frame-rate independent) so it feels the same on
 * a 30fps and 60fps device.
 */
export function CameraRig({ state }: { state: CameraState }) {
  const { camera } = useThree();
  const look = useRef(new Vector3().copy(PRESETS["gym-overview"].look));

  useFrame((_, delta) => {
    const preset = PRESETS[state];
    const k = 1 - Math.exp(-4.5 * delta);
    camera.position.lerp(preset.pos, k);
    look.current.lerp(preset.look, k);
    camera.lookAt(look.current);
  });

  return null;
}
