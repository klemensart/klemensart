"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import DateBadge from "../components/DateBadge";

/* ─── Types ──────────────────────────────────────── */

export type MarketplaceEvent = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  short_description: string | null;
  category: string;
  city: string;
  district: string | null;
  venue_name: string | null;
  venue_address: string | null;
  organizer_name: string;
  organizer_url: string | null;
  organizer_phone: string | null;
  organizer_email: string | null;
  organizer_logo_url: string | null;
  price: number;
  price_options: { label: string; price: number; note?: string }[] | null;
  currency: string;
  event_date: string | null;
  end_date: string | null;
  event_time_note: string | null;
  duration_note: string | null;
  recurring: boolean;
  recurring_note: string | null;
  image_url: string | null;
  gallery_urls: string[] | null;
  max_participants: number | null;
  is_featured: boolean;
  is_klemens: boolean;
  detail_slug: string | null;
};

/* ─── Constants ──────────────────────────────────── */

const B = {
  coral: "#FF6D60",
  cream: "#FFFBF7",
  dark: "#2D2926",
  warm: "#8C857E",
  light: "#F5F0EB",
};

const CATEGORY_LABELS: Record<string, string> = {
  resim: "Resim",
  seramik: "Seramik",
  fotograf: "Fotoğraf",
  muzik: "Müzik",
  heykel: "Heykel",
  dijital: "Dijital Sanat",
  yazarlik: "Yazarlık",
  dans: "Dans",
  tiyatro: "Tiyatro",
  diger: "Diğer",
  "sanat-tarihi": "Sanat Tarihi",
  sinema: "Sinema",
};

function fmtFullDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtPrice(price: number) {
  return new Intl.NumberFormat("tr-TR").format(price);
}

/* ─── Icons (inline SVG) ─────────────────────────── */

function CalendarIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClockIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function MapPinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function UsersIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function PhoneIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MailIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function GlobeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function ChevronLeftIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

function ExternalLinkIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function XIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/* ─── Contact Modal ──────────────────────────────── */

function ContactModal({
  open,
  onClose,
  workshopTitle,
  workshopSlug,
  organizerEmail,
  organizerPhone,
}: {
  open: boolean;
  onClose: () => void;
  workshopTitle: string;
  workshopSlug: string;
  organizerEmail: string | null;
  organizerPhone: string | null;
}) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<"ok" | "err" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/contact/workshop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          workshopTitle,
          workshopSlug,
          organizerEmail,
        }),
      });
      if (res.ok) {
        setResult("ok");
        setTimeout(() => {
          onClose();
          setForm({ name: "", email: "", phone: "", message: "" });
          setResult(null);
        }, 2000);
      } else {
        setResult("err");
      }
    } catch {
      setResult("err");
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  const waPhone = organizerPhone?.replace(/\D/g, "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 z-10">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 transition-colors">
          <XIcon />
        </button>

        <h3 className="text-xl font-bold mb-1" style={{ color: B.dark }}>Soru Sor</h3>
        <p className="text-sm mb-6" style={{ color: B.warm }}>{workshopTitle} hakkında merak ettiklerinizi sorun.</p>

        {result === "ok" ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${B.coral}15` }}>
              <svg className="w-7 h-7" style={{ color: B.coral }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="font-semibold" style={{ color: B.dark }}>Mesajınız iletildi!</p>
            <p className="text-sm mt-1" style={{ color: B.warm }}>En kısa sürede dönüş yapılacaktır.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: B.dark }}>İsim *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-colors"
                placeholder="Adınız Soyadınız"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: B.dark }}>E-posta *</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-colors"
                placeholder="ornek@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: B.dark }}>Telefon</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-colors"
                placeholder="05XX XXX XX XX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: B.dark }}>Mesajınız *</label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-colors resize-none"
                placeholder="Sorunuzu veya mesajınızı yazın..."
              />
            </div>

            {result === "err" && (
              <p className="text-sm text-red-500">Bir hata oluştu. Lütfen tekrar deneyin.</p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 rounded-full text-white font-semibold text-sm transition-opacity disabled:opacity-50"
              style={{ background: B.coral }}
            >
              {sending ? "Gönderiliyor..." : "Gönder"}
            </button>

            {waPhone && (
              <a
                href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Merhaba, "${workshopTitle}" atölyesi hakkında bilgi almak istiyorum.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full border-2 text-sm font-semibold transition-colors hover:bg-green-50"
                style={{ borderColor: "#25D366", color: "#25D366" }}
              >
                <WhatsAppIcon className="w-4 h-4" />
                WhatsApp ile Yaz
              </a>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

/* ─── Price Section (dark theme) ─────────────────── */

function DarkPriceSection({
  event,
}: {
  event: MarketplaceEvent;
}) {
  const priceOptions = Array.isArray(event.price_options) ? event.price_options : null;

  return (
    <section id="fiyatlar" className="py-16 px-6" style={{ background: B.dark }}>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
          Katılım Seçenekleri
        </h2>

        {priceOptions && priceOptions.length > 0 ? (
          <div className="rounded-xl overflow-hidden border border-white/10 mb-8">
            <div className="divide-y divide-white/10">
              {priceOptions.map((opt, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-5" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div>
                    <p className="text-sm font-semibold text-white">{opt.label}</p>
                    {opt.note && <p className="text-xs text-white/50 mt-0.5">{opt.note}</p>}
                  </div>
                  <span className="font-bold text-xl" style={{ color: B.coral }}>{fmtPrice(opt.price)} TL</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center mb-8">
            <span className="text-5xl font-bold" style={{ color: B.coral }}>{fmtPrice(event.price)}</span>
            <span className="text-xl text-white/60 ml-2">TL</span>
          </div>
        )}

        <div className="flex justify-center gap-4 flex-wrap">
          {event.organizer_url ? (
            <a
              href={event.organizer_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ background: B.coral }}
            >
              Kayıt Ol
              <ExternalLinkIcon />
            </a>
          ) : event.organizer_phone ? (
            <a
              href={`tel:${event.organizer_phone}`}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ background: B.coral }}
            >
              Ara &amp; Kayıt Ol
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* ─── Main Component ─────────────────────────────── */

export default function MarketplaceDetailClient({ event }: { event: MarketplaceEvent }) {
  const [showContactModal, setShowContactModal] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver → hero'dan ayrılınca sticky bar görünür
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollToFiyatlar = useCallback(() => {
    document.getElementById("fiyatlar")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const priceLabel =
    event.price > 0 ? `${fmtPrice(event.price)} TL` : "Ücretsiz";

  return (
    <>
      {/* ─── Hero ─────────────────────────────── */}
      <div ref={heroRef}>
        <section className="relative w-full aspect-[16/9] max-h-[560px] overflow-hidden">
          {event.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.image_url}
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0" style={{ background: B.dark }} />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Back link */}
          <a
            href="/atolyeler"
            className="absolute top-6 left-6 z-10 inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Tüm Atölyeler
          </a>

          {/* Top-left badges */}
          <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
            {event.event_date && <DateBadge date={event.event_date} size="lg" />}
            <span
              className="px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm"
              style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
            >
              {CATEGORY_LABELS[event.category] ?? event.category}
            </span>
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-2">
              {event.title}
            </h1>
            {event.short_description && (
              <p className="text-base md:text-lg text-white/80 max-w-2xl">
                {event.short_description}
              </p>
            )}
          </div>
        </section>
      </div>

      {/* ─── Info Strip ───────────────────────── */}
      <section className="border-b" style={{ background: "white", borderColor: B.light }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-wrap gap-x-6 gap-y-3 text-sm" style={{ color: B.warm }}>
          {event.event_date && (
            <span className="flex items-center gap-2">
              <CalendarIcon />
              {fmtFullDate(event.event_date)}
            </span>
          )}
          {event.duration_note && (
            <span className="flex items-center gap-2">
              <ClockIcon />
              {event.duration_note}
            </span>
          )}
          {event.venue_name ? (
            <span className="flex items-center gap-2">
              <MapPinIcon />
              {event.venue_name}{event.district ? `, ${event.district}` : ""} · {event.city}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <MapPinIcon />
              Online · Zoom
            </span>
          )}
          {event.max_participants && (
            <span className="flex items-center gap-2">
              <UsersIcon />
              Maks. {event.max_participants} kişi
            </span>
          )}
        </div>
      </section>

      {/* ─── Two Column Layout ────────────────── */}
      <section className="py-10 md:py-14 px-6" style={{ background: B.cream }}>
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-10">

          {/* Left — description + gallery */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold mb-4" style={{ color: B.dark }}>Atölye Hakkında</h2>

            {event.description && (
              <div className="prose prose-sm max-w-none mb-8">
                <p className="text-base leading-relaxed whitespace-pre-line" style={{ color: "#4a4340" }}>
                  {event.description}
                </p>
              </div>
            )}

            {/* Gallery carousel */}
            {event.gallery_urls && event.gallery_urls.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3" style={{ color: B.dark }}>Galeri</h3>
                <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 scrollbar-hide">
                  {event.gallery_urls.map((url, i) => (
                    <div key={i} className="flex-shrink-0 snap-start w-72 h-48 rounded-xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`${event.title} galeri ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recurring note */}
            {event.recurring && event.recurring_note && (
              <div className="rounded-xl px-5 py-4 text-sm border" style={{ background: "#FFFDF5", borderColor: "#F5E6B8", color: "#7A6B3A" }}>
                {event.recurring_note}
              </div>
            )}
          </div>

          {/* Right — sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0 space-y-5">

            {/* Organizer card */}
            <div className="rounded-2xl border p-5" style={{ background: "white", borderColor: B.light }}>
              <div className="flex items-center gap-3 mb-4">
                {event.organizer_logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={event.organizer_logo_url} alt={event.organizer_name} className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${B.coral}15` }}>
                    <span className="font-bold text-lg" style={{ color: B.coral }}>{event.organizer_name.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold" style={{ color: B.dark }}>{event.organizer_name}</p>
                  <p className="text-xs" style={{ color: B.warm }}>Düzenleyici</p>
                </div>
              </div>

              <div className="space-y-2">
                {event.organizer_phone && (
                  <a href={`tel:${event.organizer_phone}`} className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity" style={{ color: B.dark }}>
                    <PhoneIcon className="w-3.5 h-3.5" />
                    {event.organizer_phone}
                  </a>
                )}
                {event.organizer_email && (
                  <a href={`mailto:${event.organizer_email}`} className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity" style={{ color: B.dark }}>
                    <MailIcon className="w-3.5 h-3.5" />
                    {event.organizer_email}
                  </a>
                )}
                {event.organizer_url && (
                  <a href={event.organizer_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity" style={{ color: B.dark }}>
                    <GlobeIcon className="w-3.5 h-3.5" />
                    Web sitesi
                  </a>
                )}
              </div>

              {event.organizer_phone && (
                <a
                  href={`https://wa.me/${event.organizer_phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Merhaba, "${event.title}" atölyesi hakkında bilgi almak istiyorum.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-sm font-semibold transition-colors hover:bg-green-50 border-2"
                  style={{ borderColor: "#25D366", color: "#25D366" }}
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  WhatsApp
                </a>
              )}
            </div>

            {/* Location card */}
            {event.venue_address && (
              <div className="rounded-2xl border p-5" style={{ background: "white", borderColor: B.light }}>
                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    {event.venue_name && <p className="text-sm font-semibold" style={{ color: B.dark }}>{event.venue_name}</p>}
                    <p className="text-sm mt-0.5" style={{ color: B.warm }}>{event.venue_address}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick CTA card */}
            <div className="rounded-2xl border p-5 text-center" style={{ background: "white", borderColor: B.light }}>
              <div className="mb-3">
                <span className="text-3xl font-bold" style={{ color: B.coral }}>{fmtPrice(event.price)}</span>
                <span className="text-lg ml-1" style={{ color: B.warm }}>TL</span>
              </div>
              {event.organizer_url ? (
                <a
                  href={event.organizer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full text-white font-semibold text-sm transition-opacity hover:opacity-90"
                  style={{ background: B.coral }}
                >
                  Kayıt Ol
                  <ExternalLinkIcon />
                </a>
              ) : event.organizer_phone ? (
                <a
                  href={`tel:${event.organizer_phone}`}
                  className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full text-white font-semibold text-sm transition-opacity hover:opacity-90"
                  style={{ background: B.coral }}
                >
                  Ara &amp; Kayıt Ol
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Dark Price Section ───────────────── */}
      <DarkPriceSection event={event} />

      {/* ─── Contact Modal ────────────────────── */}
      <ContactModal
        open={showContactModal}
        onClose={() => setShowContactModal(false)}
        workshopTitle={event.title}
        workshopSlug={event.slug}
        organizerEmail={event.organizer_email}
        organizerPhone={event.organizer_phone}
      />

      {/* ─── Sticky Bottom Bar ────────────────── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ${
          stickyVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="border-t shadow-[0_-4px_20px_rgba(0,0,0,0.08)]" style={{ background: "white", borderColor: B.light }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            {/* Left — title + price (hidden on mobile) */}
            <div className="hidden sm:block min-w-0 flex-1">
              <p className="text-sm font-bold truncate" style={{ color: B.dark }}>{event.title}</p>
              <p className="text-sm font-semibold" style={{ color: B.coral }}>{priceLabel}</p>
            </div>

            {/* Right — buttons */}
            <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setShowContactModal(true)}
                className="px-4 py-2.5 rounded-full text-sm font-semibold border-2 transition-colors hover:bg-neutral-50 flex-1 sm:flex-initial"
                style={{ borderColor: B.dark, color: B.dark }}
              >
                Soru Sor
              </button>
              <button
                onClick={scrollToFiyatlar}
                className="hidden sm:inline-flex px-4 py-2.5 rounded-full text-sm font-semibold border-2 transition-colors hover:bg-neutral-50"
                style={{ borderColor: B.dark, color: B.dark }}
              >
                Fiyatlar
              </button>
              {event.organizer_url ? (
                <a
                  href={event.organizer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full text-white text-sm font-semibold transition-opacity hover:opacity-90 flex-1 sm:flex-initial"
                  style={{ background: B.coral }}
                >
                  Kayıt Ol
                  <ExternalLinkIcon className="w-3 h-3" />
                </a>
              ) : event.organizer_phone ? (
                <a
                  href={`tel:${event.organizer_phone}`}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full text-white text-sm font-semibold transition-opacity hover:opacity-90 flex-1 sm:flex-initial"
                  style={{ background: B.coral }}
                >
                  Ara &amp; Kayıt Ol
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom spacer for sticky bar */}
      <div className="h-16" />
    </>
  );
}
