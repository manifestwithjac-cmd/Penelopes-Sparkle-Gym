import type { LeotardPattern } from "../data/types";
import { LeotardDecor } from "./leotardFill";
import { leotardFillRef } from "./leotardFillRef";
import "./GymnastFigure.css";

export type FigurePose = "idle" | "celebrate" | "wobble" | "cheer" | "wave" | "bow";

export interface GymnastFigureProps {
  uid: string;
  hairColor: string;
  /** Optional thin highlight streaks over the base hair color. */
  hairHighlightColor?: string;
  skinTone: string;
  leotard: LeotardPattern;
  pose?: FigurePose;
  sparkleEyes?: boolean;
  eyeColor?: string;
  /** Optional black knee brace on this leg — the character's own
   * anatomical side, so it's mirrored on screen ("left" renders on the
   * viewer's right). */
  kneeBrace?: "left" | "right";
  /** Optional pair of underarm crutches, one on each side. */
  crutches?: boolean;
  className?: string;
}

/**
 * Shared chibi-style gymnast SVG used for Penelope and her friends.
 * Deliberately simple flat-vector "placeholder" art (see spec §32) — swap
 * for real illustration later without touching any gameplay code, since
 * nothing reads pixels from this component.
 */
export function GymnastFigure({
  uid,
  hairColor,
  hairHighlightColor,
  skinTone,
  leotard,
  pose = "idle",
  sparkleEyes = true,
  eyeColor = "#3d6fd6",
  kneeBrace,
  crutches = false,
  className = "",
}: GymnastFigureProps) {
  const leoFill = leotardFillRef(leotard, uid);
  // Figure faces the viewer, so her own left leg — anatomically — sits on
  // the viewer's right (the x=52 leg below), mirrored like looking in a
  // mirror at yourself.
  const braceX = kneeBrace === "left" ? 49 : kneeBrace === "right" ? 35 : null;

  return (
    <svg
      viewBox="0 0 100 140"
      className={`gymnast-figure pose-${pose} ${className}`}
      role="img"
      aria-label="Gymnast character"
    >
      <LeotardDecor pattern={leotard} uid={uid} />

      {/* legs */}
      <g className="fig-legs">
        <rect x="38" y="98" width="10" height="34" rx="5" fill={skinTone} />
        <rect x="52" y="98" width="10" height="34" rx="5" fill={skinTone} />
        <ellipse cx="43" cy="133" rx="7" ry="4" fill="#ffffff" />
        <ellipse cx="57" cy="133" rx="7" ry="4" fill="#ffffff" />
      </g>

      {/* body / leotard */}
      <g className="fig-body">
        <path
          d="M35,62 Q50,52 65,62 L67,100 Q50,108 33,100 Z"
          fill={leoFill}
          stroke="rgba(0,0,0,0.06)"
        />
      </g>

      {/* knee brace — almost the full leg, like a post-surgery
          immobilizer, drawn over the leotard's lower hem so it isn't cut
          off where the two overlap near the hip. */}
      {braceX !== null && (
        <g className="fig-knee-brace">
          <rect x={braceX} y="97" width="16" height="33" rx="6" fill="#181818" />
          <rect x={braceX - 1} y="103" width="18" height="3.5" rx="1.5" fill="#3d3d3d" />
          <rect x={braceX - 1} y="123" width="18" height="3.5" rx="1.5" fill="#3d3d3d" />
          <circle cx={braceX + 8} cy="113" r="3.4" fill="#8a8a8a" stroke="#555" strokeWidth="1" />
        </g>
      )}

      {/* crutches — one on each side, drawn before the arms so her hands
          paint over the handgrips (looks like she's actually holding
          them) while the underarm bars and shafts stay fully visible. */}
      {crutches && (
        <g className="fig-crutches">
          {/* left */}
          <rect x="10" y="59" width="16" height="5" rx="2.5" fill="#b8b8bd" />
          <rect x="15.5" y="59" width="5" height="76" rx="2.5" fill="#dcdce0" />
          <rect x="10" y="89" width="16" height="5" rx="2.5" fill="#e8a6c8" />
          {/* right */}
          <rect x="74" y="59" width="16" height="5" rx="2.5" fill="#b8b8bd" />
          <rect x="79.5" y="59" width="5" height="76" rx="2.5" fill="#dcdce0" />
          <rect x="74" y="89" width="16" height="5" rx="2.5" fill="#e8a6c8" />
        </g>
      )}

      {/* arms */}
      <g className="fig-arm fig-arm-left">
        <rect x="26" y="62" width="10" height="30" rx="5" fill={skinTone} />
      </g>
      <g className="fig-arm fig-arm-right">
        <rect x="64" y="62" width="10" height="30" rx="5" fill={skinTone} />
      </g>

      {/* head */}
      <g className="fig-head">
        <circle cx="50" cy="38" r="26" fill={skinTone} />
        {/* hair (back) */}
        <path
          d="M22,36 Q20,10 50,10 Q80,10 78,36 Q78,48 72,50 Q76,28 50,24 Q24,28 28,50 Q22,48 22,36 Z"
          fill={hairColor}
        />
        {/* hair (side strands, a little longer — falls past the jaw
            toward the shoulders instead of stopping at the head) */}
        <rect x="23" y="40" width="9" height="32" rx="4.5" fill={hairColor} />
        <rect x="68" y="40" width="9" height="32" rx="4.5" fill={hairColor} />
        {/* optional lighter streaks through the hair */}
        {hairHighlightColor && (
          <g fill={hairHighlightColor} opacity="0.9">
            <path d="M32,13 Q29,30 32,49 Q27,30 29,12 Z" />
            <path d="M64,12 Q68,28 65,47 Q70,28 67,11 Z" />
          </g>
        )}
        {/* face */}
        <circle cx="40" cy="40" r="4" fill={eyeColor} />
        <circle cx="60" cy="40" r="4" fill={eyeColor} />
        <circle cx="41.5" cy="38.5" r="1.3" fill="#ffffff" />
        <circle cx="61.5" cy="38.5" r="1.3" fill="#ffffff" />
        {sparkleEyes && (
          <g fill="var(--purple-300, #b285ff)" opacity="0.85">
            <path d="M34,32 l1,3 3,1 -3,1 -1,3 -1,-3 -3,-1 3,-1 Z" />
            <path d="M62,32 l1,3 3,1 -3,1 -1,3 -1,-3 -3,-1 3,-1 Z" />
          </g>
        )}
        <path d="M43,48 Q50,53 57,48" stroke="#7a4a2b" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="34" cy="46" r="3.4" fill="#ff8cc6" opacity="0.55" />
        <circle cx="66" cy="46" r="3.4" fill="#ff8cc6" opacity="0.55" />
      </g>
    </svg>
  );
}
