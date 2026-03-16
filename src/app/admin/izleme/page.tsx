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

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function pct(a: number, b: number): string {
  if (b === 0) return "—";
  return `${((a / b) * 100).toFixed(1)}%`;
}

export default function IzlemePage() {
  const [days, setDays] = useState(30);
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [uniqueUsers, setUniqueUsers] = useState<Funnel | null>(null);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tracking?days=${days}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFunnel(data.funnel);
      setUniqueUsers(data.uniqueUsers);
      setJourneys(data.journeys);
    } catch {
      setFunnel(null);
      setJourneys([]);
    } finally {
      setLoading(false);
    }
  }, [days]);

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

      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block w-6 h-6 border-2 border-coral/30 border-t-coral rounded-full animate-spin" />
        </div>
      ) : funnel ? (
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
                                : i === 1
                                  ? "#FF6D60"
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
      )}
    </div>
  );
}
