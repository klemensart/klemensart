"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase";

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

const TYPE_LABELS: Record<string, string> = {
  sergi: "Sergi",
  konser: "Konser",
  tiyatro: "Tiyatro",
  soylesi: "Söyleşi",
  festival: "Festival",
  "film-festivali": "Film Festivali",
};

const TYPE_COLORS: Record<string, string> = {
  sergi:            "bg-coral/10 text-coral",
  konser:           "bg-amber-100 text-amber-700",
  tiyatro:          "bg-violet-100 text-violet-700",
  soylesi:          "bg-emerald-100 text-emerald-700",
  festival:         "bg-sky-100 text-sky-700",
  "film-festivali": "bg-rose-100 text-rose-700",
};

const TYPE_GRADIENTS: Record<string, string> = {
  sergi:            "from-coral/80 to-rose-400/80",
  konser:           "from-amber-400/80 to-orange-500/80",
  tiyatro:          "from-violet-400/80 to-purple-500/80",
  soylesi:          "from-emerald-400/80 to-teal-500/80",
  festival:         "from-sky-400/80 to-blue-500/80",
  "film-festivali": "from-rose-400/80 to-pink-500/80",
};

function EventTypeIcon({ type }: { type: string }) {
  const cn = "w-10 h-10 text-white/40";
  switch (type) {
    case "sergi":
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <rect x="6" y="6" width="12" height="12" rx="1" />
        </svg>
      );
    case "konser":
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      );
    case "tiyatro":
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      );
    case "soylesi":
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "festival":
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case "film-festivali":
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
          <line x1="7" y1="2" x2="7" y2="22" />
          <line x1="17" y1="2" x2="17" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="2" y1="7" x2="7" y2="7" />
          <line x1="2" y1="17" x2="7" y2="17" />
          <line x1="17" y1="7" x2="22" y2="7" />
          <line x1="17" y1="17" x2="22" y2="17" />
        </svg>
      );
    default:
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
  }
}

type Filter = "Tümü" | "Atölyeler" | "Sergi" | "Konser" | "Tiyatro" | "Söyleşi" | "Festival";
const FILTERS: Filter[] = ["Tümü", "Atölyeler", "Sergi", "Konser", "Tiyatro", "Söyleşi", "Festival"];

const FILTER_TO_TYPE: Partial<Record<Filter, string>> = {
  Sergi: "sergi", Konser: "konser", Tiyatro: "tiyatro",
  Söyleşi: "soylesi", Festival: "festival",
};

function fmtDate(iso: string | null) {
  if (!iso) return { num: "—", month: "—", time: "" };
  const d = new Date(iso);
  return {
    num:   d.toLocaleDateString("tr-TR", { day: "numeric" }),
    month: d.toLocaleDateString("tr-TR", { month: "short" }).toUpperCase(),
    time:  d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
  };
}

/* ── Event Card ── */
function EventCard({ e }: { e: EventRow }) {
  const date = fmtDate(e.event_date);
  const type = e.event_type ?? "";
  const badge = TYPE_COLORS[type] ?? "bg-warm-100 text-warm-900/50";
  const label = TYPE_LABELS[type] ?? type;
  const gradient = TYPE_GRADIENTS[type] ?? "from-warm-400/80 to-warm-500/80";

  const meta = [e.venue, date.time || null].filter(Boolean).join(" · ");

  const href = e.is_klemens_event ? "/atolyeler" : `/etkinlikler/${e.id}`;

  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={href}
      className="group flex flex-col bg-white rounded-2xl border border-warm-100 overflow-hidden hover:shadow-lg hover:shadow-warm-900/5 transition-all duration-300 no-underline"
    >
      {/* ── Visual area ── */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {e.image_url && !imgError ? (
          <img
            src={e.image_url}
            alt={e.title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <EventTypeIcon type={type} />
          </div>
        )}

        {/* Top-left: type badge */}
        {label && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/30 backdrop-blur-sm text-white">
            {label}
          </span>
        )}

        {/* Top-right: date badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-center shadow-sm min-w-[44px]">
          <div className="text-[10px] font-bold text-coral tracking-wider leading-none">
            {date.month}
          </div>
          <div className="text-lg font-bold text-warm-900 leading-tight">
            {date.num}
          </div>
        </div>

        {/* Bottom-left: Klemens badge */}
        {e.is_klemens_event && (
          <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/90 backdrop-blur-sm text-white">
            Klemens
          </span>
        )}
      </div>

      {/* ── Content area ── */}
      <div className="flex-1 p-5">
        <h3 className="text-base font-bold text-warm-900 leading-snug line-clamp-2 group-hover:text-coral transition-colors duration-200">
          {e.title}
        </h3>
        {meta && (
          <p className="text-xs text-warm-900/45 font-medium mt-1.5 truncate">
            {meta}
          </p>
        )}
        {e.ai_comment && (
          <p className="text-xs text-warm-900/40 italic mt-2 line-clamp-2 leading-relaxed">
            {e.ai_comment}
          </p>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-3 border-t border-warm-100 flex items-center justify-between">
        <span className="text-xs text-warm-900/40 font-medium">
          {e.price_info || "Ücretsiz"}
        </span>
        {e.is_klemens_event ? (
          <span className="px-4 py-1.5 bg-coral text-white text-xs font-semibold rounded-full group-hover:opacity-90 transition-opacity">
            Kayıt Ol
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-semibold text-coral group-hover:gap-2 transition-all duration-200">
            Detay
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        )}
      </div>
    </Link>
  );
}

export default function EtkinliklerClient() {
  const [filter, setFilter] = useState<Filter>("Tümü");
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const supabase = createClient();

      const now = new Date().toISOString();
      let q = supabase
        .from("events")
        .select("id,title,description,ai_comment,event_type,venue,address,event_date,source_url,source_name,price_info,is_klemens_event,image_url")
        .eq("status", "approved")
        .gte("event_date", now)
        .order("event_date", { ascending: true });

      if (filter === "Atölyeler") {
        q = q.eq("is_klemens_event", true);
      } else if (filter === "Festival") {
        q = q.in("event_type", ["festival", "film-festivali"]);
      } else if (filter !== "Tümü") {
        q = q.eq("event_type", FILTER_TO_TYPE[filter] ?? filter.toLowerCase());
      }

      const { data } = await q;
      setEvents((data ?? []) as EventRow[]);
      setLoading(false);
    };
    load();
  }, [filter]);

  return (
    <>
      <Navbar />
      <main className="bg-warm-50 min-h-screen">

        {/* ── Hero ── */}
        <section className="pt-32 pb-14 px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <p className="text-coral text-xs font-semibold tracking-[0.2em] uppercase mb-5">Takvim</p>
            <h1
              className="text-5xl sm:text-6xl font-bold leading-tight text-warm-900 mb-5"
              style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif" }}
            >
              Kültür &amp; Sanat<br />Takvimi
            </h1>
            <p
              className="text-warm-900/45 text-lg leading-relaxed italic"
              style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif" }}
            >
              Ruhunuzun aradığı o karşılaşma belki de bu akşamdır...
            </p>
          </div>
        </section>

        {/* ── Filters ── */}
        <section className="px-6 pb-10">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                  filter === f
                    ? "bg-coral border-coral text-white shadow-sm shadow-coral/20"
                    : "bg-white border-warm-200 text-warm-900/55 hover:border-warm-300 hover:text-warm-900"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </section>

        {/* ── Grid ── */}
        <section className="px-6 pb-28">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-5 h-5 border-2 border-coral border-t-transparent rounded-full animate-spin" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-20 text-warm-900/30">
                <p className="text-base">Bu kategoride yaklaşan etkinlik bulunmuyor.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {events.map((e) => (
                  <EventCard key={e.id} e={e} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
