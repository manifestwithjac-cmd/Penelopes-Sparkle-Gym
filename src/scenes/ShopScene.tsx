import { LEOTARDS } from "../data/leotards";
import { useGameStore } from "../state/gameStore";
import { meetsRequirement } from "../state/unlocks";
import { StarCounter, PointCounter } from "../components/ui/Counters";
import { SoundToggle } from "../components/ui/SoundToggle";
import { BigButton } from "../components/ui/BigButton";
import { LeotardCard } from "../shop/LeotardCard";
import "./ShopScene.css";

export function ShopScene() {
  const goToScene = useGameStore((s) => s.goToScene);
  const stars = useGameStore((s) => s.stars);
  const trickStats = useGameStore((s) => s.trickStats);
  const unlockedAchievementIds = useGameStore((s) => s.unlockedAchievementIds);
  const equippedLeotardId = useGameStore((s) => s.equippedLeotardId);
  const equipLeotard = useGameStore((s) => s.equipLeotard);

  const ctx = { stars, trickStats, unlockedAchievementIds };

  return (
    <div className="shop-scene">
      <header className="shop-scene__hud">
        <BigButton size="md" variant="ghost" icon="⬅️" onClick={() => goToScene("gym")}>
          Gym
        </BigButton>
        <div className="shop-scene__hud-right">
          <StarCounter />
          <PointCounter />
          <SoundToggle />
        </div>
      </header>

      <h2 className="shop-scene__title">👗 Leotard Shop</h2>
      <p className="minigame__hint shop-scene__hint">Tap an unlocked leotard to wear it!</p>

      <div className="shop-scene__grid touch-scroll">
        {LEOTARDS.map((leotard) => (
          <LeotardCard
            key={leotard.id}
            leotard={leotard}
            unlocked={meetsRequirement(leotard.unlock, ctx)}
            equipped={leotard.id === equippedLeotardId}
            onSelect={() => equipLeotard(leotard.id)}
          />
        ))}
      </div>
    </div>
  );
}
