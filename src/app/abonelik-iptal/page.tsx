"use client";

import { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}${local[1]}${"*".repeat(Math.min(local.length - 3, 4))}${local[local.length - 1]}@${domain}`;
}

type Step = "input" | "confirm" | "done";

export default function AbonelikIptalPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed)) {
      setError("Geçerli bir e-posta adresi girin.");
      return;
    }
    setEmail(trimmed);
    setError("");
    setStep("confirm");
  }

  async function handleConfirm() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Bir hata oluştu.");
        setLoading(false);
        return;
      }
      setStep("done");
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={page}>
      <div style={card}>
        {/* Logo */}
        <div style={logoWrap}>
          <img
            src="https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/email-assets/logo-yazi-somon.PNG"
            alt="Klemens Art"
            width={140}
            style={{ display: "block", margin: "0 auto" }}
          />
        </div>

        <div style={divider} />

        {step === "input" && (
          <form onSubmit={handleSubmit}>
            <h1 style={heading}>Abonelikten Çıkış</h1>
            <p style={desc}>
              Bülten aboneliğinizi iptal etmek için e-posta adresinizi girin.
            </p>
            <input
              type="email"
              placeholder="E-posta adresiniz"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              style={input}
              autoFocus
            />
            {error && <p style={errorText}>{error}</p>}
            <button type="submit" style={btnPrimary}>
              Aboneliği İptal Et
            </button>
          </form>
        )}

        {step === "confirm" && (
          <div>
            <h1 style={heading}>Emin misiniz?</h1>
            <p style={desc}>
              <strong style={{ color: "#2D2926" }}>{maskEmail(email)}</strong>{" "}
              adresinin bülten aboneliğini iptal etmek istediğinize emin misiniz?
            </p>
            {error && <p style={errorText}>{error}</p>}
            <div style={btnRow}>
              <button
                onClick={handleConfirm}
                disabled={loading}
                style={{
                  ...btnPrimary,
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "İptal ediliyor..." : "Evet, İptal Et"}
              </button>
              <button
                onClick={() => {
                  setStep("input");
                  setError("");
                }}
                disabled={loading}
                style={btnSecondary}
              >
                Vazgeç
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div>
            <div style={checkCircle}>&#10003;</div>
            <h1 style={heading}>Abonelik İptal Edildi</h1>
            <p style={desc}>
              Artık bülten e-postaları almayacaksınız. Fikrinizi değiştirirseniz
              sitemizden tekrar abone olabilirsiniz.
            </p>
            <a href="https://klemensart.com" style={btnPrimary}>
              Ana Sayfaya Dön
            </a>
          </div>
        )}
      </div>

      <p style={footer}>
        Klemens Art &middot; Ankara, Türkiye
      </p>
    </div>
  );
}

/* ── Styles ── */
const page: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#F5F0EB",
  padding: "24px",
  fontFamily: "'Georgia', 'Times New Roman', serif",
};

const card: React.CSSProperties = {
  backgroundColor: "#ffffff",
  maxWidth: 440,
  width: "100%",
  padding: "40px 36px",
  textAlign: "center",
};

const logoWrap: React.CSSProperties = {
  marginBottom: 0,
};

const divider: React.CSSProperties = {
  height: 1,
  backgroundColor: "#e8e4df",
  margin: "28px 0",
};

const heading: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 400,
  color: "#2D2926",
  margin: "0 0 12px 0",
  fontFamily: "'Georgia', 'Times New Roman', serif",
};

const desc: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.6,
  color: "#8C857E",
  margin: "0 0 24px 0",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  fontSize: 15,
  border: "1px solid #e8e4df",
  outline: "none",
  fontFamily: "'Georgia', 'Times New Roman', serif",
  color: "#2D2926",
  backgroundColor: "#FFFBF7",
  marginBottom: 16,
  boxSizing: "border-box",
};

const btnPrimary: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#FF6D60",
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: 1,
  textTransform: "uppercase",
  textDecoration: "none",
  padding: "14px 32px",
  border: "none",
  cursor: "pointer",
  fontFamily: "Helvetica, Arial, sans-serif",
  width: "100%",
  boxSizing: "border-box",
};

const btnSecondary: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "transparent",
  color: "#8C857E",
  fontSize: 14,
  fontWeight: 500,
  textDecoration: "underline",
  padding: "12px 32px",
  border: "none",
  cursor: "pointer",
  fontFamily: "Helvetica, Arial, sans-serif",
  width: "100%",
};

const btnRow: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const errorText: React.CSSProperties = {
  color: "#e74c3c",
  fontSize: 13,
  margin: "0 0 12px 0",
};

const checkCircle: React.CSSProperties = {
  width: 56,
  height: 56,
  lineHeight: "56px",
  borderRadius: "50%",
  backgroundColor: "#e8f5e9",
  color: "#4caf50",
  fontSize: 28,
  margin: "0 auto 20px auto",
};

const footer: React.CSSProperties = {
  fontSize: 11,
  color: "#b0a99f",
  marginTop: 24,
  letterSpacing: 1,
};
