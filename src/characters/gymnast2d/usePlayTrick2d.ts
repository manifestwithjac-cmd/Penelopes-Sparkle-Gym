import { useCallback, useEffect, useRef } from "react";
import { applyPose2D, resolvePose2D, samplePoseAt2D, REST_RESOLVED_2D, linear2D } from "./poseUtils2d";
import type { ResolvedPose2D, Easing2D, TrickAnimationDef2D } from "./poseUtils2d";
import type { RigRefs2D } from "./useCharacterRig2d";

interface ResolvedKeyframe2D {
  t: number;
  pose: ResolvedPose2D;
  ease: Easing2D;
}

function resolveTrick2D(trick: TrickAnimationDef2D): ResolvedKeyframe2D[] {
  return trick.keyframes
    .slice()
    .sort((a, b) => a.t - b.t)
    .map((k) => ({ t: k.t, pose: resolvePose2D(k.pose), ease: k.ease ?? linear2D }));
}

/**
 * Drives one flat 2D character rig through a keyframed trick animation
 * over real time via requestAnimationFrame — the DOM/SVG equivalent of
 * three/animation/usePlayTrick.ts's useFrame loop, since there's no R3F
 * render loop outside the 3D canvas to piggyback on here. When nothing is
 * playing, the rig holds a gentle idle sway instead of a dead stand.
 */
export function usePlayTrick2d(rig: RigRefs2D) {
  const playing = useRef<ResolvedKeyframe2D[] | null>(null);
  const startTime = useRef(0);
  const durationSec = useRef(1);
  const onCompleteRef = useRef<(() => void) | null>(null);
  const idlePhase = useRef(0);
  const lastTime = useRef(0);
  const rafId = useRef(0);

  const play = useCallback((trick: TrickAnimationDef2D, onComplete?: () => void) => {
    playing.current = resolveTrick2D(trick);
    startTime.current = -1; // set on first frame so timing starts exactly at playback, not at call time
    durationSec.current = Math.max(0.05, trick.durationMs / 1000);
    onCompleteRef.current = onComplete ?? null;
  }, []);

  useEffect(() => {
    lastTime.current = performance.now();

    function tick(now: number) {
      const delta = Math.min(0.1, (now - lastTime.current) / 1000);
      lastTime.current = now;

      const kfs = playing.current;
      if (!kfs) {
        idlePhase.current += delta;
        const sway = Math.sin(idlePhase.current * 1.1) * 2.5;
        const pose: ResolvedPose2D = {
          ...REST_RESOLVED_2D,
          torso: { ...REST_RESOLVED_2D.torso, rot: sway * 0.4 },
          head: { ...REST_RESOLVED_2D.head, rot: sway * 0.6 },
          root: { ...REST_RESOLVED_2D.root, y: -Math.abs(sway) * 0.1 },
        };
        applyPose2D(rig, pose);
      } else {
        if (startTime.current < 0) startTime.current = now / 1000;
        const elapsed = now / 1000 - startTime.current;
        const t = elapsed / durationSec.current;

        applyPose2D(rig, samplePoseAt2D(kfs, t));

        if (t >= 1) {
          playing.current = null;
          const cb = onCompleteRef.current;
          onCompleteRef.current = null;
          if (cb) cb();
        }
      }

      rafId.current = requestAnimationFrame(tick);
    }

    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPlaying = useCallback(() => playing.current !== null, []);

  return { play, isPlaying };
}
