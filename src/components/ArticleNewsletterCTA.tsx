"use client";

import { useState } from "react";

export default function ArticleNewsletterCTA({ darkMode }: { darkMode: boolean }) {
  const [email, setEmail] = useState("");
  const [kvkk, setKvkk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !kvkk) return;
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Bir hata oluştu.");
      } else {
        setStatus("success");
        setMessage(data.message);
        setEmail("");
      }
    } catch {
      setStatus("error");
      setMessage("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "success") {
    return (
      <div
        className={`mx-auto px-6 mb-16 ${darkMode ? "" : ""}`}
        style={{ maxWidth: "680px" }}
      >
        <div
          className={`rounded-2xl p-8 text-center border ${
            darkMode
              ? "bg-emerald-500/10 border-emerald-400/20"
              : "bg-emerald-50 border-emerald-200/50"
          }`}
        >
          <div className="inline-flex items-center gap-2 text-emerald-500 font-medium">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            {message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-6 mb-16" style={{ maxWidth: "680px" }}>
      <div
        className={`rounded-2xl p-8 border ${
          darkMode
            ? "bg-[#242424] border-[#f5f0eb]/10"
            : "bg-[#FFF8F5] border-warm-200/60"
        }`}
      >
        <div className="flex items-start gap-4 mb-5">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${darkMode ? "bg-coral/20" : "bg-coral/10"}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6D60" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <div>
            <h3 className={`font-bold text-base mb-1 ${darkMode ? "text-[#f5f0eb]" : "text-warm-900"}`}>
              Bu tür yazıları kaçırmayın
            </h3>
            <p className={`text-sm leading-relaxed ${darkMode ? "text-[#f5f0eb]/50" : "text-warm-900/50"}`}>
              Her hafta kültür, sanat ve felsefe üzerine seçilmiş içerikler — doğrudan e-posta kutunuza.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e-posta adresiniz"
              required
              disabled={loading}
              className={`flex-1 px-5 py-3 rounded-xl text-sm border transition-all focus:outline-none focus:border-coral disabled:opacity-50 ${
                darkMode
                  ? "bg-[#1a1a1a] border-[#f5f0eb]/10 text-[#f5f0eb] placeholder-[#f5f0eb]/30"
                  : "bg-white border-warm-200 text-warm-900 placeholder-warm-900/30"
              }`}
            />
            <button
              type="submit"
              disabled={loading || !kvkk}
              className="px-6 py-3 bg-coral text-white text-sm font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all whitespace-nowrap disabled:opacity-50"
            >
              {loading ? "..." : "Abone Ol"}
            </button>
          </div>

          <label className="flex items-start gap-2.5 mt-3 cursor-pointer">
            <input
              type="checkbox"
              checked={kvkk}
              onChange={(e) => setKvkk(e.target.checked)}
              className="mt-0.5 w-3.5 h-3.5 flex-shrink-0 accent-coral rounded"
            />
            <span className={`text-[11px] leading-relaxed ${darkMode ? "text-[#f5f0eb]/30" : "text-warm-900/35"}`}>
              <a href="/kvkk" target="_blank" rel="noopener noreferrer" className="text-coral/60 underline underline-offset-2 hover:text-coral">
                KVKK Aydınlatma Metni
              </a>
              &apos;ni okudum, e-posta adresimin bülten amacıyla işlenmesini kabul ediyorum.
            </span>
          </label>
        </form>

        {status === "error" && (
          <p className="mt-3 text-red-400 text-xs font-medium">{message}</p>
        )}
      </div>
    </div>
  );
}
