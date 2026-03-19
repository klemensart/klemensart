/* ───────── Harita Gamification — Rozet, Ünvan, Yardımcı ───────── */

import { PLACES, ROUTES } from "./harita-data";

/* ─── Slug ─── */
const TR_MAP: Record<string, string> = {
  ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
  Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u",
};

export function placeSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, (c) => TR_MAP[c] || c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/* ─── Haversine ─── */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ─── Ünvan Sistemi ─── */
export type Rank = { minStars: number; name: string; icon: string };

export const RANKS: Rank[] = [
  { minStars: 0,   name: "Meraklı",        icon: "🔍" },
  { minStars: 5,   name: "Gezgin",          icon: "👣" },
  { minStars: 15,  name: "Kâşif",           icon: "🧭" },
  { minStars: 30,  name: "Seyyah",          icon: "🗺️" },
  { minStars: 50,  name: "Rehber",          icon: "🚩" },
  { minStars: 75,  name: "Tarihçi",         icon: "📜" },
  { minStars: 100, name: "Kültür Elçisi",   icon: "⭐" },
  { minStars: 150, name: "Ankara Ustası",   icon: "👑" },
  { minStars: 200, name: "Efsane",          icon: "🏆" },
];

export function getRank(totalStars: number): Rank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (totalStars >= RANKS[i].minStars) return RANKS[i];
  }
  return RANKS[0];
}

export function getNextRank(totalStars: number): Rank | null {
  const current = getRank(totalStars);
  const idx = RANKS.indexOf(current);
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
}

/* ─── Rozet Tipleri ─── */
export type BadgeType = "visit" | "route_complete" | "category" | "milestone";

export const BADGE_DEFS = {
  visit:          { stars: 1,  label: "Mekan Ziyareti" },
  route_complete: { stars: 3,  label: "Rota Tamamlama" },
  category:       { stars: 2,  label: "Kategori Ustası" },
  milestone_25:   { stars: 5,  label: "25 Ziyaret" },
  milestone_50:   { stars: 5,  label: "50 Ziyaret" },
  milestone_100:  { stars: 10, label: "100 Ziyaret" },
} as const;

/* ─── Place lookup ─── */
export function findPlaceBySlug(slug: string) {
  return PLACES.find((p) => placeSlug(p.name) === slug) ?? null;
}

/* ─── Route completion check ─── */
export function checkRouteCompletion(
  visitedSlugs: Set<string>,
): { routeId: number; routeTitle: string; badgeKey: string }[] {
  const completed: { routeId: number; routeTitle: string; badgeKey: string }[] = [];
  for (const route of ROUTES) {
    const allVisited = route.stops.every((stop) => visitedSlugs.has(placeSlug(stop.name)));
    if (allVisited) {
      completed.push({
        routeId: route.id,
        routeTitle: route.title,
        badgeKey: `route_${route.id}`,
      });
    }
  }
  return completed;
}

/* ─── Category badge check ─── */
export function checkCategoryBadges(
  visitedSlugs: Set<string>,
): { category: string; badgeKey: string; badgeName: string }[] {
  const typeCounts: Record<string, number> = {};
  for (const place of PLACES) {
    if (visitedSlugs.has(placeSlug(place.name))) {
      typeCounts[place.type] = (typeCounts[place.type] || 0) + 1;
    }
  }

  const badges: { category: string; badgeKey: string; badgeName: string }[] = [];
  const categoryLabels: Record<string, string> = {
    müze: "Müze", galeri: "Galeri", konser: "Konser",
    tiyatro: "Tiyatro", tarihi: "Tarih", edebiyat: "Edebiyat", miras: "Miras",
    doğa: "Doğa", gastronomi: "Gastronomi", mimari: "Mimari",
  };

  for (const [type, count] of Object.entries(typeCounts)) {
    if (count >= 5) {
      badges.push({
        category: type,
        badgeKey: `category_${type}`,
        badgeName: `${categoryLabels[type] || type} Uzmanı`,
      });
    }
  }
  return badges;
}

/* ─── Milestone check ─── */
export function checkMilestones(
  totalVisits: number,
): { milestone: number; badgeKey: string; stars: number }[] {
  const milestones = [
    { threshold: 25,  key: "milestone_25",  stars: 5 },
    { threshold: 50,  key: "milestone_50",  stars: 5 },
    { threshold: 100, key: "milestone_100", stars: 10 },
  ];
  return milestones
    .filter((m) => totalVisits >= m.threshold)
    .map((m) => ({ milestone: m.threshold, badgeKey: m.key, stars: m.stars }));
}

export const CHECK_IN_RADIUS = 200; // metres
