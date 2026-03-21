"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";

/** Oda indeksine göre gradient tema */
const ROOM_GRADIENTS: Record<number, string> = {
  0: "linear-gradient(180deg, #1a1714 0%, #2a2016 40%, #1a1510 100%)",
  1: "linear-gradient(180deg, #1a1714 0%, #201c22 40%, #16131a 100%)",
  2: "linear-gradient(180deg, #1a1714 0%, #222018 40%, #181612 100%)",
  3: "linear-gradient(180deg, #1a1714 0%, #1c1e22 40%, #14161a 100%)",
  4: "linear-gradient(180deg, #1a1714 0%, #1e1a16 40%, #141210 100%)",
};

interface ParallaxBackgroundProps {
  /** Mevcut oda indeksi (0-4) */
  roomIndex: number;
  /** Oda arka plan görseli URL'i (opsiyonel, yoksa gradient) */
  bgImage?: string;
  children: React.ReactNode;
}

export default function ParallaxBackground({
  roomIndex,
  bgImage,
  children,
}: ParallaxBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bgLoaded, setBgLoaded] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Arka plan: yavaş hareket (parallax efekti)
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  // Arka plan görselini kontrol et
  useEffect(() => {
    if (!bgImage) {
      setBgLoaded(false);
      return;
    }
    const img = new window.Image();
    img.onload = () => setBgLoaded(true);
    img.onerror = () => setBgLoaded(false);
    img.src = bgImage;
  }, [bgImage]);

  const gradient = ROOM_GRADIENTS[roomIndex] ?? ROOM_GRADIENTS[0];

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        minHeight: "100dvh",
        overflow: "hidden",
      }}
    >
      {/* Katman 1: Gradient arka plan (her zaman) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: gradient,
          zIndex: 0,
        }}
      />

      {/* Katman 2: Oda görseli (varsa, parallax ile) */}
      {bgLoaded && bgImage && (
        <motion.div
          style={{
            position: "absolute",
            inset: "-20% 0 0 0",
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.25,
            y: bgY,
            zIndex: 1,
          }}
        />
      )}

      {/* Vignette overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Ambient ışık partikülleri */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 3,
        }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: "100vh", x: `${10 + Math.random() * 80}vw` }}
            animate={{ opacity: [0, 0.3, 0], y: "-10vh" }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 6,
              ease: "linear",
            }}
            style={{
              position: "absolute",
              width: 2 + Math.random() * 3,
              height: 2 + Math.random() * 3,
              borderRadius: "50%",
              background: "#C9A84C",
            }}
          />
        ))}
      </div>

      {/* İçerik */}
      <div style={{ position: "relative", zIndex: 4 }}>{children}</div>
    </div>
  );
}
