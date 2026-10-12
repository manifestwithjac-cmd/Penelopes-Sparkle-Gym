import { COLOR_CHARM, type MatchCard, type MatchColor } from "./matchRules";

function symbol(card: MatchCard): string {
  switch (card.kind) {
    case "number":
      return String(card.value);
    case "skip":
      return "✋";
    case "plus2":
      return "+2";
    case "wild":
      return "🌈";
    case "wild4":
      return "+4";
  }
}

/** A Sparkle Match card face. `chosenColor` tints a played rainbow card with the color its player named. */
export function MatchCardFace({ card, chosenColor }: { card: MatchCard; chosenColor?: MatchColor }) {
  const sym = symbol(card);
  const tone = card.color ?? "rainbow";
  const small = sym.length > 1 && card.kind !== "wild";
  // 6 and 9 get underlined, like real cards, so an upside-down 9 never reads as a 6.
  const flippable = card.kind === "number" && (card.value === 6 || card.value === 9);
  return (
    <span
      className={`mcard mcard--${tone} ${chosenColor ? `mcard--chose-${chosenColor}` : ""} ${flippable ? "mcard--underline" : ""}`}
      aria-hidden="true"
    >
      <span className="mcard__corner mcard__corner--tl">
        {sym}
        {card.color && <span className="mcard__charm">{COLOR_CHARM[card.color]}</span>}
      </span>
      <span className="mcard__oval">
        <span className={`mcard__symbol ${small ? "mcard__symbol--wide" : ""}`}>{sym}</span>
      </span>
      <span className="mcard__corner mcard__corner--br">{sym}</span>
    </span>
  );
}

export function MatchCardBack() {
  return (
    <span className="mcard mcard--back" aria-hidden="true">
      <span className="mcard__back-mark">✦</span>
    </span>
  );
}
