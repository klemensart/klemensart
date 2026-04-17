import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { KlemensLayout, KlemensButton } from "./components/KlemensLayout";

const PDF_URL =
  "https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/rehberler/bodrum-sualti-arkeoloji-muzesi.pdf";

type Props = {
  name?: string;
};

export default function BodrumMuzeTesekkur({
  name = "Sanat Sever",
}: Props) {
  return (
    <KlemensLayout preview="Bodrum Sualtı Arkeoloji Müzesi rehberiniz hazır — hemen indirin!">
      <Section style={content}>
        <Text style={heading}>Bodrum Müze Rehberiniz Hazır!</Text>

        <Text style={paragraph}>
          Merhaba {name}, Bodrum Sualtı Arkeoloji Müzesi rehberinizi aşağıdaki
          bağlantıdan hemen indirebilirsiniz.
        </Text>

        <div style={infoBox}>
          <Text style={infoTitle}>Rehberde Neler Var</Text>
          <Text style={infoItem}>Optimize edilmiş müze rotası</Text>
          <Text style={infoItem}>Kaçırılmaması gereken öne çıkan eserler</Text>
          <Text style={infoItem}>Pratik ziyaret bilgileri ve ipuçları</Text>
        </div>

        <KlemensButton href={PDF_URL}>PDF Rehberi İndir</KlemensButton>

        <Text style={noteText}>
          Ayrıca e-bültenimize de abone oldunuz — her hafta kültür-sanat
          içerikleri alacaksınız.
        </Text>

        <Text style={paragraph}>
          Herhangi bir sorunuz olursa{" "}
          <Link href="mailto:info@klemensart.com" style={link}>
            info@klemensart.com
          </Link>{" "}
          adresinden bize ulaşabilirsiniz.
        </Text>

        <Text style={closing}>
          Sevgiyle,
          <br />
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

const noteText: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#999999",
  fontStyle: "italic",
  margin: "0 0 18px 0",
};

const closing: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.8",
  color: "#3d3833",
  margin: "0 0 0 0",
};
