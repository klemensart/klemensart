/* ─── Gamification Store (Zustand) — AsyncStorage Persist + Server Sync ─── */

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getRank, getNextRank, type Rank } from "../shared/harita-gamification";

const STORAGE_KEY = "@klemens_gamification";

interface GamificationState {
  totalStars: number;
  visitedSlugs: Set<string>;
  todaySlugs: Set<string>;
  earnedBadges: Set<string>;
  streakDays: number;
  lastActiveDate: string | null;
  rankName: string;
  rank: Rank;
  nextRank: Rank | null;
  hydrated: boolean;

  // Actions
  addStars: (amount: number) => void;
  addVisit: (slug: string) => void;
  addBadge: (key: string) => void;
  updateStreak: () => void;

  /** Check-in sonrası sunucu response'uyla stars/rank güncelle */
  syncFromServer: (data: { totalStars: number; rank: string }) => void;

  /** /api/harita/stats response'unu store'a yaz (tam hydration) */
  hydrateFromServer: (data: {
    totalStars: number;
    rankName: string;
    visitedSlugs: string[];
    todaySlugs: string[];
    earnedBadges: string[];
    streakDays: number;
    lastActiveDate: string | null;
  }) => void;

  /** AsyncStorage'dan oku — anında başlangıç */
  loadFromCache: () => Promise<void>;
}

const today = () => new Date().toISOString().slice(0, 10);

function persistToStorage(state: GamificationState) {
  const data = {
    totalStars: state.totalStars,
    visitedSlugs: [...state.visitedSlugs],
    todaySlugs: [...state.todaySlugs],
    earnedBadges: [...state.earnedBadges],
    streakDays: state.streakDays,
    lastActiveDate: state.lastActiveDate,
    rankName: state.rankName,
  };
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  totalStars: 0,
  visitedSlugs: new Set(),
  todaySlugs: new Set(),
  earnedBadges: new Set(),
  streakDays: 0,
  lastActiveDate: null,
  rankName: "Meraklı",
  rank: getRank(0),
  nextRank: getNextRank(0),
  hydrated: false,

  addStars: (amount) =>
    set((s) => {
      const newTotal = s.totalStars + amount;
      const next = {
        totalStars: newTotal,
        rank: getRank(newTotal),
        nextRank: getNextRank(newTotal),
      };
      persistToStorage({ ...s, ...next });
      return next;
    }),

  addVisit: (slug) =>
    set((s) => {
      const nextVisited = new Set(s.visitedSlugs);
      nextVisited.add(slug);
      const nextToday = new Set(s.todaySlugs);
      nextToday.add(slug);
      const next = { visitedSlugs: nextVisited, todaySlugs: nextToday };
      persistToStorage({ ...s, ...next });
      return next;
    }),

  addBadge: (key) =>
    set((s) => {
      const next = new Set(s.earnedBadges);
      next.add(key);
      const updated = { earnedBadges: next };
      persistToStorage({ ...s, ...updated });
      return updated;
    }),

  updateStreak: () =>
    set((s) => {
      const todayStr = today();
      if (s.lastActiveDate === todayStr) return s;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().slice(0, 10);

      const isConsecutive = s.lastActiveDate === yStr;
      const next = {
        streakDays: isConsecutive ? s.streakDays + 1 : 1,
        lastActiveDate: todayStr,
      };
      persistToStorage({ ...s, ...next });
      return next;
    }),

  syncFromServer: (data) =>
    set((s) => {
      const next = {
        totalStars: data.totalStars,
        rankName: data.rank,
        rank: getRank(data.totalStars),
        nextRank: getNextRank(data.totalStars),
      };
      persistToStorage({ ...s, ...next });
      return next;
    }),

  hydrateFromServer: (data) =>
    set((s) => {
      const next = {
        totalStars: data.totalStars,
        rankName: data.rankName,
        visitedSlugs: new Set(data.visitedSlugs),
        todaySlugs: new Set(data.todaySlugs),
        earnedBadges: new Set(data.earnedBadges),
        streakDays: data.streakDays,
        lastActiveDate: data.lastActiveDate,
        rank: getRank(data.totalStars),
        nextRank: getNextRank(data.totalStars),
        hydrated: true,
      };
      persistToStorage({ ...s, ...next });
      return next;
    }),

  loadFromCache: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        set({ hydrated: true });
        return;
      }
      const data = JSON.parse(raw);
      set({
        totalStars: data.totalStars ?? 0,
        visitedSlugs: new Set(data.visitedSlugs ?? []),
        todaySlugs: new Set(data.todaySlugs ?? []),
        earnedBadges: new Set(data.earnedBadges ?? []),
        streakDays: data.streakDays ?? 0,
        lastActiveDate: data.lastActiveDate ?? null,
        rankName: data.rankName ?? "Meraklı",
        rank: getRank(data.totalStars ?? 0),
        nextRank: getNextRank(data.totalStars ?? 0),
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },
}));
