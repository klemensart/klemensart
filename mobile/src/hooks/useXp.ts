/* ─── Birleşik XP Hook ─── */

import { useCallback, useState } from "react";
import { useGamificationStore } from "../stores/gamification-store";
import { getRank } from "../shared/harita-gamification";
import { XP_VALUES, type XpAction } from "../config/xp-config";

export function useXp() {
  const { totalStars, addStars, rank } = useGamificationStore();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showXpToast, setShowXpToast] = useState(false);
  const [lastEarned, setLastEarned] = useState(0);

  const earnXp = useCallback(
    (action: XpAction) => {
      const amount = XP_VALUES[action];
      const oldRank = rank;
      addStars(amount);
      setLastEarned(amount);
      setShowXpToast(true);

      // Ünvan değişti mi?
      const newRank = getRank(totalStars + amount);
      if (newRank.name !== oldRank.name) {
        setShowLevelUp(true);
      }

      // Auto-dismiss toast
      setTimeout(() => setShowXpToast(false), 2000);
    },
    [totalStars, rank, addStars]
  );

  const dismissLevelUp = useCallback(() => setShowLevelUp(false), []);

  return { earnXp, showLevelUp, showXpToast, lastEarned, dismissLevelUp };
}
