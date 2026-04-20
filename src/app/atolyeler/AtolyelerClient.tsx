"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import AtolyeBasvuruCTA from "@/components/AtolyeBasvuruCTA";
import { createClient } from "@/lib/supabase";
import PazaryeriCard from "./components/PazaryeriCard";
import AjandaView from "./components/AjandaView";
import type { MarketplaceEventCard as MarketplaceEvent } from "@/types/marketplace";

type SingleVideo = {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  card_image_url: string | null;
  cover_image_url: string | null;
  is_published: boolean;
};

/* ─── Sabitler ────────────────────────────────────── */

const CITIES = ["Tümü", "Online", "Ankara", "İstanbul"];
const CATEGORIES = [
  { value: "", label: "Tümü" },
  { value: "sanat-tarihi", label: "Sanat Tarihi" },
  { value: "sinema", label: "Sinema" },
  { value: "resim", label: "Resim" },
  { value: "seramik", label: "Seramik" },
  { value: "fotograf", label: "Fotoğraf" },
  { value: "muzik", label: "Müzik" },
  { value: "heykel", label: "Heykel" },
  { value: "dijital", label: "Dijital Sanat" },
  { value: "yazarlik", label: "Yazarlık" },
  { value: "dans", label: "Dans" },
  { value: "tiyatro", label: "Tiyatro" },
  { value: "diger", label: "Diğer" },
];

const B = {
  coral: "#FF6D60",
  cream: "#FFFBF7",
  dark: "#2D2926",
  warm: "#8C857E",
  light: "#F5F0EB",
};

/* ─── Yardımcılar ────────────────────────────────── */

function isPast(event_date: string | null): boolean {
  if (!event_date) return false;
  return new Date(event_date) < new Date();
}

function sortEvents(events: MarketplaceEvent[]): MarketplaceEvent[] {
  return [...events].sort((a, b) => {
    const aPast = isPast(a.event_date);
    const bPast = isPast(b.event_date);
    if (aPast !== bPast) return aPast ? 1 : -1;
    if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
    if (a.is_klemens !== b.is_klemens) return a.is_klemens ? -1 : 1;
    if (a.event_date && b.event_date) return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
    if (a.event_date && !b.event_date) return -1;
    if (!a.event_date && b.event_date) return 1;
    return 0;
  });
}

/* ─── Tekli Oturum Kartı ─────────────────────────── */

function TekliKart({ v }: { v: SingleVideo }) {
  const imgSrc = v.card_image_url ?? v.cover_image_url;

  return (
    <article className="bg-white rounded-2xl border border-warm-100 overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
      <div className="relative h-[120px] overflow-hidden bg-warm-100">
        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imgSrc} alt={v.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-warm-100 to-warm-200 flex items-center justify-center">
            <span className="text-warm-900/20 text-3xl">▶</span>
          </div>
        )}
        <span className="absolute top-2 right-2 px-2 py-0.5 text-[9px] font-bold bg-amber-500 text-white rounded-full uppercase tracking-wide">
          Kayıttan İzle
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-bold text-warm-900 line-clamp-2 mb-1">{v.title}</h3>
        {v.duration && (
          <p className="text-xs text-warm-900/50 flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {v.duration}
          </p>
        )}
        {v.description && (
          <p className="text-xs text-warm-900/40 line-clamp-2 mt-1">{v.description}</p>
        )}
      </div>
    </article>
  );
}

/* ─── Ana Bileşen ─────────────────────────────────── */

export default function AtolyelerClient() {
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [allEvents, setAllEvents] = useState<MarketplaceEvent[]>([]);
  const [singles, setSingles] = useState<SingleVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const sidebarRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  /* Sidebar üzerinde wheel → sidebar scroll olabiliyorsa sidebar'ı, olamıyorsa sağ paneli scroll et */
  useEffect(() => {
    const sidebar = sidebarRef.current;
    const content = contentRef.current;
    if (!sidebar || !content) return;

    const handler = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = sidebar;
      const canScroll = scrollHeight > clientHeight;

      if (canScroll) {
        const atTop = scrollTop <= 0 && e.deltaY < 0;
        const atBottom = scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0;
        if (!atTop && !atBottom) {
          // Sidebar kendi scroll'sün
          return;
        }
      }
      // Sidebar scroll edemiyorsa veya sınırdaysa → sağ paneli scroll et
      e.preventDefault();
      content.scrollTop += e.deltaY;
    };

    sidebar.addEventListener("wheel", handler, { passive: false });
    return () => sidebar.removeEventListener("wheel", handler);
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const supabase = createClient();
      let query = supabase
        .from("marketplace_events")
        .select("id, slug, title, category, city, district, price, image_url, event_date, end_date, is_featured, is_klemens, detail_slug, duration_note, organizer_name, organizer_logo_url, short_description, venue_name, venue_address, organizer_phone, organizer_email, organizer_url, host_id, host:people!marketplace_events_host_id_fkey(id, slug, name, avatar_url, short_bio, instagram, expertise)")
        .eq("status", "active");

      if (city) query = query.eq("city", city);
      if (category) query = query.eq("category", category);

      const { data } = await query;
      // Supabase FK join returns host as array — normalize to single object
      const normalized = (data ?? []).map((row: Record<string, unknown>) => ({
        ...row,
        host: Array.isArray(row.host) ? row.host[0] ?? null : row.host ?? null,
      }));
      setAllEvents(normalized as MarketplaceEvent[]);
      setLoading(false);
    };
    fetchAll();
  }, [city, category]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("single_videos")
      .select("id, title, description, duration, card_image_url, cover_image_url, is_published")
      .eq("is_published", true)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setSingles((data as SingleVideo[]) ?? []);
      });
  }, []);

  const sorted = sortEvents(allEvents);
  const activeCount = sorted.filter((e) => !isPast(e.event_date)).length;
  const pastCount = sorted.filter((e) => isPast(e.event_date)).length;

  return (
    <>
      <AnnouncementBar page="atolyeler" />
      <Navbar />

      {/* ═══ Hero ═══ */}
      <section style={{ background: B.cream }} className="max-w-7xl mx-auto px-6 pt-[72px] pb-8 text-center">
        <h1
          style={{
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 800,
            color: B.dark,
            margin: "0 0 12px",
            lineHeight: 1.1,
          }}
        >
          Atölyeler
        </h1>
        <p style={{ color: B.warm, fontSize: 15, maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
          Online ve yüz yüze atölyeleri keşfet, hemen kaydol.
        </p>
      </section>

      {/* ═══ Platform bilgi şeridi ═══ */}
      <div
        style={{ background: B.cream }}
        className="max-w-7xl mx-auto px-6 pb-4"
      >
        <div className="bg-coral/5 border border-coral/10 rounded-xl px-4 py-3 flex gap-3 items-start">
          <span className="text-coral/40 text-base flex-shrink-0 mt-0.5">&#9432;</span>
          <p className="text-[11px] sm:text-xs text-warm-900/40 leading-relaxed">
            Klemens, kültür ve sanat alanındaki atölyeleri bir araya getiren bir platformdur.
            Bazı atölyeler Klemens tarafından düzenlenmekte, bazıları ise bağımsız eğitmenler
            tarafından sunulmaktadır. Her etkinliğin yürütülmesi, ödemesi ve iadesi
            düzenleyicisinin sorumluluğundadır.
          </p>
        </div>
      </div>

      {/* ═══ Dual-pane layout — iki bağımsız scroll paneli ═══ */}
      <div
        className="hidden lg:flex max-w-7xl mx-auto px-6 gap-8"
        style={{ background: B.cream, height: "calc(100vh - 80px)" }}
      >
        {/* ── Sol Sidebar ── */}
        <aside
          ref={sidebarRef}
          className="w-56 flex-shrink-0 flex flex-col overflow-y-auto py-2 pr-2"
          style={{ scrollbarWidth: "none" }}
        >
          <h2 className="text-xs font-bold text-warm-900 uppercase tracking-widest mb-3">
            Kategoriler
          </h2>
          <nav className="flex flex-col gap-0.5">
            {CATEGORIES.map((cat) => {
              const isActive = category === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`text-left px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-coral/10 text-coral font-semibold"
                      : "text-warm-900/60 hover:bg-warm-100 hover:text-warm-900"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-6 pt-4 border-t border-warm-200">
            <h2 className="text-xs font-bold text-warm-900 uppercase tracking-widest mb-3">
              Konum
            </h2>
            <nav className="flex flex-col gap-0.5">
              {CITIES.map((c) => {
                const isActive = c === "Tümü" ? city === "" : city === c;
                return (
                  <button
                    key={c}
                    onClick={() => setCity(c === "Tümü" ? "" : c)}
                    className={`text-left px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-coral/10 text-coral font-semibold"
                        : "text-warm-900/60 hover:bg-warm-100 hover:text-warm-900"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </nav>
          </div>
          {/* Konum'u yukarı çekmek için altta boşluk — scroll ile kategoriler kaybolur, konum ortaya gelir */}
          <div className="flex-shrink-0" style={{ height: "40vh" }} />
        </aside>

        {/* ── Sağ İçerik paneli ── */}
        <div
          ref={contentRef}
          className="flex-1 min-w-0 overflow-y-auto py-2 pr-1"
          style={{ scrollbarWidth: "thin", scrollbarColor: `${B.light} transparent` }}
        >
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-warm-900/40">
              {loading ? "Yükleniyor…" : `${activeCount} aktif atölye${pastCount > 0 ? ` · ${pastCount} geçmiş` : ""}`}
            </p>
            <div className="flex items-center gap-1">
              {/* Grid ikonu */}
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
              {/* Tablo/Liste ikonu */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-warm-100 rounded-2xl animate-pulse aspect-[16/9]" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-warm-900/40 text-lg">Bu kriterlere uygun atölye bulunamadı.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sorted.map((e) => (
                <div key={e.id} className={isPast(e.event_date) ? "opacity-50 grayscale-[30%] pointer-events-none" : ""}>
                  <PazaryeriCard
                    slug={e.slug}
                    title={e.title}
                    category={e.category}
                    city={e.city}
                    district={e.district}
                    price={e.price}
                    image_url={e.image_url}
                    event_date={e.event_date}
                    end_date={e.end_date}
                    is_featured={e.is_featured}
                    href={e.detail_slug ? `/atolyeler/${e.detail_slug}` : `/atolyeler/${e.slug}`}
                    badge={e.is_klemens ? "Klemens" : undefined}
                    duration_note={e.duration_note}
                    organizer_name={e.organizer_name}
                    organizer_logo_url={e.organizer_logo_url}
                    instructor_name={e.is_klemens ? "Kerem Hun" : null}
                    host_slug={e.host?.slug ?? null}
                  />
                </div>
              ))}
            </div>
          ) : (
            <AjandaView events={sorted} />
          )}

          {singles.length > 0 && (
            <div className="mt-14">
              <h3 style={{ fontSize: 18, fontWeight: 700, color: B.dark, margin: "0 0 6px" }}>
                Tekli Oturumlar
              </h3>
              <p style={{ color: B.warm, fontSize: 13, margin: "0 0 16px" }}>
                30–45 dakikalık odaklı oturumlar — kayıttan izle
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {singles.map((v) => (
                  <TekliKart key={v.id} v={v} />
                ))}
              </div>
            </div>
          )}

          {/* CTA — Başvuru */}
          <AtolyeBasvuruCTA />

          {/* İçerik paneli altında footer bilgisi */}
          <div className="mt-16 pb-8 border-t border-warm-200 pt-8">
            <Footer />
          </div>
        </div>
      </div>

      {/* ═══ Mobil layout (lg altı) — klasik tek sayfa akışı ═══ */}
      <main className="lg:hidden" style={{ background: B.cream, minHeight: "100vh" }}>
        <section className="max-w-7xl mx-auto px-6 pb-16">
          {/* Şehir butonları */}
          <div className="flex items-center gap-2 mb-3">
            {CITIES.map((c) => {
              const isActive = c === "Tümü" ? city === "" : city === c;
              return (
                <button
                  key={c}
                  onClick={() => setCity(c === "Tümü" ? "" : c)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-coral text-white"
                      : "bg-warm-100 text-warm-900/60 hover:bg-warm-200"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
          {/* Kategori pill'leri */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((cat) => {
              const isActive = category === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    isActive
                      ? "bg-warm-900 text-white border-warm-900"
                      : "bg-white text-warm-900/60 border-warm-200 hover:border-warm-400"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mb-6 mt-4">
            <p className="text-sm text-warm-900/40">
              {loading ? "Yükleniyor…" : `${activeCount} aktif atölye${pastCount > 0 ? ` · ${pastCount} geçmiş` : ""}`}
            </p>
            <div className="flex items-center gap-1">
              {/* Grid ikonu */}
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
            <div className={"grid grid-cols-1 md:grid-cols-2 gap-6"}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-warm-100 rounded-2xl animate-pulse aspect-[16/9]" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-warm-900/40 text-lg">Bu kriterlere uygun atölye bulunamadı.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className={"grid grid-cols-1 md:grid-cols-2 gap-6"}>
              {sorted.map((e) => (
                <div key={e.id} className={isPast(e.event_date) ? "opacity-50 grayscale-[30%] pointer-events-none" : ""}>
                  <PazaryeriCard
                    slug={e.slug}
                    title={e.title}
                    category={e.category}
                    city={e.city}
                    district={e.district}
                    price={e.price}
                    image_url={e.image_url}
                    event_date={e.event_date}
                    end_date={e.end_date}
                    is_featured={e.is_featured}
                    href={e.detail_slug ? `/atolyeler/${e.detail_slug}` : `/atolyeler/${e.slug}`}
                    badge={e.is_klemens ? "Klemens" : undefined}
                    duration_note={e.duration_note}
                    organizer_name={e.organizer_name}
                    organizer_logo_url={e.organizer_logo_url}
                    instructor_name={e.is_klemens ? "Kerem Hun" : null}
                    host_slug={e.host?.slug ?? null}
                  />
                </div>
              ))}
            </div>
          ) : (
            <AjandaView events={sorted} />
          )}

          {singles.length > 0 && (
            <div className="mt-14">
              <h3 style={{ fontSize: 18, fontWeight: 700, color: B.dark, margin: "0 0 6px" }}>
                Tekli Oturumlar
              </h3>
              <p style={{ color: B.warm, fontSize: 13, margin: "0 0 16px" }}>
                30–45 dakikalık odaklı oturumlar — kayıttan izle
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {singles.map((v) => (
                  <TekliKart key={v.id} v={v} />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* CTA — Başvuru */}
        <AtolyeBasvuruCTA />

        <Footer />
      </main>
    </>
  );
}
