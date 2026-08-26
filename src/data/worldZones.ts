// Non-apparatus destinations in the gym world track. Kept separate from
// apparatus.ts since these unlock progressively by phase (shop → P6,
// snack bar & lounge → P8) but we lay out their spots in the world now so
// the gym's geometry never has to shift later.
export interface WorldZoneDef {
  id: "shop" | "snackbar" | "lounge";
  name: string;
  icon: string;
  worldPosition: number;
  colorFrom: string;
  colorTo: string;
  /** False until the corresponding phase wires up its scene. */
  enabled: boolean;
}

export const WORLD_ZONES: WorldZoneDef[] = [
  {
    id: "shop",
    name: "Leotard Shop",
    icon: "👗",
    worldPosition: 0.2,
    colorFrom: "#ffd9ec",
    colorTo: "#ff8cc6",
    enabled: true,
  },
  {
    id: "lounge",
    name: "Friends Lounge",
    icon: "🛋️",
    worldPosition: 0.4,
    colorFrom: "#e6d6ff",
    colorTo: "#cfaeff",
    enabled: true,
  },
  {
    id: "snackbar",
    name: "Snack Bar",
    icon: "🧡",
    worldPosition: 0.6,
    colorFrom: "#ffe08a",
    colorTo: "#ffcd3c",
    enabled: true,
  },
];
