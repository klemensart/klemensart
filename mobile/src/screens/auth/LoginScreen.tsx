/* ─── Giriş Ekranı (E-posta + Google OAuth) ─── */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { supabase } from "../../config/supabase";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../../config/theme";

WebBrowser.maybeCompleteAuthSession();

const redirectUri = makeRedirectUri({ scheme: "klemensart" });

type Mode = "login" | "register";

export default function LoginScreen({ navigation }: any) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert("Uyarı", "E-posta ve şifre gerekli.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
        });
        if (error) throw error;
        Alert.alert(
          "Kayıt Başarılı",
          "E-posta adresinize doğrulama linki gönderildi. Lütfen kontrol edin.",
          [{ text: "Tamam" }]
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (error) throw error;
        // Auth state listener in App.tsx will handle navigation
      }
    } catch (err: any) {
      const msg =
        err?.message === "Invalid login credentials"
          ? "E-posta veya şifre hatalı."
          : err?.message ?? "Bir hata oluştu.";
      Alert.alert("Hata", msg);
    } finally {
      setLoading(false);
    }
  };

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
          const url = new URL(result.url);
          const params = new URLSearchParams(url.hash.slice(1) || url.search.slice(1));
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo & Tagline */}
        <View style={styles.top}>
          <Text style={styles.logo}>Klemens</Text>
          <Text style={styles.tagline}>Kültür, sanat ve düşünce</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="E-posta"
            placeholderTextColor={COLORS.warm}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Şifre"
            placeholderTextColor={COLORS.warm}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.8}
            onPress={handleEmailAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>
                {mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchBtn}
            onPress={() => setMode(mode === "login" ? "register" : "login")}
          >
            <Text style={styles.switchText}>
              {mode === "login"
                ? "Hesabın yok mu? Kayıt Ol"
                : "Zaten hesabın var mı? Giriş Yap"}
            </Text>
          </TouchableOpacity>

          {/* Ayırıcı */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>veya</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google */}
          <TouchableOpacity
            style={styles.googleBtn}
            activeOpacity={0.8}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <Text style={styles.googleText}>Google ile devam et</Text>
          </TouchableOpacity>
        </View>

        {/* Misafir + Şartlar */}
        <View style={styles.bottom}>
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() =>
              navigation.reset({ index: 0, routes: [{ name: "Main" }] })
            }
          >
            <Text style={styles.skipText}>Misafir olarak devam et</Text>
          </TouchableOpacity>

          <Text style={styles.terms}>
            Devam ederek Kullanım Koşullarını ve Gizlilik Politikasını kabul
            ediyorsunuz.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
    padding: SPACING.xxl,
  },

  top: {
    alignItems: "center",
    paddingTop: 60,
    marginBottom: SPACING.xxl,
  },
  logo: {
    fontSize: 36,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: 6,
  },
  tagline: {
    fontSize: FONTS.sizes.md,
    color: COLORS.warm,
  },

  form: { gap: SPACING.md },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
    fontSize: FONTS.sizes.md,
    color: COLORS.dark,
    borderWidth: 1,
    borderColor: COLORS.light ?? "#eee",
  },

  primaryBtn: {
    backgroundColor: COLORS.coral,
    borderRadius: RADIUS.lg,
    paddingVertical: 16,
    alignItems: "center",
    ...SHADOWS.md,
    marginTop: 4,
  },
  primaryText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: "700",
    color: "#fff",
  },

  switchBtn: { alignItems: "center", paddingVertical: 4 },
  switchText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.coral,
    fontWeight: "600",
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SPACING.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.light ?? "#eee",
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    fontSize: FONTS.sizes.sm,
    color: COLORS.warm,
  },

  googleBtn: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.light ?? "#eee",
    ...SHADOWS.sm,
  },
  googleText: {
    fontSize: FONTS.sizes.md,
    fontWeight: "600",
    color: COLORS.dark,
  },

  bottom: { paddingTop: SPACING.xl, paddingBottom: 20 },
  skipBtn: { paddingVertical: 12, alignItems: "center" },
  skipText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.warm,
    fontWeight: "500",
  },
  terms: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.warm,
    textAlign: "center",
    marginTop: SPACING.md,
    lineHeight: 16,
  },
});
