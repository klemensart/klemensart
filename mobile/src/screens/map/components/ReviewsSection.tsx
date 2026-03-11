/* ─── Yorumlar Bölümü (read-only) ─── */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS, SPACING, RADIUS } from "../../../config/theme";

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface Props {
  reviews: Review[];
  averageRating: number | null;
}

function Stars({ rating }: { rating: number }) {
  return (
    <Text style={styles.stars}>
      {Array.from({ length: 5 }, (_, i) => (i < rating ? "★" : "☆")).join("")}
    </Text>
  );
}

export default function ReviewsSection({ reviews, averageRating }: Props) {
  if (reviews.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Henüz yorum yok</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Ortalama puan */}
      {averageRating !== null && (
        <View style={styles.avgRow}>
          <Stars rating={Math.round(averageRating)} />
          <Text style={styles.avgText}>
            {averageRating.toFixed(1)} ({reviews.length} yorum)
          </Text>
        </View>
      )}

      {/* Son 5 yorum */}
      {reviews.slice(0, 5).map((r) => (
        <View key={r.id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <Text style={styles.userName}>{r.user_name}</Text>
            <Stars rating={r.rating} />
          </View>
          <Text style={styles.comment}>{r.comment}</Text>
          <Text style={styles.date}>
            {new Date(r.created_at).toLocaleDateString("tr-TR")}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: SPACING.lg },
  empty: { paddingVertical: SPACING.xl, alignItems: "center" },
  emptyText: { fontSize: FONTS.sizes.sm, color: COLORS.warm },
  avgRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  stars: { fontSize: 16, color: "#FFB300", letterSpacing: 2 },
  avgText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.warm,
    marginLeft: SPACING.sm,
  },
  reviewCard: {
    backgroundColor: COLORS.light,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: "600",
    color: COLORS.dark,
  },
  comment: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.dark,
    lineHeight: 18,
    marginBottom: 4,
  },
  date: { fontSize: FONTS.sizes.xs, color: COLORS.warm },
});
