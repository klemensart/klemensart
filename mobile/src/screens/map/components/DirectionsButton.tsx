/* ─── Yol Tarifi Butonu ─── */

import React from "react";
import { TouchableOpacity, Text, StyleSheet, Platform, Linking } from "react-native";
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from "../../../config/theme";

interface Props {
  lat: number;
  lng: number;
  name: string;
}

export default function DirectionsButton({ lat, lng, name }: Props) {
  const handlePress = () => {
    const encodedName = encodeURIComponent(name);
    const url = Platform.select({
      ios: `maps:?daddr=${lat},${lng}&q=${encodedName}`,
      android: `google.navigation:q=${lat},${lng}`,
    });
    if (url) Linking.openURL(url);
  };

  return (
    <TouchableOpacity style={styles.btn} onPress={handlePress} activeOpacity={0.7}>
      <Text style={styles.icon}>🧭</Text>
      <Text style={styles.label}>Yol Tarifi Al</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.coral,
    borderRadius: RADIUS.lg,
    paddingVertical: 12,
    paddingHorizontal: SPACING.xl,
    ...SHADOWS.sm,
  },
  icon: { fontSize: 16, marginRight: 8 },
  label: {
    fontSize: FONTS.sizes.md,
    fontWeight: "600",
    color: "#fff",
  },
});
