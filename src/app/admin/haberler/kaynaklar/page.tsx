"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Feed = {
  id: string;
  name: string;
  url: string;
  category: string;
  is_active: boolean;
  last_fetched_at: string | null;
  last_error: string | null;
  item_count: number;
  created_at: string;
};

type TestResult = {
  success: boolean;
  feedTitle?: string;
  itemCount?: number;
  preview?: { title: string; link: string | null; pubDate: string | null }[];
  error?: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  ajans: "Ajans",
  gazete: "Gazete",
  "sanat-platformu": "Sanat Platformu",
  dergi: "Dergi",
  diger: "Diğer",
};

const CATEGORY_COLORS: Record<string, string> = {
  ajans: "bg-blue-50 text-blue-700",
  gazete: "bg-amber-50 text-amber-700",
  "sanat-platformu": "bg-violet-50 text-violet-700",
  dergi: "bg-emerald-50 text-emerald-700",
  diger: "bg-warm-100 text-warm-900/60",
};

function fmtDate(iso: string | null) {
  if (!iso) return "Henüz çekilmedi";
  return new Date(iso).toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminKaynaklarPage() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<Record<string, boolean>>({});

  // Add form
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", url: "", category: "diger" });
  const [addLoading, setAddLoading] = useState(false);

  // Test
  const [testUrl, setTestUrl] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchFeeds = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/news/feeds");
      const json = await res.json();
      setFeeds(json.feeds ?? []);
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFeeds();
  }, [fetchFeeds]);

  // ── Toggle active ─────────────────────────────────────────────────────────
  async function toggleFeed(feed: Feed) {
    setToggling((p) => ({ ...p, [feed.id]: true }));
    await fetch(`/api/admin/news/feeds/${feed.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !feed.is_active }),
    });
    setToggling((p) => ({ ...p, [feed.id]: false }));
    fetchFeeds();
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function deleteFeed(id: string) {
    if (!confirm("Bu kaynağı silmek istediğinizden emin misiniz?")) return;
    await fetch(`/api/admin/news/feeds/${id}`, { method: "DELETE" });
    fetchFeeds();
  }

  // ── Add feed ──────────────────────────────────────────────────────────────
  async function addFeed() {
    if (!addForm.name.trim() || !addForm.url.trim()) return;
    setAddLoading(true);
    try {
      const res = await fetch("/api/admin/news/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const json = await res.json();
      if (json.success) {
        setAddForm({ name: "", url: "", category: "diger" });
        setShowAdd(false);
        fetchFeeds();
      }
    } catch {
      // ignore
    }
    setAddLoading(false);
  }

  // ── Test feed ─────────────────────────────────────────────────────────────
  async function testFeed() {
    if (!testUrl.trim()) return;
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/news/feeds/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: testUrl }),
      });
      setTestResult(await res.json());
    } catch (err) {
      setTestResult({ success: false, error: (err as Error).message });
    }
    setTestLoading(false);
  }

  const activeCount = feeds.filter((f) => f.is_active).length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/admin/haberler"
              className="text-xs text-warm-900/40 hover:text-warm-900/70 transition-colors"
            >
              Haber Kürasyon
            </Link>
            <span className="text-xs text-warm-900/30">/</span>
            <p className="text-xs text-warm-900/40">Kaynaklar</p>
          </div>
          <h1 className="text-2xl font-bold text-warm-900">RSS Kaynakları</h1>
          <p className="text-sm text-warm-900/50 mt-1">
            {feeds.length} kaynak ({activeCount} aktif)
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-coral text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          Kaynak Ekle
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-white rounded-2xl border border-warm-100 p-6 mb-6">
          <h3 className="text-sm font-bold text-warm-900 mb-4">Yeni Kaynak Ekle</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              placeholder="Kaynak adı *"
              value={addForm.name}
              onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
              className="px-3 py-2 text-sm border border-warm-200 rounded-xl focus:outline-none focus:border-coral/50 bg-warm-50"
            />
            <input
              placeholder="RSS URL *"
              value={addForm.url}
              onChange={(e) => setAddForm((p) => ({ ...p, url: e.target.value }))}
              className="px-3 py-2 text-sm border border-warm-200 rounded-xl focus:outline-none focus:border-coral/50 bg-warm-50"
            />
            <select
              value={addForm.category}
              onChange={(e) => setAddForm((p) => ({ ...p, category: e.target.value }))}
              className="px-3 py-2 text-sm border border-warm-200 rounded-xl focus:outline-none focus:border-coral/50 bg-warm-50"
            >
              <option value="ajans">Ajans</option>
              <option value="gazete">Gazete</option>
              <option value="sanat-platformu">Sanat Platformu</option>
              <option value="dergi">Dergi</option>
              <option value="diger">Diğer</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addFeed}
              disabled={addLoading || !addForm.name.trim() || !addForm.url.trim()}
              className="px-4 py-2 bg-coral text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {addLoading ? "Ekleniyor..." : "Ekle"}
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 bg-warm-100 text-warm-900/60 text-sm font-semibold rounded-xl hover:bg-warm-200 transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Test Feed */}
      <div className="bg-white rounded-2xl border border-warm-100 p-6 mb-6">
        <h3 className="text-sm font-bold text-warm-900 mb-3">Feed Test Et</h3>
        <div className="flex gap-3">
          <input
            placeholder="RSS URL girin..."
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-warm-200 rounded-xl focus:outline-none focus:border-coral/50 bg-warm-50"
          />
          <button
            onClick={testFeed}
            disabled={testLoading || !testUrl.trim()}
            className="px-4 py-2 bg-warm-900 text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {testLoading ? "Test ediliyor..." : "Test Et"}
          </button>
        </div>
        {testResult && (
          <div className="mt-4">
            {testResult.success ? (
              <div>
                <p className="text-sm text-emerald-700 font-semibold mb-2">
                  {testResult.feedTitle} — {testResult.itemCount} öğe bulundu
                </p>
                <div className="space-y-1">
                  {testResult.preview?.map((p, i) => (
                    <div key={i} className="text-xs text-warm-900/60 flex gap-2">
                      <span className="text-warm-900/30">{i + 1}.</span>
                      <span className="flex-1 truncate">{p.title}</span>
                      <span className="text-warm-900/30 flex-shrink-0">
                        {p.pubDate ? new Date(p.pubDate).toLocaleDateString("tr-TR") : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-red-600">{testResult.error}</p>
            )}
          </div>
        )}
      </div>

      {/* Feed List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-coral border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {feeds.map((feed) => (
            <div
              key={feed.id}
              className={`bg-white rounded-2xl border border-warm-100 px-6 py-4 flex items-center gap-4 ${
                !feed.is_active ? "opacity-50" : ""
              }`}
            >
              {/* Toggle */}
              <button
                onClick={() => toggleFeed(feed)}
                disabled={toggling[feed.id]}
                className={`w-10 h-6 rounded-full flex items-center transition-colors ${
                  feed.is_active ? "bg-emerald-500 justify-end" : "bg-warm-200 justify-start"
                }`}
              >
                <span className="w-4 h-4 bg-white rounded-full mx-1 shadow-sm" />
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-bold text-warm-900 truncate">{feed.name}</h3>
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      CATEGORY_COLORS[feed.category] ?? CATEGORY_COLORS.diger
                    }`}
                  >
                    {CATEGORY_LABELS[feed.category] ?? feed.category}
                  </span>
                </div>
                <p className="text-xs text-warm-900/40 truncate">{feed.url}</p>
              </div>

              {/* Stats */}
              <div className="flex-shrink-0 text-right">
                <p className="text-xs text-warm-900/50">
                  Son çekim: {fmtDate(feed.last_fetched_at)}
                </p>
                {feed.last_error && (
                  <p className="text-xs text-red-500 truncate max-w-xs" title={feed.last_error}>
                    Hata: {feed.last_error.slice(0, 60)}
                  </p>
                )}
                {!feed.last_error && feed.item_count > 0 && (
                  <p className="text-xs text-warm-900/40">{feed.item_count} öğe</p>
                )}
              </div>

              {/* Delete */}
              <button
                onClick={() => deleteFeed(feed.id)}
                className="flex-shrink-0 p-2 text-warm-900/30 hover:text-red-500 transition-colors"
                title="Kaynağı sil"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
