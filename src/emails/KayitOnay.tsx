import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { KlemensLayout, KlemensButton } from "./components/KlemensLayout";

type Props = {
  name?: string;
  eventTitle?: string;
  eventDate?: string;
  eventVenue?: string;
  eventAddress?: string;
  contactEmail?: string;
  eventUrl?: string;
  cancelUrl?: string;
};

export default function KayitOnay({
  name = "Katılımcı",
  eventTitle = "Etkinlik",
  eventDate = "",
  eventVenue = "",
  eventAddress = "",
  contactEmail = "info@klemensart.com",
  eventUrl = "https://klemensart.com/etkinlikler",
  cancelUrl = "#",
}: Props) {
  return (
    <KlemensLayout preview={`${eventTitle} — Kaydınız alındı`}>
      <Section style={content}>
        <Text style={heading}>Kaydınız Alındı</Text>

        <Text style={paragraph}>
          Merhaba {name}, <strong>{eventTitle}</strong> etkinliğine kaydınız
          başarıyla tamamlandı!
        </Text>

        <div style={infoBox}>
          <Text style={infoTitle}>Etkinlik Detayları</Text>
          {eventDate && <Text style={infoItem}>{eventDate}</Text>}
          {eventVenue && <Text style={infoItem}>{eventVenue}</Text>}
          {eventAddress && (
            <Text style={infoItemLight}>{eventAddress}</Text>
          )}
          {contactEmail && (
            <Text style={infoItemLight}>
              İletişim:{" "}
              <Link href={`mailto:${contactEmail}`} style={link}>
                {contactEmail}
              </Link>
            </Text>
          )}
        </div>

        <KlemensButton href={eventUrl}>
          Etkinlik Sayfasına Git
        </KlemensButton>

        <Text style={paragraph}>
          Katılamayacağınızı düşünüyorsanız, lütfen yerinizi başkasına
          bırakabilmemiz için kaydınızı iptal edin:
        </Text>

        <Text style={cancelText}>
          <Link href={cancelUrl} style={cancelLink}>
            Kaydımı iptal et
          </Link>
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
  fontWeight: 600,
};

const infoItemLight: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.8",
  color: "#6b6560",
  margin: "0 0 4px 0",
};

const cancelText: React.CSSProperties = {
  fontSize: "14px",
  textAlign: "center" as const,
  margin: "0 0 28px 0",
};

const cancelLink: React.CSSProperties = {
  color: "#999",
  textDecoration: "underline",
  fontSize: "13px",
};

const closing: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.8",
  color: "#3d3833",
  margin: "0 0 0 0",
};
