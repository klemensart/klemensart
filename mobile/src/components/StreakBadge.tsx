/* ─── Günlük Streak Göstergesi ─── */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS, RADIUS, SHADOWS } from "../config/theme";
import { useGamificationStore } from "../stores/gamification-store";

export default function StreakBadge() {
  const streakDays = useGamificationStore((s) => s.streakDays);

  if (streakDays < 1) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.fire}>🔥</Text>
      <Text style={styles.count}>{streakDays}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    ...SHADOWS.sm,
  },
  fire: { fontSize: 14, marginRight: 3 },
  count: {
    fontSize: FONTS.sizes.sm,
    fontWeight: "700",
    color: COLORS.dark,
  },
});
