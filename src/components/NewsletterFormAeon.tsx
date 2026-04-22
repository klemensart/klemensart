"use client";

import { useState } from "react";

interface Props {
  source?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SECTION_CLS = [
  "relative",
  "w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]",
  "sm:w-full sm:left-0 sm:right-0 sm:ml-0 sm:mr-0 sm:max-w-2xl sm:mx-auto",
  "bg-[#FDEEE5]",
  "px-6 py-10",
  "sm:px-12 sm:py-12",
  "sm:rounded-lg",
  "my-10",
].join(" ");

export default function NewsletterFormAeon({ source = "homepage" }: Props) {
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
      <section className={SECTION_CLS}>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-coral/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6D60" strokeWidth="2.5" strokeLinecap="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <div>
            <h2
              className="font-bold text-[#2C2319] mb-2"
              style={{ fontFamily: "var(--font-newsreader), Georgia, serif", fontSize: 32 }}
            >
              Aramıza hoş geldin!
            </h2>
            <p className="text-[17px] leading-[1.5] text-[#2C2319]/80 max-w-md mx-auto">
              Seçimlerine göre Klemens bülteni yakında sana ulaşacak. İlk sayı için Pazar sabahını bekle.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ── Form state ──
  return (
    <section className={SECTION_CLS}>
      {/* Headline */}
      <h2
        className="font-bold text-[32px] sm:text-[36px] leading-[1.15] text-[#2C2319] mb-4"
        style={{ fontFamily: "var(--font-newsreader), Georgia, serif" }}
      >
        Kültür-Sanat Pusulası
      </h2>

      {/* Subtitle */}
      <p className="text-[17px] sm:text-[18px] leading-[1.5] text-[#2C2319]/80 mb-6">
        1.500+ okurla her pazar. Ayda 4 e-mail.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Email input */}
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setAlreadySubscribed(false); setError(null); }}
          placeholder="E-posta adresin"
          disabled={isSubmitting}
          className="w-full h-14 px-5 bg-white border border-[#E5DDD5] rounded-md text-base text-[#2C2319] placeholder:text-[#2C2319]/35 focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral transition-colors disabled:opacity-50 mb-5"
        />

        {/* Checkboxes */}
        <div className="space-y-3 mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={weekly}
              onChange={(e) => { setWeekly(e.target.checked); setError(null); }}
              className="mt-1 w-4 h-4 accent-coral"
            />
            <span className="text-[15px] leading-[1.5] text-[#2C2319]">
              <strong>Haftalık Bülten:</strong> Pazar sabahları, gündemin en iyi kültür-sanat okumaları
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={thematic}
              onChange={(e) => { setThematic(e.target.checked); setError(null); }}
              className="mt-1 w-4 h-4 accent-coral"
            />
            <span className="text-[15px] leading-[1.5] text-[#2C2319]">
              <strong>Tematik Bülten:</strong> İki ayda bir, tek tema etrafında yaratıcı incelemeler
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
          <div className="mb-5 p-4 bg-white border border-[#E5DDD5] rounded-md">
            <p className="text-[#2C2319] font-semibold text-sm mb-1">Bu e-posta zaten abonemiz.</p>
            <p className="text-sm mb-3 text-[#2C2319]/60">
              Tercihlerini güncellemek için sana özel linki e-postana gönderebiliriz.
            </p>
            <button
              type="button"
              onClick={handleResendPreferenceLink}
              disabled={isResending}
              className="px-5 py-2.5 bg-coral text-white text-sm font-medium rounded-full hover:bg-coral/90 transition-colors disabled:opacity-50"
            >
              {isResending ? "Gönderiliyor..." : "Tercih linki gönder"}
            </button>
            {resendMsg && (
              <p className="mt-2 text-sm text-[#2C2319]/60">{resendMsg}</p>
            )}
          </div>
        )}

        {/* Button + Privacy link — inline horizontal */}
        <div className="flex flex-wrap items-center gap-5">
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 px-8 bg-coral text-white rounded-full text-base font-medium hover:bg-coral/90 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Gönderiliyor..." : "Bültene Katıl"}
          </button>
          <a
            href="/gizlilik"
            className="text-[14px] text-[#2C2319]/70 underline underline-offset-2 hover:text-coral transition-colors"
          >
            Gizlilik Politikası
          </a>
        </div>
      </form>
    </section>
  );
}
