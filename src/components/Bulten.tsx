"use client";

import { useState } from "react";

export default function Bulten() {
  const [email, setEmail] = useState("");
  const [kvkkChecked, setKvkkChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !kvkkChecked) return;

    setLoading(true);
    setStatus("idle");

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
      setMessage("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="bulten" className="py-24 px-6 bg-warm-900">
      <div className="max-w-3xl mx-auto text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-coral/20 rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-coral flex-shrink-0" />
          <span className="text-sm font-semibold text-coral">E-bülten</span>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
          Kültür dünyanızı<br />
          her hafta zenginleştirin
        </h2>

        <p className="text-white/55 text-lg max-w-xl mx-auto mb-12 leading-relaxed">
          Sanat, sinema, felsefe ve psikoloji üzerine tematik içerikler, etkinlik duyuruları ve
          özel okuma listeleri — doğrudan e-posta kutunuza.
        </p>

        {status === "success" ? (
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 font-medium">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e-posta adresiniz"
                required
                disabled={loading}
                className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/15 text-white placeholder-white/35 focus:outline-none focus:border-coral focus:bg-white/15 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !kvkkChecked}
                className="px-8 py-4 bg-coral text-white font-semibold rounded-full hover:opacity-90 active:scale-95 transition-all whitespace-nowrap disabled:opacity-50"
              >
                {loading ? "Gönderiliyor..." : "Abone Ol"}
              </button>
            </div>

            {/* KVKK onay kutusu */}
            <label className="flex items-start gap-3 text-left mt-4 cursor-pointer max-w-sm mx-auto">
              <input
                type="checkbox"
                checked={kvkkChecked}
                onChange={(e) => setKvkkChecked(e.target.checked)}
                className="mt-0.5 w-4 h-4 flex-shrink-0 accent-coral rounded"
              />
              <span className="text-white/40 text-xs leading-relaxed">
                Kişisel verilerimin işlenmesine ilişkin{" "}
                <a
                  href="/kvkk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-coral/70 underline underline-offset-2 hover:text-coral"
                >
                  KVKK Aydınlatma Metni
                </a>
                &apos;ni okudum ve e-posta adresimin bülten gönderimi amacıyla
                işlenmesini kabul ediyorum.
              </span>
            </label>
          </form>
        )}

        {status === "error" && (
          <p className="mt-4 text-red-400 text-sm font-medium">{message}</p>
        )}

        <p className="mt-6 text-white/25 text-sm">
          İstediğiniz zaman aboneliğinizi iptal edebilirsiniz. Spam yok, söz.
        </p>
      </div>
    </section>
  );
}
