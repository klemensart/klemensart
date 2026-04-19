"use client";

import { useEffect, useState, useCallback } from "react";

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

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l }));

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("tr-TR", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

const EMPTY_FORM = {
  title: "", description: "", short_description: "", category: "resim", city: "Ankara",
  district: "", venue_name: "", venue_address: "", organizer_name: "", organizer_url: "",
  organizer_phone: "", organizer_email: "", organizer_logo_url: "", price: 0,
  price_options_json: "", event_date: "", end_date: "", event_time_note: "", duration_note: "",
  recurring: false, recurring_note: "", image_url: "", gallery_urls_text: "",
  max_participants: "", is_featured: false, status: "active",
};

export default function AdminPazaryeriPage() {
  const [tab, setTab] = useState<Tab>("active");
  const [events, setEvents] = useState<MarketplaceEvent[]>([]);
  const [counts, setCounts] = useState({ active: 0, draft: 0, archived: 0 });
  const [fetching, setFetching] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

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

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(e: MarketplaceEvent) {
    setEditingId(e.id);
    setForm({
      title: e.title,
      description: e.description ?? "",
      short_description: e.short_description ?? "",
      category: e.category,
      city: e.city,
      district: e.district ?? "",
      venue_name: e.venue_name ?? "",
      venue_address: e.venue_address ?? "",
      organizer_name: e.organizer_name,
      organizer_url: e.organizer_url ?? "",
      organizer_phone: e.organizer_phone ?? "",
      organizer_email: e.organizer_email ?? "",
      organizer_logo_url: e.organizer_logo_url ?? "",
      price: e.price,
      price_options_json: e.price_options ? JSON.stringify(e.price_options, null, 2) : "",
      event_date: e.event_date ? e.event_date.slice(0, 16) : "",
      end_date: e.end_date ? e.end_date.slice(0, 16) : "",
      event_time_note: e.event_time_note ?? "",
      duration_note: e.duration_note ?? "",
      recurring: e.recurring,
      recurring_note: e.recurring_note ?? "",
      image_url: e.image_url ?? "",
      gallery_urls_text: e.gallery_urls ? e.gallery_urls.join("\n") : "",
      max_participants: e.max_participants ? String(e.max_participants) : "",
      is_featured: e.is_featured,
      status: e.status,
    });
    setModalOpen(true);
  }

  async function handleSubmit() {
    setSubmitting(true);
    const payload: Record<string, unknown> = {
      title: form.title,
      description: form.description || null,
      short_description: form.short_description || null,
      category: form.category,
      city: form.city,
      district: form.district || null,
      venue_name: form.venue_name || null,
      venue_address: form.venue_address || null,
      organizer_name: form.organizer_name,
      organizer_url: form.organizer_url || null,
      organizer_phone: form.organizer_phone || null,
      organizer_email: form.organizer_email || null,
      organizer_logo_url: form.organizer_logo_url || null,
      price: Number(form.price) || 0,
      price_options: form.price_options_json ? JSON.parse(form.price_options_json) : null,
      event_date: form.event_date ? new Date(form.event_date).toISOString() : null,
      end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
      event_time_note: form.event_time_note || null,
      duration_note: form.duration_note || null,
      recurring: form.recurring,
      recurring_note: form.recurring_note || null,
      image_url: form.image_url || null,
      gallery_urls: form.gallery_urls_text ? form.gallery_urls_text.split("\n").filter(Boolean) : null,
      max_participants: form.max_participants ? Number(form.max_participants) : null,
      is_featured: form.is_featured,
      status: form.status,
    };

    if (editingId) {
      payload.id = editingId;
      await fetch("/api/admin/pazaryeri", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/admin/pazaryeri", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setSubmitting(false);
    setModalOpen(false);
    fetchData(tab);
  }

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

  function field(label: string, name: keyof typeof form, type: string = "text", opts?: { textarea?: boolean; required?: boolean }) {
    const val = form[name];
    const commonCn = "w-full text-sm bg-warm-50 border border-warm-200 rounded-xl px-3 py-2 focus:outline-none focus:border-coral/50";
    return (
      <div>
        <label className="block text-xs font-semibold text-warm-900/50 mb-1">{label}</label>
        {opts?.textarea ? (
          <textarea
            value={val as string}
            onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))}
            rows={3}
            className={commonCn + " resize-none"}
          />
        ) : type === "checkbox" ? (
          <input
            type="checkbox"
            checked={val as boolean}
            onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.checked }))}
            className="w-4 h-4 accent-coral"
          />
        ) : (
          <input
            type={type}
            value={val as string | number}
            onChange={(e) => setForm((p) => ({ ...p, [name]: type === "number" ? Number(e.target.value) : e.target.value }))}
            required={opts?.required}
            className={commonCn}
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-warm-900/40 mb-1">Admin Paneli</p>
          <h1 className="text-2xl font-bold text-warm-900">Pazaryeri Yönetimi</h1>
        </div>
        <button
          onClick={openNew}
          className="px-4 py-2 bg-coral text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          + Yeni Ekle
        </button>
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
                      <button
                        onClick={() => openEdit(e)}
                        className="px-3 py-1.5 bg-warm-100 hover:bg-warm-200 text-warm-900/60 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Düzenle
                      </button>
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-warm-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-warm-900">
                {editingId ? "Etkinliği Düzenle" : "Yeni Etkinlik Ekle"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-warm-900/30 hover:text-warm-900 text-xl">&times;</button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {field("Başlık *", "title", "text", { required: true })}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-warm-900/50 mb-1">Kategori</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full text-sm bg-warm-50 border border-warm-200 rounded-xl px-3 py-2 focus:outline-none focus:border-coral/50"
                  >
                    {CATEGORY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-warm-900/50 mb-1">Şehir</label>
                  <select
                    value={form.city}
                    onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                    className="w-full text-sm bg-warm-50 border border-warm-200 rounded-xl px-3 py-2 focus:outline-none focus:border-coral/50"
                  >
                    <option value="Ankara">Ankara</option>
                    <option value="İstanbul">İstanbul</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {field("İlçe", "district")}
                {field("Mekân Adı", "venue_name")}
              </div>
              {field("Mekân Adresi", "venue_address")}
              {field("Kısa Açıklama", "short_description")}
              {field("Açıklama", "description", "text", { textarea: true })}

              <div className="grid grid-cols-2 gap-4">
                {field("Etkinlik Tarihi *", "event_date", "datetime-local", { required: true })}
                {field("Bitiş Tarihi", "end_date", "datetime-local")}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {field("Süre Notu", "duration_note")}
                {field("Saat Notu", "event_time_note")}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {field("Düzenleyici Adı *", "organizer_name", "text", { required: true })}
                {field("Düzenleyici URL", "organizer_url", "url")}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {field("Düzenleyici Telefon", "organizer_phone", "tel")}
                {field("Düzenleyici E-posta", "organizer_email", "email")}
              </div>
              {field("Düzenleyici Logo URL", "organizer_logo_url", "url")}

              <div className="grid grid-cols-3 gap-4">
                {field("Fiyat (TL)", "price", "number")}
                {field("Maks. Katılımcı", "max_participants", "number")}
                <div>
                  <label className="block text-xs font-semibold text-warm-900/50 mb-1">Durum</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                    className="w-full text-sm bg-warm-50 border border-warm-200 rounded-xl px-3 py-2 focus:outline-none focus:border-coral/50"
                  >
                    <option value="active">Aktif</option>
                    <option value="draft">Taslak</option>
                    <option value="archived">Arşivlenmiş</option>
                  </select>
                </div>
              </div>

              {field("Fiyat Seçenekleri (JSON)", "price_options_json", "text", { textarea: true })}
              {field("Görsel URL", "image_url", "url")}
              {field("Galeri URL'leri (her satıra bir URL)", "gallery_urls_text", "text", { textarea: true })}

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-warm-900/70">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm((p) => ({ ...p, is_featured: e.target.checked }))}
                    className="w-4 h-4 accent-coral"
                  />
                  Öne Çıkan
                </label>
                <label className="flex items-center gap-2 text-sm text-warm-900/70">
                  <input
                    type="checkbox"
                    checked={form.recurring}
                    onChange={(e) => setForm((p) => ({ ...p, recurring: e.target.checked }))}
                    className="w-4 h-4 accent-coral"
                  />
                  Tekrarlayan
                </label>
              </div>
              {form.recurring && field("Tekrarlama Notu", "recurring_note")}
            </div>

            <div className="px-6 py-4 border-t border-warm-100 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-warm-900/50 hover:text-warm-900 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !form.title || !form.organizer_name}
                className="px-6 py-2.5 bg-coral text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {submitting ? "Kaydediliyor..." : editingId ? "Güncelle" : "Ekle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
