/* ─── Makale Listesi ─── */

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

export default function ArticlesListScreen({ navigation }: any) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ articles: Article[] }>("/api/public/articles")
      .then((res) => setArticles(res.articles))
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
        data={articles}
        keyExtractor={(a) => a.slug}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.header}>Makaleler</Text>}
        ListEmptyComponent={<Text style={styles.empty}>Henüz makale yok.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("ArticleReader", { article: item })}
            activeOpacity={0.7}
          >
            <Text style={styles.cardCategory}>{item.category}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardExcerpt} numberOfLines={2}>
              {item.description}
            </Text>
            <Text style={styles.cardMeta}>
              {item.author}{item.date ? ` · ${new Date(item.date).toLocaleDateString("tr-TR")}` : ""}
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
  cardExcerpt: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.warm,
    lineHeight: 18,
    marginBottom: 4,
  },
  cardMeta: { fontSize: FONTS.sizes.xs, color: COLORS.warm },
});
