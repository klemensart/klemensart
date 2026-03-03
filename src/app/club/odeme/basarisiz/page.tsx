"use client";

import { useRouter } from "next/navigation";

const B = { coral: "#FF6D60", cream: "#FFFBF7", dark: "#2D2926", warm: "#8C857E" };

export default function OdemeBasarisiz() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: B.cream,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>❌</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: B.dark, marginBottom: 12 }}>
          Ödeme Başarısız
        </h1>
        <p style={{ color: B.warm, fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
          Ödeme işlemi tamamlanamadı. Tekrar denemek için geri dön.
        </p>
        <button
          onClick={() => router.back()}
          style={{
            background: B.coral,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "12px 32px",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  );
}
