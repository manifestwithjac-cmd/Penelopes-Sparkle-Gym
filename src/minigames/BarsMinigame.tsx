import { useEffect, useState } from "react";
import { useGameStore } from "../state/gameStore";
import { TrickPicker } from "./shared/TrickPicker";
import { MovingIndicator } from "./shared/MovingIndicator";
import { ResultPanel } from "./shared/ResultPanel";
import { BigButton } from "../components/ui/BigButton";
import { summarizeAttempt, type PerformanceTier } from "../utils/scoring";
import "./shared/minigame.css";

const STEPS = [
  { label: "Swing!", sweetCenter: 0.65, duration: 1400 },
  { label: "Catch!", sweetCenter: 0.5, duration: 1200 },
];

type Phase = "ready" | "playing" | "result";

export function BarsMinigame() {
  const visitApparatus = useGameStore((s) => s.visitApparatus);
  const recordTrickResult = useGameStore((s) => s.recordTrickResult);

  const [trickId, setTrickId] = useState("bar_swing");
  const [phase, setPhase] = useState<Phase>("ready");
  const [stepIndex, setStepIndex] = useState(0);
  const [accuracies, setAccuracies] = useState<number[]>([]);
  const [outcome, setOutcome] = useState<{
    tier: PerformanceTier;
    starsGained: number;
    pointsGained: number;
  } | null>(null);

  useEffect(() => {
    visitApparatus("bars");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startAttempt() {
    setAccuracies([]);
    setStepIndex(0);
    setPhase("playing");
  }

  function handleStepResolved(accuracy: number) {
    const next = [...accuracies, accuracy];
    if (next.length >= STEPS.length) {
      const { success, tier } = summarizeAttempt(next);
      const result = recordTrickResult({ trickId, success, tier });
      setOutcome(result);
      setPhase("result");
    } else {
      setAccuracies(next);
      setStepIndex(stepIndex + 1);
    }
  }

  const step = STEPS[stepIndex];

  return (
    <div className="minigame">
      <TrickPicker apparatusId="bars" selectedTrickId={trickId} onSelect={setTrickId} />

      <div className="minigame__stage">
        {phase === "ready" && (
          <div className="minigame__prompt">
            <p className="minigame__hint">Swing high, then tap to catch the bar!</p>
            <BigButton size="xl" variant="primary" onClick={startAttempt}>
              GO! 🎪
            </BigButton>
          </div>
        )}

        {phase === "playing" && (
          <MovingIndicator
            spawnKey={stepIndex}
            durationMs={step.duration}
            axis="rotate"
            sweetCenter={step.sweetCenter}
            tapLabel={step.label}
            glyph="🤾"
            onResolve={handleStepResolved}
          />
        )}

        {phase === "result" && outcome && (
          <ResultPanel
            tier={outcome.tier}
            starsGained={outcome.starsGained}
            pointsGained={outcome.pointsGained}
            onRetry={startAttempt}
          />
        )}
      </div>
    </div>
  );
}
