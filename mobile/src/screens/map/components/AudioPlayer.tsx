/* ─── Rota Durağı Ses Oynatıcı ─── */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, FONTS, SPACING, RADIUS } from "../../../config/theme";
import { useAudio } from "../../../hooks/useAudio";

interface Props {
  audioUrl?: string;
  title: string;
}

export default function AudioPlayer({ audioUrl, title }: Props) {
  const { play, pause, isPlaying, currentUrl } = useAudio();

  if (!audioUrl) return null;

  const isThisPlaying = isPlaying && currentUrl === audioUrl;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => (isThisPlaying ? pause() : play(audioUrl, title))}
        activeOpacity={0.7}
      >
        <Text style={styles.icon}>{isThisPlaying ? "⏸" : "🎧"}</Text>
        <Text style={styles.label}>
          {isThisPlaying ? "Durakla" : "Dinle"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: SPACING.md },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.light,
    borderRadius: RADIUS.lg,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
  },
  icon: { fontSize: 16, marginRight: 8 },
  label: {
    fontSize: FONTS.sizes.sm,
    fontWeight: "600",
    color: COLORS.dark,
  },
});
