"use client";

import { useState } from "react";

export default function SignupCTA() {
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
    <section className="py-20 px-6 bg-warm-900">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Bu tür içerikleri kaçırmayın
        </h2>
        <p className="text-white/50 text-lg mb-10 max-w-lg mx-auto">
          E-bültenimize abone olun, her hafta kültür-sanat dünyasından seçilmiş içerikler e-posta kutunuza gelsin.
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
                aria-label="E-posta adresiniz"
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

            {status === "error" && (
              <p className="mt-4 text-red-400 text-sm font-medium">{message}</p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
