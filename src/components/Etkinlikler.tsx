import { createAdminClient } from "@/lib/supabase-admin";

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  event_type: string | null;
  venue: string | null;
  event_date: string | null;
  is_klemens_event: boolean;
  source_url: string | null;
};

const TYPE_DOT: Record<string, string> = {
  sergi:            "bg-coral",
  konser:           "bg-amber-500",
  tiyatro:          "bg-violet-500",
  soylesi:          "bg-emerald-500",
  panel:            "bg-cyan-500",
  festival:         "bg-sky-500",
  "film-festivali": "bg-rose-500",
  performans:       "bg-fuchsia-500",
  opera:            "bg-red-500",
  bale:             "bg-pink-400",
  atolye:           "bg-teal-500",
};

const TYPE_LABEL: Record<string, string> = {
  sergi: "Sergi", konser: "Konser", tiyatro: "Tiyatro",
  soylesi: "Söyleşi", panel: "Panel", festival: "Festival",
  "film-festivali": "Film Festivali", performans: "Performans",
  opera: "Opera", bale: "Bale", atolye: "Atölye",
};

function fmtDate(iso: string | null) {
  if (!iso) return { num: "—", month: "—", day: "" };
  const d = new Date(iso);
  return {
    num:   d.toLocaleDateString("tr-TR", { day: "numeric" }),
    month: d.toLocaleDateString("tr-TR", { month: "short" }),
    day:   d.toLocaleDateString("tr-TR", { weekday: "long" }),
  };
}

export default async function Etkinlikler() {
  let events: EventRow[] = [];

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("events")
      .select("id,title,description,event_type,venue,event_date,is_klemens_event,source_url")
      .eq("status", "approved")
      .gte("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })
      .limit(4);
    events = (data ?? []) as EventRow[];
  } catch {
    // DB not ready yet — render empty gracefully
  }

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
        {events.length === 0 ? (
          <div className="py-16 text-center text-warm-900/30">
            <p className="text-base italic">Yakında etkinlikler burada görünecek.</p>
            <a href="/etkinlikler" className="mt-4 inline-block text-sm text-coral hover:underline">
              Tüm takvimi gör →
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((e) => {
              const type = e.event_type ?? "";
              const dot = TYPE_DOT[type] ?? "bg-stone-400";
              const label = TYPE_LABEL[type] ?? type;
              const date = fmtDate(e.event_date);

              const Tag = e.source_url ? "a" : "div";
              const linkProps = e.source_url
                ? { href: e.source_url, target: "_blank" as const, rel: "noopener noreferrer" }
                : {};

              return (
                <Tag
                  key={e.id}
                  {...linkProps}
                  className="group flex flex-col sm:flex-row items-start gap-6 p-7 rounded-3xl bg-warm-50 border border-warm-100 hover:border-warm-300/60 hover:bg-warm-100/60 transition-all duration-200 no-underline cursor-pointer"
                >
                  {/* Date badge */}
                  <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-1 flex-shrink-0 sm:w-16 sm:text-center">
                    <div className={`${dot} w-12 h-12 rounded-2xl flex flex-col items-center justify-center text-white flex-shrink-0`}>
                      <span className="text-[10px] font-bold leading-none">{date.month}</span>
                      <span className="text-lg font-bold leading-tight">{date.num}</span>
                    </div>
                    <span className="text-xs text-warm-900/40 font-medium">{date.day}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      {label && (
                        <span className="px-3 py-0.5 bg-warm-200 text-warm-900/70 text-xs font-semibold rounded-full">
                          {label}
                        </span>
                      )}
                      {e.venue && (
                        <span className="text-xs text-warm-900/40 font-medium">{e.venue}</span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-warm-900 group-hover:text-coral transition-colors mb-1.5">
                      {e.title}
                    </h3>
                    {e.description && (
                      <p className="text-sm text-warm-900/55 leading-relaxed">{e.description}</p>
                    )}
                  </div>

                  {/* CTA */}
                  {e.is_klemens_event && (
                    <div className="flex-shrink-0 sm:flex sm:items-center">
                      <span
                        className="px-6 py-2.5 bg-white border border-warm-200 text-warm-900 text-sm font-semibold rounded-full group-hover:bg-coral group-hover:border-coral group-hover:text-white transition-all duration-200 whitespace-nowrap"
                      >
                        Kayıt Ol
                      </span>
                    </div>
                  )}
                </Tag>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
