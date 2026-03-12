import { Section, Text, Img, Link } from "@react-email/components";
import * as React from "react";
import { KlemensLayout, KlemensButton } from "./components/KlemensLayout";

type ArticleCard = {
  title: string;
  description: string;
  category: string;
  image: string;
  designId: string;
};

type Props = {
  articles?: ArticleCard[];
};

const BASE_URL = "https://klemensart.com";

export default function StoryBildirimi({
  articles = [
    {
      title: "Ornek Makale Basligi",
      description: "Bu bir ornek spot yazisidir.",
      category: "Odak",
      image: "",
      designId: "1",
    },
  ],
}: Props) {
  return (
    <KlemensLayout
      preview={`Yeni story'ler hazir — ${articles.map((a) => a.title).join(" & ")}`}
    >
      <Section style={content}>
        <Text style={heading}>Yeni story&apos;ler hazir!</Text>
        <Text style={subtext}>
          Cron job tarafindan olusturulan story tasarimlari asagida. Duzenleyip
          Instagram&apos;da paylasabilirsiniz.
        </Text>
      </Section>

      {articles.map((article, i) => (
        <Section key={i} style={card}>
          {article.image && (
            <Img
              src={article.image}
              alt={article.title}
              width="100%"
              style={cardImage}
            />
          )}
          <Text style={categoryLabel}>
            {article.category.toUpperCase()}
          </Text>
          <Text style={cardTitle}>{article.title}</Text>
          <Text style={cardDesc}>{article.description}</Text>
          <KlemensButton
            href={`${BASE_URL}/admin/tasarim/${article.designId}`}
          >
            Editorde Ac
          </KlemensButton>
        </Section>
      ))}

      <KlemensButton href={`${BASE_URL}/admin/tasarim`}>
        Tum Tasarimlari Gor
      </KlemensButton>
    </KlemensLayout>
  );
}

const content: React.CSSProperties = {
  padding: "0 48px",
};

const heading: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "26px",
  fontWeight: 700,
  color: "#1A1A1A",
  lineHeight: "1.3",
  margin: "0 0 12px 0",
  textAlign: "center" as const,
};

const subtext: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.7",
  color: "#7a7470",
  margin: "0 0 28px 0",
  textAlign: "center" as const,
};

const card: React.CSSProperties = {
  padding: "0 48px",
  margin: "0 0 16px 0",
};

const cardImage: React.CSSProperties = {
  display: "block",
  borderRadius: "8px",
  margin: "0 0 16px 0",
};

const categoryLabel: React.CSSProperties = {
  fontFamily: "Helvetica, Arial, sans-serif",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "2px",
  color: "#FF6D60",
  margin: "0 0 6px 0",
};

const cardTitle: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "20px",
  fontWeight: 700,
  color: "#1A1A1A",
  lineHeight: "1.3",
  margin: "0 0 8px 0",
};

const cardDesc: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.65",
  color: "#3d3833",
  margin: "0 0 12px 0",
};
