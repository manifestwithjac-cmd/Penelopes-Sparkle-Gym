import { useEffect } from "react";
import { RiggedGymnastFigure } from "./RiggedGymnastFigure";
import { useCharacterRig2d } from "./useCharacterRig2d";
import { applyPose2D, resolvePose2D, samplePoseAt2D, linear2D } from "./poseUtils2d";
import { TRICKS_2D } from "./tricks";

/**
 * TEMPORARY debug-only harness for tuning cartwheel2d.ts's keyframe
 * numbers — renders the rigged figure frozen at an exact t (0..1) or
 * keyframe index instead of animating, so a screenshot shows precisely
 * one pose instead of an unpredictable mid-animation frame. Gated behind
 * ?figure-preview, never reachable in normal play.
 */
export function FigurePreview() {
  const rig = useCharacterRig2d();
  const params = new URLSearchParams(window.location.search);
  const trickId = params.get("trick") ?? "cartwheel";
  const t = Number(params.get("t") ?? "0");
  const anim = TRICKS_2D[trickId];

  useEffect(() => {
    if (!anim) return;
    if (params.has("kf")) {
      const kf = anim.keyframes[Number(params.get("kf"))];
      if (kf) applyPose2D(rig, resolvePose2D(kf.pose));
      return;
    }
    const resolved = anim.keyframes
      .slice()
      .sort((a, b) => a.t - b.t)
      .map((k) => ({ t: k.t, pose: resolvePose2D(k.pose), ease: k.ease ?? linear2D }));
    applyPose2D(rig, samplePoseAt2D(resolved, t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#e8e0f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "70vmin", height: "70vmin" }}>
        <RiggedGymnastFigure
          uid="preview"
          rig={rig}
          hairColor="#9c6b3e"
          skinTone="#f4c9a0"
          leotard={{ kind: "solid", color: "#ff5fae" }}
          eyeColor="#3d6fd6"
        />
      </div>
    </div>
  );
}

export default FigurePreview;
