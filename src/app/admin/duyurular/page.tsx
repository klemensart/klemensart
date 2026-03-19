"use client";

import { useEffect, useState, useCallback } from "react";

type Announcement = {
  id: string;
  title: string;
  link_url: string | null;
  link_text: string | null;
  badge_text: string | null;
  is_active: boolean;
  pages: string[];
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

const EMPTY_FORM = {
  title: "",
  link_url: "",
  link_text: "Detaylar",
  badge_text: "Yeni",
  is_active: true,
  pages: ["homepage", "atolyeler"] as string[],
  expires_at: "",
};

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PAGE_OPTIONS = [
  { value: "homepage", label: "Anasayfa" },
  { value: "atolyeler", label: "Atölyeler" },
];

export default function AdminDuyurularPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/announcements");
      if (!res.ok) return;
      const json = await res.json();
      setItems(json.items ?? []);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(a: Announcement) {
    setEditingId(a.id);
    setForm({
      title: a.title,
      link_url: a.link_url ?? "",
      link_text: a.link_text ?? "Detaylar",
      badge_text: a.badge_text ?? "Yeni",
      is_active: a.is_active,
      pages: a.pages ?? ["homepage", "atolyeler"],
      expires_at: a.expires_at ? a.expires_at.slice(0, 16) : "",
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);

    const payload = {
      ...(editingId ? { id: editingId } : {}),
      title: form.title.trim(),
      link_url: form.link_url.trim() || null,
      link_text: form.link_text.trim() || "Detaylar",
      badge_text: form.badge_text.trim() || "Yeni",
      is_active: form.is_active,
      pages: form.pages,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    };

    await fetch("/api/admin/announcements", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu duyuruyu silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/admin/announcements?id=${id}`, { method: "DELETE" });
    fetchData();
  }

  async function toggleActive(a: Announcement) {
    await fetch("/api/admin/announcements", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: a.id, is_active: !a.is_active }),
    });
    fetchData();
  }

  function togglePage(value: string) {
    setForm((prev) => ({
      ...prev,
      pages: prev.pages.includes(value)
        ? prev.pages.filter((p) => p !== value)
        : [...prev.pages, value],
    }));
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-warm-900">Duyurular</h1>
        <button
          onClick={openNew}
          className="px-4 py-2 bg-coral text-white text-sm font-semibold rounded-xl hover:bg-coral/90 transition-colors"
        >
          + Yeni Duyuru
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-warm-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-warm-900 mb-4">
            {editingId ? "Duyuru Düzenle" : "Yeni Duyuru"}
          </h2>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-warm-900/70 mb-1">
                Başlık *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Yeni Sinema Kulübü oturumu başlıyor!"
                className="w-full px-3 py-2 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
              />
            </div>

            {/* Link URL + Link Text */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-warm-900/70 mb-1">
                  Link URL
                </label>
                <input
                  type="text"
                  value={form.link_url}
                  onChange={(e) => setForm((f) => ({ ...f, link_url: e.target.value }))}
                  placeholder="/atolyeler/sinema-klubu"
                  className="w-full px-3 py-2 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-900/70 mb-1">
                  Link Metni
                </label>
                <input
                  type="text"
                  value={form.link_text}
                  onChange={(e) => setForm((f) => ({ ...f, link_text: e.target.value }))}
                  placeholder="Detaylar"
                  className="w-full px-3 py-2 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
                />
              </div>
            </div>

            {/* Badge Text + Expires */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-warm-900/70 mb-1">
                  Badge Metni
                </label>
                <input
                  type="text"
                  value={form.badge_text}
                  onChange={(e) => setForm((f) => ({ ...f, badge_text: e.target.value }))}
                  placeholder="Yeni"
                  className="w-full px-3 py-2 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-900/70 mb-1">
                  Bitiş Tarihi
                </label>
                <input
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
                  className="w-full px-3 py-2 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
                />
              </div>
            </div>

            {/* Pages */}
            <div>
              <label className="block text-sm font-medium text-warm-900/70 mb-2">
                Gösterilecek Sayfalar
              </label>
              <div className="flex gap-3">
                {PAGE_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={form.pages.includes(opt.value)}
                      onChange={() => togglePage(opt.value)}
                      className="rounded border-warm-200 text-coral focus:ring-coral/30"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Active toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="rounded border-warm-200 text-coral focus:ring-coral/30"
              />
              Aktif
            </label>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim()}
                className="px-5 py-2 bg-coral text-white text-sm font-semibold rounded-xl hover:bg-coral/90 transition-colors disabled:opacity-50"
              >
                {saving ? "Kaydediliyor..." : editingId ? "Güncelle" : "Ekle"}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="px-5 py-2 bg-warm-100 text-warm-900/60 text-sm font-medium rounded-xl hover:bg-warm-200 transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-sm text-warm-900/40 py-12 text-center">Yükleniyor...</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-warm-900/40 py-12 text-center">
          Henüz duyuru yok. Yukarıdaki butona tıklayarak yeni bir duyuru ekleyin.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((a) => {
            const isExpired = a.expires_at && new Date(a.expires_at) < new Date();
            return (
              <div
                key={a.id}
                className={`bg-white rounded-2xl border p-5 transition-colors ${
                  a.is_active && !isExpired
                    ? "border-green-200 bg-green-50/30"
                    : "border-warm-100"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-warm-900 truncate">
                        {a.title}
                      </h3>
                      {a.is_active && !isExpired && (
                        <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          AKTİF
                        </span>
                      )}
                      {isExpired && (
                        <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                          SÜRESİ DOLMUŞ
                        </span>
                      )}
                      {!a.is_active && (
                        <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-warm-100 text-warm-900/40">
                          PASİF
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-warm-900/40 mt-2">
                      {a.link_url && (
                        <span>
                          Link: <span className="text-warm-900/60">{a.link_url}</span>
                        </span>
                      )}
                      <span>
                        Badge: <span className="text-warm-900/60">{a.badge_text}</span>
                      </span>
                      <span>
                        Sayfalar:{" "}
                        <span className="text-warm-900/60">{a.pages?.join(", ")}</span>
                      </span>
                      {a.expires_at && (
                        <span>
                          Bitiş: <span className="text-warm-900/60">{fmt(a.expires_at)}</span>
                        </span>
                      )}
                      <span>
                        Oluşturulma: <span className="text-warm-900/60">{fmt(a.created_at)}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleActive(a)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        a.is_active
                          ? "bg-warm-100 text-warm-900/50 hover:bg-warm-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {a.is_active ? "Deaktif Et" : "Aktif Et"}
                    </button>
                    <button
                      onClick={() => openEdit(a)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-warm-100 text-warm-900/50 hover:bg-warm-200 transition-colors"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
