/** Simple placeholder SVG for a Cheeto puff — the spec calls out Cheetos
 * by name and wants them prominent, and no emoji reads clearly as one. */
export function CheetoIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path
        d="M20 44 Q10 40 14 28 Q6 24 12 16 Q18 8 26 14 Q32 6 40 12 Q50 10 50 20 Q58 24 52 32 Q58 40 48 44 Q46 52 36 50 Q30 58 22 52 Q12 54 20 44 Z"
        fill="#ffb347"
        stroke="#e8952a"
        strokeWidth="2"
      />
      <circle cx="24" cy="24" r="2.5" fill="#e8952a" opacity="0.6" />
      <circle cx="38" cy="34" r="2.5" fill="#e8952a" opacity="0.6" />
      <circle cx="30" cy="42" r="2" fill="#e8952a" opacity="0.6" />
    </svg>
  );
}
