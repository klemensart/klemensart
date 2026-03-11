/* ─── Audio Store (Sesli İçerik Durumu) ─── */

import { create } from "zustand";

interface AudioState {
  isPlaying: boolean;
  currentUrl: string | null;
  currentTitle: string | null;
  duration: number;
  position: number;

  play: (url: string, title: string) => void;
  pause: () => void;
  stop: () => void;
  setPosition: (pos: number) => void;
  setDuration: (dur: number) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  isPlaying: false,
  currentUrl: null,
  currentTitle: null,
  duration: 0,
  position: 0,

  play: (url, title) =>
    set({ isPlaying: true, currentUrl: url, currentTitle: title }),
  pause: () => set({ isPlaying: false }),
  stop: () =>
    set({
      isPlaying: false,
      currentUrl: null,
      currentTitle: null,
      duration: 0,
      position: 0,
    }),
  setPosition: (position) => set({ position }),
  setDuration: (duration) => set({ duration }),
}));
