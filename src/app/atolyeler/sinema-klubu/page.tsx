import { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SatinAlButton from "@/components/SatinAlButton";
import { SLUG_TO_ATOLYE } from "@/lib/atolyeler-config";

const B = {
  coral: "#FF6D60",
  cream: "#FFFBF7",
  dark: "#2D2926",
  warm: "#8C857E",
  light: "#F5F0EB",
};

/* ─── SEO ──────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "Sinema Kulübü — Klemens Art",
  description:
    "400 kişilik sinema kulübümüze katılın. Ayda 1 Zoom buluşma, 90 dakika derinlemesine sinema sohbeti. Tekli veya yıllık paket seçenekleriyle.",
  alternates: { canonical: "/atolyeler/sinema-klubu" },
  keywords: [
    "sinema kulübü",
    "film analizi",
    "sinema sohbeti",
    "film tartışması",
    "zoom sinema",
    "klemens art",
    "online sinema kulübü",
  ],
  openGraph: {
    title: "Sinema Kulübü — Klemens Art",
    description:
      "Ayda 1 Zoom buluşma, 90 dakika derinlemesine sinema sohbeti.",
    url: "https://klemensart.com/atolyeler/sinema-klubu",
    type: "website",
    images: [
      {
        url: "/api/og?title=Sinema%20Kul%C3%BCb%C3%BC&subtitle=Ayda%201%20Zoom%20bulu%C5%9Fma%2C%2090%20dakika%20sinema%20sohbeti&category=Sinema",
        width: 1200,
        height: 630,
        alt: "Sinema Kulübü — Klemens Art",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sinema Kulübü — Klemens Art",
    description:
      "Ayda 1 Zoom buluşma, 90 dakika derinlemesine sinema sohbeti.",
  },
};

/* ─── Fiyat kartı verileri ─────────────────────────── */

const PLANS = [
  {
    slug: "sinema-klubu-tekli",
    label: "Tekli Oturum",
    price: "400 TL",
    sub: "Tek buluşma",
    badge: null,
    highlight: false,
  },
  {
    slug: "sinema-klubu-tekli-ogrenci",
    label: "Tekli Oturum — Öğrenci",
    price: "150 TL",
    sub: "Tek buluşma",
    badge: "Öğrenci",
    highlight: false,
  },
  {
    slug: "sinema-klubu-yillik",
    label: "Yıllık Paket",
    price: "3.600 TL",
    sub: "12 oturum · ayda 300 TL",
    badge: "%25 İndirim",
    highlight: true,
  },
  {
    slug: "sinema-klubu-yillik-ogrenci",
    label: "Yıllık Paket — Öğrenci",
    price: "1.350 TL",
    sub: "12 oturum · ayda 112,50 TL",
    badge: "%25 İndirim",
    highlight: false,
  },
] as const;

const FAQ = [
  {
    q: "Buluşmalar ne zaman yapılıyor?",
    a: "Her ayın belirlenen gününde, akşam 21:00'de Zoom üzerinden canlı olarak gerçekleşiyor. Tarihler önceden duyuruluyor.",
  },
  {
    q: "Bir buluşma ne kadar sürüyor?",
    a: "Ortalama 90 dakika. Film analizi, tartışma ve soru-cevap bölümlerinden oluşuyor.",
  },
  {
    q: "Yıllık pakette kaçırırsam ne olur?",
    a: "Katılamadığınız oturumların kaydını sonradan izleyebilirsiniz.",
  },
  {
    q: "Öğrenci indirimi için ne gerekiyor?",
    a: "Geçerli bir öğrenci belgesi (e-devlet veya öğrenci kimliği fotoğrafı) yeterlidir. Satın alma sonrası info@klemensart.com adresine gönderebilirsiniz.",
  },
  {
    q: "WhatsApp grubuna nasıl katılırım?",
    a: "Satın alma işleminiz tamamlandıktan sonra WhatsApp grup davet linki e-posta ile gönderilir.",
  },
];

/* ─── Sayfa ────────────────────────────────────────── */

export default function SinemaKlubuPage() {
  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Sinema Kulübü",
    description:
      "Aylık Zoom sinema buluşması — film analizi, tartışma ve derinlemesine sinema sohbeti.",
    provider: {
      "@type": "Organization",
      name: "Klemens Art",
      url: "https://klemensart.com",
    },
    deliveryMode: "online",
    offers: [
      {
        "@type": "Offer",
        name: "Tekli Oturum",
        price: "400",
        priceCurrency: "TRY",
      },
      {
        "@type": "Offer",
        name: "Yıllık Paket (12 Oturum)",
        price: "3600",
        priceCurrency: "TRY",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <Navbar dark />
      <main style={{ background: B.cream, minHeight: "100vh" }}>
        {/* ═══ HERO ═══════════════════════════════════ */}
        <section
          style={{
            position: "relative",
            minHeight: 480,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #1a1a2e 100%)",
          }}
        >
          {/* Film reel decorative circles */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.07,
              backgroundImage:
                "radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 30%, #fff 1px, transparent 1px), radial-gradient(circle at 60% 80%, #fff 1.5px, transparent 1.5px)",
              backgroundSize: "60px 60px, 80px 80px, 100px 100px",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 2,
              textAlign: "center",
              padding: "80px clamp(24px, 8vw, 120px) 72px",
              maxWidth: 800,
            }}
          >
            <p
              style={{
                color: B.coral,
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                marginBottom: 18,
              }}
            >
              Klemens Sinema Kulübü
            </p>
            <h1
              style={{
                color: "#fff",
                fontSize: "clamp(32px, 5vw, 56px)",
                fontWeight: 800,
                margin: "0 0 20px",
                lineHeight: 1.1,
              }}
            >
              Sinemayı Birlikte Keşfedelim
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "clamp(15px, 2vw, 18px)",
                lineHeight: 1.7,
                maxWidth: 560,
                margin: "0 auto 32px",
              }}
            >
              Sinema topluluğumuzla ayda bir Zoom&apos;da buluşuyoruz.
              Film analizleri, tartışmalar ve derinlemesine sinema sohbetleri.
            </p>
            <a
              href="#fiyatlar"
              style={{
                display: "inline-block",
                background: B.coral,
                color: "#fff",
                borderRadius: 10,
                padding: "14px 40px",
                fontSize: 15,
                fontWeight: 700,
                textDecoration: "none",
                letterSpacing: "0.02em",
              }}
            >
              Fiyatları Gör ↓
            </a>
          </div>
        </section>

        {/* ═══ SONRAKİ BULUŞMA ═══════════════════════ */}
        <section
          style={{
            maxWidth: 800,
            margin: "0 auto",
            padding: "72px 24px 0",
          }}
        >
          <p
            style={{
              color: B.coral,
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            Sonraki Buluşma
          </p>

          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
              overflow: "hidden",
              display: "flex",
              flexWrap: "wrap" as const,
            }}
          >
            {/* Film afişi */}
            <div
              style={{
                flex: "0 0 260px",
                minHeight: 340,
                position: "relative",
              }}
            >
              <Image
                src="/images/workshops/sinema-klubu-pans-labyrinth.webp"
                alt="Pan's Labyrinth (2006) film afişi"
                fill
                sizes="(max-width: 640px) 100vw, 260px"
                style={{ objectFit: "cover", borderRadius: "12px 0 0 12px" }}
              />
            </div>

            {/* İçerik */}
            <div
              style={{
                flex: "1 1 300px",
                padding: "36px 32px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 16,
              }}
            >
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: B.dark,
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                Pan&apos;s Labyrinth — Guillermo del Toro (2006)
              </h2>

              <p
                style={{
                  color: B.coral,
                  fontWeight: 700,
                  fontSize: 14,
                  margin: 0,
                  letterSpacing: "0.02em",
                }}
              >
                26 Nisan 2026, Pazar — 20:30
              </p>

              <p
                style={{
                  color: B.warm,
                  fontSize: 15,
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                Karma grup için altın: herkes farklı kapıdan girer. Görsel
                sembolizm, psikolojik okuma, tarihsel bağlam. Estetik açıdan
                fevkalade zengin bir film.
              </p>

              <a
                href="#fiyatlar"
                style={{
                  display: "inline-block",
                  background: B.coral,
                  color: "#fff",
                  borderRadius: 10,
                  padding: "12px 32px",
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: "none",
                  letterSpacing: "0.02em",
                  alignSelf: "flex-start",
                  marginTop: 4,
                }}
              >
                Katıl
              </a>
            </div>
          </div>

          {/* Mobilde afişin border-radius düzeltmesi */}
          <style>{`
            @media (max-width: 640px) {
              section:nth-of-type(2) > div:last-of-type > div:first-child {
                flex: 0 0 auto !important;
                width: 100% !important;
                min-height: 400px !important;
              }
              section:nth-of-type(2) > div:last-of-type > div:first-child img {
                border-radius: 12px 12px 0 0 !important;
              }
            }
          `}</style>
        </section>

        {/* ═══ NASIL ÇALIŞIR? ════════════════════════ */}
        <section
          style={{
            maxWidth: 920,
            margin: "0 auto",
            padding: "72px 24px 64px",
          }}
        >
          <h2
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: B.dark,
              textAlign: "center",
              margin: "0 0 48px",
            }}
          >
            Nasıl Çalışır?
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 24,
            }}
          >
            {[
              {
                icon: "📅",
                title: "Ayda 1 Buluşma",
                desc: "Her ay belirlenen tarihte, akşam saatlerinde canlı Zoom oturumu.",
              },
              {
                icon: "🎬",
                title: "90 Dakika",
                desc: "Film analizi, yönetmen incelemesi ve interaktif tartışma bölümleri.",
              },
              {
                icon: "💬",
                title: "WhatsApp Topluluğu",
                desc: "Sinema topluluğunda ay boyunca film sohbetleri.",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: "32px 28px",
                  textAlign: "center",
                  boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 16 }}>{item.icon}</div>
                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: B.dark,
                    margin: "0 0 8px",
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    color: B.warm,
                    fontSize: 14,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ FİYAT KARTLARI ════════════════════════ */}
        <section
          id="fiyatlar"
          style={{
            maxWidth: 960,
            margin: "0 auto",
            padding: "0 24px 72px",
          }}
        >
          <h2
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: B.dark,
              textAlign: "center",
              margin: "0 0 12px",
            }}
          >
            Katılım Seçenekleri
          </h2>
          <p
            style={{
              color: B.warm,
              fontSize: 15,
              textAlign: "center",
              margin: "0 0 40px",
            }}
          >
            Size en uygun paketi seçin
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
              gap: 20,
            }}
          >
            {PLANS.map((plan) => {
              const cfg = SLUG_TO_ATOLYE[plan.slug];
              return (
                <div
                  key={plan.slug}
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    padding: "32px 24px 28px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    boxShadow: plan.highlight
                      ? `0 4px 24px rgba(255,109,96,0.18), 0 0 0 2px ${B.coral}`
                      : "0 1px 10px rgba(0,0,0,0.06)",
                    position: "relative",
                  }}
                >
                  {plan.badge && (
                    <span
                      style={{
                        position: "absolute",
                        top: -11,
                        background: plan.badge === "Öğrenci" ? B.warm : B.coral,
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "4px 14px",
                        borderRadius: 20,
                        letterSpacing: "0.06em",
                      }}
                    >
                      {plan.badge}
                    </span>
                  )}

                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: B.dark,
                      margin: "8px 0 6px",
                      lineHeight: 1.3,
                    }}
                  >
                    {plan.label}
                  </h3>

                  <p
                    style={{
                      fontSize: 32,
                      fontWeight: 800,
                      color: plan.highlight ? B.coral : B.dark,
                      margin: "8px 0 4px",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {plan.price}
                  </p>

                  <p
                    style={{
                      color: B.warm,
                      fontSize: 13,
                      margin: 0,
                    }}
                  >
                    {plan.sub}
                  </p>

                  <div style={{ marginTop: "auto", paddingTop: 24 }}>
                  <SatinAlButton
                    workshopId={cfg.id}
                    amount={cfg.price}
                    workshopTitle={plan.label}
                    workshopSlug={plan.slug}
                    label="Satın Al"
                  />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══ SSS ════════════════════════════════════ */}
        <section
          style={{
            maxWidth: 700,
            margin: "0 auto",
            padding: "0 24px 80px",
          }}
        >
          <h2
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: B.dark,
              textAlign: "center",
              margin: "0 0 36px",
            }}
          >
            Sıkça Sorulan Sorular
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {FAQ.map((item) => (
              <details
                key={item.q}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  padding: "20px 24px",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                }}
              >
                <summary
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: B.dark,
                    cursor: "pointer",
                    listStyle: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {item.q}
                  <span
                    style={{
                      color: B.coral,
                      fontSize: 20,
                      fontWeight: 400,
                      marginLeft: 12,
                      flexShrink: 0,
                    }}
                  >
                    +
                  </span>
                </summary>
                <p
                  style={{
                    color: B.warm,
                    fontSize: 14,
                    lineHeight: 1.7,
                    margin: "12px 0 0",
                  }}
                >
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
