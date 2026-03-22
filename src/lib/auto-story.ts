/**
 * Bir yazıdan otomatik Instagram Story tasarımı üretir.
 * Yazının kategorisi, cover görseli, spot yazısı ve yazar adı kullanılır.
 *
 * Format: 1080×1920 (Instagram Story)
 * Layout: Krem arka plan, üstte görsel, kategori etiketi, spot, yazar adı
 *
 * Tipografi:
 * - Kategori: Montserrat Bold, #ff6c5f, yüksek letter-spacing, ALL CAPS
 * - Gövde: Montserrat, #2c3e50, line-height 1.65
 * - İmza: Montserrat, #2c3e50, gövdenin hemen altında
 */

type ArticleData = {
  title: string;
  description: string; // spot yazısı
  author: string;
  category: string; // Odak, Kültür & Sanat, İlham Verenler, Kent & Yaşam
  image: string; // cover URL
};

type StoryCanvasData = {
  backgroundColor: string;
  objects: StoryObject[];
};

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
  shapeType?: "rect" | "circle" | "line";
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
};

/**
 * Kategori metnini büyük harfli ve aralıklı formata çevirir:
 * "Kültür & Sanat" → "KÜLTÜR & SANAT"
 * (Harf aralığı Konva letterSpacing ile sağlanır, metin olarak sadece uppercase)
 */
function formatCategory(cat: string): string {
  return cat.toUpperCase();
}

export function generateStoryCanvasData(article: ArticleData): StoryCanvasData {
  const category = formatCategory(article.category || "Odak");

  // Layout sabitleri
  const PAD = 100; // sol/sağ padding
  const CONTENT_W = 1080 - PAD * 2; // 880px

  const objects: StoryObject[] = [
    // Krem arka plan
    {
      type: "shape",
      x: 0,
      y: 0,
      width: 1080,
      height: 1920,
      fill: "#FFFBF7",
      shapeType: "rect",
      opacity: 1,
      rotation: 0,
    },
    // Cover görseli — yuvarlatılmış köşeler
    {
      type: "image",
      x: PAD,
      y: 90,
      width: CONTENT_W,
      height: 620,
      src: article.image,
      cornerRadius: 16,
      opacity: 1,
      rotation: 0,
    },
    // İnce ayraç çizgi — fotoğraf ile kategori arası
    {
      type: "shape",
      x: PAD,
      y: 750,
      width: CONTENT_W,
      height: 1,
      fill: "#e8e4df",
      shapeType: "rect",
      opacity: 1,
      rotation: 0,
    },
    // Kategori etiketi — Montserrat Bold, #ff6c5f, yüksek letter-spacing
    {
      type: "text",
      x: PAD,
      y: 785,
      width: CONTENT_W,
      text: category,
      fontSize: 43,
      fontFamily: "Montserrat",
      fontStyle: "bold",
      fill: "#ff6c5f",
      align: "left",
      letterSpacing: 12,
      lineHeight: 1.2,
      opacity: 1,
      rotation: 0,
    },
    // Spot yazısı — Montserrat, #2c3e50, ferah line-height
    {
      type: "text",
      x: PAD,
      y: 870,
      width: CONTENT_W - 40,
      text: article.description || article.title,
      fontSize: 40,
      fontFamily: "Montserrat",
      fontStyle: "normal",
      fill: "#2c3e50",
      align: "left",
      letterSpacing: 0,
      lineHeight: 1.79,
      opacity: 1,
      rotation: 0,
    },
    // Yazar adı — gövdenin altında
    {
      type: "text",
      x: PAD,
      y: 1280,
      width: CONTENT_W,
      text: `— ${article.author || "Klemens Art"}`,
      fontSize: 34,
      fontFamily: "Montserrat",
      fontStyle: "italic",
      fill: "#2c3e50",
      align: "left",
      letterSpacing: 0,
      lineHeight: 1.2,
      opacity: 1,
      rotation: 0,
    },
  ];

  return {
    backgroundColor: "#FFFBF7",
    objects,
  };
}

export function generateStoryDesignRow(
  article: ArticleData & { id?: string },
  userId?: string | null
) {
  const canvasData = generateStoryCanvasData(article);

  return {
    name: `Story — ${article.title}`,
    platform: "instagram-story",
    width: 1080,
    height: 1920,
    canvas_data: canvasData,
    thumbnail_url: null,
    is_template: false,
    ...(userId && userId !== "system" ? { created_by: userId } : {}),
  };
}

/* ------------------------------------------------------------------ */
/*  Leonardo — Dark Story Variant                                      */
/*  Koyu arka plan, altın aksanlar, oyunun atmosferine uygun           */
/* ------------------------------------------------------------------ */

const LEONARDO_COLORS = {
  bg: "#141414",
  gold: "#C9A84C",
  goldMuted: "#C9A84C66", // %40 opacity
  white: "#FFFFFF",
  whiteSoft: "#FFFFFF80", // %50 opacity
  coral: "#FF6D60",
};

type LeonardoStoryOptions = {
  /** Portre görseli URL'i (varsayılan: fallback-portrait.webp) */
  portraitUrl?: string;
  /** Üst etiket (varsayılan: "LEONARDO'NUN ATÖLYESİ") */
  tag?: string;
  /** Ana başlık */
  title?: string;
  /** Alt açıklama */
  subtitle?: string;
  /** İmza (varsayılan: "KLEMENS") */
  signature?: string;
};

export function generateLeonardoStoryCanvasData(
  opts: LeonardoStoryOptions = {}
): StoryCanvasData {
  const {
    portraitUrl = "https://klemensart.com/images/leonardo/fallback-portrait.webp",
    tag = "LEONARDO'NUN ATÖLYESİ",
    title = "Leonardo'nun Atölyesine\nDavetlisiniz",
    subtitle = "5 gizemli oda · 25 zorlu soru\nSeni atölyede bekliyor.",
    signature = "KLEMENS",
  } = opts;

  // IG Story safe zone: üst ~200px, alt ~280px UI ile kapanır
  // İçerik y=200 – y=1640 arasında kalmalı
  const PAD = 100;
  const CONTENT_W = 1080 - PAD * 2; // 880px
  const PORTRAIT_W = 600;
  const PORTRAIT_H = 900; // 2:3 oran
  const PORTRAIT_X = (1080 - PORTRAIT_W) / 2; // 240

  const objects: StoryObject[] = [
    // Koyu arka plan
    {
      type: "shape",
      x: 0,
      y: 0,
      width: 1080,
      height: 1920,
      fill: LEONARDO_COLORS.bg,
      shapeType: "rect",
      opacity: 1,
      rotation: 0,
    },
    // Üst etiket — altın, letter-spaced (safe zone: y≥200)
    {
      type: "text",
      x: PAD,
      y: 200,
      width: CONTENT_W,
      text: tag,
      fontSize: 28,
      fontFamily: "Montserrat",
      fontStyle: "bold",
      fill: LEONARDO_COLORS.gold,
      align: "left",
      letterSpacing: 10,
      lineHeight: 1.2,
      opacity: 1,
      rotation: 0,
    },
    // Leonardo portresi — merkez, yuvarlatılmış köşe
    {
      type: "image",
      x: PORTRAIT_X,
      y: 270,
      width: PORTRAIT_W,
      height: PORTRAIT_H,
      src: portraitUrl,
      cornerRadius: 20,
      opacity: 1,
      rotation: 0,
    },
    // Altın ayraç çizgi
    {
      type: "shape",
      x: PAD,
      y: 1200,
      width: CONTENT_W,
      height: 1,
      fill: LEONARDO_COLORS.gold,
      shapeType: "rect",
      opacity: 0.3,
      rotation: 0,
    },
    // Ana başlık — beyaz, büyük
    {
      type: "text",
      x: PAD,
      y: 1240,
      width: CONTENT_W,
      text: title,
      fontSize: 50,
      fontFamily: "Montserrat",
      fontStyle: "bold",
      fill: LEONARDO_COLORS.white,
      align: "left",
      letterSpacing: 0,
      lineHeight: 1.3,
      opacity: 1,
      rotation: 0,
    },
    // Alt açıklama — beyaz, yarı saydam
    {
      type: "text",
      x: PAD,
      y: 1410,
      width: CONTENT_W,
      text: subtitle,
      fontSize: 34,
      fontFamily: "Montserrat",
      fontStyle: "normal",
      fill: LEONARDO_COLORS.whiteSoft,
      align: "left",
      letterSpacing: 0,
      lineHeight: 1.6,
      opacity: 1,
      rotation: 0,
    },
    // İmza — altın, italik (safe zone: y≤1640)
    {
      type: "text",
      x: PAD,
      y: 1590,
      width: CONTENT_W,
      text: `— ${signature}`,
      fontSize: 34,
      fontFamily: "Montserrat",
      fontStyle: "italic",
      fill: LEONARDO_COLORS.gold,
      align: "left",
      letterSpacing: 0,
      lineHeight: 1.2,
      opacity: 1,
      rotation: 0,
    },
  ];

  return { backgroundColor: LEONARDO_COLORS.bg, objects };
}

export function generateLeonardoStoryDesignRow(
  opts: LeonardoStoryOptions = {},
  userId?: string | null
) {
  const canvasData = generateLeonardoStoryCanvasData(opts);

  return {
    name: "Story — Leonardo'nun Atölyesi",
    platform: "instagram-story",
    width: 1080,
    height: 1920,
    canvas_data: canvasData,
    thumbnail_url: null,
    is_template: false,
    ...(userId && userId !== "system" ? { created_by: userId } : {}),
  };
}
