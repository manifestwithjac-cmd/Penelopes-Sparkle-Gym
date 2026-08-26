import type { FriendDef } from "../data/types";
import { GymnastFigure } from "../characters/GymnastFigure";
import "./FriendSprite.css";

export function FriendSprite({
  friend,
  onTap,
  style,
}: {
  friend: FriendDef;
  onTap: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button className="friend-sprite" style={style} onClick={onTap} aria-label={friend.name}>
      <div className="friend-sprite__figure">
        <GymnastFigure
          uid={`world-${friend.id}`}
          hairColor={friend.hairColor}
          skinTone={friend.skinTone}
          leotard={friend.outfitPattern}
          pose="wave"
        />
      </div>
      <span className="friend-sprite__name">{friend.name}</span>
    </button>
  );
}
