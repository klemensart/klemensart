import { Section, Text, Hr, Img, Link } from "@react-email/components";
import * as React from "react";
import { KlemensLayout, KlemensButton } from "./components/KlemensLayout";

type Props = {
  eventTitle?: string;
  imageUrl?: string;
  eventDate?: string;
  eventTime?: string;
  zoomLink?: string;
  calendarUrl?: string;
};

export default function SeminerHatirlatici({
  eventTitle = "Caravaggio ve Karanlığın Estetiği",
  imageUrl,
  eventDate = "9 Mart 2026, Pazartesi",
  eventTime = "20:30 (TSI)",
  zoomLink = "https://zoom.us/j/123456789",
  calendarUrl = "https://klemensart.com/takvim",
}: Props) {
  return (
    <KlemensLayout preview={`Yarın: ${eventTitle}`}>
      <Section style={content}>
        <Text style={eyebrow}>HATIRLATMA</Text>
        <Text style={h1}>Yarın Buluşuyoruz</Text>
        {imageUrl && (
          <Link href={calendarUrl}>
            <Img src={imageUrl} alt="" width="100%" style={heroImg} />
          </Link>
        )}

        <Text style={p}>
          Saatler azalıyor — yarın akşam, birlikte yeni bir düşünce
          yolculuğuna çıkıyoruz. Kendinize bir çay demleyin, rahat bir
          köşede yerinizi alın ve zihninizi açık tutun.
        </Text>

        <Hr style={thinDivider} />

        <Text style={detailLabel}>ETKINLIK</Text>
        <Text style={detailValue}>{eventTitle}</Text>

        <Text style={detailLabel}>TARIH & SAAT</Text>
        <Text style={detailValue}>{eventDate} &mdash; {eventTime}</Text>

        <Text style={detailLabel}>KATILIM</Text>
        <Text style={detailValue}>
          Zoom üzerinden canlı yayınlanacaktır.
        </Text>

        <Hr style={thinDivider} />
      </Section>

      <KlemensButton href={calendarUrl}>Takvime Ekle</KlemensButton>

      <Section style={content}>
        <Text style={small}>
          Zoom bağlantı linkiniz etkinlik saatinden 15 dakika önce
          ayrı bir e-posta ile iletilecektir.
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
  margin: "0 0 24px 0",
  textAlign: "center" as const,
};

const heroImg: React.CSSProperties = {
  display: "block",
  margin: "0 0 24px 0",
  borderRadius: "8px",
};

const p: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.75",
  color: "#3d3833",
  margin: "0 0 24px 0",
  textAlign: "center" as const,
};

const thinDivider: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #e8e4df",
  margin: "24px 0",
};

const detailLabel: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
  color: "#999999",
  margin: "0 0 4px 0",
};

const detailValue: React.CSSProperties = {
  fontSize: "16px",
  color: "#1A1A1A",
  fontWeight: 600,
  margin: "0 0 20px 0",
  lineHeight: "1.5",
};

const small: React.CSSProperties = {
  fontSize: "13px",
  color: "#999999",
  textAlign: "center" as const,
  margin: "0",
  lineHeight: "1.6",
};
