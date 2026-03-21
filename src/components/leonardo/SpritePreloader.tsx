"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ALL_SPRITE_URLS, FALLBACK_PORTRAIT } from "@/lib/leonardo/sprite-config";

interface SpritePreloaderProps {
  /** Yükleme tamamlandığında çağrılır */
  onComplete: () => void;
  /** Yükleme başlamadan gösterilecek minimum süre (ms) */
  minDisplayMs?: number;
}

/**
 * Sprite sheet'leri ve fallback portrait'i arka planda yükler.
 * Yüklenemeyen asset'ler sessizce atlanır (fallback zinciri devreye girer).
 */
export default function SpritePreloader({
  onComplete,
  minDisplayMs = 800,
}: SpritePreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState("Atölye hazırlanıyor...");

  useEffect(() => {
    const allUrls = [FALLBACK_PORTRAIT, ...ALL_SPRITE_URLS];
    let loaded = 0;
    const total = allUrls.length;
    const startTime = Date.now();

    const done = () => {
      loaded++;
      setProgress(loaded / total);

      if (loaded >= Math.ceil(total * 0.3)) {
        setLabel("Fırçalar hazırlanıyor...");
      }
      if (loaded >= Math.ceil(total * 0.7)) {
        setLabel("Leonardo sizi bekliyor...");
      }

      if (loaded >= total) {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minDisplayMs - elapsed);
        setTimeout(onComplete, remaining);
      }
    };

    allUrls.forEach((url) => {
      const img = new Image();
      img.onload = done;
      img.onerror = done; // Yüklenemezse de devam et
      img.src = url;
    });
  }, [onComplete, minDisplayMs]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
        gap: 24,
        padding: "24px 16px",
      }}
    >
      {/* Spinner */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        style={{
          width: 48,
          height: 48,
          border: "3px solid #3a302a",
          borderTop: "3px solid #C9A84C",
          borderRadius: "50%",
        }}
      />

      {/* Progress bar */}
      <div
        style={{
          width: "100%",
          maxWidth: 240,
          height: 4,
          borderRadius: 2,
          background: "#3a302a",
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            height: "100%",
            borderRadius: 2,
            background: "linear-gradient(90deg, #C9A84C, #D4A854)",
          }}
        />
      </div>

      {/* Label */}
      <motion.p
        key={label}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ color: "#9B918A", fontSize: 14, textAlign: "center" }}
      >
        {label}
      </motion.p>
    </div>
  );
}
