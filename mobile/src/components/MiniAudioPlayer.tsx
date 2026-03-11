/* ─── Mini Floating Audio Player ─── */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from "../config/theme";
import { useAudio } from "../hooks/useAudio";
import ProgressBar from "./ui/ProgressBar";

export default function MiniAudioPlayer() {
  const { isPlaying, currentTitle, position, duration, pause, play, stop, currentUrl } =
    useAudio();

  if (!currentUrl) return null;

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity
          onPress={() =>
            isPlaying ? pause() : play(currentUrl, currentTitle ?? "")
          }
          style={styles.playBtn}
        >
          <Text style={styles.playIcon}>{isPlaying ? "⏸" : "▶️"}</Text>
        </TouchableOpacity>

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {currentTitle}
          </Text>
          <ProgressBar progress={progress} height={3} />
        </View>

        <TouchableOpacity onPress={stop} style={styles.closeBtn}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 90,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.dark,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.lg,
    zIndex: 50,
  },
  row: { flexDirection: "row", alignItems: "center" },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.coral,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  playIcon: { fontSize: 14 },
  info: { flex: 1, marginRight: SPACING.sm },
  title: {
    fontSize: FONTS.sizes.sm,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: { fontSize: 12, color: "#fff" },
});
