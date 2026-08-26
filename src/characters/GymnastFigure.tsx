import type { LeotardPattern } from "../data/types";
import { LeotardDecor } from "./leotardFill";
import { leotardFillRef } from "./leotardFillRef";
import "./GymnastFigure.css";

export type FigurePose = "idle" | "celebrate" | "wobble" | "cheer" | "wave" | "bow";

export interface GymnastFigureProps {
  uid: string;
  hairColor: string;
  skinTone: string;
  leotard: LeotardPattern;
  pose?: FigurePose;
  sparkleEyes?: boolean;
  eyeColor?: string;
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
  skinTone,
  leotard,
  pose = "idle",
  sparkleEyes = true,
  eyeColor = "#3d6fd6",
  className = "",
}: GymnastFigureProps) {
  const leoFill = leotardFillRef(leotard, uid);

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
