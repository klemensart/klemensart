/* ─── Gamification Store (Zustand) — Uygulama Geneli ─── */

import { create } from "zustand";
import { getRank, getNextRank, type Rank } from "../shared/harita-gamification";

interface GamificationState {
  totalStars: number;
  visitedSlugs: Set<string>;
  earnedBadges: Set<string>;
  streakDays: number;
  lastActiveDate: string | null;
  rank: Rank;
  nextRank: Rank | null;

  // Actions
  addStars: (amount: number) => void;
  addVisit: (slug: string) => void;
  addBadge: (key: string) => void;
  updateStreak: () => void;
  hydrate: (data: {
    totalStars: number;
    visitedSlugs: string[];
    earnedBadges: string[];
    streakDays: number;
    lastActiveDate: string | null;
  }) => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export const useGamificationStore = create<GamificationState>((set) => ({
  totalStars: 0,
  visitedSlugs: new Set(),
  earnedBadges: new Set(),
  streakDays: 0,
  lastActiveDate: null,
  rank: getRank(0),
  nextRank: getNextRank(0),

  addStars: (amount) =>
    set((s) => {
      const newTotal = s.totalStars + amount;
      return {
        totalStars: newTotal,
        rank: getRank(newTotal),
        nextRank: getNextRank(newTotal),
      };
    }),

  addVisit: (slug) =>
    set((s) => {
      const next = new Set(s.visitedSlugs);
      next.add(slug);
      return { visitedSlugs: next };
    }),

  addBadge: (key) =>
    set((s) => {
      const next = new Set(s.earnedBadges);
      next.add(key);
      return { earnedBadges: next };
    }),

  updateStreak: () =>
    set((s) => {
      const todayStr = today();
      if (s.lastActiveDate === todayStr) return s;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().slice(0, 10);

      const isConsecutive = s.lastActiveDate === yStr;
      return {
        streakDays: isConsecutive ? s.streakDays + 1 : 1,
        lastActiveDate: todayStr,
      };
    }),

  hydrate: (data) =>
    set({
      totalStars: data.totalStars,
      visitedSlugs: new Set(data.visitedSlugs),
      earnedBadges: new Set(data.earnedBadges),
      streakDays: data.streakDays,
      lastActiveDate: data.lastActiveDate,
      rank: getRank(data.totalStars),
      nextRank: getNextRank(data.totalStars),
    }),
}));
