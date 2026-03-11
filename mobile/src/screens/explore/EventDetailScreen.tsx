/* ─── Etkinlik Detay ─── */

import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from "react-native";
import { COLORS, FONTS, SPACING, RADIUS } from "../../config/theme";

export default function EventDetailScreen({ route }: any) {
  const { event } = route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.category}>{event.event_type}</Text>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.meta}>
        {event.venue ? `📍 ${event.venue}` : ""}
        {event.event_date ? ` · 📅 ${new Date(event.event_date).toLocaleDateString("tr-TR")}` : ""}
      </Text>
      {event.price_info && (
        <Text style={styles.price}>💰 {event.price_info}</Text>
      )}
      <View style={styles.divider} />
      <Text style={styles.desc}>{event.description ?? "Detaylar yakında..."}</Text>
      {event.ai_comment && (
        <>
          <View style={styles.divider} />
          <Text style={styles.commentLabel}>Klemens Art Yorumu</Text>
          <Text style={styles.desc}>{event.ai_comment}</Text>
        </>
      )}
      {event.source_url && (
        <TouchableOpacity
          style={styles.linkBtn}
          onPress={() => Linking.openURL(event.source_url)}
        >
          <Text style={styles.linkText}>Etkinlik Sayfası →</Text>
        </TouchableOpacity>
      )}
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
    marginBottom: 4,
  },
  price: {
    fontSize: FONTS.sizes.md,
    color: COLORS.dark,
    fontWeight: "600",
    marginBottom: SPACING.lg,
  },
  divider: { height: 1, backgroundColor: COLORS.light, marginVertical: SPACING.lg },
  desc: {
    fontSize: FONTS.sizes.md,
    color: COLORS.dark,
    lineHeight: 24,
  },
  commentLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: "700",
    color: COLORS.coral,
    marginBottom: SPACING.sm,
  },
  linkBtn: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.coral,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: "center",
  },
  linkText: {
    fontSize: FONTS.sizes.md,
    fontWeight: "700",
    color: "#fff",
  },
});
