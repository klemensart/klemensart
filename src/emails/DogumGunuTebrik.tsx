import { Section, Text } from "@react-email/components";
import * as React from "react";
import { KlemensLayout, KlemensButton } from "./components/KlemensLayout";

type Props = {
  name?: string;
};

export default function DogumGunuTebrik({
  name = "Sanat Sever",
}: Props) {
  return (
    <KlemensLayout preview={`Doğum günün kutlu olsun, ${name}!`}>
      <Section style={content}>
        <Text style={heading}>Doğum Günün Kutlu Olsun!</Text>

        <Text style={paragraph}>
          Sevgili {name},
        </Text>

        <Text style={paragraph}>
          Doğum günün kutlu olsun! Yeni yaşın sana bol bol ilham, neşe ve
          güzelliklerle dolu günler getirsin.
        </Text>

        <Text style={paragraph}>
          Sanatla, kültürle ve sevdikleriyle geçen bir yıl diliyoruz sana.
          Klemens Art ailesi olarak yanında olmaktan büyük mutluluk duyuyoruz.
        </Text>

        <Text style={paragraph}>
          Nice güzel yaşlara, nice güzel sergilere!
        </Text>

        <KlemensButton href="https://klemensart.com/icerikler">
          Yeni İçerikleri Keşfet
        </KlemensButton>

        <Text style={closing}>
          Sevgiyle,<br />
          <strong style={strong}>Klemens Art Ekibi</strong>
        </Text>
      </Section>
    </KlemensLayout>
  );
}

const content: React.CSSProperties = {
  padding: "0 48px",
};

const heading: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 700,
  color: "#2D2926",
  textAlign: "center" as const,
  lineHeight: "1.4",
  margin: "0 0 28px 0",
};

const paragraph: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.8",
  color: "#3d3833",
  margin: "0 0 18px 0",
};

const strong: React.CSSProperties = {
  color: "#2D2926",
};

const closing: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.8",
  color: "#3d3833",
  margin: "0 0 0 0",
};
