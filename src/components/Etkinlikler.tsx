import { createAdminClient } from "@/lib/supabase-admin";
import type { EventRow } from "@/types/event";
import EventList from "@/components/EventList";

export default async function Etkinlikler() {
  let events: EventRow[] = [];

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("events")
      .select("id,title,description,ai_comment,event_type,venue,address,event_date,source_url,source_name,price_info,is_klemens_event,image_url")
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

        {/* Ajanda listesi */}
        {events.length === 0 ? (
          <div className="py-16 text-center text-warm-900/30">
            <p className="text-base italic">Yakında etkinlikler burada görünecek.</p>
          </div>
        ) : (
          <EventList events={events} compact limit={8} />
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
