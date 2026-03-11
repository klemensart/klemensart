/* ─── XP Dashboard — Ünvan, Yıldız, İlerleme ─── */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../../../config/theme";
import { useGamificationStore } from "../../../stores/gamification-store";
import ProgressBar from "../../../components/ui/ProgressBar";

export default function XpDashboard() {
  const { totalStars, rank, nextRank, streakDays } = useGamificationStore();

  const progress = nextRank
    ? ((totalStars - rank.minStars) / (nextRank.minStars - rank.minStars)) * 100
    : 100;

  return (
    <View style={styles.card}>
      {/* Streak */}
      {streakDays > 0 && (
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>🔥 {streakDays} gün</Text>
        </View>
      )}

      {/* Ünvan ikonu */}
      <Text style={styles.rankIcon}>{rank.icon}</Text>
      <Text style={styles.rankName}>{rank.name}</Text>

      {/* Yıldız sayısı */}
      <Text style={styles.starsText}>⭐ {totalStars}</Text>

      {/* İlerleme */}
      <View style={styles.progressWrap}>
        <ProgressBar progress={progress} />
        {nextRank && (
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>{rank.minStars}</Text>
            <Text style={styles.progressLabel}>
              {nextRank.icon} {nextRank.name} — {nextRank.minStars}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxl,
    alignItems: "center",
    ...SHADOWS.md,
    marginBottom: SPACING.xl,
  },
  streakBadge: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: "#FFF3E0",
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streakText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: "700",
    color: "#E65100",
  },
  rankIcon: { fontSize: 56, marginBottom: SPACING.sm },
  rankName: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: 4,
  },
  starsText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.warm,
    marginBottom: SPACING.xl,
  },
  progressWrap: { width: "100%" },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  progressLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.warm,
  },
});
