/* ─── Atölye Detay ─── */

import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../../config/theme";

export default function WorkshopDetailScreen({ route, navigation }: any) {
  const { workshop } = route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{workshop.title}</Text>
      {workshop.is_live && (
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>CANLI ATÖLYE</Text>
        </View>
      )}
      <Text style={styles.desc}>{workshop.description}</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{workshop.total_sessions}</Text>
          <Text style={styles.statLabel}>Ders</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.buyBtn}
        onPress={() => navigation.navigate("PaymentWebView", { workshopId: workshop.id })}
        activeOpacity={0.7}
      >
        <Text style={styles.buyText}>Satın Al</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: SPACING.xl, paddingTop: 60 },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
  liveBadge: {
    backgroundColor: "#E53935",
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: SPACING.md,
  },
  liveText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: "700",
    color: "#fff",
  },
  desc: {
    fontSize: FONTS.sizes.md,
    color: COLORS.dark,
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: SPACING.xxl,
  },
  stat: { alignItems: "center", marginRight: SPACING.xxl },
  statNum: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: "700",
    color: COLORS.dark,
  },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.warm },
  buyBtn: {
    backgroundColor: COLORS.coral,
    borderRadius: RADIUS.lg,
    paddingVertical: 16,
    alignItems: "center",
    ...SHADOWS.md,
  },
  buyText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: "700",
    color: "#fff",
  },
});
