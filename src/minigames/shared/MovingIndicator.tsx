import { useEffect, useRef } from "react";
import { computeTapAccuracy } from "./timing";
import { BigButton } from "../../components/ui/BigButton";
import "./MovingIndicator.css";

export type IndicatorAxis = "x" | "y" | "rotate";

interface MovingIndicatorProps {
  spawnKey: string | number;
  durationMs: number;
  axis: IndicatorAxis;
  /** 0..1 point along the motion considered the "sweet spot". */
  sweetCenter: number;
  sweetWidth?: number;
  glyph?: string;
  tapLabel: string;
  onResolve: (accuracy: number) => void;
}

/**
 * A marker that moves along one axis (beam walk, bars swing, trampoline
 * bounce) over `durationMs`; the player taps a big fixed button — not the
 * moving marker itself — at the right moment. Shared by Beam/Bars/
 * Trampoline so their difficulty stays consistently forgiving while each
 * still gets its own motion path and framing.
 */
export function MovingIndicator({
  spawnKey,
  durationMs,
  axis,
  sweetCenter,
  sweetWidth = 0.4,
  glyph = "⭐",
  tapLabel,
  onResolve,
}: MovingIndicatorProps) {
  const spawnedAt = useRef(performance.now());
  const resolved = useRef(false);

  useEffect(() => {
    spawnedAt.current = performance.now();
    resolved.current = false;
    const endTimer = window.setTimeout(() => {
      if (!resolved.current) {
        resolved.current = true;
        onResolve(0);
      }
    }, durationMs + 60);
    return () => window.clearTimeout(endTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spawnKey, durationMs]);

  function handleTap() {
    if (resolved.current) return;
    resolved.current = true;
    const elapsed = performance.now() - spawnedAt.current;
    const fraction = Math.min(1, elapsed / durationMs);
    onResolve(computeTapAccuracy(fraction, sweetCenter, sweetWidth));
  }

  return (
    <div className={`moving-indicator moving-indicator--${axis}`}>
      <div className="moving-indicator__track">
        <div
          className="moving-indicator__sweet"
          style={
            axis === "x"
              ? { left: `${sweetCenter * 100}%` }
              : axis === "y"
                ? { top: `${(1 - sweetCenter) * 100}%` }
                : { transform: `rotate(${(sweetCenter - 0.5) * 140}deg)` }
          }
        />
        <div
          key={spawnKey}
          className={`moving-indicator__marker moving-indicator__marker--${axis}`}
          style={{ animationDuration: `${durationMs}ms` }}
        >
          {glyph}
        </div>
      </div>
      <BigButton size="xl" variant="gold" onClick={handleTap}>
        {tapLabel}
      </BigButton>
    </div>
  );
}
