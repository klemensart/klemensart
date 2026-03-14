"use client";

import { useState } from "react";
import Link from "next/link";

type Props = {
  subscriberCount: number;
  lastCampaign: {
    id: string;
    subject: string;
    htmlContent: string;
    createdAt: string;
  } | null;
};

function SignupForm() {
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

  if (status === "success") {
    return (
      <div className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 font-medium">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        {message}
      </div>
    );
  }

  return (
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
  );
}

const benefits = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    title: "Haftalık Kürasyon",
    desc: "Kültür-sanat dünyasından en önemli gelişmeleri sizin için derliyoruz.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    title: "Etkinlik Erken Erişim",
    desc: "Seminer, atölye ve sergi duyurularını herkesten önce öğrenin.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Tamamen Ücretsiz",
    desc: "Spam yok, reklam yok. İstediğiniz zaman çıkabilirsiniz.",
  },
];

export default function BultenClient({ subscriberCount, lastCampaign }: Props) {
  return (
    <main>
      {/* ── Hero Section ── */}
      <section className="py-24 md:py-32 px-6 bg-warm-900">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-coral/20 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-coral flex-shrink-0" />
            <span className="text-sm font-semibold text-coral">E-bülten</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
            Kültür dünyanızı<br />
            her hafta zenginleştirin
          </h1>

          <p className="text-white/55 text-lg max-w-xl mx-auto mb-12 leading-relaxed">
            Sanat, sinema, felsefe ve psikoloji üzerine tematik içerikler, etkinlik duyuruları ve
            özel okuma listeleri — doğrudan e-posta kutunuza.
          </p>

          <SignupForm />

          {subscriberCount > 10 && (
            <p className="mt-8 text-white/25 text-sm">
              {subscriberCount}+ kişi zaten abone
            </p>
          )}
        </div>
      </section>

      {/* ── Neden Abone Ol ── */}
      <section className="py-20 px-6 bg-warm-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-warm-900 text-center mb-12">
            Neden Abone Olmalısınız?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((b) => (
              <div key={b.title} className="text-center p-6">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-coral/10 flex items-center justify-center text-coral">
                  {b.icon}
                </div>
                <h3 className="text-lg font-semibold text-warm-900 mb-2">{b.title}</h3>
                <p className="text-warm-600 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Son Bülten Önizleme ── */}
      {lastCampaign && (
        <section className="py-20 px-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-warm-900 text-center mb-3">
              Son Bültenimiz
            </h2>
            <p className="text-warm-500 text-center mb-8">
              {lastCampaign.subject} &middot;{" "}
              {new Date(lastCampaign.createdAt).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <div className="border border-warm-200 rounded-2xl overflow-hidden bg-[#f7f5f2]">
              <iframe
                srcDoc={lastCampaign.htmlContent}
                title={lastCampaign.subject}
                className="w-full border-0"
                style={{ minHeight: 500 }}
                sandbox="allow-same-origin"
              />
            </div>
            <div className="text-center mt-6">
              <Link
                href="/bulten/arsiv"
                className="text-coral font-semibold text-sm hover:underline"
              >
                Tüm bültenleri görüntüle &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Alt CTA ── */}
      <section className="py-24 px-6 bg-warm-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-6">
            Hiçbir şeyi kaçırmayın
          </h2>
          <p className="text-white/55 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Kültür ve sanat dünyasının nabzını her hafta e-posta kutunuzda tutun.
          </p>
          <SignupForm />
          <p className="mt-6 text-white/25 text-sm">
            İstediğiniz zaman aboneliğinizi iptal edebilirsiniz. Spam yok, söz.
          </p>
        </div>
      </section>
    </main>
  );
}
