import { notFound } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SatinAlButton from "@/components/SatinAlButton";
import CountdownTimer from "@/components/CountdownTimer";
import { SLUG_TO_ATOLYE, type AtolyeConfig } from "@/lib/atolyeler-config";
import WorkshopViewTracker from "@/components/WorkshopViewTracker";
import { createAdminClient } from "@/lib/supabase-admin";

const B = {
  coral: "#FF6D60",
  cream: "#FFFBF7",
  dark: "#2D2926",
  warm: "#8C857E",
  light: "#F5F0EB",
};

type Status = "open" | "closed" | "soon";
type Props = { params: Promise<{ slug: string }> };

function computeStatus(date: string | null | undefined): Status {
  if (!date) return "soon";
  return new Date(date) > new Date() ? "open" : "closed";
}

async function fetchNextSessionDate(workshopId: string): Promise<string | null> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("workshops")
      .select("next_session_date")
      .eq("id", workshopId)
      .single();
    return data?.next_session_date ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const meta: Record<string, { title: string; description: string }> = {
    "sanat-tarihinde-duygular": {
      title: "Sanat Tarihinde Duygular",
      description: "Korku, haz ve öfkenin sanat tarihindeki izleri — mitolojiden modern tablolara, 3 haftalık canlı Zoom atölyesi.",
    },
    "modern-sanat-atolyesi": {
      title: "Modern Sanatı Okumak",
      description: "Empresyonizmden Kavramsal Sanata, 10 haftada modern sanatın dilini ve felsefesini öğrenin. Canlı Zoom atölyesi.",
    },
    "ronesans-okuryazarligi": {
      title: "Rönesans Okur-Yazarlığı",
      description: "8 haftada Floransa, Roma, Venedik ve Milano'nun ustalarını öğrenin. Sanatın grameri Rönesans'tır.",
    },
    "kapsamli-sanat-tarihi": {
      title: "Kapsamlı Sanat Tarihi Atölyesi",
      description: "Antik Yunan'dan günümüze sanatın dönüm noktaları, büyük ustaların hayatları ve başlıca akımlar. 10 haftalık program.",
    },
  };
  const m = meta[slug] ?? { title: "Atölye", description: "" };
  const cfg = SLUG_TO_ATOLYE[slug];

  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: `/atolyeler/${slug}` },
    openGraph: {
      title: m.title,
      description: m.description,
      ...(cfg?.imgCover && { images: [{ url: cfg.imgCover, width: 1200, height: 630 }] }),
    },
  };
}

export default async function AtolyeDetayPage({ params }: Props) {
  const { slug } = await params;
  const config = SLUG_TO_ATOLYE[slug];
  if (!config) notFound();

  // DB'den çek, yoksa config.targetDate'i kullan
  const nextSessionDate =
    (await fetchNextSessionDate(config.id)) ?? config.targetDate ?? null;
  const status = computeStatus(nextSessionDate);

  const courseTitles: Record<string, string> = {
    "sanat-tarihinde-duygular": "Sanat Tarihinde Duygular",
    "modern-sanat-atolyesi": "Modern Sanatı Okumak",
    "ronesans-okuryazarligi": "Rönesans Okur-Yazarlığı",
    "kapsamli-sanat-tarihi": "Kapsamlı Sanat Tarihi Atölyesi",
  };

  const courseDescriptions: Record<string, string> = {
    "sanat-tarihinde-duygular": "Korku, haz ve öfkenin sanat tarihindeki izleri — 3 haftalık canlı Zoom atölyesi.",
    "modern-sanat-atolyesi": "Empresyonizmden Kavramsal Sanata, 10 haftada modern sanatın dili.",
    "ronesans-okuryazarligi": "8 haftada Rönesans'ın ustalarını öğrenin.",
    "kapsamli-sanat-tarihi": "Antik Yunan'dan günümüze, 10 haftalık kapsamlı sanat tarihi programı.",
  };

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: courseTitles[slug] ?? slug,
    description: courseDescriptions[slug] ?? "",
    provider: {
      "@type": "Organization",
      name: "Klemens Art",
      url: "https://klemensart.com",
    },
    deliveryMode: "online",
  };

  let page: React.ReactNode;
  if (slug === "sanat-tarihinde-duygular")
    page = <DuygularPage config={config} status={status} nextSessionDate={nextSessionDate} slug={slug} />;
  else if (slug === "modern-sanat-atolyesi")
    page = <ModernSanatPage config={config} status={status} nextSessionDate={nextSessionDate} slug={slug} />;
  else if (slug === "ronesans-okuryazarligi")
    page = <RonesansPage config={config} status={status} nextSessionDate={nextSessionDate} slug={slug} />;
  else if (slug === "kapsamli-sanat-tarihi")
    page = <KapsamliSanatTarihiPage config={config} status={status} slug={slug} />;
  else return <YakindaPage baslik="Bilinmeyen Atölye" />;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <WorkshopViewTracker workshopId={config.id} workshopSlug={slug} />
      {page}
    </>
  );
}

/* ─── Ortak bileşenler ──────────────────────────────── */

function HeroBanner({
  config,
  altBaslik,
  baslik,
  fiyat,
  workshopTitle,
  workshopSlug,
  imgPosition = "center center",
  status,
}: {
  config: AtolyeConfig;
  altBaslik: string;
  baslik: string;
  fiyat: string;
  workshopTitle: string;
  workshopSlug?: string;
  imgPosition?: string;
  status: Status;
}) {
  return (
    <section style={{ position: "relative", height: 600, overflow: "hidden" }}>
      <style>{`
        @keyframes kenburns {
          0%   { transform: scale(1)   translate(0, 0); }
          100% { transform: scale(1.1) translate(-1%, -1%); }
        }
      `}</style>

      <Image
        src={config.imgCover}
        alt={baslik}
        fill
        quality={80}
        priority
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSIyNCI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjI0IiBmaWxsPSIjMkQyOTI2Ii8+PC9zdmc+"
        sizes="100vw"
        style={{
          objectFit: "cover",
          objectPosition: imgPosition,
          transformOrigin: "center center",
          animation: "kenburns 20s ease-in-out infinite alternate",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.50)",
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 clamp(24px, 8vw, 120px)",
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
          {altBaslik}
        </p>
        <h1
          style={{
            color: "#fff",
            fontSize: "clamp(32px, 5vw, 60px)",
            fontWeight: 800,
            margin: "0 0 32px",
            lineHeight: 1.08,
            maxWidth: 740,
          }}
        >
          {baslik}
        </h1>

        {/* Durum bazlı buton alanı */}
        {status === "open" && (
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 30, fontWeight: 800, letterSpacing: "-0.01em" }}>
              {fiyat}
            </span>
            {config.forSale && (
              <SatinAlButton
                workshopId={config.id}
                amount={config.price}
                workshopTitle={workshopTitle}
                workshopSlug={workshopSlug}
                size="large"
              />
            )}
          </div>
        )}

        {status === "closed" && (
          <div style={{ textAlign: "center" }}>
            <button
              disabled
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.55)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 10,
                padding: "14px 40px",
                fontSize: 15,
                fontWeight: 700,
                cursor: "not-allowed",
                letterSpacing: "0.04em",
              }}
            >
              KAYITLAR KAPANDI
            </button>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 10, margin: "10px 0 0" }}>
              Bu atölyenin kayıt dönemi sona ermiştir.
            </p>
          </div>
        )}

        {status === "soon" && (
          <a
            href="#bulten"
            style={{
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
            Haberdar Ol →
          </a>
        )}
      </div>
    </section>
  );
}

function EgitmenKart() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "28px",
        display: "flex",
        gap: 20,
        alignItems: "flex-start",
        flexWrap: "wrap",
        boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
        marginBottom: 0,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: B.light,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          fontWeight: 700,
          color: B.coral,
          flexShrink: 0,
        }}
      >
        KH
      </div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <p
          style={{
            color: B.warm,
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            margin: "0 0 4px",
          }}
        >
          Eğitmen
        </p>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: B.dark, margin: "0 0 3px" }}>
          Kerem Hun
        </h3>
        <p style={{ color: B.coral, fontSize: 13, fontWeight: 600, margin: "0 0 10px" }}>
          Sanat Tarihçisi & Küratör
        </p>
        <p style={{ color: B.warm, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
          Sanat tarihini sezgisel ve erişilebilir bir dille aktaran Kerem Hun, 10 yılı aşkın süredir atölye
          ve seminerler yürütmektedir. Odak alanları: Rönesans'tan Modernizme Batı sanatı, duygu ve estetik
          teorisi.
        </p>
      </div>
    </div>
  );
}

function AltCTA({
  config,
  workshopTitle,
  workshopSlug,
  aciklama,
  fiyatLabel,
  status,
}: {
  config: AtolyeConfig;
  workshopTitle: string;
  workshopSlug?: string;
  aciklama: string;
  fiyatLabel: string;
  status: Status;
}) {
  return (
    <section
      style={{
        background: B.dark,
        borderRadius: 16,
        padding: "40px 32px",
        textAlign: "center",
        margin: "48px 0 80px",
      }}
    >
      <h3 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>
        {status === "open" ? "Hemen Katıl" : status === "closed" ? "Kayıt Kapandı" : "Yakında Açılıyor"}
      </h3>
      <p style={{ color: "#a09890", fontSize: 15, margin: "0 0 28px" }}>{aciklama}</p>

      {status === "open" && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: B.coral }}>{fiyatLabel}</span>
          <SatinAlButton
            workshopId={config.id}
            amount={config.price}
            workshopTitle={workshopTitle}
            workshopSlug={workshopSlug}
            size="large"
          />
        </div>
      )}

      {status === "closed" && (
        <p style={{ color: "#a09890", fontSize: 14, margin: 0 }}>
          Bu atölyenin kayıt dönemi sona ermiştir. Yeni dönem için bültene kayıt olun.
        </p>
      )}

      {status === "soon" && (
        <a
          href="#bulten"
          style={{
            display: "inline-block",
            background: B.coral,
            color: "#fff",
            borderRadius: 10,
            padding: "12px 32px",
            fontSize: 15,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Haberdar Ol →
        </a>
      )}
    </section>
  );
}

function BilgiBanner({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: B.light,
        borderRadius: 12,
        padding: "18px 22px",
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        marginBottom: 48,
      }}
    >
      <span style={{ color: B.coral, fontWeight: 800, fontSize: 15, flexShrink: 0, marginTop: 1 }}>
        i
      </span>
      <div style={{ color: B.dark, fontSize: 14, lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

/* ─── SAYFA 1: Sanat Tarihinde Duygular ────────────── */

function DuygularPage({
  config,
  status,
  nextSessionDate,
  slug,
}: {
  config: AtolyeConfig;
  status: Status;
  nextSessionDate: string | null;
  slug: string;
}) {
  const oturumlar = [
    { no: 1, konu: "KORKU", tarih: "10 Mart Salı", saat: "20:30–22:30" },
    { no: 2, konu: "HAZ", tarih: "17 Mart Salı", saat: "20:30–22:30" },
    { no: 3, konu: "ÖFKE", tarih: "24 Mart Salı", saat: "20:30–22:30" },
  ];

  return (
    <>
      <Navbar />
      <main style={{ background: B.cream, minHeight: "100vh" }}>

        {/* Geri sayım — sadece kayıt açıkken */}
        {status === "open" && nextSessionDate && (
          <div
            style={{
              background: B.dark,
              padding: "20px 24px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: "#a09890",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                margin: "0 0 14px",
              }}
            >
              İlk Oturuma Kalan Süre
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <CountdownTimer targetDate={nextSessionDate} />
            </div>
          </div>
        )}

        <HeroBanner
          config={config}
          altBaslik="Online — 3 Hafta"
          baslik={"Sanat Tarihinde Duygular:\nKorku, Haz ve Öfke"}
          fiyat="1.500₺"
          workshopTitle="Sanat Tarihinde Duygular"
          imgPosition="center 30%"
          workshopSlug={slug}
          status={status}
        />

        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>

          {/* Açıklama */}
          <section style={{ paddingTop: 56, paddingBottom: 0 }}>
            <p style={{ color: B.dark, fontSize: 17, lineHeight: 1.85, margin: "0 0 20px" }}>
              İnsanlığın en derin duyguları, mitolojiden günümüze sanat eserlerinin kalbinde gizlidir.
              Antik tragedyalardan modern sanatın çarpıcı sahnelerine kadar; korku, öfke ve haz gibi
              duygular, insanlık tarihini şekillendiren görünmez iplikler olmuştur.
            </p>
            <p style={{ color: B.dark, fontSize: 17, lineHeight: 1.85, margin: "0 0 16px" }}>
              Bu seminer serisinde, mitolojik kökenlerden başlayarak duyguların izini süreceğiz:
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 48px", display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "Goya'nın karanlık tabloları",
                "Caravaggio'nun dramatik ışık gölgesi",
                "Rodin'in bedene kazınmış öfkesi",
                "Munch'un varoluşsal çığlığı",
              ].map((item) => (
                <li key={item} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ color: B.coral, fontWeight: 700, flexShrink: 0, marginTop: 3 }}>—</span>
                  <span style={{ color: B.dark, fontSize: 16, lineHeight: 1.65 }}>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Alıntı */}
          <blockquote style={{ borderLeft: `3px solid ${B.coral}`, paddingLeft: 24, margin: "0 0 48px" }}>
            <p style={{ color: B.warm, fontSize: 18, lineHeight: 1.8, fontStyle: "italic", margin: 0 }}>
              "Bu yolculuk, sadece sanat tarihine değil, kendi duygularımıza da yeni bir gözle bakmamızı
              sağlayacak."
            </p>
          </blockquote>

          {/* Bilgi */}
          <BilgiBanner>
            <p style={{ margin: "0 0 4px" }}>
              Zoom üzerinden canlı. Kayıt sonrası katılım linki iletilecektir.
            </p>
            <p style={{ margin: 0, fontStyle: "italic", color: B.warm }}>
              Sanatın aynasında insan ruhunu okumaya hazır mısınız?
            </p>
          </BilgiBanner>

          {/* Oturum Programı */}
          <section style={{ paddingBottom: 56 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: B.dark, marginBottom: 24 }}>
              Oturum Programı
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              {oturumlar.map((o) => (
                <div
                  key={o.no}
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    padding: "24px 20px",
                    boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                      style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: B.light, color: B.coral,
                        fontSize: 12, fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {o.no}
                    </span>
                    <span style={{ color: B.coral, fontSize: 13, fontWeight: 800, letterSpacing: "0.1em" }}>
                      {o.konu}
                    </span>
                  </div>
                  <div>
                    <p style={{ color: B.dark, fontSize: 14, fontWeight: 600, margin: "0 0 2px" }}>{o.tarih}</p>
                    <p style={{ color: B.warm, fontSize: 13, margin: "0 0 4px" }}>{o.saat} · Zoom</p>
                    <p style={{ color: B.warm, fontSize: 12, margin: 0 }}>Tek Oturum: 600₺</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <EgitmenKart />

          <AltCTA
            config={config}
            workshopSlug={slug}
            workshopTitle="Sanat Tarihinde Duygular"
            aciklama="3 oturum · Zoom · 6 aylık kayıt erişimi"
            fiyatLabel="1.500₺"
            status={status}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ─── SAYFA 2: Modern Sanatı Okumak ────────────────── */

function ModernSanatPage({
  config,
  status,
  nextSessionDate,
  slug,
}: {
  config: AtolyeConfig;
  status: Status;
  nextSessionDate: string | null;
  slug: string;
}) {
  const bloklar = [
    {
      no: 1,
      baslik: "PARÇALANMA VE İSYAN",
      alt: "Hafta 1–3",
      haftalar: [
        "Hafta 1: Gerçekliği Neden Bozduk? (Empresyonizm)",
        "Hafta 2: Parçalanan Dünyalar (Kübizm)",
        "Hafta 3: Kuralları Yıkan Pisuar (Dadaizm)",
      ],
    },
    {
      no: 2,
      baslik: "SOYUTUN İÇİNE GİRİŞ",
      alt: "Hafta 4–6",
      haftalar: [
        "Hafta 4: Bilinçaltının Sınırları (Sürrealizm)",
        "Hafta 5: Rengin ve Geometrinin Dili (De Stijl)",
        'Hafta 6: "Bunu Ben De Çizerdim" (Soyut Dışavurumculuk)',
      ],
    },
    {
      no: 3,
      baslik: "TÜKETİM VE FİKİR",
      alt: "Hafta 7–9",
      haftalar: [
        "Hafta 7: Çorba Konservesindeki İroni (Pop-Art)",
        "Hafta 8: Fikrin Hükümranlığı (Kavramsal Sanat)",
        "Hafta 9: Bedene Yabancılaşma (Performans Sanatı)",
      ],
    },
  ];

  return (
    <>
      <Navbar />
      <main style={{ background: B.cream, minHeight: "100vh" }}>

        {/* Geri sayım — sadece kayıt açıkken */}
        {status === "open" && nextSessionDate && (
          <div
            style={{
              background: B.dark,
              padding: "20px 24px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: "#a09890",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                margin: "0 0 14px",
              }}
            >
              İlk Oturuma Kalan Süre
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <CountdownTimer targetDate={nextSessionDate} />
            </div>
          </div>
        )}

        <HeroBanner
          config={config}
          altBaslik="KLEMENS LOCA — 10 Hafta"
          baslik="Modern Sanatı Okumak"
          fiyat="6.000₺"
          workshopTitle="Modern Sanat Atolyesi"
          imgPosition="center center"
          workshopSlug={slug}
          status={status}
        />

        {/* Tagline şeridi */}
        <div style={{ background: B.light, borderLeft: `4px solid ${B.coral}`, padding: "14px 24px", margin: "0" }}>
          <p style={{ maxWidth: 800, margin: "0 auto", color: B.dark, fontSize: 16, fontStyle: "italic", lineHeight: 1.6 }}>
            "Bunu ben de çizerdim!" dediğimiz eserler aslında bize ne anlatıyor?
          </p>
        </div>

        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>

          {/* Açıklama */}
          <section style={{ paddingTop: 56, paddingBottom: 0 }}>
            <p style={{ color: B.dark, fontSize: 17, lineHeight: 1.85, margin: "0 0 32px" }}>
              Modern sanat çoğu zaman anlamsız, kaotik veya ulaşılamaz görünür. Ancak her sıçrayan
              boyanın, her geometrik çizginin ve sergilenen her sıradan objenin ardında köklü bir
              felsefe, bir isyan veya dünyayı anlama çabası yatar.
            </p>

            {/* Ne Kazanacaksınız */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "28px 28px", marginBottom: 36, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
              <p style={{ color: B.coral, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 14px" }}>
                Ne Kazanacaksınız
              </p>
              <p style={{ color: B.dark, fontSize: 16, lineHeight: 1.85, margin: 0 }}>
                Bir modern sanat müzesine adım attığınızda hissettiğiniz o "yabancılaşma" duygusu
                tamamen kaybolacak. Eserlere sadece estetik birer obje olarak değil; dönemin ruhunu,
                toplumsal isyanları ve felsefi kırılmaları yansıtan birer metin gibi bakmayı
                öğreneceksiniz. Kısacası, sanatı sadece izleyen değil, "okuyabilen" ve onunla diyalog
                kurabilen analitik bir zihne kavuşacaksınız.
              </p>
            </div>

            {/* Keşfedeceklerimiz */}
            <div style={{ marginBottom: 48 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: B.dark, marginBottom: 18 }}>
                Keşfedeceklerimiz
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  "Doğayı kopyalamayı neden bıraktık? (Empresyonizm)",
                  '"Sanat nedir?" sorusunu sarsan devrim (Dadaizm)',
                  "Rüyaların tuvale yansıması (Sürrealizm)",
                  "Kaotik sıçramaların ardındaki çığlık (Soyut Dışavurumculuk)",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ color: B.coral, fontWeight: 700, flexShrink: 0, marginTop: 3 }}>—</span>
                    <span style={{ color: B.dark, fontSize: 16, lineHeight: 1.65 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Bilgi */}
          <BilgiBanner>
            10 haftalık atölye Zoom üzerinden canlı. Kayıt sonrası 6 aylık tekrar izleme erişim
            anahtarı iletilecektir.
          </BilgiBanner>

          {/* Müfredat */}
          <section style={{ paddingBottom: 56 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: B.dark, marginBottom: 24 }}>
              10 Haftalık Müfredat
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
              {bloklar.map((blok) => (
                <div key={blok.no} style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
                  <div style={{ background: B.dark, padding: "13px 22px", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ background: B.coral, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20, letterSpacing: "0.06em" }}>
                      BLOK {blok.no}
                    </span>
                    <span style={{ color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: "0.07em" }}>
                      {blok.baslik}
                    </span>
                    <span style={{ color: "#a09890", fontSize: 12, marginLeft: "auto" }}>{blok.alt}</span>
                  </div>
                  <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
                    {blok.haftalar.map((h, j) => (
                      <div key={j} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <span
                          style={{
                            minWidth: 22, height: 22, borderRadius: "50%",
                            background: B.light, color: B.coral,
                            fontSize: 10, fontWeight: 700,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0, marginTop: 1,
                          }}
                        >
                          {(blok.no - 1) * 3 + j + 1}
                        </span>
                        <span style={{ color: B.dark, fontSize: 14, lineHeight: 1.6 }}>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Final */}
            <div style={{ border: `1.5px solid ${B.coral}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ background: B.coral, padding: "13px 22px", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ color: "#fff", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em" }}>BÜYÜK FİNAL</span>
                <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginLeft: "auto" }}>Hafta 10</span>
              </div>
              <div style={{ padding: "16px 22px" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span
                    style={{
                      minWidth: 22, height: 22, borderRadius: "50%",
                      background: B.coral, color: "#fff",
                      fontSize: 10, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginTop: 1,
                    }}
                  >
                    10
                  </span>
                  <span style={{ color: B.dark, fontSize: 14, lineHeight: 1.65 }}>
                    Hafta 10: Çağdaş Sanatı Okumak — günümüz sanat piyasası, mirası ve eserlere
                    bakarken artık sormamız gereken yeni sorular.
                  </span>
                </div>
              </div>
            </div>

            <p style={{ color: B.warm, fontSize: 13, fontStyle: "italic", marginTop: 16, textAlign: "center" }}>
              Erken Kayıt Ayrıcalığı — kontenjan sınırlıdır.
            </p>
          </section>

          <EgitmenKart />

          <AltCTA
            config={config}
            workshopSlug={slug}
            workshopTitle="Modern Sanat Atolyesi"
            aciklama="10 hafta · Zoom · 6 aylık tekrar izleme"
            fiyatLabel="6.000₺"
            status={status}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ─── SAYFA 3: Rönesans Okur-Yazarlığı ─────────────── */

function RonesansPage({
  config,
  status,
  nextSessionDate,
  slug,
}: {
  config: AtolyeConfig;
  status: Status;
  nextSessionDate: string | null;
  slug: string;
}) {
  const program = [
    { tarih: "11 Aralık 2025 Per", konu: "Floransa I — Duomo, Baptistery ve Erken Rönesans'ın Doğuşu" },
    { tarih: "18 Aralık 2025 Per", konu: "Floransa II — Botticelli, Michelangelo ve Medici Çevresi" },
    { tarih: "8 Ocak 2026 Per",    konu: "Roma I — Vatikan, Sistine Şapeli ve Yüksek Rönesans" },
    { tarih: "15 Ocak 2026 Per",   konu: "Roma II — Raphael ve Rönesans Mimarisinin Grameri" },
    { tarih: "22 Ocak 2026 Per",   konu: "Venedik I — Titian, Tintoretto ve Renk Felsefesi" },
    { tarih: "29 Ocak 2026 Per",   konu: "Venedik II — Mimari, Su ve Osmanlı Bağlantısı" },
    { tarih: "5 Şubat 2026 Per",   konu: "Milano & Leonardo — Sfumato, Bilim ve Sanatın Birleşimi" },
    { tarih: "12 Şubat 2026 Per",  konu: "Büyük Final — 3 Adımda Eser Okuma ve Müze Stratejisi" },
  ];

  const aciklamaParagraflari = [
    "Yalnızca 8 online derste Rönesans'ın ustalarını ve Floransa–Roma–Venedik–Milano'nun yapısını net bir çerçevede öğrenecek, her şehir için özgün rota önerileriyle mutlaka görmen gereken eserleri bileceksin.",
    "Sanatçı–şehir etkileşimini net görecek, bir eserin neden o şehirde ortaya çıktığını kısa ve anlaşılır biçimde öğreneceksin.",
    "Floransa Katedrali'nin (Duomo) kendi kendini taşıyan çift kabuklu kubbesi gibi örneklerle Rönesans mimarisini jargonsuz, basit mantığıyla anlayacaksın.",
    "İtalya'nın farklı şehirlerinde ortaya çıkan büyük sanat akımlarını karşılaştıracak; hepsini birleştiren insanı merkeze alan hümanist felsefeyi kısa, anlaşılır hikayelerle kavrayacaksın.",
    "Dünyanın önde gelen müzelerini gezerken hangi eserlerin öncelikli olduğunu bilecek, hedef odaklı gezi planı yapmayı öğreneceksin. Zamanını doğru eserlere ayıracak, müzede kaybolmayacaksın.",
    "3 Adımda Eser Okuma yöntemiyle, sanat eserlerini hızlı ve isabetli şekilde okuyabileceksin.",
    "Sanat özgün bir dilse, grameri Rönesans'tır. Bu grameri öğrenmeden diğer sanat akımları tam olarak kavranamaz. Bu atölye ile sanatın dilini kolayca öğreneceksin.",
  ];

  return (
    <>
      <Navbar />
      <main style={{ background: B.cream, minHeight: "100vh" }}>

        {/* Geri sayım — sadece kayıt açıkken */}
        {status === "open" && nextSessionDate && (
          <div style={{ background: B.dark, padding: "20px 24px", textAlign: "center" }}>
            <p style={{ color: "#a09890", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 14px" }}>
              İlk Oturuma Kalan Süre
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <CountdownTimer targetDate={nextSessionDate} />
            </div>
          </div>
        )}

        <HeroBanner
          config={config}
          altBaslik="Online — 8 Hafta"
          baslik="Rönesans Okur-Yazarlığı"
          fiyat="—"
          workshopTitle="Rönesans Okur-Yazarlığı"
          imgPosition="center 20%"
          workshopSlug={slug}
          status={status}
        />

        {/* Alt bilgi şeridi */}
        <div
          style={{
            background: B.light,
            borderLeft: `4px solid ${B.coral}`,
            padding: "14px 24px",
          }}
        >
          <p
            style={{
              maxWidth: 800,
              margin: "0 auto",
              color: B.warm,
              fontSize: 13,
              lineHeight: 1.6,
              display: "flex",
              flexWrap: "wrap",
              gap: "6px 20px",
            }}
          >
            <span>8 Hafta</span>
            <span style={{ color: B.light }}>|</span>
            <span>11 Aralık 2025 – 12 Şubat 2026</span>
            <span style={{ color: B.light }}>|</span>
            <span>20:30 – 22:00</span>
            <span style={{ color: B.light }}>|</span>
            <span>Online (Zoom)</span>
            <span style={{ color: B.light }}>|</span>
            <span>Kayıtlar 6 ay erişilebilir</span>
          </p>
        </div>

        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>

          {/* Açıklama */}
          <section style={{ paddingTop: 56, paddingBottom: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 48 }}>
              {aciklamaParagraflari.map((p, i) => (
                <p key={i} style={{ color: B.dark, fontSize: 16, lineHeight: 1.85, margin: 0 }}>
                  {p}
                </p>
              ))}
            </div>
          </section>

          {/* Program */}
          <section style={{ paddingBottom: 56 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: B.dark, marginBottom: 8 }}>
              Program
            </h2>
            <p style={{ color: B.warm, fontSize: 13, margin: "0 0 24px" }}>
              Her Perşembe 20:30 · Zoom · 1 Ocak'ta ders yoktur
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {program.map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: "16px 20px",
                    display: "flex",
                    gap: 16,
                    alignItems: "flex-start",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                  }}
                >
                  <span
                    style={{
                      minWidth: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: i === 7 ? B.coral : B.light,
                      color: i === 7 ? "#fff" : B.coral,
                      fontSize: 10,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {i + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: B.warm, fontSize: 11, fontWeight: 600, margin: "0 0 3px", letterSpacing: "0.04em" }}>
                      {s.tarih}
                    </p>
                    <p style={{ color: B.dark, fontSize: 14, lineHeight: 1.5, margin: 0 }}>
                      {s.konu}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <EgitmenKart />

          <AltCTA
            config={config}
            workshopSlug={slug}
            workshopTitle="Rönesans Okur-Yazarlığı"
            aciklama="8 hafta · Zoom · 6 aylık kayıt erişimi"
            fiyatLabel="—"
            status={status}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ─── SAYFA 4: Kapsamlı Sanat Tarihi ───────────────── */

function KapsamliSanatTarihiPage({
  config,
  status,
  slug,
}: {
  config: AtolyeConfig;
  status: Status;
  slug: string;
}) {
  const program = [
    { tarih: "19 Kasım 2025 Çar", konu: "Oturum 1" },
    { tarih: "26 Kasım 2025 Çar", konu: "Oturum 2" },
    { tarih: "3 Aralık 2025 Çar", konu: "Oturum 3" },
    { tarih: "10 Aralık 2025 Çar", konu: "Oturum 4" },
    { tarih: "17 Aralık 2025 Çar", konu: "Oturum 5" },
    { tarih: "24 Aralık 2025 Çar", konu: "Oturum 6" },
    { tarih: "7 Ocak 2026 Çar", konu: "Oturum 7" },
    { tarih: "14 Ocak 2026 Çar", konu: "Oturum 8" },
    { tarih: "21 Ocak 2026 Çar", konu: "Oturum 9" },
    { tarih: "28 Ocak 2026 Çar", konu: "Oturum 10" },
  ];

  return (
    <>
      <Navbar />
      <main style={{ background: B.cream, minHeight: "100vh" }}>

        <HeroBanner
          config={config}
          altBaslik="Online — 10 Hafta"
          baslik="Kapsamlı Sanat Tarihi Atölyesi"
          fiyat="6.000₺"
          workshopTitle="Kapsamlı Sanat Tarihi Atölyesi"
          imgPosition="center center"
          workshopSlug={slug}
          status={status}
        />

        {/* Alt bilgi şeridi */}
        <div
          style={{
            background: B.light,
            borderLeft: `4px solid ${B.coral}`,
            padding: "14px 24px",
          }}
        >
          <p
            style={{
              maxWidth: 800,
              margin: "0 auto",
              color: B.warm,
              fontSize: 13,
              lineHeight: 1.6,
              display: "flex",
              flexWrap: "wrap",
              gap: "6px 20px",
            }}
          >
            <span>10 Hafta</span>
            <span style={{ color: B.light }}>|</span>
            <span>19 Kasım 2025 – 28 Ocak 2026</span>
            <span style={{ color: B.light }}>|</span>
            <span>20:30 – 22:00</span>
            <span style={{ color: B.light }}>|</span>
            <span>Online (Zoom)</span>
            <span style={{ color: B.light }}>|</span>
            <span>Kayıtlar 6 ay erişilebilir</span>
          </p>
        </div>

        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>

          {/* Açıklama */}
          <section style={{ paddingTop: 56, paddingBottom: 0 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: B.coral, letterSpacing: "0.04em", margin: "0 0 24px", textTransform: "uppercase" }}>
              Antik Yunan'dan Günümüze Sanatın Dönüm Noktaları, Büyük Ustaların Hayatları ve Başlıca Akımlar
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 48 }}>
              {[
                "Büyük virajları net biçimde ele alıyoruz.",
                "Perspektif, ışık ve malzeme gibi tekniklerin nasıl ortaya çıktığını adım adım gösteriyoruz.",
                "Üslup değişimlerini ve toplumsal kırılmaları, ana eserler ve ustalar üzerinden okuyoruz.",
                "Amaç, müze/sergi deneyiminizde neyi, neden, nasıl okuyacağınızı kalıcı bir alışkanlığa dönüştürmek.",
              ].map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ color: B.coral, fontWeight: 700, flexShrink: 0, marginTop: 3 }}>—</span>
                  <p style={{ color: B.dark, fontSize: 16, lineHeight: 1.85, margin: 0 }}>{p}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Kimler için */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "28px 28px", marginBottom: 36, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <p style={{ color: B.coral, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 14px" }}>
              Kimler İçin?
            </p>
            <p style={{ color: B.dark, fontSize: 16, lineHeight: 1.85, margin: 0 }}>
              İyi bir izleyici/okur olmak isteyenler, yaratıcı sektör profesyonelleri, öğrenciler ve
              kültür-sanat meraklıları. Önkoşul yok.
            </p>
          </div>

          {/* Bilgi */}
          <BilgiBanner>
            <p style={{ margin: "0 0 4px" }}>
              Tüm buluşmalar kayda alınır; 6 ay boyunca erişebilirsiniz.
            </p>
            <p style={{ margin: "0 0 4px" }}>
              Çarşamba 20:30–22:00 · 19 Kasım 2025 – 28 Ocak 2026 (31 Aralık 2025 haftası ders yok.)
            </p>
            <p style={{ margin: 0, color: B.warm }}>
              Kontenjan sınırlı. E-arşiv fatura kesilir.
            </p>
          </BilgiBanner>

          {/* Program */}
          <section style={{ paddingBottom: 56 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: B.dark, marginBottom: 8 }}>
              Program
            </h2>
            <p style={{ color: B.warm, fontSize: 13, margin: "0 0 24px" }}>
              Her Çarşamba 20:30 · Zoom · 31 Aralık'ta ders yoktur
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {program.map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: "16px 20px",
                    display: "flex",
                    gap: 16,
                    alignItems: "flex-start",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                  }}
                >
                  <span
                    style={{
                      minWidth: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: i === 9 ? B.coral : B.light,
                      color: i === 9 ? "#fff" : B.coral,
                      fontSize: 10,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {i + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: B.warm, fontSize: 11, fontWeight: 600, margin: "0 0 3px", letterSpacing: "0.04em" }}>
                      {s.tarih}
                    </p>
                    <p style={{ color: B.dark, fontSize: 14, lineHeight: 1.5, margin: 0 }}>
                      {s.konu}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <EgitmenKart />

          <AltCTA
            config={config}
            workshopSlug={slug}
            workshopTitle="Kapsamlı Sanat Tarihi Atölyesi"
            aciklama="10 hafta · Zoom · 6 aylık kayıt erişimi"
            fiyatLabel="6.000₺"
            status={status}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ─── SAYFA 5: Yakında (fallback) ───────────────────── */

function YakindaPage({ baslik }: { baslik: string }) {
  return (
    <>
      <Navbar />
      <main
        style={{
          background: B.cream,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <span
            style={{
              background: B.light,
              color: B.warm,
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 14px",
              borderRadius: 20,
              letterSpacing: "0.08em",
            }}
          >
            YAKINDA
          </span>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: B.dark, margin: "20px 0 12px" }}>
            {baslik}
          </h1>
          <p style={{ color: B.warm, fontSize: 16, lineHeight: 1.7 }}>
            Bu atölye yakında açılacak. Güncel duyurular için bültene kayıt olabilirsiniz.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
