/* ─── Map Store (Zustand) ─── */

import { create } from "zustand";
import type { CulturePlace, PlaceType, Route } from "../shared/harita-data";

type MapMode = "explore" | "routes";

interface MapState {
  mode: MapMode;
  activeFilter: PlaceType | null;
  selectedPlace: CulturePlace | null;
  selectedRoute: Route | null;
  activeStopIndex: number;
  isDark: boolean;
  userLat: number | null;
  userLng: number | null;

  setMode: (mode: MapMode) => void;
  setFilter: (filter: PlaceType | null) => void;
  selectPlace: (place: CulturePlace | null) => void;
  selectRoute: (route: Route | null) => void;
  setActiveStop: (index: number) => void;
  toggleTheme: () => void;
  setUserLocation: (lat: number, lng: number) => void;
}

export const useMapStore = create<MapState>((set) => ({
  mode: "explore",
  activeFilter: null,
  selectedPlace: null,
  selectedRoute: null,
  activeStopIndex: 0,
  isDark: false,
  userLat: null,
  userLng: null,

  setMode: (mode) => set({ mode, selectedRoute: null, activeStopIndex: 0 }),
  setFilter: (filter) => set({ activeFilter: filter }),
  selectPlace: (place) => set({ selectedPlace: place }),
  selectRoute: (route) => set({ selectedRoute: route, activeStopIndex: 0 }),
  setActiveStop: (index) => set({ activeStopIndex: index }),
  toggleTheme: () => set((s) => ({ isDark: !s.isDark })),
  setUserLocation: (lat, lng) => set({ userLat: lat, userLng: lng }),
}));
