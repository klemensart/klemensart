"use client";

import { useState } from "react";
import { useDesignStore } from "../hooks/useDesignStore";

export default function ImagesPanel() {
  const addObject = useDesignStore((s) => s.addObject);
  const selectedId = useDesignStore((s) => s.selectedId);
  const objects = useDesignStore((s) => s.objects);
  const updateObject = useDesignStore((s) => s.updateObject);
  const pushHistory = useDesignStore((s) => s.pushHistory);
  const [uploading, setUploading] = useState(false);

  const selected = objects.find((o) => o.id === selectedId && o.type === "image");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

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

      addObject({
        type: "image",
        x: 80,
        y: 70,
        width: 920,
        height: 640,
        src: url,
        opacity: 1,
        rotation: 0,
      });
    } catch (err) {
      console.error("Upload error:", err);
      alert("Görsel yüklenirken hata oluştu.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="p-4 space-y-5">
      <div>
        <h3 className="text-xs font-semibold text-warm-900/50 uppercase tracking-wider mb-3">
          Görsel Yükle
        </h3>
        <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-warm-200 rounded-xl cursor-pointer hover:border-coral/40 hover:bg-coral/5 transition-colors">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-warm-900/30">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <span className="text-sm text-warm-900/50">
            {uploading ? "Yükleniyor…" : "Görsel seç veya sürükle"}
          </span>
          <span className="text-xs text-warm-900/30">PNG, JPG, WebP — Maks 10MB</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Edit selected image */}
      {selected && (
        <div className="border-t border-warm-100 pt-4 space-y-3">
          <h3 className="text-xs font-semibold text-warm-900/50 uppercase tracking-wider">
            Görsel Düzenle
          </h3>

          {/* Size */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-warm-900/60 mb-1 block">Genişlik</label>
              <input
                type="number"
                min={10}
                value={Math.round(selected.width || 300)}
                onChange={(e) => {
                  updateObject(selected.id, { width: Number(e.target.value) });
                  pushHistory();
                }}
                className="w-full px-3 py-2 border border-warm-100 rounded-lg text-sm bg-white text-warm-900"
              />
            </div>
            <div>
              <label className="text-xs text-warm-900/60 mb-1 block">Yükseklik</label>
              <input
                type="number"
                min={10}
                value={Math.round(selected.height || 300)}
                onChange={(e) => {
                  updateObject(selected.id, { height: Number(e.target.value) });
                  pushHistory();
                }}
                className="w-full px-3 py-2 border border-warm-100 rounded-lg text-sm bg-white text-warm-900"
              />
            </div>
          </div>

          {/* Corner radius */}
          <div>
            <label className="text-xs text-warm-900/60 mb-1 block">Köşe Yuvarlama</label>
            <input
              type="number"
              min={0}
              max={200}
              value={selected.cornerRadius || 0}
              onChange={(e) => {
                updateObject(selected.id, { cornerRadius: Number(e.target.value) });
                pushHistory();
              }}
              className="w-full px-3 py-2 border border-warm-100 rounded-lg text-sm bg-white text-warm-900"
            />
          </div>

          {/* Opacity */}
          <div>
            <label className="text-xs text-warm-900/60 mb-1 block">
              Opaklık: {Math.round((selected.opacity ?? 1) * 100)}%
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={selected.opacity ?? 1}
              onChange={(e) => updateObject(selected.id, { opacity: Number(e.target.value) })}
              onMouseUp={() => pushHistory()}
              className="w-full accent-coral"
            />
          </div>
        </div>
      )}
    </div>
  );
}
