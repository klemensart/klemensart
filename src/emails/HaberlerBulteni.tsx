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

type Props = {
  weekLabel?: string;
  editorialIntro?: string;
  newsItems?: NewsItem[];
  weekSlug?: string;
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
}: Props) {
  return (
    <KlemensLayout preview={`${weekLabel} · ${newsItems.length} haber`}>
      <Section style={content}>
        <Text style={eyebrow}>{weekLabel}</Text>
        <Text style={h1}>Haftanın Kültür Sanat Gündemi</Text>
        <Text style={pCenter}>{editorialIntro}</Text>
      </Section>

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
