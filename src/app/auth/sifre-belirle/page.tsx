"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function SifreBelirle() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı.");
      return;
    }
    if (password !== confirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({
        password,
      });
      if (err) throw err;
      setDone(true);
    } catch (err: any) {
      setError(err?.message ?? "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <main className="min-h-screen bg-warm-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-warm-900 mb-2">
            Şifre Güncellendi
          </h1>
          <p className="text-warm-600 mb-6">
            Yeni şifrenle hem web sitesinden hem de mobil uygulamadan giriş
            yapabilirsin.
          </p>
          <a
            href="/club/giris"
            className="inline-block bg-coral text-white font-semibold rounded-xl px-6 py-3 hover:bg-coral/90 transition"
          >
            Giriş Yap
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-warm-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="text-2xl font-bold text-warm-900">Yeni Şifre Belirle</h1>
          <p className="text-warm-600 mt-2 text-sm">
            Belirlediğin şifreyi mobil uygulamada ve web sitesinde
            kullanabilirsin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1">
              Yeni Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-warm-200 rounded-xl px-4 py-3 text-warm-900 focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral"
              placeholder="En az 6 karakter"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1">
              Şifre Tekrar
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full border border-warm-200 rounded-xl px-4 py-3 text-warm-900 focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral"
              placeholder="Aynı şifreyi tekrar gir"
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-coral text-white font-semibold rounded-xl py-3 hover:bg-coral/90 transition disabled:opacity-50"
          >
            {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
          </button>
        </form>
      </div>
    </main>
  );
}
