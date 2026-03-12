/* ─── Yazı Okuma Ekranı ─── */

import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  Image,
  TouchableOpacity,
} from "react-native";
import RenderHtml, {
  defaultSystemFonts,
  type MixedStyleDeclaration,
  type RenderersProps,
} from "react-native-render-html";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../../config/theme";
import { apiFetch } from "../../services/api";
import { API_BASE_URL } from "../../config/api";
import { useXp } from "../../hooks/useXp";
import { useLocaStore } from "../../stores/loca-store";

const BASE_URL = "https://klemensart.com";

export default function ArticleReaderScreen({ route }: any) {
  const { article } = route.params;
  const { width } = useWindowDimensions();
  const contentWidth = width - SPACING.xl * 2;
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { earnXp } = useXp();
  const xpEarned = useRef(false);
  const { toggleArticle, isArticleSaved, addToHistory } = useLocaStore();
  const saved = isArticleSaved(article.slug);

  useEffect(() => {
    apiFetch<{ contentHtml: string }>(`/api/public/articles/${article.slug}`)
      .then((data) => {
        // Göreceli image yollarını absolute URL'ye çevir
        let processed = data.contentHtml || "";
        processed = processed.replace(
          /src="\/([^"]+)"/g,
          `src="${BASE_URL}/$1"`
        );
        setHtml(processed);

        // Okuma geçmişine ekle
        addToHistory({
          slug: article.slug,
          title: article.title,
          author: article.author ?? "",
          category: article.category ?? "",
          image: article.image ?? "",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [article.slug]);

  // Makale sonuna ulaşıldığında XP kazandır (bir kez)
  const handleScroll = (event: any) => {
    if (xpEarned.current) return;
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isEnd =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 80;
    if (isEnd) {
      xpEarned.current = true;
      earnXp("article_read");
    }
  };

  // Kapak görseli
  const coverImage = article.image
    ? article.image.startsWith("http")
      ? article.image
      : `${BASE_URL}${article.image}`
    : null;

  // HTML render ayarları
  const tagsStyles: Record<string, MixedStyleDeclaration> = useMemo(
    () => ({
      body: {
        fontSize: 17,
        lineHeight: 30,
        color: COLORS.dark,
      },
      p: {
        marginTop: 0,
        marginBottom: 16,
      },
      h2: {
        fontSize: 22,
        fontWeight: "700" as const,
        color: COLORS.dark,
        marginTop: 28,
        marginBottom: 12,
        lineHeight: 30,
      },
      h3: {
        fontSize: 19,
        fontWeight: "600" as const,
        color: COLORS.dark,
        marginTop: 24,
        marginBottom: 10,
        lineHeight: 26,
      },
      blockquote: {
        borderLeftWidth: 3,
        borderLeftColor: COLORS.coral,
        paddingLeft: 16,
        marginLeft: 0,
        marginRight: 0,
        marginTop: 16,
        marginBottom: 16,
        fontStyle: "italic" as const,
        color: COLORS.warm,
      },
      a: {
        color: COLORS.coral,
        textDecorationLine: "none" as const,
      },
      img: {
        marginTop: 8,
        marginBottom: 8,
      },
    }),
    []
  );

  // Görseller için özel renderer — düzgün boyutlandırma
  const renderersProps: RenderersProps = useMemo(
    () => ({
      img: {
        enableExperimentalPercentWidth: true,
      },
    }),
    []
  );

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
      {/* Kapak görseli */}
      {coverImage && (
        <Image
          source={{ uri: coverImage }}
          style={styles.cover}
          resizeMode="cover"
        />
      )}

      {/* Kategori badge */}
      {article.category && (
        <Text style={styles.category}>{article.category}</Text>
      )}

      {/* Başlık */}
      <Text style={styles.title}>{article.title}</Text>

      {/* Yazar + Tarih + Kaydet */}
      <View style={styles.metaRow}>
        <View style={styles.metaLeft}>
          {article.author && (
            <Text style={styles.author}>{article.author}</Text>
          )}
          {article.date && (
            <Text style={styles.date}>
              {new Date(article.date).toLocaleDateString("tr-TR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.saveBtn, saved && styles.saveBtnActive]}
          onPress={() =>
            toggleArticle({
              slug: article.slug,
              title: article.title,
              author: article.author ?? "",
              category: article.category ?? "",
              image: article.image ?? "",
            })
          }
          activeOpacity={0.7}
        >
          <Text style={styles.saveIcon}>{saved ? "🔖" : "📑"}</Text>
          <Text style={[styles.saveText, saved && styles.saveTextActive]}>
            {saved ? "Kaydedildi" : "Kaydet"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Ayırıcı çizgi */}
      <View style={styles.divider} />

      {/* İçerik */}
      {html && (
        <RenderHtml
          contentWidth={contentWidth}
          source={{ html }}
          tagsStyles={tagsStyles}
          renderersProps={renderersProps}
          defaultTextProps={{ selectable: true }}
          systemFonts={[...defaultSystemFonts]}
          enableExperimentalMarginCollapsing
        />
      )}

      {/* Etiketler */}
      {article.tags && article.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {article.tags.map((tag: string) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { paddingBottom: 20 },

  cover: {
    width: "100%",
    height: 240,
    marginBottom: SPACING.lg,
  },

  category: {
    fontSize: FONTS.sizes.xs,
    fontWeight: "700",
    color: COLORS.coral,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    paddingHorizontal: SPACING.xl,
    marginBottom: 8,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.dark,
    lineHeight: 34,
    paddingHorizontal: SPACING.xl,
    marginBottom: 12,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  metaLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  author: {
    fontSize: FONTS.sizes.sm,
    fontWeight: "600",
    color: COLORS.dark,
  },
  date: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.warm,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
    ...SHADOWS.sm,
  },
  saveBtnActive: {
    backgroundColor: "#FFF3E0",
  },
  saveIcon: { fontSize: 14 },
  saveText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: "600",
    color: COLORS.warm,
  },
  saveTextActive: {
    color: COLORS.coral,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.light ?? "#eee",
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },

  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
  },
  tag: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.light ?? "#eee",
  },
  tagText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.warm,
  },
});
