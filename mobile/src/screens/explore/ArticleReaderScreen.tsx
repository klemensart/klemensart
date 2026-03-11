/* ─── Makale Okuma Ekranı ─── */

import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, StyleSheet, ActivityIndicator, useWindowDimensions } from "react-native";
import RenderHtml from "react-native-render-html";
import { COLORS, FONTS, SPACING } from "../../config/theme";
import { apiFetch } from "../../services/api";
import { useXp } from "../../hooks/useXp";

export default function ArticleReaderScreen({ route }: any) {
  const { article } = route.params;
  const { width } = useWindowDimensions();
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { earnXp } = useXp();

  useEffect(() => {
    apiFetch<{ html: string }>(`/api/articles/${article.slug}`)
      .then((data) => setHtml(data.html))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [article.slug]);

  // Makale sonuna ulaşıldığında XP kazandır
  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
    if (isEnd) {
      earnXp("article_read");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.coral} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      onScroll={handleScroll}
      scrollEventThrottle={400}
    >
      <Text style={styles.title}>{article.title}</Text>
      <Text style={styles.date}>
        {new Date(article.date).toLocaleDateString("tr-TR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </Text>
      {html && (
        <RenderHtml
          contentWidth={width - SPACING.xl * 2}
          source={{ html }}
          baseStyle={styles.htmlBase}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: SPACING.xl, paddingTop: 60 },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
  date: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.warm,
    marginBottom: SPACING.xl,
  },
  htmlBase: {
    fontSize: 16,
    color: COLORS.dark,
    lineHeight: 28,
  },
});
