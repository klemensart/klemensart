import { Section, Text, Hr } from "@react-email/components";
import * as React from "react";
import { KlemensLayout } from "./components/KlemensLayout";

type WeekItem = {
  week: string;
  title: string;
  material?: string;
};

type Props = {
  workshopTitle?: string;
  instructorName?: string;
  contactEmail?: string;
  weeks?: WeekItem[];
};

export default function AtolyeHazirlik({
  workshopTitle = "Modern Sanatin Kirilma Noktalari",
  instructorName = "Klemens Art Egitmeni",
  contactEmail = "info@klemensart.com",
  weeks = [
    { week: "1. Hafta", title: "Empresyonizmden Soyut'a Gecis", material: "John Berger — Gorme Bicimleri (1-3. bolumler)" },
    { week: "2. Hafta", title: "Dada, Kaos ve Anlamsizlik", material: "MoMA: Dada belgeseli (YouTube, 45dk)" },
    { week: "3. Hafta", title: "Soyut Disavurumculuk", material: "Robert Hughes — Yeninin Soku (5. bolum)" },
    { week: "4. Hafta", title: "Pop Art ve Tuketim Toplumu", material: "Andy Warhol — Felsefesi (secme sayfalar)" },
  ],
}: Props) {
  return (
    <KlemensLayout preview={`${workshopTitle} — Hazirlik Kiti`}>
      <Section style={content}>
        <Text style={eyebrow}>ATOLYE HAZIRLIK KITI</Text>
        <Text style={h1}>{workshopTitle}</Text>

        <Text style={p}>
          Hos geldiniz. Bu atolyeden en yuksek verimi almaniz icin
          asagidaki haftalik programi ve on materyalleri sizin icin
          hazirladik.
        </Text>

        <Text style={p}>
          Her hafta oncesinde ilgili materyali gozden gecirmeniz,
          tartisman sirasindan cok daha verimli bir deneyim
          yasamamzi saglayacaktir.
        </Text>

        <Hr style={thinDivider} />

        <Text style={scheduleTitle}>Haftalik Program</Text>

        {weeks.map((w, i) => (
          <React.Fragment key={i}>
            <Text style={weekLabel}>{w.week}</Text>
            <Text style={weekTitle}>{w.title}</Text>
            {w.material && (
              <Text style={weekMaterial}>
                &#9656;&ensp;On materyal: {w.material}
              </Text>
            )}
            {i < weeks.length - 1 && <Hr style={lightDivider} />}
          </React.Fragment>
        ))}

        <Hr style={thinDivider} />

        <Text style={contactTitle}>Iletisim</Text>
        <Text style={contactText}>
          Egitmen: {instructorName}
          <br />
          Sorulariniz icin: {contactEmail}
        </Text>
      </Section>
    </KlemensLayout>
  );
}

const content: React.CSSProperties = { padding: "0 48px" };

const eyebrow: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "3px",
  textTransform: "uppercase" as const,
  color: "#FF6D60",
  textAlign: "center" as const,
  margin: "0 0 8px 0",
};

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

const thinDivider: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #e8e4df",
  margin: "28px 0",
};

const lightDivider: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #f0ece8",
  margin: "20px 0",
};

const scheduleTitle: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "18px",
  fontWeight: 700,
  color: "#1A1A1A",
  margin: "0 0 24px 0",
  textAlign: "center" as const,
};

const weekLabel: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
  color: "#FF6D60",
  margin: "0 0 4px 0",
};

const weekTitle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 600,
  color: "#1A1A1A",
  margin: "0 0 6px 0",
  lineHeight: "1.4",
};

const weekMaterial: React.CSSProperties = {
  fontSize: "14px",
  color: "#666666",
  margin: "0",
  lineHeight: "1.6",
  fontStyle: "italic" as const,
};

const contactTitle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
  color: "#1A1A1A",
  margin: "0 0 8px 0",
};

const contactText: React.CSSProperties = {
  fontSize: "15px",
  color: "#666666",
  lineHeight: "1.7",
  margin: "0 0 16px 0",
};
