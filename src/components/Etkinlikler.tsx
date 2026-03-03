const events = [
  {
    dateNum: "15",
    dateMonth: "Mar",
    day: "Cumartesi",
    category: "Atölye",
    title: "Sinema ve Psikoloji: Bergman Filmleri",
    description:
      "Ingmar Bergman'ın başyapıtları üzerinden bilinçdışı, maske ve varoluş kavramları.",
    time: "15:00 — 17:00",
    detail: "Zoom · 8 kişilik",
    dotColor: "bg-coral",
  },
  {
    dateNum: "22",
    dateMonth: "Mar",
    day: "Cumartesi",
    category: "Seminer",
    title: "Renk ve Duygu: Soyut Ekspresyonizm",
    description:
      "Rothko, Pollock ve de Kooning'in eserlerinde duygu, renk ve anlam ilişkisi.",
    time: "14:00 — 16:00",
    detail: "Zoom · 12 kişilik",
    dotColor: "bg-amber-500",
  },
  {
    dateNum: "5",
    dateMonth: "Nis",
    day: "Cumartesi",
    category: "Atölye",
    title: "Varoluşçuluk ve Sanat: Camus'dan Bacon'a",
    description:
      "Varoluşçu felsefenin 20. yüzyıl sanatına yansımaları ve günümüzdeki izdüşümleri.",
    time: "15:00 — 17:30",
    detail: "Zoom · 10 kişilik",
    dotColor: "bg-emerald-500",
  },
];

export default function Etkinlikler() {
  return (
    <section id="etkinlikler" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
          <div>
            <p className="text-coral text-sm font-semibold tracking-widest uppercase mb-4">Takvim</p>
            <h2 className="text-4xl md:text-5xl font-bold text-warm-900 leading-tight">
              Yaklaşan<br />etkinlikler
            </h2>
          </div>
          <a
            href="/etkinlikler"
            className="inline-flex items-center gap-2 text-sm font-semibold text-warm-900/50 hover:text-coral transition-colors self-start sm:self-auto pb-1"
          >
            Tümünü gör
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Event list */}
        <div className="space-y-4">
          {events.map((e, i) => (
            <div
              key={i}
              className="group flex flex-col sm:flex-row items-start gap-6 p-7 rounded-3xl bg-warm-50 border border-warm-100 hover:border-warm-300/60 hover:bg-warm-100/60 transition-all duration-200 cursor-pointer"
            >
              {/* Date badge */}
              <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-1 flex-shrink-0 sm:w-16 sm:text-center">
                <div className={`${e.dotColor} w-12 h-12 rounded-2xl flex flex-col items-center justify-center text-white flex-shrink-0`}>
                  <span className="text-[10px] font-bold leading-none">{e.dateMonth}</span>
                  <span className="text-lg font-bold leading-tight">{e.dateNum}</span>
                </div>
                <span className="text-xs text-warm-900/40 font-medium">{e.day}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="px-3 py-0.5 bg-warm-200 text-warm-900/70 text-xs font-semibold rounded-full">
                    {e.category}
                  </span>
                  <span className="text-xs text-warm-900/40 font-medium">
                    {e.time} · {e.detail}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-warm-900 group-hover:text-coral transition-colors mb-1.5">
                  {e.title}
                </h3>
                <p className="text-sm text-warm-900/55 leading-relaxed">{e.description}</p>
              </div>

              {/* Register CTA */}
              <div className="flex-shrink-0 sm:flex sm:items-center">
                <button className="px-6 py-2.5 bg-white border border-warm-200 text-warm-900 text-sm font-semibold rounded-full group-hover:bg-coral group-hover:border-coral group-hover:text-white transition-all duration-200">
                  Kayıt Ol
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
