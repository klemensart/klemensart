"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const EVENT_TYPES = [
  { value: "soylesi", label: "Söyleşi" },
  { value: "panel", label: "Panel" },
  { value: "sergi", label: "Sergi" },
  { value: "konser", label: "Konser" },
  { value: "tiyatro", label: "Tiyatro" },
  { value: "atolye", label: "Atölye" },
  { value: "festival", label: "Festival" },
  { value: "film-festivali", label: "Film Festivali" },
  { value: "performans", label: "Performans" },
  { value: "opera", label: "Opera" },
  { value: "bale", label: "Bale" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function YeniEtkinlikPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugManual, setSlugManual] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    event_type: "soylesi",
    venue: "",
    address: "",
    event_date: "",
    end_date: "",
    image_url: "",
    price_info: "Ücretsiz",
    slug: "",
    capacity: "",
    registration_enabled: true,
    registration_deadline: "",
    contact_email: "info@klemensart.com",
    ai_comment: "",
  });

  function set<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: val };
      if (key === "title" && !slugManual) {
        next.slug = slugify(val as string);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.event_date) {
      setError("Başlık ve tarih zorunludur.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...form,
        capacity: form.capacity ? Number(form.capacity) : null,
        registration_deadline: form.registration_deadline || null,
        end_date: form.end_date || null,
        ai_comment: form.ai_comment || null,
      };

      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Bir hata oluştu");
        setSaving(false);
        return;
      }

      router.push("/admin/etkinlikler");
    } catch {
      setError("Bağlantı hatası");
      setSaving(false);
    }
  }

  const inputCls =
    "w-full text-sm text-warm-900 bg-white border border-warm-200 rounded-xl px-4 py-3 focus:outline-none focus:border-coral/50 placeholder:text-warm-900/25";
  const labelCls = "block text-xs font-semibold text-warm-900/60 uppercase tracking-wide mb-1.5";

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/etkinlikler"
          className="text-xs text-warm-900/40 hover:text-coral transition-colors"
        >
          ← Etkinlik Yönetimi
        </Link>
        <h1 className="text-2xl font-bold text-warm-900 mt-2">Yeni Klemens Etkinliği</h1>
        <p className="text-sm text-warm-900/50 mt-1">
          Klemens tarafından düzenlenen etkinlik oluşturun. Otomatik onaylı olarak yayınlanır.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Başlık */}
        <div>
          <label className={labelCls}>Başlık *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Etkinlik başlığı"
            className={inputCls}
            required
          />
        </div>

        {/* Slug */}
        <div>
          <label className={labelCls}>
            Slug
            <button
              type="button"
              onClick={() => setSlugManual(!slugManual)}
              className="ml-2 text-coral font-normal normal-case tracking-normal"
            >
              {slugManual ? "(otomatik)" : "(manuel düzenle)"}
            </button>
          </label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => { setSlugManual(true); set("slug", e.target.value); }}
            placeholder="etkinlik-slug"
            className={inputCls}
            readOnly={!slugManual}
          />
          <p className="text-xs text-warm-900/30 mt-1">
            URL: klemensart.com/etkinlikler/{form.slug || "..."}
          </p>
        </div>

        {/* Açıklama */}
        <div>
          <label className={labelCls}>Açıklama *</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={6}
            placeholder="Etkinlik açıklaması..."
            className={inputCls + " resize-y"}
            required
          />
        </div>

        {/* Tip + Fiyat */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Etkinlik Tipi</label>
            <select
              value={form.event_type}
              onChange={(e) => set("event_type", e.target.value)}
              className={inputCls}
            >
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Fiyat Bilgisi</label>
            <input
              type="text"
              value={form.price_info}
              onChange={(e) => set("price_info", e.target.value)}
              placeholder="Ücretsiz"
              className={inputCls}
            />
          </div>
        </div>

        {/* Mekan + Adres */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Mekan</label>
            <input
              type="text"
              value={form.venue}
              onChange={(e) => set("venue", e.target.value)}
              placeholder="Galeri adı"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Adres</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Tam adres"
              className={inputCls}
            />
          </div>
        </div>

        {/* Tarih + Bitiş */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Tarih ve Saat *</label>
            <input
              type="datetime-local"
              value={form.event_date}
              onChange={(e) => set("event_date", e.target.value)}
              className={inputCls}
              required
            />
          </div>
          <div>
            <label className={labelCls}>Bitiş (opsiyonel)</label>
            <input
              type="datetime-local"
              value={form.end_date}
              onChange={(e) => set("end_date", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        {/* Görsel URL */}
        <div>
          <label className={labelCls}>Görsel URL</label>
          <input
            type="url"
            value={form.image_url}
            onChange={(e) => set("image_url", e.target.value)}
            placeholder="https://sgabkrzzzszfqrtgkord.supabase.co/storage/..."
            className={inputCls}
          />
          {form.image_url && (
            <div className="mt-2 rounded-xl overflow-hidden border border-warm-100 max-w-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.image_url} alt="Önizleme" className="w-full h-auto" />
            </div>
          )}
        </div>

        {/* Kayıt Ayarları */}
        <div className="bg-warm-50 rounded-2xl border border-warm-100 p-6 space-y-4">
          <h3 className="text-sm font-bold text-warm-900">Kayıt Ayarları</h3>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.registration_enabled}
              onChange={(e) => set("registration_enabled", e.target.checked)}
              className="w-4 h-4 accent-coral"
            />
            <span className="text-sm text-warm-900">Kayıt formunu aktif et</span>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Kapasite (referans)</label>
              <input
                type="number"
                value={form.capacity}
                onChange={(e) => set("capacity", e.target.value)}
                placeholder="40"
                min="1"
                className={inputCls}
              />
              <p className="text-xs text-warm-900/30 mt-1">Sadece admin görebilir</p>
            </div>
            <div>
              <label className={labelCls}>Son Kayıt Tarihi</label>
              <input
                type="datetime-local"
                value={form.registration_deadline}
                onChange={(e) => set("registration_deadline", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>İletişim Email</label>
            <input
              type="email"
              value={form.contact_email}
              onChange={(e) => set("contact_email", e.target.value)}
              placeholder="info@klemensart.com"
              className={inputCls}
            />
          </div>
        </div>

        {/* Klemens Notu */}
        <div>
          <label className={labelCls}>Klemens Notu (AI yorumu)</label>
          <textarea
            value={form.ai_comment}
            onChange={(e) => set("ai_comment", e.target.value)}
            rows={3}
            placeholder="Neden bu etkinliğe katılmalısınız?"
            className={inputCls + " resize-none"}
          />
        </div>

        {/* Error + Submit */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-coral text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Etkinliği Oluştur"}
          </button>
          <Link
            href="/admin/etkinlikler"
            className="px-6 py-3 bg-warm-100 text-warm-900/60 text-sm font-semibold rounded-xl hover:bg-warm-200 transition-colors"
          >
            Vazgeç
          </Link>
        </div>
      </form>
    </div>
  );
}
