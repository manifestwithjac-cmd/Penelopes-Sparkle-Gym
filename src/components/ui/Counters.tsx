import { useGameStore } from "../../state/gameStore";
import { useAnimatedNumber } from "../../utils/useAnimatedNumber";
import "./Counters.css";

export function StarCounter() {
  const stars = useGameStore((s) => s.stars);
  const shown = useAnimatedNumber(stars);
  return (
    <div className="counter-pill counter-star" aria-label={`${stars} stars`}>
      <span className="counter-icon" aria-hidden="true">
        ⭐
      </span>
      <span className="counter-value">{shown}</span>
    </div>
  );
}

export function PointCounter() {
  const points = useGameStore((s) => s.points);
  const shown = useAnimatedNumber(points);
  return (
    <div className="counter-pill counter-point" aria-label={`${points} points`}>
      <span className="counter-icon" aria-hidden="true">
        🏅
      </span>
      <span className="counter-value">{shown}</span>
    </div>
  );
}
