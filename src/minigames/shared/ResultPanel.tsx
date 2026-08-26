import { TIER_LABEL, randomEncouragement, type PerformanceTier } from "../../utils/scoring";
import { Penelope } from "../../characters/Penelope";
import { StarBurst } from "../../effects/StarBurst";
import { BigButton } from "../../components/ui/BigButton";
import "./ResultPanel.css";

interface ResultPanelProps {
  tier: PerformanceTier;
  starsGained: number;
  pointsGained: number;
  onRetry: () => void;
}

/** Shared post-attempt feedback used by every minigame — success or not,
 * this always ends with encouragement and a big friendly retry button
 * (spec §15: never a harsh "failed" state). */
export function ResultPanel({ tier, starsGained, pointsGained, onRetry }: ResultPanelProps) {
  const success = tier !== "try";

  return (
    <div className="result-panel">
      <div className="result-panel__figure">
        {success && <StarBurst triggerKey={`${tier}-${starsGained}`} big count={18} />}
        <Penelope pose={success ? "celebrate" : "wobble"} />
      </div>

      <p className="result-panel__label">{success ? TIER_LABEL[tier] : randomEncouragement()}</p>

      <div className="result-panel__rewards">
        <span className="result-panel__reward">⭐ +{starsGained}</span>
        <span className="result-panel__reward">🏅 +{pointsGained}</span>
      </div>

      <BigButton size="lg" variant="primary" onClick={onRetry}>
        {success ? "Try Again ✨" : "Try Again!"}
      </BigButton>
    </div>
  );
}
