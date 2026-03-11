/* ─── Ünvan Atlama Kutlaması (Full-screen Modal) ─── */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { COLORS, FONTS, SPACING, RADIUS } from "../config/theme";
import { useGamificationStore } from "../stores/gamification-store";

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export default function LevelUpModal({ visible, onDismiss }: Props) {
  const { rank } = useGamificationStore();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.confetti}>🎉</Text>
          <Text style={styles.title}>Ünvan Atlama!</Text>
          <Text style={styles.rankIcon}>{rank.icon}</Text>
          <Text style={styles.rankName}>{rank.name}</Text>
          <Text style={styles.sub}>
            Tebrikler! Yeni ünvanına kavuştun.
          </Text>

          <TouchableOpacity style={styles.btn} onPress={onDismiss}>
            <Text style={styles.btnText}>Harika!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xxl,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxxl,
    alignItems: "center",
    width: "100%",
  },
  confetti: { fontSize: 48, marginBottom: SPACING.md },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: SPACING.lg,
  },
  rankIcon: { fontSize: 64, marginBottom: SPACING.sm },
  rankName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: "700",
    color: COLORS.coral,
    marginBottom: SPACING.sm,
  },
  sub: {
    fontSize: FONTS.sizes.md,
    color: COLORS.warm,
    textAlign: "center",
    marginBottom: SPACING.xxl,
    lineHeight: 22,
  },
  btn: {
    backgroundColor: COLORS.coral,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    paddingHorizontal: 48,
  },
  btnText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: "700",
    color: "#fff",
  },
});
