/* ─── Loca Store — Favoriler & Okuma Geçmişi ─── */

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@klemens_loca";

export interface SavedArticle {
  slug: string;
  title: string;
  author: string;
  category: string;
  image: string;
  savedAt: string; // ISO date
}

export interface SavedPlace {
  name: string;
  type: string;
  lat: number;
  lng: number;
  savedAt: string;
}

export interface ReadHistory {
  slug: string;
  title: string;
  author: string;
  category: string;
  image: string;
  readAt: string; // ISO date
}

interface LocaState {
  savedArticles: SavedArticle[];
  savedPlaces: SavedPlace[];
  readHistory: ReadHistory[];
  loaded: boolean;

  // Actions
  toggleArticle: (article: Omit<SavedArticle, "savedAt">) => void;
  togglePlace: (place: Omit<SavedPlace, "savedAt">) => void;
  addToHistory: (article: Omit<ReadHistory, "readAt">) => void;
  isArticleSaved: (slug: string) => boolean;
  isPlaceSaved: (name: string) => boolean;
  hydrate: () => Promise<void>;
}

export const useLocaStore = create<LocaState>((set, get) => ({
  savedArticles: [],
  savedPlaces: [],
  readHistory: [],
  loaded: false,

  toggleArticle: (article) => {
    const current = get().savedArticles;
    const exists = current.some((a) => a.slug === article.slug);
    const next = exists
      ? current.filter((a) => a.slug !== article.slug)
      : [{ ...article, savedAt: new Date().toISOString() }, ...current];
    set({ savedArticles: next });
    persist(get());
  },

  togglePlace: (place) => {
    const current = get().savedPlaces;
    const exists = current.some((p) => p.name === place.name);
    const next = exists
      ? current.filter((p) => p.name !== place.name)
      : [{ ...place, savedAt: new Date().toISOString() }, ...current];
    set({ savedPlaces: next });
    persist(get());
  },

  addToHistory: (article) => {
    const current = get().readHistory;
    // Aynı yazıyı tekrar ekleme, sadece tarihi güncelle
    const filtered = current.filter((a) => a.slug !== article.slug);
    const next = [
      { ...article, readAt: new Date().toISOString() },
      ...filtered,
    ].slice(0, 50); // Max 50 kayıt
    set({ readHistory: next });
    persist(get());
  },

  isArticleSaved: (slug) => get().savedArticles.some((a) => a.slug === slug),
  isPlaceSaved: (name) => get().savedPlaces.some((p) => p.name === name),

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        set({
          savedArticles: data.savedArticles ?? [],
          savedPlaces: data.savedPlaces ?? [],
          readHistory: data.readHistory ?? [],
          loaded: true,
        });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },
}));

function persist(state: LocaState) {
  const data = {
    savedArticles: state.savedArticles,
    savedPlaces: state.savedPlaces,
    readHistory: state.readHistory,
  };
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
}
