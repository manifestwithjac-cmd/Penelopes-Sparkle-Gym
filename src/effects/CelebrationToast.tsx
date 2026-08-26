import { useEffect } from "react";
import { useGameStore } from "../state/gameStore";
import { StarBurst } from "./StarBurst";
import { useSound } from "../audio/useSound";
import "./CelebrationToast.css";

const AUTO_DISMISS_MS = 2200;

/** Shows queued "NEW TRICK!" / "NEW LEOTARD!" / achievement / challenge
 * toasts one at a time, anywhere in the app (mounted once in App.tsx). */
export function CelebrationToast() {
  const celebration = useGameStore((s) => s.celebrationQueue[0]);
  const dismiss = useGameStore((s) => s.dismissCelebration);
  const playSound = useSound();

  useEffect(() => {
    if (!celebration) return;
    playSound("sparkle");
    const t = setTimeout(() => dismiss(celebration.id), AUTO_DISMISS_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebration, dismiss]);

  if (!celebration) return null;

  return (
    <div className="celebration-toast-layer">
      <div className="celebration-toast" key={celebration.id}>
        <StarBurst triggerKey={celebration.id} count={16} big />
        <span className="celebration-toast__icon">{celebration.icon}</span>
        <span className="celebration-toast__title">{celebration.title}</span>
        {celebration.subtitle && (
          <span className="celebration-toast__subtitle">{celebration.subtitle}</span>
        )}
      </div>
    </div>
  );
}
