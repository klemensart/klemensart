"use client";

import { useState, useMemo } from "react";
import { useDesignStore } from "../hooks/useDesignStore";

const CATEGORY_OPTIONS = ["ODAK", "KÜLTÜR & SANAT", "İLHAM VERENLER", "KENT & YAŞAM"] as const;

export default function StoryEditPanel() {
  const objects = useDesignStore((s) => s.objects);
  const updateObject = useDesignStore((s) => s.updateObject);
  const pushHistory = useDesignStore((s) => s.pushHistory);
  const [uploading, setUploading] = useState(false);

  // Obje eşleştirme
  const { imageObj, categoryObj, bodyObj, signatureObj } = useMemo(() => {
    let imageObj = objects.find((o) => o.type === "image");
    let categoryObj = objects.find(
      (o) => o.type === "text" && o.fontSize === 43 && (o.fill === "#ff6c5f" || (o.letterSpacing && o.letterSpacing >= 10))
    );
    let bodyObj = objects.find(
      (o) => o.type === "text" && o.fontSize === 40 && o.fontStyle === "normal"
    );
    let signatureObj = objects.find(
      (o) => o.type === "text" && o.fontStyle === "italic"
    );
    return { imageObj, categoryObj, bodyObj, signatureObj };
  }, [objects]);

  // Fotoğraf yükleme
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !imageObj) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Dosya boyutu 10MB'dan küçük olmalı.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "design-assets");
      formData.append("slug", "designs");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const { url } = await res.json();
      updateObject(imageObj.id, { src: url, cornerRadius: 16 });
      pushHistory();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Görsel yüklenirken hata oluştu.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  // İmza değerinden prefix'i çıkar
  const signatureValue = signatureObj?.text?.replace(/^—\s*/, "") ?? "";

  return (
    <div className="p-4 space-y-5">
      <h3 className="text-xs font-semibold text-warm-900/50 uppercase tracking-wider">
        Story Düzenle
      </h3>

      {/* 1. Fotoğraf */}
      {imageObj && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-warm-900/70 block">Fotoğraf</label>
          {imageObj.src && (
            <div className="relative w-full aspect-[880/620] rounded-lg overflow-hidden border border-warm-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageObj.src}
                alt="Story görseli"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <label className="flex items-center justify-center gap-2 px-3 py-2 text-sm border border-warm-200 rounded-lg cursor-pointer hover:border-coral/40 hover:bg-coral/5 transition-colors text-warm-900/60">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {uploading ? "Yükleniyor…" : "Değiştir"}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* 2. Kategori */}
      {categoryObj && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-warm-900/70 block">Kategori</label>
          <div className="grid grid-cols-2 gap-1.5">
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  updateObject(categoryObj.id, { text: cat });
                  pushHistory();
                }}
                className={`px-2 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  categoryObj.text === cat
                    ? "border-coral bg-coral/10 text-coral"
                    : "border-warm-100 text-warm-900/50 hover:border-warm-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Metin */}
      {bodyObj && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-warm-900/70 block">Metin</label>
          <textarea
            value={bodyObj.text ?? ""}
            onChange={(e) => updateObject(bodyObj.id, { text: e.target.value })}
            onBlur={() => pushHistory()}
            rows={4}
            className="w-full px-3 py-2 border border-warm-100 rounded-lg text-sm bg-white text-warm-900 resize-none focus:outline-none focus:border-coral/40"
          />
        </div>
      )}

      {/* 4. İmza */}
      {signatureObj && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-warm-900/70 block">İmza</label>
          <input
            type="text"
            value={signatureValue}
            onChange={(e) => {
              const val = e.target.value.trim();
              updateObject(signatureObj.id, { text: val ? `— ${val}` : "" });
            }}
            onBlur={() => pushHistory()}
            placeholder="KLEMENS"
            className="w-full px-3 py-2 border border-warm-100 rounded-lg text-sm bg-white text-warm-900 focus:outline-none focus:border-coral/40"
          />
          <p className="text-xs text-warm-900/40">Canvas'ta "— {signatureValue || "…"}" olarak görünür</p>
        </div>
      )}
    </div>
  );
}
