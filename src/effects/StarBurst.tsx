import { useMemo } from "react";
import "./StarBurst.css";

interface StarBurstProps {
  /** Changing this key re-triggers the burst (e.g. Date.now() per success). */
  triggerKey: string | number;
  count?: number;
  big?: boolean;
}

const COLORS = ["var(--pink-400)", "var(--pink-300)", "var(--purple-400)", "var(--purple-300)", "var(--gold-400)"];

/**
 * A capped, performant "stars explode" burst (spec §13/§35 — satisfying but
 * never so heavy it interferes with gameplay). Pure CSS animation, no
 * animation-frame loop, so many can exist briefly without cost.
 */
export function StarBurst({ triggerKey, count = 14, big = false }: StarBurstProps) {
  const stars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const distance = 60 + Math.random() * (big ? 90 : 50);
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance - 20;
      const delay = Math.random() * 80;
      const size = big ? 14 + Math.random() * 12 : 10 + Math.random() * 8;
      const color = COLORS[i % COLORS.length];
      return { id: i, dx, dy, delay, size, color };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerKey, count, big]);

  return (
    <div className="star-burst" aria-hidden="true">
      {stars.map((s) => (
        <span
          key={s.id}
          className="star-burst__star"
          style={
            {
              "--dx": `${s.dx}px`,
              "--dy": `${s.dy}px`,
              "--delay": `${s.delay}ms`,
              "--size": `${s.size}px`,
              color: s.color,
            } as React.CSSProperties
          }
        >
          ★
        </span>
      ))}
    </div>
  );
}
