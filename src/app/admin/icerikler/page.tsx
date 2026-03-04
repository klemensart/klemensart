"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Article = {
  id: string;
  slug: string;
  title: string;
  author: string;
  category: string;
  status: string;
  date: string;
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminIceriklerPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/articles");
      const data = await res.json();
      setArticles(data.articles ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const toggleStatus = async (id: string, current: string) => {
    setToggling(id);
    try {
      const newStatus = current === "published" ? "draft" : "published";
      const res = await fetch(`/api/admin/articles/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setArticles((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
        );
      }
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-warm-900/40 mb-1">Admin Paneli</p>
          <h1 className="text-2xl font-bold text-warm-900">İçerikler</h1>
        </div>
        <Link
          href="/admin/icerikler/yeni"
          className="px-4 py-2.5 text-sm font-medium bg-coral text-white rounded-xl hover:bg-coral/90 transition"
        >
          + Yeni Yazı
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-warm-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-warm-50 text-warm-900/50 text-xs uppercase tracking-wide">
              <th className="text-left px-5 py-3 font-medium">Başlık</th>
              <th className="text-left px-5 py-3 font-medium">Yazar</th>
              <th className="text-left px-5 py-3 font-medium">Kategori</th>
              <th className="text-left px-5 py-3 font-medium">Durum</th>
              <th className="text-left px-5 py-3 font-medium">Tarih</th>
              <th className="text-right px-5 py-3 font-medium">Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-warm-900/30">
                  Yükleniyor...
                </td>
              </tr>
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-warm-900/30">
                  Henüz yazı yok
                </td>
              </tr>
            ) : (
              articles.map((a) => (
                <tr
                  key={a.id}
                  className="hover:bg-warm-50 transition-colors border-t border-warm-100"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/icerikler/${a.id}`}
                      className="text-sm font-medium text-warm-900 hover:text-coral transition-colors line-clamp-1"
                    >
                      {a.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-sm text-warm-900/70">
                    {a.author}
                  </td>
                  <td className="px-5 py-3 text-sm text-warm-900/70">
                    {a.category}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        a.status === "published"
                          ? "bg-green-50 text-green-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {a.status === "published" ? "Yayında" : "Taslak"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-warm-900/50">
                    {fmtDate(a.date)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStatus(a.id, a.status);
                      }}
                      disabled={toggling === a.id}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-warm-100 text-warm-900/60 hover:bg-warm-200 transition disabled:opacity-50"
                    >
                      {toggling === a.id
                        ? "..."
                        : a.status === "published"
                        ? "Taslağa Al"
                        : "Yayınla"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
