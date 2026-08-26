import { SevenSegmentNumber } from "./SevenSegmentDigit";

const WALL_H = 4.4;
const ROOM_W = 9;
const ROOM_D = 10;
const BACK_Z = -ROOM_D / 2;

/** A small low-poly placeholder prop, just enough silhouette to read as
 * "beam" / "bars" / "trampoline" / "vault" from across the room — these
 * aren't interactive yet (spec's vertical slice scope is Floor only), they
 * exist purely to give the gym depth and make it feel like one big
 * connected facility, per spec §3/§6. */
function BeamProp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.62, 0]} castShadow>
        <boxGeometry args={[1.8, 0.1, 0.22]} />
        <meshStandardMaterial color="#b285ff" />
      </mesh>
      <mesh position={[-0.7, 0.31, 0]} castShadow>
        <boxGeometry args={[0.1, 0.62, 0.18]} />
        <meshStandardMaterial color="#8438e0" />
      </mesh>
      <mesh position={[0.7, 0.31, 0]} castShadow>
        <boxGeometry args={[0.1, 0.62, 0.18]} />
        <meshStandardMaterial color="#8438e0" />
      </mesh>
    </group>
  );
}

function BarsProp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {[-0.5, 0.5].map((x, i) => (
        <group key={x}>
          <mesh position={[x, 1.3 - i * 0.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 1.1, 6]} />
            <meshStandardMaterial color="#4fb8ff" />
          </mesh>
          <mesh position={[x - 0.5, (1.3 - i * 0.3) / 2, -0.4]} castShadow>
            <boxGeometry args={[0.07, 1.3 - i * 0.3, 0.07]} />
            <meshStandardMaterial color="#2b8fd6" />
          </mesh>
          <mesh position={[x + 0.5, (1.3 - i * 0.3) / 2, -0.4]} castShadow>
            <boxGeometry args={[0.07, 1.3 - i * 0.3, 0.07]} />
            <meshStandardMaterial color="#2b8fd6" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function TrampolineProp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.85, 0.85, 0.05, 16]} />
        <meshStandardMaterial color="#2b2b3a" />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <torusGeometry args={[0.85, 0.06, 6, 16]} />
        <meshStandardMaterial color="#ffcd3c" />
      </mesh>
    </group>
  );
}

function VaultProp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.6, 0.5, 0.9]} />
        <meshStandardMaterial color="#3fd8a0" />
      </mesh>
      <mesh position={[0, 0.08, 0.9]} rotation={[0.25, 0, 0]} castShadow>
        <boxGeometry args={[0.5, 0.08, 0.5]} />
        <meshStandardMaterial color="#2bb488" />
      </mesh>
    </group>
  );
}

function StarDecor({ position, scale = 0.12 }: { position: [number, number, number]; scale?: number }) {
  const color = (position[0] + position[2]) % 2 === 0 ? "#ff8cc6" : "#cfaeff";
  return (
    <mesh position={position} rotation={[0.4, 0.6, 0]}>
      <octahedronGeometry args={[scale, 0]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} />
    </mesh>
  );
}

/**
 * The simplified vertical-slice gym: one big room with a floor spring-mat
 * area at the center (where Floor's minigame plays out), windows and
 * banners on the back wall, placeholder silhouettes of the other
 * apparatus for depth, and the "67" easter egg tucked on a side wall.
 */
export function GymEnvironment() {
  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_W, ROOM_D]} />
        <meshStandardMaterial color="#f3d9ff" />
      </mesh>
      {/* spring floor mat, striped pink/purple, where Penelope performs */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-1.25 + i * 0.5, 0.01, 0.4]} receiveShadow>
          <planeGeometry args={[0.5, 3]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#ff8cc6" : "#cfaeff"} />
        </mesh>
      ))}

      {/* back wall */}
      <mesh position={[0, WALL_H / 2, BACK_Z]} receiveShadow>
        <planeGeometry args={[ROOM_W, WALL_H]} />
        <meshStandardMaterial color="#fff0f7" />
      </mesh>
      {/* side walls */}
      <mesh position={[-ROOM_W / 2, WALL_H / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM_D, WALL_H]} />
        <meshStandardMaterial color="#f6e6ff" />
      </mesh>
      <mesh position={[ROOM_W / 2, WALL_H / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM_D, WALL_H]} />
        <meshStandardMaterial color="#f6e6ff" />
      </mesh>

      {/* windows on the back wall */}
      {[-3, -1, 1, 3].map((x) => (
        <group key={x} position={[x, 2.9, BACK_Z + 0.02]}>
          <mesh>
            <boxGeometry args={[1.1, 1.5, 0.06]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0, 0.04]}>
            <planeGeometry args={[0.9, 1.3]} />
            <meshStandardMaterial color="#bfe6ff" emissive="#bfe6ff" emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}

      {/* banner — a plain shape, not text (drei's <Text> needs an external
          font CDN at runtime, a bad dependency for an offline mobile game) */}
      <group position={[0, 3.7, BACK_Z + 0.05]}>
        <mesh>
          <boxGeometry args={[3.2, 0.55, 0.04]} />
          <meshStandardMaterial color="#ff3d9a" />
        </mesh>
        {[-1.3, -0.8, 0.8, 1.3].map((x) => (
          <mesh key={x} position={[x, 0, 0.04]} rotation={[0, 0, 0.3]}>
            <octahedronGeometry args={[0.16, 0]} />
            <meshStandardMaterial color="#fff7c2" emissive="#fff7c2" emissiveIntensity={0.3} />
          </mesh>
        ))}
      </group>

      {/* trophy shelf, side wall */}
      <group position={[-ROOM_W / 2 + 0.1, 1.6, -1.5]}>
        <mesh castShadow>
          <boxGeometry args={[0.15, 0.5, 2]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {[-0.7, -0.2, 0.3, 0.8].map((z) => (
          <mesh key={z} position={[0.14, 0.3, z]} castShadow>
            <sphereGeometry args={[0.09, 8, 8]} />
            <meshStandardMaterial color="#ffcd3c" metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* the 67 easter egg — subtle, unexplained, on a side wall */}
      <SevenSegmentNumber
        value="67"
        position={[ROOM_W / 2 - 0.05, 2.1, -3]}
        rotation={[0, -Math.PI / 2, 0]}
        color="#e6c9f5"
      />

      {/* other apparatus, sketched in for depth (not interactive yet) */}
      <BeamProp position={[-2.6, 0, -2.2]} />
      <BarsProp position={[2.6, 0, -2.4]} />
      <TrampolineProp position={[-2.8, 0, 0.6]} />
      <VaultProp position={[2.9, 0, 0.4]} />

      {/* scattered star decor */}
      {Array.from({ length: 14 }, (_, i) => {
        const x = -3.8 + ((i * 47) % 76) / 10;
        const y = 1.2 + ((i * 31) % 30) / 10;
        const z = BACK_Z + 0.3 + ((i * 19) % 60) / 10;
        return <StarDecor key={i} position={[x, y, z]} scale={0.08 + (i % 3) * 0.03} />;
      })}

      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#fff0f7", "#e0c9f0", 0.4]} />
      <directionalLight
        position={[3, 6, 3]}
        intensity={1.3}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
    </group>
  );
}
