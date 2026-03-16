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
  Row,
  Column,
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
            {/* Social Icons */}
            <Row style={socialRow}>
              <Column style={socialCol}>
                <Link href="https://instagram.com/klemens.art" style={socialCircleLink}>
                  <span style={socialCircle}>in</span>
                </Link>
              </Column>
              <Column style={socialCol}>
                <Link href="https://x.com/KlemensArt" style={socialCircleLink}>
                  <span style={socialCircle}>x</span>
                </Link>
              </Column>
              <Column style={socialCol}>
                <Link href="https://www.youtube.com/@KlemensArt" style={socialCircleLink}>
                  <span style={socialCircle}>yt</span>
                </Link>
              </Column>
              <Column style={socialCol}>
                <Link href="https://www.linkedin.com/company/klemens-art" style={socialCircleLink}>
                  <span style={socialCircle}>li</span>
                </Link>
              </Column>
            </Row>

            <Text style={footerBrand}>Klemens Art</Text>
            <Text style={footerAddress}>Ankara, Türkiye</Text>

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
    display: block !important;
  }
  @media (prefers-color-scheme: dark) {
    .body { background-color: #f7f5f2 !important; }
    .km-wrap { background-color: #ffffff !important; }
    .km-subject { color: #2D2926 !important; }
    .km-content, .km-content * { color: #3d3833 !important; }
    .km-content h2, .km-content h3 { color: #2D2926 !important; }
    .km-content a { color: #FF6D60 !important; }
    .km-content .km-bonbon { color: #ffffff !important; }
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

const socialRow: React.CSSProperties = {
  width: "160px",
  margin: "0 auto 20px auto",
};

const socialCol: React.CSSProperties = {
  textAlign: "center" as const,
  width: "40px",
};

const socialCircleLink: React.CSSProperties = {
  textDecoration: "none",
};

const socialCircle: React.CSSProperties = {
  display: "inline-block",
  width: "32px",
  height: "32px",
  lineHeight: "32px",
  borderRadius: "50%",
  backgroundColor: "#1A1A1A",
  color: "#ffffff",
  fontSize: "12px",
  fontFamily: "Helvetica, Arial, sans-serif",
  textAlign: "center" as const,
  textDecoration: "none",
};

const footerBrand: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
  color: "#1A1A1A",
  margin: "0",
};

const footerAddress: React.CSSProperties = {
  fontSize: "11px",
  color: "#999999",
  margin: "4px 0 20px 0",
};

const unsubscribeText: React.CSSProperties = {
  fontSize: "11px",
  color: "#b0a99f",
  lineHeight: "1.6",
  margin: "0",
};

const unsubscribeLink: React.CSSProperties = {
  color: "#999999",
  textDecoration: "underline",
};
