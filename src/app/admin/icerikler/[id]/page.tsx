"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TiptapEditor from "@/components/admin/TiptapEditor";
import { useAdminRole, useAdminUser } from "@/components/admin/AdminRoleContext";
import type { Suggestion } from "@/lib/tiptap-suggestions";

const CATEGORIES = [
  { slug: "Odak", label: "Odak" },
  { slug: "Kültür & Sanat", label: "Kültür & Sanat" },
  { slug: "İlham Verenler", label: "İlham Verenler" },
  { slug: "Kent & Yaşam", label: "Kent & Yaşam" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/Ğ/g, "g")
    .replace(/Ü/g, "u")
    .replace(/Ş/g, "s")
    .replace(/İ/g, "i")
    .replace(/Ö/g, "o")
    .replace(/Ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

type Form = {
  title: string;
  slug: string;
  author: string;
  author_ig: string;
  author_email: string;
  category: string;
  tags: string;
  image: string;
  description: string;
  content: string;
  status: string;
  date: string;
  hero_overlay_enabled: boolean;
};

const EMPTY: Form = {
  title: "",
  slug: "",
  author: "",
  author_ig: "",
  author_email: "",
  category: "Kültür & Sanat",
  tags: "",
  image: "",
  description: "",
  content: "",
  status: "draft",
  date: new Date().toISOString().slice(0, 10),
  hero_overlay_enabled: false,
};

/* ── Upload helper ── */
async function uploadFile(
  file: File,
  slug: string
): Promise<{ url: string } | { error: string }> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("slug", slug || "genel");
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok) return { error: json.error ?? "Yükleme hatası" };
  return { url: json.url };
}

function isImageFile(file: File): boolean {
  return /^image\/(jpeg|jpg|png|webp|gif)$/.test(file.type);
}

const Spinner = () => (
  <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
);

const UploadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export default function AdminArticleEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === "yeni";

  const [form, setForm] = useState<Form>(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const coverFileRef = useRef<HTMLInputElement>(null);
  const role = useAdminRole();
  const { userId } = useAdminUser();
  const isAdminRole = role === "admin";
  const [adminName, setAdminName] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  // Source mode toggle for custom markdown blocks
  const [sourceMode, setSourceMode] = useState(false);

  // Fetch existing article
  useEffect(() => {
    if (isNew) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/articles/${id}`);
        if (!res.ok) {
          setMsg("Yazı bulunamadı");
          return;
        }
        const { article } = await res.json();
        setForm({
          title: article.title ?? "",
          slug: article.slug ?? "",
          author: article.author ?? "",
          author_ig: article.author_ig ?? "",
          author_email: article.author_email ?? "",
          category: article.category ?? "Kültür & Sanat",
          tags: (article.tags ?? []).join(", "),
          image: article.image ?? "",
          description: article.description ?? "",
          content: article.content ?? "",
          status: article.status ?? "draft",
          date: article.date ? article.date.slice(0, 10) : "",
          hero_overlay_enabled: article.hero_overlay_enabled ?? false,
        });
        setSlugManual(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isNew]);

  // Fetch suggestions + admin name for existing articles
  useEffect(() => {
    if (isNew) return;
    // Fetch suggestions
    fetch(`/api/admin/articles/${id}/suggestions`)
      .then((r) => r.json())
      .then((d) => { if (d.suggestions) setSuggestions(d.suggestions); })
      .catch(() => {});
    // Fetch admin name
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => { if (d.name) setAdminName(d.name); })
      .catch(() => {});
  }, [id, isNew]);

  const set = (key: keyof Form, val: string) => {
    setForm((prev) => {
      const next = { ...prev, [key]: val };
      if (key === "title" && !slugManual) {
        next.slug = slugify(val);
      }
      return next;
    });
  };

  /* ── Image upload handler for TipTap ── */
  const handleEditorImageUpload = async (
    file: File
  ): Promise<string | null> => {
    if (!isImageFile(file)) {
      setMsg("Hata: Sadece jpg, png, webp ve gif formatları kabul edilir");
      return null;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMsg("Hata: Dosya boyutu 10MB'dan büyük olamaz");
      return null;
    }
    setUploading(true);
    setMsg("");
    const result = await uploadFile(file, form.slug.trim() || "genel");
    setUploading(false);
    if ("error" in result) {
      setMsg(`Hata: ${result.error}`);
      return null;
    }
    return result.url;
  };

  /* ── Cover image upload ── */
  const handleCoverUpload = async (file: File) => {
    if (!isImageFile(file)) {
      setMsg("Hata: Sadece jpg, png, webp ve gif formatları kabul edilir");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMsg("Hata: Dosya boyutu 10MB'dan büyük olamaz");
      return;
    }
    setUploadingCover(true);
    setMsg("");
    const result = await uploadFile(file, form.slug.trim() || "genel");
    if ("error" in result) {
      setMsg(`Hata: ${result.error}`);
    } else {
      set("image", result.url);
    }
    setUploadingCover(false);
  };

  const deleteArticle = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/admin/icerikler");
      } else {
        const data = await res.json();
        setMsg(data.error || "Silme hatası");
        setShowDeleteModal(false);
      }
    } finally {
      setDeleting(false);
    }
  };

  const save = async (status?: string) => {
    setSaving(true);
    setMsg("");
    try {
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const body = {
        title: form.title,
        slug: form.slug,
        author: form.author,
        author_ig: form.author_ig,
        author_email: form.author_email,
        category: form.category,
        tags,
        image: form.image,
        description: form.description,
        content: form.content,
        status: status ?? form.status,
        date: form.date,
        hero_overlay_enabled: form.hero_overlay_enabled,
      };

      let res: Response;
      if (isNew) {
        res = await fetch("/api/admin/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch(`/api/admin/articles/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (res.ok) {
        if (isNew) {
          const { id: newId } = await res.json();
          setMsg("Yazı oluşturuldu!");
          router.push(`/admin/icerikler/${newId}`);
        } else {
          setMsg("Kaydedildi!");
          if (status) setForm((prev) => ({ ...prev, status }));
        }
      } else {
        const err = await res.json();
        setMsg(`Hata: ${err.error}`);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-warm-900/30">Yükleniyor...</div>
      </div>
    );
  }

  const inputCls =
    "w-full bg-white border border-warm-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition";

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-warm-900/40 mb-1">Admin Paneli</p>
        <h1 className="text-2xl font-bold text-warm-900">
          {isNew ? "Yeni Yazı" : "Yazı Düzenle"}
        </h1>
      </div>

      {/* Message */}
      {msg && (
        <div
          className={`text-sm px-4 py-2.5 rounded-xl mb-6 ${
            msg.startsWith("Hata")
              ? "bg-red-50 text-red-600"
              : "bg-green-50 text-green-700"
          }`}
        >
          {msg}
        </div>
      )}

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-warm-900/50 mb-1.5">
            Başlık
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Yazı başlığı..."
            className={inputCls}
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-xs font-medium text-warm-900/50 mb-1.5">
            Slug
          </label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => {
              setSlugManual(true);
              set("slug", e.target.value);
            }}
            placeholder="yazi-slug"
            className={inputCls}
          />
          {!slugManual && form.title && (
            <p className="text-xs text-warm-900/30 mt-1">
              Otomatik: {form.slug}
            </p>
          )}
        </div>

        {/* Author row */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-warm-900/50 mb-1.5">
              Yazar
            </label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => set("author", e.target.value)}
              placeholder="Yazar adı"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-warm-900/50 mb-1.5">
              Yazar Instagram (opsiyonel)
            </label>
            <input
              type="text"
              value={form.author_ig}
              onChange={(e) => set("author_ig", e.target.value)}
              placeholder="@kullanici"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-warm-900/50 mb-1.5">
              Yazar Email (opsiyonel)
            </label>
            <input
              type="email"
              value={form.author_email}
              onChange={(e) => set("author_email", e.target.value)}
              placeholder="email@ornek.com"
              className={inputCls}
            />
          </div>
        </div>

        {/* Category + Date row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-warm-900/50 mb-1.5">
              Kategori
            </label>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className={inputCls}
            >
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-warm-900/50 mb-1.5">
              Tarih
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-medium text-warm-900/50 mb-1.5">
            Etiketler (virgülle ayır)
          </label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => set("tags", e.target.value)}
            placeholder="Kültür & Sanat, Resim, Tarih"
            className={inputCls}
          />
        </div>

        {/* Cover Image with upload */}
        <div>
          <label className="block text-xs font-medium text-warm-900/50 mb-1.5">
            Kapak Görseli
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={form.image}
              onChange={(e) => set("image", e.target.value)}
              placeholder="/yazilar/gorsel.jpg veya tam URL"
              className={inputCls}
            />
            <input
              ref={coverFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCoverUpload(file);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => coverFileRef.current?.click()}
              disabled={uploadingCover}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium bg-warm-100 text-warm-900/70 rounded-xl hover:bg-warm-200 transition whitespace-nowrap disabled:opacity-50"
            >
              {uploadingCover ? <Spinner /> : <UploadIcon />}
              {uploadingCover ? "Yükleniyor" : "Yükle"}
            </button>
          </div>
          {form.image && (
            <div className="mt-2 rounded-xl overflow-hidden border border-warm-100 max-w-xs">
              <img
                src={form.image}
                alt="Kapak önizleme"
                className="w-full h-32 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-warm-900/50 mb-1.5">
            Spot / Açıklama
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Kısa açıklama..."
            rows={3}
            className={inputCls + " resize-y"}
          />
        </div>

        {/* Content — TipTap WYSIWYG / Source toggle */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-warm-900/50">
              İçerik
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSourceMode(false)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                  !sourceMode
                    ? "bg-warm-900 text-white"
                    : "bg-warm-100 text-warm-900/50 hover:text-warm-900/70"
                }`}
              >
                Editör
              </button>
              <button
                type="button"
                onClick={() => setSourceMode(true)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                  sourceMode
                    ? "bg-warm-900 text-white"
                    : "bg-warm-100 text-warm-900/50 hover:text-warm-900/70"
                }`}
              >
                Kaynak
              </button>
            </div>
          </div>

          {sourceMode ? (
            <textarea
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder="Markdown içerik..."
              rows={20}
              className={
                inputCls +
                " resize-y font-mono text-[13px] leading-relaxed min-h-[400px]"
              }
            />
          ) : (
            <TiptapEditor
              content={form.content}
              onChange={(md) => set("content", md)}
              onUploadImage={handleEditorImageUpload}
              uploading={uploading}
              placeholder="Yazı içeriğini yazın... Görsel yapıştırabilir veya sürükleyebilirsiniz."
              articleId={isNew ? undefined : id}
              suggestions={suggestions}
              onSuggestionsChange={setSuggestions}
              currentUserId={userId}
              currentUserRole={role}
              currentUserName={adminName}
            />
          )}
        </div>

        {/* Status toggle */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-warm-900/50">Durum:</span>
          <button
            onClick={() =>
              set(
                "status",
                form.status === "published" ? "draft" : "published"
              )
            }
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition ${
              form.status === "published"
                ? "bg-green-50 text-green-700"
                : "bg-yellow-50 text-yellow-700"
            }`}
          >
            {form.status === "published" ? "Yayında" : "Taslak"}
          </button>
        </div>

        {/* Hero overlay toggle */}
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-warm-900/50">Cover image overlay başlık (Aeon stili):</span>
            <button
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  hero_overlay_enabled: !prev.hero_overlay_enabled,
                }))
              }
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition ${
                form.hero_overlay_enabled
                  ? "bg-coral/10 text-coral"
                  : "bg-warm-100 text-warm-900/40"
              }`}
            >
              {form.hero_overlay_enabled ? "Açık" : "Kapalı"}
            </button>
          </div>
          <p className="text-[11px] text-warm-900/30 mt-1 max-w-lg leading-relaxed">
            Açıkken: başlık ve açıklama görselin üzerinde, sinematik görünüm. Tabloları rahatsız edebilir, sadece atmosferik görsellerde önerilir. Kapalıyken: başlık görselin altında, sade akış.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-warm-100">
          <button
            onClick={() => save()}
            disabled={saving || !form.title || !form.slug}
            className="px-5 py-2.5 text-sm font-medium bg-coral text-white rounded-xl hover:bg-coral/90 transition disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
          {form.status !== "published" && (
            <button
              onClick={() => save("published")}
              disabled={saving || !form.title || !form.slug}
              className="px-5 py-2.5 text-sm font-medium bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-50"
            >
              {saving ? "..." : "Kaydet & Yayınla"}
            </button>
          )}
          <button
            onClick={() => router.push("/admin/icerikler")}
            className="px-5 py-2.5 text-sm font-medium text-warm-900/50 hover:text-warm-900 transition"
          >
            Geri Dön
          </button>
          {/* Delete — admin only, not for new articles */}
          {isAdminRole && !isNew && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="ml-auto px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition"
            >
              Sil
            </button>
          )}
        </div>

        {/* Delete confirmation modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
              <h3 className="text-lg font-bold text-warm-900 mb-2">
                Yazıyı Sil
              </h3>
              <p className="text-sm text-warm-900/60 mb-1">
                Bu yazıyı kalıcı olarak silmek istediğinize emin misiniz?
              </p>
              <p className="text-sm font-medium text-warm-900 mb-6">
                &ldquo;{form.title}&rdquo;
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-warm-900/60 hover:text-warm-900 transition"
                >
                  Vazgeç
                </button>
                <button
                  onClick={deleteArticle}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 transition disabled:opacity-50"
                >
                  {deleting ? "Siliniyor..." : "Evet, Sil"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
