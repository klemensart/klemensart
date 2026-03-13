/* ─── Check-in Hook — Server-backed ─── */

import { useState, useCallback } from "react";
import { haversineDistance, placeSlug, CHECK_IN_RADIUS } from "../shared/harita-gamification";
import { useMapStore } from "../stores/map-store";
import { useGamificationStore } from "../stores/gamification-store";
import { useAuthStore } from "../stores/auth-store";
import { serverCheckIn } from "../services/gamification-service";
import type { CulturePlace } from "../shared/harita-data";

export type CheckInStatus = "idle" | "loading" | "too_far" | "already" | "success" | "no_auth" | "error";

export function useCheckIn() {
  const [status, setStatus] = useState<CheckInStatus>("idle");
  const [earnedStars, setEarnedStars] = useState(0);
  const [newBadges, setNewBadges] = useState<{ type: string; name: string; stars: number }[]>([]);
  const [routeCompleted, setRouteCompleted] = useState(false);

  const { userLat, userLng } = useMapStore();
  const { todaySlugs, addVisit, syncFromServer } = useGamificationStore();
  const { user } = useAuthStore();

  const checkIn = useCallback(
    async (place: CulturePlace, routeId?: number) => {
      // Lokal ön-doğrulama
      if (!user) {
        setStatus("no_auth");
        return;
      }

      const slug = placeSlug(place.name);
      if (todaySlugs.has(slug)) {
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

      // Sunucu çağrısı
      setStatus("loading");
      try {
        const { ok, status: httpStatus, data } = await serverCheckIn({
          place_slug: slug,
          user_lat: userLat,
          user_lng: userLng,
          place_name: place.name,
          place_lat: place.lat,
          place_lng: place.lng,
          place_type: place.type,
          route_id: routeId,
        });

        if (ok) {
          // Sunucu başarılı — store'u sunucu değerleriyle güncelle
          syncFromServer({ totalStars: data.total_stars, rank: data.rank });
          addVisit(slug);
          setEarnedStars(data.stars_earned);
          setNewBadges(data.new_badges || []);
          setRouteCompleted(data.route_completed || false);
          setStatus("success");
        } else if (httpStatus === 409) {
          // Bugün zaten ziyaret
          addVisit(slug);
          setStatus("already");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    },
    [user, userLat, userLng, todaySlugs, addVisit, syncFromServer],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setEarnedStars(0);
    setNewBadges([]);
    setRouteCompleted(false);
  }, []);

  return { status, earnedStars, newBadges, routeCompleted, checkIn, reset };
}
