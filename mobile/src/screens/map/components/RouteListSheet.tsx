/* ─── Rota Listesi Bottom Sheet ─── */

import React, { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { ROUTES, type Route } from "../../../shared/harita-data";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../../../config/theme";
import { useMapStore } from "../../../stores/map-store";

const SNAP_POINTS = ["40%", "85%"];

function RouteCard({ route, onSelect }: { route: Route; onSelect: (r: Route) => void }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onSelect(route)}
      activeOpacity={0.7}
    >
      <View style={[styles.cardIcon, { backgroundColor: route.color }]}>
        <Text style={styles.cardEmoji}>{route.icon}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{route.title}</Text>
        <Text style={styles.cardMeta}>
          {route.stops.length} durak · {route.duration}
          {route.fx ? ` · ${route.fx.toUpperCase()}` : ""}
          {route.nightOnly ? " · 🌙 Gece" : ""}
        </Text>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {route.desc}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function RouteListSheet() {
  const { mode, selectRoute } = useMapStore();
  const sheetRef = useRef<BottomSheet>(null);

  if (mode !== "routes") return null;

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={SNAP_POINTS}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.content}>
        <Text style={styles.header}>Kültür Rotaları</Text>
        <Text style={styles.sub}>13 tematik rota ile Ankara'yı keşfet</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {ROUTES.map((route) => (
            <RouteCard key={route.id} route={route} onSelect={selectRoute} />
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...SHADOWS.lg,
  },
  handle: { backgroundColor: COLORS.light, width: 40 },
  content: { flex: 1, paddingHorizontal: SPACING.xl },
  header: {
    fontSize: FONTS.sizes.xl,
    fontWeight: "700",
    color: COLORS.dark,
    marginTop: SPACING.sm,
  },
  sub: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.warm,
    marginBottom: SPACING.lg,
  },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.light,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  cardEmoji: { fontSize: 22 },
  cardBody: { flex: 1 },
  cardTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: 2,
  },
  cardMeta: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.warm,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.dark,
    lineHeight: 18,
  },
});
