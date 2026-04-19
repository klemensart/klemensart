"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase";
import EtkinlikAjandaView from "./EtkinlikAjandaView";

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
  panel: "Panel",
  festival: "Festival",
  "film-festivali": "Film Festivali",
  performans: "Performans",
  opera: "Opera",
  bale: "Bale",
};

const TYPE_COLORS: Record<string, string> = {
  sergi:            "bg-coral/10 text-coral",
  konser:           "bg-amber-100 text-amber-700",
  tiyatro:          "bg-violet-100 text-violet-700",
  soylesi:          "bg-emerald-100 text-emerald-700",
  panel:            "bg-cyan-100 text-cyan-700",
  festival:         "bg-sky-100 text-sky-700",
  "film-festivali": "bg-rose-100 text-rose-700",
  performans:       "bg-fuchsia-100 text-fuchsia-700",
  opera:            "bg-red-100 text-red-700",
  bale:             "bg-pink-100 text-pink-700",
};

const TYPE_GRADIENTS: Record<string, string> = {
  sergi:            "from-coral to-rose-500",
  konser:           "from-amber-500 to-orange-600",
  tiyatro:          "from-violet-500 to-purple-600",
  soylesi:          "from-emerald-500 to-teal-600",
  panel:            "from-cyan-500 to-blue-600",
  festival:         "from-sky-500 to-indigo-500",
  "film-festivali": "from-rose-500 to-pink-600",
  performans:       "from-fuchsia-500 to-purple-600",
  opera:            "from-red-500 to-rose-600",
  bale:             "from-pink-400 to-rose-500",
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
    case "panel":
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "performans":
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="10 8 16 12 10 16 10 8" />
        </svg>
      );
    case "opera":
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3c-4.97 0-9 3.13-9 7 0 2.38 1.56 4.5 4 5.7V20l3-2 3 2v-4.3c2.44-1.2 4-3.32 4-5.7 0-3.87-4.03-7-9-7z" />
          <path d="M9 10h.01M15 10h.01" />
        </svg>
      );
    case "bale":
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="4" r="2" />
          <path d="M12 6v6" />
          <path d="M8 12c0 0 2 4 4 4s4-4 4-4" />
          <path d="M9 16l-3 5M15 16l3 5" />
          <path d="M8 10l-3-2M16 10l3-2" />
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

type Filter = "Tümü" | "Atölyeler" | "Sergi" | "Konser" | "Sahne Sanatları" | "Söyleşi & Panel" | "Festival";
const FILTERS: Filter[] = ["Tümü", "Atölyeler", "Sergi", "Konser", "Sahne Sanatları", "Söyleşi & Panel", "Festival"];

// Birden fazla event_type'ı kapsayan filtreler
const FILTER_TO_TYPES: Partial<Record<Filter, string[]>> = {
  Sergi: ["sergi"],
  Konser: ["konser"],
  "Sahne Sanatları": ["tiyatro", "opera", "bale", "performans"],
  "Söyleşi & Panel": ["soylesi", "panel"],
  Festival: ["festival", "film-festivali"],
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
  const gradient = TYPE_GRADIENTS[type] ?? "from-warm-500 to-warm-600";

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
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col justify-end p-5 relative`}>
            {/* Decorative icon — bottom right, faded */}
            <div className="absolute bottom-4 right-4 opacity-20">
              <EventTypeIcon type={type} />
            </div>
            {/* Title as poster typography */}
            <h4
              className="text-white text-xl sm:text-2xl font-bold leading-snug line-clamp-3 drop-shadow-sm relative z-10 pr-12"
              style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif" }}
            >
              {e.title}
            </h4>
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
        <h2 className="text-base font-bold text-warm-900 leading-snug line-clamp-2 group-hover:text-coral transition-colors duration-200">
          {e.title}
        </h2>
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
  const [viewMode, setViewMode] = useState<"grid" | "table">(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("view") === "grid" ? "grid" : "table";
    }
    return "table";
  });
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
      } else if (filter !== "Tümü") {
        const types = FILTER_TO_TYPES[filter];
        if (types) q = q.in("event_type", types);
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
            <p className="text-coral text-xs font-semibold tracking-[0.2em] uppercase mb-5">Ankara Kültür-Sanat Takvimi</p>
            <h1
              className="text-5xl sm:text-6xl font-bold leading-tight text-warm-900 mb-5"
              style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif" }}
            >
              Ankara Kültür &amp; Sanat<br />Takvimi
            </h1>
            <p
              className="text-warm-900/45 text-lg leading-relaxed italic"
              style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif" }}
            >
              Başkentin nabzını tutan etkinlik rehberiniz — sergiden konsere, tiyatrodan festivale...
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

        {/* ── Toggle + Grid/Ajanda ── */}
        <section className="px-6 pb-28">
          <div className="max-w-6xl mx-auto">
            {/* View toggle */}
            <div className="flex justify-end mb-4">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "text-coral" : "text-warm-900/30 hover:text-warm-900/60"}`}
                  title="Kart görünümü"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="1" width="7" height="7" rx="1" />
                    <rect x="10" y="1" width="7" height="7" rx="1" />
                    <rect x="1" y="10" width="7" height="7" rx="1" />
                    <rect x="10" y="10" width="7" height="7" rx="1" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === "table" ? "text-coral" : "text-warm-900/30 hover:text-warm-900/60"}`}
                  title="Ajanda görünümü"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <line x1="2" y1="4" x2="16" y2="4" />
                    <line x1="2" y1="9" x2="16" y2="9" />
                    <line x1="2" y1="14" x2="16" y2="14" />
                  </svg>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-5 h-5 border-2 border-coral border-t-transparent rounded-full animate-spin" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-20 text-warm-900/30">
                <p className="text-base">Bu kategoride yaklaşan etkinlik bulunmuyor.</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {events.map((e) => (
                  <EventCard key={e.id} e={e} />
                ))}
              </div>
            ) : (
              <EtkinlikAjandaView events={events} />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
