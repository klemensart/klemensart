/* ─── Kart Bileşeni ─── */

import React from "react";
import { View, StyleSheet, type ViewStyle } from "react-native";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../../config/theme";

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function Card({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    ...SHADOWS.sm,
  },
});
