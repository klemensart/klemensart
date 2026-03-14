"use client";

import { useState } from "react";
import { WEEKS } from "@/lib/workshop/curriculum";

type Action = "download" | "upload";

export default function MateryallerPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handlePDF(weekNumber: number, action: Action) {
    const key = `pdf-${action}-${weekNumber}`;
    setLoading(key);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/workshop/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekNumber, upload: action === "upload" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "İşlem başarısız");
      }

      if (action === "download") {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `modern-sanat-hafta-${weekNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        setMessage({ type: "success", text: `Hafta ${weekNumber} PDF indirildi.` });
      } else {
        const data = await res.json();
        setMessage({
          type: "success",
          text: `Hafta ${weekNumber} PDF yüklendi ve Loca'da görünür. URL: ${data.pdfUrl}`,
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Hata oluştu" });
    } finally {
      setLoading(null);
    }
  }

  async function handlePPTX(weekNumber: number) {
    const key = `pptx-${weekNumber}`;
    setLoading(key);
    setMessage(null);

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
      setMessage({ type: "success", text: `Hafta ${weekNumber} PPTX indirildi.` });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Hata oluştu" });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-xs text-warm-900/40 mb-1">Admin Paneli</p>
        <h1 className="text-2xl font-bold text-warm-900">Materyal Yönetimi</h1>
        <p className="text-warm-900/50 text-sm mt-1">
          PPTX sunumları ve haftalık PDF&apos;leri oluşturup yönetin
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {WEEKS.map((week) => (
          <div
            key={week.weekNumber}
            className="bg-white rounded-2xl border border-warm-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            {/* Sol: Hafta bilgisi */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 text-amber-700 text-sm font-bold shrink-0">
                {week.weekNumber}
              </span>
              <div className="min-w-0">
                <h3 className="font-semibold text-warm-900 text-[15px] truncate">
                  {week.title}
                </h3>
                <p className="text-xs text-warm-900/40 truncate">
                  {week.subtitle} • {week.dateRange}
                </p>
              </div>
            </div>

            {/* Sağ: Aksiyonlar */}
            <div className="flex flex-wrap gap-2 shrink-0">
              {/* PPTX İndir */}
              <button
                onClick={() => handlePPTX(week.weekNumber)}
                disabled={loading !== null}
                className="px-3.5 py-2 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === `pptx-${week.weekNumber}` ? "..." : "PPTX"}
              </button>

              {/* PDF İndir */}
              <button
                onClick={() => handlePDF(week.weekNumber, "download")}
                disabled={loading !== null}
                className="px-3.5 py-2 rounded-lg text-xs font-medium bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === `pdf-download-${week.weekNumber}` ? "..." : "PDF İndir"}
              </button>

              {/* PDF → Loca'ya Yükle */}
              <button
                onClick={() => handlePDF(week.weekNumber, "upload")}
                disabled={loading !== null}
                className="px-3.5 py-2 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === `pdf-upload-${week.weekNumber}` ? "..." : "Loca'ya Yükle"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
