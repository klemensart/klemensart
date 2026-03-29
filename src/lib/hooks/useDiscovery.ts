"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { PLACES } from "@/lib/harita-data";
import { placeSlug } from "@/lib/harita-gamification";

const LS_KEY = "harita-discovered";

/* ─── Semt bounding boxes ─── */
const DISTRICTS: { name: string; minLat: number; maxLat: number; minLng: number; maxLng: number }[] = [
  { name: "Kale & Ulus",  minLat: 39.930, maxLat: 39.948, minLng: 32.845, maxLng: 32.875 },
  { name: "Kizilay",      minLat: 39.915, maxLat: 39.930, minLng: 32.840, maxLng: 32.870 },
  { name: "Cankaya",      minLat: 39.875, maxLat: 39.915, minLng: 32.830, maxLng: 32.880 },
  { name: "Hamamonu",     minLat: 39.934, maxLat: 39.942, minLng: 32.860, maxLng: 32.880 },
  { name: "Beypazari",    minLat: 40.150, maxLat: 40.200, minLng: 31.880, maxLng: 31.960 },
  { name: "Diger",        minLat: 39.0, maxLat: 41.0, minLng: 31.0, maxLng: 34.0 },
];

function getDistrict(lat: number, lng: number): string {
  // Check specific districts first (Diger is catch-all at end)
  for (let i = 0; i < DISTRICTS.length - 1; i++) {
    const d = DISTRICTS[i];
    if (lat >= d.minLat && lat <= d.maxLat && lng >= d.minLng && lng <= d.maxLng) {
      return d.name;
    }
  }
  return "Diger";
}

export type DistrictProgress = { name: string; discovered: number; total: number; percent: number };

export function useDiscovery(_gamUser: { id: string } | null, visitedSlugs: Set<string>) {
  // Lazy init from localStorage
  const [localSlugs, setLocalSlugs] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    const stored = localStorage.getItem(LS_KEY);
    return stored ? new Set<string>(JSON.parse(stored)) : new Set();
  });

  // Merge localStorage slugs + gamification visitedSlugs during render
  const discoveredSlugs = useMemo(
    () => new Set([...localSlugs, ...visitedSlugs]),
    [localSlugs, visitedSlugs],
  );

  // Persist merged set to localStorage
  useEffect(() => {
    if (discoveredSlugs.size > 0) {
      localStorage.setItem(LS_KEY, JSON.stringify([...discoveredSlugs]));
    }
  }, [discoveredSlugs]);

  const discoverPlace = useCallback((slug: string) => {
    setLocalSlugs((prev) => {
      if (prev.has(slug)) return prev;
      const next = new Set(prev);
      next.add(slug);
      return next;
    });
  }, []);

  const isDiscovered = useCallback((slug: string) => discoveredSlugs.has(slug), [discoveredSlugs]);

  const totalProgress = useMemo(() => {
    const total = PLACES.length;
    const discovered = PLACES.filter((p) => discoveredSlugs.has(placeSlug(p.name))).length;
    return { discovered, total, percent: total > 0 ? Math.round((discovered / total) * 1000) / 10 : 0 };
  }, [discoveredSlugs]);

  const districtProgress = useMemo((): DistrictProgress[] => {
    const groups: Record<string, { discovered: number; total: number }> = {};
    for (const d of DISTRICTS) {
      groups[d.name] = { discovered: 0, total: 0 };
    }

    for (const p of PLACES) {
      const dist = getDistrict(p.lat, p.lng);
      if (!groups[dist]) groups[dist] = { discovered: 0, total: 0 };
      groups[dist].total++;
      if (discoveredSlugs.has(placeSlug(p.name))) {
        groups[dist].discovered++;
      }
    }

    return Object.entries(groups)
      .filter(([, v]) => v.total > 0)
      .map(([name, v]) => ({
        name,
        discovered: v.discovered,
        total: v.total,
        percent: v.total > 0 ? Math.round((v.discovered / v.total) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [discoveredSlugs]);

  return { discoveredSlugs, discoverPlace, isDiscovered, totalProgress, districtProgress };
}
