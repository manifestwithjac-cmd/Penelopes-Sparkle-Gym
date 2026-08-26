import { useEffect, useRef, useState } from "react";
import { useGameStore } from "../state/gameStore";
import { useSceneBridge } from "../three/sceneBridge";
import { TRICKS_BY_ID } from "../data/tricks";
import { TapTarget } from "./shared/TapTarget";
import { ResultPanel } from "./shared/ResultPanel";
import { BigButton } from "../components/ui/BigButton";
import { summarizeAttempt, type PerformanceTier } from "../utils/scoring";
import "./shared/minigame.css";
import "./Floor3DTrick.css";

const TAP_DURATION_MS = 1400;

type Phase = "ready" | "waiting-tap" | "watching" | "result";

interface Outcome {
  tier: PerformanceTier;
  starsGained: number;
  pointsGained: number;
}

/**
 * Floor tricks that have a real 3D animation registered (see
 * three/animation/tricks) play through here instead of the generic 2D tap
 * engine: one timing tap, then the actual 3D cartwheel plays out in the
 * persistent scene behind this UI. Tap timing still drives the tier/
 * reward exactly like every other minigame (summarizeAttempt,
 * recordTrickResult — both unchanged), so save data, stars, and
 * challenges never know the difference.
 */
export function Floor3DTrick({ trickId }: { trickId: string }) {
  const recordTrickResult = useGameStore((s) => s.recordTrickResult);
  const requestTrick = useSceneBridge((s) => s.requestTrick);
  const setOnTrickResolved = useSceneBridge((s) => s.setOnTrickResolved);

  const [phase, setPhase] = useState<Phase>("ready");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const pendingNonce = useRef<number | null>(null);

  const trick = TRICKS_BY_ID[trickId];

  useEffect(() => {
    // If the player navigates away mid-animation, don't leave a stale
    // callback registered for the next Floor3DTrick instance to inherit.
    return () => setOnTrickResolved(null);
  }, [setOnTrickResolved]);

  function startAttempt() {
    setOutcome(null);
    setPhase("waiting-tap");
  }

  function handleTapResolved(accuracy: number) {
    const { success, tier } = summarizeAttempt([accuracy]);
    setPhase("watching");

    const nonce = requestTrick(trickId);
    pendingNonce.current = nonce;
    setOnTrickResolved((resolvedNonce) => {
      if (resolvedNonce !== pendingNonce.current) return;
      const result = recordTrickResult({ trickId, success, tier });
      setOutcome(result);
      setPhase("result");
    });
  }

  return (
    <div className="minigame">
      <div className="minigame__stage">
        {phase === "ready" && (
          <div className="minigame__prompt">
            <p className="minigame__hint">Tap when you're ready, then watch {trick?.name}!</p>
            <BigButton size="xl" variant="primary" onClick={startAttempt}>
              GO! 🤸
            </BigButton>
          </div>
        )}

        {phase === "waiting-tap" && (
          <TapTarget
            spawnKey={trickId}
            durationMs={TAP_DURATION_MS}
            glyph={trick?.icon}
            x={50}
            y={70}
            onResolve={handleTapResolved}
          />
        )}

        {/* "watching" is deliberately near-empty — the 3D scene behind
            this UI is doing the work, and the spec is explicit that UI
            must never obscure Penelope while she performs. */}
        {phase === "watching" && <p className="minigame__hint floor3d__watching">✨</p>}

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
