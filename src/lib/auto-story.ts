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
