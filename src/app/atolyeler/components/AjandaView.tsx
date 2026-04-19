"use client";

import { Fragment, useState, useRef, useEffect } from "react";

/* ─── Tipler ──────────────────────────────────────── */

type MarketplaceEvent = {
  id: string;
  slug: string;
  title: string;
  category: string;
  city: string;
  district: string | null;
  price: number;
  image_url: string | null;
  event_date: string | null;
  is_featured: boolean;
  is_klemens: boolean;
  detail_slug: string | null;
  duration_note: string | null;
  organizer_name: string;
  short_description: string | null;
  venue_name: string | null;
  venue_address: string | null;
  organizer_phone: string | null;
  organizer_email: string | null;
  organizer_url: string | null;
};

type Props = { events: MarketplaceEvent[] };

/* ─── Sabitler ────────────────────────────────────── */

const CATEGORY_LABELS: Record<string, string> = {
  "sanat-tarihi": "Sanat Tarihi",
  sinema: "Sinema",
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
};

/* ─── Yardımcılar ────────────────────────────────── */

function isPast(event_date: string | null): boolean {
  if (!event_date) return false;
  return new Date(event_date) < new Date();
}

function fmtShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
}

function fmtPrice(price: number): string {
  if (price === 0) return "Ücretsiz";
  return `₺${price}`;
}

/* ─── Accordion İçeriği ──────────────────────────── */

function AccordionContent({ event }: { event: MarketplaceEvent }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, []);

  const href = event.detail_slug
    ? `/atolyeler/${event.detail_slug}`
    : `/atolyeler/${event.slug}`;

  return (
    <div
      className="overflow-hidden transition-all duration-300 ease-in-out"
      style={{ maxHeight: height || "none" }}
    >
      <div ref={contentRef} className="px-4 py-5 md:px-6">
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Görsel */}
          {event.image_url && (
            <div className="flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full sm:w-[200px] h-[140px] object-cover rounded-lg"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).parentElement!.style.display = "none";
                }}
              />
            </div>
          )}

          {/* Detaylar */}
          <div className="flex-1 min-w-0">
            {event.short_description && (
              <p className="text-sm text-warm-900/70 leading-relaxed mb-3">
                {event.short_description}
              </p>
            )}

            <div className="flex flex-col gap-1.5 text-sm text-warm-900/60 mb-4">
              {event.venue_address && (
                <p className="flex items-start gap-2">
                  <span className="flex-shrink-0">📍</span>
                  <span>{event.venue_address}</span>
                </p>
              )}
              {event.organizer_phone && (
                <p className="flex items-center gap-2">
                  <span className="flex-shrink-0">📞</span>
                  <a
                    href={`tel:${event.organizer_phone}`}
                    className="hover:text-coral transition-colors"
                  >
                    {event.organizer_phone}
                  </a>
                </p>
              )}
              {event.organizer_email && (
                <p className="flex items-center gap-2">
                  <span className="flex-shrink-0">✉️</span>
                  <a
                    href={`mailto:${event.organizer_email}`}
                    className="hover:text-coral transition-colors"
                  >
                    {event.organizer_email}
                  </a>
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <a
                href={href}
                className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-lg transition-colors"
                style={{ background: "#FF6D60", color: "#fff" }}
              >
                Detay <span aria-hidden>→</span>
              </a>
              {event.organizer_url && (
                <a
                  href={event.organizer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-lg border border-warm-300 text-warm-900/70 hover:border-coral hover:text-coral transition-colors"
                >
                  Kayıt Ol <span aria-hidden>→</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Ana Bileşen ────────────────────────────────── */

export default function AjandaView({ events }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-warm-900/40 text-lg">
          Bu kriterlere uygun atölye bulunamadı.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-sm" style={{ minWidth: 600 }}>
        {/* Başlık */}
        <thead>
          <tr className="border-b-2 border-warm-200">
            <th className="hidden lg:table-cell py-3 px-3 text-xs font-bold text-warm-900 uppercase tracking-wider">
              Düzenleyici
            </th>
            <th className="py-3 px-3 text-xs font-bold text-warm-900 uppercase tracking-wider">
              Atölye
            </th>
            <th className="py-3 px-3 text-xs font-bold text-warm-900 uppercase tracking-wider">
              Tarih
            </th>
            <th className="py-3 px-3 text-xs font-bold text-warm-900 uppercase tracking-wider">
              Konum
            </th>
            <th className="hidden md:table-cell py-3 px-3 text-xs font-bold text-warm-900 uppercase tracking-wider text-right">
              Fiyat
            </th>
            <th className="hidden lg:table-cell py-3 px-3 text-xs font-bold text-warm-900 uppercase tracking-wider">
              Kategori
            </th>
          </tr>
        </thead>

        <tbody>
          {events.map((e) => {
            const past = isPast(e.event_date);
            const isOpen = expandedId === e.id;
            const location = e.district
              ? `${e.city}, ${e.district}`
              : e.city;

            return (
              <Fragment key={e.id}>
                <tr
                  className="group cursor-pointer"
                  onClick={() => toggle(e.id)}
                >
                  <td
                    className={`hidden lg:table-cell py-3 px-3 border-b border-warm-100 transition-colors group-hover:bg-warm-50 ${past ? "opacity-50" : ""}`}
                  >
                    <div className="flex flex-col">
                      <span className="text-warm-900/70">{e.organizer_name}</span>
                      {e.is_klemens && (
                        <span className="text-xs text-warm-900/40">Kerem Hun</span>
                      )}
                    </div>
                  </td>

                  <td
                    className={`py-3 px-3 border-b border-warm-100 transition-colors group-hover:bg-warm-50 ${past ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-warm-900">
                        {e.title}
                      </span>
                      {e.is_klemens && (
                        <span
                          className="flex-shrink-0 px-1.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wide"
                          style={{ background: "#FF6D60", color: "#fff" }}
                        >
                          Klemens
                        </span>
                      )}
                      {e.is_featured && !e.is_klemens && (
                        <span className="flex-shrink-0 px-1.5 py-0.5 text-[9px] font-bold bg-amber-500 text-white rounded-full uppercase tracking-wide">
                          Öne Çıkan
                        </span>
                      )}
                    </div>
                  </td>

                  <td
                    className={`py-3 px-3 border-b border-warm-100 transition-colors group-hover:bg-warm-50 whitespace-nowrap ${past ? "opacity-50" : ""}`}
                  >
                    <span className={past ? "line-through text-warm-900/60" : "text-warm-900/70"}>
                      {e.event_date ? fmtShortDate(e.event_date) : "—"}
                    </span>
                  </td>

                  <td
                    className={`py-3 px-3 border-b border-warm-100 transition-colors group-hover:bg-warm-50 ${past ? "opacity-50" : ""}`}
                  >
                    <span className="text-warm-900/70">{location}</span>
                  </td>

                  <td
                    className={`hidden md:table-cell py-3 px-3 border-b border-warm-100 transition-colors group-hover:bg-warm-50 text-right ${past ? "opacity-50" : ""}`}
                  >
                    <span className="text-warm-900/70 font-medium">
                      {fmtPrice(e.price)}
                    </span>
                  </td>

                  <td
                    className={`hidden lg:table-cell py-3 px-3 border-b border-warm-100 transition-colors group-hover:bg-warm-50 ${past ? "opacity-50" : ""}`}
                  >
                    <span className="px-2 py-0.5 text-xs rounded-full bg-warm-100 text-warm-900/60">
                      {CATEGORY_LABELS[e.category] ?? e.category}
                    </span>
                  </td>
                </tr>

                {/* Accordion — ayrı satır */}
                {isOpen && (
                  <tr>
                    <td colSpan={6} className="p-0 border-b border-warm-200 bg-warm-50/50">
                      <AccordionContent event={e} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
