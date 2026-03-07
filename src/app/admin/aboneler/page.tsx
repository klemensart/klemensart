"use client";

import { useState, useEffect, useCallback } from "react";

type Subscriber = {
  id: string;
  email: string;
  name: string | null;
  subscribed_at: string;
  is_active: boolean;
  source: string;
};

export default function AbonelerPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");

  const loadSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subscribers");
      const data = await res.json();
      if (res.ok) {
        setSubscribers(data.subscribers);
        setTotal(data.total);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscribers();
  }, [loadSubscribers]);

  const toggleActive = async (id: string, currentlyActive: boolean) => {
    try {
      const res = await fetch("/api/admin/subscribers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !currentlyActive }),
      });
      if (res.ok) loadSubscribers();
    } catch {
      // silent
    }
  };

  const deleteSubscriber = async (id: string, email: string) => {
    if (!confirm(`"${email}" aboneliğini kalıcı olarak silmek istiyor musunuz?`)) return;
    try {
      const res = await fetch("/api/admin/subscribers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) loadSubscribers();
    } catch {
      // silent
    }
  };

  const exportCSV = () => {
    const header = "Email,İsim,Kayıt Tarihi,Durum,Kaynak";
    const rows = subscribers.map((s) =>
      [
        s.email,
        s.name || "",
        new Date(s.subscribed_at).toLocaleDateString("tr-TR"),
        s.is_active ? "Aktif" : "Pasif",
        s.source,
      ].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aboneler-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = subscribers.filter((s) => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return (
      s.email.toLowerCase().includes(q) ||
      (s.name && s.name.toLowerCase().includes(q))
    );
  });

  const activeCount = subscribers.filter((s) => s.is_active).length;

  return (
    <div className="p-10 max-w-5xl mx-auto bg-white min-h-screen">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 mb-1">Aboneler</h1>
          <p className="text-gray-400 text-sm">
            Toplam {total} abone &middot; {activeCount} aktif
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          CSV Dışa Aktar
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Email veya isim ara..."
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 w-full max-w-sm focus:outline-none focus:border-[#FF6D60]"
        />
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Yükleniyor...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Henüz abone yok.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="py-3 pr-4 font-medium">Email</th>
                <th className="py-3 pr-4 font-medium">İsim</th>
                <th className="py-3 pr-4 font-medium">Kayıt Tarihi</th>
                <th className="py-3 pr-4 font-medium">Durum</th>
                <th className="py-3 font-medium w-[120px]"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4 text-gray-800">{s.email}</td>
                  <td className="py-3 pr-4 text-gray-600">{s.name || "—"}</td>
                  <td className="py-3 pr-4 text-gray-500">
                    {new Date(s.subscribed_at).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        s.is_active
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {s.is_active ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="py-3 flex gap-2 justify-end">
                    <button
                      onClick={() => toggleActive(s.id, s.is_active)}
                      className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                      title={s.is_active ? "Pasif yap" : "Aktif yap"}
                    >
                      {s.is_active ? "Durdur" : "Aktifle"}
                    </button>
                    <button
                      onClick={() => deleteSubscriber(s.id, s.email)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      title="Sil"
                    >
                      Sil
                    </button>
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
