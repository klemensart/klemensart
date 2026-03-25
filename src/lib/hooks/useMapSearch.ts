"use client";

import { useState, useMemo, useCallback } from "react";
import { PLACES, ROUTES, TYPE_LABELS, ERA_LABELS, type CulturePlace, type Route } from "@/lib/harita-data";
import { haversineDistance } from "@/lib/harita-gamification";

/* ─── Türkçe normalize ─── */
const TR: Record<string, string> = {
  ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
  Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u",
};
function normalize(s: string): string {
  return s.toLowerCase().replace(/[çğıöşüÇĞİÖŞÜ]/g, (c) => TR[c] || c);
}

export type SearchResult = {
  kind: "place" | "route";
  place?: CulturePlace;
  route?: Route;
  label: string;
  sub: string;
  distance?: number; // metres
};

export function useMapSearch(userPos: { lat: number; lng: number } | null) {
  const [query, setQuery] = useState("");

  const results = useMemo((): SearchResult[] => {
    const q = normalize(query.trim());
    if (q.length < 2) return [];

    const out: SearchResult[] = [];

    // Search places
    for (const p of PLACES) {
      const haystack = normalize(
        `${p.name} ${p.desc} ${TYPE_LABELS[p.type]} ${
          p.era
            ? (Array.isArray(p.era) ? p.era : [p.era]).map((e) => ERA_LABELS[e]).join(" ")
            : ""
        }`
      );
      if (haystack.includes(q)) {
        const dist = userPos ? haversineDistance(userPos.lat, userPos.lng, p.lat, p.lng) : undefined;
        out.push({ kind: "place", place: p, label: p.name, sub: TYPE_LABELS[p.type], distance: dist });
      }
    }

    // Search routes + stops
    for (const r of ROUTES) {
      const haystack = normalize(`${r.title} ${r.desc} ${r.stops.map((s) => s.name).join(" ")}`);
      if (haystack.includes(q)) {
        out.push({ kind: "route", route: r, label: r.title, sub: `${r.stops.length} durak · ${r.duration}` });
      }
    }

    // Sort: places with distance first (nearest), then rest
    out.sort((a, b) => {
      if (a.distance !== undefined && b.distance !== undefined) return a.distance - b.distance;
      if (a.distance !== undefined) return -1;
      if (b.distance !== undefined) return 1;
      return 0;
    });

    return out.slice(0, 8);
  }, [query, userPos]);

  const nearbyPlaces = useMemo((): CulturePlace[] => {
    if (!userPos) return [];
    return [...PLACES]
      .map((p) => ({ p, d: haversineDistance(userPos.lat, userPos.lng, p.lat, p.lng) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 8)
      .map((x) => x.p);
  }, [userPos]);

  const getSimilarPlaces = useCallback((place: CulturePlace): CulturePlace[] => {
    const same = PLACES.filter((p) => p.type === place.type && p.name !== place.name);
    // Fisher-Yates shuffle (deterministic-ish per render)
    const shuffled = [...same];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 4);
  }, []);

  return { query, setQuery, results, nearbyPlaces, getSimilarPlaces };
}
