/* ─── Atölye Detay ─── */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../../config/theme";
import { API_BASE_URL } from "../../config/api";

export default function WorkshopDetailScreen({ route, navigation }: any) {
  const { workshop } = route.params;

  const resolveImage = (img: string | null) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `${API_BASE_URL}${img}`;
  };

  const imageUri = resolveImage(workshop.image);

  const handleBuy = () => {
    if (!workshop.for_sale) {
      Alert.alert("Bilgi", "Bu atölye şu anda satışta değil.");
      return;
    }
    navigation.navigate("PaymentWebView", { workshopId: workshop.id });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Kapak görseli */}
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.cover} resizeMode="cover" />
      )}

      {/* Başlık + badge */}
      <View style={styles.header}>
        <Text style={styles.title}>{workshop.title}</Text>
        {workshop.is_live && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>CANLI</Text>
          </View>
        )}
      </View>

      {/* Açıklama */}
      {workshop.description ? (
        <Text style={styles.desc}>{workshop.description}</Text>
      ) : null}

      {/* Bilgi kartları */}
      <View style={styles.infoRow}>
        <View style={styles.infoCard}>
          <Text style={styles.infoNum}>{workshop.total_sessions}</Text>
          <Text style={styles.infoLabel}>Ders</Text>
        </View>
        {workshop.price && (
          <View style={styles.infoCard}>
            <Text style={styles.infoNum}>{workshop.price}</Text>
            <Text style={styles.infoLabel}>Fiyat</Text>
          </View>
        )}
        {workshop.next_session_date && (
          <View style={styles.infoCard}>
            <Text style={styles.infoNum}>
              {new Date(workshop.next_session_date).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "short",
              })}
            </Text>
            <Text style={styles.infoLabel}>Sonraki Ders</Text>
          </View>
        )}
      </View>

      {/* Satın al / Kayıt ol butonu */}
      <TouchableOpacity
        style={[styles.buyBtn, !workshop.for_sale && styles.buyBtnDisabled]}
        onPress={handleBuy}
        activeOpacity={0.7}
      >
        <Text style={styles.buyText}>
          {workshop.for_sale
            ? workshop.price
              ? `${workshop.price} — Satın Al`
              : "Kayıt Ol"
            : "Yakında"}
        </Text>
      </TouchableOpacity>

      {/* Alt bilgi */}
      <Text style={styles.note}>
        Ödeme sonrası atölye erişiminiz otomatik açılır.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  content: { paddingBottom: 40 },

  cover: {
    width: "100%",
    height: 220,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.xl,
    paddingBottom: 0,
    gap: 10,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: "700",
    color: COLORS.dark,
    flex: 1,
  },
  liveBadge: {
    backgroundColor: "#E53935",
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  liveText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: "700",
    color: "#fff",
  },

  desc: {
    fontSize: FONTS.sizes.md,
    color: COLORS.dark,
    lineHeight: 24,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },

  infoRow: {
    flexDirection: "row",
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    gap: SPACING.md,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: "center",
    ...SHADOWS.sm,
  },
  infoNum: {
    fontSize: FONTS.sizes.lg,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: 2,
  },
  infoLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.warm,
  },

  buyBtn: {
    backgroundColor: COLORS.coral,
    borderRadius: RADIUS.lg,
    paddingVertical: 16,
    alignItems: "center",
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.xxl,
    ...SHADOWS.md,
  },
  buyBtnDisabled: {
    backgroundColor: COLORS.warm,
    opacity: 0.5,
  },
  buyText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: "700",
    color: "#fff",
  },

  note: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.warm,
    textAlign: "center",
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
});
