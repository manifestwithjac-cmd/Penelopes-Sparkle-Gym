// Save/load lives inside `state/gameStore.ts` via zustand's `persist`
// middleware (localStorage, key "penelopes-sparkle-gym-save"). This file
// is the single place other code should import save-related helpers from,
// so the storage mechanism can change later without touching callers.
export { useGameStore } from "../state/gameStore";
