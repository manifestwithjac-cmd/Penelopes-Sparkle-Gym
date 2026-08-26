import { useEffect, useState } from "react";
import { useGameStore } from "../state/gameStore";
import { TrickPicker } from "./shared/TrickPicker";
import { TapTarget } from "./shared/TapTarget";
import { ResultPanel } from "./shared/ResultPanel";
import { BigButton } from "../components/ui/BigButton";
import { summarizeAttempt, type PerformanceTier } from "../utils/scoring";
import "./shared/minigame.css";
import "./VaultMinigame.css";

const BASIC_STEPS = [
  { label: "RUN!", glyph: "🏃" },
  { label: "JUMP!", glyph: "🦘" },
];

const FULL_STEPS = [
  { label: "RUN!", glyph: "🏃" },
  { label: "JUMP!", glyph: "🦘" },
  { label: "HANDSTAND!", glyph: "🤾" },
  { label: "FLAT BACK!", glyph: "🛟" },
];

const STEP_DURATION_MS = 1200;

type Phase = "ready" | "playing" | "result";

export function VaultMinigame() {
  const visitApparatus = useGameStore((s) => s.visitApparatus);
  const recordTrickResult = useGameStore((s) => s.recordTrickResult);

  const [trickId, setTrickId] = useState("vault_jump");
  const [phase, setPhase] = useState<Phase>("ready");
  const [stepIndex, setStepIndex] = useState(0);
  const [accuracies, setAccuracies] = useState<number[]>([]);
  const [outcome, setOutcome] = useState<{
    tier: PerformanceTier;
    starsGained: number;
    pointsGained: number;
  } | null>(null);

  useEffect(() => {
    visitApparatus("vault");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = trickId === "handstand_flat_back" ? FULL_STEPS : BASIC_STEPS;

  function startAttempt() {
    setAccuracies([]);
    setStepIndex(0);
    setPhase("playing");
  }

  function handleStepResolved(accuracy: number) {
    const next = [...accuracies, accuracy];
    if (next.length >= steps.length) {
      const { success, tier } = summarizeAttempt(next);
      const result = recordTrickResult({ trickId, success, tier });
      setOutcome(result);
      setPhase("result");
    } else {
      setAccuracies(next);
      setStepIndex(stepIndex + 1);
    }
  }

  const step = steps[stepIndex];

  return (
    <div className="minigame">
      <TrickPicker apparatusId="vault" selectedTrickId={trickId} onSelect={setTrickId} />

      <div className="minigame__stage vault-stage">
        <div className="vault-stage__pit" aria-hidden="true" />

        {phase === "ready" && (
          <div className="minigame__prompt">
            <p className="minigame__hint">
              {steps.map((s) => s.label).join(" → ")}
            </p>
            <BigButton size="xl" variant="primary" onClick={startAttempt}>
              GO! 🏆
            </BigButton>
          </div>
        )}

        {phase === "playing" && (
          <>
            <p className="vault-stage__step-label">{step.label}</p>
            <TapTarget
              spawnKey={stepIndex}
              durationMs={STEP_DURATION_MS}
              glyph={step.glyph}
              x={50}
              y={55}
              onResolve={handleStepResolved}
            />
          </>
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
