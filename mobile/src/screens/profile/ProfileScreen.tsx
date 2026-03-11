/* ─── Profil Ekranı ─── */

import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../../config/theme";
import { useAuthStore } from "../../stores/auth-store";
import { supabase } from "../../config/supabase";

import XpDashboard from "./components/XpDashboard";
import BadgeCollection from "./components/BadgeCollection";
import StatsTab from "./components/StatsTab";

export default function ProfileScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.icon}>👤</Text>
          <Text style={styles.title}>Giriş Yap</Text>
          <Text style={styles.sub}>
            Profiline erişmek için giriş yapmalısın
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginText}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      {/* XP Dashboard */}
      <XpDashboard />

      {/* Rozetler */}
      <BadgeCollection />

      {/* İstatistikler */}
      <StatsTab />

      {/* Hesap bilgileri */}
      <View style={styles.accountCard}>
        <Text style={styles.sectionTitle}>Hesap</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.userId}>ID: {user.id.slice(0, 8)}...</Text>

        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={() => supabase.auth.signOut()}
        >
          <Text style={styles.signOutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  content: { padding: SPACING.xl },
  icon: { fontSize: 48, marginBottom: 12 },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: 8,
  },
  sub: {
    fontSize: FONTS.sizes.md,
    color: COLORS.warm,
    textAlign: "center",
    marginBottom: SPACING.xxl,
  },
  loginBtn: {
    backgroundColor: COLORS.coral,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  loginText: {
    fontSize: FONTS.sizes.md,
    fontWeight: "700",
    color: "#fff",
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: SPACING.md,
  },
  accountCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    ...SHADOWS.sm,
  },
  email: {
    fontSize: FONTS.sizes.md,
    color: COLORS.dark,
    marginBottom: 4,
  },
  userId: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.warm,
    marginBottom: SPACING.xl,
  },
  signOutBtn: {
    backgroundColor: COLORS.light,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  signOutText: {
    fontSize: FONTS.sizes.md,
    fontWeight: "600",
    color: COLORS.coral,
  },
});
