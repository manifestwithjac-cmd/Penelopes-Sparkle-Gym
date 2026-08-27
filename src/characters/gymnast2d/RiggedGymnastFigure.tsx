import type { LeotardPattern } from "../../data/types";
import { leotardFillRef } from "../leotardFillRef";
import type { RigRefs2D } from "./useCharacterRig2d";
import "./RiggedGymnastFigure.css";

const MOTIF_EMOJI: Record<string, string> = {
  flower: "🌸",
  strawberry: "🍓",
  donut: "🍩",
  icecream: "🍦",
  milkshake: "🥤",
  cereal: "🥣",
  fruit: "🍇",
  butterfly: "🦋",
};

export interface RiggedGymnastFigureProps {
  uid: string;
  rig: RigRefs2D;
  hairColor: string;
  skinTone: string;
  leotard: LeotardPattern;
  eyeColor?: string;
  className?: string;
}

/** Leotard pattern decoration, positioned relative to the torso's own
 * local origin (the torso <g> is a rotating/translating group, so these
 * can't reuse leotardFill.tsx's absolute-viewBox coordinates as-is). */
function TorsoDecor({ pattern, uid }: { pattern: LeotardPattern; uid: string }) {
  if (pattern.kind === "gradient") {
    return (
      <defs>
        <linearGradient id={`leo2d-grad-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={pattern.from} />
          <stop offset="100%" stopColor={pattern.to} />
        </linearGradient>
      </defs>
    );
  }
  if (pattern.kind === "sparkle") {
    const dots: [number, number][] = [
      [-10, -4],
      [8, 6],
      [-4, 18],
      [4, -12],
    ];
    return (
      <g pointerEvents="none">
        {dots.map(([x, y], i) => (
          <path
            key={i}
            d="M0,-4 L1.2,-1.2 L4,0 L1.2,1.2 L0,4 L-1.2,1.2 L-4,0 L-1.2,-1.2 Z"
            fill={pattern.sparkle}
            transform={`translate(${x} ${y}) scale(${0.7 + (i % 2) * 0.3})`}
          />
        ))}
      </g>
    );
  }
  if (pattern.kind === "print") {
    const emoji = MOTIF_EMOJI[pattern.motif] ?? "✨";
    const spots: [number, number][] = [
      [-12, -6],
      [8, 0],
      [-2, 16],
    ];
    return (
      <g pointerEvents="none" fontSize="10">
        {spots.map(([x, y], i) => (
          <text key={i} x={x} y={y} textAnchor="middle">
            {emoji}
          </text>
        ))}
      </g>
    );
  }
  return null;
}

function leotardFill2D(pattern: LeotardPattern, uid: string): string {
  return pattern.kind === "gradient" ? `url(#leo2d-grad-${uid})` : leotardFillRef(pattern, uid);
}

/**
 * Full-body, articulated flat-cutout Penelope — same "chibi" art style as
 * the static portrait GymnastFigure.tsx (round head, big sparkle eyes,
 * same palette), but built from per-joint <g> groups so a keyframed trick
 * (see tricks/cartwheel2d.ts) can actually pose and move her through a
 * cartwheel instead of just swapping a static CSS pose class.
 */
export function RiggedGymnastFigure({
  uid,
  rig,
  hairColor,
  skinTone,
  leotard,
  eyeColor = "#3d6fd6",
  className = "",
}: RiggedGymnastFigureProps) {
  const leoFill = leotardFill2D(leotard, uid);

  return (
    <svg
      viewBox="-30 -10 160 170"
      className={`rigged-figure ${className}`}
      style={{ overflow: "visible" }}
      role="img"
      aria-label="Gymnast character"
    >
      <g ref={rig.root}>
        {/* Every joint is TWO nested <g>s: an outer one with a fixed,
            hand-authored `transform` placing its pivot point (never
            touched again), and an inner one holding the `ref` that
            usePlayTrick2d's applyPose2D drives every frame via
            setAttribute("transform", `rotate(...)`) — setAttribute
            REPLACES the whole attribute, so a pivot's placement and its
            pose rotation can never share one <g> or the pose write wipes
            the placement out. */}

        {/* torso / leotard (drawn first — legs need to paint OVER it for
            a high kick that swings up past hip height, arms need to
            paint over it for anything reaching across the chest) */}
        <g transform="translate(50 62)">
          <g ref={rig.torso}>
            <TorsoDecor pattern={leotard} uid={uid} />
            <path d="M-15,0 Q0,-10 15,0 L17,38 Q0,46 -17,38 Z" fill={leoFill} stroke="rgba(0,0,0,0.06)" />
          </g>
        </g>

        {/* legs (drawn after the torso — see above) */}
        <g transform="translate(43 98)">
          <g ref={rig.hipL}>
            <rect x="-5" y="0" width="10" height="17" rx="5" fill={skinTone} />
            <g transform="translate(0 17)">
              <g ref={rig.kneeL}>
                <rect x="-5" y="0" width="10" height="17" rx="5" fill={skinTone} />
                <ellipse cx="0" cy="17" rx="7" ry="4" fill="#ffffff" />
              </g>
            </g>
          </g>
        </g>
        <g transform="translate(57 98)">
          <g ref={rig.hipR}>
            <rect x="-5" y="0" width="10" height="17" rx="5" fill={skinTone} />
            <g transform="translate(0 17)">
              <g ref={rig.kneeR}>
                <rect x="-5" y="0" width="10" height="17" rx="5" fill={skinTone} />
                <ellipse cx="0" cy="17" rx="7" ry="4" fill="#ffffff" />
              </g>
            </g>
          </g>
        </g>

        {/* head (drawn BEFORE the arms — a raised/starfish arm needs to
            paint in front of her hair, not get swallowed by it; at rest
            the arms hang well below the head so this ordering makes no
            visual difference there) */}
        <g transform="translate(50 38)">
          <g ref={rig.head}>
            <circle cx="0" cy="0" r="26" fill={skinTone} />
            {/* hair (side strands, a little longer — falls past the jaw
                toward the shoulders instead of stopping at the head) —
                visible from both front and back, so outside the toggle. */}
            <rect x="-27" y="2" width="9" height="32" rx="4.5" fill={hairColor} />
            <rect x="18" y="2" width="9" height="32" rx="4.5" fill={hairColor} />

            {/* Front (face) and back (hair) of the head, toggled by
                applyPose2D based on root's current rotation — mid-spin,
                a cartwheel/somersault genuinely shows the back of her
                head partway through, not her face at every angle, which
                is what a single always-visible face art would do. */}
            <g className="head-front">
              <path
                d="M-28,-2 Q-30,-28 0,-28 Q30,-28 28,-2 Q28,10 22,12 Q26,-10 0,-14 Q-26,-10 -22,12 Q-28,10 -28,-2 Z"
                fill={hairColor}
              />
              <circle cx="-10" cy="2" r="4" fill={eyeColor} />
              <circle cx="10" cy="2" r="4" fill={eyeColor} />
              <circle cx="-8.5" cy="0.5" r="1.3" fill="#ffffff" />
              <circle cx="11.5" cy="0.5" r="1.3" fill="#ffffff" />
              <g fill="var(--purple-300, #b285ff)" opacity="0.85">
                <path d="M-16,-6 l1,3 3,1 -3,1 -1,3 -1,-3 -3,-1 3,-1 Z" />
                <path d="M12,-6 l1,3 3,1 -3,1 -1,3 -1,-3 -3,-1 3,-1 Z" />
              </g>
              <path d="M-7,10 Q0,15 7,10" stroke="#7a4a2b" strokeWidth="2" fill="none" strokeLinecap="round" />
              <circle cx="-16" cy="8" r="3.4" fill="#ff8cc6" opacity="0.55" />
              <circle cx="16" cy="8" r="3.4" fill="#ff8cc6" opacity="0.55" />
            </g>
            <g className="head-back" style={{ display: "none" }}>
              <circle cx="0" cy="0" r="26" fill={hairColor} />
              <path d="M0,-24 Q4,0 0,20" stroke="#000" strokeOpacity="0.12" strokeWidth="1.5" fill="none" />
              <path d="M-14,-18 Q-8,-2 -14,16" stroke="#000" strokeOpacity="0.08" strokeWidth="1.5" fill="none" />
              <path d="M14,-18 Q8,-2 14,16" stroke="#000" strokeOpacity="0.08" strokeWidth="1.5" fill="none" />
            </g>
          </g>
        </g>

        {/* arms (drawn on top of the torso AND the head) */}
        <g transform="translate(31 62)">
          <g ref={rig.shoulderL}>
            <rect x="-5" y="0" width="10" height="15" rx="5" fill={skinTone} />
            <g transform="translate(0 15)">
              <g ref={rig.elbowL}>
                <rect x="-5" y="0" width="10" height="15" rx="5" fill={skinTone} />
              </g>
            </g>
          </g>
        </g>
        <g transform="translate(69 62)">
          <g ref={rig.shoulderR}>
            <rect x="-5" y="0" width="10" height="15" rx="5" fill={skinTone} />
            <g transform="translate(0 15)">
              <g ref={rig.elbowR}>
                <rect x="-5" y="0" width="10" height="15" rx="5" fill={skinTone} />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
