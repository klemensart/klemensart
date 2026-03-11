/* ─── İstatistikler Tab ─── */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../../../config/theme";
import { useGamificationStore } from "../../../stores/gamification-store";

interface StatCardProps {
  icon: string;
  value: number | string;
  label: string;
}

function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function StatsTab() {
  const { totalStars, visitedSlugs, earnedBadges, streakDays } =
    useGamificationStore();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>İstatistikler</Text>
      <View style={styles.grid}>
        <StatCard icon="⭐" value={totalStars} label="Toplam Yıldız" />
        <StatCard icon="📍" value={visitedSlugs.size} label="Ziyaret" />
        <StatCard icon="🏅" value={earnedBadges.size} label="Rozet" />
        <StatCard icon="🔥" value={streakDays} label="Streak" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.xl },
  header: {
    fontSize: FONTS.sizes.lg,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: SPACING.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
  },
  statCard: {
    width: "47%",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: "center",
    ...SHADOWS.sm,
  },
  statIcon: { fontSize: 28, marginBottom: SPACING.sm },
  statValue: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.warm,
  },
});
