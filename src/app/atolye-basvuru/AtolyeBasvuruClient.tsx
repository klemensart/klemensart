"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

// ─── Types ───────────────────────────────────────────────────

type ContactChannel = "whatsapp" | "email" | "website" | "other";

type FormData = {
  name: string;
  email: string;
  phone: string;
  whatsapp_number: string;
  website: string;
  topic: string;
  description: string;
  duration: string;
  price: string;
  audience: string;
  proposed_dates: string;
  contact_channel: ContactChannel;
  contact_channel_detail: string;
  terms_accepted: boolean;
  honeypot: string;
};

const EMPTY_FORM: FormData = {
  name: "",
  email: "",
  phone: "",
  whatsapp_number: "",
  website: "",
  topic: "",
  description: "",
  duration: "",
  price: "",
  audience: "",
  proposed_dates: "",
  contact_channel: "whatsapp",
  contact_channel_detail: "",
  terms_accepted: false,
  honeypot: "",
};

const DRAFT_KEY = "atolye_basvuru_draft";

const CHANNEL_LABELS: Record<ContactChannel, string> = {
  whatsapp: "WhatsApp numaranız",
  email: "E-posta adresiniz",
  website: "Web sitesi URL'si",
  other: "İletişim bilgisi",
};

// ─── Component ───────────────────────────────────────────────

export default function AtolyeBasvuruClient() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Restore draft from sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const draft = sessionStorage.getItem(DRAFT_KEY);
      if (draft) {
        const parsed = JSON.parse(draft) as FormData;
        setForm(parsed);
        // If step 2 data exists, jump to step 2
        if (parsed.topic) setStep(2);
      }
    } catch {}
  }, []);

  // Check auth state
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ─── Helpers ─────────────────────────────────────────────

  const set = <K extends keyof FormData>(key: K, val: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const saveDraft = () => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch {}
  };

  const scrollToFirstError = () => {
    setTimeout(() => {
      const el = formRef.current?.querySelector("[data-error]");
      if (el) (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  // ─── Validation ──────────────────────────────────────────

  const validateStep1 = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Ad en az 2 karakter olmalı";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Geçerli bir e-posta adresi girin";
    if (!form.phone.trim() || form.phone.trim().length < 10) e.phone = "Telefon numarası en az 10 karakter olmalı";
    if (!form.whatsapp_number.trim() || form.whatsapp_number.trim().length < 10) e.whatsapp_number = "WhatsApp numarası en az 10 karakter olmalı";
    if (form.website.trim() && !/^https?:\/\/.+/.test(form.website.trim())) e.website = "Geçerli bir URL girin (https://...)";
    setErrors(e);
    if (Object.keys(e).length) scrollToFirstError();
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    const e: typeof errors = {};
    if (!form.topic.trim() || form.topic.trim().length < 5) e.topic = "Atölye konusu en az 5 karakter olmalı";
    if (!form.description.trim() || form.description.trim().length < 50) e.description = "Açıklama en az 50 karakter olmalı";
    if (form.description.trim().length > 2000) e.description = "Açıklama en fazla 2000 karakter olabilir";
    if (!form.duration.trim() || form.duration.trim().length < 2) e.duration = "Süre bilgisi gerekli";
    if (!form.price.trim()) e.price = "Ücret bilgisi gerekli";
    if (!form.proposed_dates.trim() || form.proposed_dates.trim().length < 5) e.proposed_dates = "Lütfen en az bir tarih/zaman aralığı belirtin";
    if (!form.contact_channel_detail.trim() || form.contact_channel_detail.trim().length < 3) e.contact_channel_detail = "İletişim detayı en az 3 karakter olmalı";
    if (!form.terms_accepted) e.terms_accepted = "Koşulları kabul etmeniz gerekli";
    setErrors(e);
    if (Object.keys(e).length) scrollToFirstError();
    return Object.keys(e).length === 0;
  };

  // ─── Navigation ──────────────────────────────────────────

  const goToStep2 = () => {
    if (validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToStep1 = () => {
    setErrors({});
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── Submit ──────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    // Auth check
    if (!isLoggedIn) {
      saveDraft();
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      const res = await fetch("/api/atolye-basvuru/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 && data.fields) {
          setErrors(data.fields);
          scrollToFirstError();
        } else {
          setApiError(data.error || "Bir hata oluştu.");
        }
        return;
      }

      setSubmitted(true);
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {}
    } catch {
      setApiError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Success state ───────────────────────────────────────

  if (submitted) {
    return (
      <main className="min-h-screen bg-warm-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center py-20">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-warm-900 mb-3">Başvurunuz Alındı</h2>
          <p className="text-warm-900/60 text-sm leading-relaxed mb-8">
            Teşekkür ederiz. Başvurunuzu en geç 15 iş günü içinde değerlendirip sonucu
            e-posta adresinize bildireceğiz. Bu süreçte gelişme olursa{" "}
            <strong>{form.email}</strong> adresinize ulaşacağız.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-3 rounded-xl border border-warm-200 text-warm-900 text-sm font-semibold hover:bg-warm-100 transition-colors"
            >
              Ana Sayfaya Dön
            </Link>
            <Link
              href="/atolyeler"
              className="px-6 py-3 rounded-xl bg-coral text-white text-sm font-semibold hover:opacity-90 transition-all"
            >
              Atölyeleri İncele
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ─── Render ──────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-warm-50 py-16 px-4">
      <div className="max-w-[640px] mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1
            className="font-newsreader text-warm-900 font-extrabold text-3xl md:text-4xl leading-[1.1] tracking-tighter mb-4"
            style={{ fontVariationSettings: '"opsz" 36' }}
          >
            Atölye Düzenleyici Başvurusu
          </h1>

          <div className="bg-warm-100 border-l-4 border-coral p-5 md:p-6 rounded-r-lg mb-6 md:mb-8">
            <h3 className="text-xs font-semibold text-warm-900 mb-2 uppercase tracking-wide">
              Bu form ne için?
            </h3>
            <p className="text-warm-900/70 text-sm leading-relaxed">
              Klemens, sanat tarihi ve kültür alanında atölye düzenleyen kişileri meraklı
              bir kitleyle buluşturan bir keşif platformudur. Başvurunuz kabul edilirse
              atölyeniz Klemens&apos;in atölyeler sayfasında yer alır; buradan gelen
              katılımcılar size (WhatsApp, e-posta veya kendi sayfanız üzerinden) doğrudan
              ulaşır. Klemens ödeme, kayıt veya iletişime aracılık etmez; tüm süreç
              sizinle katılımcı arasındadır.
            </p>
          </div>

          <p className="text-warm-900/50 text-sm md:text-base leading-relaxed max-w-lg">
            Başvurunuzu en geç 15 iş günü içinde değerlendiriyor ve sonucunu e-posta
            ile bildiriyoruz.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            <StepDot active={step >= 1} label="1" />
            <span className="text-xs text-warm-900/40 hidden sm:block">Kişisel Bilgiler</span>
          </div>
          <div className={`flex-1 h-0.5 ${step >= 2 ? "bg-coral" : "bg-warm-200"} transition-colors`} />
          <div className="flex items-center gap-2">
            <StepDot active={step >= 2} label="2" />
            <span className="text-xs text-warm-900/40 hidden sm:block">Atölye Detayları</span>
          </div>
          <span className="text-xs text-warm-900/40 sm:hidden ml-auto">{step}/2</span>
        </div>

        {/* Form card */}
        <div
          ref={formRef}
          className="bg-white rounded-2xl border border-warm-200 p-8 md:p-10"
        >
          {step === 1 && (
            <div className="space-y-5">
              <Field label="Ad / Soyad" required error={errors.name}>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Örn: Ayşe Yılmaz"
                  className={inputClass(errors.name)}
                />
              </Field>

              <Field label="E-posta" required error={errors.email}>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="ornek@email.com"
                  className={inputClass(errors.email)}
                />
              </Field>

              <Field label="Telefon" required error={errors.phone}>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="0532 123 45 67"
                  className={inputClass(errors.phone)}
                />
              </Field>

              <Field label="WhatsApp Numarası" required error={errors.whatsapp_number}>
                <input
                  type="tel"
                  value={form.whatsapp_number}
                  onChange={(e) => set("whatsapp_number", e.target.value)}
                  placeholder="0532 123 45 67"
                  className={inputClass(errors.whatsapp_number)}
                />
                <p className="text-xs text-warm-900/40 mt-1">
                  Onay sürecinde sizinle bu numara üzerinden iletişime geçeceğiz.
                </p>
              </Field>

              <Field label="Web siteniz veya sosyal medya (opsiyonel)" error={errors.website}>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                  placeholder="https://instagram.com/ornek"
                  className={inputClass(errors.website)}
                />
              </Field>

              {/* Honeypot */}
              <div style={{ display: "none" }} aria-hidden="true">
                <input
                  type="text"
                  name="website_url"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.honeypot}
                  onChange={(e) => set("honeypot", e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={goToStep2}
                  className="px-8 py-3 bg-coral text-white text-sm font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all duration-150"
                >
                  Devam Et →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <Field label="Atölye Konusu" required error={errors.topic}>
                <input
                  type="text"
                  value={form.topic}
                  onChange={(e) => set("topic", e.target.value)}
                  placeholder="Örn: Antik Yunan Mitolojisine Giriş"
                  className={inputClass(errors.topic)}
                />
              </Field>

              <Field label="Atölye Açıklaması" required error={errors.description}>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Atölyenizin içeriğini, akışını ve katılımcıların neler öğreneceğini birkaç paragraf ile anlatın."
                  rows={5}
                  className={`${inputClass(errors.description)} resize-none min-h-[120px]`}
                />
                <div className="flex justify-end mt-1">
                  <span
                    className={`text-xs ${
                      form.description.length > 2000 ? "text-red-500" : "text-warm-900/30"
                    }`}
                  >
                    {form.description.length} / 2000
                  </span>
                </div>
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Süre" required error={errors.duration}>
                  <input
                    type="text"
                    value={form.duration}
                    onChange={(e) => set("duration", e.target.value)}
                    placeholder="Örn: 2 saat veya 3x90 dakika"
                    className={inputClass(errors.duration)}
                  />
                </Field>

                <Field label="Ücret" required error={errors.price}>
                  <input
                    type="text"
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    placeholder="Örn: 350 TL veya Ücretsiz"
                    className={inputClass(errors.price)}
                  />
                </Field>
              </div>

              <Field label="Hedef Kitle (opsiyonel)">
                <textarea
                  value={form.audience}
                  onChange={(e) => set("audience", e.target.value)}
                  placeholder="Hangi katılımcılar için uygun? Önkoşul var mı?"
                  rows={3}
                  className={`${inputClass()} resize-none`}
                />
              </Field>

              <Field label="Önerilen Tarihler" required error={errors.proposed_dates}>
                <textarea
                  value={form.proposed_dates}
                  onChange={(e) => set("proposed_dates", e.target.value)}
                  placeholder={"Örn:\n• 10 Mayıs Cumartesi, 14:00–17:00\n• 17 Mayıs Cumartesi, 14:00–17:00\n• Hafta içi akşam 19:00 sonrası da uygun"}
                  rows={3}
                  className={`${inputClass(errors.proposed_dates)} resize-none`}
                />
                <p className="text-xs text-warm-900/40 mt-1">
                  Birden fazla tarih/saat önerisi yazabilirsiniz. Kesin tarih, onay sonrasında birlikte belirlenecek.
                </p>
              </Field>

              <Field label="Müşteri İletişim Kanalı" required>
                <select
                  value={form.contact_channel}
                  onChange={(e) => set("contact_channel", e.target.value as ContactChannel)}
                  className={inputClass()}
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">E-posta</option>
                  <option value="website">Web Sitesi</option>
                  <option value="other">Diğer</option>
                </select>
              </Field>

              <p className="text-sm text-warm-900/50 italic leading-relaxed -mt-2">
                Bu kanal, atölyenize katılmak isteyen kişilerin sizinle iletişime geçeceği
                adres olacaktır. WhatsApp numaranızı, ödeme sayfası (Biletini Al, PayTR,
                Eventbrite vb.) linkinizi veya tercih ettiğiniz başka bir kanalı yazabilirsiniz.
              </p>

              <Field
                label={CHANNEL_LABELS[form.contact_channel]}
                required
                error={errors.contact_channel_detail}
              >
                <input
                  type="text"
                  value={form.contact_channel_detail}
                  onChange={(e) => set("contact_channel_detail", e.target.value)}
                  placeholder={
                    form.contact_channel === "whatsapp"
                      ? "0532 123 45 67"
                      : form.contact_channel === "email"
                        ? "ornek@email.com"
                        : form.contact_channel === "website"
                          ? "https://orneksite.com"
                          : "İletişim bilginiz"
                  }
                  className={inputClass(errors.contact_channel_detail)}
                />
              </Field>

              {/* Terms checkbox */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.terms_accepted}
                    onChange={(e) => set("terms_accepted", e.target.checked)}
                    className="mt-0.5 w-4 h-4 flex-shrink-0 accent-coral rounded"
                  />
                  <span className="text-sm text-warm-900/60 leading-relaxed">
                    <Link
                      href="/duzenleyici-kosullari"
                      target="_blank"
                      className="text-coral font-medium underline underline-offset-2 hover:text-coral/80"
                    >
                      Düzenleyici Koşulları
                    </Link>
                    &apos;nı okudum ve kabul ediyorum.
                  </span>
                </label>
                {errors.terms_accepted && (
                  <p className="text-red-500 text-xs mt-1.5 ml-7">{errors.terms_accepted}</p>
                )}
              </div>

              {/* API error */}
              {apiError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                  <p className="text-red-600 text-sm">{apiError}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={goToStep1}
                  className="px-6 py-3 text-sm font-semibold text-warm-900/60 rounded-xl border border-warm-200 hover:bg-warm-50 transition-colors"
                >
                  ← Geri
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-3 bg-coral text-white text-sm font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] disabled:opacity-60 transition-all duration-150"
                >
                  {loading ? "Gönderiliyor..." : "Başvuruyu Gönder"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Auth modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-warm-900 mb-2">Üye Girişi Gerekli</h3>
            <p className="text-sm text-warm-900/50 leading-relaxed mb-6">
              Başvuru göndermek için üye girişi yapmanız gerekiyor.
              Form verileriniz korunacak, giriş yaptıktan sonra kaldığınız yerden
              devam edebilirsiniz.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/club/giris?redirect=/atolye-basvuru"
                className="w-full py-3 bg-coral text-white text-sm font-semibold rounded-xl text-center hover:opacity-90 transition-all"
              >
                Giriş Yap
              </Link>
              <Link
                href="/club/giris?redirect=/atolye-basvuru"
                className="w-full py-3 border border-warm-200 text-warm-900 text-sm font-semibold rounded-xl text-center hover:bg-warm-50 transition-colors"
              >
                Kayıt Ol
              </Link>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="text-sm text-warm-900/40 hover:text-warm-900/60 transition-colors mt-1"
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function StepDot({ active, label }: { active: boolean; label: string }) {
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
        active ? "bg-coral text-white" : "bg-warm-100 text-warm-900/30 border border-warm-200"
      }`}
    >
      {label}
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div data-error={error ? "" : undefined}>
      <label className="block text-sm font-medium text-warm-900/70 mb-1.5">
        {label}
        {required && <span className="text-coral ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
    </div>
  );
}

function inputClass(error?: string): string {
  return `w-full px-4 py-3 rounded-lg border text-sm text-warm-900 placeholder:text-warm-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral ${
    error ? "border-red-400 bg-red-50/50" : "border-warm-200 bg-white"
  }`;
}
