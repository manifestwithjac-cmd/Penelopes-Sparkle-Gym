import { useCallback, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { RigRefs } from "../character/useCharacterRig";
import { applyPose, resolvePose, samplePoseAt, REST_RESOLVED, linear } from "./poseUtils";
import type { TrickAnimationDef, ResolvedPose, Easing } from "./types";

interface ResolvedKeyframe {
  t: number;
  pose: ResolvedPose;
  ease: Easing;
}

function resolveTrick(trick: TrickAnimationDef): ResolvedKeyframe[] {
  return trick.keyframes
    .slice()
    .sort((a, b) => a.t - b.t)
    .map((k) => ({ t: k.t, pose: resolvePose(k.pose), ease: k.ease ?? linear }));
}

/**
 * Drives one character rig through a keyframed trick animation over real
 * time via useFrame — imperative and allocation-light so it stays smooth
 * on mobile. When nothing is playing, the rig holds a gentle idle sway
 * instead of a dead T-pose.
 */
export function usePlayTrick(rig: RigRefs) {
  const playing = useRef<ResolvedKeyframe[] | null>(null);
  const startClock = useRef(0);
  const durationSec = useRef(1);
  const onCompleteRef = useRef<(() => void) | null>(null);
  const idlePhase = useRef(0);

  const play = useCallback((trick: TrickAnimationDef, onComplete?: () => void) => {
    playing.current = resolveTrick(trick);
    startClock.current = -1; // set on first frame so timing starts exactly at playback, not at call time
    durationSec.current = Math.max(0.05, trick.durationMs / 1000);
    onCompleteRef.current = onComplete ?? null;
  }, []);

  useFrame((state, delta) => {
    const kfs = playing.current;
    if (!kfs) {
      // idle: a slow, small breathing sway so she never looks frozen
      idlePhase.current += delta;
      const sway = Math.sin(idlePhase.current * 1.1) * 0.02;
      const pose: ResolvedPose = {
        ...REST_RESOLVED,
        torso: { ...REST_RESOLVED.torso, rz: sway * 0.4 },
        head: { ...REST_RESOLVED.head, ry: sway * 0.6 },
        root: { ...REST_RESOLVED.root, py: Math.abs(sway) * 0.15 },
      };
      applyPose(rig, pose);
      return;
    }

    if (startClock.current < 0) startClock.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - startClock.current;
    const t = elapsed / durationSec.current;

    applyPose(rig, samplePoseAt(kfs, t));

    if (t >= 1) {
      playing.current = null;
      const cb = onCompleteRef.current;
      onCompleteRef.current = null;
      if (cb) cb();
    }
  });

  const isPlaying = useCallback(() => playing.current !== null, []);

  return { play, isPlaying };
}
