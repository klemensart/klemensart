/* ─── Giriş Ekranı (Native E-posta/Şifre) ─── */

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
import { supabase } from "../../config/supabase";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../../config/theme";

type Mode = "login" | "register";

export default function LoginScreen({ navigation }: any) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert("Uyarı", "Lütfen önce e-posta adresinizi girin.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: "https://klemensart.com/auth/callback",
      });
      if (error) throw error;
      Alert.alert(
        "Bağlantı Gönderildi",
        "E-postanıza gelen linke tıklayın ve yeni şifrenizi belirleyin. Ardından bu ekrandan giriş yapabilirsiniz.",
        [{ text: "Tamam" }]
      );
    } catch (err: any) {
      Alert.alert("Hata", err?.message ?? "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert("Uyarı", "E-posta ve şifre gerekli.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Uyarı", "Şifre en az 6 karakter olmalı.");
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
        // Auth state listener in App.tsx handles navigation
      }
    } catch (err: any) {
      const msg =
        err?.message === "Invalid login credentials"
          ? "E-posta veya şifre hatalı."
          : err?.message?.includes("already registered")
          ? "Bu e-posta zaten kayıtlı. Giriş yapmayı deneyin."
          : err?.message ?? "Bir hata oluştu.";
      Alert.alert("Hata", msg);
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
        {/* Logo */}
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

          {mode === "login" && (
            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotText}>Şifremi Unuttum</Text>
            </TouchableOpacity>
          )}
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
    paddingTop: 80,
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

  switchBtn: { alignItems: "center", paddingVertical: 8 },
  switchText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.coral,
    fontWeight: "600",
  },
  forgotBtn: { alignItems: "center", paddingVertical: 6 },
  forgotText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.warm,
    fontWeight: "500",
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
