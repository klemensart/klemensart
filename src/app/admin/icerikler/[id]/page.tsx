"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

/* ── Icons ── */
const ImageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
  </svg>
);

const UploadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const Spinner = () => (
  <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
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

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const contentFileRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // Preview state
  const [contentTab, setContentTab] = useState<"write" | "preview">("write");
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

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
        });
        setSlugManual(true);
      } finally {
        setLoading(false);
      }
    })();
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

  /* ── Insert image markdown at cursor position ── */
  const insertImageAtCursor = useCallback(
    (url: string, fileName: string) => {
      const ta = contentRef.current;
      const md = `![${fileName}](${url})`;
      if (ta) {
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const before = form.content.slice(0, start);
        const after = form.content.slice(end);
        const newContent = `${before}\n${md}\n${after}`;
        setForm((prev) => ({ ...prev, content: newContent }));
        // Restore cursor after the inserted text
        requestAnimationFrame(() => {
          const pos = start + md.length + 2;
          ta.setSelectionRange(pos, pos);
          ta.focus();
        });
      } else {
        setForm((prev) => ({
          ...prev,
          content: prev.content + `\n${md}\n`,
        }));
      }
    },
    [form.content]
  );

  /* ── Upload for content textarea ── */
  const handleContentUpload = async (file: File) => {
    if (!isImageFile(file)) {
      setMsg("Hata: Sadece jpg, png, webp ve gif formatları kabul edilir");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMsg("Hata: Dosya boyutu 5MB'dan büyük olamaz");
      return;
    }
    setUploading(true);
    setMsg("");
    const result = await uploadFile(file, form.slug || "genel");
    if ("error" in result) {
      setMsg(`Hata: ${result.error}`);
    } else {
      insertImageAtCursor(result.url, file.name);
    }
    setUploading(false);
  };

  /* ── Upload for cover image ── */
  const handleCoverUpload = async (file: File) => {
    if (!isImageFile(file)) {
      setMsg("Hata: Sadece jpg, png, webp ve gif formatları kabul edilir");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMsg("Hata: Dosya boyutu 5MB'dan büyük olamaz");
      return;
    }
    setUploadingCover(true);
    setMsg("");
    const result = await uploadFile(file, form.slug || "genel");
    if ("error" in result) {
      setMsg(`Hata: ${result.error}`);
    } else {
      set("image", result.url);
    }
    setUploadingCover(false);
  };

  /* ── Drag & Drop handlers ── */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && isImageFile(file)) {
      handleContentUpload(file);
    }
  };

  /* ── Preview fetch ── */
  const fetchPreview = async () => {
    setPreviewLoading(true);
    try {
      const res = await fetch("/api/admin/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: form.content }),
      });
      if (res.ok) {
        const { html } = await res.json();
        setPreviewHtml(html);
      }
    } finally {
      setPreviewLoading(false);
    }
  };

  const switchToPreview = () => {
    setContentTab("preview");
    fetchPreview();
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

        {/* Content with tabs */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setContentTab("write")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                  contentTab === "write"
                    ? "bg-warm-900 text-white"
                    : "bg-warm-100 text-warm-900/50 hover:text-warm-900/70"
                }`}
              >
                Yazım
              </button>
              <button
                type="button"
                onClick={switchToPreview}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                  contentTab === "preview"
                    ? "bg-warm-900 text-white"
                    : "bg-warm-100 text-warm-900/50 hover:text-warm-900/70"
                }`}
              >
                Önizleme
              </button>
            </div>
            {contentTab === "write" && (
              <div className="flex items-center gap-2">
                {uploading && (
                  <span className="flex items-center gap-1.5 text-xs text-coral">
                    <Spinner /> Görsel yükleniyor...
                  </span>
                )}
                <input
                  ref={contentFileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleContentUpload(file);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => contentFileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-warm-100 text-warm-900/60 rounded-lg hover:bg-warm-200 transition disabled:opacity-50"
                >
                  <ImageIcon />
                  Görsel Ekle
                </button>
              </div>
            )}
          </div>

          {contentTab === "write" ? (
            <div className="relative">
              <textarea
                ref={contentRef}
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                placeholder="Yazı içeriğini markdown formatında yazın... Görsel sürükleyip bırakabilirsiniz."
                rows={20}
                className={
                  inputCls +
                  " resize-y font-mono text-[13px] leading-relaxed" +
                  (dragOver ? " ring-2 ring-coral/40 border-coral" : "")
                }
              />
              {dragOver && (
                <div className="absolute inset-0 bg-coral/5 rounded-xl flex items-center justify-center pointer-events-none">
                  <div className="bg-white/90 px-4 py-2 rounded-xl text-sm font-medium text-coral shadow-sm">
                    Görseli bırakın
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              className="w-full bg-white border border-warm-200 rounded-xl px-6 py-5 text-sm min-h-[480px] overflow-y-auto prose prose-warm max-w-none
                prose-headings:text-warm-900 prose-headings:font-bold
                prose-p:text-warm-900/80 prose-p:leading-relaxed
                prose-a:text-coral prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl prose-img:max-w-full
                prose-blockquote:border-l-coral prose-blockquote:text-warm-900/60
                prose-strong:text-warm-900"
            >
              {previewLoading ? (
                <div className="flex items-center justify-center py-12 text-warm-900/30">
                  <Spinner /> <span className="ml-2">Önizleme yükleniyor...</span>
                </div>
              ) : previewHtml ? (
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              ) : (
                <p className="text-warm-900/30">İçerik boş</p>
              )}
            </div>
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
        </div>
      </div>
    </div>
  );
}
