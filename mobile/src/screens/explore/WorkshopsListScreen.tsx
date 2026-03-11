/* ─── Atölye Listesi ─── */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../../config/theme";
import { apiFetch } from "../../services/api";

interface Workshop {
  id: number;
  title: string;
  description: string;
  total_sessions: number;
  is_live: boolean;
}

export default function WorkshopsListScreen({ navigation }: any) {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Workshop[]>("/api/workshops")
      .then(setWorkshops)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.coral} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={workshops}
        keyExtractor={(w) => String(w.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.header}>Atölyeler</Text>}
        ListEmptyComponent={<Text style={styles.empty}>Henüz atölye yok.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("WorkshopDetail", { workshop: item })}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.is_live && (
                <View style={styles.liveBadge}>
                  <Text style={styles.liveText}>CANLI</Text>
                </View>
              )}
            </View>
            <Text style={styles.cardDesc} numberOfLines={2}>
              {item.description}
            </Text>
            <Text style={styles.cardMeta}>
              {item.total_sessions} ders
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: SPACING.xl, paddingTop: 60 },
  header: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: SPACING.xl,
  },
  empty: { fontSize: FONTS.sizes.md, color: COLORS.warm, textAlign: "center" },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: "600",
    color: COLORS.dark,
    flex: 1,
  },
  liveBadge: {
    backgroundColor: "#E53935",
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  liveText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: "700",
    color: "#fff",
  },
  cardDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.warm,
    lineHeight: 18,
    marginBottom: 4,
  },
  cardMeta: { fontSize: FONTS.sizes.xs, color: COLORS.warm },
});
