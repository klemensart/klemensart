"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SpriteAnimation } from "@/lib/leonardo/types";
import {
  SPRITE_CONFIGS,
  SPRITE_FRAME_W,
  SPRITE_FRAME_H,
  DISPLAY_W,
  DISPLAY_H,
  FALLBACK_PORTRAIT,
} from "@/lib/leonardo/sprite-config";

interface SpriteCharacterProps {
  animation: SpriteAnimation;
  /** Ekrandaki gösterim genişliği — varsayılan 240px */
  width?: number;
  /** Ekrandaki gösterim yüksekliği — varsayılan 360px */
  height?: number;
}

/** Sprite sheet'in yüklenip yüklenmediğini kontrol eder */
function useSpriteLoaded(src: string): boolean {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    const img = new Image();
    img.onload = () => setLoaded(true);
    img.onerror = () => setLoaded(false);
    img.src = src;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return loaded;
}

/** Fallback portrait yüklenme durumu */
function useFallbackLoaded(): boolean {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setLoaded(true);
    img.onerror = () => setLoaded(false);
    img.src = FALLBACK_PORTRAIT;
  }, []);

  return loaded;
}

/**
 * CSS sprite sheet animasyonlu Leonardo karakteri.
 *
 * Fallback zinciri:
 * 1. Sprite sheet varsa → CSS steps() animasyon
 * 2. Sprite yüklenemezse → fallback-portrait.webp (statik portre)
 * 3. O da yoksa → gradient arka planlı isim plaketi
 */
export default function SpriteCharacter({
  animation,
  width = DISPLAY_W,
  height = DISPLAY_H,
}: SpriteCharacterProps) {
  const config = SPRITE_CONFIGS[animation];
  const spriteLoaded = useSpriteLoaded(config.src);
  const fallbackLoaded = useFallbackLoaded();

  // loop=false animasyonlarda holdFrame'de kalma
  const [held, setHeld] = useState(false);
  const prevAnimRef = useRef(animation);

  useEffect(() => {
    // Animasyon değiştiğinde held'i sıfırla
    if (prevAnimRef.current !== animation) {
      setHeld(false);
      prevAnimRef.current = animation;
    }

    if (config.loop || held) return;

    // Animasyon bitince holdFrame'e geç
    const timer = setTimeout(() => {
      setHeld(true);
    }, config.durationMs);

    return () => clearTimeout(timer);
  }, [animation, config, held]);

  const scaleX = width / SPRITE_FRAME_W;
  const scaleY = height / SPRITE_FRAME_H;

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <AnimatePresence mode="wait">
        {spriteLoaded ? (
          <motion.div
            key={`sprite-${animation}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
          >
            <SpriteSheet
              animation={animation}
              held={held}
              scaleX={scaleX}
              scaleY={scaleY}
              width={width}
              height={height}
            />
          </motion.div>
        ) : fallbackLoaded ? (
          <motion.div
            key="fallback-portrait"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${FALLBACK_PORTRAIT})`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
              borderRadius: 12,
            }}
          />
        ) : (
          <motion.div
            key="fallback-gradient"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, #2a2420 0%, #1a1714 100%)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3a302a, #252220)",
                border: "2px solid #D4A854",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                color: "#D4A854",
                fontWeight: 700,
                fontFamily: "serif",
              }}
            >
              L
            </div>
            <span
              style={{
                color: "#D4A854",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              LEONARDO
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** CSS steps() ile kare kare sprite animasyonu */
function SpriteSheet({
  animation,
  held,
  scaleX,
  scaleY,
  width,
  height,
}: {
  animation: SpriteAnimation;
  held: boolean;
  scaleX: number;
  scaleY: number;
  width: number;
  height: number;
}) {
  const config = SPRITE_CONFIGS[animation];
  const totalW = SPRITE_FRAME_W * config.frames;

  // Unique ID for the keyframe animation
  const animId = `sprite-${animation}`;
  const keyframes = `
    @keyframes ${animId} {
      from { background-position-x: 0; }
      to { background-position-x: -${totalW * scaleX}px; }
    }
  `;

  // Held → sabit frame pozisyonu
  const holdX = held && config.holdFrame !== undefined
    ? -(config.holdFrame * SPRITE_FRAME_W * scaleX)
    : undefined;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />
      <div
        style={{
          width,
          height,
          backgroundImage: `url(${config.src})`,
          backgroundSize: `${totalW * scaleX}px ${SPRITE_FRAME_H * scaleY}px`,
          backgroundRepeat: "no-repeat",
          imageRendering: "auto",
          ...(holdX !== undefined
            ? {
                backgroundPositionX: holdX,
                backgroundPositionY: 0,
              }
            : {
                animation: `${animId} ${config.durationMs}ms steps(${config.frames}) ${config.loop ? "infinite" : "forwards"}`,
              }),
        }}
      />
    </>
  );
}
