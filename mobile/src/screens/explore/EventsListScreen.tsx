/* ─── Etkinlikler Listesi ─── */

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

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  venue: string | null;
  event_date: string | null;
  end_date: string | null;
  price_info: string | null;
  image_url: string | null;
  source_url: string | null;
  ai_comment: string | null;
}

export default function EventsListScreen({ navigation }: any) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ events: Event[] }>("/api/public/events")
      .then((res) => setEvents(res.events))
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
        data={events}
        keyExtractor={(e) => String(e.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.header}>Etkinlikler</Text>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>Henüz etkinlik yok.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("EventDetail", { event: item })}
            activeOpacity={0.7}
          >
            <Text style={styles.cardCategory}>{item.event_type}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>
              {item.venue ?? ""}{item.event_date ? ` · ${new Date(item.event_date).toLocaleDateString("tr-TR")}` : ""}
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
  cardCategory: {
    fontSize: FONTS.sizes.xs,
    fontWeight: "700",
    color: COLORS.coral,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: "600",
    color: COLORS.dark,
    marginBottom: 4,
  },
  cardMeta: { fontSize: FONTS.sizes.sm, color: COLORS.warm },
});
