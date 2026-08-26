import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

const COLORS = ["#ff5fae", "#ff8cc6", "#8438e0", "#b285ff", "#ffcd3c"];
const DURATION = 0.9;

interface Particle {
  vx: number;
  vy: number;
  vz: number;
}

interface StarBurst3DProps {
  /** Increment to fire a new burst; 0/unset means never fired. */
  triggerKey: number;
  position: [number, number, number];
  count?: number;
}

/**
 * A capped, allocation-light particle burst (pink/purple stars) — spec
 * §13/§35: satisfying on a success, never heavy enough to cost mobile
 * frame time. Every particle is a plain mesh (not InstancedMesh) since the
 * count is small enough (<=28) that the simplicity is worth more than the
 * draw-call savings here.
 */
export function StarBurst3D({ triggerKey, position, count = 22 }: StarBurst3DProps) {
  const refs = useRef<(Mesh | null)[]>([]);
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.4 + Math.random() * 1.6;
        return {
          vx: Math.cos(angle) * speed,
          vy: 1.6 + Math.random() * 1.4,
          vz: Math.sin(angle) * speed,
        };
      }),
    [count],
  );
  const elapsed = useRef(Infinity);
  const fired = useRef(triggerKey);

  useEffect(() => {
    if (triggerKey === fired.current) return;
    fired.current = triggerKey;
    elapsed.current = 0;
  }, [triggerKey]);

  useFrame((_, delta) => {
    if (elapsed.current > DURATION) {
      for (const mesh of refs.current) {
        if (mesh) mesh.visible = false;
      }
      return;
    }
    elapsed.current += delta;
    const t = elapsed.current;
    const fade = Math.max(0, 1 - t / DURATION);

    particles.forEach((p, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      mesh.visible = true;
      mesh.position.set(
        position[0] + p.vx * t,
        position[1] + p.vy * t - 2.2 * t * t,
        position[2] + p.vz * t,
      );
      mesh.rotation.x += delta * 4;
      mesh.rotation.y += delta * 3;
      mesh.scale.setScalar(0.06 * fade + 0.01);
    });
  });

  return (
    <group>
      {particles.map((_, i) => (
        <mesh key={i} ref={(m) => { refs.current[i] = m; }} visible={false}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={COLORS[i % COLORS.length]}
            emissive={COLORS[i % COLORS.length]}
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}
