import { useGameStore } from "../state/gameStore";
import { BigButton } from "../components/ui/BigButton";
import { Penelope } from "../characters/Penelope";
import { StarBurst } from "../effects/StarBurst";
import "./TitleScreen.css";

export function TitleScreen() {
  const markPlayed = useGameStore((s) => s.markPlayed);

  return (
    <div className="title-screen">
      <div className="title-screen__stars" aria-hidden="true">
        {Array.from({ length: 18 }, (_, i) => (
          <span
            key={i}
            className="title-screen__bg-star"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              animationDelay: `${(i % 6) * 0.4}s`,
              fontSize: `${10 + (i % 5) * 6}px`,
            }}
          >
            {i % 2 === 0 ? "★" : "✦"}
          </span>
        ))}
      </div>

      <div className="title-screen__penelope">
        <Penelope pose="celebrate" />
        <div className="title-screen__burst-anchor">
          <StarBurst triggerKey="title" count={10} />
        </div>
      </div>

      <h1 className="title-screen__title">
        Penelope's
        <br />
        Sparkle Gym
      </h1>

      <BigButton size="xl" variant="primary" onClick={markPlayed}>
        PLAY ✨
      </BigButton>
    </div>
  );
}
