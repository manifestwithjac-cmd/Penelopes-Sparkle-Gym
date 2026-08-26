import { useEffect, useRef } from "react";
import { computeTapAccuracy } from "./timing";
import { useSound } from "../../audio/useSound";
import "./TapTarget.css";

interface TapTargetProps {
  /** Changes every spawn so the component resets its animation cleanly. */
  spawnKey: string | number;
  durationMs: number;
  glyph?: string;
  onResolve: (accuracy: number) => void;
  x: number; // 0..100, percent within stage
  y: number; // 0..100, percent within stage
}

/** A single tap-timing target: a pulsing star that shrinks over its
 * lifespan. Tapping anywhere on it scores accuracy by how close to the
 * "sweet" moment the tap landed; letting it disappear scores a miss. */
export function TapTarget({ spawnKey, durationMs, glyph = "★", onResolve, x, y }: TapTargetProps) {
  const spawnedAt = useRef(performance.now());
  const resolved = useRef(false);
  const playSound = useSound();

  useEffect(() => {
    spawnedAt.current = performance.now();
    resolved.current = false;
    const missTimer = window.setTimeout(() => {
      if (!resolved.current) {
        resolved.current = true;
        onResolve(0);
      }
    }, durationMs + 40);
    return () => window.clearTimeout(missTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spawnKey, durationMs]);

  function handleTap() {
    if (resolved.current) return;
    resolved.current = true;
    playSound("tap");
    const elapsed = performance.now() - spawnedAt.current;
    const fraction = Math.min(1, elapsed / durationMs);
    onResolve(computeTapAccuracy(fraction));
  }

  return (
    <button
      className="tap-target"
      style={{ left: `${x}%`, top: `${y}%`, animationDuration: `${durationMs}ms` }}
      onClick={handleTap}
      aria-label="Tap the star"
    >
      <span className="tap-target__ring" style={{ animationDuration: `${durationMs}ms` }} />
      <span className="tap-target__glyph">{glyph}</span>
    </button>
  );
}
