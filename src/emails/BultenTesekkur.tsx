import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { KlemensLayout, KlemensButton } from "./components/KlemensLayout";

type Props = {
  name?: string;
};

export default function BultenTesekkur({
  name = "Sanat Sever",
}: Props) {
  return (
    <KlemensLayout preview="Klemens Art e-bültenine hoş geldiniz!">
      <Section style={content}>
        <Text style={heading}>Hoş Geldiniz!</Text>

        <Text style={paragraph}>
          Merhaba {name}, Klemens Art e-bültenine abone olduğunuz için çok
          teşekkür ederiz!
        </Text>

        <div style={infoBox}>
          <Text style={infoTitle}>Bültenimizde Neler Var</Text>
          <Text style={infoItem}>Yeni atölye duyuruları ve erken kayıt fırsatları</Text>
          <Text style={infoItem}>Kültür-sanat içerikleri ve yazılar</Text>
          <Text style={infoItem}>Etkinlik davetleri ve özel indirimler</Text>
        </div>

        <Text style={paragraph}>
          Sitemizde yayınlanan tüm içeriklere, atölye bilgilerine ve etkinlik duyurularına
          göz atabilirsiniz.
        </Text>

        <KlemensButton href="https://klemensart.com/icerikler">
          İçerikleri Keşfet
        </KlemensButton>

        <Text style={paragraph}>
          Herhangi bir sorunuz olursa{" "}
          <Link href="mailto:info@klemensart.com" style={link}>info@klemensart.com</Link> adresinden
          bize ulaşabilirsiniz.
        </Text>

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

const link: React.CSSProperties = {
  color: "#FF6D60",
  textDecoration: "none",
  fontWeight: 600,
};

const infoBox: React.CSSProperties = {
  background: "#FFFBF7",
  borderRadius: "12px",
  padding: "28px 32px",
  margin: "0 0 28px 0",
  borderLeft: "3px solid #FF6D60",
};

const infoTitle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 700,
  letterSpacing: "2px",
  color: "#FF6D60",
  textTransform: "uppercase" as const,
  margin: "0 0 16px 0",
};

const infoItem: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.8",
  color: "#3d3833",
  margin: "0 0 6px 0",
};

const closing: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.8",
  color: "#3d3833",
  margin: "0 0 0 0",
};
