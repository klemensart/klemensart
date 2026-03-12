/* ─── İçerikler Listesi (kategori filtreli) ─── */

import React, { useEffect, useState, useCallback } from "react";
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

interface Article {
  slug: string;
  title: string;
  description: string;
  author: string;
  category: string;
  date: string;
  image: string;
  tags: string[];
}

const CATEGORIES = [
  { key: null, label: "Tümü" },
  { key: "Odak", label: "Odak" },
  { key: "Kültür & Sanat", label: "Kültür & Sanat" },
  { key: "İlham Verenler", label: "İlham Verenler" },
  { key: "Kent & Yaşam", label: "Kent & Yaşam" },
];

export default function ArticlesListScreen({ navigation }: any) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const fetchArticles = useCallback((category: string | null) => {
    setLoading(true);
    const params = category ? `?category=${encodeURIComponent(category)}&limit=100` : "?limit=100";
    apiFetch<{ articles: Article[] }>(`/api/public/articles${params}`)
      .then((res) => setArticles(res.articles))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchArticles(activeCategory);
  }, [activeCategory, fetchArticles]);

  const handleCategoryPress = (key: string | null) => {
    setActiveCategory(key);
  };

  const resolveImage = (img: string) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `${API_BASE_URL}${img}`;
  };

  const renderItem = ({ item }: { item: Article }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("ArticleReader", { article: item })}
      activeOpacity={0.7}
    >
      {item.image ? (
        <Image
          source={{ uri: resolveImage(item.image)! }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      ) : null}
      <View style={styles.cardBody}>
        <Text style={styles.cardCategory}>
          {item.category?.replace("-", " · ") ?? ""}
        </Text>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.cardExcerpt} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.cardMeta}>
          {item.author}
          {item.date
            ? ` · ${new Date(item.date).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "short",
              })}`
            : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Kategori chip'leri */}
      <View style={styles.chipRow}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c.key ?? "all"}
            style={[
              styles.chip,
              activeCategory === c.key && styles.chipActive,
            ]}
            onPress={() => handleCategoryPress(c.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.chipText,
                activeCategory === c.key && styles.chipTextActive,
              ]}
            >
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.coral} />
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(a) => a.slug}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>Bu kategoride içerik yok.</Text>
          }
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  chipRow: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: 8,
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.warmLight ?? "#e8e0d8",
  },
  chipActive: {
    backgroundColor: COLORS.coral,
    borderColor: COLORS.coral,
  },
  chipText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: "600",
    color: COLORS.warm,
  },
  chipTextActive: {
    color: "#fff",
  },

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
    height: 160,
  },
  cardBody: {
    padding: SPACING.lg,
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
    marginBottom: 6,
    lineHeight: 22,
  },
  cardExcerpt: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.warm,
    lineHeight: 18,
    marginBottom: 6,
  },
  cardMeta: { fontSize: FONTS.sizes.xs, color: COLORS.warm },
});
