import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") || "Klemens Art";
  const subtitle = searchParams.get("subtitle") || "Kültür & Sanat Platformu";
  const category = searchParams.get("category") || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#FFFBF7",
          padding: "60px 80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Sol kenar aksanı */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 8,
            backgroundColor: "#FF6D60",
          }}
        />

        {/* Üst — Logo + marka */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "#2D2926",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFBF7",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            K
          </div>
          <span style={{ fontSize: 24, color: "#8C857E", fontWeight: 500 }}>
            klemensart.com
          </span>
        </div>

        {/* Kategori etiketi */}
        {category && (
          <div
            style={{
              display: "flex",
              marginBottom: 20,
            }}
          >
            <span
              style={{
                backgroundColor: "#FF6D60",
                color: "#fff",
                padding: "6px 18px",
                borderRadius: 20,
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            >
              {category}
            </span>
          </div>
        )}

        {/* Başlık */}
        <div
          style={{
            fontSize: title.length > 60 ? 42 : 52,
            fontWeight: 700,
            color: "#2D2926",
            lineHeight: 1.2,
            maxWidth: 1000,
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          {title}
        </div>

        {/* Alt başlık */}
        {subtitle && subtitle !== title && (
          <div
            style={{
              fontSize: 22,
              color: "#8C857E",
              marginTop: 20,
              lineHeight: 1.4,
              maxWidth: 800,
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            {subtitle.length > 120 ? subtitle.slice(0, 120) + "..." : subtitle}
          </div>
        )}

        {/* Alt dekoratif çizgi */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 80,
            right: 80,
            height: 1,
            backgroundColor: "#e8e0d8",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
