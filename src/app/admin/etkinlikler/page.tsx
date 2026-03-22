"use client";

import { useEffect, useState, useCallback } from "react";

type Tab = "pending" | "approved" | "rejected";

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  ai_comment: string | null;
  event_type: string | null;
  venue: string | null;
  address: string | null;
  event_date: string | null;
  end_date: string | null;
  source_url: string | null;
  source_name: string | null;
  price_info: string | null;
  status: string;
  is_klemens_event: boolean;
  created_at: string;
  verified_at: string | null;
  verification_note: string | null;
};

const TYPE_LABELS: Record<string, string> = {
  sergi: "Sergi", konser: "Konser", tiyatro: "Tiyatro",
  soylesi: "Söyleşi", festival: "Festival", "film-festivali": "Film Festivali",
  opera: "Opera", bale: "Bale",
};

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("tr-TR", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminEtkinliklerPage() {
  const [tab, setTab] = useState<Tab>("pending");
  const [events, setEvents] = useState<EventRow[]>([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [fetching, setFetching] = useState(false);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [actioning, setActioning] = useState<Record<string, boolean>>({});
  const [scraperRunning, setScraperRunning] = useState(false);
  const [scraperResult, setScraperResult] = useState<string | null>(null);

  // ── Fetch events + counts via server API (bypasses RLS) ────────────────────
  const fetchData = useCallback(async (status: Tab) => {
    setFetching(true);
    try {
      const res = await fetch(`/api/admin/events?status=${status}`);
      if (!res.ok) { setFetching(false); return; }
      const json = await res.json();
      const rows = (json.events ?? []) as EventRow[];
      setEvents(rows);
      setCounts(json.counts ?? { pending: 0, approved: 0, rejected: 0 });
      // seed comment state
      const init: Record<string, string> = {};
      rows.forEach((e) => { init[e.id] = e.ai_comment ?? ""; });
      setComments((prev) => ({ ...init, ...prev }));
    } catch {
      // network error — leave current state
    }
    setFetching(false);
  }, []);

  useEffect(() => {
    fetchData(tab);
  }, [tab, fetchData]);

  // ── Mutations ───────────────────────────────────────────────────────────────
  async function action(id: string, act: "approve" | "reject" | "pending") {
    setActioning((p) => ({ ...p, [id]: true }));
    await fetch("/api/admin/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: act }),
    });
    setActioning((p) => ({ ...p, [id]: false }));
    fetchData(tab);
  }

  async function runScraper() {
    setScraperRunning(true);
    setScraperResult(null);
    try {
      // /api/admin/scraper proxy'si — CRON_SECRET'i server-side forward eder
      const res = await fetch("/api/admin/scraper", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setScraperResult(
          `✓ ${json.total.added} yeni etkinlik eklendi (${json.total.found} bulundu) — ${json.elapsed_sec}s`
        );
        fetchData(tab);
      } else {
        setScraperResult(`Hata: ${json.error ?? "bilinmeyen hata"}`);
      }
    } catch (err) {
      setScraperResult(`Bağlantı hatası: ${String(err)}`);
    } finally {
      setScraperRunning(false);
    }
  }

  async function saveComment(id: string) {
    setSaving((p) => ({ ...p, [id]: true }));
    await fetch("/api/admin/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ai_comment: comments[id] ?? "" }),
    });
    setSaving((p) => ({ ...p, [id]: false }));
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "pending",  label: "Bekleyenler"  },
    { key: "approved", label: "Onaylananlar" },
    { key: "rejected", label: "Reddedilenler"},
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-warm-900/40 mb-1">Admin Paneli</p>
          <h1 className="text-2xl font-bold text-warm-900">Etkinlik Yönetimi</h1>
        </div>
        <div className="flex flex-col items-end">
          <button
            onClick={runScraper}
            disabled={scraperRunning}
            className="px-4 py-2 bg-coral text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {scraperRunning ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Çalışıyor...
              </span>
            ) : "Scraper'ı Çalıştır"}
          </button>
          {scraperResult && (
            <p className="text-xs text-warm-900/50 mt-1">{scraperResult}</p>
          )}
        </div>
      </div>

      <div>
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-warm-200">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-5 py-2.5 text-sm font-semibold rounded-t-xl border border-b-0 -mb-px transition-colors ${
                tab === key
                  ? "bg-white border-warm-200 text-warm-900"
                  : "bg-transparent border-transparent text-warm-900/40 hover:text-warm-900/70"
              }`}
            >
              {label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                tab === key ? "bg-coral/10 text-coral" : "bg-warm-200 text-warm-900/40"
              }`}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        {/* Events */}
        {fetching ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-coral border-t-transparent rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 text-warm-900/35">
            <p className="text-base">Bu sekmedeki etkinlik bulunamadı.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((e) => (
              <div key={e.id} className="bg-white rounded-2xl border border-warm-100 overflow-hidden">
                {/* Card header */}
                <div className="px-6 pt-5 pb-4 border-b border-warm-100">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {e.event_type && (
                      <span className="px-2.5 py-1 bg-coral/10 text-coral text-xs font-semibold rounded-full">
                        {TYPE_LABELS[e.event_type] ?? e.event_type}
                      </span>
                    )}
                    {e.source_name && (
                      <span className="px-2.5 py-1 bg-warm-100 text-warm-900/60 text-xs font-semibold rounded-full">
                        {e.source_name}
                      </span>
                    )}
                    {e.is_klemens_event && (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
                        Klemens Etkinliği
                      </span>
                    )}
                    {e.verification_note && (
                      <span
                        className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full cursor-help"
                        title={e.verification_note}
                      >
                        ⚠ Kaynak doğrulanamadı
                      </span>
                    )}
                    {e.verified_at && !e.verification_note && (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
                        Doğrulandı
                      </span>
                    )}
                    <span className="ml-auto text-xs text-warm-900/40 font-mono">
                      {fmt(e.event_date)}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-warm-900 mb-1">{e.title}</h2>

                  {(e.venue || e.address) && (
                    <p className="text-sm text-warm-900/50">
                      {[e.venue, e.address].filter(Boolean).join(" · ")}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 mt-2">
                    {e.price_info && (
                      <span className="text-xs text-warm-900/50">💰 {e.price_info}</span>
                    )}
                    {e.source_url && (
                      <a
                        href={e.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-coral hover:underline"
                      >
                        ↗ Kaynak link
                      </a>
                    )}
                  </div>
                </div>

                {/* AI Comment editor */}
                <div className="px-6 py-4 border-b border-warm-100">
                  <label className="block text-xs font-semibold text-warm-900/50 uppercase tracking-wide mb-2">
                    AI Yorumu
                  </label>
                  <div className="flex gap-3">
                    <textarea
                      value={comments[e.id] ?? ""}
                      onChange={(ev) =>
                        setComments((p) => ({ ...p, [e.id]: ev.target.value }))
                      }
                      rows={2}
                      placeholder="Neden öneriyoruz? (AI tarafından doldurulacak, elle de düzenleyebilirsiniz)"
                      className="flex-1 text-sm text-warm-900 bg-warm-50 border border-warm-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-coral/50 placeholder:text-warm-900/25"
                    />
                    <button
                      onClick={() => saveComment(e.id)}
                      disabled={saving[e.id]}
                      className="px-4 py-2 bg-warm-100 hover:bg-warm-200 text-warm-900 text-xs font-semibold rounded-xl transition-colors self-start disabled:opacity-50"
                    >
                      {saving[e.id] ? "..." : "Kaydet"}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-3 flex gap-2 justify-end">
                  {tab === "pending" && (
                    <>
                      <button
                        onClick={() => action(e.id, "reject")}
                        disabled={actioning[e.id]}
                        className="px-5 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                      >
                        Reddet
                      </button>
                      <button
                        onClick={() => action(e.id, "approve")}
                        disabled={actioning[e.id]}
                        className="px-5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                      >
                        Onayla
                      </button>
                    </>
                  )}
                  {tab === "approved" && (
                    <button
                      onClick={() => action(e.id, "pending")}
                      disabled={actioning[e.id]}
                      className="px-5 py-2 bg-warm-100 hover:bg-warm-200 text-warm-900/60 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                    >
                      Kaldır (→ Bekleyenler)
                    </button>
                  )}
                  {tab === "rejected" && (
                    <button
                      onClick={() => action(e.id, "pending")}
                      disabled={actioning[e.id]}
                      className="px-5 py-2 bg-warm-100 hover:bg-warm-200 text-warm-900/60 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                    >
                      Tekrar Değerlendir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
