import type { LudoCharm, LudoSeatDef } from "../data/ludoSeats";

function starPoints(cx: number, cy: number, outer: number, inner: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(cx + Math.cos(a) * r).toFixed(2)},${(cy + Math.sin(a) * r).toFixed(2)}`);
  }
  return pts.join(" ");
}

/** The white charm stamped on each piece so little players can tell them apart without colors. */
export function LudoCharmGlyph({ charm, accent }: { charm: LudoCharm; accent: string }) {
  switch (charm) {
    case "bow":
      return (
        <g fill="#fff">
          <path d="M20 20 L10.5 13.5 Q9 20 10.5 26.5 Z" />
          <path d="M20 20 L29.5 13.5 Q31 20 29.5 26.5 Z" />
          <circle cx="20" cy="20" r="3" fill={accent} stroke="#fff" strokeWidth="1.4" />
        </g>
      );
    case "star":
      return <polygon points={starPoints(20, 20.6, 9.5, 4.1)} fill="#fff" />;
    case "flower":
      return (
        <g fill="#fff">
          {[0, 1, 2, 3, 4].map((i) => {
            const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
            return <circle key={i} cx={20 + Math.cos(a) * 5.2} cy={20 + Math.sin(a) * 5.2} r="3.7" />;
          })}
          <circle cx="20" cy="20" r="2.8" fill={accent} />
        </g>
      );
    case "crown":
      return (
        <g fill="#fff">
          <polygon points="11,25.5 10.5,14.5 15.6,19 20,11.5 24.4,19 29.5,14.5 29,25.5" strokeLinejoin="round" />
          <rect x="11" y="25" width="18" height="3" rx="1.2" />
        </g>
      );
  }
}

/** A glossy, sparkly game piece. Pure SVG so it stays crisp at any board size. */
export function LudoPiece({ seat }: { seat: LudoSeatDef }) {
  const gid = `ludo-piece-${seat.id}`;
  return (
    <svg viewBox="0 0 40 40" className="ludo-piece" aria-hidden="true">
      <defs>
        <radialGradient id={gid} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={seat.light} />
          <stop offset="45%" stopColor={seat.color} />
          <stop offset="100%" stopColor={seat.deep} />
        </radialGradient>
      </defs>
      <ellipse cx="20" cy="36.5" rx="12" ry="2.6" fill="rgba(80, 20, 90, 0.22)" />
      <circle cx="20" cy="20" r="16.5" fill={`url(#${gid})`} stroke="#fff" strokeWidth="2.6" />
      <LudoCharmGlyph charm={seat.charm} accent={seat.deep} />
      <ellipse cx="13.5" cy="11.5" rx="5" ry="2.8" fill="rgba(255,255,255,0.55)" transform="rotate(-30 13.5 11.5)" />
      <polygon points={starPoints(30, 9, 3.4, 1.1)} fill="#fff" className="ludo-piece__twinkle" />
    </svg>
  );
}
