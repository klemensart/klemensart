"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Tab = "new" | "published" | "dismissed";

type NewsItem = {
  id: string;
  title: string;
  summary: string | null;
  url: string | null;
  image_url: string | null;
  source_name: string | null;
  published_at: string | null;
  status: string;
  is_manual: boolean;
  created_at: string;
};

function fmt(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminHaberlerPage() {
  const [tab, setTab] = useState<Tab>("new");
  const [items, setItems] = useState<NewsItem[]>([]);
  const [counts, setCounts] = useState({ new: 0, published: 0, dismissed: 0 });
  const [fetching, setFetching] = useState(false);
  const [actioning, setActioning] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [fetcherRunning, setFetcherRunning] = useState(false);
  const [fetcherResult, setFetcherResult] = useState<string | null>(null);

  // Manuel haber ekleme
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ title: "", summary: "", url: "", image_url: "", source_name: "" });
  const [addLoading, setAddLoading] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (status: Tab, p: number) => {
    setFetching(true);
    try {
      const res = await fetch(`/api/admin/news?status=${status}&page=${p}`);
      if (!res.ok) { setFetching(false); return; }
      const json = await res.json();
      setItems(json.items ?? []);
      setCounts(json.counts ?? { new: 0, published: 0, dismissed: 0 });
    } catch {
      // leave state
    }
    setFetching(false);
  }, []);

  useEffect(() => {
    fetchData(tab, page);
  }, [tab, page, fetchData]);

  // Tab değişince sayfa 1'e dön
  const switchTab = (newTab: Tab) => {
    setTab(newTab);
    setPage(1);
  };

  const PAGE_SIZE = 50;
  const totalForTab = counts[tab] ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalForTab / PAGE_SIZE));

  // ── Actions ───────────────────────────────────────────────────────────────
  async function updateStatus(id: string, status: string) {
    setActioning((p) => ({ ...p, [id]: true }));
    await fetch(`/api/admin/news/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setActioning((p) => ({ ...p, [id]: false }));
    fetchData(tab, page);
  }

  async function reorderItem(id: string, direction: "up" | "down") {
    setActioning((p) => ({ ...p, [id]: true }));
    await fetch("/api/admin/news/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, direction }),
    });
    setActioning((p) => ({ ...p, [id]: false }));
    fetchData(tab, page);
  }

  async function deleteItem(id: string) {
    if (!confirm("Bu haberi silmek istediğinizden emin misiniz?")) return;
    setActioning((p) => ({ ...p, [id]: true }));
    await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
    setActioning((p) => ({ ...p, [id]: false }));
    fetchData(tab, page);
  }

  async function runFetcher() {
    setFetcherRunning(true);
    setFetcherResult(null);
    try {
      const res = await fetch("/api/admin/news/fetch", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setFetcherResult(json.message);
        fetchData(tab, page);
      } else {
        setFetcherResult(`Hata: ${json.error ?? "bilinmeyen hata"}`);
      }
    } catch (err) {
      setFetcherResult(`Bağlantı hatası: ${String(err)}`);
    } finally {
      setFetcherRunning(false);
    }
  }

  async function addManualNews() {
    if (!addForm.title.trim()) return;
    setAddLoading(true);
    try {
      await fetch("/api/admin/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      setAddForm({ title: "", summary: "", url: "", image_url: "", source_name: "" });
      setShowAddForm(false);
      fetchData(tab, page);
    } catch {
      // ignore
    }
    setAddLoading(false);
  }

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const tabs: { key: Tab; label: string }[] = [
    { key: "new", label: "Yeni" },
    { key: "published", label: "Yayınlananlar" },
    { key: "dismissed", label: "Geçilenler" },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-warm-900/40 mb-1">Admin Paneli</p>
          <h1 className="text-2xl font-bold text-warm-900">Haber Kürasyon</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/haberler/kaynaklar"
            className="px-4 py-2 bg-warm-100 hover:bg-warm-200 text-warm-900 text-sm font-semibold rounded-xl transition-colors"
          >
            Kaynaklar
          </Link>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-warm-900 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Haber Ekle
          </button>
          <div className="flex flex-col items-end">
            <button
              onClick={runFetcher}
              disabled={fetcherRunning}
              className="px-4 py-2 bg-coral text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {fetcherRunning ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Çekiliyor...
                </span>
              ) : (
                "RSS Çekiciyi Çalıştır"
              )}
            </button>
            {fetcherResult && (
              <p className="text-xs text-warm-900/50 mt-1 max-w-xs text-right">{fetcherResult}</p>
            )}
          </div>
        </div>
      </div>

      {/* Manual Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-warm-100 p-6 mb-6">
          <h3 className="text-sm font-bold text-warm-900 mb-4">Manuel Haber Ekle</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              placeholder="Başlık *"
              value={addForm.title}
              onChange={(e) => setAddForm((p) => ({ ...p, title: e.target.value }))}
              className="px-3 py-2 text-sm border border-warm-200 rounded-xl focus:outline-none focus:border-coral/50 bg-warm-50"
            />
            <input
              placeholder="Kaynak adı"
              value={addForm.source_name}
              onChange={(e) => setAddForm((p) => ({ ...p, source_name: e.target.value }))}
              className="px-3 py-2 text-sm border border-warm-200 rounded-xl focus:outline-none focus:border-coral/50 bg-warm-50"
            />
            <input
              placeholder="URL"
              value={addForm.url}
              onChange={(e) => setAddForm((p) => ({ ...p, url: e.target.value }))}
              className="px-3 py-2 text-sm border border-warm-200 rounded-xl focus:outline-none focus:border-coral/50 bg-warm-50"
            />
            <input
              placeholder="Görsel URL"
              value={addForm.image_url}
              onChange={(e) => setAddForm((p) => ({ ...p, image_url: e.target.value }))}
              className="px-3 py-2 text-sm border border-warm-200 rounded-xl focus:outline-none focus:border-coral/50 bg-warm-50"
            />
          </div>
          <textarea
            placeholder="Özet"
            value={addForm.summary}
            onChange={(e) => setAddForm((p) => ({ ...p, summary: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 text-sm border border-warm-200 rounded-xl focus:outline-none focus:border-coral/50 bg-warm-50 resize-none mb-4"
          />
          <div className="flex gap-2">
            <button
              onClick={addManualNews}
              disabled={addLoading || !addForm.title.trim()}
              className="px-4 py-2 bg-coral text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {addLoading ? "Ekleniyor..." : "Ekle"}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-warm-100 text-warm-900/60 text-sm font-semibold rounded-xl hover:bg-warm-200 transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-warm-200">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => switchTab(key)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-xl border border-b-0 -mb-px transition-colors ${
              tab === key
                ? "bg-white border-warm-200 text-warm-900"
                : "bg-transparent border-transparent text-warm-900/40 hover:text-warm-900/70"
            }`}
          >
            {label}
            <span
              className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                tab === key ? "bg-coral/10 text-coral" : "bg-warm-200 text-warm-900/40"
              }`}
            >
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Items */}
      {fetching ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-coral border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-warm-900/35">
          <p className="text-base">Bu sekmede haber bulunamadı.</p>
        </div>
      ) : (
        <div className="space-y-3" id="news-list">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-warm-100 overflow-hidden"
            >
              <div className="px-6 py-4 flex gap-4">
                {/* Thumbnail */}
                {item.image_url && (
                  <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-warm-100">
                    <img
                      src={item.image_url}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {item.source_name && (
                      <span className="px-2 py-0.5 bg-warm-100 text-warm-900/60 text-xs font-semibold rounded-full">
                        {item.source_name}
                      </span>
                    )}
                    {item.is_manual && (
                      <span className="px-2 py-0.5 bg-coral/10 text-coral text-xs font-semibold rounded-full">
                        Manuel
                      </span>
                    )}
                    <span className="text-xs text-warm-900/40">{fmt(item.published_at)}</span>
                  </div>

                  <h3 className="text-sm font-bold text-warm-900 mb-1 line-clamp-1">
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-coral transition-colors"
                      >
                        {item.title}
                      </a>
                    ) : (
                      item.title
                    )}
                  </h3>

                  {item.summary && (
                    <p className="text-xs text-warm-900/50 line-clamp-2">{item.summary}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex items-center gap-2">
                  {tab === "new" && (
                    <>
                      <button
                        onClick={() => updateStatus(item.id, "published")}
                        disabled={actioning[item.id]}
                        className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                      >
                        Yayınla
                      </button>
                      <button
                        onClick={() => updateStatus(item.id, "dismissed")}
                        disabled={actioning[item.id]}
                        className="px-4 py-2 bg-warm-100 hover:bg-warm-200 text-warm-900/50 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                      >
                        Geç
                      </button>
                    </>
                  )}
                  {tab === "published" && (
                    <>
                      <button
                        onClick={() => reorderItem(item.id, "up")}
                        disabled={actioning[item.id]}
                        className="w-8 h-8 flex items-center justify-center bg-warm-100 hover:bg-warm-200 text-warm-900/50 rounded-lg transition-colors disabled:opacity-30"
                        title="Yukarı taşı"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 15l-6-6-6 6" />
                        </svg>
                      </button>
                      <button
                        onClick={() => reorderItem(item.id, "down")}
                        disabled={actioning[item.id]}
                        className="w-8 h-8 flex items-center justify-center bg-warm-100 hover:bg-warm-200 text-warm-900/50 rounded-lg transition-colors disabled:opacity-30"
                        title="Aşağı taşı"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                      <button
                        onClick={() => updateStatus(item.id, "new")}
                        disabled={actioning[item.id]}
                        className="px-4 py-2 bg-warm-100 hover:bg-warm-200 text-warm-900/50 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                      >
                        Geri Al
                      </button>
                    </>
                  )}
                  {tab === "dismissed" && (
                    <>
                      <button
                        onClick={() => updateStatus(item.id, "new")}
                        disabled={actioning[item.id]}
                        className="px-4 py-2 bg-warm-100 hover:bg-warm-200 text-warm-900/50 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                      >
                        Tekrar Değerlendir
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        disabled={actioning[item.id]}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                      >
                        Sil
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8 pb-4">
          <button
            onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            disabled={page <= 1 || fetching}
            className="px-4 py-2 bg-warm-100 hover:bg-warm-200 text-warm-900/60 text-sm font-semibold rounded-xl transition-colors disabled:opacity-30"
          >
            &larr; Önceki
          </button>
          <span className="text-sm text-warm-900/50">
            Sayfa <span className="font-semibold text-warm-900">{page}</span> / {totalPages}
            <span className="ml-2 text-warm-900/30">({totalForTab} haber)</span>
          </span>
          <button
            onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            disabled={page >= totalPages || fetching}
            className="px-4 py-2 bg-warm-100 hover:bg-warm-200 text-warm-900/60 text-sm font-semibold rounded-xl transition-colors disabled:opacity-30"
          >
            Sonraki &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
