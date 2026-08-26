import { useEffect, useRef, useState } from "react";

/** Eases a displayed number toward `value` for a satisfying "count up" feel
 * on the star/point counters, without re-rendering on every single point. */
export function useAnimatedNumber(value: number, durationMs = 500) {
  const [display, setDisplay] = useState(value);
  const frame = useRef<number | null>(null);
  const from = useRef(value);

  useEffect(() => {
    const start = performance.now();
    const startValue = from.current;
    const delta = value - startValue;
    if (delta === 0) return;

    if (frame.current) cancelAnimationFrame(frame.current);

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(startValue + delta * eased));
      if (t < 1) {
        frame.current = requestAnimationFrame(tick);
      } else {
        from.current = value;
      }
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs]);

  return display;
}
