import { useState } from "react";
import { FRIENDS } from "../data/friends";
import { useGameStore } from "../state/gameStore";
import { GymnastFigure } from "../characters/GymnastFigure";
import { FriendPopup } from "../friends/FriendPopup";
import { StarCounter, PointCounter } from "../components/ui/Counters";
import { SoundToggle } from "../components/ui/SoundToggle";
import { BigButton } from "../components/ui/BigButton";
import "./LoungeScene.css";

export function LoungeScene() {
  const goToScene = useGameStore((s) => s.goToScene);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);

  return (
    <div className="lounge-scene">
      <header className="lounge-scene__hud">
        <BigButton size="md" variant="ghost" icon="⬅️" onClick={() => goToScene("gym")}>
          Gym
        </BigButton>
        <div className="lounge-scene__hud-right">
          <StarCounter />
          <PointCounter />
          <SoundToggle />
        </div>
      </header>

      <h2 className="lounge-scene__title">🛋️ Friends Lounge</h2>
      <p className="minigame__hint lounge-scene__hint">Tap a friend to hang out!</p>

      <div className="lounge-scene__rug">
        {FRIENDS.map((friend) => (
          <button
            key={friend.id}
            className="lounge-scene__friend"
            onClick={() => setSelectedFriendId(friend.id)}
          >
            <GymnastFigure
              uid={`lounge-${friend.id}`}
              hairColor={friend.hairColor}
              skinTone={friend.skinTone}
              leotard={friend.outfitPattern}
              pose="bow"
            />
            <span className="lounge-scene__friend-name">{friend.name}</span>
          </button>
        ))}
      </div>

      <div className="lounge-scene__footer">
        <BigButton size="md" variant="gold" icon="🏆" onClick={() => goToScene("trophies")}>
          See Achievements
        </BigButton>
      </div>

      {selectedFriendId && (
        <FriendPopup
          friend={FRIENDS.find((f) => f.id === selectedFriendId)!}
          onClose={() => setSelectedFriendId(null)}
        />
      )}
    </div>
  );
}
