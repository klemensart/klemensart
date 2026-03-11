/* ─── Günlük Streak Hook ─── */

import { useEffect } from "react";
import { useGamificationStore } from "../stores/gamification-store";
import { useAuthStore } from "../stores/auth-store";

export function useStreak() {
  const user = useAuthStore((s) => s.user);
  const updateStreak = useGamificationStore((s) => s.updateStreak);

  useEffect(() => {
    if (user) {
      updateStreak();
    }
  }, [user, updateStreak]);
}
