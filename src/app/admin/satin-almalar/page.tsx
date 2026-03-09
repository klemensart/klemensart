"use client";

import { useCallback, useEffect, useState } from "react";

type Purchase = {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  workshop_id: string | null;
  single_video_id: string | null;
  title: string;
  type: "workshop" | "video";
  purchased_at: string;
  expires_at: string | null;
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isExpired(expiresAt: string | null) {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

export default function AdminSatinAlmalarPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("q", search);
      const res = await fetch(`/api/admin/purchases?${params}`);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setPurchases(data.purchases);
      setTotal(data.total);
    } catch {
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const perPage = 20;
  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs text-warm-900/40 mb-1">Admin Paneli</p>
          <h1 className="text-2xl font-bold text-warm-900">Satın Almalar</h1>
        </div>
        <div className="text-sm text-warm-900/40">
          Toplam: <span className="font-semibold text-warm-900">{total}</span>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="E-posta, isim veya ürün ara..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full max-w-md px-4 py-2.5 rounded-xl border border-warm-100 bg-white text-sm text-warm-900 placeholder:text-warm-900/30 outline-none focus:border-coral/40 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-warm-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-6 h-6 border-2 border-coral/30 border-t-coral rounded-full animate-spin" />
          </div>
        ) : purchases.length === 0 ? (
          <div className="p-12 text-center text-warm-900/30 text-sm">
            {search ? "Sonuç bulunamadı" : "Henüz satın alma yok"}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-warm-100 text-warm-900/40 text-xs uppercase tracking-wider">
                <th className="text-left px-6 py-3 font-medium">Kullanıcı</th>
                <th className="text-left px-6 py-3 font-medium">Ürün</th>
                <th className="text-left px-6 py-3 font-medium">Tür</th>
                <th className="text-left px-6 py-3 font-medium">Tarih</th>
                <th className="text-left px-6 py-3 font-medium">Bitiş</th>
                <th className="text-left px-6 py-3 font-medium">Durum</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => {
                const expired = isExpired(p.expires_at);
                return (
                  <tr
                    key={p.id}
                    className="border-b border-warm-50 last:border-0 hover:bg-warm-50/50 transition-colors"
                  >
                    {/* User */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-warm-900">
                        {p.user_name || "—"}
                      </div>
                      <div className="text-warm-900/40 text-xs mt-0.5">
                        {p.user_email}
                      </div>
                    </td>

                    {/* Product */}
                    <td className="px-6 py-4 text-warm-900">{p.title}</td>

                    {/* Type */}
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          p.type === "workshop"
                            ? "bg-coral/10 text-coral"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {p.type === "workshop" ? "Atölye" : "Video"}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-warm-900/60">
                      {fmtDateTime(p.purchased_at)}
                    </td>

                    {/* Expires */}
                    <td className="px-6 py-4 text-warm-900/60">
                      {fmtDate(p.expires_at)}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {!p.expires_at ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                          Süresiz
                        </span>
                      ) : expired ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-500">
                          Süresi Doldu
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                          Aktif
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg text-sm border border-warm-100 disabled:opacity-30 hover:bg-warm-50 transition-colors"
          >
            &larr;
          </button>
          <span className="text-sm text-warm-900/50">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg text-sm border border-warm-100 disabled:opacity-30 hover:bg-warm-50 transition-colors"
          >
            &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
