"use client";

import { useState } from "react";
import type { MarketplaceEvent } from "@/types/marketplace";
import HostCard from "./components/HostCard";
import DisclaimerNote from "./components/DisclaimerNote";
import AtolyeFAQ from "./components/AtolyeFAQ";

/* ─── Constants ──────────────────────────────────── */

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
  return new Date(iso).toLocaleDateString("tr-TR", {
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

/* ─── Icons ──────────────────────────────────────── */

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

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
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
        body: JSON.stringify({ ...form, workshopTitle, workshopSlug, organizerEmail }),
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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 z-10">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 transition-colors">
          <XIcon />
        </button>
        <h3 className="text-xl font-bold mb-1 text-warm-900">Soru Sor</h3>
        <p className="text-sm mb-6 text-brand-warm">{workshopTitle} hakkında merak ettiklerinizi sorun.</p>

        {result === "ok" ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center bg-coral/10">
              <svg className="w-7 h-7 text-coral" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="font-semibold text-warm-900">Mesajınız iletildi!</p>
            <p className="text-sm mt-1 text-brand-warm">En kısa sürede dönüş yapılacaktır.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-warm-900">İsim *</label>
              <input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-colors" placeholder="Adınız Soyadınız" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-warm-900">E-posta *</label>
              <input required type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-colors" placeholder="ornek@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-warm-900">Telefon</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-colors" placeholder="05XX XXX XX XX" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-warm-900">Mesajınız *</label>
              <textarea required rows={4} value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-colors resize-none" placeholder="Sorunuzu veya mesajınızı yazın..." />
            </div>
            {result === "err" && <p className="text-sm text-red-500">Bir hata oluştu. Lütfen tekrar deneyin.</p>}
            <button type="submit" disabled={sending} className="w-full py-3 rounded-full text-white font-semibold text-sm bg-coral transition-opacity disabled:opacity-50">
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

/* ─── CTA Button ─────────────────────────────────── */

function CTAButton({ event, fullWidth = false }: { event: MarketplaceEvent; fullWidth?: boolean }) {
  const cls = `inline-flex items-center justify-center gap-2 py-3.5 rounded-full text-white font-semibold text-sm bg-coral transition-opacity hover:opacity-90 ${fullWidth ? "w-full" : "px-8"}`;

  if (event.organizer_url) {
    return (
      <a href={event.organizer_url} target="_blank" rel="noopener noreferrer" className={cls}>
        Kayıt Ol
        <ExternalLinkIcon />
      </a>
    );
  }
  if (event.organizer_phone) {
    return (
      <a href={`tel:${event.organizer_phone}`} className={cls}>
        Ara &amp; Kayıt Ol
      </a>
    );
  }
  return null;
}

/* ─── Main Component ─────────────────────────────── */

export default function MarketplaceDetailClient({ event }: { event: MarketplaceEvent }) {
  const [showContactModal, setShowContactModal] = useState(false);

  const host = Array.isArray(event.host) ? event.host[0] ?? null : event.host ?? null;
  const isKlemens = host?.slug === "klemens" || event.is_klemens;
  const hostName = host?.name ?? event.organizer_name;
  const priceLabel = event.price > 0 ? `${fmtPrice(event.price)} TL` : "Ücretsiz";
  const priceOptions = Array.isArray(event.price_options) ? event.price_options : null;
  const categoryLabel = CATEGORY_LABELS[event.category] ?? event.category;

  return (
    <>
      <main className="bg-cream min-h-screen">
        {/* ═══ Breadcrumb — desktop only ═══ */}
        <div className="hidden lg:block max-w-6xl mx-auto px-6 pt-20 pb-2">
          <nav className="flex items-center gap-1.5 text-xs text-brand-warm">
            <a href="/atolyeler" className="hover:text-coral transition-colors">Atölyeler</a>
            <span>/</span>
            <span className="text-warm-900/40">{categoryLabel}</span>
            <span>/</span>
            <span className="text-warm-900/60 truncate max-w-[200px]">{event.title}</span>
          </nav>
        </div>

        {/* Mobile back button */}
        <div className="lg:hidden pt-20 px-6 pb-2">
          <a href="/atolyeler" className="inline-flex items-center gap-1.5 text-sm text-brand-warm hover:text-coral transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Atölyeler
          </a>
        </div>

        {/* ═══ HERO — 2 kolon ═══ */}
        <section className="max-w-6xl mx-auto px-6 pt-4 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

            {/* Sol — görsel */}
            <div className="lg:col-span-3">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-warm-100">
                {event.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-warm-200 to-warm-300 flex items-center justify-center">
                    <span className="text-warm-900/20 text-5xl">🎨</span>
                  </div>
                )}
              </div>
            </div>

            {/* Sağ — bilgi paneli (sticky) */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-24 bg-warm-50 rounded-2xl p-6 lg:p-8 space-y-5">
                {/* Kategori + Klemens etiketi */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-coral uppercase tracking-wide">
                    {categoryLabel}
                  </span>
                  {isKlemens && (
                    <span className="text-[10px] font-bold text-brand-warm uppercase tracking-wider bg-warm-100 px-2 py-0.5 rounded-full">
                      Klemens Atölyesi
                    </span>
                  )}
                </div>

                {/* Başlık */}
                <h1 className="text-2xl lg:text-3xl font-bold text-warm-900 leading-tight">
                  {event.title}
                </h1>

                {/* Kısa açıklama */}
                {event.short_description && (
                  <p className="text-sm text-brand-warm leading-relaxed line-clamp-3">
                    {event.short_description}
                  </p>
                )}

                {/* Ayraç */}
                <div className="border-t border-warm-200" />

                {/* Bilgi satırları */}
                <div className="space-y-3 text-sm text-warm-900/70">
                  {event.event_date && (
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="w-4 h-4 text-brand-warm flex-shrink-0" />
                      <span>{fmtFullDate(event.event_date)}</span>
                    </div>
                  )}
                  {event.duration_note && (
                    <div className="flex items-center gap-3">
                      <ClockIcon className="w-4 h-4 text-brand-warm flex-shrink-0" />
                      <span>{event.duration_note}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="w-4 h-4 text-brand-warm flex-shrink-0" />
                    <span>
                      {event.venue_name
                        ? `${event.venue_name}${event.district ? `, ${event.district}` : ""} · ${event.city}`
                        : event.city === "Online"
                          ? "Online (Zoom)"
                          : `${event.district ? `${event.district}, ` : ""}${event.city}`}
                    </span>
                  </div>
                  {event.max_participants && (
                    <div className="flex items-center gap-3">
                      <UsersIcon className="w-4 h-4 text-brand-warm flex-shrink-0" />
                      <span>Maks. {event.max_participants} kişi</span>
                    </div>
                  )}
                  {event.recurring && event.recurring_note && (
                    <div className="flex items-start gap-3">
                      <svg className="w-4 h-4 text-brand-warm flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      </svg>
                      <span className="text-xs text-brand-warm">{event.recurring_note}</span>
                    </div>
                  )}
                </div>

                {/* Ayraç */}
                <div className="border-t border-warm-200" />

                {/* Fiyat */}
                <div>
                  {priceOptions && priceOptions.length > 0 ? (
                    <div className="space-y-2">
                      {priceOptions.map((opt, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-warm-900">{opt.label}</span>
                            {opt.note && <span className="text-xs text-brand-warm ml-2">{opt.note}</span>}
                          </div>
                          <span className="font-bold text-coral">{fmtPrice(opt.price)} TL</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-warm-900">{priceLabel}</span>
                      {event.price > 0 && <span className="text-xs text-brand-warm">/ kişi başı</span>}
                    </div>
                  )}
                </div>

                {/* CTA */}
                <CTAButton event={event} fullWidth />

                {/* İletişime Geç */}
                <button
                  onClick={() => setShowContactModal(true)}
                  className="w-full py-3 rounded-full text-sm font-semibold border-2 border-warm-900 text-warm-900 hover:bg-warm-100 transition-colors"
                >
                  İletişime Geç
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ İÇERİK — 2 kolon ═══ */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Sol — açıklama + galeri */}
            <div className="lg:col-span-2">
              {event.description && (
                <>
                  <h2 className="text-xl font-bold text-warm-900 mb-4">Atölye Hakkında</h2>
                  <div className="prose prose-sm max-w-none mb-8">
                    <p className="text-base leading-relaxed text-warm-900/70 whitespace-pre-line">
                      {event.description}
                    </p>
                  </div>
                </>
              )}

              {/* Galeri */}
              {event.gallery_urls && event.gallery_urls.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-warm-900 mb-3">Galeri</h3>
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
            </div>

            {/* Sağ — sidebar (sticky) */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-5">
                <HostCard host={host} isKlemens={!!isKlemens} />
                {!isKlemens && <DisclaimerNote hostName={hostName} />}
                <AtolyeFAQ hostName={hostName} isKlemens={!!isKlemens} />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ═══ Mobile Sticky CTA Bar — md:hidden ═══ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        <div className="bg-white border-t border-warm-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <span className="text-lg font-bold text-warm-900">{priceLabel}</span>
            </div>
            <div className="flex-shrink-0">
              <CTAButton event={event} />
            </div>
          </div>
        </div>
      </div>
      {/* Mobile bar spacer */}
      <div className="lg:hidden h-16" />

      {/* ═══ Contact Modal ═══ */}
      <ContactModal
        open={showContactModal}
        onClose={() => setShowContactModal(false)}
        workshopTitle={event.title}
        workshopSlug={event.slug}
        organizerEmail={event.organizer_email}
        organizerPhone={event.organizer_phone}
      />
    </>
  );
}
