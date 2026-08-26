import { useState } from "react";
import { useGameStore } from "../state/gameStore";
import { LEOTARDS_BY_ID } from "../data/leotards";
import { TRICKS_BY_ID } from "../data/tricks";
import { TRICKS_2D } from "../characters/gymnast2d/tricks";
import { RiggedGymnastFigure } from "../characters/gymnast2d/RiggedGymnastFigure";
import { useCharacterRig2d } from "../characters/gymnast2d/useCharacterRig2d";
import { usePlayTrick2d } from "../characters/gymnast2d/usePlayTrick2d";
import { TapTarget } from "./shared/TapTarget";
import { ResultPanel } from "./shared/ResultPanel";
import { BigButton } from "../components/ui/BigButton";
import { summarizeAttempt, type PerformanceTier } from "../utils/scoring";
import "./shared/minigame.css";
import "./Floor2DTrick.css";

const TAP_DURATION_MS = 1400;
const PENELOPE_HAIR = "#9c6b3e";
const PENELOPE_SKIN = "#f4c9a0";

type Phase = "ready" | "waiting-tap" | "watching" | "result";

interface Outcome {
  tier: PerformanceTier;
  starsGained: number;
  pointsGained: number;
}

/**
 * Floor tricks with a real flat-2D animation registered (see
 * characters/gymnast2d/tricks) play through here instead of the generic
 * 2D tap engine: one timing tap, then the actual animated cutout
 * cartwheel plays out right in this stage. Tap timing still drives the
 * tier/reward exactly like every other minigame, so save data, stars, and
 * challenges never know the difference — only the visualization changed.
 */
export function Floor2DTrick({ trickId }: { trickId: string }) {
  const recordTrickResult = useGameStore((s) => s.recordTrickResult);
  const equippedLeotardId = useGameStore((s) => s.equippedLeotardId);
  const leotard = LEOTARDS_BY_ID[equippedLeotardId]?.pattern ?? { kind: "solid" as const, color: "#ff5fae" };

  const rig = useCharacterRig2d();
  const { play } = usePlayTrick2d(rig);

  const [phase, setPhase] = useState<Phase>("ready");
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const trick = TRICKS_BY_ID[trickId];
  const anim = TRICKS_2D[trickId];

  function startAttempt() {
    setOutcome(null);
    setPhase("waiting-tap");
  }

  function handleTapResolved(accuracy: number) {
    const { success, tier } = summarizeAttempt([accuracy]);
    setPhase("watching");

    play(anim, () => {
      const result = recordTrickResult({ trickId, success, tier });
      setOutcome(result);
      setPhase("result");
    });
  }

  return (
    <div className="minigame">
      <div className="minigame__stage floor2d__stage">
        <div className="floor2d__figure">
          <RiggedGymnastFigure
            uid="penelope-floor"
            rig={rig}
            hairColor={PENELOPE_HAIR}
            skinTone={PENELOPE_SKIN}
            leotard={leotard}
            eyeColor="#3d6fd6"
          />
        </div>

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
