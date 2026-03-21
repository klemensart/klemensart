import type { SpriteAnimation, SpriteConfig } from "./types";

/** Sprite kare boyutu (piksel) — retina asset, ekranda yarısı gösterilir */
export const SPRITE_FRAME_W = 480;
export const SPRITE_FRAME_H = 720;

/** Ekrandaki gösterim boyutu */
export const DISPLAY_W = 240;
export const DISPLAY_H = 360;

/** Her animasyon durumunun sprite sheet konfigürasyonu */
export const SPRITE_CONFIGS: Record<SpriteAnimation, SpriteConfig> = {
  idle: {
    frames: 6,
    durationMs: 1200,
    loop: true,
    src: "/images/leonardo/sprites/idle.webp",
  },
  talking: {
    frames: 8,
    durationMs: 800,
    loop: true,
    src: "/images/leonardo/sprites/talking.webp",
  },
  happy: {
    frames: 6,
    durationMs: 900,
    loop: false,
    holdFrame: 5, // son karede kal
    src: "/images/leonardo/sprites/happy.webp",
  },
  sad: {
    frames: 4,
    durationMs: 1000,
    loop: false,
    holdFrame: 3,
    src: "/images/leonardo/sprites/sad.webp",
  },
  thinking: {
    frames: 6,
    durationMs: 1500,
    loop: true,
    src: "/images/leonardo/sprites/thinking.webp",
  },
  pointing: {
    frames: 6,
    durationMs: 1000,
    loop: false,
    holdFrame: 5,
    src: "/images/leonardo/sprites/pointing.webp",
  },
  greeting: {
    frames: 6,
    durationMs: 1200,
    loop: false,
    holdFrame: 5,
    src: "/images/leonardo/sprites/greeting.webp",
  },
};

/** Fallback statik portre */
export const FALLBACK_PORTRAIT = "/images/leonardo/fallback-portrait.webp";

/** Tüm sprite sheet URL'leri (preload için) */
export const ALL_SPRITE_URLS = Object.values(SPRITE_CONFIGS).map((c) => c.src);

/** Phase + durum → animasyon eşlemesi */
export function getAnimationForPhase(
  phase: string,
  opts: { isTyping?: boolean; hasArtwork?: boolean; isCorrect?: boolean | null },
): SpriteAnimation {
  switch (phase) {
    case "intro":
      return "greeting";
    case "room-intro":
      return "idle";
    case "dialogue":
      return opts.isTyping ? "talking" : opts.hasArtwork ? "pointing" : "idle";
    case "question":
      return "thinking";
    case "reaction":
      return opts.isCorrect === true
        ? "happy"
        : opts.isCorrect === false
          ? "sad"
          : "idle";
    case "room-complete":
      return "happy";
    case "room-transition":
      return "idle";
    case "result":
      return "happy";
    default:
      return "idle";
  }
}
