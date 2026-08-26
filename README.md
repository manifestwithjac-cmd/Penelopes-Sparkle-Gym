# Penelope's Sparkle Gym

A touch-first, mobile-web gymnastics game for young players (built for a
5-year-old audience). Penelope explores a huge pink-and-purple gym,
performs gymnastics tricks across five apparatus, earns stars and points,
unlocks harder tricks and new leotards, and hangs out with friends. There
is no ending — the loop is **practice → try → celebrate → earn → unlock →
customize → try something harder**, repeated indefinitely.

## Running it

```bash
npm install
npm run dev       # start the dev server (http://localhost:5173)
npm run build     # typecheck + production build
npm run test:e2e  # smoke-tests the core play loop in a real browser
```

## Tech stack

- **React 19 + TypeScript + Vite** — fast dev loop, small production bundle.
- **Zustand** (`persist` middleware → `localStorage`) for game state and
  save data. No backend, no accounts — everything lives on-device.
- **Plain CSS** (one stylesheet per component) with a CSS-variable design
  system in `src/styles/theme.css`. No CSS-in-JS runtime cost.
- **SVG + CSS animation** for all character/effect art — see "Art
  strategy" below.

## Folder structure

```
src/
  data/         Tricks, leotards, friends, achievements, challenges,
                apparatus, world zones — all content lives here as plain
                data. Add a leotard or trick by editing a file in this
                folder only; no other code should need to change.
  state/        gameStore.ts (single Zustand store: progress + save +
                transient UI/scene state) and unlocks.ts (pure functions
                that derive what's unlocked from progress).
  characters/   GymnastFigure (shared chibi SVG rig) + Penelope (fixed
                hair/eyes wrapper) + leotard pattern rendering.
  scenes/       Full-screen scenes: TitleScreen, GymScene (the big
                pannable world), ApparatusScene (per-event wrapper).
  minigames/    One component per apparatus, plus minigames/shared for
                the reusable tap-timing engine, trick picker, and result
                panel every minigame is built from.
  components/   Generic UI atoms (BigButton, counters, sound toggle) and
                the nav bar.
  effects/      StarBurst (particle burst) and CelebrationToast (queued
                "NEW TRICK!" / achievement / leotard toasts).
  utils/        Scoring/tier math, small hooks.
  save/         Re-exports the store; the one place save/load should be
                imported from if that ever stops being "just Zustand".
tests/e2e/      Playwright smoke test for the core loop (see below).
```

## Architecture decisions

- **Unlocking is derived, not stored.** Whether a trick/leotard/
  achievement is unlocked is computed on the fly from `stars`,
  `trickStats`, and `unlockedAchievementIds` (see `state/unlocks.ts`).
  There's no separate "unlockedTrickIds" list that could drift out of
  sync with the progress that earned it — one source of truth.
- **Content is fully data-driven.** `src/data/*.ts` has zero game logic;
  it's just typed literals. New tricks/leotards/friends/challenges are
  additive edits there, per the spec's expandability requirement.
- **One shared tap-timing engine, themed per apparatus.** Every minigame
  is built from the same primitives (`TapTarget`, `TrickPicker`,
  `ResultPanel`, `computeTapAccuracy`/`summarizeAttempt`) so difficulty
  tuning and "forgiving by design" behavior stay consistent, while each
  apparatus still gets a visually distinct mechanic.
- **World navigation is a pannable "track", not a router.** `GymScene`
  lays out apparatus/shop/lounge/snack-bar zones along a single wide
  horizontally-scrollable strip positioned by percentage, so the gym can
  grow (or the layout be retuned) by editing one data file
  (`data/apparatus.ts` / `data/worldZones.ts`), not scene code.
- **Art strategy:** all character and leotard art is flat SVG + CSS
  (see `characters/`), matching the spec's placeholder-art guidance —
  nothing in gameplay code depends on pixel assets, so swapping in real
  illustration later is a rendering-layer change only.
- **Reduced motion:** honored both via the OS `prefers-reduced-motion`
  media query and an explicit in-game toggle
  (`state.reducedMotion` → `[data-reduced-motion]` attribute on `<html>`).

## Testing

`tests/e2e/core-loop.mjs` drives the app with `playwright-core` against
the sandbox's pre-installed Chromium directly (the `@playwright/test`
runner's default launch flags aren't compatible with this container's
browser build, so the script launches the browser itself). It covers the
Phase 2 "actually playable" requirement: title → gym → floor → perform a
cartwheel → stars increase → reload → progress persists.

Run the dev server first, then:

```bash
npm run dev &
npm run test:e2e
```

## Build status

See commit history / project board for phase-by-phase progress against
the original build spec (Foundation → core loop → all apparatus → trick
progression → Spider Cartwheel → leotards → friends → world features →
audio → polish).
