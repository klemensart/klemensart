"use client";

import type { SpriteAnimation, CharacterPosition } from "@/lib/leonardo/types";
import SpriteCharacter from "./SpriteCharacter";
import ParallaxBackground from "./ParallaxBackground";

interface SceneComposerProps {
  /** Mevcut oda indeksi (0-4) */
  roomIndex: number;
  /** Oda arka plan görseli */
  bgImage?: string;
  /** Sprite animasyonu */
  animation: SpriteAnimation;
  /** Karakter pozisyonu */
  position?: CharacterPosition;
  /** Karakter gösterilsin mi? */
  showCharacter?: boolean;
  /** Karakter boyut çarpanı (1 = varsayılan 240×360) */
  characterScale?: number;
  /** Üst içerik (HUD: skor, oda bilgisi vb.) */
  topContent?: React.ReactNode;
  /** Alt içerik (diyalog kutusu, soru UI vb.) */
  children: React.ReactNode;
}

export default function SceneComposer({
  roomIndex,
  bgImage,
  animation,
  position = "center",
  showCharacter = true,
  characterScale = 1,
  topContent,
  children,
}: SceneComposerProps) {
  const charW = Math.round(240 * characterScale);
  const charH = Math.round(360 * characterScale);

  const alignItems =
    position === "left"
      ? "flex-start"
      : position === "right"
        ? "flex-end"
        : "center";

  return (
    <ParallaxBackground roomIndex={roomIndex} bgImage={bgImage}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100dvh",
          padding: "24px 16px",
        }}
      >
        {/* HUD üst alan */}
        {topContent && <div style={{ flexShrink: 0 }}>{topContent}</div>}

        {/* Ana sahne: karakter + içerik */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems,
            justifyContent: "center",
            gap: 16,
          }}
        >
          {showCharacter && (
            <SpriteCharacter
              animation={animation}
              width={charW}
              height={charH}
            />
          )}

          {/* Alt içerik (tam genişlik) */}
          <div style={{ width: "100%", maxWidth: 480, alignSelf: "center" }}>
            {children}
          </div>
        </div>
      </div>
    </ParallaxBackground>
  );
}
