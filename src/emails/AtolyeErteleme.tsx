import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { KlemensLayout, KlemensButton } from "./components/KlemensLayout";

type Props = {
  name?: string;
  workshopTitle?: string;
  oldDate?: string;
  newDate?: string;
  reason?: string;
};

export default function AtolyeErteleme({
  name = "Değerli Katılımcımız",
  workshopTitle = "Modern Sanat Tarihi Atölyesi",
  oldDate = "25 Mart 2026, Çarşamba",
  newDate = "8 Nisan 2026, Çarşamba",
  reason,
}: Props) {
  return (
    <KlemensLayout preview={`${workshopTitle} — Yeni başlangıç tarihi: ${newDate}`}>
      <Section style={content}>
        <Text style={heading}>Tarih Değişikliği Bildirimi</Text>

        <Text style={paragraph}>
          Merhaba{name !== "Değerli Katılımcımız" ? ` ${name}` : ""},
        </Text>

        <Text style={paragraph}>
          <strong style={strong}>{workshopTitle}</strong> atölyemizin başlangıç tarihinde
          bir değişiklik yapıldığını bildirmek istiyoruz.
        </Text>

        <div style={dateBox}>
          <div style={dateRow}>
            <Text style={dateLabel}>ESKİ TARİH</Text>
            <Text style={dateOld}>{oldDate}</Text>
          </div>
          <div style={arrowRow}>
            <Text style={arrow}>↓</Text>
          </div>
          <div style={dateRow}>
            <Text style={dateLabel}>YENİ TARİH</Text>
            <Text style={dateNew}>{newDate}</Text>
          </div>
        </div>

        {reason && (
          <Text style={paragraph}>{reason}</Text>
        )}

        <Text style={paragraph}>
          Atölyemiz aynı saatte (<strong style={strong}>20:30</strong>) ve aynı formatta devam edecektir.
          10 haftalık müfredat programımız aynen geçerli olup, yalnızca başlangıç tarihi değişmiştir.
        </Text>

        <div style={infoBox}>
          <Text style={infoTitle}>ATÖLYE BİLGİLERİ</Text>
          <Text style={infoItem}><strong style={strong}>Atölye:</strong> {workshopTitle}</Text>
          <Text style={infoItem}><strong style={strong}>Yeni Başlangıç:</strong> {newDate}</Text>
          <Text style={infoItem}><strong style={strong}>Saat:</strong> 20:30 (Türkiye Saati)</Text>
          <Text style={infoItem}><strong style={strong}>Platform:</strong> Zoom (canlı) + Kayıt erişimi</Text>
          <Text style={infoItem}><strong style={strong}>Süre:</strong> 10 hafta, haftada 1 oturum</Text>
        </div>

        <Text style={paragraph}>
          Satın almış olduğunuz erişim hakları ve tüm ayrıcalıklarınız aynen geçerlidir. Herhangi bir
          ek işlem yapmanıza gerek yoktur.
        </Text>

        <KlemensButton href="https://klemensart.com/atolyeler/modern-sanat-atolyesi">
          Atölye Detayları
        </KlemensButton>

        <Text style={paragraph}>
          Herhangi bir sorunuz olursa{" "}
          <Link href="mailto:info@klemensart.com" style={link}>info@klemensart.com</Link> adresinden
          bize ulaşabilirsiniz.
        </Text>

        <Text style={paragraph}>
          Anlayışınız için teşekkür eder, atölyede buluşmayı sabırsızlıkla bekleriz.
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

const dateBox: React.CSSProperties = {
  background: "#FFFBF7",
  borderRadius: "12px",
  padding: "28px 32px",
  margin: "0 0 28px 0",
  borderLeft: "3px solid #FF6D60",
  textAlign: "center" as const,
};

const dateRow: React.CSSProperties = {
  margin: "0",
};

const dateLabel: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "2px",
  color: "#999999",
  textTransform: "uppercase" as const,
  margin: "0 0 4px 0",
};

const dateOld: React.CSSProperties = {
  fontSize: "16px",
  color: "#999999",
  textDecoration: "line-through",
  margin: "0",
};

const dateNew: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 700,
  color: "#FF6D60",
  margin: "0",
};

const arrowRow: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "0",
};

const arrow: React.CSSProperties = {
  fontSize: "20px",
  color: "#FF6D60",
  margin: "8px 0",
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
