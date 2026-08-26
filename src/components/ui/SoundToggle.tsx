import { useGameStore } from "../../state/gameStore";
import "./SoundToggle.css";

/** Persistent, always-reachable sound on/off control (spec §25). */
export function SoundToggle() {
  const soundOn = useGameStore((s) => s.soundOn);
  const toggleSound = useGameStore((s) => s.toggleSound);

  return (
    <button
      className="sound-toggle"
      onClick={toggleSound}
      aria-pressed={soundOn}
      aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
    >
      {soundOn ? "🔊" : "🔇"}
    </button>
  );
}
