import { Section, Text, Hr, Link, Img } from "@react-email/components";
import * as React from "react";
import { KlemensLayout, KlemensButton } from "./components/KlemensLayout";

type EventItem = {
  date: string;
  title: string;
  tag?: string;
};

type Props = {
  monthName?: string;
  editorialIntro?: string;
  events?: EventItem[];
  editorPickTitle?: string;
  editorPickDescription?: string;
  editorPickImageUrl?: string;
  editorPickUrl?: string;
};

export default function AylikAjanda({
  monthName = "Mart 2026",
  editorialIntro = "Bu ay, karanligin ve isigin sanat tarihindeki dansini kesfediyoruz. Barok'tan cagdas sinemaya uzanan bir yolculuk sizi bekliyor — tuvalin ve perdenin arkasinda saklanan insani hikayeleri birlikte okuyacagiz.",
  events = [
    { date: "12 Mart, Carsamba", title: "Caravaggio ve Karanligin Estetigi", tag: "Seminer" },
    { date: "19 Mart, Carsamba", title: "Tarkovsky'nin Zamani: Sinema ve Felsefe", tag: "Film Analizi" },
    { date: "26 Mart, Carsamba", title: "Jung ve Golge Arketipi", tag: "Psikoloji Atolyesi" },
  ],
  editorPickTitle = "Gorme Bicimleri — John Berger",
  editorPickDescription = "Gorsel kulturun nasil insa edildigini sorgulayan bu kisa ve keskin kitap, sanat tarihine bakisinizi temelden degistirecek. Her Klemens Art katilimcisinin rafinda olmasi gereken bir basyapit.",
  editorPickImageUrl,
  editorPickUrl = "https://klemensart.com",
}: Props) {
  return (
    <KlemensLayout preview={`${monthName} Klemens Art Ajandasi`}>
      <Section style={content}>
        <Text style={eyebrow}>{monthName} AJANDASI</Text>
        <Text style={h1}>Bu Ay Klemens Art&apos;ta</Text>
        <Text style={pCenter}>{editorialIntro}</Text>
      </Section>

      {/* Events List */}
      <Section style={content}>
        <Hr style={coralDivider} />
        <Text style={sectionTitle}>Etkinlikler</Text>

        {events.map((ev, i) => (
          <React.Fragment key={i}>
            <Text style={eventDate}>{ev.date}</Text>
            <Text style={eventTitle}>
              {ev.title}
              {ev.tag && <span style={eventTag}>&ensp;{ev.tag}</span>}
            </Text>
            {i < events.length - 1 && <Hr style={lightDivider} />}
          </React.Fragment>
        ))}
      </Section>

      <KlemensButton href="https://klemensart.com/etkinlikler">
        Tum Etkinlikleri Gorun
      </KlemensButton>

      {/* Editor's Pick */}
      <Section style={content}>
        <Hr style={coralDivider} />
        <Text style={editorLabel}>EDITORUN SECIMI</Text>

        {editorPickImageUrl && (
          <Img
            src={editorPickImageUrl}
            alt={editorPickTitle}
            width="200"
            style={editorImage}
          />
        )}

        <Text style={editorTitle}>{editorPickTitle}</Text>
        <Text style={editorDesc}>{editorPickDescription}</Text>

        {editorPickUrl && (
          <Text style={editorLink}>
            <Link href={editorPickUrl} style={coralLink}>
              Daha fazla &rarr;
            </Link>
          </Text>
        )}
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
  fontSize: "28px",
  fontWeight: 700,
  color: "#1A1A1A",
  lineHeight: "1.3",
  margin: "0 0 20px 0",
  textAlign: "center" as const,
};

const pCenter: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.75",
  color: "#3d3833",
  margin: "0 0 8px 0",
  textAlign: "center" as const,
};

const coralDivider: React.CSSProperties = {
  border: "none",
  borderTop: "2px solid #FF6D60",
  margin: "32px auto",
  width: "40px",
};

const lightDivider: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #f0ece8",
  margin: "16px 0",
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "18px",
  fontWeight: 700,
  color: "#1A1A1A",
  textAlign: "center" as const,
  margin: "0 0 24px 0",
};

const eventDate: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 600,
  letterSpacing: "1px",
  color: "#999999",
  margin: "0 0 4px 0",
  textTransform: "uppercase" as const,
};

const eventTitle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 600,
  color: "#1A1A1A",
  margin: "0",
  lineHeight: "1.5",
};

const eventTag: React.CSSProperties = {
  fontSize: "11px",
  color: "#FF6D60",
  fontWeight: 700,
  letterSpacing: "1px",
  textTransform: "uppercase" as const,
};

const editorLabel: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "3px",
  textTransform: "uppercase" as const,
  color: "#999999",
  textAlign: "center" as const,
  margin: "0 0 20px 0",
};

const editorImage: React.CSSProperties = {
  display: "block",
  margin: "0 auto 20px auto",
};

const editorTitle: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "18px",
  fontWeight: 700,
  color: "#1A1A1A",
  textAlign: "center" as const,
  margin: "0 0 12px 0",
};

const editorDesc: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.7",
  color: "#3d3833",
  textAlign: "center" as const,
  margin: "0 0 16px 0",
  fontStyle: "italic" as const,
};

const editorLink: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "0 0 24px 0",
};

const coralLink: React.CSSProperties = {
  color: "#FF6D60",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "14px",
};
