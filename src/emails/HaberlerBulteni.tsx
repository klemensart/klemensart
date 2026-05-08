import { Section, Text, Hr, Link, Img } from "@react-email/components";
import * as React from "react";
import { KlemensLayout, KlemensButton } from "./components/KlemensLayout";

type NewsItem = {
  title: string;
  summary: string;
  url: string;
  image_url?: string;
  source_name?: string;
};

type SpotlightConfig = {
  label: string;
  subtitle: string;
  items: NewsItem[];
};

type Props = {
  weekLabel?: string;
  editorialIntro?: string;
  newsItems?: NewsItem[];
  weekSlug?: string;
  spotlight?: SpotlightConfig;
};

export default function HaberlerBulteni({
  weekLabel = "10–16 Mart 2026",
  editorialIntro = "Bu hafta kültür-sanat dünyasından öne çıkan gelişmeleri sizin için derledik.",
  newsItems = [
    {
      title: "İstanbul Modern Yeni Sergisiyle Kapılarını Açtı",
      summary: "Müze, çağdaş Türk sanatının son on yılına odaklanan kapsamlı bir seçkiyle ziyaretçilerini karşılıyor.",
      url: "https://klemensart.com/bulten/arsiv",
      source_name: "Artnet",
    },
  ],
  weekSlug,
  spotlight,
}: Props) {
  const totalCount = newsItems.length + (spotlight?.items.length ?? 0);

  return (
    <KlemensLayout preview={`${weekLabel} · ${totalCount} haber`}>
      <Section style={content}>
        <Text style={eyebrow}>{weekLabel}</Text>
        <Text style={h1}>Haftanın Kültür Sanat Gündemi</Text>
        <Text style={pCenter}>{editorialIntro}</Text>
      </Section>

      {spotlight && spotlight.items.length > 0 && (
        <Section style={spotlightBox}>
          {/* Badge */}
          <Text style={spotlightBadge}>{spotlight.label}</Text>
          <Text style={spotlightSubtitle}>{spotlight.subtitle}</Text>

          {/* Hero — ilk haber */}
          {spotlight.items[0].image_url && (
            <Img
              src={spotlight.items[0].image_url}
              alt={spotlight.items[0].title}
              width="100%"
              style={spotlightHeroImage}
            />
          )}
          <Text style={spotlightHeroTitle}>
            {spotlight.items[0].title}
          </Text>
          <Text style={spotlightHeroSummary}>
            {spotlight.items[0].summary}
          </Text>
          <Text style={spotlightHeroFooter}>
            {spotlight.items[0].source_name && (
              <span style={spotlightSourceName}>
                {spotlight.items[0].source_name}
              </span>
            )}
            {spotlight.items[0].source_name && " · "}
            <Link href={spotlight.items[0].url} style={spotlightCoralLink}>
              Devamını Oku &rarr;
            </Link>
          </Text>

          {/* Kalan spotlight haberleri — kompakt liste */}
          {spotlight.items.length > 1 && (
            <>
              <Hr style={spotlightDivider} />
              {spotlight.items.slice(1).map((item, i) => (
                <React.Fragment key={`sp-${i}`}>
                  <Text style={spotlightListItem}>
                    <span style={spotlightArrow}>&rarr; </span>
                    {item.title}
                  </Text>
                  <Text style={spotlightListMeta}>
                    {item.source_name && (
                      <span style={spotlightListSource}>
                        {item.source_name}
                      </span>
                    )}
                    {item.source_name && " · "}
                    <Link href={item.url} style={spotlightCoralLink}>
                      Devamını Oku &rarr;
                    </Link>
                  </Text>
                </React.Fragment>
              ))}
            </>
          )}
        </Section>
      )}

      <Section style={content}>
        <Hr style={coralDivider} />
        <Text style={sectionTitle}>Öne Çıkan Haberler</Text>

        {newsItems.map((item, i) => (
          <React.Fragment key={i}>
            {item.image_url && (
              <Img
                src={item.image_url}
                alt={item.title}
                width="100%"
                style={newsImage}
              />
            )}
            <Text style={newsTitle}>{item.title}</Text>
            <Text style={newsSummary}>{item.summary}</Text>
            <Text style={newsFooter}>
              {item.source_name && (
                <span style={sourceName}>{item.source_name}</span>
              )}
              {item.source_name && " · "}
              <Link href={item.url} style={coralLink}>
                Devamını Oku &rarr;
              </Link>
            </Text>
            {i < newsItems.length - 1 && <Hr style={lightDivider} />}
          </React.Fragment>
        ))}
      </Section>

      <KlemensButton href={weekSlug ? `https://klemensart.com/bulten/${weekSlug}` : "https://klemensart.com/bulten/arsiv"}>
        Bu Haftanın Tüm Haberleri
      </KlemensButton>

      {/* Quiz CTA — minimal, zarif */}
      <Section style={quizSection}>
        <Hr style={lightDivider} />
        <Text style={quizText}>
          Sanat tarihi bilginizi test etmek ister misiniz?
        </Text>
        <Text style={quizLinks}>
          <Link href="https://klemensart.com/testler/ronesans-quiz" style={quizLink}>
            Rönesans Testi
          </Link>
          <span style={quizDot}> · </span>
          <Link href="https://klemensart.com/testler/modern-sanat-quiz" style={quizLink}>
            Modern Sanat Testi
          </Link>
        </Text>
      </Section>
    </KlemensLayout>
  );
}

const content: React.CSSProperties = { padding: "0 48px" };

const eyebrow: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "3px",
  textTransform: "uppercase" as const,
  color: "#FF6D60",
  textAlign: "center" as const,
  margin: "0 0 8px 0",
};

const h1: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "28px",
  fontWeight: 700,
  color: "#1A1A1A",
  lineHeight: "1.3",
  margin: "0 0 20px 0",
  textAlign: "center" as const,
};

const pCenter: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.75",
  color: "#3d3833",
  margin: "0 0 8px 0",
  textAlign: "center" as const,
};

const coralDivider: React.CSSProperties = {
  border: "none",
  borderTop: "2px solid #FF6D60",
  margin: "32px auto",
  width: "40px",
};

const lightDivider: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #f0ece8",
  margin: "24px 0",
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "18px",
  fontWeight: 700,
  color: "#1A1A1A",
  textAlign: "center" as const,
  margin: "0 0 24px 0",
};

const newsImage: React.CSSProperties = {
  display: "block",
  width: "100%",
  borderRadius: "8px",
  marginBottom: "16px",
};

const newsTitle: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "18px",
  fontWeight: 700,
  color: "#1A1A1A",
  margin: "0 0 8px 0",
  lineHeight: "1.4",
};

const newsSummary: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.7",
  color: "#3d3833",
  margin: "0 0 10px 0",
};

const newsFooter: React.CSSProperties = {
  margin: "0",
  lineHeight: "1.6",
};

const sourceName: React.CSSProperties = {
  fontSize: "12px",
  color: "#999999",
};

const coralLink: React.CSSProperties = {
  color: "#FF6D60",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "14px",
};

const quizSection: React.CSSProperties = {
  padding: "0 48px 8px",
};

const quizText: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "14px",
  fontStyle: "italic" as const,
  color: "#999999",
  textAlign: "center" as const,
  margin: "16px 0 8px 0",
};

const quizLinks: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "0",
};

const quizLink: React.CSSProperties = {
  color: "#FF6D60",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "13px",
};

const quizDot: React.CSSProperties = {
  color: "#cccccc",
  fontSize: "13px",
};

// ── Spotlight (Koyu Kutu) Stilleri ──────────────────────────────────────────

const spotlightBox: React.CSSProperties = {
  backgroundColor: "#302B27",
  padding: "32px",
  borderRadius: "8px",
  margin: "0 24px",
};

const spotlightBadge: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#FF6D60",
  color: "#ffffff",
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
  padding: "4px 10px",
  borderRadius: "3px",
  margin: "0 0 8px 0",
};

const spotlightSubtitle: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "16px",
  color: "#a09890",
  margin: "0 0 20px 0",
  lineHeight: "1.4",
};

const spotlightHeroImage: React.CSSProperties = {
  display: "block",
  width: "100%",
  borderRadius: "8px",
  marginBottom: "16px",
};

const spotlightHeroTitle: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "20px",
  fontWeight: 700,
  color: "#ffffff",
  margin: "0 0 8px 0",
  lineHeight: "1.4",
};

const spotlightHeroSummary: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.7",
  color: "#a09890",
  margin: "0 0 10px 0",
};

const spotlightHeroFooter: React.CSSProperties = {
  margin: "0",
  lineHeight: "1.6",
};

const spotlightSourceName: React.CSSProperties = {
  fontSize: "12px",
  color: "#666666",
};

const spotlightCoralLink: React.CSSProperties = {
  color: "#FF6D60",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "13px",
};

const spotlightDivider: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #4a4540",
  margin: "20px 0",
};

const spotlightListItem: React.CSSProperties = {
  fontSize: "15px",
  color: "#ffffff",
  margin: "0 0 2px 0",
  lineHeight: "1.5",
};

const spotlightArrow: React.CSSProperties = {
  color: "#FF6D60",
};

const spotlightListMeta: React.CSSProperties = {
  fontSize: "12px",
  color: "#777777",
  margin: "0 0 14px 0",
  lineHeight: "1.4",
};

const spotlightListSource: React.CSSProperties = {
  color: "#777777",
};
