/* ─── Realtime Gamification Sync ─── */

import { useEffect } from "react";
import { supabase } from "../config/supabase";
import { useAuthStore } from "../stores/auth-store";
import { useGamificationStore } from "../stores/gamification-store";

export function useRealtimeGamification() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("mobile-gamification")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "map_visits",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const slug = payload.new.place_slug as string;
          const { visitedSlugs, addVisit } = useGamificationStore.getState();
          if (!visitedSlugs.has(slug)) {
            addVisit(slug);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "map_user_stats",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newStars = payload.new.total_stars as number;
          const newRank = payload.new.rank_name as string;
          const { totalStars, syncFromServer } = useGamificationStore.getState();
          // Rollback guard: sadece artış durumunda güncelle
          if (newStars > totalStars) {
            syncFromServer({ totalStars: newStars, rank: newRank });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
}
