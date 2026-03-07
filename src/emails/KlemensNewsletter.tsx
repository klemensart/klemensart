import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Img,
  Font,
  Preview,
} from "@react-email/components";
import * as React from "react";

type Props = {
  subject?: string;
  htmlContent: string;
  previewText?: string;
};

export default function KlemensNewsletter({
  subject = "",
  htmlContent,
  previewText,
}: Props) {
  return (
    <Html lang="tr">
      <Head>
        <Font
          fontFamily="Georgia"
          fallbackFontFamily="serif"
        />
      </Head>
      {previewText && <Preview>{previewText}</Preview>}
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/email-assets/logo-yazi-somon.PNG"
              alt="Klemens Art"
              width="160"
              style={logoImg}
            />
          </Section>

          <Hr style={headerLine} />

          {/* Subject */}
          {subject && (
            <Section style={subjectSection}>
              <Text style={subjectStyle}>{subject}</Text>
            </Section>
          )}

          {/* Dynamic Content */}
          <div style={contentSection} dangerouslySetInnerHTML={{ __html: htmlContent }} />

          {/* Footer */}
          <Hr style={footerLine} />

          <Section style={footer}>
            <Text style={footerBrand}>Klemens Art</Text>
            <Text style={footerAddress}>Ankara, Turkiye</Text>

            <Text style={socialLinks}>
              <Link href="https://instagram.com/klemens.art" style={socialLink}>
                Instagram
              </Link>
              &nbsp;&nbsp;&middot;&nbsp;&nbsp;
              <Link href="https://www.youtube.com/@KlemensArt" style={socialLink}>
                YouTube
              </Link>
              &nbsp;&nbsp;&middot;&nbsp;&nbsp;
              <Link href="https://x.com/KlemensArt" style={socialLink}>
                X
              </Link>
              &nbsp;&nbsp;&middot;&nbsp;&nbsp;
              <Link href="https://www.linkedin.com/company/klemens-art" style={socialLink}>
                LinkedIn
              </Link>
            </Text>

            <Text style={unsubscribeText}>
              Bu e-postayı klemensart.com uzerinden abone oldugunuz icin aliyorsunuz.
              <br />
              <Link href="https://klemensart.com/abonelik-iptal" style={unsubscribeLink}>
                Abonelikten cikmak icin tiklayin
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/* ── Styles ── */
const body: React.CSSProperties = {
  backgroundColor: "#f7f5f2",
  fontFamily: "'Georgia', 'Times New Roman', serif",
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
};

const header: React.CSSProperties = {
  textAlign: "center" as const,
  padding: "40px 40px 0 40px",
};

const logoImg: React.CSSProperties = {
  display: "block",
  margin: "0 auto",
};


const headerLine: React.CSSProperties = {
  borderTop: "1px solid #e8e4df",
  margin: "24px 40px",
};

const subjectSection: React.CSSProperties = {
  padding: "0 40px",
};

const subjectStyle: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 700,
  color: "#2D2926",
  lineHeight: "1.4",
  margin: "0 0 24px 0",
  textAlign: "center" as const,
};

const contentSection: React.CSSProperties = {
  padding: "0 40px 32px 40px",
  fontSize: "16px",
  lineHeight: "1.7",
  color: "#3d3833",
};

const footerLine: React.CSSProperties = {
  borderTop: "1px solid #e8e4df",
  margin: "0 40px",
};

const footer: React.CSSProperties = {
  textAlign: "center" as const,
  padding: "24px 40px 32px 40px",
};

const footerBrand: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  letterSpacing: "2px",
  color: "#2D2926",
  margin: "0",
};

const footerAddress: React.CSSProperties = {
  fontSize: "11px",
  color: "#8C857E",
  margin: "4px 0 16px 0",
};

const socialLinks: React.CSSProperties = {
  fontSize: "12px",
  margin: "0 0 16px 0",
};

const socialLink: React.CSSProperties = {
  color: "#FF6D60",
  textDecoration: "none",
};

const unsubscribeText: React.CSSProperties = {
  fontSize: "11px",
  color: "#b0a99f",
  lineHeight: "1.6",
  margin: "0",
};

const unsubscribeLink: React.CSSProperties = {
  color: "#8C857E",
  textDecoration: "underline",
};
