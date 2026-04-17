"use client";

import { useState, type FormEvent } from "react";

const PDF_URL =
  "https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/rehberler/bodrum-sualti-arkeoloji-muzesi.pdf";

export default function BodrumRehberForm({ id }: { id?: string }) {
  const [email, setEmail] = useState("");
  const [kvkkChecked, setKvkkChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [pdfUrl, setPdfUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!kvkkChecked || !email) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "bodrum-muze-rehberi" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Bir hata oluştu.");
        setStatus("error");
        return;
      }

      setPdfUrl(data.pdfUrl || PDF_URL);
      setStatus("success");
    } catch {
      setErrorMsg("Bağlantı hatası. Lütfen tekrar deneyin.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  if (status === "success") {
    return (
      <div id={id} className="w-full max-w-md mx-auto text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[#2D2926] mb-2">Rehberiniz Hazır!</h3>
        <p className="text-sm text-[#5C524D] mb-5">PDF e-postanıza gönderildi. Hemen indirmek için:</p>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FF6D60] text-white text-sm font-semibold tracking-wide uppercase transition-all hover:bg-[#e55a4e] shadow-lg"
        >
          PDF&apos;i İndir
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v8m0 0l-3-3m3 3l3-3M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    );
  }

  return (
    <form id={id} onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4">
      <input
        type="email"
        required
        placeholder="E-posta adresiniz"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-white text-base text-[#2D2926] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6D60]/30 focus:border-[#FF6D60] transition-colors"
      />

      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={kvkkChecked}
          onChange={(e) => setKvkkChecked(e.target.checked)}
          className="mt-0.5 accent-[#FF6D60]"
        />
        <span className="text-xs text-gray-500 leading-relaxed">
          <a href="/kvkk" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#FF6D60]">
            KVKK Aydınlatma Metni
          </a>
          &apos;ni okudum ve kabul ediyorum.
        </span>
      </label>

      {status === "error" && (
        <p className="text-xs text-red-500">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={loading || !kvkkChecked}
        className="w-full py-4 rounded-full bg-[#FF6D60] text-white text-base font-bold tracking-wide uppercase transition-all hover:bg-[#e55a4e] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#FF6D60]/20"
      >
        {loading ? "Gönderiliyor..." : "Ücretsiz Rehberi Al"}
      </button>
    </form>
  );
}
