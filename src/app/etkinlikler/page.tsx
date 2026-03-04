"use client";

import { useState, useEffect } from "react";
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

export default function EtkinliklerPage() {
  const [filter, setFilter] = useState<Filter>("Tümü");
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const supabase = createClient();

      let q = supabase
        .from("events")
        .select("id,title,description,ai_comment,event_type,venue,address,event_date,source_url,source_name,price_info,is_klemens_event")
        .eq("status", "approved")
        .order("event_date", { ascending: true });

      if (filter === "Atölyeler") {
        q = q.eq("is_klemens_event", true);
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
          <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-2">
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

        {/* ── List ── */}
        <section className="px-6 pb-28">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-warm-100 overflow-hidden">

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-5 h-5 border-2 border-coral border-t-transparent rounded-full animate-spin" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-20 text-warm-900/30">
                <p className="text-base">Bu kategoride yaklaşan etkinlik bulunmuyor.</p>
              </div>
            ) : (
              <ul className="divide-y divide-warm-100">
                {events.map((e) => {
                  const date  = fmtDate(e.event_date);
                  const type  = e.event_type ?? "";
                  const badge = TYPE_COLORS[type] ?? "bg-warm-100 text-warm-900/50";
                  const label = TYPE_LABELS[type] ?? type;

                  const meta = [
                    e.venue,
                    date.time ? date.time : null,
                    e.price_info,
                  ].filter(Boolean).join(" · ");

                  return (
                    <li
                      key={e.id}
                      className="group flex items-start gap-5 px-7 py-5 hover:bg-warm-50/70 transition-colors duration-150"
                    >
                      {/* ── Date block ── */}
                      <div className="relative flex-shrink-0 w-11 text-center pt-0.5">
                        {e.is_klemens_event && (
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white" />
                        )}
                        <div className="text-[10px] font-bold text-coral tracking-widest leading-none mb-0.5">
                          {date.month}
                        </div>
                        <div className="text-2xl font-bold text-warm-900 leading-none">
                          {date.num}
                        </div>
                      </div>

                      {/* ── Content ── */}
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-warm-900 leading-snug group-hover:text-coral transition-colors duration-150 truncate">
                          {e.title}
                        </p>
                        {meta && (
                          <p className="text-xs text-warm-900/45 font-medium mt-0.5 truncate">
                            {meta}
                          </p>
                        )}
                        {e.ai_comment && (
                          <p className="text-xs text-warm-900/40 italic mt-1 line-clamp-2 leading-relaxed">
                            {e.ai_comment}
                          </p>
                        )}
                      </div>

                      {/* ── Right: badge + CTA ── */}
                      <div className="flex-shrink-0 flex flex-col items-end gap-2 pt-0.5">
                        {label && (
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${badge}`}>
                            {label}
                          </span>
                        )}
                        {e.is_klemens_event ? (
                          <a
                            href="/atolyeler"
                            className="px-4 py-1.5 bg-coral text-white text-xs font-semibold rounded-full hover:opacity-90 transition-opacity whitespace-nowrap"
                          >
                            Kayıt Ol
                          </a>
                        ) : e.source_url ? (
                          <a
                            href={e.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-semibold text-coral hover:gap-2 transition-all duration-150 whitespace-nowrap"
                          >
                            Detay
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </a>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
