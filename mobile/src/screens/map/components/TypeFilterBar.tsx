/* ─── Kategori Filtre Bar (Yatay ScrollView) ─── */

import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, FONTS, SPACING, RADIUS } from "../../../config/theme";
import { TYPE_LABELS, type PlaceType } from "../../../shared/harita-data";
import { useMapStore } from "../../../stores/map-store";

const TYPES = Object.keys(TYPE_LABELS) as PlaceType[];

const TYPE_EMOJIS: Record<PlaceType, string> = {
  müze: "🏛️",
  galeri: "🖼️",
  konser: "🎵",
  tiyatro: "🎭",
  tarihi: "🏰",
  edebiyat: "📚",
  miras: "🛡️",
};

export default function TypeFilterBar() {
  const { activeFilter, setFilter } = useMapStore();

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Tümü butonu */}
        <TouchableOpacity
          style={[
            styles.chip,
            activeFilter === null && { backgroundColor: COLORS.coral, borderColor: COLORS.coral },
          ]}
          onPress={() => setFilter(null)}
          activeOpacity={0.7}
        >
          <Text style={styles.chipEmoji}>📍</Text>
          <Text
            style={[
              styles.chipLabel,
              activeFilter === null && { color: "#fff" },
            ]}
          >
            Tümü
          </Text>
        </TouchableOpacity>

        {TYPES.map((type) => {
          const isActive = activeFilter === type;
          const color = COLORS.type[type];
          return (
            <TouchableOpacity
              key={type}
              style={[
                styles.chip,
                isActive && { backgroundColor: color, borderColor: color },
              ]}
              onPress={() => setFilter(type)}
              activeOpacity={0.7}
            >
              <Text style={styles.chipEmoji}>{TYPE_EMOJIS[type]}</Text>
              <Text
                style={[
                  styles.chipLabel,
                  isActive && { color: "#fff" },
                ]}
              >
                {TYPE_LABELS[type]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  scroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: COLORS.light,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  chipEmoji: { fontSize: 14, marginRight: 6 },
  chipLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: "600",
    color: COLORS.dark,
  },
});
