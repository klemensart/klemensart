import { Section, Text, Hr } from "@react-email/components";
import * as React from "react";
import { KlemensLayout, KlemensButton } from "./components/KlemensLayout";

type Props = {
  eventTitle?: string;
  replayUrl?: string;
  bibliography?: Array<{ title: string; author?: string; type?: string }>;
};

export default function EtkinlikTesekkur({
  eventTitle = "Caravaggio ve Karanligin Estetigi",
  replayUrl = "https://klemensart.com/arsiv",
  bibliography = [
    { title: "Caravaggio: A Life Sacred and Profane", author: "Andrew Graham-Dixon", type: "Kitap" },
    { title: "The Story of Art", author: "E.H. Gombrich", type: "Kitap" },
    { title: "Caravaggio (2007)", author: "Yon: Angelo Longoni", type: "Film" },
  ],
}: Props) {
  return (
    <KlemensLayout preview={`${eventTitle} — Kayit ve Bibliyografya`}>
      <Section style={content}>
        <Text style={h1}>Tesekkurler</Text>

        <Text style={p}>
          Dun aksam birlikte gecirdigimiz zaman icin tesekkur ederiz.
          &ldquo;{eventTitle}&rdquo; etkinligimiz tamamlandi ve
          kaydi sizin icin hazirladik.
        </Text>

        <Text style={p}>
          Etkinlik boyunca paylasilan dusunceler, sorular ve o canli
          diyaloglar — hepsi arsivimizde yerini aliyor.
        </Text>
      </Section>

      <KlemensButton href={replayUrl}>Kaydi Izleyin</KlemensButton>

      {bibliography.length > 0 && (
        <Section style={content}>
          <Hr style={coralDivider} />

          <Text style={bibTitle}>Klemens Art Bibliyografyasi</Text>
          <Text style={bibSubtitle}>
            Bu etkinlikte gecen ve onerilen kaynaklar:
          </Text>

          {bibliography.map((item, i) => (
            <Text key={i} style={bibItem}>
              <span style={bibIndex}>{String(i + 1).padStart(2, "0")}</span>
              <span style={bibItemTitle}>{item.title}</span>
              {item.author && (
                <span style={bibAuthor}>&ensp;&mdash;&ensp;{item.author}</span>
              )}
              {item.type && (
                <span style={bibType}>&ensp;[{item.type}]</span>
              )}
            </Text>
          ))}

          <Hr style={coralDivider} />
        </Section>
      )}
    </KlemensLayout>
  );
}

const content: React.CSSProperties = { padding: "0 48px" };

const h1: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "28px",
  fontWeight: 700,
  color: "#1A1A1A",
  lineHeight: "1.3",
  margin: "0 0 24px 0",
  textAlign: "center" as const,
};

const p: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.75",
  color: "#3d3833",
  margin: "0 0 16px 0",
};

const coralDivider: React.CSSProperties = {
  border: "none",
  borderTop: "2px solid #FF6D60",
  margin: "32px auto",
  width: "40px",
};

const bibTitle: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "18px",
  fontWeight: 700,
  color: "#1A1A1A",
  textAlign: "center" as const,
  margin: "0 0 4px 0",
};

const bibSubtitle: React.CSSProperties = {
  fontSize: "13px",
  color: "#999999",
  textAlign: "center" as const,
  margin: "0 0 24px 0",
};

const bibItem: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#3d3833",
  margin: "0 0 12px 0",
  paddingBottom: "12px",
  borderBottom: "1px solid #f0ece8",
};

const bibIndex: React.CSSProperties = {
  fontSize: "12px",
  color: "#FF6D60",
  fontWeight: 700,
  marginRight: "12px",
};

const bibItemTitle: React.CSSProperties = {
  fontWeight: 600,
  color: "#1A1A1A",
};

const bibAuthor: React.CSSProperties = {
  fontStyle: "italic" as const,
  color: "#666666",
};

const bibType: React.CSSProperties = {
  fontSize: "11px",
  color: "#999999",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};
