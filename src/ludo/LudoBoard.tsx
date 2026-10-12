import { useEffect, useState } from "react";
import { LUDO_SEATS, LUDO_SEATS_BY_ID, type LudoSeatId } from "../data/ludoSeats";
import { StarBurst } from "../effects/StarBurst";
import { LudoPiece } from "./LudoPiece";
import {
  BASE_CENTER,
  GRID,
  HOME_LANE,
  LOOP,
  START_ARROW_DEG,
  START_OFFSET,
  piecePoint,
} from "./ludoRules";
import { activeSeats, useLudoStore } from "./ludoStore";

const pct = (n: number) => `${(n / GRID) * 100}%`;

const PIPS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 26], [72, 26], [28, 50], [72, 50], [28, 74], [72, 74]],
};

/** Deterministic sprinkle of sparkles across the mat (same every load). */
const SPARKLES = (() => {
  let seed = 7;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  return Array.from({ length: 46 }, (_, i) => ({
    id: i,
    x: 0.3 + rand() * 12.4,
    y: 0.3 + rand() * 12.4,
    r: 0.05 + rand() * 0.09,
    delay: rand() * 3,
  }));
})();

function StaticBoard({ active }: { active: Set<LudoSeatId> }) {
  const loopPath = `M ${LOOP.map(([c, r]) => `${c + 0.5} ${r + 0.5}`).join(" L ")} Z`;
  const startCells = new Map(LUDO_SEATS.map((s) => [START_OFFSET[s.id], s]));

  return (
    <svg viewBox={`0 0 ${GRID} ${GRID}`} className="ludo-board__art" aria-hidden="true">
      <defs>
        <radialGradient id="ludo-mat" cx="50%" cy="45%" r="70%">
          <stop offset="0%" stopColor="#fff7fc" />
          <stop offset="70%" stopColor="#ffe6f3" />
          <stop offset="100%" stopColor="#f7d7f5" />
        </radialGradient>
        <radialGradient id="ludo-podium" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ffd3ea" />
        </radialGradient>
        <path id="ludo-podium-ring" d="M 6.5 5.38 a 1.12 1.12 0 1 1 -0.001 0" />
      </defs>

      <rect x="0.04" y="0.04" width={GRID - 0.08} height={GRID - 0.08} rx="0.9" fill="url(#ludo-mat)" />
      <rect
        x="0.12"
        y="0.12"
        width={GRID - 0.24}
        height={GRID - 0.24}
        rx="0.8"
        fill="none"
        stroke="#ffb3d9"
        strokeWidth="0.05"
        strokeDasharray="0.08 0.16"
      />

      {SPARKLES.map((s) => (
        <circle
          key={s.id}
          cx={s.x}
          cy={s.y}
          r={s.r}
          className="ludo-board__sparkle"
          style={{ animationDelay: `${s.delay}s` }}
        />
      ))}

      {/* The tumbling track: one ribbon under the loop, one beam up each home lane. */}
      <path d={loopPath} fill="none" stroke="#ffd9ec" strokeWidth="0.5" strokeLinejoin="round" />
      {LUDO_SEATS.map((seat) => {
        const lane = HOME_LANE[seat.id];
        const entry = LOOP[(START_OFFSET[seat.id] + 46) % LOOP.length];
        const last = lane[lane.length - 1];
        return (
          <line
            key={seat.id}
            x1={entry[0] + 0.5}
            y1={entry[1] + 0.5}
            x2={last[0] + 0.5}
            y2={last[1] + 0.5}
            stroke={seat.light}
            strokeWidth="0.5"
            strokeLinecap="round"
            opacity={active.has(seat.id) ? 1 : 0.35}
          />
        );
      })}

      {LOOP.map(([c, r], i) => {
        const startSeat = startCells.get(i);
        if (startSeat) {
          return (
            <g key={i} transform={`translate(${c + 0.5} ${r + 0.5})`}>
              <circle r="0.4" fill="#fff" stroke={startSeat.color} strokeWidth="0.08" />
              <g transform={`rotate(${START_ARROW_DEG[startSeat.id]})`} stroke={startSeat.color} strokeWidth="0.08" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <line x1="-0.2" y1="0" x2="0.2" y2="0" />
                <polyline points="0.04,-0.15 0.2,0 0.04,0.15" />
              </g>
            </g>
          );
        }
        return (
          <circle key={i} cx={c + 0.5} cy={r + 0.5} r="0.38" fill="#fff" stroke="#ffb3d9" strokeWidth="0.05" />
        );
      })}

      {LUDO_SEATS.map((seat) =>
        HOME_LANE[seat.id].map(([c, r], i) => (
          <g key={`${seat.id}-${i}`} opacity={active.has(seat.id) ? 1 : 0.35}>
            <circle cx={c + 0.5} cy={r + 0.5} r="0.38" fill={seat.color} stroke="#fff" strokeWidth="0.06" />
            <circle cx={c + 0.38} cy={r + 0.38} r="0.1" fill="#fff" opacity="0.7" />
          </g>
        )),
      )}

      {LUDO_SEATS.map((seat) => {
        const [cx, cy] = BASE_CENTER[seat.id];
        return (
          <g key={seat.id} opacity={active.has(seat.id) ? 1 : 0.3}>
            <circle cx={cx} cy={cy} r="1.78" fill={seat.light} />
            <circle cx={cx} cy={cy} r="1.58" fill={seat.color} stroke="#fff" strokeWidth="0.09" />
            {[-0.62, 0.62].flatMap((dx) =>
              [-0.62, 0.62].map((dy) => (
                <circle key={`${dx}${dy}`} cx={cx + dx} cy={cy + dy} r="0.4" fill={seat.deep} opacity="0.45" />
              )),
            )}
          </g>
        );
      })}

      <circle cx="6.5" cy="6.5" r="1.42" fill="url(#ludo-podium)" stroke="#ff8cc6" strokeWidth="0.06" />
      <text className="ludo-board__ring-text">
        <textPath href="#ludo-podium-ring" startOffset="0">
          ✦ TAP TO ROLL ✦ TAP TO ROLL ✦ TAP TO ROLL
        </textPath>
      </text>
    </svg>
  );
}

function LudoDie() {
  const dice = useLudoStore((s) => s.dice);
  const phase = useLudoStore((s) => s.phase);
  const turn = useLudoStore((s) => s.turn);
  const kind = useLudoStore((s) => s.kinds[s.turn]);
  const name = useLudoStore((s) => s.names[s.turn]);
  const rollCount = useLudoStore((s) => s.rollCount);
  const roll = useLudoStore((s) => s.roll);
  const [flicker, setFlicker] = useState(dice);

  const rolling = phase === "rolling";
  useEffect(() => {
    if (!rolling) return;
    const id = window.setInterval(() => setFlicker(1 + Math.floor(Math.random() * 6)), 90);
    return () => window.clearInterval(id);
  }, [rolling]);

  const seat = LUDO_SEATS_BY_ID[turn];
  const canRoll = phase === "roll" && kind === "kid";
  const face = rolling ? flicker : dice;

  return (
    <button
      type="button"
      className={`ludo-die ${canRoll ? "ludo-die--ready" : ""} ${rolling ? "ludo-die--rolling" : ""}`}
      style={{ "--seat": seat.color, "--seat-deep": seat.deep, "--seat-light": seat.light } as React.CSSProperties}
      onClick={roll}
      disabled={!canRoll}
      aria-label={canRoll ? `Roll the dice for ${name}` : `Dice shows ${dice}`}
    >
      <span className="ludo-die__cube" key={rollCount}>
        <svg viewBox="0 0 100 100" aria-hidden="true">
          {PIPS[face].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="10" fill="var(--seat-deep)" />
          ))}
        </svg>
      </span>
    </button>
  );
}

/**
 * `stepMs` is the game clock's step timer. Each glide runs a little longer
 * than that, so the next step always takes over mid-motion and a long move
 * never pauses at a spot.
 */
export function LudoBoard({ stepMs }: { stepMs: number }) {
  const tokens = useLudoStore((s) => s.tokens);
  const kinds = useLudoStore((s) => s.kinds);
  const names = useLudoStore((s) => s.names);
  const turn = useLudoStore((s) => s.turn);
  const phase = useLudoStore((s) => s.phase);
  const moves = useLudoStore((s) => s.moves);
  const moving = useLudoStore((s) => s.moving);
  const burst = useLudoStore((s) => s.burst);
  const pickMove = useLudoStore((s) => s.pickMove);

  const active = new Set(activeSeats(kinds));
  const kidPicking = phase === "pick" && kinds[turn] === "kid";
  const movable = new Set(kidPicking ? moves.map((m) => m.token) : []);

  return (
    <div className="ludo-board" style={{ "--ludo-step-ms": `${Math.round(stepMs * 1.15)}ms` } as React.CSSProperties}>
      <StaticBoard active={active} />

      {LUDO_SEATS.filter((seat) => active.has(seat.id)).flatMap((seat) =>
        tokens[seat.id].map((progress, i) => {
          const [x, y] = piecePoint(seat.id, i, progress);
          const isMover = seat.id === turn && movable.has(i);
          const isMoving = seat.id === turn && moving?.token === i;
          const finished = progress >= 47;
          return (
            <button
              key={`${seat.id}-${i}`}
              type="button"
              className={`ludo-token ${isMover ? "ludo-token--movable" : ""} ${isMoving ? "ludo-token--moving" : ""} ${finished ? "ludo-token--home" : ""}`}
              style={{ left: pct(x), top: pct(y), "--seat": seat.color } as React.CSSProperties}
              disabled={!isMover}
              onClick={() => pickMove(i)}
              aria-label={`${names[seat.id]}'s piece ${i + 1}${isMover ? ", tap to move" : ""}`}
            >
              <span className="ludo-token__body">
                <LudoPiece seat={seat} />
              </span>
            </button>
          );
        }),
      )}

      <div className="ludo-board__center">
        <LudoDie />
      </div>

      {burst && (
        <div className="ludo-board__burst" style={{ left: pct(burst.point[0]), top: pct(burst.point[1]) }}>
          <StarBurst triggerKey={burst.key} big={burst.big} count={burst.big ? 18 : 12} />
        </div>
      )}
    </div>
  );
}
