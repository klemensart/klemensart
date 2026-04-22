"use client";

import { useState } from "react";

interface Props {
  source?: string;
  compact?: boolean;
  className?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterFormAeon({
  source = "homepage",
  compact: _compact = false,
  className = "",
}: Props) {
  const [email, setEmail] = useState("");
  const [weekly, setWeekly] = useState(true);
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
      <div className={`max-w-2xl mx-auto rounded-lg px-5 py-6 sm:px-9 sm:py-8 bg-[#F5EBE0] ${className}`}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-coral/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6D60" strokeWidth="2.5" strokeLinecap="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <div>
            <h3
              className="font-semibold text-warm-900 mb-1"
              style={{ fontFamily: "var(--font-newsreader), Georgia, serif", fontSize: 24 }}
            >
              Aramıza hoş geldin!
            </h3>
            <p className="text-sm leading-relaxed max-w-sm mx-auto text-[#8C857E]">
              Seçimlerine göre Klemens bülteni yakında sana ulaşacak. İlk sayı için Pazar sabahını bekle.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Form state ──
  return (
    <div className={`max-w-2xl mx-auto rounded-lg px-5 py-6 sm:px-9 sm:py-8 bg-[#F5EBE0] ${className}`}>
      {/* Heading */}
      <h3
        className="font-semibold text-warm-900 text-2xl leading-tight mb-1.5"
        style={{ fontFamily: "var(--font-newsreader), Georgia, serif" }}
      >
        Kültür-Sanat Pusulası
      </h3>
      <p className="text-sm leading-normal text-[#8C857E] mb-5">
        1.500+ okurla her pazar. Ayda 4 e-mail.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Email + button — stacked on mobile, horizontal on sm+ */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setAlreadySubscribed(false); setError(null); }}
            placeholder="E-posta adresin"
            disabled={isSubmitting}
            className="w-full flex-1 h-11 px-4 border border-[#E5DDD5] rounded-md bg-white text-sm text-warm-900 placeholder:text-warm-900/35 focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto h-11 px-6 bg-coral text-white rounded-full text-sm font-medium hover:bg-coral/90 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Gönderiliyor..." : "Bültene Katıl"}
          </button>
        </div>

        {/* Checkboxes */}
        <div className="mt-4 flex flex-col gap-2">
          <label className="flex items-start gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={weekly}
              onChange={(e) => { setWeekly(e.target.checked); setError(null); }}
              className="mt-0.5 accent-coral"
            />
            <span>
              <strong className="text-[#2C2319]">Haftalık Bülten</strong>
              <span className="text-[#8C857E]"> — Pazar sabahları, gündemin en iyi kültür-sanat okumaları</span>
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={thematic}
              onChange={(e) => { setThematic(e.target.checked); setError(null); }}
              className="mt-0.5 accent-coral"
            />
            <span>
              <strong className="text-[#2C2319]">Tematik Bülten</strong>
              <span className="text-[#8C857E]"> — İki ayda bir, tek tema etrafında yaratıcı incelemeler</span>
            </span>
          </label>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3">
            {error}
          </div>
        )}

        {/* Already subscribed */}
        {alreadySubscribed && (
          <div className="mt-3 p-4 bg-white border border-[#E5DDD5] rounded-md">
            <p className="text-warm-900 font-semibold text-sm mb-1">Bu e-posta zaten abonemiz.</p>
            <p className="text-sm mb-3" style={{ color: "#8C857E" }}>
              Tercihlerini güncellemek için sana özel linki e-postana gönderebiliriz.
            </p>
            <button
              type="button"
              onClick={handleResendPreferenceLink}
              disabled={isResending}
              className="px-4 py-2 bg-coral text-white text-sm font-medium rounded-full hover:bg-coral/90 transition-colors disabled:opacity-50"
            >
              {isResending ? "Gönderiliyor..." : "Tercih linki gönder"}
            </button>
            {resendMsg && (
              <p className="mt-2 text-sm" style={{ color: "#8C857E" }}>{resendMsg}</p>
            )}
          </div>
        )}

        {/* Privacy — right-aligned */}
        <div className="mt-4 flex justify-end text-xs text-[#8C857E]">
          <a href="/gizlilik" className="hover:text-coral transition-colors">
            Gizlilik Politikası
          </a>
        </div>
      </form>
    </div>
  );
}
