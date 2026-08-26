import { ACHIEVEMENTS } from "../data/achievements";
import { useGameStore } from "../state/gameStore";
import { StarCounter, PointCounter } from "../components/ui/Counters";
import { SoundToggle } from "../components/ui/SoundToggle";
import { BigButton } from "../components/ui/BigButton";
import "./TrophyScene.css";

export function TrophyScene() {
  const goToScene = useGameStore((s) => s.goToScene);
  const unlockedAchievementIds = useGameStore((s) => s.unlockedAchievementIds);
  const unlockedCount = unlockedAchievementIds.length;

  return (
    <div className="trophy-scene">
      <header className="trophy-scene__hud">
        <BigButton size="md" variant="ghost" icon="⬅️" onClick={() => goToScene("gym")}>
          Gym
        </BigButton>
        <div className="trophy-scene__hud-right">
          <StarCounter />
          <PointCounter />
          <SoundToggle />
        </div>
      </header>

      <h2 className="trophy-scene__title">🏆 Trophy Wall</h2>
      <p className="minigame__hint trophy-scene__hint">
        {unlockedCount} of {ACHIEVEMENTS.length} earned — keep going, there's always more!
      </p>

      <div className="trophy-scene__grid touch-scroll">
        {ACHIEVEMENTS.map((achievement) => {
          const unlocked = unlockedAchievementIds.includes(achievement.id);
          return (
            <div
              key={achievement.id}
              className={`trophy-card ${unlocked ? "trophy-card--unlocked" : ""}`}
            >
              <span className="trophy-card__icon">{unlocked ? achievement.icon : "🔒"}</span>
              <span className="trophy-card__name">{achievement.name}</span>
              <span className="trophy-card__desc">{achievement.description}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
