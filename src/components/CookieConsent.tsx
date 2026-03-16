"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { hasConsent, setConsent } from "@/lib/consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hasConsent() === null) setVisible(true);
  }, []);

  if (!visible) return null;

  function handle(accepted: boolean) {
    setConsent(accepted);
    setVisible(false);
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "#2D2926",
        borderTop: "2px solid #FF6D60",
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        flexWrap: "wrap",
        fontSize: 13,
        color: "#FFF8F5",
        lineHeight: 1.5,
      }}
    >
      <p style={{ margin: 0, maxWidth: 600 }}>
        Deneyiminizi iyileştirmek için çerez kullanıyoruz.{" "}
        <Link
          href="/kvkk"
          style={{ color: "#FF6D60", textDecoration: "underline" }}
        >
          KVKK Aydınlatma Metni
        </Link>
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => handle(true)}
          style={{
            background: "#FF6D60",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "6px 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Kabul Et
        </button>
        <button
          onClick={() => handle(false)}
          style={{
            background: "transparent",
            color: "#FFF8F5",
            border: "1px solid #FFF8F5",
            borderRadius: 6,
            padding: "6px 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Reddet
        </button>
      </div>
    </div>
  );
}
