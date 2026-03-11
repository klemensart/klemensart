/* ─── Atölye Listesi ─── */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../../config/theme";
import { apiFetch } from "../../services/api";
import { API_BASE_URL } from "../../config/api";

interface Workshop {
  id: string;
  title: string;
  description: string | null;
  total_sessions: number;
  is_live: boolean;
  slug: string | null;
  price: string | null;
  for_sale: boolean;
  image: string | null;
  next_session_date: string | null;
}

export default function WorkshopsListScreen({ navigation }: any) {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ workshops: Workshop[] }>("/api/public/workshops")
      .then((res) => setWorkshops(res.workshops))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const resolveImage = (img: string | null) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `${API_BASE_URL}${img}`;
  };

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
        ListEmptyComponent={<Text style={styles.empty}>Henüz atölye yok.</Text>}
        renderItem={({ item }) => {
          const imageUri = resolveImage(item.image);
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate("WorkshopDetail", { workshop: item })
              }
              activeOpacity={0.7}
            >
              {imageUri && (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  {item.is_live && (
                    <View style={styles.liveBadge}>
                      <Text style={styles.liveText}>CANLI</Text>
                    </View>
                  )}
                </View>
                {item.description ? (
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
                <View style={styles.cardFooter}>
                  <Text style={styles.cardMeta}>
                    {item.total_sessions} ders
                  </Text>
                  {item.price && (
                    <Text style={styles.cardPrice}>{item.price}</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: SPACING.lg, paddingTop: SPACING.sm },
  empty: {
    fontSize: FONTS.sizes.md,
    color: COLORS.warm,
    textAlign: "center",
    marginTop: SPACING.xxl,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: "hidden",
    ...SHADOWS.sm,
  },
  cardImage: {
    width: "100%",
    height: 150,
  },
  cardBody: {
    padding: SPACING.lg,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
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
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardMeta: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.warm,
  },
  cardPrice: {
    fontSize: FONTS.sizes.md,
    fontWeight: "700",
    color: COLORS.coral,
  },
});
