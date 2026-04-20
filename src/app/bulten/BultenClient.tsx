"use client";

import NewsletterFormAeon from "@/components/NewsletterFormAeon";

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

export default function BultenClient() {
  return (
    <main>
      {/* ── Hero Section ── */}
      <section className="py-24 md:py-32 px-6 bg-warm-50">
        <div className="max-w-xl mx-auto">
          <NewsletterFormAeon source="landing" />
        </div>
      </section>

      {/* ── Neden Abone Ol ── */}
      <section className="py-20 px-6 bg-white">
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
                <p className="text-warm-900/50 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Alt CTA ── */}
      <section className="py-24 px-6 bg-warm-900">
        <div className="max-w-xl mx-auto">
          <NewsletterFormAeon source="landing" />
        </div>
      </section>
    </main>
  );
}
