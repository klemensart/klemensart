"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import AtolyeCardPreview from "@/components/admin/AtolyeCardPreview";
import YeniHostModal from "@/components/admin/YeniHostModal";
import { toTurkeyISO, fromUTCToTurkeyLocal } from "@/lib/dates";

const TiptapEditor = dynamic(
  () => import("@/components/admin/TiptapEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-48 flex items-center justify-center border border-warm-200 rounded-xl bg-white text-sm text-warm-900/30">
        Editör yükleniyor...
      </div>
    ),
  }
);

// ─── Types ────────────────────────────────────────────────────────────────────

type PriceOption = { label: string; price: number; note: string };

type HostOption = {
  id: string;
  name: string;
  avatar_url: string | null;
  workshop_count: number;
  email: string | null;
};

type FormData = {
  title: string;
  slug: string;
  category: string;
  short_description: string;
  description: string;
  host_id: string;
  organizer_name: string;
  organizer_url: string;
  organizer_phone: string;
  organizer_email: string;
  organizer_logo_url: string;
  city: string;
  district: string;
  venue_name: string;
  venue_address: string;
  event_date: string;
  end_date: string;
  duration_note: string;
  event_time_note: string;
  recurring: boolean;
  recurring_note: string;
  price: number;
  currency: string;
  price_options: PriceOption[];
  image_url: string;
  gallery_urls: string[];
  tier: "klemens" | "kulup" | "network";
  is_klemens: boolean;
  is_featured: boolean;
  max_participants: string;
  status: "draft" | "active" | "archived";
};

type Props = {
  initialData?: any;
  mode: "create" | "edit";
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { value: "resim", label: "Resim" },
  { value: "seramik", label: "Seramik" },
  { value: "fotograf", label: "Fotoğraf" },
  { value: "muzik", label: "Müzik" },
  { value: "heykel", label: "Heykel" },
  { value: "dijital", label: "Dijital Sanat" },
  { value: "yazarlik", label: "Yazarlık" },
  { value: "dans", label: "Dans" },
  { value: "tiyatro", label: "Tiyatro" },
  { value: "sanat-tarihi", label: "Sanat Tarihi" },
  { value: "sinema", label: "Sinema" },
  { value: "diger", label: "Diğer" },
];

const EMPTY_FORM: FormData = {
  title: "",
  slug: "",
  category: "resim",
  short_description: "",
  description: "",
  host_id: "",
  organizer_name: "",
  organizer_url: "",
  organizer_phone: "",
  organizer_email: "",
  organizer_logo_url: "",
  city: "Ankara",
  district: "",
  venue_name: "",
  venue_address: "",
  event_date: "",
  end_date: "",
  duration_note: "",
  event_time_note: "",
  recurring: false,
  recurring_note: "",
  price: 0,
  currency: "TRY",
  price_options: [],
  image_url: "",
  gallery_urls: [],
  tier: "network",
  is_klemens: false,
  is_featured: false,
  max_participants: "",
  status: "draft",
};

function slugify(text: string): string {
  const TR_MAP: Record<string, string> = {
    ğ: "g", Ğ: "G", ü: "u", Ü: "U", ş: "s", Ş: "S",
    ı: "i", İ: "I", ö: "o", Ö: "O", ç: "c", Ç: "C",
  };
  let s = text;
  for (const [from, to] of Object.entries(TR_MAP)) {
    s = s.replaceAll(from, to);
  }
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AtolyeForm({ initialData, mode }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [prefillBanner, setPrefillBanner] = useState<{ name: string; hostFound: boolean } | null>(null);
  const [hostModalInitial, setHostModalInitial] = useState<any>(null);
  const [form, setForm] = useState<FormData>(() => {
    if (initialData) {
      return {
        title: initialData.title || "",
        slug: initialData.slug || "",
        category: initialData.category || "resim",
        short_description: initialData.short_description || "",
        description: initialData.description || "",
        host_id: initialData.host_id || "",
        organizer_name: initialData.organizer_name || "",
        organizer_url: initialData.organizer_url || "",
        organizer_phone: initialData.organizer_phone || "",
        organizer_email: initialData.organizer_email || "",
        organizer_logo_url: initialData.organizer_logo_url || "",
        city: initialData.city || "Ankara",
        district: initialData.district || "",
        venue_name: initialData.venue_name || "",
        venue_address: initialData.venue_address || "",
        event_date: initialData.event_date ? fromUTCToTurkeyLocal(initialData.event_date) : "",
        end_date: initialData.end_date ? fromUTCToTurkeyLocal(initialData.end_date) : "",
        duration_note: initialData.duration_note || "",
        event_time_note: initialData.event_time_note || "",
        recurring: initialData.recurring || false,
        recurring_note: initialData.recurring_note || "",
        price: initialData.price ?? 0,
        currency: initialData.currency || "TRY",
        price_options: initialData.price_options || [],
        image_url: initialData.image_url || "",
        gallery_urls: initialData.gallery_urls || [],
        tier: initialData.tier || (initialData.is_klemens ? "klemens" : "network"),
        is_klemens: initialData.is_klemens || false,
        is_featured: initialData.is_featured || false,
        max_participants: initialData.max_participants ? String(initialData.max_participants) : "",
        status: initialData.status || "draft",
      };
    }
    return EMPTY_FORM;
  });

  const [hosts, setHosts] = useState<HostOption[]>([]);
  const [slugManual, setSlugManual] = useState(mode === "edit");
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken">( "idle");
  const [slugSuggestion, setSlugSuggestion] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hostModalOpen, setHostModalOpen] = useState(false);
  const [dirty, setDirty] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const slugCheckTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // ─── Fetch hosts ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/admin/people?is_host=true")
      .then((r) => r.json())
      .then((d) => setHosts((d.people ?? []).map((p: any) => ({
        id: p.id,
        name: p.name,
        avatar_url: p.avatar_url,
        workshop_count: p.workshop_count ?? 0,
        email: p.email || null,
      }))));
  }, []);

  // ─── Prefill from application ─────────────────────────────────────────────
  const prefillRan = useRef(false);
  useEffect(() => {
    if (prefillRan.current || mode === "edit") return;
    const applicationId = searchParams.get("from_application");
    if (!applicationId || hosts.length === 0) return;
    prefillRan.current = true;

    fetch(`/api/admin/atolye-basvurulari/${applicationId}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((app) => {
        // Parse price: "500 TL" → 50000 kuruş, "1.500" → 150000
        let price = 0;
        const priceMatch = app.workshop_price?.match(/[\d.,]+/);
        if (priceMatch) {
          const cleaned = priceMatch[0].replace(/\./g, "").replace(",", ".");
          price = Math.round(parseFloat(cleaned) * 100);
        }

        setForm((prev) => ({
          ...prev,
          title: app.workshop_topic || prev.title,
          slug: slugify(app.workshop_topic || ""),
          description: app.workshop_description || prev.description,
          organizer_name: app.applicant_name || prev.organizer_name,
          organizer_email: app.applicant_email || prev.organizer_email,
          organizer_phone: app.applicant_phone || prev.organizer_phone,
          organizer_url: app.applicant_website || prev.organizer_url,
          duration_note: app.workshop_duration || prev.duration_note,
          event_time_note: app.proposed_dates
            ? `Düzenleyici önerisi: ${app.proposed_dates}`
            : prev.event_time_note,
          city: app.city || prev.city,
          district: app.district || prev.district,
          venue_name: app.venue_name || prev.venue_name,
          venue_address: app.venue_address || prev.venue_address,
          image_url: app.cover_url || prev.image_url,
          organizer_logo_url: app.profile_url || prev.organizer_logo_url,
          gallery_urls: app.gallery_urls?.length ? app.gallery_urls : prev.gallery_urls,
          price,
        }));

        // Slug check
        const newSlug = slugify(app.workshop_topic || "");
        if (newSlug) checkSlug(newSlug);

        // Host matching by email
        const matchedHost = app.applicant_email
          ? hosts.find((h) => h.email && h.email.toLowerCase() === app.applicant_email.toLowerCase())
          : null;

        if (matchedHost) {
          handleHostChange(matchedHost.id);
          setPrefillBanner({ name: app.applicant_name, hostFound: true });
        } else {
          // Prepare initial data for YeniHostModal
          const isInstagram = app.applicant_website?.includes("instagram");
          let instagramHandle: string | null = null;
          if (isInstagram && app.applicant_website) {
            const match = app.applicant_website.match(/instagram\.com\/([^/?]+)/);
            instagramHandle = match ? match[1].replace(/^@/, "") : null;
          }
          setHostModalInitial({
            name: app.applicant_name || "",
            slug: "",
            email: app.applicant_email || null,
            metadata: { phone: app.applicant_phone || app.whatsapp_number || null },
            instagram: instagramHandle,
            website: isInstagram ? null : app.applicant_website || null,
          });
          setHostModalOpen(true);
          setPrefillBanner({ name: app.applicant_name, hostFound: false });
        }

        // Clean URL
        router.replace("/admin/pazaryeri/yeni", { scroll: false });
      })
      .catch(() => { /* silently ignore if application fetch fails */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hosts, searchParams, mode]);

  // ─── Unsaved changes warning ─────────────────────────────────────────────
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // ─── Slug check (debounced) ───────────────────────────────────────────────
  const checkSlug = useCallback((slug: string) => {
    if (!slug) { setSlugStatus("idle"); return; }
    clearTimeout(slugCheckTimer.current);
    slugCheckTimer.current = setTimeout(async () => {
      setSlugStatus("checking");
      const excludeId = initialData?.id ? `&excludeId=${initialData.id}` : "";
      const res = await fetch(`/api/admin/pazaryeri/check-slug?slug=${slug}${excludeId}`);
      const data = await res.json();
      if (data.available) {
        setSlugStatus("available");
        setSlugSuggestion("");
      } else {
        setSlugStatus("taken");
        setSlugSuggestion(data.suggestion || "");
      }
    }, 500);
  }, [initialData?.id]);

  // ─── Form update helper ───────────────────────────────────────────────────
  const update = useCallback((key: keyof FormData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }, []);

  // ─── Title → slug auto ───────────────────────────────────────────────────
  const handleTitleChange = (val: string) => {
    update("title", val);
    if (!slugManual) {
      const newSlug = slugify(val);
      update("slug", newSlug);
      checkSlug(newSlug);
    }
  };

  const handleSlugChange = (val: string) => {
    setSlugManual(true);
    const newSlug = slugify(val);
    update("slug", newSlug);
    checkSlug(newSlug);
  };

  // ─── Host select ─────────────────────────────────────────────────────────
  const handleHostChange = (hostId: string) => {
    update("host_id", hostId);
    const host = hosts.find((h) => h.id === hostId);
    if (host) {
      update("organizer_name", host.name);
      if (host.avatar_url) update("organizer_logo_url", host.avatar_url);
    }
  };

  // ─── Tier logic ───────────────────────────────────────────────────────────
  const handleTierChange = (tier: "klemens" | "kulup" | "network") => {
    update("tier", tier);
    update("is_klemens", tier === "klemens" || tier === "kulup");
  };

  // ─── Description image upload (Tiptap) ──────────────────────────────────
  const handleDescriptionImage = useCallback(async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("slug", "atolye-icerik");
    try {
      const res = await fetch("/api/admin/upload/marketplace-image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) return null;
      return data.url;
    } catch {
      return null;
    }
  }, []);

  // ─── Image upload ─────────────────────────────────────────────────────────
  const handleImageUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setErrors((e) => ({ ...e, image: "Dosya çok büyük, en fazla 10MB olmalı." }));
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrors((e) => ({ ...e, image: "Sadece JPG, PNG, WebP kabul edilir." }));
      return;
    }

    setUploading(true);
    setErrors((e) => { const { image, ...rest } = e; return rest; });

    const fd = new FormData();
    fd.append("file", file);
    fd.append("slug", form.slug || "atolye");

    try {
      const res = await fetch("/api/admin/upload/marketplace-image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      update("image_url", data.url);
    } catch (err: any) {
      setErrors((e) => ({ ...e, image: err.message || "Yükleme hatası" }));
    } finally {
      setUploading(false);
    }
  };

  // ─── Price options ────────────────────────────────────────────────────────
  const addPriceOption = () => {
    update("price_options", [...form.price_options, { label: "", price: 0, note: "" }]);
  };

  const updatePriceOption = (idx: number, field: keyof PriceOption, value: any) => {
    const updated = [...form.price_options];
    updated[idx] = { ...updated[idx], [field]: value };
    update("price_options", updated);
  };

  const removePriceOption = (idx: number) => {
    update("price_options", form.price_options.filter((_, i) => i !== idx));
  };

  // ─── Validate ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title.trim() || form.title.trim().length < 3) {
      errs.title = "Başlık zorunludur (en az 3 karakter)";
    }
    if (!form.host_id && !form.organizer_name.trim()) {
      errs.host = "Host seçin veya düzenleyici adı girin";
    }
    if (!form.event_date) {
      errs.event_date = "Tarih zorunludur";
    }
    if (slugStatus === "taken") {
      errs.slug = "Bu slug kullanımda";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSave = async (status: "draft" | "active" | "archived") => {
    if (!validate()) return;
    setSaving(true);

    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      slug: form.slug,
      category: form.category,
      short_description: form.short_description || null,
      description: form.description || null,
      host_id: form.host_id || null,
      organizer_name: form.organizer_name || null,
      organizer_url: form.organizer_url || null,
      organizer_phone: form.organizer_phone || null,
      organizer_email: form.organizer_email || null,
      organizer_logo_url: form.organizer_logo_url || null,
      city: form.city,
      district: form.district || null,
      venue_name: form.venue_name || null,
      venue_address: form.venue_address || null,
      event_date: form.event_date ? toTurkeyISO(form.event_date) : null,
      end_date: form.end_date ? toTurkeyISO(form.end_date) : null,
      duration_note: form.duration_note || null,
      event_time_note: form.event_time_note || null,
      recurring: form.recurring,
      recurring_note: form.recurring_note || null,
      price: Number(form.price) || 0,
      currency: form.currency,
      price_options: form.price_options.length > 0 ? form.price_options : null,
      image_url: form.image_url || null,
      gallery_urls: form.gallery_urls.length > 0 ? form.gallery_urls : null,
      tier: form.tier,
      is_klemens: form.is_klemens,
      is_featured: form.is_featured,
      max_participants: form.max_participants ? Number(form.max_participants) : null,
      status,
    };

    try {
      let res;
      if (mode === "edit" && initialData?.id) {
        payload.id = initialData.id;
        res = await fetch("/api/admin/pazaryeri", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/pazaryeri", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        setErrors({ form: data.error || "Bir hata oluştu" });
        return;
      }

      // Fire-and-forget: otomatik sosyal medya görseli üret
      const savedId =
        mode === "edit" && initialData?.id
          ? initialData.id
          : (await res.json()).event?.id;
      if (savedId) {
        fetch("/api/admin/designs/auto-atolye-card", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ atolyeId: savedId }),
        }).catch(() => {});
      }

      setDirty(false);
      router.push("/admin/pazaryeri");
      router.refresh();
    } catch (err: any) {
      setErrors({ form: err.message || "Bir hata oluştu" });
    } finally {
      setSaving(false);
    }
  };

  // ─── Preview data ─────────────────────────────────────────────────────────
  const previewData = useMemo(() => ({
    title: form.title,
    category: form.category,
    city: form.city,
    district: form.district,
    price: Number(form.price) || 0,
    image_url: form.image_url,
    event_date: form.event_date,
    is_featured: form.is_featured,
    is_klemens: form.is_klemens,
    organizer_name: form.organizer_name,
    organizer_logo_url: form.organizer_logo_url,
    venue_name: form.venue_name,
    duration_note: form.duration_note,
    description: form.description,
  }), [form.title, form.category, form.city, form.district, form.price, form.image_url, form.event_date, form.is_featured, form.is_klemens, form.organizer_name, form.organizer_logo_url, form.venue_name, form.duration_note, form.description]);

  // ─── Shared input class ───────────────────────────────────────────────────
  const inputCn = "w-full px-3 py-2.5 text-sm border border-warm-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral transition-colors";
  const labelCn = "block text-xs font-medium text-warm-900/60 mb-1.5";

  return (
    <>
      <div className="flex gap-8">
        {/* ─── LEFT: FORM ─────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-8">
          {prefillBanner && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3 rounded-xl flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">&check; {prefillBanner.name} başvurusundan bilgiler yüklendi.</p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Görsel, kategori, şehir ve tarihi tamamlayın.
                  {" "}(Host bulundu: {prefillBanner.hostFound ? "Evet" : "Hayır"})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPrefillBanner(null)}
                className="flex-shrink-0 text-emerald-500 hover:text-emerald-700 mt-0.5"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

          {errors.form && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {errors.form}
            </div>
          )}

          {/* ── Temel Bilgiler ── */}
          <section className="bg-white rounded-2xl border border-warm-100 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-warm-900/70">Temel Bilgiler</h2>

            {/* Title */}
            <div>
              <label className={labelCn}>Başlık <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className={`${inputCn} ${errors.title ? "border-red-300" : ""}`}
                placeholder="Sokak Fotoğrafçılığı Atölyesi"
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            {/* Category */}
            <div>
              <label className={labelCn}>Kategori</label>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className={inputCn}
              >
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Short description */}
            <div>
              <label className={labelCn}>Kısa Açıklama</label>
              <input
                type="text"
                value={form.short_description}
                onChange={(e) => update("short_description", e.target.value)}
                className={inputCn}
                placeholder="SEO ve kart görünümü için kısa tanım"
                maxLength={200}
              />
              <p className="text-[10px] text-warm-900/30 mt-1">{form.short_description.length}/200</p>
            </div>

            {/* Description — Tiptap Editor */}
            <div>
              <label className={labelCn}>Detaylı Açıklama</label>
              <TiptapEditor
                content={form.description}
                onChange={(md) => update("description", md)}
                onUploadImage={handleDescriptionImage}
                placeholder="Atölyenin detaylarını anlatın — neler öğretilecek, kimler için uygun, ne getirmeli..."
              />
            </div>

            {/* Slug */}
            <div>
              <label className={labelCn}>URL Slug</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-warm-900/30 flex-shrink-0">/atolyeler/</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className={`${inputCn} ${slugStatus === "taken" ? "border-red-300" : slugStatus === "available" ? "border-emerald-300" : ""}`}
                  placeholder="sokak-fotografciligi-atolyesi"
                />
                {slugStatus === "checking" && (
                  <div className="w-4 h-4 border-2 border-warm-300 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                )}
                {slugStatus === "available" && (
                  <span className="text-emerald-500 text-xs flex-shrink-0">✓</span>
                )}
              </div>
              {slugStatus === "taken" && (
                <p className="text-xs text-red-500 mt-1">
                  Bu slug kullanımda.{slugSuggestion && ` Öneri: ${slugSuggestion}`}
                </p>
              )}
            </div>
          </section>

          {/* ── Host ── */}
          <section className="bg-white rounded-2xl border border-warm-100 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-warm-900/70">Düzenleyici / Host</h2>

            <div>
              <label className={labelCn}>Host Seç <span className="text-red-400">*</span></label>
              <select
                value={form.host_id}
                onChange={(e) => handleHostChange(e.target.value)}
                className={`${inputCn} ${errors.host ? "border-red-300" : ""}`}
              >
                <option value="">— Host seçin —</option>
                {hosts.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.workshop_count} atölye)
                  </option>
                ))}
              </select>
              {errors.host && <p className="text-xs text-red-500 mt-1">{errors.host}</p>}
              <button
                type="button"
                onClick={() => setHostModalOpen(true)}
                className="mt-2 text-xs text-coral hover:underline"
              >
                + Yeni Eğitmen Ekle
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCn}>Düzenleyici Adı</label>
                <input
                  type="text"
                  value={form.organizer_name}
                  onChange={(e) => update("organizer_name", e.target.value)}
                  className={inputCn}
                  placeholder="Otomatik doldurulur"
                />
              </div>
              <div>
                <label className={labelCn}>Kayıt URL&apos;si</label>
                <input
                  type="url"
                  value={form.organizer_url}
                  onChange={(e) => update("organizer_url", e.target.value)}
                  className={inputCn}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCn}>Telefon</label>
                <input
                  type="tel"
                  value={form.organizer_phone}
                  onChange={(e) => update("organizer_phone", e.target.value)}
                  className={inputCn}
                  placeholder="(5XX) XXX XX XX"
                />
              </div>
              <div>
                <label className={labelCn}>E-posta</label>
                <input
                  type="email"
                  value={form.organizer_email}
                  onChange={(e) => update("organizer_email", e.target.value)}
                  className={inputCn}
                  placeholder="ornek@email.com"
                />
              </div>
            </div>
          </section>

          {/* ── Yer ve Zaman ── */}
          <section className="bg-white rounded-2xl border border-warm-100 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-warm-900/70">Yer ve Zaman</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCn}>Şehir</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className={inputCn}
                  placeholder="Ankara"
                />
              </div>
              <div>
                <label className={labelCn}>İlçe</label>
                <input
                  type="text"
                  value={form.district}
                  onChange={(e) => update("district", e.target.value)}
                  className={inputCn}
                  placeholder="Çankaya"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCn}>Mekan Adı</label>
                <input
                  type="text"
                  value={form.venue_name}
                  onChange={(e) => update("venue_name", e.target.value)}
                  className={inputCn}
                  placeholder="Unite Sanat Merkezi"
                />
              </div>
              <div>
                <label className={labelCn}>Mekan Adresi</label>
                <input
                  type="text"
                  value={form.venue_address}
                  onChange={(e) => update("venue_address", e.target.value)}
                  className={inputCn}
                  placeholder="Atatürk Blv. No:12"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCn}>Başlangıç Tarihi <span className="text-red-400">*</span></label>
                <input
                  type="datetime-local"
                  value={form.event_date}
                  onChange={(e) => update("event_date", e.target.value)}
                  className={`${inputCn} ${errors.event_date ? "border-red-300" : ""}`}
                />
                {errors.event_date && <p className="text-xs text-red-500 mt-1">{errors.event_date}</p>}
              </div>
              <div>
                <label className={labelCn}>Bitiş Tarihi</label>
                <input
                  type="datetime-local"
                  value={form.end_date}
                  onChange={(e) => update("end_date", e.target.value)}
                  className={inputCn}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCn}>Süre Notu</label>
                <input
                  type="text"
                  value={form.duration_note}
                  onChange={(e) => update("duration_note", e.target.value)}
                  className={inputCn}
                  placeholder="örn: 2 gün · 6 saat"
                />
              </div>
              <div>
                <label className={labelCn}>Saat Notu</label>
                <input
                  type="text"
                  value={form.event_time_note}
                  onChange={(e) => update("event_time_note", e.target.value)}
                  className={inputCn}
                  placeholder="Cumartesi 14:00-18:00"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-warm-900/70">
                <input
                  type="checkbox"
                  checked={form.recurring}
                  onChange={(e) => update("recurring", e.target.checked)}
                  className="w-4 h-4 accent-coral rounded"
                />
                Tekrarlayan
              </label>
              {form.recurring && (
                <input
                  type="text"
                  value={form.recurring_note}
                  onChange={(e) => update("recurring_note", e.target.value)}
                  className={`${inputCn} flex-1`}
                  placeholder="Her Pazartesi 19:00"
                />
              )}
            </div>
          </section>

          {/* ── Fiyat ve Kayıt ── */}
          <section className="bg-white rounded-2xl border border-warm-100 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-warm-900/70">Fiyat ve Kayıt</h2>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCn}>Ücret (TL)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => update("price", Number(e.target.value) || 0)}
                  className={inputCn}
                  min={0}
                />
              </div>
              <div>
                <label className={labelCn}>Max Katılımcı</label>
                <input
                  type="number"
                  value={form.max_participants}
                  onChange={(e) => update("max_participants", e.target.value)}
                  className={inputCn}
                  min={0}
                  placeholder="—"
                />
              </div>
              <div>
                <label className={labelCn}>Para Birimi</label>
                <select
                  value={form.currency}
                  onChange={(e) => update("currency", e.target.value)}
                  className={inputCn}
                >
                  <option value="TRY">TRY</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            {/* Price Options Editor */}
            <div>
              <label className={labelCn}>Fiyat Seçenekleri</label>
              {form.price_options.length > 0 && (
                <div className="space-y-2 mb-3">
                  {form.price_options.map((opt, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={opt.label}
                        onChange={(e) => updatePriceOption(idx, "label", e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-warm-200 rounded-lg"
                        placeholder="Etiket"
                      />
                      <input
                        type="number"
                        value={opt.price}
                        onChange={(e) => updatePriceOption(idx, "price", Number(e.target.value) || 0)}
                        className="w-24 px-3 py-2 text-sm border border-warm-200 rounded-lg"
                        placeholder="Fiyat"
                      />
                      <input
                        type="text"
                        value={opt.note}
                        onChange={(e) => updatePriceOption(idx, "note", e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-warm-200 rounded-lg"
                        placeholder="Not (opsiyonel)"
                      />
                      <button
                        type="button"
                        onClick={() => removePriceOption(idx)}
                        className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={addPriceOption}
                className="text-xs text-coral hover:underline"
              >
                + Fiyat seçeneği ekle
              </button>
            </div>
          </section>

          {/* ── Görsel ── */}
          <section className="bg-white rounded-2xl border border-warm-100 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-warm-900/70">Kapak Görseli</h2>

            <div
              className="relative aspect-[16/9] max-w-md rounded-xl border-2 border-dashed border-warm-200 hover:border-coral/40 cursor-pointer overflow-hidden flex items-center justify-center bg-warm-50 transition-colors"
              onClick={() => !uploading && fileRef.current?.click()}
              onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && handleImageUpload(e.dataTransfer.files[0]); }}
              onDragOver={(e) => e.preventDefault()}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-coral border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-warm-900/40">Yükleniyor...</span>
                </div>
              ) : form.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.image_url} alt="Kapak" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-warm-900/20">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  <span className="text-xs">Sürükle veya tıkla</span>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
              />
            </div>
            {form.image_url && (
              <div className="flex gap-3">
                <button type="button" onClick={() => fileRef.current?.click()} className="text-xs text-coral hover:underline">
                  Değiştir
                </button>
                <button type="button" onClick={() => update("image_url", "")} className="text-xs text-red-500 hover:underline">
                  Kaldır
                </button>
              </div>
            )}
            {errors.image && <p className="text-xs text-red-500">{errors.image}</p>}

            {/* External URL fallback */}
            <div>
              <label className={labelCn}>veya URL yapıştır</label>
              <input
                type="url"
                value={form.image_url}
                onChange={(e) => update("image_url", e.target.value)}
                className={inputCn}
                placeholder="https://..."
              />
            </div>

            {/* Galeri Görselleri */}
            <div className="border-t border-warm-100 pt-5">
              <h3 className="text-sm font-semibold text-warm-900/70 mb-3">Galeri Görselleri</h3>
              {form.gallery_urls.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {form.gallery_urls.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-warm-200 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Galeri ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => update("gallery_urls", form.gallery_urls.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Görsel URL'si yapıştır ve Ekle'ye bas"
                  className={inputCn + " flex-1"}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) {
                        update("gallery_urls", [...form.gallery_urls, val]);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }
                  }}
                  id="gallery-url-input"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById("gallery-url-input") as HTMLInputElement;
                    const val = input?.value.trim();
                    if (val) {
                      update("gallery_urls", [...form.gallery_urls, val]);
                      input.value = "";
                    }
                  }}
                  className="px-4 py-2 text-xs font-semibold text-coral border border-coral/30 rounded-lg hover:bg-coral/5 transition-colors"
                >
                  Ekle
                </button>
              </div>
              <p className="text-xs text-warm-900/30 mt-1">Süreç fotoğrafları, mekân görseli vb. URL olarak ekleyin</p>
            </div>
          </section>

          {/* ── Yayın Ayarları ── */}
          <section className="bg-white rounded-2xl border border-warm-100 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-warm-900/70">Yayın Ayarları</h2>

            {/* Tier */}
            <div>
              <label className={labelCn}>Düzenleyici Tipi</label>
              <div className="flex gap-2">
                {([
                  { value: "network" as const, label: "Network (Dış)", desc: "Bağımsız düzenleyici" },
                  { value: "kulup" as const, label: "Klemens Kulübü", desc: "Klemens iş birliği" },
                  { value: "klemens" as const, label: "Klemens", desc: "Klemens'in kendi" },
                ] as const).map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => handleTierChange(t.value)}
                    className={`flex-1 px-3 py-3 text-center rounded-xl border text-sm transition-all ${
                      form.tier === t.value
                        ? "border-coral bg-coral/5 text-coral font-medium"
                        : "border-warm-200 text-warm-900/50 hover:border-warm-300"
                    }`}
                  >
                    <span className="block font-medium">{t.label}</span>
                    <span className="block text-[10px] mt-0.5 opacity-60">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Featured */}
            <label className="flex items-center gap-2 text-sm text-warm-900/70">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => update("is_featured", e.target.checked)}
                className="w-4 h-4 accent-coral rounded"
              />
              Öne Çıkan olarak işaretle
            </label>
          </section>

          {/* ── Action Buttons ── */}
          <div className="sticky bottom-0 bg-warm-50 border-t border-warm-100 -mx-8 px-8 py-4 flex gap-3 z-10">
            {form.status === "active" && mode === "edit" ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSave("active")}
                  disabled={saving}
                  className="px-6 py-3 bg-coral text-white text-sm font-semibold rounded-xl hover:bg-coral/90 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Kaydediliyor..." : "Güncellemeyi Kaydet"}
                </button>
                <button
                  type="button"
                  onClick={() => handleSave("archived")}
                  disabled={saving}
                  className="px-6 py-3 border border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                  Arşivle
                </button>
              </>
            ) : form.status === "archived" && mode === "edit" ? (
              <button
                type="button"
                onClick={() => handleSave("active")}
                disabled={saving}
                className="px-6 py-3 bg-coral text-white text-sm font-semibold rounded-xl hover:bg-coral/90 disabled:opacity-50 transition-colors"
              >
                {saving ? "Kaydediliyor..." : "Tekrar Yayınla"}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSave("draft")}
                  disabled={saving}
                  className="px-6 py-3 border border-warm-200 text-warm-900/60 text-sm font-medium rounded-xl hover:bg-warm-100 disabled:opacity-50 transition-colors"
                >
                  Taslak Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => handleSave("active")}
                  disabled={saving}
                  className="px-6 py-3 bg-coral text-white text-sm font-semibold rounded-xl hover:bg-coral/90 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Kaydediliyor..." : "Yayınla"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* ─── RIGHT: LIVE PREVIEW ────────────────────────────────────────── */}
        <div className="hidden xl:block w-[380px] flex-shrink-0">
          <AtolyeCardPreview data={previewData} />
        </div>
      </div>

      {/* Host Modal */}
      <YeniHostModal
        open={hostModalOpen}
        onClose={() => { setHostModalOpen(false); setHostModalInitial(null); }}
        initialData={hostModalInitial}
        onSuccess={(person) => {
          const newHost: HostOption = {
            id: person.id,
            name: person.name,
            avatar_url: person.avatar_url,
            workshop_count: 0,
            email: person.email || null,
          };
          setHosts((prev) => [...prev, newHost]);
          handleHostChange(person.id);
          setHostModalOpen(false);
          setHostModalInitial(null);
        }}
      />
    </>
  );
}
