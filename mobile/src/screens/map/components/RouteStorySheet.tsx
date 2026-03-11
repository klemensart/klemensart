/* ─── Rota Hikaye Bottom Sheet (Durak Detay) ─── */

import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../../../config/theme";
import { useMapStore } from "../../../stores/map-store";

const SNAP_POINTS = ["30%", "65%"];

export default function RouteStorySheet() {
  const { selectedRoute, activeStopIndex, setActiveStop } = useMapStore();
  const sheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (selectedRoute) {
      sheetRef.current?.snapToIndex(0);
    }
  }, [selectedRoute, activeStopIndex]);

  if (!selectedRoute) return null;

  const stop = selectedRoute.stops[activeStopIndex];
  const total = selectedRoute.stops.length;
  const isFirst = activeStopIndex === 0;
  const isLast = activeStopIndex === total - 1;

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={SNAP_POINTS}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.content}>
        {/* Rota başlığı */}
        <View style={styles.routeHeader}>
          <Text style={styles.routeIcon}>{selectedRoute.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.routeTitle}>{selectedRoute.title}</Text>
            <Text style={styles.routeMeta}>
              Durak {activeStopIndex + 1}/{total}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              useMapStore.getState().selectRoute(null);
            }}
            style={styles.closeBtn}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Progress dots */}
        <View style={styles.dots}>
          {selectedRoute.stops.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setActiveStop(i)}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === activeStopIndex
                      ? selectedRoute.color
                      : i < activeStopIndex
                      ? selectedRoute.color + "60"
                      : COLORS.light,
                },
              ]}
            />
          ))}
        </View>

        {/* Durak hikayesi */}
        <Text style={styles.stopName}>{stop.name}</Text>
        <Text style={styles.stopStory}>{stop.story}</Text>

        {/* Navigasyon butonları */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, isFirst && styles.navBtnDisabled]}
            onPress={() => !isFirst && setActiveStop(activeStopIndex - 1)}
            disabled={isFirst}
          >
            <Text style={[styles.navText, isFirst && styles.navTextDisabled]}>
              ← Önceki
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navBtn,
              styles.navBtnPrimary,
              isLast && styles.navBtnDisabled,
            ]}
            onPress={() => !isLast && setActiveStop(activeStopIndex + 1)}
            disabled={isLast}
          >
            <Text
              style={[
                styles.navText,
                styles.navTextPrimary,
                isLast && styles.navTextDisabled,
              ]}
            >
              {isLast ? "Tamamlandı ✓" : "Sonraki →"}
            </Text>
          </TouchableOpacity>
        </View>
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

  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  routeIcon: { fontSize: 28, marginRight: SPACING.md },
  routeTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: "700",
    color: COLORS.dark,
  },
  routeMeta: { fontSize: FONTS.sizes.xs, color: COLORS.warm },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.light,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { fontSize: 14, color: COLORS.warm },

  dots: {
    flexDirection: "row",
    gap: 6,
    marginBottom: SPACING.lg,
  },
  dot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },

  stopName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
  stopStory: {
    fontSize: FONTS.sizes.md,
    color: COLORS.dark,
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },

  navRow: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  navBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    backgroundColor: COLORS.light,
  },
  navBtnPrimary: {
    backgroundColor: COLORS.coral,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navText: {
    fontSize: FONTS.sizes.md,
    fontWeight: "600",
    color: COLORS.dark,
  },
  navTextPrimary: { color: "#fff" },
  navTextDisabled: { color: COLORS.warm },
});
