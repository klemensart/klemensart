import { Section, Text } from "@react-email/components";
import * as React from "react";
import { KlemensLayout, KlemensButton } from "./components/KlemensLayout";

type Props = {
  eventTitle?: string;
  registerUrl?: string;
  contactEmail?: string;
};

export default function YarimKalanKayit({
  eventTitle = "Modern Sanatın Kırılma Noktaları",
  registerUrl = "https://klemensart.com/kayit",
  contactEmail = "info@klemensart.com",
}: Props) {
  return (
    <KlemensLayout preview="Kayıt süreci tamamlanmadı">
      <Section style={content}>
        <Text style={h1}>Kayıt Süreciniz</Text>

        <Text style={p}>
          &ldquo;{eventTitle}&rdquo; için başlattığınız kayıt
          işlemi henüz tamamlanmadı.
        </Text>

        <Text style={p}>
          Bu programdaki kontenjan sınırlı ve yerler hızla doluyor.
          Kaydınızı şimdi tamamlayarak yerinizi garantiye
          alabilirsiniz.
        </Text>

        <Text style={p}>
          Ödeme aşamasında teknik bir sorunla karşılaştıysanız veya
          herhangi bir sorunuz varsa, bize{" "}
          <span style={emailHighlight}>{contactEmail}</span>{" "}
          adresinden ulaşabilirsiniz. Yardımcı olmaktan
          memnuniyet duyarız.
        </Text>
      </Section>

      <KlemensButton href={registerUrl}>Kaydı Tamamlayın</KlemensButton>
    </KlemensLayout>
  );
}

const content: React.CSSProperties = { padding: "0 48px" };

const h1: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "26px",
  fontWeight: 700,
  color: "#1A1A1A",
  lineHeight: "1.35",
  margin: "0 0 24px 0",
  textAlign: "center" as const,
};

const p: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.75",
  color: "#3d3833",
  margin: "0 0 16px 0",
};

const emailHighlight: React.CSSProperties = {
  color: "#FF6D60",
  fontWeight: 600,
};
