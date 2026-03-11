/* ─── Profil Ekranı ─── */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../../config/theme";
import { useAuthStore } from "../../stores/auth-store";
import { supabase } from "../../config/supabase";
import { apiFetch } from "../../services/api";

import XpDashboard from "./components/XpDashboard";
import BadgeCollection from "./components/BadgeCollection";
import StatsTab from "./components/StatsTab";

interface Purchase {
  id: number;
  workshop_title: string;
  purchased_at: string;
  expires_at: string | null;
}

export default function ProfileScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);

  // Kullanıcı giriş yaptıysa satın almalarını çek
  useEffect(() => {
    if (!user) {
      setPurchases([]);
      return;
    }
    setLoadingPurchases(true);
    apiFetch<{ purchases: Purchase[] }>("/api/public/me")
      .then((res) => setPurchases(res.purchases))
      .catch(() => {})
      .finally(() => setLoadingPurchases(false));
  }, [user]);

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.icon}>👤</Text>
          <Text style={styles.title}>Giriş Yap</Text>
          <Text style={styles.sub}>
            Profiline erişmek, yıldızlarını ve atölyelerini görmek için giriş yap
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

  const displayName =
    (user.user_metadata as any)?.full_name ??
    (user.user_metadata as any)?.name ??
    user.email?.split("@")[0] ??
    "Kullanıcı";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      {/* Hoş geldin */}
      <View style={styles.welcomeCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.welcomeInfo}>
          <Text style={styles.welcomeName}>{displayName}</Text>
          <Text style={styles.welcomeEmail}>{user.email}</Text>
        </View>
      </View>

      {/* XP Dashboard */}
      <XpDashboard />

      {/* Satın Alınan Atölyeler */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Atölyelerim</Text>
        {loadingPurchases ? (
          <ActivityIndicator
            size="small"
            color={COLORS.coral}
            style={{ marginVertical: SPACING.md }}
          />
        ) : purchases.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎨</Text>
            <Text style={styles.emptyText}>
              Henüz bir atölye satın almadın
            </Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() =>
                navigation.navigate("Kesfet", {
                  screen: "WorkshopsList",
                })
              }
            >
              <Text style={styles.exploreBtnText}>Atölyeleri Keşfet</Text>
            </TouchableOpacity>
          </View>
        ) : (
          purchases.map((p) => (
            <View key={p.id} style={styles.purchaseRow}>
              <View style={styles.purchaseIcon}>
                <Text style={{ fontSize: 20 }}>🎓</Text>
              </View>
              <View style={styles.purchaseInfo}>
                <Text style={styles.purchaseTitle}>{p.workshop_title}</Text>
                <Text style={styles.purchaseDate}>
                  {new Date(p.purchased_at).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Rozetler */}
      <BadgeCollection />

      {/* İstatistikler */}
      <StatsTab />

      {/* Hesap */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Hesap</Text>
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
    lineHeight: 22,
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

  // Welcome card
  welcomeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    ...SHADOWS.sm,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.coral,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: "700",
    color: "#fff",
  },
  welcomeInfo: { flex: 1 },
  welcomeName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: "700",
    color: COLORS.dark,
  },
  welcomeEmail: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.warm,
    marginTop: 2,
  },

  // Sections
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: SPACING.md,
  },

  // Purchases
  purchaseRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light ?? "#f0f0f0",
  },
  purchaseIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFF3E0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  purchaseInfo: { flex: 1 },
  purchaseTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: "600",
    color: COLORS.dark,
  },
  purchaseDate: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.warm,
    marginTop: 2,
  },

  // Empty state
  emptyState: { alignItems: "center", paddingVertical: SPACING.md },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.warm,
    marginBottom: SPACING.md,
  },
  exploreBtn: {
    backgroundColor: COLORS.coral,
    borderRadius: RADIUS.full,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  exploreBtnText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: "600",
    color: "#fff",
  },

  // Sign out
  signOutBtn: {
    backgroundColor: COLORS.light ?? "#f5f5f5",
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
