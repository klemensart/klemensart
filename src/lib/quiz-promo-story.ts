/**
 * Rönesans Quiz tanıtımı için 3 adet Instagram Story tasarımı üretir.
 * Format: 1080×1920 (Instagram Story)
 *
 * Story 1 — Hook: Merak uyandırma (koyu müze, tablo detayı, soru)
 * Story 2 — Challenge: Davet (krem, bilgi çipleri, CTA)
 * Story 3 — Sonuç Merakı: Rozet listesi (koyu, gold aksan)
 */

type StoryObject = {
  type: "text" | "image" | "shape";
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation: number;
  opacity: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string;
  fill?: string;
  align?: string;
  letterSpacing?: number;
  lineHeight?: number;
  src?: string;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
  shapeType?: "rect" | "circle" | "line";
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
};

type StoryCanvasData = {
  backgroundColor: string;
  objects: StoryObject[];
};

// ── Story 1 — Hook (Merak Uyandırma) ────────────────────────

function generateStory1(): StoryCanvasData {
  const BG = "#1a1714";
  const PAD = 80;
  const CONTENT_W = 1080 - PAD * 2; // 920

  const objects: StoryObject[] = [
    // Koyu müze arka plan
    {
      type: "shape",
      x: 0, y: 0, width: 1080, height: 1920,
      fill: BG, shapeType: "rect", opacity: 1, rotation: 0,
    },
    // "klemens" logo — sağ üst
    {
      type: "text",
      x: 700, y: 60, width: 300,
      text: "klemens",
      fontSize: 36, fontFamily: "Cormorant Garamond", fontStyle: "italic",
      fill: "#ffffff", align: "right", opacity: 0.85, rotation: 0,
    },
    // Venüs'ün Doğuşu — Hora detayı (sağdaki pelerinli figür, Botticelli)
    {
      type: "image",
      x: PAD, y: 160, width: CONTENT_W, height: 820,
      src: "/images/testler/ronesans/venusun-dogusu.webp",
      cropX: 570, cropY: 20, cropWidth: 230, cropHeight: 300,
      cornerRadius: 20, opacity: 1, rotation: 0,
    },
    // Soru metni — büyük, italic
    {
      type: "text",
      x: PAD, y: 1080, width: CONTENT_W,
      text: "Bu detay hangi\ntabloya ait?",
      fontSize: 72, fontFamily: "Lora", fontStyle: "italic",
      fill: "#ffffff", align: "left", lineHeight: 1.3,
      opacity: 1, rotation: 0,
    },
    // İnce ayraç
    {
      type: "shape",
      x: PAD, y: 1380, width: 120, height: 3,
      fill: "#ff6c5f", shapeType: "rect", opacity: 1, rotation: 0,
    },
    // "Hikayeyi kaydır →"
    {
      type: "text",
      x: PAD, y: 1420, width: CONTENT_W,
      text: "Hikayeyi kaydır \u2192",
      fontSize: 28, fontFamily: "Montserrat", fontStyle: "normal",
      fill: "#ff6c5f", align: "left", letterSpacing: 2,
      opacity: 0.9, rotation: 0,
    },
    // Alt logo
    {
      type: "text",
      x: 0, y: 1800, width: 1080,
      text: "klemensart.com",
      fontSize: 22, fontFamily: "Montserrat", fontStyle: "normal",
      fill: "#ffffff", align: "center", opacity: 0.3, rotation: 0,
    },
  ];

  return { backgroundColor: BG, objects };
}

// ── Story 2 — Challenge (Davet) ─────────────────────────────

function generateStory2(): StoryCanvasData {
  const BG = "#FFFBF7";
  const PAD = 80;
  const CONTENT_W = 1080 - PAD * 2; // 920
  const CORAL = "#ff6c5f";
  const DARK = "#2c3e50";
  const WARM_MUTED = "#b0a99f";

  const objects: StoryObject[] = [
    // Krem arka plan
    {
      type: "shape",
      x: 0, y: 0, width: 1080, height: 1920,
      fill: BG, shapeType: "rect", opacity: 1, rotation: 0,
    },
    // ── Hero görsel — Atina Okulu (Raphael) ──
    {
      type: "image",
      x: PAD, y: 70, width: CONTENT_W, height: 560,
      src: "/images/testler/ronesans/atina-okulu.webp",
      cornerRadius: 20, opacity: 1, rotation: 0,
    },
    // Görsel altı dekoratif çift çizgi
    {
      type: "shape",
      x: 380, y: 690, width: 320, height: 2,
      fill: CORAL, shapeType: "rect", opacity: 0.6, rotation: 0,
    },
    {
      type: "shape",
      x: 420, y: 702, width: 240, height: 1,
      fill: CORAL, shapeType: "rect", opacity: 0.3, rotation: 0,
    },
    // Başlık — RÖNESANS SANAT QUIZİ
    {
      type: "text",
      x: PAD, y: 750, width: CONTENT_W,
      text: "RÖNESANS\nSANAT QUIZİ",
      fontSize: 58, fontFamily: "Montserrat", fontStyle: "bold",
      fill: CORAL, align: "center", letterSpacing: 10, lineHeight: 1.35,
      opacity: 1, rotation: 0,
    },
    // ── Bilgi çipleri — dolu coral, beyaz metin ──
    // Çip 1: "10 Soru"
    {
      type: "shape",
      x: 110, y: 990, width: 240, height: 64,
      fill: CORAL, shapeType: "rect", cornerRadius: 32,
      opacity: 1, rotation: 0,
    },
    {
      type: "text",
      x: 110, y: 1005, width: 240,
      text: "10 Soru",
      fontSize: 26, fontFamily: "Montserrat", fontStyle: "bold",
      fill: "#ffffff", align: "center", opacity: 1, rotation: 0,
    },
    // Çip 2: "Hızlı Mod"
    {
      type: "shape",
      x: 400, y: 990, width: 260, height: 64,
      fill: CORAL, shapeType: "rect", cornerRadius: 32,
      opacity: 1, rotation: 0,
    },
    {
      type: "text",
      x: 400, y: 1005, width: 260,
      text: "Hızlı Mod",
      fontSize: 26, fontFamily: "Montserrat", fontStyle: "bold",
      fill: "#ffffff", align: "center", opacity: 1, rotation: 0,
    },
    // Çip 3: "Rozet Kazan"
    {
      type: "shape",
      x: 710, y: 990, width: 280, height: 64,
      fill: CORAL, shapeType: "rect", cornerRadius: 32,
      opacity: 1, rotation: 0,
    },
    {
      type: "text",
      x: 710, y: 1005, width: 280,
      text: "Rozet Kazan",
      fontSize: 26, fontFamily: "Montserrat", fontStyle: "bold",
      fill: "#ffffff", align: "center", opacity: 1, rotation: 0,
    },
    // ── Ana soru metni ──
    {
      type: "text",
      x: PAD, y: 1140, width: CONTENT_W,
      text: "Rönesans'ı ne kadar\ntanıyorsun?",
      fontSize: 58, fontFamily: "Montserrat", fontStyle: "bold",
      fill: DARK, align: "center", lineHeight: 1.4,
      opacity: 1, rotation: 0,
    },
    // ── CTA buton — coral pill ──
    {
      type: "shape",
      x: 240, y: 1400, width: 600, height: 80,
      fill: CORAL, shapeType: "rect", cornerRadius: 40,
      opacity: 1, rotation: 0,
    },
    {
      type: "text",
      x: 240, y: 1418, width: 600,
      text: "Teste Başla \u2192",
      fontSize: 30, fontFamily: "Montserrat", fontStyle: "bold",
      fill: "#ffffff", align: "center",
      opacity: 1, rotation: 0,
    },
    // CTA altı URL
    {
      type: "text",
      x: PAD, y: 1520, width: CONTENT_W,
      text: "klemensart.com/testler/ronesans-quiz",
      fontSize: 22, fontFamily: "Montserrat", fontStyle: "normal",
      fill: WARM_MUTED, align: "center", letterSpacing: 1,
      opacity: 0.7, rotation: 0,
    },
    // ── Alt logo ──
    {
      type: "text",
      x: 0, y: 1810, width: 1080,
      text: "klemens",
      fontSize: 32, fontFamily: "Cormorant Garamond", fontStyle: "italic",
      fill: WARM_MUTED, align: "center", opacity: 0.5, rotation: 0,
    },
  ];

  return { backgroundColor: BG, objects };
}

// ── Story 3 — Sonuç Merakı (Rozetler) ──────────────────────

function generateStory3(): StoryCanvasData {
  const BG = "#1a1714";
  const GOLD = "#C9A84C";
  const CORAL = "#ff6c5f";

  const rozetler = [
    "Rönesans Ustası",
    "Bilge",
    "Sanat Sever",
    "Çırak",
    "Acemi",
  ];

  const objects: StoryObject[] = [
    // Koyu arka plan
    {
      type: "shape",
      x: 0, y: 0, width: 1080, height: 1920,
      fill: BG, shapeType: "rect", opacity: 1, rotation: 0,
    },
    // Üst başlık
    {
      type: "text",
      x: 80, y: 240, width: 920,
      text: "HANGİ ROZETİ\nALACAKSIN?",
      fontSize: 60, fontFamily: "Montserrat", fontStyle: "bold",
      fill: GOLD, align: "center", letterSpacing: 6, lineHeight: 1.35,
      opacity: 1, rotation: 0,
    },
    // İnce gold ayraç
    {
      type: "shape",
      x: 390, y: 480, width: 300, height: 2,
      fill: GOLD, shapeType: "rect", opacity: 0.5, rotation: 0,
    },
  ];

  // Rozet kutuları — dikey liste
  const startY = 560;
  const boxH = 80;
  const gap = 24;
  const boxW = 640;
  const boxX = (1080 - boxW) / 2; // 220

  rozetler.forEach((rozet, i) => {
    const y = startY + i * (boxH + gap);
    // Border kutu
    objects.push({
      type: "shape",
      x: boxX, y, width: boxW, height: boxH,
      fill: "transparent", stroke: GOLD, strokeWidth: 2,
      shapeType: "rect", cornerRadius: 12, opacity: 0.8, rotation: 0,
    });
    // Rozet metni
    objects.push({
      type: "text",
      x: boxX, y: y + 18, width: boxW,
      text: rozet,
      fontSize: 32, fontFamily: "Montserrat", fontStyle: "bold",
      fill: "#ffffff", align: "center",
      opacity: 1, rotation: 0,
    });
  });

  // CTA buton arka planı
  const ctaY = startY + 5 * (boxH + gap) + 40;
  objects.push({
    type: "shape",
    x: 300, y: ctaY, width: 480, height: 72,
    fill: CORAL, shapeType: "rect", cornerRadius: 36,
    opacity: 1, rotation: 0,
  });
  // CTA metin
  objects.push({
    type: "text",
    x: 300, y: ctaY + 16, width: 480,
    text: "Teste Başla \u2192",
    fontSize: 30, fontFamily: "Montserrat", fontStyle: "bold",
    fill: "#ffffff", align: "center",
    opacity: 1, rotation: 0,
  });

  // Alt logo
  objects.push({
    type: "text",
    x: 0, y: 1800, width: 1080,
    text: "klemens",
    fontSize: 32, fontFamily: "Cormorant Garamond", fontStyle: "italic",
    fill: "#ffffff", align: "center",
    opacity: 0.4, rotation: 0,
  });

  return { backgroundColor: BG, objects };
}

// ── Public API ──────────────────────────────────────────────

export type QuizPromoStory = {
  name: string;
  canvasData: StoryCanvasData;
};

export function generateQuizPromoStories(): QuizPromoStory[] {
  return [
    { name: "Quiz Promo — Hook", canvasData: generateStory1() },
    { name: "Quiz Promo — Challenge", canvasData: generateStory2() },
    { name: "Quiz Promo — Rozetler", canvasData: generateStory3() },
  ];
}

export function generateQuizPromoDesignRows(userId?: string | null) {
  return generateQuizPromoStories().map((story) => ({
    name: story.name,
    platform: "instagram-story",
    width: 1080,
    height: 1920,
    canvas_data: story.canvasData,
    thumbnail_url: null,
    is_template: false,
    ...(userId && userId !== "system" ? { created_by: userId } : {}),
  }));
}
