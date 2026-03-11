/* ─── Check-in Hook ─── */

import { useState, useCallback } from "react";
import { haversineDistance, placeSlug, CHECK_IN_RADIUS } from "../shared/harita-gamification";
import { useMapStore } from "../stores/map-store";
import { useGamificationStore } from "../stores/gamification-store";
import { useAuthStore } from "../stores/auth-store";
import { XP_VALUES } from "../config/xp-config";
import type { CulturePlace } from "../shared/harita-data";

export type CheckInStatus = "idle" | "too_far" | "already" | "success" | "no_auth";

export function useCheckIn() {
  const [status, setStatus] = useState<CheckInStatus>("idle");
  const [earnedStars, setEarnedStars] = useState(0);

  const { userLat, userLng } = useMapStore();
  const { visitedSlugs, addVisit, addStars, addBadge } = useGamificationStore();
  const { user } = useAuthStore();

  const checkIn = useCallback(
    (place: CulturePlace) => {
      if (!user) {
        setStatus("no_auth");
        return;
      }

      const slug = placeSlug(place.name);
      if (visitedSlugs.has(slug)) {
        setStatus("already");
        return;
      }

      if (userLat == null || userLng == null) {
        setStatus("too_far");
        return;
      }

      const dist = haversineDistance(userLat, userLng, place.lat, place.lng);
      if (dist > CHECK_IN_RADIUS) {
        setStatus("too_far");
        return;
      }

      // Başarılı check-in
      addVisit(slug);
      const stars = XP_VALUES.place_visit;
      addStars(stars);
      addBadge(`visit_${slug}`);
      setEarnedStars(stars);
      setStatus("success");
    },
    [user, userLat, userLng, visitedSlugs, addVisit, addStars, addBadge]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setEarnedStars(0);
  }, []);

  return { status, earnedStars, checkIn, reset };
}
