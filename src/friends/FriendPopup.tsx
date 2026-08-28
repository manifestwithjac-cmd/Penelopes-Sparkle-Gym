import { useMemo, useState } from "react";
import type { FriendDef } from "../data/types";
import { CHALLENGES } from "../data/challenges";
import { useGameStore } from "../state/gameStore";
import { GymnastFigure } from "../characters/GymnastFigure";
import { Penelope } from "../characters/Penelope";
import { BigButton } from "../components/ui/BigButton";
import { StarBurst } from "../effects/StarBurst";
import "./FriendPopup.css";

/** Deterministic-enough pick that still varies by friend + session moment,
 * without relying on Math.random() at render time (keeps re-renders from
 * changing the line mid-conversation). */
function pickLine(lines: string[], seed: number): string {
  return lines[seed % lines.length];
}

export function FriendPopup({ friend, onClose }: { friend: FriendDef; onClose: () => void }) {
  const completedChallengeIds = useGameStore((s) => s.completedChallengeIds);
  const companionFriendId = useGameStore((s) => s.companionFriendId);
  const setCompanionFriend = useGameStore((s) => s.setCompanionFriend);
  const [highFived, setHighFived] = useState(false);
  const [seed] = useState(() => Math.floor(Math.random() * 1000));
  const isCompanion = companionFriendId === friend.id;

  const friendChallenges = useMemo(
    () => CHALLENGES.filter((c) => c.friendId === friend.id),
    [friend.id],
  );
  const activeChallenge = friendChallenges.find((c) => !completedChallengeIds.includes(c.id));
  const allDone = friendChallenges.length > 0 && !activeChallenge;

  const speech = activeChallenge
    ? pickLine(friend.challengeLines, seed)
    : allDone
      ? pickLine(friend.cheerLines, seed)
      : pickLine(friend.greetings, seed);

  function handleHighFive() {
    setHighFived(true);
    window.setTimeout(() => setHighFived(false), 900);
  }

  return (
    <div className="friend-popup-layer" onClick={onClose}>
      <div className="friend-popup" onClick={(e) => e.stopPropagation()}>
        <button className="friend-popup__close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="friend-popup__stage">
          {highFived && <StarBurst triggerKey={`hi5-${friend.id}`} count={14} />}
          <div className="friend-popup__figure">
            <GymnastFigure
              uid={`popup-${friend.id}`}
              hairColor={friend.hairColor}
              hairHighlightColor={friend.hairHighlightColor}
              skinTone={friend.skinTone}
              leotard={friend.outfitPattern}
              kneeBrace={friend.kneeBrace}
              crutches={friend.crutches}
              pose={highFived ? "cheer" : "wave"}
            />
          </div>
          <div className="friend-popup__figure friend-popup__figure--penelope">
            <Penelope pose={highFived ? "celebrate" : "idle"} />
          </div>
        </div>

        <div className="friend-popup__bubble">
          <p>{speech}</p>
        </div>

        {activeChallenge && (
          <div className="friend-popup__challenge">
            <span>{activeChallenge.prompt}</span>
            <span className="friend-popup__reward">⭐ +{activeChallenge.starReward}</span>
          </div>
        )}
        {allDone && <p className="friend-popup__done">All caught up! 🎉</p>}

        <div className="friend-popup__actions">
          <BigButton size="lg" variant="gold" onClick={handleHighFive}>
            High Five! ✋
          </BigButton>
          <BigButton
            size="lg"
            variant={isCompanion ? "secondary" : "primary"}
            icon={isCompanion ? "🏠" : "🤸"}
            onClick={() => setCompanionFriend(friend.id)}
          >
            {isCompanion ? "Send Home" : "Bring to Gym"}
          </BigButton>
        </div>
      </div>
    </div>
  );
}
