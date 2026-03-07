import { Section, Text } from "@react-email/components";
import * as React from "react";
import { KlemensLayout, KlemensButton } from "./components/KlemensLayout";

type Props = {
  name?: string;
};

export default function HosGeldiniz({ name }: Props) {
  const greeting = name ? `${name}, Klemens Art'a Hos Geldiniz` : "Klemens Art'a Hos Geldiniz";

  return (
    <KlemensLayout preview="Klemens Art ailesine hosgeldiniz.">
      <Section style={content}>
        <Text style={h1}>{greeting}</Text>

        <Text style={p}>
          Kulturun ve dusuncenin pesindesiniz — bu bizi cok heyecanlandiriyor.
        </Text>

        <Text style={p}>
          Klemens Art, sanat tarihi, sinema, felsefe ve psikoloji gibi alanlarda
          derinlesmenizi saglayan bir kultur platformu. Burada sizi bekleyen
          kesfifler:
        </Text>

        <Text style={listItem}>
          &#9672;&ensp;Canli Zoom atolyeleri ve seminerler
        </Text>
        <Text style={listItem}>
          &#9672;&ensp;Kuratoryel icerikler ve tematik okuma listeleri
        </Text>
        <Text style={listItem}>
          &#9672;&ensp;Bagimsiz bir toplulukla fikir alisverisi
        </Text>

        <Text style={p}>
          Yolculugunuz burada basliyor. Platformu kesfederek
          size en uygun programi bulun.
        </Text>
      </Section>

      <KlemensButton href="https://klemensart.com">
        Platformu Kesfedin
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
