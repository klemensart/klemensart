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
    day:   d.toLocaleDateString("tr-TR", { weekday: "short" }),
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
      .limit(8);
    events = (data ?? []) as EventRow[];
  } catch {
    // DB not ready yet — render empty gracefully
  }

  return (
    <section id="etkinlikler" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-coral text-sm font-semibold tracking-widest uppercase mb-4">Ajanda</p>
            <h2 className="text-4xl md:text-5xl font-bold text-warm-900 leading-tight">
              Ankara Kültür &amp; Sanat<br />Takvimi
            </h2>
          </div>
        </div>

        {/* Ajanda tablosu */}
        {events.length === 0 ? (
          <div className="py-16 text-center text-warm-900/30">
            <p className="text-base italic">Yakında etkinlikler burada görünecek.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-warm-100 bg-warm-50/50">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-warm-200 bg-warm-50">
                  <th className="py-3 px-4 text-xs font-bold text-warm-900/50 uppercase tracking-wider w-[100px]">
                    Tarih
                  </th>
                  <th className="py-3 px-4 text-xs font-bold text-warm-900/50 uppercase tracking-wider">
                    Etkinlik
                  </th>
                  <th className="hidden md:table-cell py-3 px-4 text-xs font-bold text-warm-900/50 uppercase tracking-wider">
                    Mekan
                  </th>
                  <th className="hidden lg:table-cell py-3 px-4 text-xs font-bold text-warm-900/50 uppercase tracking-wider w-[120px]">
                    Tür
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => {
                  const type = e.event_type ?? "";
                  const dot = TYPE_DOT[type] ?? "bg-stone-400";
                  const label = TYPE_LABEL[type] ?? type;
                  const date = fmtDate(e.event_date);
                  const href = e.is_klemens_event ? "/atolyeler" : `/etkinlikler/${e.id}`;

                  return (
                    <tr key={e.id} className="group border-b border-warm-100 last:border-b-0">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <a href={href} className="no-underline flex items-center gap-2.5">
                          <div className={`${dot} w-9 h-9 rounded-lg flex flex-col items-center justify-center text-white flex-shrink-0`}>
                            <span className="text-[8px] font-bold leading-none uppercase">{date.month}</span>
                            <span className="text-sm font-bold leading-tight">{date.num}</span>
                          </div>
                          <span className="text-[11px] text-warm-900/35 font-medium hidden sm:inline">{date.day}</span>
                        </a>
                      </td>
                      <td className="py-3.5 px-4">
                        <a href={href} className="no-underline block">
                          <span className="font-semibold text-warm-900 group-hover:text-coral transition-colors">
                            {e.title}
                          </span>
                          {e.venue && (
                            <span className="md:hidden text-xs text-warm-900/35 ml-2">· {e.venue}</span>
                          )}
                        </a>
                      </td>
                      <td className="hidden md:table-cell py-3.5 px-4">
                        <span className="text-warm-900/50 text-sm">{e.venue || "—"}</span>
                      </td>
                      <td className="hidden lg:table-cell py-3.5 px-4">
                        {label && (
                          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-warm-200/60 text-warm-900/50">
                            {label}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* CTA — Tam Ajandayı Gör */}
        <div className="mt-8 text-center">
          <a
            href="/etkinlikler?view=table"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-coral text-white text-sm font-semibold rounded-full hover:bg-coral/90 transition-all duration-200 shadow-sm shadow-coral/20 no-underline"
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="2" y1="4" x2="16" y2="4" />
              <line x1="2" y1="9" x2="16" y2="9" />
              <line x1="2" y1="14" x2="16" y2="14" />
            </svg>
            Tam Ajandayı Gör
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
