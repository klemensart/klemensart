"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const B = {
  coral: "#FF6D60",
  cream: "#FFFBF7",
  dark: "#2D2926",
  warm: "#8C857E",
  light: "#F5F0EB",
  green: "#22c55e",
  greenBg: "rgba(34,197,94,0.08)",
};

export default function OdemePage() {
  const { workshopId } = useParams<{ workshopId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL: /club/odeme/[workshopId]?amount=29900&title=Atölye+Adı
  const amount = Number(searchParams.get("amount") || "0");
  const workshopTitle = searchParams.get("title") || "Atölye";
  const workshopSlug = searchParams.get("slug") || "";

  const [status, setStatus] = useState<"loading" | "coupon" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [couponStatus, setCouponStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [couponError, setCouponError] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [validatedCoupon, setValidatedCoupon] = useState("");

  const finalAmount = discountPercent > 0 ? Math.round(amount * (1 - discountPercent / 100)) : amount;

  // Check auth & workshop validity
  const checkedRef = useRef(false);
  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    if (!amount || amount <= 0) {
      setErrorMsg("Geçersiz ödeme tutarı.");
      setStatus("error");
      return;
    }

    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace(`/club/giris?redirect=/club/odeme/${workshopId}?amount=${amount}&title=${encodeURIComponent(workshopTitle)}${workshopSlug ? `&slug=${workshopSlug}` : ""}`);
        return;
      }

      const { data: workshopData } = await supabase
        .from("workshops")
        .select("next_session_date")
        .eq("id", workshopId)
        .single();

      if (workshopData?.next_session_date && new Date(workshopData.next_session_date) <= new Date()) {
        setErrorMsg("Bu atölyenin kayıt dönemi sona ermiştir.");
        setStatus("error");
        return;
      }

      // Show coupon step
      setStatus("coupon");
    });
  }, [workshopId, amount, workshopTitle, workshopSlug, router]);

  // Validate coupon
  const validateCoupon = useCallback(async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponStatus("checking");
    setCouponError("");
    try {
      const res = await fetch(`/api/coupon?code=${encodeURIComponent(code)}&workshop=${encodeURIComponent(workshopSlug)}`);
      const data = await res.json();
      if (data.valid) {
        setCouponStatus("valid");
        setDiscountPercent(data.discount_percent);
        setValidatedCoupon(data.code);
      } else {
        setCouponStatus("invalid");
        setCouponError(data.error || "Geçersiz kod");
      }
    } catch {
      setCouponStatus("invalid");
      setCouponError("Doğrulama yapılamadı");
    }
  }, [couponInput, workshopSlug]);

  // Start payment
  const startPayment = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/payment/create-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopId,
          amount: finalAmount,
          workshopTitle,
          coupon_code: validatedCoupon || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        throw new Error(data.error || "Token alınamadı");
      }

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
  }, [workshopId, finalAmount, workshopTitle, validatedCoupon]);

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
        {discountPercent > 0 ? (
          <div style={{ marginTop: 8 }}>
            <span style={{ color: B.warm, fontSize: 15, textDecoration: "line-through", marginRight: 8 }}>
              {(amount / 100).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
            </span>
            <span style={{ color: B.green, fontSize: 17, fontWeight: 700 }}>
              {(finalAmount / 100).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
            </span>
          </div>
        ) : (
          <p style={{ color: B.warm, marginTop: 8, fontSize: 15 }}>
            {(amount / 100).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
          </p>
        )}
      </div>

      {/* Coupon step */}
      {status === "coupon" && (
        <div style={{ maxWidth: 440, width: "100%", marginBottom: 32 }}>
          {/* Coupon input */}
          <div style={{
            background: "#fff", border: `1px solid ${B.light}`, borderRadius: 16,
            padding: "24px", marginBottom: 20,
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: B.dark, marginBottom: 12 }}>
              İndirim kodunuz var mı?
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="Kodu girin"
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value.toUpperCase());
                  if (couponStatus !== "idle") {
                    setCouponStatus("idle");
                    setCouponError("");
                    setDiscountPercent(0);
                    setValidatedCoupon("");
                  }
                }}
                onKeyDown={(e) => e.key === "Enter" && validateCoupon()}
                style={{
                  flex: 1, padding: "12px 14px", borderRadius: 10,
                  border: `1.5px solid ${couponStatus === "valid" ? B.green : couponStatus === "invalid" ? "#ef4444" : B.light}`,
                  fontSize: 15, fontFamily: "monospace", letterSpacing: 1,
                  color: B.dark, outline: "none", background: B.cream,
                }}
              />
              <button
                onClick={validateCoupon}
                disabled={couponStatus === "checking" || !couponInput.trim()}
                style={{
                  padding: "12px 20px", borderRadius: 10, border: "none",
                  background: B.coral, color: "#fff", fontSize: 14, fontWeight: 600,
                  cursor: couponStatus === "checking" || !couponInput.trim() ? "default" : "pointer",
                  fontFamily: "inherit", opacity: couponStatus === "checking" || !couponInput.trim() ? 0.5 : 1,
                }}
              >
                {couponStatus === "checking" ? "..." : "Uygula"}
              </button>
            </div>

            {/* Coupon feedback */}
            {couponStatus === "valid" && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8, marginTop: 10,
                padding: "8px 12px", borderRadius: 8, background: B.greenBg,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={B.green} strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span style={{ fontSize: 13, fontWeight: 600, color: B.green }}>
                  %{discountPercent} indirim uygulandı!
                </span>
              </div>
            )}
            {couponStatus === "invalid" && (
              <div style={{ fontSize: 13, color: "#ef4444", marginTop: 8, fontWeight: 500 }}>
                {couponError}
              </div>
            )}
          </div>

          {/* Proceed to payment button */}
          <button
            onClick={startPayment}
            style={{
              width: "100%", padding: "16px", borderRadius: 12, border: "none",
              background: B.coral, color: "#fff", fontSize: 16, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 4px 16px rgba(255,109,96,0.3)",
            }}
          >
            {discountPercent > 0
              ? `${(finalAmount / 100).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL Öde`
              : `${(amount / 100).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL Öde`
            }
          </button>

          <button
            onClick={() => router.back()}
            style={{
              width: "100%", marginTop: 10, padding: "12px", borderRadius: 12,
              border: `1px solid ${B.light}`, background: "transparent",
              color: B.warm, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Geri Dön
          </button>
        </div>
      )}

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

      {/* Güven rozetleri */}
      {status === "ready" && (
        <div
          style={{
            marginTop: 28,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            maxWidth: 600,
            width: "100%",
          }}
        >
          {/* Ödeme yöntemleri */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {/* Visa */}
            <svg width="48" height="16" viewBox="0 0 48 16" fill="none" aria-label="Visa">
              <path d="M19.5 1.2l-3.1 13.6h-2.5l3.1-13.6h2.5zm12.8 8.8l1.3-3.6.8 3.6h-2.1zm2.8 4.8h2.3l-2-13.6h-2.1c-.5 0-.9.3-1.1.7l-3.8 12.9h2.7l.5-1.5h3.2l.3 1.5zm-6.9-4.4c0-3.6-5-3.8-5-5.4 0-.5.5-1 1.5-1.1.5-.1 1.9-.1 3.4.6l.6-2.8c-.8-.3-1.9-.6-3.2-.6-3.4 0-5.8 1.8-5.8 4.4 0 1.9 1.7 3 3 3.6 1.3.7 1.8 1.1 1.8 1.7 0 .9-1.1 1.3-2.1 1.4-1.7 0-2.7-.5-3.5-.9l-.6 2.9c.8.4 2.3.7 3.8.7 3.6 0 5.9-1.8 6.1-4.5zM16.2 1.2l-4.2 13.6h-2.8l-2-10.9c-.1-.5-.3-.9-.7-1.1C5.3 2.2 3.7 1.7 2.3 1.4l.1-.2h4.4c.6 0 1.1.4 1.2 1l1.1 5.8 2.7-6.8h2.4z" fill="#1A1F71"/>
            </svg>
            {/* Mastercard */}
            <svg width="36" height="22" viewBox="0 0 36 22" fill="none" aria-label="Mastercard">
              <circle cx="13" cy="11" r="10" fill="#EB001B" opacity="0.9"/>
              <circle cx="23" cy="11" r="10" fill="#F79E1B" opacity="0.9"/>
              <path d="M18 3.3a10 10 0 0 1 0 15.4 10 10 0 0 1 0-15.4z" fill="#FF5F00"/>
            </svg>
            {/* Troy */}
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0055a5", letterSpacing: "0.05em" }}>TROY</span>
          </div>

          {/* Güvenli ödeme mesajı */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: B.warm,
              fontSize: 13,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>256-bit SSL ile güvenli ödeme</span>
            <span style={{ margin: "0 4px", opacity: 0.4 }}>·</span>
            <span style={{ fontWeight: 600 }}>PayTR</span>
          </div>

          {/* İade politikası linki */}
          <a
            href="/iade-ve-iptal"
            style={{
              color: B.warm,
              fontSize: 12,
              textDecoration: "underline",
              textUnderlineOffset: 3,
              opacity: 0.7,
            }}
          >
            İade ve İptal Politikası
          </a>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
