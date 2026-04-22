/**
 * Bir atölye kaydından otomatik sosyal medya görseli canvas_data üretir.
 *
 * 3 format:
 *   Feed  — 1080×1080  (Instagram Post)
 *   Story — 1080×1920  (Instagram Story)
 *   Landscape — 1200×630  (OG / Twitter)
 */

/* ─── Tipler ──────────────────────────────────────── */

export type AtolyeCardInput = {
  title: string;
  category: string;
  startDate: string | null;
  endDate: string | null;
  instructorName: string | null;
  instructorAvatarUrl: string | null;
  venue: string | null;
  city: string;
  district: string | null;
  price: number;
  currency: string;
  coverImageUrl: string | null;
  organizerLogoUrl: string | null;
};

export type AtolyeCardFormat = "feed" | "story" | "landscape";

type CanvasObject = {
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

type CanvasData = {
  backgroundColor: string;
  objects: CanvasObject[];
};

/* ─── Sabitler ────────────────────────────────────── */

const CORAL = "#FF6D60";
const CREAM = "#FFFBF7";
const DARK = "#2C2319";
const DARK_50 = "#2C231980";
const DIVIDER = "#e8e4df";

const LOGO_URL = "https://klemensart.com/logos/logo-wide-dark.PNG";

const CATEGORY_LABELS: Record<string, string> = {
  resim: "RESİM",
  seramik: "SERAMİK",
  fotograf: "FOTOĞRAF",
  muzik: "MÜZİK",
  heykel: "HEYKEL",
  dijital: "DİJİTAL SANAT",
  yazarlik: "YAZARLIK",
  dans: "DANS",
  tiyatro: "TİYATRO",
  "sanat-tarihi": "SANAT TARİHİ",
  sinema: "SİNEMA",
  diger: "ATÖLYE",
};

/* ─── Yardımcılar ─────────────────────────────────── */

function fmtCategory(cat: string): string {
  return CATEGORY_LABELS[cat] || cat.toUpperCase();
}

function fmtDate(startDate: string | null, endDate: string | null): string {
  if (!startDate) return "";
  const s = new Date(startDate);
  const months = [
    "OCA", "ŞUB", "MAR", "NİS", "MAY", "HAZ",
    "TEM", "AĞU", "EYL", "EKİ", "KAS", "ARA",
  ];
  const month = months[s.getMonth()];
  const day = s.getDate();

  if (endDate) {
    const e = new Date(endDate);
    if (e.getMonth() === s.getMonth()) {
      return `${month} ${day}–${e.getDate()}`;
    }
    return `${month} ${day} – ${months[e.getMonth()]} ${e.getDate()}`;
  }
  return `${month} ${day}`;
}

function fmtPrice(price: number, currency: string): string {
  if (!price || price <= 0) return "Ücretsiz";
  const sym = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₺";
  return `${sym}${price.toLocaleString("tr-TR")}`;
}

function fmtLocation(venue: string | null, city: string, district: string | null): string {
  const parts: string[] = [];
  if (venue) parts.push(venue);
  if (district) parts.push(district);
  if (city && city !== "Ankara") parts.push(city);
  else if (!district) parts.push("Ankara");
  return parts.join(", ");
}

function getInitial(name: string | null): string {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
}

function avatarNodes(
  x: number, y: number, size: number, borderWidth: number,
  avatarUrl: string | null, instructorName: string | null,
): CanvasObject[] {
  const outerSize = size + borderWidth * 2;
  const nodes: CanvasObject[] = [
    // Coral border circle
    {
      type: "shape", x: x - borderWidth, y: y - borderWidth,
      width: outerSize, height: outerSize,
      fill: CORAL, shapeType: "circle", opacity: 1, rotation: 0,
    },
  ];

  if (avatarUrl) {
    nodes.push({
      type: "image", x, y, width: size, height: size,
      src: avatarUrl, cornerRadius: size / 2,
      opacity: 1, rotation: 0,
    });
  } else {
    // Cream circle + coral initial
    nodes.push(
      {
        type: "shape", x, y, width: size, height: size,
        fill: CREAM, shapeType: "circle", opacity: 1, rotation: 0,
      },
      {
        type: "text", x, y: y + size * 0.15, width: size,
        text: getInitial(instructorName),
        fontSize: Math.round(size * 0.45), fontFamily: "Montserrat", fontStyle: "bold",
        fill: CORAL, align: "center", letterSpacing: 0, lineHeight: 1.2,
        opacity: 1, rotation: 0,
      },
    );
  }
  return nodes;
}

/* ─── FEED — 1080×1080 ────────────────────────────── */

function generateFeed(a: AtolyeCardInput): CanvasData {
  const W = 1080;
  const category = fmtCategory(a.category);
  const dateStr = fmtDate(a.startDate, a.endDate);
  const priceStr = fmtPrice(a.price, a.currency);
  const location = fmtLocation(a.venue, a.city, a.district);

  const objects: CanvasObject[] = [
    // Cream background
    { type: "shape", x: 0, y: 0, width: W, height: W, fill: CREAM, shapeType: "rect", opacity: 1, rotation: 0 },
    // Coral top band
    { type: "shape", x: 0, y: 0, width: W, height: 180, fill: CORAL, shapeType: "rect", opacity: 1, rotation: 0 },
    // Category text (on coral band)
    {
      type: "text", x: 60, y: 70, width: 500,
      text: category,
      fontSize: 28, fontFamily: "Montserrat", fontStyle: "bold",
      fill: "#FFFFFF", align: "left", letterSpacing: 6, lineHeight: 1.2,
      opacity: 1, rotation: 0,
    },
    // Date box (white bg on coral band)
    {
      type: "shape", x: W - 240, y: 40, width: 190, height: 100,
      fill: "#FFFFFF", shapeType: "rect", cornerRadius: 12,
      opacity: 1, rotation: 0,
    },
    // Date text
    {
      type: "text", x: W - 235, y: 58, width: 180,
      text: dateStr,
      fontSize: 30, fontFamily: "Montserrat", fontStyle: "bold",
      fill: CORAL, align: "center", letterSpacing: 0, lineHeight: 1.3,
      opacity: 1, rotation: 0,
    },
  ];

  // Cover image area (180–620)
  if (a.coverImageUrl) {
    objects.push({
      type: "image", x: 0, y: 180, width: W, height: 440,
      src: a.coverImageUrl,
      opacity: 1, rotation: 0,
    });
  } else {
    objects.push({
      type: "shape", x: 0, y: 180, width: W, height: 440,
      fill: "#F0E4D9", shapeType: "rect", opacity: 1, rotation: 0,
    });
    objects.push({
      type: "text", x: 0, y: 350, width: W,
      text: category, fontSize: 60, fontFamily: "Montserrat", fontStyle: "bold",
      fill: CORAL, align: "center", letterSpacing: 8, lineHeight: 1.2,
      opacity: 0.3, rotation: 0,
    });
  }

  // Avatar (centered, on cover/cream boundary)
  const avatarSize = 96;
  const avatarY = 620 - avatarSize / 2;
  objects.push(
    ...avatarNodes(
      (W - avatarSize) / 2, avatarY, avatarSize, 4,
      a.instructorAvatarUrl, a.instructorName,
    ),
  );

  // Content below avatar — centered
  const contentY = avatarY + avatarSize + 20;

  // Title (centered)
  objects.push({
    type: "text", x: 60, y: contentY, width: W - 120,
    text: a.title,
    fontSize: 44, fontFamily: "Newsreader", fontStyle: "bold",
    fill: DARK, align: "center", letterSpacing: 0, lineHeight: 1.25,
    opacity: 1, rotation: 0,
  });

  // Instructor name (centered)
  if (a.instructorName) {
    objects.push({
      type: "text", x: 60, y: contentY + 120, width: W - 120,
      text: a.instructorName,
      fontSize: 26, fontFamily: "Montserrat", fontStyle: "500",
      fill: DARK_50, align: "center", letterSpacing: 0, lineHeight: 1.2,
      opacity: 1, rotation: 0,
    });
  }

  // Location (centered)
  objects.push({
    type: "text", x: 60, y: contentY + 160, width: W - 120,
    text: `✦  ${location}`,
    fontSize: 24, fontFamily: "Montserrat", fontStyle: "normal",
    fill: DARK_50, align: "center", letterSpacing: 0, lineHeight: 1.2,
    opacity: 1, rotation: 0,
  });

  // Price (bottom right)
  objects.push({
    type: "text", x: W - 340, y: W - 100, width: 300,
    text: priceStr,
    fontSize: 56, fontFamily: "Plus Jakarta Sans", fontStyle: "bold",
    fill: CORAL, align: "right", letterSpacing: 0, lineHeight: 1.2,
    opacity: 1, rotation: 0,
  });

  // Klemens logo (bottom left, 100px wide, 40px padding)
  objects.push({
    type: "image", x: 40, y: W - 40 - 30, width: 100, height: 30,
    src: LOGO_URL, opacity: 1, rotation: 0,
  });

  return { backgroundColor: CREAM, objects };
}

/* ─── STORY — 1080×1920 ───────────────────────────── */

function generateStory(a: AtolyeCardInput): CanvasData {
  const W = 1080;
  const H = 1920;
  const category = fmtCategory(a.category);
  const dateStr = fmtDate(a.startDate, a.endDate);
  const priceStr = fmtPrice(a.price, a.currency);
  const location = fmtLocation(a.venue, a.city, a.district);

  // Cover image takes top 60%
  const coverH = Math.round(H * 0.6);
  const blockY = coverH;
  const blockH = H - blockY;

  const objects: CanvasObject[] = [
    // Cover image or placeholder
    a.coverImageUrl
      ? { type: "image", x: 0, y: 0, width: W, height: coverH, src: a.coverImageUrl, opacity: 1, rotation: 0 }
      : { type: "shape", x: 0, y: 0, width: W, height: coverH, fill: "#F0E4D9", shapeType: "rect", opacity: 1, rotation: 0 },
    // Dark overlay on cover
    { type: "shape", x: 0, y: 0, width: W, height: coverH, fill: "#000000", shapeType: "rect", opacity: 0.25, rotation: 0 },
    // Category pill (top left, safe zone y>=100)
    {
      type: "shape", x: 60, y: 110, width: category.length * 20 + 40, height: 44,
      fill: CORAL, shapeType: "rect", cornerRadius: 22,
      opacity: 1, rotation: 0,
    },
    {
      type: "text", x: 80, y: 120, width: category.length * 20 + 10,
      text: category,
      fontSize: 22, fontFamily: "Montserrat", fontStyle: "bold",
      fill: "#FFFFFF", align: "left", letterSpacing: 4, lineHeight: 1.2,
      opacity: 1, rotation: 0,
    },
    // Date box (top right)
    {
      type: "shape", x: W - 220, y: 100, width: 170, height: 70,
      fill: "#FFFFFF", shapeType: "rect", cornerRadius: 12,
      opacity: 0.95, rotation: 0,
    },
    {
      type: "text", x: W - 215, y: 115, width: 160,
      text: dateStr,
      fontSize: 26, fontFamily: "Montserrat", fontStyle: "bold",
      fill: CORAL, align: "center", letterSpacing: 0, lineHeight: 1.3,
      opacity: 1, rotation: 0,
    },
  ];

  // Cream content block (bottom)
  objects.push({
    type: "shape", x: 0, y: blockY, width: W, height: blockH,
    fill: CREAM, shapeType: "rect", opacity: 1, rotation: 0,
  });

  // Avatar (200px, 6px border, centered on block top edge, NO coral bg circle)
  const avatarSize = 200;
  const avatarBorder = 6;
  const avatarX = (W - avatarSize) / 2;
  const avatarY = blockY - avatarSize / 2;
  objects.push(
    ...avatarNodes(avatarX, avatarY, avatarSize, avatarBorder,
      a.instructorAvatarUrl, a.instructorName),
  );

  // Content vertically centered in cream block (below avatar)
  // Items: title (~160px) + instructor(40) + divider(40) + location(40) + price(60) = ~340px
  const contentBlockH = 340;
  const avatarBottom = avatarY + avatarSize + avatarBorder + 20;
  const logoH = 48;
  const logoMarginBottom = 60;
  const availableH = (H - logoMarginBottom - logoH) - avatarBottom;
  const contentY = avatarBottom + (availableH - contentBlockH) / 2;

  // Title
  objects.push({
    type: "text", x: 80, y: contentY, width: W - 160,
    text: a.title,
    fontSize: 60, fontFamily: "Newsreader", fontStyle: "bold",
    fill: DARK, align: "center", letterSpacing: 0, lineHeight: 1.2,
    opacity: 1, rotation: 0,
  });

  // Instructor name
  if (a.instructorName) {
    objects.push({
      type: "text", x: 80, y: contentY + 160, width: W - 160,
      text: a.instructorName,
      fontSize: 30, fontFamily: "Montserrat", fontStyle: "500",
      fill: DARK_50, align: "center", letterSpacing: 0, lineHeight: 1.2,
      opacity: 1, rotation: 0,
    });
  }

  // Divider
  objects.push({
    type: "shape", x: W / 2 - 60, y: contentY + 210, width: 120, height: 1,
    fill: DIVIDER, shapeType: "rect", opacity: 1, rotation: 0,
  });

  // Location
  objects.push({
    type: "text", x: 80, y: contentY + 230, width: W - 160,
    text: `✦  ${location}`,
    fontSize: 26, fontFamily: "Montserrat", fontStyle: "normal",
    fill: DARK_50, align: "center", letterSpacing: 0, lineHeight: 1.2,
    opacity: 1, rotation: 0,
  });

  // Price
  objects.push({
    type: "text", x: 80, y: contentY + 280, width: W - 160,
    text: priceStr,
    fontSize: 44, fontFamily: "Montserrat", fontStyle: "bold",
    fill: CORAL, align: "center", letterSpacing: 0, lineHeight: 1.2,
    opacity: 1, rotation: 0,
  });

  // Klemens logo (bottom center, 140px wide, 60px from bottom)
  objects.push({
    type: "image", x: (W - 140) / 2, y: H - 60 - logoH, width: 140, height: logoH,
    src: LOGO_URL, opacity: 1, rotation: 0,
  });

  return { backgroundColor: CREAM, objects };
}

/* ─── LANDSCAPE — 1200×630 ────────────────────────── */

function generateLandscape(a: AtolyeCardInput): CanvasData {
  const W = 1200;
  const H = 630;
  const HALF = W / 2;
  const category = fmtCategory(a.category);
  const dateStr = fmtDate(a.startDate, a.endDate);
  const priceStr = fmtPrice(a.price, a.currency);
  const location = fmtLocation(a.venue, a.city, a.district);

  const objects: CanvasObject[] = [
    // Cream background
    { type: "shape", x: 0, y: 0, width: W, height: H, fill: CREAM, shapeType: "rect", opacity: 1, rotation: 0 },
  ];

  // Left half: cover image
  if (a.coverImageUrl) {
    objects.push({
      type: "image", x: 0, y: 0, width: HALF, height: H,
      src: a.coverImageUrl, opacity: 1, rotation: 0,
    });
  } else {
    objects.push(
      { type: "shape", x: 0, y: 0, width: HALF, height: H, fill: "#F0E4D9", shapeType: "rect", opacity: 1, rotation: 0 },
      {
        type: "text", x: 0, y: 260, width: HALF,
        text: category, fontSize: 40, fontFamily: "Montserrat", fontStyle: "bold",
        fill: CORAL, align: "center", letterSpacing: 6, lineHeight: 1.2,
        opacity: 0.3, rotation: 0,
      },
    );
  }

  // Right half — vertically centered content
  const RX = HALF + 40;
  const RW = HALF - 80;
  const PAD = 40;

  // Calculate total content height for vertical centering:
  // pill(34) + gap(12) + dateBox(44) + gap(20) + avatar(80+8+12) + title(~100) + instructor(30) + location(30) + price(44) + logo(30)
  // Approximate: 34+12+44+20+100+100+30+30+44+30 ≈ 444
  const contentH = 460;
  const startY = (H - contentH) / 2;

  // Category pill
  const pillW = category.length * 14 + 30;
  objects.push({
    type: "shape", x: RX, y: startY, width: pillW, height: 34,
    fill: CORAL, shapeType: "rect", cornerRadius: 17, opacity: 1, rotation: 0,
  });
  objects.push({
    type: "text", x: RX + 15, y: startY + 7, width: pillW - 10,
    text: category, fontSize: 16, fontFamily: "Montserrat", fontStyle: "bold",
    fill: "#FFFFFF", align: "left", letterSpacing: 3, lineHeight: 1.2,
    opacity: 1, rotation: 0,
  });

  // Date box (white bg + coral text + rounded)
  const dateBoxY = startY + 46;
  if (dateStr) {
    const dateBoxW = dateStr.length * 14 + 24;
    objects.push({
      type: "shape", x: RX, y: dateBoxY, width: dateBoxW, height: 40,
      fill: "#FFFFFF", shapeType: "rect", cornerRadius: 8,
      opacity: 1, rotation: 0,
    });
    objects.push({
      type: "text", x: RX + 12, y: dateBoxY + 8, width: dateBoxW - 24,
      text: dateStr, fontSize: 20, fontFamily: "Montserrat", fontStyle: "bold",
      fill: CORAL, align: "left", letterSpacing: 0, lineHeight: 1.2,
      opacity: 1, rotation: 0,
    });
  }

  // Avatar (left-aligned, 80px)
  const avatarY = dateBoxY + 52;
  const avatarSize = 80;
  objects.push(
    ...avatarNodes(RX, avatarY, avatarSize, 4,
      a.instructorAvatarUrl, a.instructorName),
  );

  // Title (next to avatar)
  objects.push({
    type: "text", x: RX + avatarSize + 20, y: avatarY, width: RW - avatarSize - 20,
    text: a.title,
    fontSize: 32, fontFamily: "Newsreader", fontStyle: "bold",
    fill: DARK, align: "left", letterSpacing: 0, lineHeight: 1.2,
    opacity: 1, rotation: 0,
  });

  // Instructor name (below avatar row)
  const infoY = avatarY + avatarSize + 20;
  if (a.instructorName) {
    objects.push({
      type: "text", x: RX, y: infoY, width: RW,
      text: a.instructorName,
      fontSize: 20, fontFamily: "Montserrat", fontStyle: "500",
      fill: DARK_50, align: "left", letterSpacing: 0, lineHeight: 1.2,
      opacity: 1, rotation: 0,
    });
  }

  // Location
  objects.push({
    type: "text", x: RX, y: infoY + 30, width: RW,
    text: `✦  ${location}`,
    fontSize: 18, fontFamily: "Montserrat", fontStyle: "normal",
    fill: DARK_50, align: "left", letterSpacing: 0, lineHeight: 1.2,
    opacity: 1, rotation: 0,
  });

  // Price (bottom right, 40px padding)
  objects.push({
    type: "text", x: RX, y: H - PAD - 44, width: RW,
    text: priceStr,
    fontSize: 36, fontFamily: "Montserrat", fontStyle: "bold",
    fill: CORAL, align: "left", letterSpacing: 0, lineHeight: 1.2,
    opacity: 1, rotation: 0,
  });

  // Logo (bottom right corner, 100px wide, 40px padding)
  objects.push({
    type: "image", x: W - PAD - 100, y: H - PAD - 30, width: 100, height: 30,
    src: LOGO_URL, opacity: 1, rotation: 0,
  });

  return { backgroundColor: CREAM, objects };
}

/* ─── Public API ──────────────────────────────────── */

const FORMATS = {
  feed: { width: 1080, height: 1080, platform: "instagram-post", label: "Feed Post", gen: generateFeed },
  story: { width: 1080, height: 1920, platform: "instagram-story", label: "Story", gen: generateStory },
  landscape: { width: 1200, height: 630, platform: "og-landscape", label: "Landscape", gen: generateLandscape },
} as const;

export function generateAtolyeCardCanvasData(
  atolye: AtolyeCardInput,
  format: AtolyeCardFormat,
): CanvasData {
  return FORMATS[format].gen(atolye);
}

export function generateAtolyeDesignRows(
  atolye: AtolyeCardInput & { id: string },
  userId?: string | null,
) {
  return (Object.keys(FORMATS) as AtolyeCardFormat[]).map((fmt) => {
    const spec = FORMATS[fmt];
    return {
      name: `${atolye.title} — ${spec.label}`,
      platform: spec.platform,
      width: spec.width,
      height: spec.height,
      canvas_data: spec.gen(atolye),
      thumbnail_url: null,
      is_template: false,
      linked_entity_id: atolye.id,
      ...(userId && userId !== "system" ? { created_by: userId } : {}),
    };
  });
}
