"use client";

import { useState } from "react";
import { WEEKS } from "@/lib/workshop/curriculum";

export default function SunumlarPage() {
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload(weekNumber: number) {
    setLoading(weekNumber);
    setError(null);

    try {
      const res = await fetch("/api/admin/workshop/pptx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekNumber }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "PPTX oluşturulamadı");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `modern-sanat-hafta-${weekNumber}.pptx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata oluştu");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-xs text-warm-900/40 mb-1">Admin Paneli</p>
        <h1 className="text-2xl font-bold text-warm-900">Sunum Oluşturucu</h1>
        <p className="text-warm-900/50 text-sm mt-1">
          Modern Sanat Atölyesi — 10 haftalık PPTX sunumları
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {WEEKS.map((week) => (
          <div
            key={week.weekNumber}
            className="bg-white rounded-2xl border border-warm-100 p-6 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-amber-50 text-amber-700 text-sm font-bold">
                {week.weekNumber}
              </span>
              <div>
                <h3 className="font-semibold text-warm-900 text-[15px]">{week.title}</h3>
                <p className="text-xs text-warm-900/40">{week.subtitle}</p>
              </div>
            </div>

            <p className="text-xs text-warm-900/50 mb-1">{week.dateRange}</p>
            <p className="text-xs text-warm-900/40 mb-4 line-clamp-2">
              {week.keyArtists.join(", ")}
            </p>

            <button
              onClick={() => handleDownload(week.weekNumber)}
              disabled={loading !== null}
              className="mt-auto w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-amber-50 text-amber-700 hover:bg-amber-100"
            >
              {loading === week.weekNumber ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Oluşturuluyor...
                </span>
              ) : (
                `Hafta ${week.weekNumber} PPTX İndir`
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
