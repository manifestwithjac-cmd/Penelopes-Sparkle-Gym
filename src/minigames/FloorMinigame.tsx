import { useEffect, useState } from "react";
import { useGameStore } from "../state/gameStore";
import { TRICKS_BY_ID } from "../data/tricks";
import { TrickPicker } from "./shared/TrickPicker";
import { TapTarget } from "./shared/TapTarget";
import { ResultPanel } from "./shared/ResultPanel";
import { SpiderCartwheelSequence } from "./SpiderCartwheelSequence";
import { BigButton } from "../components/ui/BigButton";
import { summarizeAttempt, type PerformanceTier } from "../utils/scoring";
import "./shared/minigame.css";
import "./FloorMinigame.css";

const STEP_COUNT = 3;
const STEP_DURATION_MS = 1300;

const STAR_SPOTS = [
  { x: 30, y: 35 },
  { x: 70, y: 45 },
  { x: 45, y: 60 },
];

type Phase = "ready" | "playing" | "result";

export function FloorMinigame() {
  const visitApparatus = useGameStore((s) => s.visitApparatus);
  const recordTrickResult = useGameStore((s) => s.recordTrickResult);

  const [trickId, setTrickId] = useState("cartwheel");
  const [phase, setPhase] = useState<Phase>("ready");
  const [stepIndex, setStepIndex] = useState(0);
  const [accuracies, setAccuracies] = useState<number[]>([]);
  const [outcome, setOutcome] = useState<{
    tier: PerformanceTier;
    starsGained: number;
    pointsGained: number;
  } | null>(null);

  useEffect(() => {
    visitApparatus("floor");
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

  const trick = TRICKS_BY_ID[trickId];
  const spot = STAR_SPOTS[stepIndex % STAR_SPOTS.length];

  return (
    <div className="minigame">
      <TrickPicker apparatusId="floor" selectedTrickId={trickId} onSelect={setTrickId} />

      {trickId === "spider_cartwheel" ? (
        <div className="minigame__stage">
          <SpiderCartwheelSequence />
        </div>
      ) : (
        <div className="minigame__stage">
          {phase === "ready" && (
            <div className="minigame__prompt">
              <p className="minigame__hint">Tap the stars as {trick?.name} happens!</p>
              <BigButton size="xl" variant="primary" onClick={startAttempt}>
                GO! 🤸
              </BigButton>
            </div>
          )}

          {phase === "playing" && (
            <div className={trickId === "helicopter_cartwheel" ? "floor-stage--helicopter" : ""}>
              <TapTarget
                spawnKey={stepIndex}
                durationMs={STEP_DURATION_MS}
                glyph={trick?.icon}
                x={spot.x}
                y={spot.y}
                onResolve={handleStepResolved}
              />
            </div>
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
      )}
    </div>
  );
}
