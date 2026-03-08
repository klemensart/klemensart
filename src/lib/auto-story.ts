/**
 * Bir yazıdan otomatik Instagram Story tasarımı üretir.
 * Yazının kategorisi, cover görseli, spot yazısı ve yazar adı kullanılır.
 *
 * Format: 1080×1920 (Instagram Story)
 * Layout: Krem arka plan, üstte görsel, kategori etiketi, spot, yazar adı
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
  src?: string;
  shapeType?: "rect" | "circle" | "line";
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
};

/**
 * Kategori metnini büyük harfli ve aralıklı formata çevirir:
 * "Kültür & Sanat" → "K Ü L T Ü R   &   S A N A T"
 */
function spaceCategory(cat: string): string {
  return cat
    .toUpperCase()
    .split("")
    .map((ch) => {
      if (ch === " ") return "  ";
      if (ch === "&") return " & ";
      return ch;
    })
    .join(" ")
    .replace(/\s{3,}/g, "   ")
    .trim();
}

export function generateStoryCanvasData(article: ArticleData): StoryCanvasData {
  const categorySpaced = spaceCategory(article.category || "Odak");

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
    // Cover görseli
    {
      type: "image",
      x: 80,
      y: 60,
      width: 920,
      height: 620,
      src: article.image,
      opacity: 1,
      rotation: 0,
    },
    // Kategori etiketi — coral, uppercase, spaced
    {
      type: "text",
      x: 80,
      y: 750,
      width: 920,
      text: categorySpaced,
      fontSize: 28,
      fontFamily: "Space Grotesk",
      fontStyle: "bold",
      fill: "#FF6D60",
      align: "left",
      opacity: 1,
      rotation: 0,
    },
    // Spot yazısı — büyük serif
    {
      type: "text",
      x: 80,
      y: 830,
      width: 920,
      text: article.description || article.title,
      fontSize: 38,
      fontFamily: "Cormorant Garamond",
      fontStyle: "normal",
      fill: "#2D2926",
      align: "left",
      opacity: 1,
      rotation: 0,
    },
    // Yazar adı
    {
      type: "text",
      x: 80,
      y: 1760,
      width: 920,
      text: `— ${article.author || "Klemens Art"}`,
      fontSize: 26,
      fontFamily: "Space Grotesk",
      fontStyle: "normal",
      fill: "#8C857E",
      align: "left",
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
