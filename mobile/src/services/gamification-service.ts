/* ─── Gamification API Service ─── */

import { apiFetchWithStatus, apiFetch } from "./api";

/* ─── Types (sunucu response şeması) ─── */

export interface CheckInRequest {
  place_slug: string;
  user_lat: number;
  user_lng: number;
  place_name?: string;
  place_lat?: number;
  place_lng?: number;
  place_type?: string;
  route_id?: number;
}

export interface CheckInResponse {
  stars_earned: number;
  new_badges: { type: string; name: string; stars: number }[];
  total_stars: number;
  rank: string;
  rank_icon: string;
  route_completed: boolean;
}

export interface GamificationStats {
  stats: {
    total_visits: number;
    total_stars: number;
    total_badges: number;
    total_routes_completed: number;
    rank_name: string;
  };
  badges: {
    badge_type: string;
    badge_key: string;
    badge_name: string;
    stars_earned: number;
    earned_at: string;
  }[];
  visits: {
    place_slug: string;
    place_name: string;
    place_type: string;
    visited_at: string;
  }[];
  visitedSlugs: string[];
  todaySlugs: string[];
}

/** POST /api/harita/check-in — 200 OK veya 409 (bugün zaten ziyaret) */
export async function serverCheckIn(body: CheckInRequest) {
  return apiFetchWithStatus<CheckInResponse & { error?: string; already?: boolean }>(
    "/api/harita/check-in",
    { method: "POST", body: JSON.stringify(body) },
  );
}

/** GET /api/harita/stats */
export async function fetchGamificationStats() {
  return apiFetch<GamificationStats>("/api/harita/stats");
}
