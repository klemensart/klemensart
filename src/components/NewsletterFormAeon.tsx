"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  source?: string;
  compact?: boolean;
  className?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterFormAeon({
  source = "homepage",
  compact = false,
  className = "",
}: Props) {
  const [email, setEmail] = useState("");
  const [weekly, setWeekly] = useState(false);
  const [thematic, setThematic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("E-posta adresi gerekli.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError("Geçerli bir e-posta adresi gir.");
      return;
    }
    if (!weekly && !thematic) {
      setError("En az bir bülten seç.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), weekly, thematic, source }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Bir sorun oluştu, tekrar deneyin.");
      } else {
        setSuccess(true);
        setEmail("");
      }
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className={`rounded-2xl ${compact ? "p-6" : "p-8 md:p-10"} bg-warm-100 ${className}`}>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-coral/10 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6D60" strokeWidth="2.5" strokeLinecap="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <div>
            <h3
              className="text-xl font-bold text-warm-900 mb-2"
              style={{ fontFamily: "var(--font-newsreader), Georgia, serif" }}
            >
              Aramıza hoş geldin!
            </h3>
            <p className="text-warm-900/60 text-sm leading-relaxed max-w-sm mx-auto">
              Seçimlerine göre Klemens bülteni yakında sana ulaşacak. İlk sayı için Pazar sabahını bekle.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl ${compact ? "p-6" : "p-8 md:p-10"} bg-warm-100 ${className}`}>
      {/* Heading */}
      <h3
        className={`font-bold text-warm-900 leading-tight ${compact ? "text-2xl md:text-3xl mb-2" : "text-3xl md:text-4xl mb-3"}`}
        style={{ fontFamily: "var(--font-newsreader), Georgia, serif" }}
      >
        Her pazar soluklan,<br />iki ayda bir derin nefes
      </h3>
      <p className={`text-warm-900/60 text-base ${compact ? "mb-5" : "mb-6"}`}>
        Ücretsiz, dilediğin zaman çıkabilirsin.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Email input */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-posta adresin"
          disabled={isSubmitting}
          className="w-full px-4 py-3 bg-white border border-warm-200 rounded-lg text-base text-warm-900 placeholder:text-warm-900/35 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-colors disabled:opacity-50"
        />

        {/* Checkboxes */}
        <div className="mt-4 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={weekly}
              onChange={(e) => setWeekly(e.target.checked)}
              className="mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 border-warm-300 text-coral focus:ring-coral/30 accent-coral"
            />
            <div>
              <span className="font-semibold text-warm-900 text-sm">Haftalık Bülten</span>
              <span className="text-warm-900/50 text-sm"> — Pazar sabahları, gündemin en iyi kültür-sanat okumaları</span>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={thematic}
              onChange={(e) => setThematic(e.target.checked)}
              className="mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 border-warm-300 text-coral focus:ring-coral/30 accent-coral"
            />
            <div>
              <span className="font-semibold text-warm-900 text-sm">Tematik Bülten</span>
              <span className="text-warm-900/50 text-sm"> — İki ayda bir, tek bir tema etrafında yaratıcı incelemeler</span>
            </div>
          </label>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Button + links */}
        <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-coral hover:bg-coral/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Gönderiliyor..." : "Bültene Katıl"}
          </button>
          <Link
            href="/bulten/tercih"
            className="text-sm text-warm-900/50 underline underline-offset-2 hover:text-coral transition-colors"
          >
            Zaten abonesim
          </Link>
        </div>

        {/* Privacy */}
        <p className="mt-4 text-xs text-warm-900/35">
          Abone olarak{" "}
          <a
            href="/kvkk"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-coral"
          >
            Gizlilik Politikası
          </a>
          &apos;nı kabul etmiş olursun.
        </p>
      </form>
    </div>
  );
}
