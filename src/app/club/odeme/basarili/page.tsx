"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const B = { coral: "#FF6D60", cream: "#FFFBF7", dark: "#2D2926", warm: "#8C857E" };

export default function OdemeBasarili() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", "Purchase", { currency: "TRY", value: 0 });
    }
  }, []);

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
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: B.dark, marginBottom: 12 }}>
          Ödeme Başarılı
        </h1>
        <p style={{ color: B.warm, fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
          Satın alımın tamamlandı. Atölyene profilinden erişebilirsin.
        </p>
        <button
          onClick={() => router.push("/club/profil")}
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
          Profilime Git
        </button>
      </div>
    </div>
  );
}
