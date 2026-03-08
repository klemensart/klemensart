import { Section, Text } from "@react-email/components";
import * as React from "react";
import { KlemensLayout, KlemensButton } from "./components/KlemensLayout";

type Props = {
  name?: string;
};

export default function HosGeldiniz({ name }: Props) {
  const greeting = name ? `${name}, Klemens Art'a Hoş Geldiniz` : "Klemens Art'a Hoş Geldiniz";

  return (
    <KlemensLayout preview="Klemens Art ailesine hoş geldiniz.">
      <Section style={content}>
        <Text style={h1}>{greeting}</Text>

        <Text style={p}>
          Kültürün ve düşüncenin peşindesiniz — bu bizi çok heyecanlandırıyor.
        </Text>

        <Text style={p}>
          Klemens Art, sanat tarihi, sinema, felsefe ve psikoloji gibi alanlarda
          derinleşmenizi sağlayan bir kültür platformu. Burada sizi bekleyen
          keşifler:
        </Text>

        <Text style={listItem}>
          &#9672;&ensp;Canlı Zoom atölyeleri ve seminerler
        </Text>
        <Text style={listItem}>
          &#9672;&ensp;Küratöryel içerikler ve tematik okuma listeleri
        </Text>
        <Text style={listItem}>
          &#9672;&ensp;Bağımsız bir toplulukla fikir alışverişi
        </Text>

        <Text style={p}>
          Yolculuğunuz burada başlıyor. Platformu keşfederek
          size en uygun programı bulun.
        </Text>
      </Section>

      <KlemensButton href="https://klemensart.com">
        Platformu Keşfedin
      </KlemensButton>
    </KlemensLayout>
  );
}

const content: React.CSSProperties = {
  padding: "0 48px",
};

const h1: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "26px",
  fontWeight: 700,
  color: "#1A1A1A",
  lineHeight: "1.35",
  margin: "0 0 28px 0",
  textAlign: "center" as const,
};

const p: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.75",
  color: "#3d3833",
  margin: "0 0 16px 0",
};

const listItem: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#3d3833",
  margin: "0 0 8px 0",
  paddingLeft: "8px",
};
