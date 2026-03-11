/* ─── Giriş Ekranı (Google OAuth + PKCE) ─── */

import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { supabase } from "../../config/supabase";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../../config/theme";

WebBrowser.maybeCompleteAuthSession();

const redirectUri = makeRedirectUri({ scheme: "klemensart" });

export default function LoginScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
        if (result.type === "success" && result.url) {
          // Extract tokens from URL
          const url = new URL(result.url);
          const params = new URLSearchParams(url.hash.slice(1) || url.search.slice(1));
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          }
        }
      }
    } catch (err) {
      console.error("Google login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.logo}>Klemens Art</Text>
        <Text style={styles.tagline}>Kültür-sanat ekosistemi</Text>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.googleBtn}
          activeOpacity={0.8}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.dark} />
          ) : (
            <Text style={styles.googleText}>Google ile Giriş Yap</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.skipText}>Misafir olarak devam et</Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          Devam ederek Kullanım Şartlarını kabul ediyorsunuz.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
    justifyContent: "space-between",
    padding: SPACING.xxl,
  },
  top: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    fontSize: FONTS.sizes.hero,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: 8,
  },
  tagline: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.warm,
  },
  bottom: {
    paddingBottom: 40,
  },
  googleBtn: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingVertical: 16,
    alignItems: "center",
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.light,
  },
  googleText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: "600",
    color: COLORS.dark,
  },
  skipBtn: {
    paddingVertical: 14,
    alignItems: "center",
    marginTop: SPACING.md,
  },
  skipText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.warm,
    fontWeight: "500",
  },
  terms: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.warm,
    textAlign: "center",
    marginTop: SPACING.lg,
    lineHeight: 16,
  },
});
