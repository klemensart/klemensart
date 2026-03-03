"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Mood = "İlham" | "Katharsis" | "Avangard" | "Melankoli" | "Rönesans" | "Aura";
type Category = "Atölyeler" | "Seminerler" | "Söyleşiler" | "Sergiler";

type Event = {
  id: number;
  category: Category;
  mood: Mood;
  title: string;
  description: string;
  dateNum: string;
  dateMonth: string;
  dateDay: string;
  time: string;
  location: string;
  capacity: string;
  format: "Zoom" | "Yüz yüze";
};

const moodStyles: Record<Mood, { bg: string; text: string; border: string }> = {
  İlham:    { bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200"  },
  Katharsis: { bg: "bg-violet-50",  text: "text-violet-700", border: "border-violet-200" },
  Avangard:  { bg: "bg-emerald-50", text: "text-emerald-700",border: "border-emerald-200"},
  Melankoli: { bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-200"   },
  Rönesans:  { bg: "bg-rose-50",    text: "text-rose-700",   border: "border-rose-200"   },
  Aura:      { bg: "bg-orange-50",  text: "text-orange-700", border: "border-orange-200" },
};

const categoryColors: Record<Category, string> = {
  Atölyeler: "bg-coral/10 text-coral",
  Seminerler: "bg-amber-100 text-amber-700",
  Söyleşiler: "bg-emerald-100 text-emerald-700",
  Sergiler:   "bg-violet-100 text-violet-700",
};

const events: Event[] = [
  {
    id: 1,
    category: "Atölyeler",
    mood: "Katharsis",
    title: "Sinema ve Psikoloji: Bergman Filmleri",
    description: "Ingmar Bergman'ın başyapıtları üzerinden bilinçdışı, maske ve varoluş kavramları. İzleyici olarak kendimizle yüzleştiğimiz anlar.",
    dateNum: "15", dateMonth: "Mar", dateDay: "Cumartesi",
    time: "15:00 — 17:00",
    location: "Zoom",
    capacity: "8 kişilik",
    format: "Zoom",
  },
  {
    id: 2,
    category: "Seminerler",
    mood: "İlham",
    title: "Renk ve Duygu: Soyut Ekspresyonizm",
    description: "Rothko, Pollock ve de Kooning'in eserlerinde renk, duygu ve anlam ilişkisi. Tual önünde ne hissediyoruz, neden?",
    dateNum: "22", dateMonth: "Mar", dateDay: "Cumartesi",
    time: "14:00 — 16:00",
    location: "Zoom",
    capacity: "12 kişilik",
    format: "Zoom",
  },
  {
    id: 3,
    category: "Söyleşiler",
    mood: "Avangard",
    title: "Sanatın Sınırları: Fluxus ve Kavramsal Sanat",
    description: "Bir nesne ne zaman sanat eseri olur? Fluxus hareketi ve kavramsal sanatın kışkırtıcı soruları etrafında bir sohbet.",
    dateNum: "29", dateMonth: "Mar", dateDay: "Cumartesi",
    time: "16:00 — 17:30",
    location: "Zoom",
    capacity: "20 kişilik",
    format: "Zoom",
  },
  {
    id: 4,
    category: "Atölyeler",
    mood: "Melankoli",
    title: "Varoluşçuluk ve Sanat: Camus'dan Bacon'a",
    description: "Varoluşçu felsefenin 20. yüzyıl sanatına yansımaları. Anlamsızlıkla yüzleşen sanatçıların tuvalleri bize ne söyler?",
    dateNum: "5", dateMonth: "Nis", dateDay: "Cumartesi",
    time: "15:00 — 17:30",
    location: "Zoom",
    capacity: "10 kişilik",
    format: "Zoom",
  },
  {
    id: 5,
    category: "Sergiler",
    mood: "Rönesans",
    title: "İstanbul Modern: Koleksiyon Turu",
    description: "İstanbul Modern'in kalıcı koleksiyonundan seçilmiş eserler eşliğinde rehberli bir keşif. Türk modernizminin kısa tarihi.",
    dateNum: "12", dateMonth: "Nis", dateDay: "Cumartesi",
    time: "11:00 — 13:00",
    location: "İstanbul Modern, Karaköy",
    capacity: "15 kişilik",
    format: "Yüz yüze",
  },
  {
    id: 6,
    category: "Seminerler",
    mood: "Aura",
    title: "Walter Benjamin ve Sanatın Aurası",
    description: "'Sanat Eserinin Mekanik Yeniden Üretim Çağında' metnini birlikte okuyoruz. Özgünlük, kopya ve dijital çağda aura ne anlama geliyor?",
    dateNum: "19", dateMonth: "Nis", dateDay: "Cumartesi",
    time: "15:00 — 17:00",
    location: "Zoom",
    capacity: "12 kişilik",
    format: "Zoom",
  },
  {
    id: 7,
    category: "Söyleşiler",
    mood: "İlham",
    title: "Fotoğraf ve Bellek: Nan Goldin Üzerine",
    description: "Nan Goldin'in günlük-fotoğrafçılık anlayışı ve kişisel tarihin belgelenmesi. Bir fotoğraf ne zaman sanat, ne zaman tanıklık olur?",
    dateNum: "26", dateMonth: "Nis", dateDay: "Cumartesi",
    time: "14:00 — 15:30",
    location: "Zoom",
    capacity: "20 kişilik",
    format: "Zoom",
  },
  {
    id: 8,
    category: "Atölyeler",
    mood: "Katharsis",
    title: "Tragedyadan Sinemaya: Antik Dramın İzleri",
    description: "Yunan tragedyasının modern sinemadaki yankıları. Arınma, kader ve trajik kahraman kavramlarını filmler üzerinden keşfediyoruz.",
    dateNum: "10", dateMonth: "May", dateDay: "Cumartesi",
    time: "15:00 — 17:30",
    location: "Zoom",
    capacity: "8 kişilik",
    format: "Zoom",
  },
  {
    id: 9,
    category: "Sergiler",
    mood: "Melankoli",
    title: "Pera Müzesi: Oryantalizm Sergisi",
    description: "Pera Müzesi'nin oryantalizm koleksiyonuna rehberli bir bakış. Doğu'nun Batılı gözle nasıl kurgulandığını ve bu mirasın günümüzdeki izlerini tartışıyoruz.",
    dateNum: "17", dateMonth: "May", dateDay: "Cumartesi",
    time: "11:00 — 13:00",
    location: "Pera Müzesi, Beyoğlu",
    capacity: "12 kişilik",
    format: "Yüz yüze",
  },
];

const filters = ["Tümü", "Atölyeler", "Seminerler", "Söyleşiler", "Sergiler"] as const;
type Filter = (typeof filters)[number];

export default function EtkinliklerPage() {
  const [active, setActive] = useState<Filter>("Tümü");

  const filtered = active === "Tümü" ? events : events.filter((e) => e.category === active);

  return (
    <>
      <Navbar />

      <main className="bg-warm-50 min-h-screen">
        {/* ── Hero ── */}
        <section className="pt-32 pb-16 px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <p className="text-coral text-xs font-semibold tracking-[0.2em] uppercase mb-6">
              Takvim
            </p>
            <h1
              className="text-5xl sm:text-6xl font-bold leading-tight text-warm-900 mb-6"
              style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif" }}
            >
              Kültür &amp; Sanat<br />Takvimi
            </h1>
            <p className="text-warm-900/50 text-lg leading-relaxed italic"
              style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif" }}>
              Ruhunuzun aradığı o karşılaşma belki de bu akşamdır...
            </p>
          </div>
        </section>

        {/* ── Filters ── */}
        <section className="px-6 pb-12">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-3">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
                  active === f
                    ? "bg-coral border-coral text-white shadow-md shadow-coral/20"
                    : "bg-white border-warm-200 text-warm-900/60 hover:border-warm-900/30 hover:text-warm-900"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </section>

        {/* ── Grid ── */}
        <section className="px-6 pb-24">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((e) => {
              const mood = moodStyles[e.mood];
              const catColor = categoryColors[e.category];
              return (
                <article
                  key={e.id}
                  className="group bg-white rounded-3xl border border-warm-100 overflow-hidden hover:-translate-y-1.5 hover:shadow-xl hover:shadow-warm-900/8 transition-all duration-300 cursor-pointer flex flex-col"
                >
                  {/* Image placeholder */}
                  <div className="relative bg-warm-100 h-44 flex-shrink-0 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className="text-4xl opacity-20 select-none"
                        style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                      >
                        {e.dateNum}
                      </span>
                    </div>
                    {/* Date badge */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 text-center shadow-sm">
                      <div className="text-coral text-[10px] font-bold tracking-widest uppercase">{e.dateMonth}</div>
                      <div className="text-warm-900 text-2xl font-bold leading-none">{e.dateNum}</div>
                      <div className="text-warm-900/40 text-[10px] font-medium">{e.dateDay}</div>
                    </div>
                    {/* Mood badge */}
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold border ${mood.bg} ${mood.text} ${mood.border}`}>
                      {e.mood}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    {/* Category + format */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${catColor}`}>
                        {e.category === "Atölyeler" ? "Atölye" : e.category === "Seminerler" ? "Seminer" : e.category === "Söyleşiler" ? "Söyleşi" : "Sergi"}
                      </span>
                      <span className="text-xs text-warm-900/35 font-medium">{e.format}</span>
                    </div>

                    <h2 className="text-warm-900 font-bold text-lg leading-snug mb-2 group-hover:text-coral transition-colors duration-200">
                      {e.title}
                    </h2>
                    <p className="text-warm-900/55 text-sm leading-relaxed flex-1 mb-4">
                      {e.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-1.5 text-xs text-warm-900/40 font-medium mb-5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                      </svg>
                      {e.time}
                      <span className="mx-1">·</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                      {e.location}
                      <span className="mx-1">·</span>
                      {e.capacity}
                    </div>

                    {/* CTA */}
                    <a
                      href="#"
                      className="inline-flex items-center gap-1.5 text-coral text-sm font-semibold hover:gap-3 transition-all duration-200"
                    >
                      İncele
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="text-center py-20 text-warm-900/30">
              <p className="text-lg">Bu kategoride yaklaşan etkinlik bulunmuyor.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
