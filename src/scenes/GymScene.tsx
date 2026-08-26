import { useRef, useState } from "react";
import { APPARATUS } from "../data/apparatus";
import { WORLD_ZONES } from "../data/worldZones";
import { FRIENDS } from "../data/friends";
import type { ApparatusId } from "../data/types";
import { useGameStore, type SceneId } from "../state/gameStore";
import { Penelope } from "../characters/Penelope";
import { StarCounter, PointCounter } from "../components/ui/Counters";
import { SoundToggle } from "../components/ui/SoundToggle";
import { ApparatusNavBar } from "../components/nav/ApparatusNavBar";
import { FriendSprite } from "../friends/FriendSprite";
import { FriendPopup } from "../friends/FriendPopup";
import "./GymScene.css";

const WALK_MS = 550;

export function GymScene() {
  const goToScene = useGameStore((s) => s.goToScene);
  const [penelopePos, setPenelopePos] = useState(0.1);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const walkTimeout = useRef<number | null>(null);

  function travelTo(worldPosition: number, scene: SceneId, param?: string) {
    setPenelopePos(worldPosition);

    // Bring the target roughly into view as Penelope "walks" there.
    const track = trackRef.current;
    if (track) {
      const targetLeft = worldPosition * track.scrollWidth - track.clientWidth / 2;
      track.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
    }

    if (walkTimeout.current) window.clearTimeout(walkTimeout.current);
    walkTimeout.current = window.setTimeout(() => {
      goToScene(scene, param ?? null);
    }, WALK_MS);
  }

  function goToApparatus(id: ApparatusId, worldPosition: number) {
    travelTo(worldPosition, `apparatus:${id}` as SceneId);
  }

  return (
    <div className="gym-scene">
      <header className="gym-scene__hud">
        <div className="gym-scene__hud-left">
          <StarCounter />
          <PointCounter />
        </div>
        <SoundToggle />
      </header>

      <div className="gym-scene__world touch-scroll" ref={trackRef}>
        <div className="gym-scene__track">
          {/* Ambient decor: big windows, mats, banners, trophy shelf, 67 wall */}
          <div className="gym-decor__window" style={{ left: "6%" }} />
          <div className="gym-decor__window" style={{ left: "34%" }} />
          <div className="gym-decor__window" style={{ left: "62%" }} />
          <div className="gym-decor__window" style={{ left: "88%" }} />
          <div className="gym-decor__banner" style={{ left: "16%" }}>
            SPARKLE GYM
          </div>
          <button
            className="gym-decor__trophy-shelf"
            style={{ left: "48%" }}
            onClick={() => goToScene("trophies")}
            aria-label="Trophy Wall"
          >
            🏆 🏆 🏆
          </button>
          <div className="gym-decor__wall-number" style={{ left: "78%" }} aria-hidden="true">
            67
          </div>
          {Array.from({ length: 10 }, (_, i) => (
            <span
              key={i}
              className="gym-decor__star"
              style={{ left: `${4 + i * 10}%`, top: `${(i % 3) * 22 + 6}%` }}
              aria-hidden="true"
            >
              {i % 2 === 0 ? "★" : "✦"}
            </span>
          ))}

          <div className="gym-scene__floor-mats" />

          {WORLD_ZONES.map((zone) => (
            <button
              key={zone.id}
              className={`gym-zone gym-zone--social ${zone.enabled ? "" : "gym-zone--soon"}`}
              style={{
                left: `${zone.worldPosition * 100}%`,
                background: `linear-gradient(160deg, ${zone.colorFrom}, ${zone.colorTo})`,
              }}
              onClick={() => zone.enabled && travelTo(zone.worldPosition, zone.id as SceneId)}
              disabled={!zone.enabled}
            >
              <span className="gym-zone__icon">{zone.icon}</span>
              <span className="gym-zone__label">{zone.name}</span>
              {!zone.enabled && <span className="gym-zone__soon">Coming soon!</span>}
            </button>
          ))}

          {APPARATUS.map((zone) => (
            <button
              key={zone.id}
              className="gym-zone"
              style={{
                left: `${zone.worldPosition * 100}%`,
                background: `linear-gradient(160deg, ${zone.colorFrom}, ${zone.colorTo})`,
              }}
              onClick={() => goToApparatus(zone.id, zone.worldPosition)}
            >
              <span className="gym-zone__icon">{zone.icon}</span>
              <span className="gym-zone__label">{zone.shortName}</span>
            </button>
          ))}

          {FRIENDS.map((friend) => (
            <FriendSprite
              key={friend.id}
              friend={friend}
              style={{ left: `${friend.worldPosition * 100}%`, top: "56%" }}
              onTap={() => setSelectedFriendId(friend.id)}
            />
          ))}

          <div
            className="gym-scene__penelope"
            style={{ left: `${penelopePos * 100}%`, transitionDuration: `${WALK_MS}ms` }}
          >
            <Penelope pose="idle" />
          </div>
        </div>
      </div>

      <ApparatusNavBar onSelect={goToApparatus} />

      {selectedFriendId && (
        <FriendPopup
          friend={FRIENDS.find((f) => f.id === selectedFriendId)!}
          onClose={() => setSelectedFriendId(null)}
        />
      )}
    </div>
  );
}
