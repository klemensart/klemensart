"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type NewsItem = {
  id: string;
  title: string;
  summary: string | null;
  url: string | null;
  image_url: string | null;
  source_name: string | null;
  published_at: string | null;
};

function fmtDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function timeAgo(iso: string | null) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Az önce";
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Dün";
  if (days < 7) return `${days} gün önce`;
  return fmtDate(iso);
}

export default function HaberlerClient() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 30;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/public/news?page=${page}&limit=${limit}`);
        const json = await res.json();
        setItems(json.items ?? []);
        setTotal(json.total ?? 0);
      } catch {
        // ignore
      }
      setLoading(false);
    };
    load();
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="min-h-screen bg-warm-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-white pt-32 pb-12 px-6 border-b border-warm-100">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-bold tracking-widest text-coral uppercase mb-4">
            Haberler
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-warm-900 tracking-tight mb-4">
            Kültür Sanat Gündemi
          </h1>
          <p className="text-warm-900/50 text-lg">
            Türkiye ve dünyadan güncel kültür-sanat haberleri
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-coral border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-warm-900/35">
            <p className="text-base">Henüz yayınlanmış haber bulunmuyor.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {items.map((item) => (
                <a
                  key={item.id}
                  href={item.url ?? "#"}
                  target={item.url ? "_blank" : undefined}
                  rel={item.url ? "noopener noreferrer" : undefined}
                  className="block bg-white rounded-2xl border border-warm-100 overflow-hidden hover:border-warm-200 hover:shadow-sm transition-all group"
                >
                  <div className="flex gap-4 p-5">
                    {/* Thumbnail */}
                    {item.image_url && (
                      <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-24 rounded-xl overflow-hidden bg-warm-100">
                        <img
                          src={item.image_url}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {item.source_name && (
                          <span className="px-2 py-0.5 bg-warm-100 text-warm-900/60 text-xs font-semibold rounded-full">
                            {item.source_name}
                          </span>
                        )}
                        <span className="text-xs text-warm-900/40">
                          {timeAgo(item.published_at)}
                        </span>
                      </div>

                      <h2 className="text-base font-bold text-warm-900 group-hover:text-coral transition-colors line-clamp-2 mb-1">
                        {item.title}
                      </h2>

                      {item.summary && (
                        <p className="text-sm text-warm-900/50 line-clamp-2">
                          {item.summary}
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0 flex items-center">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-warm-900/20 group-hover:text-coral transition-colors"
                      >
                        <line x1="7" y1="17" x2="17" y2="7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 bg-white border border-warm-200 text-sm font-semibold rounded-xl hover:bg-warm-50 disabled:opacity-30 transition-colors"
                >
                  Önceki
                </button>
                <span className="px-4 py-2 text-sm text-warm-900/50">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 bg-white border border-warm-200 text-sm font-semibold rounded-xl hover:bg-warm-50 disabled:opacity-30 transition-colors"
                >
                  Sonraki
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}
