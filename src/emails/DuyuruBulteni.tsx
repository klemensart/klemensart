import { Section, Text } from "@react-email/components";
import * as React from "react";
import { KlemensLayout, KlemensButton } from "./components/KlemensLayout";

type Props = {
  headline?: string;
  body1?: string;
  body2?: string;
  buttonText?: string;
  buttonUrl?: string;
};

export default function DuyuruBulteni({
  headline = "Yeni Bir Keşif Sizi Bekliyor",
  body1 = "Klemens Art olarak bu sezon, kültür ve düşünce dünyasını yeniden şekillendiren bir program hazırladık. Sanat tarihinden felsefeye, sinemadan psikolojiye uzanan bu yolculukta sizinle birlikte olmak istiyoruz.",
  body2 = "Detayları keşfetmek ve yerinizi ayırtmak için aşağıdaki butona tıklayın.",
  buttonText = "Detayları Keşfedin",
  buttonUrl = "https://klemensart.com",
}: Props) {
  return (
    <KlemensLayout preview={headline}>
      <Section style={content}>
        <Text style={h1}>{headline}</Text>
        <Text style={p}>{body1}</Text>
        {body2 && <Text style={p}>{body2}</Text>}
      </Section>

      <KlemensButton href={buttonUrl}>{buttonText}</KlemensButton>
    </KlemensLayout>
  );
}

const content: React.CSSProperties = {
  padding: "0 48px",
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

const p: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.75",
  color: "#3d3833",
  margin: "0 0 16px 0",
  textAlign: "center" as const,
};
