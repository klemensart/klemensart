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
        <Font fontFamily="Georgia" fallbackFontFamily="serif" />
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light only" />
        <style>{darkModeCSS}</style>
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

          <Hr style={divider} />

          {/* Subject */}
          {subject && (
            <Section style={subjectSection}>
              <Text style={subjectStyle}>{subject}</Text>
            </Section>
          )}

          {/* Dynamic Content */}
          <Section style={contentSection}>
            <div
              className="km-content"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </Section>

          {/* Footer */}
          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerBrand}>Klemens Art</Text>
            <Text style={footerAddress}>Ankara, Türkiye</Text>

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
              Bu e-postayı klemensart.com üzerinden abone olduğunuz için alıyorsunuz.
              <br />
              <Link href="https://klemensart.com/abonelik-iptal" style={unsubscribeLink}>
                Abonelikten çıkmak için tıklayın
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/* ── Dark Mode Override + Image CSS ── */
const darkModeCSS = `
  :root { color-scheme: light only; }
  u + .body { background-color: #f7f5f2 !important; }
  .km-content img {
    max-width: 100% !important;
    height: auto !important;
    display: block !important;
    margin: 16px 0 !important;
    border-radius: 8px !important;
  }
  @media (prefers-color-scheme: dark) {
    .body { background-color: #f7f5f2 !important; }
    .km-wrap { background-color: #ffffff !important; }
    .km-subject { color: #2D2926 !important; }
    .km-content, .km-content * { color: #3d3833 !important; }
    .km-content h2, .km-content h3 { color: #2D2926 !important; }
    .km-content a { color: #FF6D60 !important; }
    .km-brand { color: #2D2926 !important; }
    .km-social { color: #FF6D60 !important; }
  }
`;

/* ── Styles ── */
const body: React.CSSProperties = {
  backgroundColor: "#f7f5f2",
  fontFamily: "'Georgia', 'Times New Roman', serif",
  margin: 0,
  padding: "40px 0",
};

const container: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
};

const header: React.CSSProperties = {
  textAlign: "center" as const,
  padding: "48px 40px 0 40px",
};

const logoImg: React.CSSProperties = {
  display: "block",
  margin: "0 auto",
};

const divider: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #e8e4df",
  margin: "28px auto",
  width: "86%",
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

const footer: React.CSSProperties = {
  textAlign: "center" as const,
  padding: "24px 40px 40px 40px",
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
