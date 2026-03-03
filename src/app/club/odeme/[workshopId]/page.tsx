"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const B = {
  coral: "#FF6D60",
  cream: "#FFFBF7",
  dark: "#2D2926",
  warm: "#8C857E",
  light: "#F5F0EB",
};

export default function OdemePage() {
  const { workshopId } = useParams<{ workshopId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL: /club/odeme/[workshopId]?amount=29900&title=Atölye+Adı
  const amount = Number(searchParams.get("amount") || "0");
  const workshopTitle = searchParams.get("title") || "Atölye";

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!amount || amount <= 0) {
      setErrorMsg("Geçersiz ödeme tutarı.");
      setStatus("error");
      return;
    }

    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace(`/club/giris?redirect=/club/odeme/${workshopId}?amount=${amount}&title=${encodeURIComponent(workshopTitle)}`);
        return;
      }

      try {
        const res = await fetch("/api/payment/create-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workshopId, amount, workshopTitle }),
        });

        const data = await res.json();

        if (!res.ok || !data.token) {
          throw new Error(data.error || "Token alınamadı");
        }

        // PayTR iFrame JS'i yükle
        const script = document.createElement("script");
        script.src = "https://www.paytr.com/js/iframeResizer.min.js";
        script.onload = () => {
          // @ts-expect-error PayTR global
          window.iFrameResize({}, "#paytr-iframe");
        };
        document.body.appendChild(script);

        if (iframeRef.current) {
          iframeRef.current.src = `https://www.paytr.com/odeme/guvenli/${data.token}`;
        }

        setStatus("ready");
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : "Bir hata oluştu");
        setStatus("error");
      }
    });
  }, [workshopId, amount, workshopTitle, router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: B.cream,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 16px",
      }}
    >
      {/* Başlık */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: B.dark, margin: 0 }}>
          {workshopTitle}
        </h1>
        <p style={{ color: B.warm, marginTop: 8, fontSize: 15 }}>
          {(amount / 100).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
        </p>
      </div>

      {/* Yüklenme */}
      {status === "loading" && (
        <div
          style={{
            width: 40,
            height: 40,
            border: `3px solid ${B.light}`,
            borderTop: `3px solid ${B.coral}`,
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
      )}

      {/* Hata */}
      {status === "error" && (
        <div
          style={{
            background: "#fff0f0",
            border: "1px solid #ffc0c0",
            borderRadius: 12,
            padding: "24px 32px",
            textAlign: "center",
            maxWidth: 400,
          }}
        >
          <p style={{ color: "#c0392b", fontWeight: 600, marginBottom: 12 }}>
            Ödeme başlatılamadı
          </p>
          <p style={{ color: B.warm, fontSize: 14, marginBottom: 20 }}>{errorMsg}</p>
          <button
            onClick={() => router.back()}
            style={{
              background: B.coral,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 24px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Geri Dön
          </button>
        </div>
      )}

      {/* PayTR iFrame */}
      <iframe
        ref={iframeRef}
        id="paytr-iframe"
        src=""
        style={{
          display: status === "ready" ? "block" : "none",
          width: "100%",
          maxWidth: 600,
          border: "none",
          minHeight: 600,
          borderRadius: 12,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
        allowFullScreen
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
