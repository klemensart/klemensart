/* ─── Etkinlik Detay ─── */

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { COLORS, FONTS, SPACING, RADIUS } from "../../config/theme";

export default function EventDetailScreen({ route }: any) {
  const { event } = route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.category}>{event.category}</Text>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.meta}>
        📍 {event.venue} · 📅 {new Date(event.date).toLocaleDateString("tr-TR")}
      </Text>
      <View style={styles.divider} />
      <Text style={styles.desc}>{event.description ?? "Detaylar yakında..."}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: SPACING.xl, paddingTop: 60 },
  category: {
    fontSize: FONTS.sizes.xs,
    fontWeight: "700",
    color: COLORS.coral,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
  meta: {
    fontSize: FONTS.sizes.md,
    color: COLORS.warm,
    marginBottom: SPACING.lg,
  },
  divider: { height: 1, backgroundColor: COLORS.light, marginVertical: SPACING.lg },
  desc: {
    fontSize: FONTS.sizes.md,
    color: COLORS.dark,
    lineHeight: 24,
  },
});
