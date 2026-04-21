import { Section, Text, Link, Img, Hr } from "@react-email/components";
import * as React from "react";
import { KlemensLayout } from "./components/KlemensLayout";

type Props = {
  eventTitle?: string;
  eventSubtitle?: string;
  posterUrl?: string;
  eventDate?: string;
  eventTime?: string;
  eventVenue?: string;
  speakerName?: string;
  price?: string;
  introText?: string;
  ctaUrl?: string;
  ctaText?: string;
  signatureName?: string;
  signatureTitle?: string;
  previewText?: string;
  preferenceUrl?: string;
};

export default function SeminerDuyuru({
  eventTitle = "Seminer",
  eventSubtitle,
  posterUrl,
  eventDate = "",
  eventTime = "",
  eventVenue = "",
  speakerName = "",
  price = "Katılım ücretsiz",
  introText = "",
  ctaUrl = "https://klemensart.com",
  ctaText = "Katılmak İstiyorum",
  signatureName = "Kerem Hun",
  signatureTitle = "Klemens",
  previewText,
  preferenceUrl,
}: Props) {
  // introText'i paragraflarına ayır, class="question" olanları özel işle
  const paragraphs = introText
    ? introText
        .split(/<\/?p[^>]*>/gi)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  // class="question" tespit: orijinal HTML'den question p'lerini bul
  const questionMatches = new Set<string>();
  const qRegex = /<p[^>]*class="question"[^>]*>(.*?)<\/p>/gi;
  let qMatch;
  while ((qMatch = qRegex.exec(introText || "")) !== null) {
    // İçindeki tag'ları temizle
    const clean = qMatch[1].replace(/<\/?[^>]+>/g, "").trim();
    questionMatches.add(clean);
  }

  return (
    <KlemensLayout
      preview={previewText || `${eventTitle} — ${eventDate}`}
      preferenceUrl={preferenceUrl}
    >
      {/* ── 1. Poster ── */}
      {posterUrl && (
        <Section style={posterSection}>
          <Img
            src={posterUrl}
            alt={eventTitle}
            width="600"
            style={posterImg}
          />
        </Section>
      )}

      <Section style={content}>
        {/* ── 2. Selamlama ── */}
        <Text style={greeting}>Merhaba,</Text>

        {/* ── 3-5. Intro paragraflar ── */}
        {paragraphs.map((p, i) => {
          // <em> tag'larını koru
          const cleanForCheck = p.replace(/<\/?[^>]+>/g, "").trim();
          const isQuestion = questionMatches.has(cleanForCheck);

          if (isQuestion) {
            // ── 4. Orta vurgu — italik, serif, ortalanmış ──
            const innerText = p.replace(/<\/?em>/g, "");
            return (
              <Text key={i} style={questionStyle}>
                <em>{innerText}</em>
              </Text>
            );
          }

          // Normal paragraf — <em> ve <strong> destekle
          return (
            <Text
              key={i}
              style={paragraph}
              dangerouslySetInnerHTML={{ __html: p }}
            />
          );
        })}

        {/* ── 6. Pratik bilgiler bloğu ── */}
        <div style={infoBox}>
          {(eventDate || eventTime) && (
            <Text style={infoItem}>
              {"\uD83D\uDCC5"} {eventDate}{eventTime ? `, ${eventTime}` : ""}
            </Text>
          )}
          {eventVenue && (
            <Text style={infoItem}>
              {"\uD83D\uDCCD"} {eventVenue}
            </Text>
          )}
          {(speakerName || price) && (
            <Text style={infoItem}>
              {"\uD83C\uDFA4"} {speakerName}{price ? ` / ${price}` : ""}
            </Text>
          )}
        </div>

        {/* ── 8. CTA butonu ── */}
        <Section style={ctaSection}>
          <Link href={ctaUrl} style={ctaButton}>
            {ctaText} →
          </Link>
        </Section>

        <Hr style={divider} />

        {/* ── 9. İmza ── */}
        <Text style={signatureClosing}>
          Cumartesi görüşmek umuduyla,
        </Text>
        <Text style={signatureBlock}>
          <strong style={signatureNameStyle}>{signatureName}</strong>
          <br />
          <span style={signatureTitleStyle}>{signatureTitle}</span>
        </Text>
      </Section>
    </KlemensLayout>
  );
}

/* ── Styles ── */

const posterSection: React.CSSProperties = {
  padding: 0,
  margin: 0,
};

const posterImg: React.CSSProperties = {
  display: "block",
  width: "100%",
  maxWidth: "600px",
  height: "auto",
  margin: 0,
};

const content: React.CSSProperties = {
  padding: "32px 48px 0 48px",
};

const greeting: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.8",
  color: "#3d3833",
  margin: "0 0 20px 0",
};

const paragraph: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.7",
  color: "#3d3833",
  margin: "0 0 16px 0",
};

const questionStyle: React.CSSProperties = {
  fontSize: "20px",
  lineHeight: "1.5",
  color: "#2D2926",
  fontFamily: "Georgia, 'Times New Roman', Times, serif",
  fontStyle: "italic",
  textAlign: "center" as const,
  margin: "28px 0",
  padding: "0 16px",
};

const infoBox: React.CSSProperties = {
  backgroundColor: "#f9f7f5",
  borderRadius: "12px",
  padding: "24px 28px",
  margin: "24px 0",
};

const infoItem: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.8",
  color: "#3d3833",
  margin: "0 0 4px 0",
};

const ctaSection: React.CSSProperties = {
  textAlign: "center" as const,
  padding: "8px 0 28px 0",
};

const ctaButton: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#FF6D60",
  color: "#ffffff",
  fontFamily: "Helvetica, Arial, sans-serif",
  fontSize: "15px",
  fontWeight: 600,
  letterSpacing: "0.5px",
  textDecoration: "none",
  padding: "16px 40px",
  borderRadius: "50px",
  textAlign: "center" as const,
};

const divider: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #e8e4df",
  margin: "4px 0 24px 0",
};

const signatureClosing: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.8",
  color: "#3d3833",
  margin: "0 0 4px 0",
};

const signatureBlock: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#3d3833",
  margin: "0 0 0 0",
};

const signatureNameStyle: React.CSSProperties = {
  color: "#2D2926",
  fontWeight: 700,
};

const signatureTitleStyle: React.CSSProperties = {
  color: "#9a928a",
  fontSize: "14px",
};
