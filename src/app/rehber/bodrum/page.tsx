import type { Metadata } from "next";
import BodrumRehberForm from "./BodrumRehberForm";

export const metadata: Metadata = {
  title: "Bodrum Sualtı Arkeoloji Müzesi Rehberi — Klemens Art",
  description:
    "Bodrum Kalesi'ndeki Sualtı Arkeoloji Müzesi için hazırladığımız ücretsiz PDF rehberi indirin: önerilen rota, mutlaka görülmesi gereken eserler ve pratik bilgiler.",
  openGraph: {
    title: "Bodrum Sualtı Arkeoloji Müzesi Rehberi — Klemens Art",
    description:
      "Bodrum Kalesi'ndeki eşsiz koleksiyonu keşfedin! Ücretsiz müze rehberimizi indirin.",
    url: "https://klemensart.com/rehber/bodrum",
    type: "website",
    images: [
      {
        url: "https://klemensart.com/images/muzede1saat-banner.webp",
        width: 1200,
        height: 630,
        alt: "Bodrum Sualtı Arkeoloji Müzesi Rehberi — Klemens Art",
      },
    ],
  },
  alternates: {
    canonical: "https://klemensart.com/rehber/bodrum",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Bodrum Sualtı Arkeoloji Müzesi Rehberi",
  description:
    "Bodrum Kalesi'ndeki Sualtı Arkeoloji Müzesi için hazırlanmış ücretsiz PDF rehber. Önerilen rota, mutlaka görülmesi gereken eserler ve pratik bilgiler.",
  url: "https://klemensart.com/rehber/bodrum",
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
    desc: "Bodrum Kalesi'nin salonlarını en verimli şekilde gezebileceğiniz, uzman küratörlerin hazırladığı yol haritası.",
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
    desc: "Uluburun Batığı'ndan Cam Batığı'na, Karia Prensesi'nden antik amforalara — kaçırmamanız gereken eserlerin hikayeleri.",
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

export default function BodrumRehberPage() {
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
              Bodrum Sualtı Arkeoloji
              <br />
              <span className="text-[#FF6D60]">Müzesi Rehberi</span>
            </h1>
            <p className="text-lg text-[#5C524D] leading-relaxed mb-10 max-w-lg mx-auto">
              Bodrum Kalesi&apos;ndeki dünyanın en önemli sualtı arkeoloji koleksiyonunu keşfedin.{" "}
              <strong>Ücretsiz rehberimizle en önemli eserleri</strong> kaçırmayın.
            </p>
            <BodrumRehberForm id="hero-form" />
            <p className="text-xs text-[#9B918A] mt-6">
              100% ücretsiz &middot; Anında e-postanıza gelir
            </p>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-center text-2xl font-extrabold text-[#2D2926] mb-3">
            Rehberde Ne Var?
          </h2>
          <p className="text-center text-[#5C524D] mb-12 max-w-md mx-auto">
            Antik batıklar, cam eserler ve Karia Prensesi — hepsini en verimli şekilde görmeniz için tasarlandı.
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
            <BodrumRehberForm id="bottom-form" />
          </div>
        </section>

        {/* ── CONTEXT ── */}
        <section className="max-w-2xl mx-auto px-6 py-12 text-center">
          <p className="text-sm text-[#9B918A] leading-relaxed max-w-md mx-auto">
            Bodrum Sualtı Arkeoloji Müzesi, St. Peter Kalesi içinde yer alan ve dünyanın en önemli sualtı arkeoloji koleksiyonlarından birini barındıran eşsiz bir müzedir.
          </p>
        </section>
      </div>
    </>
  );
}
