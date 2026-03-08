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
  Row,
  Column,
  Preview,
} from "@react-email/components";
import * as React from "react";

type Props = {
  preview?: string;
  children: React.ReactNode;
};

export function KlemensLayout({ preview, children }: Props) {
  return (
    <Html lang="tr">
      <Head>
        <meta charSet="utf-8" />
      </Head>
      {preview && <Preview>{preview}</Preview>}
      <Body style={body}>
        <Container style={container}>
          {/* ── Header ── */}
          <Section style={header}>
            <Img
              src="https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/email-assets/logo-yazi-somon.PNG"
              alt="Klemens Art"
              width="160"
              style={logoImg}
            />
          </Section>

          <Hr style={divider} />

          {/* ── Content ── */}
          {children}

          {/* ── Footer ── */}
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
            <Text style={footerLegal}>
              Bu e-postayı klemensart.com üzerinden abone olduğunuz için alıyorsunuz.
              <br />
              <Link href="https://klemensart.com/abonelik-iptal" style={unsubLink}>
                Abonelikten çıkmak için tıklayın
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/* ── Shared Button Component ── */
export function KlemensButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Section style={{ textAlign: "center" as const, padding: "8px 0 24px 0" }}>
      <Link href={href} style={btn}>
        {children}
      </Link>
    </Section>
  );
}

/* ── Styles ── */
const body: React.CSSProperties = {
  backgroundColor: "#f5f3f0",
  fontFamily: "Helvetica, Arial, sans-serif",
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
  margin: "28px 48px",
};

const footer: React.CSSProperties = {
  textAlign: "center" as const,
  padding: "0 48px 40px 48px",
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

const footerLegal: React.CSSProperties = {
  fontSize: "11px",
  color: "#b0a99f",
  lineHeight: "1.6",
  margin: "0",
};

const unsubLink: React.CSSProperties = {
  color: "#999999",
  textDecoration: "underline",
};

const btn: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#FF6D60",
  color: "#ffffff",
  fontFamily: "Helvetica, Arial, sans-serif",
  fontSize: "14px",
  fontWeight: 600,
  letterSpacing: "1px",
  textTransform: "uppercase" as const,
  textDecoration: "none",
  padding: "16px 40px",
  textAlign: "center" as const,
};
