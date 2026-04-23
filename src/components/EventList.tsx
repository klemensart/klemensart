"use client";

import { Fragment, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { EventRow } from "@/types/event";

/* ─── Sabitler ─────────────────────────────────────── */

export const TYPE_LABELS: Record<string, string> = {
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
  atolye: "Atölye",
};

export const TYPE_COLORS: Record<string, string> = {
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
  atolye: "bg-teal-100 text-teal-700",
};

/* ─── Yardımcılar ──────────────────────────────────── */

function fmtDate(iso: string | null) {
  if (!iso) return { num: "—", month: "—", time: "" };
  const d = new Date(iso);
  return {
    num: d.toLocaleDateString("tr-TR", { day: "numeric" }),
    month: d.toLocaleDateString("tr-TR", { month: "short" }).toUpperCase(),
    time: d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
  };
}

type WeekGroup = { label: string; events: EventRow[] };

function groupEventsByWeek(events: EventRow[]): WeekGroup[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const groups: Map<string, EventRow[]> = new Map();

  for (const e of events) {
    if (!e.event_date) {
      const key = "Tarihi Belirsiz";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(e);
      continue;
    }

    const eventDate = new Date(e.event_date);
    const diffDays = Math.floor(
      (eventDate.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24)
    );

    let key: string;
    if (diffDays < 0) {
      key = "Geçmiş";
    } else if (diffDays < 7) {
      key = "Bu Hafta";
    } else if (diffDays < 14) {
      key = "Gelecek Hafta";
    } else {
      key = eventDate.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
      // Capitalize first letter
      key = key.charAt(0).toUpperCase() + key.slice(1);
    }

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  }

  return Array.from(groups.entries()).map(([label, evts]) => ({ label, events: evts }));
}

/* ─── Accordion İçeriği ────────────────────────────── */

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

/* ─── EventRow Satırı ──────────────────────────────── */

function EventRowItem({
  e,
  compact,
  isOpen,
  onToggle,
}: {
  e: EventRow;
  compact: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const router = useRouter();
  const type = e.event_type ?? "";
  const badgeCls = TYPE_COLORS[type] ?? "bg-warm-100 text-warm-900/50";
  const label = TYPE_LABELS[type] ?? type;
  const date = fmtDate(e.event_date);
  const href = e.is_klemens_event ? "/atolyeler" : `/etkinlikler/${e.id}`;

  const handleClick = () => {
    if (compact) {
      router.push(href);
    } else {
      onToggle();
    }
  };

  return (
    <Fragment>
      <tr className="group cursor-pointer" onClick={handleClick}>
        {/* Tarih */}
        <td className="py-3 px-3 border-b border-warm-100 transition-colors group-hover:bg-warm-50 whitespace-nowrap w-[80px]">
          <div className="flex flex-col items-center text-center">
            <span className="text-[10px] font-bold text-coral/50 leading-none tracking-wide">
              {date.month}
            </span>
            <span className="text-lg font-bold text-warm-900 leading-tight">
              {date.num}
            </span>
            {date.time && (
              <span className="text-[10px] text-warm-900/35 leading-tight mt-0.5">
                {date.time}
              </span>
            )}
          </div>
        </td>

        {/* Etkinlik */}
        <td className="py-3 px-3 border-b border-warm-100 transition-colors group-hover:bg-warm-50">
          <div className="flex items-center gap-2">
            <a href={href} className="font-semibold text-warm-900 group-hover:text-coral transition-colors no-underline" onClick={(ev) => ev.preventDefault()}>
              {e.title}
            </a>
            {e.is_klemens_event && (
              <span className="flex-shrink-0 px-1.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wide bg-emerald-500 text-white">
                Klemens
              </span>
            )}
            {label && (
              <span
                className={`lg:hidden flex-shrink-0 px-1.5 py-0.5 text-[9px] font-bold rounded-full ${badgeCls}`}
              >
                {label}
              </span>
            )}
          </div>
          {e.venue && (
            <p className="md:hidden text-xs text-warm-900/40 mt-0.5 truncate">{e.venue}</p>
          )}
        </td>

        {/* Mekan */}
        <td className="hidden md:table-cell py-3 px-3 border-b border-warm-100 transition-colors group-hover:bg-warm-50">
          <span className="text-warm-900/70">{e.venue || "—"}</span>
        </td>

        {/* Tür */}
        <td className="hidden lg:table-cell py-3 px-3 border-b border-warm-100 transition-colors group-hover:bg-warm-50">
          {label && (
            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${badgeCls}`}>
              {label}
            </span>
          )}
        </td>

        {/* Ok ikonu */}
        <td className="py-3 px-1 border-b border-warm-100 transition-colors group-hover:bg-warm-50 w-[28px]">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-warm-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </td>
      </tr>

      {!compact && isOpen && (
        <tr>
          <td colSpan={5} className="p-0 border-b border-warm-200 bg-warm-50/50">
            <AccordionContent event={e} />
          </td>
        </tr>
      )}
    </Fragment>
  );
}

/* ─── Ana Bileşen ──────────────────────────────────── */

type EventListProps = {
  events: EventRow[];
  compact?: boolean;
  showHeader?: boolean;
  limit?: number;
};

export default function EventList({
  events,
  compact = false,
  showHeader = true,
  limit,
}: EventListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const displayed = limit ? events.slice(0, limit) : events;
  const groups = groupEventsByWeek(displayed);

  if (displayed.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-warm-100 bg-warm-50/50">
      <table className="w-full text-left text-sm" style={{ minWidth: 500 }}>
        {showHeader && (
          <thead>
            <tr className="border-b-2 border-warm-200">
              <th className="py-3 px-3 text-xs font-bold text-warm-900/50 uppercase tracking-wider w-[80px]">
                Tarih
              </th>
              <th className="py-3 px-3 text-xs font-bold text-warm-900/50 uppercase tracking-wider">
                Etkinlik
              </th>
              <th className="hidden md:table-cell py-3 px-3 text-xs font-bold text-warm-900/50 uppercase tracking-wider">
                Mekan
              </th>
              <th className="hidden lg:table-cell py-3 px-3 text-xs font-bold text-warm-900/50 uppercase tracking-wider">
                Tür
              </th>
              <th className="w-[28px]" />
            </tr>
          </thead>
        )}

        <tbody>
          {groups.map((group) => (
            <Fragment key={group.label}>
              {/* Hafta / Ay grubu başlığı */}
              <tr>
                <td
                  colSpan={5}
                  className="pt-5 pb-2 px-3 text-[11px] font-bold text-stone-400 uppercase tracking-[0.15em]"
                >
                  {group.label}
                </td>
              </tr>

              {group.events.map((e) => (
                <EventRowItem
                  key={e.id}
                  e={e}
                  compact={compact}
                  isOpen={expandedId === e.id}
                  onToggle={() =>
                    setExpandedId((prev) => (prev === e.id ? null : e.id))
                  }
                />
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
