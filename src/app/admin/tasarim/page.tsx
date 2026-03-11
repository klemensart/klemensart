"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PLATFORMS } from "@/components/admin/design-studio/lib/platforms";

type Design = {
  id: string;
  name: string;
  platform: string;
  width: number;
  height: number;
  thumbnail_url: string | null;
  updated_at: string;
};

export default function TasarimListPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState("İsimsiz Tasarım");
  const [newPlatform, setNewPlatform] = useState("instagram-post");
  const [customW, setCustomW] = useState(1080);
  const [customH, setCustomH] = useState(1080);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/designs")
      .then((r) => r.json())
      .then((d) => setDesigns(d.designs || []))
      .finally(() => setLoading(false));
  }, []);

  async function createDesign() {
    setCreating(true);
    const platform = PLATFORMS.find((p) => p.id === newPlatform);
    const width = newPlatform === "custom" ? customW : platform?.width || 1080;
    const height = newPlatform === "custom" ? customH : platform?.height || 1080;

    try {
      const res = await fetch("/api/admin/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          platform: newPlatform,
          width,
          height,
          canvas_data: { objects: [], backgroundColor: "#ffffff" },
        }),
      });
      const data = await res.json();
      if (data.id) {
        router.push(`/admin/tasarim/${data.id}`);
      }
    } catch {
      alert("Tasarım oluşturulurken hata oluştu.");
    } finally {
      setCreating(false);
    }
  }

  async function deleteDesign(id: string) {
    if (!confirm("Bu tasarımı silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/admin/designs/${id}`, { method: "DELETE" });
    setDesigns((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-warm-900">Tasarım Stüdyosu</h1>
          <p className="text-warm-900/50 text-sm mt-1">
            Sosyal medya görselleri ve duyurular oluşturun
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-coral text-white text-sm font-semibold rounded-xl hover:bg-coral/90 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Yeni Tasarım
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-coral border-t-transparent rounded-full animate-spin" />
        </div>
      ) : designs.length === 0 ? (
        <div className="text-center py-20">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-warm-900/20 mb-4">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <p className="text-warm-900/40">Henüz tasarım yok</p>
          <p className="text-warm-900/30 text-sm mt-1">
            Yeni bir tasarım oluşturarak başlayın
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {designs.map((d) => (
            <div
              key={d.id}
              className="border border-warm-100 rounded-2xl overflow-hidden bg-white hover:shadow-lg transition-shadow group"
            >
              <Link href={`/admin/tasarim/${d.id}`}>
                <div className="aspect-square bg-warm-50 flex items-center justify-center relative overflow-hidden">
                  {d.thumbnail_url ? (
                    <img
                      src={d.thumbnail_url}
                      alt={d.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-warm-900/15">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-4 flex items-start justify-between">
                <div className="min-w-0">
                  <Link
                    href={`/admin/tasarim/${d.id}`}
                    className="text-sm font-semibold text-warm-900 hover:text-coral transition-colors truncate block"
                  >
                    {d.name}
                  </Link>
                  <p className="text-xs text-warm-900/40 mt-0.5">
                    {d.width}×{d.height} ·{" "}
                    {new Date(d.updated_at).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => deleteDesign(d.id)}
                  className="p-1.5 rounded-lg text-warm-900/30 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                  title="Sil"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Design Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-bold text-warm-900 mb-4">Yeni Tasarım</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-warm-900/60 mb-1 block">Tasarım Adı</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-warm-100 rounded-xl text-sm bg-white text-warm-900 focus:outline-none focus:border-coral"
                />
              </div>

              <div>
                <label className="text-sm text-warm-900/60 mb-1 block">Platform</label>
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  className="w-full px-4 py-2.5 border border-warm-100 rounded-xl text-sm bg-white text-warm-900 focus:outline-none focus:border-coral"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label} ({p.width}×{p.height})
                    </option>
                  ))}
                </select>
              </div>

              {newPlatform === "custom" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-warm-900/60 mb-1 block">Genişlik (px)</label>
                    <input
                      type="number"
                      min={100}
                      max={4000}
                      value={customW}
                      onChange={(e) => setCustomW(Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-warm-100 rounded-xl text-sm bg-white text-warm-900"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-warm-900/60 mb-1 block">Yükseklik (px)</label>
                    <input
                      type="number"
                      min={100}
                      max={4000}
                      value={customH}
                      onChange={(e) => setCustomH(Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-warm-100 rounded-xl text-sm bg-white text-warm-900"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2.5 text-sm text-warm-900/60 hover:text-warm-900 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={createDesign}
                disabled={creating || !newName.trim()}
                className="px-6 py-2.5 bg-coral text-white text-sm font-semibold rounded-xl hover:bg-coral/90 disabled:opacity-50 transition-colors"
              >
                {creating ? "Oluşturuluyor…" : "Oluştur"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
