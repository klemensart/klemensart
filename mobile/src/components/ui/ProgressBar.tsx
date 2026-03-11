/* ─── İlerleme Çubuğu ─── */

import React from "react";
import { View, StyleSheet } from "react-native";
import { COLORS, RADIUS } from "../../config/theme";

interface Props {
  progress: number; // 0-100
  color?: string;
  height?: number;
}

export default function ProgressBar({
  progress,
  color = COLORS.coral,
  height = 8,
}: Props) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View style={[styles.bg, { height }]}>
      <View
        style={[
          styles.fill,
          { width: `${clampedProgress}%`, backgroundColor: color, height },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    width: "100%",
    backgroundColor: COLORS.light,
    borderRadius: RADIUS.full,
    overflow: "hidden",
  },
  fill: {
    borderRadius: RADIUS.full,
  },
});
