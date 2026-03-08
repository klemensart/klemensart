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
    // Cover görseli — üst kısım, ferah padding
    {
      type: "image",
      x: 80,
      y: 70,
      width: 920,
      height: 640,
      src: article.image,
      opacity: 1,
      rotation: 0,
    },
    // Kategori etiketi — Montserrat Bold, #ff6c5f, yüksek letter-spacing
    {
      type: "text",
      x: 80,
      y: 790,
      width: 920,
      text: category,
      fontSize: 26,
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
      x: 80,
      y: 870,
      width: 920,
      text: article.description || article.title,
      fontSize: 36,
      fontFamily: "Montserrat",
      fontStyle: "normal",
      fill: "#2c3e50",
      align: "left",
      letterSpacing: 0,
      lineHeight: 1.65,
      opacity: 1,
      rotation: 0,
    },
    // Yazar adı — Montserrat, #2c3e50, gövdenin hemen altında
    // Not: y konumu spot metninin uzunluğuna göre ayarlanmalı.
    // Ortalama bir spot (~200 karakter, 36px, 920px genişlik, 1.65 line-height)
    // yaklaşık 450px yükseklik yapar → 870 + 450 + 40 margin = ~1360
    {
      type: "text",
      x: 80,
      y: 1400,
      width: 920,
      text: `— ${article.author || "Klemens Art"}`,
      fontSize: 26,
      fontFamily: "Montserrat",
      fontStyle: "normal",
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
  userId: string
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
    created_by: userId,
  };
}
