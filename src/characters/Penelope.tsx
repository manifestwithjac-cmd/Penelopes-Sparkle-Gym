import { useGameStore } from "../state/gameStore";
import { LEOTARDS_BY_ID } from "../data/leotards";
import { GymnastFigure, type FigurePose } from "./GymnastFigure";

const PENELOPE_HAIR = "#9c6b3e"; // light brown
const PENELOPE_SKIN = "#f4c9a0";

export function Penelope({
  pose = "idle",
  className,
}: {
  pose?: FigurePose;
  className?: string;
}) {
  const equippedLeotardId = useGameStore((s) => s.equippedLeotardId);
  const leotard = LEOTARDS_BY_ID[equippedLeotardId]?.pattern ?? { kind: "solid", color: "#ff5fae" };

  return (
    <GymnastFigure
      uid="penelope"
      hairColor={PENELOPE_HAIR}
      skinTone={PENELOPE_SKIN}
      leotard={leotard}
      pose={pose}
      eyeColor="#3d6fd6"
      sparkleEyes
      className={className}
    />
  );
}
