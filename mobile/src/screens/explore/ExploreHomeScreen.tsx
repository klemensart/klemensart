/* ─── Keşfet Ana Ekranı ─── */

import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../../config/theme";

const SECTIONS = [
  { icon: "🎭", title: "Etkinlikler", desc: "Ankara'daki kültür-sanat etkinlikleri", screen: "EventsList" },
  { icon: "📰", title: "Makaleler", desc: "Derinlemesine kültür yazıları", screen: "ArticlesList" },
  { icon: "🎨", title: "Atölyeler", desc: "Sanat atölyeleri ve kurslar", screen: "WorkshopsList" },
  { icon: "🖼️", title: "Sergiler", desc: "3D sanal sergi deneyimi", screen: "Exhibition" },
  { icon: "📝", title: "Testler", desc: "Kültür-sanat bilgi testleri", screen: "Test" },
];

export default function ExploreHomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      <Text style={styles.header}>Keşfet</Text>
      <Text style={styles.subtitle}>Kültür-sanat dünyasını keşfet</Text>

      <View style={styles.grid}>
        {SECTIONS.map((s) => (
          <TouchableOpacity
            key={s.title}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(s.screen)}
          >
            <Text style={styles.cardIcon}>{s.icon}</Text>
            <Text style={styles.cardTitle}>{s.title}</Text>
            <Text style={styles.cardDesc}>{s.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: SPACING.xl },
  header: {
    fontSize: FONTS.sizes.hero,
    fontWeight: "700",
    color: COLORS.dark,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.warm,
    marginTop: 4,
    marginBottom: SPACING.xxl,
  },
  grid: { gap: SPACING.lg },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    ...SHADOWS.sm,
  },
  cardIcon: { fontSize: 32, marginBottom: SPACING.sm },
  cardTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: "600",
    color: COLORS.dark,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.warm,
    lineHeight: 18,
  },
});
