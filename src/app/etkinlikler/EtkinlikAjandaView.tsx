"use client";

import { Fragment, useState, useRef, useEffect } from "react";
import Link from "next/link";

/* ─── Tipler ──────────────────────────────────────── */

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  ai_comment: string | null;
  event_type: string | null;
  venue: string | null;
  address: string | null;
  event_date: string | null;
  source_url: string | null;
  source_name: string | null;
  price_info: string | null;
  is_klemens_event: boolean;
  image_url: string | null;
};

type Props = { events: EventRow[] };

/* ─── Sabitler ────────────────────────────────────── */

const TYPE_LABELS: Record<string, string> = {
  sergi: "Sergi",
  konser: "Konser",
  tiyatro: "Tiyatro",
  soylesi: "Söyleşi",
  panel: "Panel",
  festival: "Festival",
  "film-festivali": "Film Festivali",
  performans: "Performans",
  opera: "Opera",
  bale: "Bale",
};

const TYPE_COLORS: Record<string, string> = {
  sergi: "bg-coral/10 text-coral",
  konser: "bg-amber-100 text-amber-700",
  tiyatro: "bg-violet-100 text-violet-700",
  soylesi: "bg-emerald-100 text-emerald-700",
  panel: "bg-cyan-100 text-cyan-700",
  festival: "bg-sky-100 text-sky-700",
  "film-festivali": "bg-rose-100 text-rose-700",
  performans: "bg-fuchsia-100 text-fuchsia-700",
  opera: "bg-red-100 text-red-700",
  bale: "bg-pink-100 text-pink-700",
};

/* ─── Yardımcılar ────────────────────────────────── */

function fmtShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

/* ─── Accordion İçeriği ──────────────────────────── */

function AccordionContent({ event }: { event: EventRow }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, []);

  const href = event.is_klemens_event ? "/atolyeler" : `/etkinlikler/${event.id}`;

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
            {event.ai_comment && (
              <p className="text-sm text-warm-900/60 italic leading-relaxed mb-3">
                {event.ai_comment}
              </p>
            )}
            {event.description && !event.ai_comment && (
              <p className="text-sm text-warm-900/70 leading-relaxed mb-3 line-clamp-3">
                {event.description}
              </p>
            )}

            <div className="flex flex-col gap-1.5 text-sm text-warm-900/60 mb-4">
              {event.address && (
                <p className="flex items-start gap-2">
                  <span className="flex-shrink-0">📍</span>
                  <span>{event.address}</span>
                </p>
              )}
              {event.source_name && (
                <p className="flex items-center gap-2">
                  <span className="flex-shrink-0">📌</span>
                  <span>{event.source_name}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={href}
                className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-lg transition-colors no-underline"
                style={{ background: "#FF6D60", color: "#fff" }}
              >
                Detay <span aria-hidden>→</span>
              </Link>
              {event.source_url && !event.is_klemens_event && (
                <a
                  href={event.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-lg border border-warm-300 text-warm-900/70 hover:border-coral hover:text-coral transition-colors no-underline"
                >
                  Kaynağa Git <span aria-hidden>→</span>
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

export default function EtkinlikAjandaView({ events }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-20 text-warm-900/30">
        <p className="text-base">Bu kategoride yaklaşan etkinlik bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-sm" style={{ minWidth: 500 }}>
        <thead>
          <tr className="border-b-2 border-warm-200">
            <th className="py-3 px-3 text-xs font-bold text-warm-900 uppercase tracking-wider">
              Tarih
            </th>
            <th className="py-3 px-3 text-xs font-bold text-warm-900 uppercase tracking-wider">
              Etkinlik
            </th>
            <th className="hidden md:table-cell py-3 px-3 text-xs font-bold text-warm-900 uppercase tracking-wider">
              Mekan
            </th>
            <th className="hidden lg:table-cell py-3 px-3 text-xs font-bold text-warm-900 uppercase tracking-wider">
              Tür
            </th>
          </tr>
        </thead>

        <tbody>
          {events.map((e) => {
            const isOpen = expandedId === e.id;
            const type = e.event_type ?? "";
            const badgeCls = TYPE_COLORS[type] ?? "bg-warm-100 text-warm-900/50";
            const label = TYPE_LABELS[type] ?? type;

            return (
              <Fragment key={e.id}>
                <tr
                  className="group cursor-pointer"
                  onClick={() => toggle(e.id)}
                >
                  <td className="py-3 px-3 border-b border-warm-100 transition-colors group-hover:bg-warm-50 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-warm-900">
                        {e.event_date ? fmtShortDate(e.event_date) : "—"}
                      </span>
                      {e.event_date && (
                        <span className="text-xs text-warm-900/40">
                          {fmtTime(e.event_date)}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-3 border-b border-warm-100 transition-colors group-hover:bg-warm-50">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-warm-900 group-hover:text-coral transition-colors">
                        {e.title}
                      </span>
                      {e.is_klemens_event && (
                        <span
                          className="flex-shrink-0 px-1.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wide"
                          style={{ background: "#10b981", color: "#fff" }}
                        >
                          Klemens
                        </span>
                      )}
                      {/* Mobilde tür badge'ini burada göster */}
                      {label && (
                        <span className={`lg:hidden flex-shrink-0 px-1.5 py-0.5 text-[9px] font-bold rounded-full ${badgeCls}`}>
                          {label}
                        </span>
                      )}
                    </div>
                    {/* Mobilde mekan bilgisi */}
                    {e.venue && (
                      <p className="md:hidden text-xs text-warm-900/40 mt-0.5 truncate">
                        {e.venue}
                      </p>
                    )}
                  </td>

                  <td className="hidden md:table-cell py-3 px-3 border-b border-warm-100 transition-colors group-hover:bg-warm-50">
                    <span className="text-warm-900/70">{e.venue || "—"}</span>
                  </td>

                  <td className="hidden lg:table-cell py-3 px-3 border-b border-warm-100 transition-colors group-hover:bg-warm-50">
                    {label && (
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${badgeCls}`}>
                        {label}
                      </span>
                    )}
                  </td>
                </tr>

                {/* Accordion */}
                {isOpen && (
                  <tr>
                    <td colSpan={4} className="p-0 border-b border-warm-200 bg-warm-50/50">
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
