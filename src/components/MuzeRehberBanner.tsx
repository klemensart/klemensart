"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PDF_URL =
  "https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/rehberler/muzede-1-saat-istanbul-arkeoloji.pdf";

const SCROLL_THRESHOLD = 0.4;
const TIMER_MS = 20_000;
const DISMISS_COOKIE = "muzede1saat_dismissed";
const SUBSCRIBED_COOKIE = "muzede1saat_subscribed";

function hasCookie(name: string) {
  return document.cookie.includes(name + "=1");
}

function setCookie(name: string, days: number) {
  document.cookie = `${name}=1; max-age=${days * 86400}; path=/`;
}

export default function MuzeRehberBanner() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [kvkkChecked, setKvkkChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [pdfUrl, setPdfUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const show = useCallback(() => setVisible(true), []);

  useEffect(() => {
    if (hasCookie(DISMISS_COOKIE) || hasCookie(SUBSCRIBED_COOKIE)) return;

    const timer = setTimeout(show, TIMER_MS);

    function onScroll() {
      const scrolled =
        window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrolled >= SCROLL_THRESHOLD) {
        show();
        window.removeEventListener("scroll", onScroll);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [show]);

  function dismiss() {
    setVisible(false);
    setCookie(DISMISS_COOKIE, 30);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!kvkkChecked || !email) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "muzede1saat" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Bir hata oluştu.");
        setStatus("error");
        return;
      }

      setPdfUrl(data.pdfUrl || PDF_URL);
      setStatus("success");
      setCookie(SUBSCRIBED_COOKIE, 365);

      // Auto-close after 8 seconds
      setTimeout(() => setVisible(false), 8000);
    } catch {
      setErrorMsg("Bağlantı hatası. Lütfen tekrar deneyin.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-50 w-auto sm:w-[380px] rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Background image + overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/images/muzede1saat-banner.webp?v=2)" }}
          />
          <div className="absolute inset-0 bg-[#FFFBF7]/90" />

          <div className="relative p-6">
            {status === "idle" || status === "error" ? (
              <>
                {/* Close button */}
                <button
                  onClick={dismiss}
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors text-gray-500 hover:text-gray-800"
                  aria-label="Kapat"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>

                <p className="text-sm font-semibold text-[#FF6D60] tracking-wide uppercase mb-1">
                  Müzede 1 Saat
                </p>
                <h3 className="text-xl font-extrabold text-[#2D2926] leading-tight mb-2">
                  Binlerce Eser Arasında Kaybolmayın!
                </h3>
                <p className="text-sm text-[#2D2926] leading-relaxed mb-4">
                  İstanbul Arkeoloji Müzesi için hazırladığımız rehberi ücretsiz indirin.
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="email"
                    required
                    placeholder="E-posta adresiniz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-[#2D2926] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6D60]/30 focus:border-[#FF6D60] transition-colors"
                  />

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={kvkkChecked}
                      onChange={(e) => setKvkkChecked(e.target.checked)}
                      className="mt-0.5 accent-[#FF6D60]"
                    />
                    <span className="text-xs text-gray-500 leading-relaxed">
                      <a
                        href="/kvkk"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-[#FF6D60]"
                      >
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
                    className="w-full py-3 rounded-xl bg-[#FF6D60] text-white text-sm font-semibold tracking-wide uppercase transition-all hover:bg-[#e55a4e] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Gönderiliyor..." : "Ücretsiz Rehberi Al"}
                  </button>
                </form>
              </>
            ) : (
              /* Success state */
              <div className="text-center py-2">
                <button
                  onClick={() => setVisible(false)}
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors text-gray-500 hover:text-gray-800"
                  aria-label="Kapat"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#2D2926] mb-1">
                  Rehberiniz Hazır!
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  PDF e-postanıza gönderildi. Hemen indirmek için:
                </p>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF6D60] text-white text-sm font-semibold tracking-wide uppercase transition-all hover:bg-[#e55a4e]"
                >
                  PDF&apos;i İndir
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3v8m0 0l-3-3m3 3l3-3M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
