/* ─── Check-in Sonuç Animasyonu ─── */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { COLORS, FONTS, SPACING, RADIUS } from "../../../config/theme";
import type { CheckInStatus } from "../../../hooks/useCheckIn";

interface Props {
  status: CheckInStatus;
  stars: number;
  onDismiss: () => void;
}

export default function CheckInResult({ status, stars, onDismiss }: Props) {
  if (status === "idle" || status === "loading") return null;

  const config: Record<string, { icon: string; title: string; sub: string }> = {
    success: {
      icon: "🎉",
      title: `+${stars} Yıldız Kazandın!`,
      sub: "Bu mekanı keşfettin. Harika!",
    },
    too_far: {
      icon: "📍",
      title: "Çok Uzaktasın",
      sub: `Check-in için mekana ${200}m içinde olmalısın.`,
    },
    already: {
      icon: "✓",
      title: "Zaten Ziyaret Ettin",
      sub: "Bu mekanı daha önce keşfetmiştin.",
    },
    no_auth: {
      icon: "🔑",
      title: "Giriş Gerekli",
      sub: "Check-in yapmak için giriş yapmalısın.",
    },
    error: {
      icon: "⚠️",
      title: "Bir Hata Oluştu",
      sub: "Lütfen tekrar dene.",
    },
  };

  const c = config[status];
  if (!c) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.icon}>{c.icon}</Text>
          <Text style={styles.title}>{c.title}</Text>
          <Text style={styles.sub}>{c.sub}</Text>
          <TouchableOpacity style={styles.btn} onPress={onDismiss}>
            <Text style={styles.btnText}>Tamam</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
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
  icon: { fontSize: 48, marginBottom: SPACING.md },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: SPACING.sm,
    textAlign: "center",
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
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  btnText: {
    fontSize: FONTS.sizes.md,
    fontWeight: "700",
    color: "#fff",
  },
});
