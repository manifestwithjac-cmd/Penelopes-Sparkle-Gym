// A tiny local 7-segment digit renderer for the "67" wall easter egg —
// deliberately NOT using drei's <Text>, which pulls glyph/font-fallback
// data from an external CDN (cdn.jsdelivr.net) at runtime. That's a bad
// dependency for a mobile game to have at all (breaks offline / flaky
// networks), and in this sandbox it hard-failed and stalled the whole
// render loop. Plain boxes have zero network dependency.
const SEGMENT_MAP: Record<string, string> = {
  "6": "acdefg",
  "7": "abc",
};

// a=top, b=top-right, c=bottom-right, d=bottom, e=bottom-left,
// f=top-left, g=middle
const SEGMENTS: Record<string, { pos: [number, number]; horizontal: boolean }> = {
  a: { pos: [0, 1], horizontal: true },
  b: { pos: [0.5, 0.5], horizontal: false },
  c: { pos: [0.5, -0.5], horizontal: false },
  d: { pos: [0, -1], horizontal: true },
  e: { pos: [-0.5, -0.5], horizontal: false },
  f: { pos: [-0.5, 0.5], horizontal: false },
  g: { pos: [0, 0], horizontal: true },
};

function Digit({ char, color }: { char: string; color: string }) {
  const active = SEGMENT_MAP[char] ?? "";
  return (
    <group>
      {[...active].map((seg) => {
        const s = SEGMENTS[seg];
        return (
          <mesh key={seg} position={[s.pos[0] * 0.24, s.pos[1] * 0.24, 0]}>
            <boxGeometry args={s.horizontal ? [0.2, 0.045, 0.02] : [0.045, 0.2, 0.02]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
          </mesh>
        );
      })}
    </group>
  );
}

export function SevenSegmentNumber({
  value,
  position,
  rotation,
  color = "#e6c9f5",
}: {
  value: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
}) {
  return (
    <group position={position} rotation={rotation}>
      {[...value].map((char, i) => (
        <group key={i} position={[i * 0.62 - ((value.length - 1) * 0.62) / 2, 0, 0]}>
          <Digit char={char} color={color} />
        </group>
      ))}
    </group>
  );
}
