/* ─── Genel Buton Bileşeni ─── */

import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { COLORS, FONTS, RADIUS, SHADOWS } from "../../config/theme";

interface Props {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  disabled?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
}: Props) {
  const bg =
    variant === "primary"
      ? COLORS.coral
      : variant === "secondary"
      ? COLORS.light
      : "transparent";
  const textColor =
    variant === "primary" ? "#fff" : COLORS.dark;

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor: bg },
        variant === "primary" && SHADOWS.sm,
        disabled && { opacity: 0.5 },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  text: {
    fontSize: FONTS.sizes.md,
    fontWeight: "600",
  },
});
