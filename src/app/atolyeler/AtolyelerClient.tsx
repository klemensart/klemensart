"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import AnnouncementBar, { useAnnouncementBadges } from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase";
import { SLUG_TO_ATOLYE } from "@/lib/atolyeler-config";

const B = {
  coral: "#FF6D60",
  cream: "#FFFBF7",
  dark: "#2D2926",
  warm: "#8C857E",
  light: "#F5F0EB",
};

/* ─── SVG İkonları ─────────────────────────────── */

function VideoIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

/* ─── Atölye Serileri kartı ─────────────────────── */

type Status = "open" | "closed" | "soon";

type SeriesWorkshop = {
  slug: string;
  workshopId: string;
  title: string;
  description: string;
  duration: string;
  price: string;
  imgSquare: string | null;
  imgPosition?: string;
  startLabel?: string;
};

const SERILER: SeriesWorkshop[] = [
  {
    slug: "sanat-tarihinde-duygular",
    workshopId: SLUG_TO_ATOLYE["sanat-tarihinde-duygular"].id,
    title: "Sanat Tarihinde Duygular",
    description: "Korku, haz ve öfkenin sanat tarihindeki izleri — mitolojiden modern tablolara, 3 haftalık canlı keşif.",
    duration: "3 Hafta",
    price: "1.500 TL",
    imgSquare: "/images/workshops/sanat-tarihinde-duygular-square.webp",
    imgPosition: "center 30%",
  },
  {
    slug: "modern-sanat-atolyesi",
    workshopId: SLUG_TO_ATOLYE["modern-sanat-atolyesi"].id,
    title: "Modern Sanatı Okumak",
    description: "Empresyonizmden Kavramsal Sanata, 10 haftada modern sanatın dilini ve felsefesini öğrenin.",
    duration: "10 Hafta",
    price: "6.000 TL",
    imgSquare: "/images/workshops/modern-sanat-atolyesi-square.webp",
    imgPosition: "center center",
    startLabel: "8 Nisan'da başlıyor",
  },
  {
    slug: "ronesans-okuryazarligi",
    workshopId: SLUG_TO_ATOLYE["ronesans-okuryazarligi"].id,
    title: "Rönesans Okur-Yazarlığı",
    description: "8 haftada Floransa, Roma, Venedik ve Milano'nun ustalarını öğren. Sanatın grameri Rönesans'tır.",
    duration: "8 Hafta",
    price: "—",
    imgSquare: "/images/workshops/ronesans-atolyesi-square.webp",
    imgPosition: "center 20%",
  },
  {
    slug: "ronesans-okuryazarligi-2",
    workshopId: SLUG_TO_ATOLYE["ronesans-okuryazarligi-2"].id,
    title: "Rönesans Okur-Yazarlığı",
    description: "8 haftada Floransa, Roma, Venedik ve Milano'nun ustalarını öğren. 6 ay kayıt erişimi ve PDF çalışma dokümanları dahil.",
    duration: "8 Hafta",
    price: "4.500 TL",
    imgSquare: "/images/workshops/ronesans-atolyesi-square.webp",
    imgPosition: "center 20%",
    startLabel: "11 Mayıs'ta başlıyor",
  },
  {
    slug: "kapsamli-sanat-tarihi",
    workshopId: SLUG_TO_ATOLYE["kapsamli-sanat-tarihi"].id,
    title: "Kapsamlı Sanat Tarihi Atölyesi",
    description: "Antik Yunan'dan günümüze sanatın dönüm noktaları, büyük ustaların hayatları ve başlıca akımlar. 10 haftalık kapsamlı program.",
    duration: "10 Hafta",
    price: "6.000 TL",
    imgSquare: "/images/workshops/kapsamli-sanat-tarihi-kart.webp",
    imgPosition: "center center",
    startLabel: "7 Mayıs'ta başlıyor",
  },
  {
    slug: "leonardo-da-vinci-semineri",
    workshopId: SLUG_TO_ATOLYE["leonardo-da-vinci-semineri"].id,
    title: "Leonardo da Vinci: Sanatın ve Bilimin Kesiştiği Deha",
    description: "Mona Lisa'nın gizemi, Son Akşam Yemeği'nin ötesi — tek oturumda Leonardo'nun evrenini keşfedin.",
    duration: "Tek Oturum",
    price: "600 TL",
    imgSquare: "/images/workshops/leonardo-da-vinci-square.webp",
    imgPosition: "center center",
    startLabel: "1 Nisan",
  },
];

/* ─── Kulüpler ─────────────────────────────────────── */

type ClubItem = {
  slug: string;
  title: string;
  description: string;
  frequency: string;
  priceRange: string;
  imgSquare: string | null;
};

const KLUBLER: ClubItem[] = [
  {
    slug: "sinema-klubu",
    title: "Sinema Kulübü",
    description:
      "Sinema topluluğumuzla ayda bir Zoom'da buluşuyoruz. Film analizleri, tartışmalar ve derinlemesine sinema sohbetleri.",
    frequency: "Ayda 1 · Zoom",
    priceRange: "150 – 3.600 TL",
    imgSquare: null,
  },
];

function computeStatus(nextSessionDate: string | null | undefined): Status {
  if (!nextSessionDate) return "soon";
  return new Date(nextSessionDate) > new Date() ? "open" : "closed";
}

function SeriesKart({ w, status, badgeText }: { w: SeriesWorkshop; status: Status; badgeText?: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/atolyeler/${w.slug}`} style={{ textDecoration: "none" }}>
      <article
        style={{
          background: "#fff",
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: hovered
            ? "0 20px 48px rgba(0,0,0,0.16), 0 8px 20px rgba(0,0,0,0.08)"
            : "0 2px 14px rgba(0,0,0,0.06)",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          transition: "box-shadow 0.3s ease, transform 0.3s ease",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Görsel */}
        <div
          style={{
            position: "relative",
            aspectRatio: "16/7",
            overflow: "hidden",
            background: B.light,
            flexShrink: 0,
          }}
        >
          {w.imgSquare ? (
            <Image
              src={w.imgSquare}
              alt={w.title}
              fill
              quality={95}
              unoptimized
              sizes="(max-width: 900px) 100vw, 900px"
              style={{
                objectFit: "cover",
                objectPosition: w.imgPosition ?? "center center",
                transform: hovered ? "scale(1.05)" : "scale(1)",
                transition: "transform 0.5s ease",
              }}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(135deg, ${B.light} 0%, #e8e2dc 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: B.warm, fontSize: 13, fontWeight: 600, opacity: 0.6 }}>
                Görsel Yakında
              </span>
            </div>
          )}

          {/* Overlay gradient */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(45,41,38,0.38) 0%, transparent 55%)",
              pointerEvents: "none",
            }}
          />

          {/* Badge'ler */}
          <div style={{ position: "absolute", top: 14, left: 14, display: "flex", gap: 7, alignItems: "center" }}>
            {status === "open" && (
              <span
                style={{
                  background: "#22c55e",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 20,
                  letterSpacing: "0.07em",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                ● KAYIT AÇIK
              </span>
            )}
            {status === "closed" && (
              <span
                style={{
                  background: "rgba(0,0,0,0.55)",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 20,
                  letterSpacing: "0.07em",
                }}
              >
                KAYITLAR KAPANDI
              </span>
            )}
            {status === "soon" && (
              <span
                style={{
                  background: "rgba(0,0,0,0.45)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 20,
                  letterSpacing: "0.07em",
                }}
              >
                YAKINDA
              </span>
            )}
            {status === "open" && (
              <span
                style={{
                  background: "rgba(255,255,255,0.18)",
                  backdropFilter: "blur(6px)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "3px 8px",
                  borderRadius: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  letterSpacing: "0.04em",
                }}
              >
                <VideoIcon /> Zoom
              </span>
            )}
            {w.startLabel && status === "open" && (
              <span
                style={{
                  background: "rgba(255,255,255,0.22)",
                  backdropFilter: "blur(6px)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 20,
                  letterSpacing: "0.04em",
                }}
              >
                {w.startLabel}
              </span>
            )}
            {badgeText && (
              <span
                className="live-pulse"
                style={{
                  background: B.coral,
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 20,
                  letterSpacing: "0.07em",
                }}
              >
                {badgeText}
              </span>
            )}
          </div>
        </div>

        {/* İçerik */}
        <div
          style={{
            padding: "24px 26px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 800, color: B.dark, margin: "0 0 8px", lineHeight: 1.25 }}>
            {w.title}
          </h2>
          <p style={{ color: B.warm, fontSize: 14, lineHeight: 1.7, margin: "0 0 14px" }}>
            {w.description}
          </p>

          {/* Belirgin tarih satırı */}
          {w.startLabel && status === "open" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
                padding: "8px 12px",
                background: B.light,
                borderRadius: 8,
                borderLeft: `3px solid ${B.coral}`,
              }}
            >
              <span style={{ color: B.dark, fontSize: 14, fontWeight: 700 }}>
                {w.startLabel}
              </span>
              <span style={{ color: B.warm, fontSize: 12 }}>· {w.duration} · Zoom</span>
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 16,
              borderTop: `1px solid ${B.light}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ color: B.warm, fontSize: 13 }}>{w.duration}</span>
              <span
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  color: status === "open" ? B.coral : B.warm,
                }}
              >
                {w.price}
              </span>
            </div>
            <span
              style={{
                color: B.coral,
                fontSize: 13,
                fontWeight: 700,
                opacity: hovered ? 1 : 0.8,
                transition: "opacity 0.15s",
              }}
            >
              Detayları Gör →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

/* ─── Tekli Oturum kartı ──────────────────────── */

type DbSingleVideoCard = {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  card_image_url: string | null;
  cover_image_url: string | null;
  is_published: boolean;
};

function TekliKart({ v }: { v: DbSingleVideoCard }) {
  const [hovered, setHovered] = useState(false);
  const imgSrc = v.card_image_url ?? v.cover_image_url;

  return (
    <article
      style={{
        background: "#fff",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: hovered ? "0 6px 24px rgba(0,0,0,0.1)" : "0 1px 8px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "box-shadow 0.2s, transform 0.2s",
        cursor: "default",
        opacity: v.is_published ? 1 : 0.7,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Görsel */}
      <div
        style={{
          height: 120,
          position: "relative",
          overflow: "hidden",
          background: B.light,
        }}
      >
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={v.title}
            fill
            quality={85}
            unoptimized
            sizes="(max-width: 600px) 100vw, 300px"
            style={{ objectFit: "cover", objectPosition: "center center" }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(135deg, ${B.light} 0%, #e8e2dc 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: B.warm,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </div>
        )}
        <span
          style={{
            position: "absolute",
            top: 8,
            right: 10,
            background: v.is_published ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.4)",
            color: v.is_published ? "rgba(255,255,255,0.7)" : "#fff",
            fontSize: 9,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 20,
            letterSpacing: "0.06em",
          }}
        >
          {v.is_published ? "KAYITLAR KAPANDI" : "YAKINDA"}
        </span>
      </div>

      {/* İçerik */}
      <div style={{ padding: "14px 16px 16px" }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: B.dark, margin: "0 0 8px", lineHeight: 1.35 }}>
          {v.title}
        </h3>
        {v.duration && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: B.warm }}>
            <ClockIcon />
            <span style={{ fontSize: 12 }}>{v.duration}</span>
          </div>
        )}
        {v.description && (
          <p style={{ color: B.warm, fontSize: 12, lineHeight: 1.5, margin: "6px 0 0" }}>
            {v.description}
          </p>
        )}
      </div>
    </article>
  );
}

/* ─── Kulüp kartı ──────────────────────────────── */

function ClubKart({ club, badgeText }: { club: ClubItem; badgeText?: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/atolyeler/${club.slug}`} style={{ textDecoration: "none" }}>
      <article
        style={{
          background: "#fff",
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: hovered
            ? "0 20px 48px rgba(0,0,0,0.16), 0 8px 20px rgba(0,0,0,0.08)"
            : "0 2px 14px rgba(0,0,0,0.06)",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          transition: "box-shadow 0.3s ease, transform 0.3s ease",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Görsel / Gradient */}
        <div
          style={{
            position: "relative",
            aspectRatio: "16/7",
            overflow: "hidden",
            background:
              "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #1a1a2e 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.25)",
              fontSize: 48,
            }}
          >
            🎬
          </span>

          {/* Overlay gradient */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(45,41,38,0.38) 0%, transparent 55%)",
              pointerEvents: "none",
            }}
          />

          {/* Badge */}
          <div
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              display: "flex",
              gap: 7,
              alignItems: "center",
            }}
          >
            <span
              style={{
                background: "#22c55e",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 20,
                letterSpacing: "0.07em",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              ● KAYIT AÇIK
            </span>
            <span
              style={{
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(6px)",
                color: "#fff",
                fontSize: 10,
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                gap: 4,
                letterSpacing: "0.04em",
              }}
            >
              <VideoIcon /> Zoom
            </span>
            {badgeText && (
              <span
                className="live-pulse"
                style={{
                  background: B.coral,
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 20,
                  letterSpacing: "0.07em",
                }}
              >
                {badgeText}
              </span>
            )}
          </div>
        </div>

        {/* İçerik */}
        <div
          style={{
            padding: "24px 26px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          <h2
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: B.dark,
              margin: "0 0 8px",
              lineHeight: 1.25,
            }}
          >
            {club.title}
          </h2>
          <p style={{ color: B.warm, fontSize: 14, lineHeight: 1.7, margin: "0 0 18px" }}>
            {club.description}
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 16,
              borderTop: `1px solid ${B.light}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ color: B.warm, fontSize: 13 }}>{club.frequency}</span>
              <span
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  color: B.coral,
                }}
              >
                {club.priceRange}
              </span>
            </div>
            <span
              style={{
                color: B.coral,
                fontSize: 13,
                fontWeight: 700,
                opacity: hovered ? 1 : 0.8,
                transition: "opacity 0.15s",
              }}
            >
              Detayları Gör →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

/* ─── Ana Sayfa ───────────────────────────────── */

export default function AtolyelerClient() {
  // Config'deki targetDate'ten başlangıç durumu hesapla (DB fetch gelmeden önce doğru badge göstermek için)
  const [statusMap, setStatusMap] = useState<Record<string, Status>>(() => {
    const map: Record<string, Status> = {};
    for (const w of SERILER) {
      const cfg = SLUG_TO_ATOLYE[w.slug];
      map[w.workshopId] = computeStatus(cfg?.targetDate);
    }
    return map;
  });

  const [tekliVideolar, setTekliVideolar] = useState<DbSingleVideoCard[]>([]);

  useEffect(() => {
    const supabase = createClient();

    // Workshop statuses
    const ids = SERILER.map((w) => w.workshopId);
    supabase
      .from("workshops")
      .select("id, next_session_date")
      .in("id", ids)
      .then(({ data }) => {
        if (!data) return;
        setStatusMap((prev) => {
          const next = { ...prev };
          for (const w of data) {
            // DB'deki next_session_date varsa kullan, yoksa config'den gelen değeri koru
            if (w.next_session_date !== undefined) {
              next[w.id] = computeStatus(w.next_session_date);
            }
          }
          return next;
        });
      });

    // Tekli videolar
    supabase
      .from("single_videos")
      .select("id, title, description, duration, card_image_url, cover_image_url, is_published")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setTekliVideolar(data as DbSingleVideoCard[]);
      });
  }, []);

  const announcementBadges = useAnnouncementBadges("atolyeler");

  return (
    <>
      <AnnouncementBar page="atolyeler" />
      <Navbar />
      <main style={{ background: B.cream, minHeight: "100vh" }}>

        {/* Başlık */}
        <section
          style={{
            maxWidth: 920,
            margin: "0 auto",
            padding: "72px 24px 48px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: B.coral,
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Klemens Atölyeler
          </p>
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 46px)",
              fontWeight: 800,
              color: B.dark,
              margin: "0 0 16px",
              lineHeight: 1.15,
            }}
          >
            Sanatı Birlikte Keşfedelim
          </h1>
          <p style={{ color: B.warm, fontSize: 16, maxWidth: 520, margin: "0 auto", lineHeight: 1.75 }}>
            Canlı Zoom atölyelerinden tek seferlik odaklı oturumlara — sanat tarihi artık çok daha erişilebilir.
          </p>
        </section>

        {/* ═══ BÖLÜM 1: Atölye Serileri ════════════════════ */}
        <section style={{ maxWidth: 920, margin: "0 auto", padding: "0 24px 72px" }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: B.dark, margin: "0 0 6px" }}>
              Atölye Serileri
            </h2>
            <p style={{ color: B.warm, fontSize: 14, margin: 0 }}>
              Canlı Zoom atölyeleri ile sanat tarihine derinlemesine dalış
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
              gap: 22,
            }}
          >
            {[...SERILER]
              .sort((a, b) => {
                const order: Record<Status, number> = { open: 0, soon: 1, closed: 2 };
                const sa = statusMap[a.workshopId] ?? "soon";
                const sb = statusMap[b.workshopId] ?? "soon";
                return order[sa] - order[sb];
              })
              .map((w) => (
                <SeriesKart key={w.slug} w={w} status={statusMap[w.workshopId] ?? "soon"} badgeText={announcementBadges[w.slug]} />
              ))}
          </div>
        </section>

        {/* ═══ BÖLÜM 2: Kulüpler ════════════════════════════ */}
        <section style={{ maxWidth: 920, margin: "0 auto", padding: "0 24px 72px" }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: B.dark, margin: "0 0 6px" }}>
              Kulüpler
            </h2>
            <p style={{ color: B.warm, fontSize: 14, margin: 0 }}>
              Aylık Zoom buluşmalarıyla süregelen topluluklar
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
              gap: 22,
            }}
          >
            {KLUBLER.map((club) => (
              <ClubKart key={club.slug} club={club} badgeText={announcementBadges[club.slug]} />
            ))}
          </div>
        </section>

        {/* ═══ BÖLÜM 3: Tekli Oturumlar ════════════════════ */}
        <section
          style={{
            maxWidth: 920,
            margin: "0 auto",
            padding: "0 24px 80px",
          }}
        >
          {/* Bölüm başlığı */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: 28,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: B.dark, margin: "0 0 6px" }}>
                Tekli Oturumlar
              </h2>
              <p style={{ color: B.warm, fontSize: 14, margin: 0 }}>
                30–45 dakikalık odaklı oturumlar — kayıttan izle, istediğin zaman
              </p>
            </div>
          </div>

          {/* 3'lü grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 16,
              marginBottom: 28,
            }}
          >
            {tekliVideolar.map((v) => (
              <TekliKart key={v.id} v={v} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
