import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { KlemensLayout, KlemensButton } from "./components/KlemensLayout";

type Props = {
  name?: string;
  workshopTitle?: string;
};

export default function AtolyeTesekkur({
  name = "Sanat Sever",
  workshopTitle = "Atölye",
}: Props) {
  return (
    <KlemensLayout preview={`${workshopTitle} atölyesini satın aldığınız için teşekkürler!`}>
      <Section style={content}>
        <Text style={heading}>Teşekkürler, {name}!</Text>

        <Text style={paragraph}>
          <strong style={strong}>{workshopTitle}</strong> atölyemizi satın aldığınız için çok
          teşekkür ederiz. Loca&rsquo;nıza erişim artık hazır!
        </Text>

        <div style={infoBox}>
          <Text style={infoTitle}>Loca&rsquo;nızda Sizi Neler Bekliyor</Text>
          <Text style={infoItem}>Atölye videolarına anında erişim</Text>
          <Text style={infoItem}>Canlı Zoom oturumlarında katılım hakkı</Text>
          <Text style={infoItem}>PDF materyaller ve ek kaynaklar</Text>
        </div>

        <Text style={paragraph}>
          Giriş yaptıktan sonra profil sayfanızdaki <strong style={strong}>Loca</strong> sekmesinden
          satın aldığınız atölyeye, kayıtlara ve materyallere doğrudan erişebilirsiniz.
        </Text>

        <KlemensButton href="https://klemensart.com/club/profil">
          Loca&rsquo;ya Git
        </KlemensButton>

        <Text style={paragraph}>
          Herhangi bir sorunuz veya erişim probleminiz olursa{" "}
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
