"use client";

import dynamic from "next/dynamic";

const Gallery = dynamic(() => import("./_lib/Gallery"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "#0a0a0a",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "center", width: 280 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: 6,
            color: "#FF6D60",
            marginBottom: 16,
          }}
        >
          KLEMENS SANAL SERG&#304;
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 300,
            fontStyle: "italic",
            color: "#fff",
            marginBottom: 24,
            letterSpacing: 2,
          }}
        >
          En Sessiz Zaman
        </div>
        <div
          style={{
            width: "100%",
            height: 3,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "30%",
              height: "100%",
              background: "#FF6D60",
              borderRadius: 2,
              animation: "loadPulse 1.5s ease infinite",
            }}
          />
        </div>
        <div style={{ fontSize: 12, color: "#555", marginTop: 12 }}>
          Y&uuml;kleniyor...
        </div>
        <style>{`
          @keyframes loadPulse {
            0% { width: 20%; opacity: 0.5; }
            50% { width: 60%; opacity: 1; }
            100% { width: 20%; opacity: 0.5; }
          }
        `}</style>
      </div>
    </div>
  ),
});

export default function EnSessizZamanV2Page() {
  return <Gallery />;
}
