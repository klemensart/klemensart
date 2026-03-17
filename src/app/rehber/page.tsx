import type { Metadata } from "next";
import MuzeRehberForm from "./MuzeRehberForm";

export const metadata: Metadata = {
  title: "Müzede 1 Saat Rehberi — Klemens Art",
  description:
    "Binlerce eser arasında kaybolmayın! İstanbul Arkeoloji Müzesi için hazırladığımız ücretsiz PDF rehberi indirin: önerilen rota, mutlaka görülmesi gereken eserler ve pratik bilgiler.",
  openGraph: {
    title: "Müzede 1 Saat Rehberi — Klemens Art",
    description:
      "Binlerce eser arasında kaybolmayın! Ücretsiz müze rehberimizi indirin.",
    url: "https://klemensart.com/rehber",
    type: "website",
    images: [
      {
        url: "https://klemensart.com/images/muzede1saat-banner.webp",
        width: 1200,
        height: 630,
        alt: "Müzede 1 Saat Rehberi — Klemens Art",
      },
    ],
  },
  alternates: {
    canonical: "https://klemensart.com/rehber",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Müzede 1 Saat Rehberi",
  description:
    "İstanbul Arkeoloji Müzesi için hazırlanmış ücretsiz PDF rehber. Önerilen rota, mutlaka görülmesi gereken eserler ve pratik bilgiler.",
  url: "https://klemensart.com/rehber",
  publisher: {
    "@type": "Organization",
    name: "Klemens Art",
    url: "https://klemensart.com",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "TRY",
    availability: "https://schema.org/InStock",
  },
};

const FEATURES = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" stroke="#FF6D60" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Optimize Edilmiş Rota",
    desc: "1 saatte en verimli şekilde gezebileceğiniz, uzman küratörlerin hazırladığı yol haritası.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="#FF6D60" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="3" stroke="#FF6D60" strokeWidth="1.5" />
        <path d="M3 8h18" stroke="#FF6D60" strokeWidth="1.5" />
      </svg>
    ),
    title: "Mutlaka Görülmesi Gereken Eserler",
    desc: "Kaçırmamanız gereken eserlerin hikayeleri ve neden önemli olduklarının kısa açıklamaları.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M12 8v4l3 3" stroke="#FF6D60" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="12" r="9" stroke="#FF6D60" strokeWidth="1.5" />
      </svg>
    ),
    title: "Pratik Bilgiler",
    desc: "Açılış saatleri, bilet fiyatları, ulaşım bilgileri ve müze içi ipuçları tek sayfada.",
  },
];

export default function RehberPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-[#FFFBF7]" style={{ fontFamily: "'Segoe UI','Helvetica Neue',sans-serif" }}>
        {/* ── HERO ── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF6D60]/5 via-transparent to-[#FF6D60]/3" />
          <div className="relative max-w-2xl mx-auto px-6 pt-28 pb-16 text-center">
            <span className="inline-block text-xs font-bold tracking-[3px] uppercase text-[#FF6D60] bg-[#FF6D60]/8 px-5 py-2 rounded-full mb-8">
              Ücretsiz PDF Rehber
            </span>
            <h1 className="text-[clamp(28px,6vw,48px)] font-extrabold text-[#2D2926] leading-[1.1] mb-5 tracking-tight">
              Binlerce Eser Arasında
              <br />
              <span className="text-[#FF6D60]">Kaybolmayın</span>
            </h1>
            <p className="text-lg text-[#5C524D] leading-relaxed mb-10 max-w-lg mx-auto">
              İstanbul Arkeoloji Müzesi için hazırladığımız rehberle{" "}
              <strong>1 saatte en önemli eserleri</strong> keşfedin.
            </p>
            <MuzeRehberForm id="hero-form" />
            <p className="text-xs text-[#9B918A] mt-6">
              191+ kişi indirdi &middot; 100% ücretsiz
            </p>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-center text-2xl font-extrabold text-[#2D2926] mb-3">
            Rehberde Ne Var?
          </h2>
          <p className="text-center text-[#5C524D] mb-12 max-w-md mx-auto">
            Saatlerce dolaşmadan, en değerli eserleri en verimli şekilde görmeniz için tasarlandı.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-7 border border-[#E8E0D8] text-center hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#FF6D60]/8 flex items-center justify-center mx-auto mb-4">
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-[#2D2926] mb-2">{f.title}</h3>
                <p className="text-sm text-[#5C524D] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECOND CTA ── */}
        <section className="bg-gradient-to-br from-[#FF6D60]/6 to-transparent py-16">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-2xl font-extrabold text-[#2D2926] mb-3">
              Hemen İndirin
            </h2>
            <p className="text-[#5C524D] mb-8 max-w-md mx-auto">
              E-postanızı bırakın, rehberiniz anında gönderilsin.
            </p>
            <MuzeRehberForm id="bottom-form" />
          </div>
        </section>

        {/* ── SOCIAL PROOF ── */}
        <section className="max-w-2xl mx-auto px-6 py-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-[#FF6D60]/30 to-[#FF6D60]/10"
                />
              ))}
            </div>
            <span className="text-sm font-bold text-[#2D2926]">191+ kişi</span>
          </div>
          <p className="text-sm text-[#9B918A]">
            Sanat severler müze deneyimlerini bu rehberle dönüştürüyor.
          </p>
        </section>
      </div>
    </>
  );
}
