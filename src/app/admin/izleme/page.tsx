"use client";

import { useCallback, useEffect, useState } from "react";

type Funnel = {
  workshop_view: number;
  add_to_cart: number;
  checkout_start: number;
  checkout_complete: number;
};

type Journey = {
  user_id: string;
  email: string | null;
  steps: { event_type: string; workshop_slug: string | null; workshop_title: string | null; created_at: string }[];
};

type TopPage = {
  path: string;
  views: number;
  unique: number;
  avg_duration_ms: number | null;
};

type RecentVisit = {
  path: string;
  referrer: string | null;
  user_id: string | null;
  email: string | null;
  duration_ms: number | null;
  created_at: string;
};

type PageviewData = {
  totalViews: number;
  uniqueVisitors: number;
  topPages: TopPage[];
  recentVisits: RecentVisit[];
};

const STEPS = [
  { key: "workshop_view", label: "Sayfa Görüntüleme" },
  { key: "add_to_cart", label: "Satın Al Tıklama" },
  { key: "checkout_start", label: "Ödeme Sayfası" },
  { key: "checkout_complete", label: "Ödeme Tamamlandı" },
] as const;

const PERIODS = [
  { days: 7, label: "7 Gün" },
  { days: 14, label: "14 Gün" },
  { days: 30, label: "30 Gün" },
  { days: 90, label: "90 Gün" },
];

type Tab = "funnel" | "pageviews";

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDuration(ms: number | null): string {
  if (ms === null) return "—";
  if (ms < 1000) return `${ms}ms`;
  const secs = Math.round(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const remSecs = secs % 60;
  return `${mins}dk ${remSecs}s`;
}

function pct(a: number, b: number): string {
  if (b === 0) return "—";
  return `${((a / b) * 100).toFixed(1)}%`;
}

export default function IzlemePage() {
  const [tab, setTab] = useState<Tab>("funnel");
  const [days, setDays] = useState(30);
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [uniqueUsers, setUniqueUsers] = useState<Funnel | null>(null);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [pageviewData, setPageviewData] = useState<PageviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "funnel") {
        const res = await fetch(`/api/admin/tracking?days=${days}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setFunnel(data.funnel);
        setUniqueUsers(data.uniqueUsers);
        setJourneys(data.journeys);
      } else {
        const res = await fetch(`/api/admin/tracking?tab=pageviews&days=${days}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setPageviewData(data);
      }
    } catch {
      setFunnel(null);
      setJourneys([]);
      setPageviewData(null);
    } finally {
      setLoading(false);
    }
  }, [days, tab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const maxVal = funnel ? Math.max(funnel.workshop_view, 1) : 1;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs text-warm-900/40 mb-1">Admin Paneli</p>
          <h1 className="text-2xl font-bold text-warm-900">Kullanıcı İzleme</h1>
        </div>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                days === p.days
                  ? "bg-coral text-white"
                  : "bg-white border border-warm-100 text-warm-900/50 hover:bg-warm-50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 mb-6">
        {([
          { key: "funnel" as Tab, label: "Satın Alma Hunisi" },
          { key: "pageviews" as Tab, label: "Sayfa Ziyaretleri" },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-warm-900 text-white"
                : "bg-white border border-warm-100 text-warm-900/50 hover:bg-warm-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block w-6 h-6 border-2 border-coral/30 border-t-coral rounded-full animate-spin" />
        </div>
      ) : tab === "funnel" ? (
        funnel ? (
          <>
            {/* Funnel Bars */}
            <div className="bg-white rounded-2xl border border-warm-100 p-6 mb-6">
              <h2 className="text-sm font-semibold text-warm-900/60 mb-6">Satın Alma Hunisi</h2>
              <div className="space-y-4">
                {STEPS.map((step, i) => {
                  const val = funnel[step.key];
                  const unique = uniqueUsers?.[step.key] ?? 0;
                  const prev = i > 0 ? funnel[STEPS[i - 1].key] : val;
                  const convRate = i > 0 ? pct(val, prev) : "—";
                  const barWidth = Math.max((val / maxVal) * 100, 2);

                  return (
                    <div key={step.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-warm-900">{step.label}</span>
                          {i > 0 && (
                            <span className="text-xs text-warm-900/30">{convRate}</span>
                          )}
                        </div>
                        <div className="text-sm">
                          <span className="font-semibold text-warm-900">{val}</span>
                          <span className="text-warm-900/30 ml-1">({unique} tekil)</span>
                        </div>
                      </div>
                      <div className="h-8 bg-warm-50 rounded-lg overflow-hidden">
                        <div
                          className="h-full rounded-lg transition-all duration-500"
                          style={{
                            width: `${barWidth}%`,
                            background:
                              i === 3
                                ? "#22c55e"
                                : i === 2
                                  ? "#f59e0b"
                                  : "#FF6D60",
                            opacity: i === 0 ? 0.6 : i === 1 ? 0.75 : i === 2 ? 0.85 : 1,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Overall conversion */}
              {funnel.workshop_view > 0 && (
                <div className="mt-6 pt-4 border-t border-warm-100 flex items-center gap-4">
                  <span className="text-sm text-warm-900/50">Genel dönüşüm:</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {pct(funnel.checkout_complete, funnel.workshop_view)}
                  </span>
                  <span className="text-xs text-warm-900/30">
                    (görüntüleme → satın alma)
                  </span>
                </div>
              )}
            </div>

            {/* User Journeys */}
            <div className="bg-white rounded-2xl border border-warm-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-warm-100">
                <h2 className="text-sm font-semibold text-warm-900/60">
                  Kullanıcı Yolculukları
                  <span className="ml-2 text-warm-900/30 font-normal">Son {journeys.length}</span>
                </h2>
              </div>

              {journeys.length === 0 ? (
                <div className="p-12 text-center text-warm-900/30 text-sm">
                  Bu dönemde henüz veri yok
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-warm-100 text-warm-900/40 text-xs uppercase tracking-wider">
                      <th className="text-left px-6 py-3 font-medium">Kullanıcı</th>
                      <th className="text-left px-6 py-3 font-medium">Adımlar</th>
                      <th className="text-left px-6 py-3 font-medium">Son Aktivite</th>
                    </tr>
                  </thead>
                  <tbody>
                    {journeys.map((j) => {
                      const lastStep = j.steps[j.steps.length - 1];
                      return (
                        <tr
                          key={j.user_id}
                          className="border-b border-warm-50 last:border-0 hover:bg-warm-50/50 transition-colors"
                        >
                          <td className="px-6 py-3">
                            {j.email ? (
                              <span className="text-xs text-warm-900">{j.email}</span>
                            ) : (
                              <span className="text-xs font-mono text-warm-900/40">
                                {j.user_id.slice(0, 8)}… <span className="text-warm-900/25">(anonim)</span>
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-1 flex-wrap">
                              {j.steps.map((s, idx) => (
                                <span key={idx} className="flex items-center gap-1">
                                  <span
                                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                      s.event_type === "checkout_complete"
                                        ? "bg-emerald-50 text-emerald-600"
                                        : s.event_type === "checkout_start"
                                          ? "bg-amber-50 text-amber-600"
                                          : s.event_type === "add_to_cart"
                                            ? "bg-coral/10 text-coral"
                                            : "bg-warm-50 text-warm-900/50"
                                    }`}
                                  >
                                    {s.event_type === "workshop_view"
                                      ? "Görüntüleme"
                                      : s.event_type === "add_to_cart"
                                        ? "Sepet"
                                        : s.event_type === "checkout_start"
                                          ? "Ödeme"
                                          : "Tamamlandı"}
                                    {s.workshop_title && (
                                      <span className="opacity-60 ml-0.5">({s.workshop_title})</span>
                                    )}
                                  </span>
                                  {idx < j.steps.length - 1 && (
                                    <span className="text-warm-900/20">→</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-3 text-warm-900/50 text-xs">
                            {lastStep ? fmtDateTime(lastStep.created_at) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          <div className="p-12 text-center text-warm-900/30 text-sm">
            Veri yüklenemedi
          </div>
        )
      ) : pageviewData ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-warm-100 p-6">
              <p className="text-xs text-warm-900/40 mb-1">Toplam Görüntüleme</p>
              <p className="text-2xl font-bold text-warm-900">{pageviewData.totalViews.toLocaleString("tr-TR")}</p>
            </div>
            <div className="bg-white rounded-2xl border border-warm-100 p-6">
              <p className="text-xs text-warm-900/40 mb-1">Tekil Ziyaretçi</p>
              <p className="text-2xl font-bold text-warm-900">{pageviewData.uniqueVisitors.toLocaleString("tr-TR")}</p>
            </div>
          </div>

          {/* Top Pages */}
          <div className="bg-white rounded-2xl border border-warm-100 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-warm-100">
              <h2 className="text-sm font-semibold text-warm-900/60">En Çok Ziyaret Edilen Sayfalar</h2>
            </div>
            {pageviewData.topPages.length === 0 ? (
              <div className="p-12 text-center text-warm-900/30 text-sm">Henüz veri yok</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-warm-100 text-warm-900/40 text-xs uppercase tracking-wider">
                    <th className="text-left px-6 py-3 font-medium">Sayfa</th>
                    <th className="text-right px-6 py-3 font-medium">Görüntüleme</th>
                    <th className="text-right px-6 py-3 font-medium">Tekil</th>
                    <th className="text-right px-6 py-3 font-medium">Ort. Süre</th>
                  </tr>
                </thead>
                <tbody>
                  {pageviewData.topPages.map((p) => (
                    <tr key={p.path} className="border-b border-warm-50 last:border-0 hover:bg-warm-50/50 transition-colors">
                      <td className="px-6 py-3">
                        <span className="text-xs font-mono text-warm-900">{p.path}</span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className="text-sm font-semibold text-warm-900">{p.views}</span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className="text-sm text-warm-900/60">{p.unique}</span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className="text-xs text-warm-900/50">{fmtDuration(p.avg_duration_ms)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Recent Visits */}
          <div className="bg-white rounded-2xl border border-warm-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-warm-100">
              <h2 className="text-sm font-semibold text-warm-900/60">
                Son Ziyaretler
                <span className="ml-2 text-warm-900/30 font-normal">Son {pageviewData.recentVisits.length}</span>
              </h2>
            </div>
            {pageviewData.recentVisits.length === 0 ? (
              <div className="p-12 text-center text-warm-900/30 text-sm">Henüz veri yok</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-warm-100 text-warm-900/40 text-xs uppercase tracking-wider">
                      <th className="text-left px-6 py-3 font-medium">Sayfa</th>
                      <th className="text-left px-6 py-3 font-medium">Kullanıcı</th>
                      <th className="text-right px-6 py-3 font-medium">Süre</th>
                      <th className="text-left px-6 py-3 font-medium">Referrer</th>
                      <th className="text-left px-6 py-3 font-medium">Tarih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageviewData.recentVisits.map((v, i) => (
                      <tr key={i} className="border-b border-warm-50 last:border-0 hover:bg-warm-50/50 transition-colors">
                        <td className="px-6 py-3">
                          <span className="text-xs font-mono text-warm-900">{v.path}</span>
                        </td>
                        <td className="px-6 py-3">
                          {v.email ? (
                            <span className="text-xs text-warm-900">{v.email}</span>
                          ) : v.user_id ? (
                            <span className="text-xs font-mono text-warm-900/40">
                              {v.user_id.slice(0, 8)}…
                            </span>
                          ) : (
                            <span className="text-xs text-warm-900/25">—</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <span className="text-xs text-warm-900/50">{fmtDuration(v.duration_ms)}</span>
                        </td>
                        <td className="px-6 py-3">
                          {v.referrer ? (
                            <span className="text-xs text-warm-900/40 truncate max-w-[200px] inline-block">{v.referrer}</span>
                          ) : (
                            <span className="text-xs text-warm-900/25">—</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-warm-900/50 text-xs whitespace-nowrap">
                          {fmtDateTime(v.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="p-12 text-center text-warm-900/30 text-sm">
          Veri yüklenemedi
        </div>
      )}
    </div>
  );
}
