export interface SnackDef {
  id: string;
  name: string;
  icon: string;
  reaction: string;
  featured?: boolean;
}

// Cheetos are the one snack the spec requires to be prominently featured;
// `featured` drives the bigger card in SnackBarScene. Purely cosmetic —
// no stars, no health mechanic, nothing gated on eating (spec §22).
export const SNACKS: SnackDef[] = [
  { id: "cheetos", name: "Cheetos", icon: "🌽", reaction: "Crunchy and cheesy — yum!", featured: true },
  { id: "lemonade", name: "Lemonade", icon: "🍋", reaction: "So refreshing!" },
  { id: "fruit_snacks", name: "Fruit Snacks", icon: "🍇", reaction: "Chewy and sweet!" },
  { id: "popcorn", name: "Popcorn", icon: "🍿", reaction: "Pop pop pop!" },
];
