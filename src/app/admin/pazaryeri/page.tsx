"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Tab = "active" | "draft" | "archived";

type MarketplaceEvent = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  category: string;
  city: string;
  district: string | null;
  venue_name: string | null;
  venue_address: string | null;
  organizer_name: string;
  organizer_url: string | null;
  organizer_phone: string | null;
  organizer_email: string | null;
  organizer_logo_url: string | null;
  price: number;
  price_options: { label: string; price: number; note?: string }[] | null;
  currency: string;
  event_date: string;
  end_date: string | null;
  event_time_note: string | null;
  duration_note: string | null;
  recurring: boolean;
  recurring_note: string | null;
  image_url: string | null;
  gallery_urls: string[] | null;
  max_participants: number | null;
  is_featured: boolean;
  status: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  resim: "Resim", seramik: "Seramik", fotograf: "Fotoğraf", muzik: "Müzik",
  heykel: "Heykel", dijital: "Dijital Sanat", yazarlik: "Yazarlık",
  dans: "Dans", tiyatro: "Tiyatro", diger: "Diğer",
};

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("tr-TR", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminPazaryeriPage() {
  const [tab, setTab] = useState<Tab>("active");
  const [events, setEvents] = useState<MarketplaceEvent[]>([]);
  const [counts, setCounts] = useState({ active: 0, draft: 0, archived: 0 });
  const [fetching, setFetching] = useState(false);

  const fetchData = useCallback(async (status: Tab) => {
    setFetching(true);
    try {
      const res = await fetch(`/api/admin/pazaryeri?status=${status}`);
      if (!res.ok) { setFetching(false); return; }
      const json = await res.json();
      setEvents(json.events ?? []);
      setCounts(json.counts ?? { active: 0, draft: 0, archived: 0 });
    } catch { /* network error */ }
    setFetching(false);
  }, []);

  useEffect(() => { fetchData(tab); }, [tab, fetchData]);

  async function archiveEvent(id: string) {
    await fetch("/api/admin/pazaryeri", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchData(tab);
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "active",   label: "Aktif" },
    { key: "draft",    label: "Taslak" },
    { key: "archived", label: "Arşiv" },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-warm-900/40 mb-1">Admin Paneli</p>
          <h1 className="text-2xl font-bold text-warm-900">Pazaryeri Yönetimi</h1>
        </div>
        <Link
          href="/admin/pazaryeri/yeni"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-coral text-white text-sm font-semibold rounded-xl hover:bg-coral/90 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Yeni Atölye
        </Link>
      </div>

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

      {/* Table */}
      {fetching ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-coral border-t-transparent rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-warm-900/35">
          <p className="text-base">Bu sekmedeki etkinlik bulunamadı.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-warm-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-warm-100 text-warm-900/40 text-xs uppercase tracking-wide">
                <th className="text-left px-5 py-3 font-semibold">Başlık</th>
                <th className="text-left px-5 py-3 font-semibold">Şehir</th>
                <th className="text-left px-5 py-3 font-semibold">Kategori</th>
                <th className="text-left px-5 py-3 font-semibold">Tarih</th>
                <th className="text-right px-5 py-3 font-semibold">Fiyat</th>
                <th className="text-right px-5 py-3 font-semibold">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-b border-warm-50 hover:bg-warm-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {e.is_featured && (
                        <span className="px-1.5 py-0.5 bg-coral/10 text-coral text-[10px] font-bold rounded">★</span>
                      )}
                      <span className="font-medium text-warm-900">{e.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-warm-900/60">{e.district ? `${e.district}, ${e.city}` : e.city}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 bg-warm-100 text-warm-900/60 text-xs font-medium rounded-full">
                      {CATEGORY_LABELS[e.category] ?? e.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-warm-900/50 font-mono text-xs">{fmt(e.event_date)}</td>
                  <td className="px-5 py-3 text-right">
                    {e.price === 0 ? (
                      <span className="text-emerald-600 font-medium">Ücretsiz</span>
                    ) : (
                      <span className="font-semibold text-warm-900">{e.price} TL</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/pazaryeri/${e.id}`}
                        className="px-3 py-1.5 bg-warm-100 hover:bg-warm-200 text-warm-900/60 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Düzenle
                      </Link>
                      {tab !== "archived" && (
                        <button
                          onClick={() => archiveEvent(e.id)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors"
                        >
                          Sil
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
