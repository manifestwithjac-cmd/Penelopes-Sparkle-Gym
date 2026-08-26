import "./SpiderwebBurst.css";

/**
 * Cute, non-scary decorative "spiderweb" flourish for the Spider
 * Cartwheel finale (spec §11: magical, not spooky) — soft rounded lines
 * radiating from center plus a couple of concentric rings, pink/purple.
 */
export function SpiderwebBurst() {
  const rays = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <svg className="spiderweb-burst" viewBox="0 0 200 200" aria-hidden="true">
      <g stroke="url(#web-grad)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8">
        <defs>
          <linearGradient id="web-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--pink-400)" />
            <stop offset="100%" stopColor="var(--purple-400)" />
          </linearGradient>
        </defs>
        {rays.map((deg) => (
          <line
            key={deg}
            x1="100"
            y1="100"
            x2={100 + Math.cos((deg * Math.PI) / 180) * 90}
            y2={100 + Math.sin((deg * Math.PI) / 180) * 90}
          />
        ))}
        <circle cx="100" cy="100" r="30" />
        <circle cx="100" cy="100" r="55" />
        <circle cx="100" cy="100" r="80" />
      </g>
    </svg>
  );
}
