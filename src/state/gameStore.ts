import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ApparatusId } from "../data/types";
import { TRICKS_BY_ID } from "../data/tricks";
import { ACHIEVEMENTS } from "../data/achievements";
import { CHALLENGES } from "../data/challenges";
import { LEOTARDS_BY_ID } from "../data/leotards";
import { meetsRequirement, trickSuccessCountForApparatus, type TrickStat } from "./unlocks";
import { lerpReward, type PerformanceTier } from "../utils/scoring";

export type SceneId =
  | "title"
  | "gym"
  | "apparatus:floor"
  | "apparatus:beam"
  | "apparatus:bars"
  | "apparatus:trampoline"
  | "apparatus:vault"
  | "shop"
  | "snackbar"
  | "lounge";

export interface CelebrationEvent {
  id: string;
  kind: "trick" | "achievement" | "leotard" | "challenge";
  title: string;
  subtitle?: string;
  icon: string;
}

interface TrickResultInput {
  trickId: string;
  success: boolean;
  tier: PerformanceTier;
}

interface TrickResultOutcome {
  starsGained: number;
  pointsGained: number;
  tier: PerformanceTier;
}

interface GameState {
  // ---- persisted progress ----
  stars: number;
  points: number;
  trickStats: Record<string, TrickStat>;
  apparatusVisits: Record<string, number>;
  unlockedAchievementIds: string[];
  completedChallengeIds: string[];
  equippedLeotardId: string;
  soundOn: boolean;
  reducedMotion: boolean;
  hasPlayedBefore: boolean;

  // ---- transient (not persisted) ----
  scene: SceneId;
  sceneParam: string | null;
  celebrationQueue: CelebrationEvent[];
  devMode: boolean;

  // ---- actions ----
  goToScene: (scene: SceneId, param?: string | null) => void;
  markPlayed: () => void;
  recordTrickResult: (input: TrickResultInput) => TrickResultOutcome;
  visitApparatus: (apparatusId: ApparatusId) => void;
  equipLeotard: (leotardId: string) => void;
  toggleSound: () => void;
  setReducedMotion: (value: boolean) => void;
  dismissCelebration: (id: string) => void;
  resetProgress: () => void;
  toggleDevMode: () => void;
  devAddStars: (n: number) => void;
}

function pushCelebration(queue: CelebrationEvent[], event: Omit<CelebrationEvent, "id">) {
  queue.push({ ...event, id: `${event.kind}-${event.title}-${Date.now()}-${Math.random()}` });
}

/** Checks all achievement + challenge conditions and grants any newly met
 * ones, queuing celebration toasts. Pure w.r.t. everything except the two
 * arrays it mutates in place (called only from within `set`'s producer). */
function evaluateMilestones(state: GameState) {
  // Clone before mutating so callers never accidentally mutate `prev`
  // arrays that a spread (`...prev`) would otherwise still be aliasing.
  state.unlockedAchievementIds = [...state.unlockedAchievementIds];
  state.completedChallengeIds = [...state.completedChallengeIds];
  state.celebrationQueue = [...state.celebrationQueue];

  const ctx = {
    stars: state.stars,
    trickStats: state.trickStats,
    unlockedAchievementIds: state.unlockedAchievementIds,
  };

  for (const achievement of ACHIEVEMENTS) {
    if (state.unlockedAchievementIds.includes(achievement.id)) continue;
    const met = (() => {
      switch (achievement.condition.type) {
        case "totalStars":
          return state.stars >= achievement.condition.amount;
        case "trick":
          return (state.trickStats[achievement.condition.trickId]?.successes ?? 0) > 0;
        case "trickCount":
          return (
            trickSuccessCountForApparatus(achievement.condition.apparatusId, state.trickStats) >=
            achievement.condition.count
          );
        case "leotardCount": {
          const unlockedCount = Object.values(LEOTARDS_BY_ID).filter((l) =>
            meetsRequirement(l.unlock, ctx),
          ).length;
          return unlockedCount >= achievement.condition.count;
        }
        case "special":
          return false;
        default:
          return false;
      }
    })();
    if (met) {
      state.unlockedAchievementIds.push(achievement.id);
      pushCelebration(state.celebrationQueue, {
        kind: "achievement",
        title: achievement.name,
        subtitle: achievement.description,
        icon: achievement.icon,
      });
    }
  }

  for (const challenge of CHALLENGES) {
    if (state.completedChallengeIds.includes(challenge.id)) continue;
    const met = (() => {
      switch (challenge.goal.type) {
        case "performTrick":
          return (state.trickStats[challenge.goal.trickId]?.successes ?? 0) >= challenge.goal.count;
        case "earnStars":
          return state.stars >= challenge.goal.count;
        case "visitApparatus":
          return (state.apparatusVisits[challenge.goal.apparatusId] ?? 0) >= challenge.goal.count;
        default:
          return false;
      }
    })();
    if (met) {
      state.completedChallengeIds.push(challenge.id);
      state.stars += challenge.starReward;
      pushCelebration(state.celebrationQueue, {
        kind: "challenge",
        title: "Challenge Complete!",
        subtitle: challenge.prompt,
        icon: "🎉",
      });
      if (challenge.leotardRewardId) {
        const leotard = LEOTARDS_BY_ID[challenge.leotardRewardId];
        if (leotard) {
          pushCelebration(state.celebrationQueue, {
            kind: "leotard",
            title: "New Leotard!",
            subtitle: leotard.name,
            icon: "👗",
          });
        }
      }
    }
  }
}

const STORAGE_KEY = "penelopes-sparkle-gym-save";

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      stars: 0,
      points: 0,
      trickStats: {},
      apparatusVisits: {},
      unlockedAchievementIds: [],
      completedChallengeIds: [],
      equippedLeotardId: "pink_starter",
      soundOn: true,
      reducedMotion: false,
      hasPlayedBefore: false,

      scene: "title",
      sceneParam: null,
      celebrationQueue: [],
      devMode: false,

      goToScene: (scene, param = null) => set({ scene, sceneParam: param }),

      markPlayed: () => set({ hasPlayedBefore: true, scene: "gym" }),

      recordTrickResult: ({ trickId, success, tier }) => {
        const trick = TRICKS_BY_ID[trickId];
        const starsGained = trick ? lerpReward(trick.starReward, success ? tier : "try") : 0;
        const pointsGained = trick ? lerpReward(trick.pointReward, success ? tier : "try") : 0;

        set((prev) => {
          const stat = prev.trickStats[trickId] ?? { attempts: 0, successes: 0 };
          const nextTrickStats = {
            ...prev.trickStats,
            [trickId]: {
              attempts: stat.attempts + 1,
              successes: stat.successes + (success ? 1 : 0),
            },
          };
          const celebrationQueue = [...prev.celebrationQueue];
          if (success && trick) {
            pushCelebration(celebrationQueue, {
              kind: "trick",
              title: trick.special ? "SPARKLE PERFECT!" : "NEW TRICK!",
              subtitle: trick.name,
              icon: trick.icon,
            });
          }
          const draft: GameState = {
            ...prev,
            stars: prev.stars + starsGained,
            points: prev.points + pointsGained,
            trickStats: nextTrickStats,
            celebrationQueue,
          };
          evaluateMilestones(draft);
          return draft;
        });

        return { starsGained, pointsGained, tier: success ? tier : "try" };
      },

      visitApparatus: (apparatusId) =>
        set((prev) => {
          const draft: GameState = {
            ...prev,
            apparatusVisits: {
              ...prev.apparatusVisits,
              [apparatusId]: (prev.apparatusVisits[apparatusId] ?? 0) + 1,
            },
          };
          evaluateMilestones(draft);
          return draft;
        }),

      equipLeotard: (leotardId) => {
        const ctx = {
          stars: get().stars,
          trickStats: get().trickStats,
          unlockedAchievementIds: get().unlockedAchievementIds,
        };
        const leotard = LEOTARDS_BY_ID[leotardId];
        if (!leotard || !meetsRequirement(leotard.unlock, ctx)) return;
        set({ equippedLeotardId: leotardId });
      },

      toggleSound: () => set((prev) => ({ soundOn: !prev.soundOn })),
      setReducedMotion: (value) => set({ reducedMotion: value }),

      dismissCelebration: (id) =>
        set((prev) => ({ celebrationQueue: prev.celebrationQueue.filter((c) => c.id !== id) })),

      resetProgress: () => {
        localStorage.removeItem(STORAGE_KEY);
        set({
          stars: 0,
          points: 0,
          trickStats: {},
          apparatusVisits: {},
          unlockedAchievementIds: [],
          completedChallengeIds: [],
          equippedLeotardId: "pink_starter",
          hasPlayedBefore: false,
          scene: "title",
          sceneParam: null,
          celebrationQueue: [],
        });
      },

      toggleDevMode: () => set((prev) => ({ devMode: !prev.devMode })),
      devAddStars: (n) => set((prev) => ({ stars: Math.max(0, prev.stars + n) })),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        stars: state.stars,
        points: state.points,
        trickStats: state.trickStats,
        apparatusVisits: state.apparatusVisits,
        unlockedAchievementIds: state.unlockedAchievementIds,
        completedChallengeIds: state.completedChallengeIds,
        equippedLeotardId: state.equippedLeotardId,
        soundOn: state.soundOn,
        reducedMotion: state.reducedMotion,
        hasPlayedBefore: state.hasPlayedBefore,
      }),
      onRehydrateStorage: () => (state) => {
        // Returning players land straight back in the gym, not the title
        // screen (spec §41 — avoid forcing tutorials again).
        if (state?.hasPlayedBefore) {
          state.scene = "gym";
        }
      },
    },
  ),
);
