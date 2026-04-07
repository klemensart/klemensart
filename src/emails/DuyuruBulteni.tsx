import { Section, Text, Img, Link, Row, Column, Hr } from "@react-email/components";
import * as React from "react";
import { KlemensLayout, KlemensButton } from "./components/KlemensLayout";

type CurriculumItem = { week: number; title: string };
type FeatureItem = { icon: string; label: string };

type Props = {
  headline?: string;
  imageUrl?: string;
  body1?: string;
  body2?: string;
  buttonText?: string;
  buttonUrl?: string;
  curriculum?: CurriculumItem[];
  features?: FeatureItem[];
  priceText?: string;
  priceSubtext?: string;
};

export default function DuyuruBulteni({
  headline = "Yeni Bir Keşif Sizi Bekliyor",
  imageUrl,
  body1 = "Klemens Art olarak bu sezon, kültür ve düşünce dünyasını yeniden şekillendiren bir program hazırladık. Sanat tarihinden felsefeye, sinemadan psikolojiye uzanan bu yolculukta sizinle birlikte olmak istiyoruz.",
  body2 = "Detayları keşfetmek ve yerinizi ayırtmak için aşağıdaki butona tıklayın.",
  buttonText = "Detayları Keşfedin",
  buttonUrl = "https://klemensart.com",
  curriculum,
  features,
  priceText,
  priceSubtext,
}: Props) {
  const leftCol = curriculum?.filter((_, i) => i < 5) ?? [];
  const rightCol = curriculum?.filter((_, i) => i >= 5) ?? [];

  return (
    <KlemensLayout preview={headline}>
      {/* Hero image */}
      {imageUrl && (
        <Section style={{ padding: "0" }}>
          <Link href={buttonUrl}>
            <Img src={imageUrl} alt="" width="100%" style={{ display: "block" }} />
          </Link>
        </Section>
      )}

      {/* Headline + intro */}
      <Section style={content}>
        <Text style={h1}>{headline}</Text>
        <Text style={p}>{body1}</Text>
        {body2 && <Text style={p}>{body2}</Text>}
      </Section>

      {/* Curriculum grid */}
      {curriculum && curriculum.length > 0 && (
        <>
          <Hr style={sectionDivider} />
          <Section style={content}>
            <Text style={sectionTitle}>10 HAFTA &bull; 10 AKIM</Text>
            <Row>
              <Column style={gridCol}>
                {leftCol.map((item) => (
                  <Text key={item.week} style={weekItem}>
                    <span style={weekNum}>{item.week}</span>
                    {" "}{item.title}
                  </Text>
                ))}
              </Column>
              <Column style={{ width: "24px" }} />
              <Column style={gridCol}>
                {rightCol.map((item) => (
                  <Text key={item.week} style={weekItem}>
                    <span style={weekNum}>{item.week}</span>
                    {" "}{item.title}
                  </Text>
                ))}
              </Column>
            </Row>
          </Section>
        </>
      )}

      {/* Feature highlights */}
      {features && features.length > 0 && (
        <>
          <Hr style={sectionDivider} />
          <Section style={content}>
            <Row>
              {features.map((f, i) => (
                <Column key={i} style={featureCol}>
                  <Text style={featureIcon}>{f.icon}</Text>
                  <Text style={featureLabel}>{f.label}</Text>
                </Column>
              ))}
            </Row>
          </Section>
        </>
      )}

      {/* Price */}
      {priceText && (
        <Section style={{ ...content, paddingTop: "8px" }}>
          <Hr style={sectionDivider} />
          <Text style={priceStyle}>{priceText}</Text>
          {priceSubtext && <Text style={priceSubStyle}>{priceSubtext}</Text>}
        </Section>
      )}

      <KlemensButton href={buttonUrl}>{buttonText}</KlemensButton>
    </KlemensLayout>
  );
}

/* ── Styles ── */

const content: React.CSSProperties = {
  padding: "0 48px",
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

const p: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.75",
  color: "#3d3833",
  margin: "0 0 16px 0",
  textAlign: "center" as const,
};

const sectionDivider: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #e8e4df",
  margin: "24px 48px",
};

const sectionTitle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "3px",
  textTransform: "uppercase" as const,
  color: "#FF6D60",
  textAlign: "center" as const,
  margin: "0 0 20px 0",
};

const gridCol: React.CSSProperties = {
  verticalAlign: "top",
};

const weekItem: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.4",
  color: "#3d3833",
  margin: "0 0 10px 0",
  padding: "0",
};

const weekNum: React.CSSProperties = {
  display: "inline-block",
  width: "22px",
  height: "22px",
  lineHeight: "22px",
  borderRadius: "50%",
  backgroundColor: "#FF6D60",
  color: "#ffffff",
  fontSize: "11px",
  fontWeight: 700,
  textAlign: "center" as const,
};

const featureCol: React.CSSProperties = {
  textAlign: "center" as const,
  verticalAlign: "top",
  width: "33.33%",
};

const featureIcon: React.CSSProperties = {
  fontSize: "28px",
  margin: "0 0 4px 0",
  lineHeight: "1",
};

const featureLabel: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#3d3833",
  margin: "0",
  lineHeight: "1.4",
};

const priceStyle: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "32px",
  fontWeight: 700,
  color: "#1A1A1A",
  textAlign: "center" as const,
  margin: "16px 0 4px 0",
};

const priceSubStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#8C857E",
  textAlign: "center" as const,
  margin: "0 0 8px 0",
};
