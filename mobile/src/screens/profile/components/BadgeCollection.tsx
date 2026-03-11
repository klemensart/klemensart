/* ─── Rozet Koleksiyonu Grid ─── */

import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../../../config/theme";
import { useGamificationStore } from "../../../stores/gamification-store";
import { BADGE_DEFS } from "../../../shared/harita-gamification";
import { ROUTES } from "../../../shared/harita-data";

interface BadgeItem {
  key: string;
  label: string;
  icon: string;
  earned: boolean;
}

function buildBadgeList(earnedBadges: Set<string>): BadgeItem[] {
  const badges: BadgeItem[] = [];

  // Rota rozetleri
  for (const route of ROUTES) {
    const key = `route_${route.id}`;
    badges.push({
      key,
      label: route.title,
      icon: route.icon,
      earned: earnedBadges.has(key),
    });
  }

  // Kategori rozetleri
  const categories = [
    { type: "müze", label: "Müze Uzmanı", icon: "🏛️" },
    { type: "galeri", label: "Galeri Uzmanı", icon: "🖼️" },
    { type: "konser", label: "Konser Uzmanı", icon: "🎵" },
    { type: "tiyatro", label: "Tiyatro Uzmanı", icon: "🎭" },
    { type: "tarihi", label: "Tarih Uzmanı", icon: "🏰" },
    { type: "edebiyat", label: "Edebiyat Uzmanı", icon: "📚" },
    { type: "miras", label: "Miras Uzmanı", icon: "🛡️" },
  ];
  for (const cat of categories) {
    const key = `category_${cat.type}`;
    badges.push({
      key,
      label: cat.label,
      icon: cat.icon,
      earned: earnedBadges.has(key),
    });
  }

  // Milestone rozetleri
  const milestones = [
    { key: "milestone_25", label: "25 Ziyaret", icon: "🥉" },
    { key: "milestone_50", label: "50 Ziyaret", icon: "🥈" },
    { key: "milestone_100", label: "100 Ziyaret", icon: "🥇" },
  ];
  for (const m of milestones) {
    badges.push({ ...m, earned: earnedBadges.has(m.key) });
  }

  return badges;
}

export default function BadgeCollection() {
  const { earnedBadges } = useGamificationStore();
  const badges = buildBadgeList(earnedBadges);
  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Rozetler ({earnedCount}/{badges.length})
      </Text>
      <FlatList
        data={badges}
        keyExtractor={(b) => b.key}
        numColumns={3}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <View style={[styles.badge, !item.earned && styles.badgeLocked]}>
            <Text style={[styles.badgeIcon, !item.earned && styles.iconLocked]}>
              {item.icon}
            </Text>
            <Text
              style={[styles.badgeLabel, !item.earned && styles.labelLocked]}
              numberOfLines={2}
            >
              {item.label}
            </Text>
          </View>
        )}
      />
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
  row: { gap: SPACING.sm, marginBottom: SPACING.sm },
  badge: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    ...SHADOWS.sm,
  },
  badgeLocked: {
    backgroundColor: COLORS.light,
    opacity: 0.5,
  },
  badgeIcon: { fontSize: 28, marginBottom: 4 },
  iconLocked: { opacity: 0.4 },
  badgeLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.dark,
    textAlign: "center",
    fontWeight: "500",
  },
  labelLocked: { color: COLORS.warm },
});
