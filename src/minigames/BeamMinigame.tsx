import { useEffect, useState } from "react";
import { useGameStore } from "../state/gameStore";
import { TrickPicker } from "./shared/TrickPicker";
import { MovingIndicator } from "./shared/MovingIndicator";
import { ResultPanel } from "./shared/ResultPanel";
import { BigButton } from "../components/ui/BigButton";
import { summarizeAttempt, type PerformanceTier } from "../utils/scoring";
import "./shared/minigame.css";

const STEP_COUNT = 3;
const STEP_DURATION_MS = 1500;

type Phase = "ready" | "playing" | "result";

export function BeamMinigame() {
  const visitApparatus = useGameStore((s) => s.visitApparatus);
  const recordTrickResult = useGameStore((s) => s.recordTrickResult);

  const [trickId, setTrickId] = useState("beam_balance");
  const [phase, setPhase] = useState<Phase>("ready");
  const [stepIndex, setStepIndex] = useState(0);
  const [accuracies, setAccuracies] = useState<number[]>([]);
  const [outcome, setOutcome] = useState<{
    tier: PerformanceTier;
    starsGained: number;
    pointsGained: number;
  } | null>(null);

  useEffect(() => {
    visitApparatus("beam");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startAttempt() {
    setAccuracies([]);
    setStepIndex(0);
    setPhase("playing");
  }

  function handleStepResolved(accuracy: number) {
    const next = [...accuracies, accuracy];
    if (next.length >= STEP_COUNT) {
      const { success, tier } = summarizeAttempt(next);
      const result = recordTrickResult({ trickId, success, tier });
      setOutcome(result);
      setPhase("result");
    } else {
      setAccuracies(next);
      setStepIndex(stepIndex + 1);
    }
  }

  return (
    <div className="minigame">
      <TrickPicker apparatusId="beam" selectedTrickId={trickId} onSelect={setTrickId} />

      <div className="minigame__stage">
        {phase === "ready" && (
          <div className="minigame__prompt">
            <p className="minigame__hint">Tap TAP! when Penelope reaches the middle!</p>
            <BigButton size="xl" variant="primary" onClick={startAttempt}>
              GO! ⭐
            </BigButton>
          </div>
        )}

        {phase === "playing" && (
          <MovingIndicator
            spawnKey={stepIndex}
            durationMs={STEP_DURATION_MS}
            axis="x"
            sweetCenter={0.5}
            tapLabel="TAP!"
            glyph="🤸"
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
