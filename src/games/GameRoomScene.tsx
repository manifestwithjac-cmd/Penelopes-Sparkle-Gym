import { useGameStore, type SceneId } from "../state/gameStore";
import { BigButton } from "../components/ui/BigButton";
import { SoundToggle } from "../components/ui/SoundToggle";
import { Penelope } from "../characters/Penelope";
import "./GameKit.css";
import "./GameRoomScene.css";

const GAMES: { id: SceneId; name: string; blurb: string; players: string; art: string; tone: string }[] = [
  { id: "ludo", name: "Sparkle Ludo", blurb: "Roll the dice and race your pieces to the podium.", players: "2 to 4 players", art: "🎲", tone: "pink" },
  { id: "match", name: "Sparkle Match", blurb: "Match the color or the number. Play every card to win!", players: "You vs. a friend", art: "🌈", tone: "purple" },
  { id: "war", name: "Sparkle War", blurb: "Flip your cards. The bigger number wins them all!", players: "You vs. a friend", art: "🃏", tone: "sky" },
];

/** The Game Room: one door to every board and card game. `showGymExit={false}` when it's the whole page. */
export function GameRoomScene({ showGymExit = true }: { showGymExit?: boolean }) {
  const goToScene = useGameStore((s) => s.goToScene);
  return (
    <div className="game-scene game-room">
      <header className="game-hud">
        {showGymExit ? (
          <BigButton size="md" variant="ghost" icon="⬅️" onClick={() => goToScene("gym")}>
            Gym
          </BigButton>
        ) : (
          <span className="game-room__spacer" />
        )}
        <h1 className="game-hud__title">
          Game <span>Room</span>
        </h1>
        <div className="game-hud__right">
          <SoundToggle />
        </div>
      </header>

      <div className="game-room__body">
        <div className="game-room__penelope" aria-hidden="true">
          <Penelope pose="wave" />
        </div>
        <p className="game-room__hello">Pick a game!</p>
        <div className="game-room__grid">
          {GAMES.map((g) => (
            <button key={g.id} type="button" className={`game-room__card game-room__card--${g.tone}`} onClick={() => goToScene(g.id)}>
              <span className="game-room__art" aria-hidden="true">
                {g.art}
              </span>
              <span className="game-room__name">{g.name}</span>
              <span className="game-room__blurb">{g.blurb}</span>
              <span className="game-room__players">{g.players}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
