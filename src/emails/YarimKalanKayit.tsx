import { Section, Text } from "@react-email/components";
import * as React from "react";
import { KlemensLayout, KlemensButton } from "./components/KlemensLayout";

type Props = {
  eventTitle?: string;
  registerUrl?: string;
  contactEmail?: string;
};

export default function YarimKalanKayit({
  eventTitle = "Modern Sanatin Kirilma Noktalari",
  registerUrl = "https://klemensart.com/kayit",
  contactEmail = "info@klemensart.com",
}: Props) {
  return (
    <KlemensLayout preview="Kayit sureci tamamlanmadi">
      <Section style={content}>
        <Text style={h1}>Kayit Sureceniz</Text>

        <Text style={p}>
          &ldquo;{eventTitle}&rdquo; icin baslattigniz kayit
          islemi henuz tamamlanmadi.
        </Text>

        <Text style={p}>
          Bu programdaki kontenjan sinirli ve yerler hizla doluyor.
          Kaydnizi simdi tamamlayarak yerinizi garantiye
          alabilirsiniz.
        </Text>

        <Text style={p}>
          Odeme asamasinda teknik bir sorunla karsilastiysniz veya
          herhangi bir sorunuz varsa, bize{" "}
          <span style={emailHighlight}>{contactEmail}</span>{" "}
          adresinden ulasabilirsiniz. Yardimci olmaktan
          memnuniyet duyariz.
        </Text>
      </Section>

      <KlemensButton href={registerUrl}>Kaydi Tamamlayin</KlemensButton>
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
