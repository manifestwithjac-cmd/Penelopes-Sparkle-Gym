import { useState } from "react";
import { useGameStore } from "../state/gameStore";
import { Penelope } from "../characters/Penelope";
import { TapTarget } from "./shared/TapTarget";
import { ResultPanel } from "./shared/ResultPanel";
import { StarBurst } from "../effects/StarBurst";
import { SpiderwebBurst } from "../effects/SpiderwebBurst";
import { BigButton } from "../components/ui/BigButton";
import { summarizeAttempt, type PerformanceTier } from "../utils/scoring";
import "./SpiderCartwheelSequence.css";

const STAGES = [
  { id: "twist", label: "Twist your feet!", glyph: "🌀", animClass: "spider-anim-twist" },
  { id: "cartwheel1", label: "Cartwheel!", glyph: "🤸", animClass: "spider-anim-cartwheel" },
  { id: "cartwheel2", label: "Cartwheel again!", glyph: "🤸", animClass: "spider-anim-cartwheel" },
  { id: "spin", label: "Big spin!", glyph: "✨", animClass: "spider-anim-spin" },
];

const STAGE_DURATION_MS = 1200;
const ANIM_SETTLE_MS = 650;

type Phase = "intro" | "stage" | "finale" | "result";

/**
 * Penelope's own invented trick, and the game's one deliberately premium
 * set-piece (spec §11): twisted feet -> cartwheel -> cartwheel -> spin,
 * then a pink+purple star burst with a cute (non-scary) spiderweb
 * flourish. Swapped in by FloorMinigame in place of the generic tap
 * engine whenever "spider_cartwheel" is selected.
 */
export function SpiderCartwheelSequence() {
  const recordTrickResult = useGameStore((s) => s.recordTrickResult);

  const [phase, setPhase] = useState<Phase>("intro");
  const [stageIndex, setStageIndex] = useState(0);
  const [animClass, setAnimClass] = useState("");
  const [animKey, setAnimKey] = useState(0);
  const [accuracies, setAccuracies] = useState<number[]>([]);
  const [outcome, setOutcome] = useState<{
    tier: PerformanceTier;
    starsGained: number;
    pointsGained: number;
  } | null>(null);

  function start() {
    setAccuracies([]);
    setStageIndex(0);
    setAnimClass("");
    setPhase("stage");
  }

  function handleStageResolved(accuracy: number) {
    const stage = STAGES[stageIndex];
    const nextAccuracies = [...accuracies, accuracy];
    setAnimClass(stage.animClass);
    setAnimKey((k) => k + 1);

    window.setTimeout(() => {
      if (stageIndex + 1 >= STAGES.length) {
        const { success, tier } = summarizeAttempt(nextAccuracies);
        const result = recordTrickResult({ trickId: "spider_cartwheel", success, tier });
        setOutcome(result);
        setAnimClass("");
        setPhase("finale");
        window.setTimeout(() => setPhase("result"), 1700);
      } else {
        setAccuracies(nextAccuracies);
        setStageIndex((i) => i + 1);
        setAnimClass("");
      }
    }, ANIM_SETTLE_MS);
  }

  const stage = STAGES[stageIndex];

  return (
    <div className="spider-sequence">
      {phase === "intro" && (
        <div className="minigame__prompt">
          <p className="spider-sequence__intro-label">🕸️ Spider Cartwheel 🕸️</p>
          <p className="minigame__hint">Twisted feet → Cartwheel → Cartwheel → Big Spin!</p>
          <BigButton size="xl" variant="secondary" onClick={start}>
            GO! 🕸️
          </BigButton>
        </div>
      )}

      {(phase === "stage" || phase === "finale") && (
        <div className="spider-sequence__figure-area">
          {phase === "finale" && (
            <>
              <SpiderwebBurst />
              <StarBurst triggerKey="spider-finale" count={26} big />
            </>
          )}
          <div key={animKey} className={`spider-sequence__penelope ${animClass}`}>
            <Penelope pose={phase === "finale" ? "celebrate" : "idle"} />
          </div>
          {phase === "finale" && <p className="spider-sequence__finale-label">SPARKLE PERFECT!</p>}
        </div>
      )}

      {phase === "stage" && (
        <>
          <p className="spider-sequence__step-label">{stage.label}</p>
          <TapTarget
            spawnKey={stageIndex}
            durationMs={STAGE_DURATION_MS}
            glyph={stage.glyph}
            x={50}
            y={78}
            onResolve={handleStageResolved}
          />
        </>
      )}

      {phase === "result" && outcome && (
        <ResultPanel
          tier={outcome.tier}
          starsGained={outcome.starsGained}
          pointsGained={outcome.pointsGained}
          onRetry={start}
        />
      )}
    </div>
  );
}
