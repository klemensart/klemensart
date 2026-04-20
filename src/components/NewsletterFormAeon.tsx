"use client";

import { useState } from "react";

interface Props {
  source?: string;
  compact?: boolean;
  className?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CORAL_DARK = "#C74B3A";

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
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAlreadySubscribed(false);

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

      if (res.status === 409) {
        setAlreadySubscribed(true);
        return;
      }

      if (res.ok) {
        setSuccess(true);
        setEmail("");
        return;
      }

      const data = await res.json();
      setError(data.error || data.message || "Bir sorun oluştu, tekrar deneyin.");
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendPreferenceLink() {
    setIsResending(true);
    setResendMsg(null);
    try {
      const res = await fetch("/api/subscribe/resend-preference-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendMsg("E-postanı kontrol et, tercih linki gönderildi.");
      } else {
        setResendMsg(data.error || "Gönderilemedi.");
      }
    } catch {
      setResendMsg("Bağlantı hatası.");
    } finally {
      setIsResending(false);
    }
  }

  // ── Success state ──
  if (success) {
    return (
      <div
        className={`rounded-2xl ${compact ? "p-6 md:p-8" : "p-8 md:p-12"} ${className}`}
        style={{ backgroundColor: "#FCE8E0" }}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(199,75,58,0.12)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={CORAL_DARK} strokeWidth="2.5" strokeLinecap="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <div>
            <h3
              className="text-xl font-black text-warm-900 mb-2"
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

  // ── Form state ──
  return (
    <div
      className={`rounded-2xl ${compact ? "p-6 md:p-8" : "p-8 md:p-12"} ${className}`}
      style={{ backgroundColor: "#FCE8E0" }}
    >
      {/* Heading */}
      <h3
        className={`font-black text-warm-900 leading-tight ${compact ? "text-3xl md:text-4xl mb-2" : "text-4xl md:text-5xl mb-3"}`}
        style={{ fontFamily: "var(--font-newsreader), Georgia, serif" }}
      >
        Her pazar soluklan,<br />iki ayda bir derin nefes
      </h3>
      <p className={`text-warm-900/55 text-base ${compact ? "mb-6" : "mb-8"}`}>
        Ücretsiz, dilediğin zaman çıkabilirsin.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Email input */}
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setAlreadySubscribed(false); setError(null); }}
          placeholder="E-posta adresin"
          disabled={isSubmitting}
          className="w-full px-4 py-3.5 bg-white border border-warm-200 rounded-md text-base text-warm-900 placeholder:text-warm-900/35 focus:outline-none focus:ring-2 focus:ring-coral/40 transition-colors disabled:opacity-50 mb-5"
        />

        {/* Checkboxes */}
        <div className="space-y-3 mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={weekly}
              onChange={(e) => { setWeekly(e.target.checked); setError(null); }}
              className="mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 border-warm-300 text-coral focus:ring-coral/30 accent-coral"
            />
            <span className="text-sm">
              <span className="font-semibold text-warm-900">Haftalık Bülten</span>
              <span className="text-warm-900/50"> — Pazar sabahları, gündemin en iyi kültür-sanat okumaları</span>
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={thematic}
              onChange={(e) => { setThematic(e.target.checked); setError(null); }}
              className="mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 border-warm-300 text-coral focus:ring-coral/30 accent-coral"
            />
            <span className="text-sm">
              <span className="font-semibold text-warm-900">Tematik Bülten</span>
              <span className="text-warm-900/50"> — İki ayda bir, tek bir tema etrafında yaratıcı incelemeler</span>
            </span>
          </label>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3">
            {error}
          </div>
        )}

        {/* Already subscribed */}
        {alreadySubscribed && (
          <div className="mb-5 p-4 bg-white border border-warm-300 rounded-md">
            <p className="text-warm-900 font-semibold text-sm mb-1">Bu e-posta zaten abonemiz.</p>
            <p className="text-warm-900/55 text-sm mb-3">
              Tercihlerini güncellemek için sana özel linki e-postana gönderebiliriz.
            </p>
            <button
              type="button"
              onClick={handleResendPreferenceLink}
              disabled={isResending}
              className="px-4 py-2 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
              style={{ backgroundColor: CORAL_DARK }}
            >
              {isResending ? "Gönderiliyor..." : "Tercih linki gönder"}
            </button>
            {resendMsg && (
              <p className="mt-2 text-sm text-warm-900/60">{resendMsg}</p>
            )}
          </div>
        )}

        {/* Button + privacy */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 text-white font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: CORAL_DARK }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#A93D2E")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = CORAL_DARK)}
          >
            {isSubmitting ? "Gönderiliyor..." : "Bültene Katıl"}
          </button>
          <a
            href="/kvkk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-warm-900/40 underline underline-offset-2 hover:text-warm-900/70 transition-colors hidden sm:inline"
          >
            Gizlilik Politikası
          </a>
        </div>

        {/* Mobile privacy */}
        <p className="mt-4 text-xs text-warm-900/35 sm:hidden">
          Abone olarak{" "}
          <a
            href="/kvkk"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-warm-900/60"
          >
            Gizlilik Politikası
          </a>
          &apos;nı kabul etmiş olursun.
        </p>
      </form>
    </div>
  );
}
