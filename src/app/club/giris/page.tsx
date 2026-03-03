"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type Tab = "giris" | "kayit";

export default function GirisPage() {
  const router = useRouter();
  const supabase = createClient();

  const [tab,      setTab]      = useState<Tab>("giris");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [success,  setSuccess]  = useState<string | null>(null);

  const [googleLoading, setGoogleLoading] = useState(false);

  const reset = () => { setError(null); setSuccess(null); };

  const handleGoogleSignIn = async () => {
    reset();
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
    // Hata yoksa Google sayfasına yönlendirme başlar, loading kalır
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    setLoading(true);

    if (tab === "giris") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(
          error.message === "Invalid login credentials"
            ? "E-posta veya şifre hatalı."
            : error.message
        );
      } else {
        router.push("/club/profil");
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/club/profil` },
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess(
          "Hesabın oluşturuldu! Lütfen e-postanı kontrol et ve bağlantıya tıklayarak hesabını doğrula."
        );
      }
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-warm-50 flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-warm-900/[0.06] border border-warm-100 overflow-hidden">

          {/* Header */}
          <div className="px-8 pt-10 pb-6 text-center border-b border-warm-100">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-coral/10 mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF6D60" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-warm-900 mb-1">
              Klemens Club&apos;a Hoş Geldiniz
            </h1>
            <p className="text-sm text-warm-900/45 leading-relaxed">
              Sanat, kültür ve düşünce dünyasının kapıları açılıyor.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-warm-100">
            {(["giris", "kayit"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); reset(); }}
                className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                  tab === t
                    ? "text-coral border-b-2 border-coral"
                    : "text-warm-900/40 hover:text-warm-900/60"
                }`}
              >
                {t === "giris" ? "Giriş Yap" : "Kayıt Ol"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 flex flex-col gap-4">

            {/* Error / Success */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 leading-relaxed">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700 leading-relaxed">
                {success}
              </div>
            )}

            {/* E-mail */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-warm-900/50 uppercase tracking-wide">
                E-posta
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@mail.com"
                className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-warm-50 text-warm-900 text-sm placeholder:text-warm-900/30 focus:outline-none focus:border-coral focus:bg-white transition-colors"
              />
            </div>

            {/* Şifre */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-warm-900/50 uppercase tracking-wide">
                Şifre
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === "kayit" ? "En az 6 karakter" : "••••••••"}
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-warm-50 text-warm-900 text-sm placeholder:text-warm-900/30 focus:outline-none focus:border-coral focus:bg-white transition-colors"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-coral text-white font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] disabled:opacity-60 transition-all duration-150 mt-1"
            >
              {loading
                ? "Bekleyin..."
                : tab === "giris" ? "Giriş Yap" : "Hesap Oluştur"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-warm-200" />
              <span className="text-xs text-warm-900/30 font-medium">veya</span>
              <div className="flex-1 h-px bg-warm-200" />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border border-warm-200 rounded-xl text-sm font-medium text-warm-900/70 hover:border-warm-300 hover:bg-warm-50 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150"
            >
              {googleLoading ? (
                <div className="w-4 h-4 rounded-full border-2 border-warm-300 border-t-warm-900/40 animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {googleLoading ? "Yönlendiriliyor..." : "Google ile Giriş Yap"}
            </button>

          </form>

          {/* Footer note */}
          <p className="text-center text-xs text-warm-900/25 pb-8 px-8 leading-relaxed">
            Devam ederek{" "}
            <span className="underline underline-offset-2 cursor-pointer hover:text-warm-900/50 transition-colors">
              Kullanım Koşulları
            </span>
            {" "}ve{" "}
            <span className="underline underline-offset-2 cursor-pointer hover:text-warm-900/50 transition-colors">
              Gizlilik Politikası
            </span>
            &apos;nı kabul etmiş olursunuz.
          </p>

        </div>
      </div>
    </main>
  );
}
