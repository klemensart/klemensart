"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type DesignCard = {
  id: string;
  name: string;
  platform: string;
  width: number;
  height: number;
};

const PLATFORM_LABELS: Record<string, string> = {
  "instagram-post": "Feed Post",
  "instagram-story": "Story",
  "og-landscape": "Landscape",
};

const PLATFORM_DIMS: Record<string, string> = {
  "instagram-post": "1080 × 1080",
  "instagram-story": "1080 × 1920",
  "og-landscape": "1200 × 630",
};

export default function AtolyeSosyalMedyaSection({
  atolyeId,
}: {
  atolyeId: string;
}) {
  const [designs, setDesigns] = useState<DesignCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const fetchDesigns = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/admin/designs?linked_entity_id=${atolyeId}`
      );
      if (!res.ok) return;
      const data = await res.json();
      setDesigns(data.designs ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [atolyeId]);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await fetch("/api/admin/designs/auto-atolye-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ atolyeId }),
      });
      if (res.ok) {
        await fetchDesigns();
      }
    } catch {
      // ignore
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-10 border-t border-warm-900/10 pt-8">
        <h3 className="text-sm font-semibold text-warm-900/60 uppercase tracking-wider mb-4">
          Sosyal Medya Görselleri
        </h3>
        <div className="flex items-center gap-2 text-sm text-warm-900/40">
          <div className="w-4 h-4 border-2 border-coral border-t-transparent rounded-full animate-spin" />
          Yükleniyor...
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 border-t border-warm-900/10 pt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-warm-900/60 uppercase tracking-wider">
          Sosyal Medya Görselleri
        </h3>
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={regenerating}
          className="text-xs text-coral hover:text-coral/80 transition-colors disabled:opacity-50"
        >
          {regenerating ? "Üretiliyor..." : "Yeniden Üret"}
        </button>
      </div>

      {designs.length === 0 ? (
        <div className="text-sm text-warm-900/40">
          Henüz görsel üretilmemiş.{" "}
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={regenerating}
            className="text-coral hover:underline disabled:opacity-50"
          >
            {regenerating ? "Üretiliyor..." : "Şimdi üret"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {designs.map((d) => (
            <div
              key={d.id}
              className="border border-warm-900/10 rounded-lg p-4 flex flex-col gap-3"
            >
              {/* Format info */}
              <div>
                <div className="text-sm font-medium text-warm-900">
                  {PLATFORM_LABELS[d.platform] || d.platform}
                </div>
                <div className="text-xs text-warm-900/40">
                  {PLATFORM_DIMS[d.platform] || `${d.width}×${d.height}`}
                </div>
              </div>

              {/* Aspect ratio preview placeholder */}
              <div
                className="bg-warm-50 rounded border border-warm-900/5 flex items-center justify-center text-warm-900/20 text-xs"
                style={{
                  aspectRatio: `${d.width} / ${d.height}`,
                  maxHeight: 160,
                }}
              >
                Önizleme
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/tasarim/${d.id}`}
                  className="flex-1 text-center text-xs py-1.5 px-2 bg-coral/10 text-coral rounded hover:bg-coral/20 transition-colors"
                >
                  Stüdyoda Aç
                </Link>
                <a
                  href={`/api/admin/designs/${d.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs py-1.5 px-3 border border-warm-900/10 text-warm-900/60 rounded hover:border-warm-900/20 transition-colors"
                >
                  İndir
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
