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
  components/   Generic UI atoms (BigButton, counters, sound toggle,
                settings panel) and the nav bar.
  effects/      StarBurst (particle burst), CelebrationToast (queued
                "NEW TRICK!" / achievement / leotard toasts), and the
                Spider Cartwheel's SpiderwebBurst flourish.
  shop/         Leotard shop card rendering (dressing-room UI).
  friends/      FriendSprite (world figure) + FriendPopup (dialogue,
                challenge status, high-five).
  audio/        Synthesized SFX + background loop (Web Audio, no sound
                asset files) behind one `useSound()` hook.
  dev/          Developer-only shortcuts panel, reached via a hidden
                gesture in Settings — never shown in normal play.
  utils/        Scoring/tier math, small hooks.
  save/         Re-exports the store; the one place save/load should be
                imported from if that ever stops being "just Zustand".
tests/e2e/      Playwright smoke test suite (see below).
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
- **Audio is fully synthesized** (`audio/audioEngine.ts`, Web Audio
  oscillators) — no external sound/music files to license or load. Every
  call site goes through `useSound()`, the one place that checks the
  `soundOn` setting, so muting can't be bypassed by a forgetful call site.
- **Dev mode is a hidden gesture, not a build flag.** Tapping the version
  line in Settings 5 times reveals `dev/DevPanel.tsx` (add stars, unlock
  everything, jump to any apparatus, instant reset) for this session
  only — `devMode` is intentionally excluded from persisted save data.

## Testing

`tests/e2e/core-loop.mjs` drives the app with `playwright-core` against
the sandbox's pre-installed Chromium directly (the `@playwright/test`
runner's default launch flags aren't compatible with this container's
browser build, so the script launches the browser itself, sharing one
browser instance with a fresh context per test). It covers: the core
play loop and save persistence, all five apparatus, the leotard shop,
the sound toggle, friend interactions, the snack bar/lounge/trophy wall
and the 67 easter egg, and the settings reset-confirmation + dev-mode
flow.

Run the dev server first, then:

```bash
npm run dev &
npm run test:e2e
```

## Build status

All ten phases of the original build spec are complete: Foundation →
core loop → all five apparatus → trick progression → Spider Cartwheel →
leotard shop → friends & challenges → world features (snack bar, lounge,
trophy wall) → audio → polish (settings, reduced motion, dev mode). See
commit history for the phase-by-phase history and the reasoning behind
each.
