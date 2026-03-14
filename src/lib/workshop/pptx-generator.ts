import PptxGenJS from "pptxgenjs";
import { PPTX_COLORS as C, PPTX_FONTS as F } from "./pptx-template";
import { getWeek } from "./curriculum";
import { getArtworksForWeek } from "./artworks";
import { BLOCK_QUIZZES } from "./curriculum";
import type { Artwork, WeekConfig } from "./types";
import * as fs from "fs";
import * as path from "path";

/* ── Helper: Görseli base64'e çevir (PPTX'e embed için) ── */
function tryLoadImage(imagePath: string): string | null {
  // imagePath: /images/workshop/modern-sanat/week-1/impression-sunrise.webp
  const fullPath = path.join(process.cwd(), "public", imagePath);
  try {
    if (fs.existsSync(fullPath)) {
      const buf = fs.readFileSync(fullPath);
      const ext = path.extname(fullPath).slice(1).toLowerCase();
      const mime = ext === "webp" ? "image/webp" : ext === "png" ? "image/png" : "image/jpeg";
      return `data:${mime};base64,${buf.toString("base64")}`;
    }
  } catch {
    // Dosya bulunamadı — placeholder kullanılacak
  }
  return null;
}

/* ── Slayt ekleyiciler ── */

function addCoverSlide(pptx: PptxGenJS, week: WeekConfig) {
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };

  slide.addText("MODERN SANAT ATÖLYESİ", {
    x: 0.8, y: 1.0, w: 11.7, h: 0.6,
    fontSize: 14, fontFace: F.body, color: C.accent,
    bold: true, charSpacing: 6,
  });

  slide.addText(`Hafta ${week.weekNumber}`, {
    x: 0.8, y: 2.0, w: 11.7, h: 0.8,
    fontSize: 20, fontFace: F.body, color: C.muted,
  });

  slide.addText(week.title, {
    x: 0.8, y: 2.8, w: 11.7, h: 1.2,
    fontSize: 44, fontFace: F.heading, color: C.text,
    bold: true,
  });

  slide.addText(week.subtitle, {
    x: 0.8, y: 4.0, w: 11.7, h: 0.8,
    fontSize: 22, fontFace: F.heading, color: C.accent,
    italic: true,
  });

  slide.addText(week.dateRange, {
    x: 0.8, y: 5.2, w: 5, h: 0.5,
    fontSize: 14, fontFace: F.body, color: C.muted,
  });

  slide.addText("klemensart.com", {
    x: 0.8, y: 6.5, w: 5, h: 0.4,
    fontSize: 11, fontFace: F.body, color: C.muted,
  });
}

function addAgendaSlide(pptx: PptxGenJS, week: WeekConfig) {
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };

  slide.addText("Gündem", {
    x: 0.8, y: 0.6, w: 11.7, h: 0.8,
    fontSize: 32, fontFace: F.heading, color: C.text, bold: true,
  });

  const items = [
    `Akım Tanıtımı: ${week.movement}`,
    `Tarihsel Bağlam (${week.dateRange})`,
    `Öne Çıkan Sanatçılar: ${week.keyArtists.slice(0, 3).join(", ")}`,
    "Eser Analizleri (15+ eser)",
    "Kavram Derinlemesine",
    "Karşılaştırma Slaytları",
    "Teknik & Stil Özeti",
    "Tartışma Soruları",
  ];

  items.forEach((item, i) => {
    slide.addText(`${i + 1}.  ${item}`, {
      x: 1.2, y: 1.8 + i * 0.6, w: 10, h: 0.5,
      fontSize: 16, fontFace: F.body, color: i < 3 ? C.accent : C.textSec,
    });
  });
}

function addMovementIntroSlide(pptx: PptxGenJS, week: WeekConfig) {
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };

  slide.addText(week.movement, {
    x: 0.8, y: 0.6, w: 11.7, h: 0.8,
    fontSize: 36, fontFace: F.heading, color: C.accent, bold: true,
  });

  slide.addText(week.dateRange, {
    x: 0.8, y: 1.4, w: 5, h: 0.5,
    fontSize: 16, fontFace: F.body, color: C.muted,
  });

  slide.addText(week.description, {
    x: 0.8, y: 2.2, w: 11.7, h: 2.5,
    fontSize: 16, fontFace: F.body, color: C.textSec,
    lineSpacingMultiple: 1.5,
  });

  slide.addText("Anahtar Kavramlar", {
    x: 0.8, y: 5.0, w: 5, h: 0.5,
    fontSize: 14, fontFace: F.body, color: C.accent, bold: true,
  });

  slide.addText(week.keyTerms.join("  •  "), {
    x: 0.8, y: 5.5, w: 11.7, h: 0.8,
    fontSize: 13, fontFace: F.body, color: C.muted, italic: true,
  });
}

function addHistoricalContextSlide(pptx: PptxGenJS, week: WeekConfig) {
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };

  slide.addText("Tarihsel Bağlam", {
    x: 0.8, y: 0.6, w: 11.7, h: 0.8,
    fontSize: 32, fontFace: F.heading, color: C.text, bold: true,
  });

  slide.addText(week.description, {
    x: 0.8, y: 1.8, w: 11.7, h: 3.0,
    fontSize: 18, fontFace: F.body, color: C.textSec,
    lineSpacingMultiple: 1.6,
  });

  slide.addText(`Dönem: ${week.dateRange}`, {
    x: 0.8, y: 5.5, w: 5, h: 0.5,
    fontSize: 14, fontFace: F.body, color: C.accent,
  });
}

function addArtistSpotlightSlide(pptx: PptxGenJS, week: WeekConfig, artistIndex: number) {
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };

  const artist = week.keyArtists[artistIndex] ?? week.keyArtists[0];

  slide.addText("Sanatçı Spotlight", {
    x: 0.8, y: 0.4, w: 5, h: 0.5,
    fontSize: 12, fontFace: F.body, color: C.accent, bold: true, charSpacing: 4,
  });

  slide.addText(artist, {
    x: 0.8, y: 1.2, w: 11.7, h: 1.0,
    fontSize: 36, fontFace: F.heading, color: C.text, bold: true,
  });

  slide.addText(`${week.movement}  •  ${week.dateRange}`, {
    x: 0.8, y: 2.4, w: 11.7, h: 0.5,
    fontSize: 14, fontFace: F.body, color: C.muted,
  });

  // Sanatçının eserleri
  const artworks = getArtworksForWeek(week.weekNumber).filter(a => a.artist === artist);
  if (artworks.length > 0) {
    const listText = artworks.slice(0, 5).map(a => `•  ${a.titleTr} (${a.year})`).join("\n");
    slide.addText(listText, {
      x: 0.8, y: 3.5, w: 11.7, h: 3.0,
      fontSize: 15, fontFace: F.body, color: C.textSec,
      lineSpacingMultiple: 1.6,
    });
  }
}

function addArtworkSlide(pptx: PptxGenJS, artwork: Artwork) {
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };

  // Sol taraf: görsel
  const img = tryLoadImage(artwork.image);
  if (img) {
    slide.addImage({
      data: img,
      x: 0.4, y: 0.6, w: 5.5, h: 6.0,
      sizing: { type: "contain", w: 5.5, h: 6.0 },
    });
  } else {
    // Placeholder
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.4, y: 0.6, w: 5.5, h: 6.0,
      fill: { color: C.bgCard },
      line: { color: C.border, width: 1 },
    });
    slide.addText("[Görsel]", {
      x: 0.4, y: 3.2, w: 5.5, h: 0.5,
      fontSize: 14, fontFace: F.body, color: C.muted, align: "center",
    });
  }

  // Sağ taraf: bilgiler
  slide.addText(artwork.titleTr, {
    x: 6.3, y: 0.6, w: 6.5, h: 0.7,
    fontSize: 22, fontFace: F.heading, color: C.text, bold: true,
  });

  slide.addText(artwork.title !== artwork.titleTr ? artwork.title : "", {
    x: 6.3, y: 1.3, w: 6.5, h: 0.4,
    fontSize: 13, fontFace: F.body, color: C.muted, italic: true,
  });

  slide.addText(`${artwork.artist}  •  ${artwork.year}`, {
    x: 6.3, y: 1.8, w: 6.5, h: 0.4,
    fontSize: 14, fontFace: F.body, color: C.accent,
  });

  slide.addText(artwork.description, {
    x: 6.3, y: 2.5, w: 6.5, h: 2.0,
    fontSize: 14, fontFace: F.body, color: C.textSec,
    lineSpacingMultiple: 1.5,
  });

  const details = [
    artwork.medium && `Malzeme: ${artwork.medium}`,
    artwork.dimensions && `Boyut: ${artwork.dimensions}`,
    artwork.location && `Konum: ${artwork.location}`,
  ].filter(Boolean).join("\n");

  slide.addText(details, {
    x: 6.3, y: 4.6, w: 6.5, h: 1.2,
    fontSize: 12, fontFace: F.body, color: C.muted,
    lineSpacingMultiple: 1.4,
  });

  if (artwork.funFact) {
    slide.addShape(pptx.ShapeType.rect, {
      x: 6.3, y: 5.9, w: 6.5, h: 1.0,
      fill: { color: C.bgCard },
      rectRadius: 0.1,
    });
    slide.addText(`💡 ${artwork.funFact}`, {
      x: 6.5, y: 6.0, w: 6.1, h: 0.8,
      fontSize: 11, fontFace: F.body, color: C.accent,
      lineSpacingMultiple: 1.3,
    });
  }
}

function addComparisonSlide(pptx: PptxGenJS, artwork1: Artwork, artwork2: Artwork) {
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };

  slide.addText("Karşılaştırma", {
    x: 0.8, y: 0.3, w: 11.7, h: 0.6,
    fontSize: 12, fontFace: F.body, color: C.accent, bold: true, charSpacing: 4,
  });

  // Sol eser
  const img1 = tryLoadImage(artwork1.image);
  if (img1) {
    slide.addImage({ data: img1, x: 0.4, y: 1.2, w: 5.8, h: 3.8, sizing: { type: "contain", w: 5.8, h: 3.8 } });
  } else {
    slide.addShape(pptx.ShapeType.rect, { x: 0.4, y: 1.2, w: 5.8, h: 3.8, fill: { color: C.bgCard } });
  }
  slide.addText(`${artwork1.titleTr}\n${artwork1.artist}, ${artwork1.year}`, {
    x: 0.4, y: 5.2, w: 5.8, h: 1.0,
    fontSize: 13, fontFace: F.body, color: C.textSec, align: "center",
    lineSpacingMultiple: 1.3,
  });

  // Sağ eser
  const img2 = tryLoadImage(artwork2.image);
  if (img2) {
    slide.addImage({ data: img2, x: 7.1, y: 1.2, w: 5.8, h: 3.8, sizing: { type: "contain", w: 5.8, h: 3.8 } });
  } else {
    slide.addShape(pptx.ShapeType.rect, { x: 7.1, y: 1.2, w: 5.8, h: 3.8, fill: { color: C.bgCard } });
  }
  slide.addText(`${artwork2.titleTr}\n${artwork2.artist}, ${artwork2.year}`, {
    x: 7.1, y: 5.2, w: 5.8, h: 1.0,
    fontSize: 13, fontFace: F.body, color: C.textSec, align: "center",
    lineSpacingMultiple: 1.3,
  });

  // Ortada "vs" işareti
  slide.addText("vs", {
    x: 6.2, y: 2.8, w: 0.9, h: 0.6,
    fontSize: 18, fontFace: F.heading, color: C.accent, align: "center", bold: true,
  });
}

function addConceptSlide(pptx: PptxGenJS, week: WeekConfig, termIndex: number) {
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };

  const term = week.keyTerms[termIndex] ?? week.keyTerms[0];

  slide.addText("Kavram Derinlemesine", {
    x: 0.8, y: 0.4, w: 5, h: 0.5,
    fontSize: 12, fontFace: F.body, color: C.accent, bold: true, charSpacing: 4,
  });

  slide.addText(term.charAt(0).toUpperCase() + term.slice(1), {
    x: 0.8, y: 1.5, w: 11.7, h: 0.8,
    fontSize: 32, fontFace: F.heading, color: C.text, bold: true,
  });

  slide.addText(`Bu kavram ${week.movement} akımının temel taşlarından biridir. Sanatçılar bu tekniği/yaklaşımı kullanarak geleneksel anlayışa meydan okudu.`, {
    x: 0.8, y: 2.8, w: 11.7, h: 2.0,
    fontSize: 16, fontFace: F.body, color: C.textSec,
    lineSpacingMultiple: 1.5,
  });
}

function addTechniqueSummarySlide(pptx: PptxGenJS, week: WeekConfig) {
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };

  slide.addText("Teknik & Stil Özeti", {
    x: 0.8, y: 0.6, w: 11.7, h: 0.8,
    fontSize: 32, fontFace: F.heading, color: C.text, bold: true,
  });

  slide.addText(week.movement, {
    x: 0.8, y: 1.5, w: 5, h: 0.5,
    fontSize: 16, fontFace: F.body, color: C.accent,
  });

  const artworks = getArtworksForWeek(week.weekNumber);
  const techniques = [...new Set(artworks.map(a => a.technique).filter(Boolean))];

  techniques.slice(0, 8).forEach((tech, i) => {
    slide.addText(`•  ${tech}`, {
      x: 1.0, y: 2.4 + i * 0.55, w: 11, h: 0.5,
      fontSize: 14, fontFace: F.body, color: C.textSec,
    });
  });
}

function addDiscussionSlide(pptx: PptxGenJS, question: string, index: number) {
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };

  slide.addText("Tartışma Sorusu", {
    x: 0.8, y: 0.4, w: 5, h: 0.5,
    fontSize: 12, fontFace: F.body, color: C.accent, bold: true, charSpacing: 4,
  });

  slide.addText(`${index + 1}`, {
    x: 0.8, y: 2.0, w: 1.5, h: 1.5,
    fontSize: 64, fontFace: F.heading, color: C.border, bold: true,
  });

  slide.addText(question, {
    x: 2.5, y: 2.2, w: 10, h: 2.5,
    fontSize: 24, fontFace: F.heading, color: C.text,
    lineSpacingMultiple: 1.5,
  });
}

function addQuizTeaserSlide(pptx: PptxGenJS, week: WeekConfig) {
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };

  // Blok sonu mu?
  const blockQuiz = BLOCK_QUIZZES.find(b => {
    const maxWeek = Math.max(...b.weeks);
    return maxWeek === week.weekNumber;
  });

  if (blockQuiz) {
    slide.addText("Blok Testi Yaklaşıyor!", {
      x: 0.8, y: 2.0, w: 11.7, h: 1.0,
      fontSize: 36, fontFace: F.heading, color: C.accent, bold: true, align: "center",
    });

    slide.addText(blockQuiz.title, {
      x: 0.8, y: 3.2, w: 11.7, h: 0.8,
      fontSize: 20, fontFace: F.body, color: C.text, align: "center",
    });

    slide.addText(`${blockQuiz.questionCount} soru  •  Loca'dan erişebilirsiniz`, {
      x: 0.8, y: 4.2, w: 11.7, h: 0.5,
      fontSize: 14, fontFace: F.body, color: C.muted, align: "center",
    });
  } else {
    slide.addText("Bu Haftayı Özetleyelim", {
      x: 0.8, y: 2.5, w: 11.7, h: 1.0,
      fontSize: 32, fontFace: F.heading, color: C.text, bold: true, align: "center",
    });

    slide.addText("Haftaya blok testine bir adım daha yakınız!", {
      x: 0.8, y: 3.8, w: 11.7, h: 0.5,
      fontSize: 16, fontFace: F.body, color: C.muted, align: "center",
    });
  }
}

function addClosingSlide(pptx: PptxGenJS, week: WeekConfig) {
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };

  slide.addText("Teşekkürler!", {
    x: 0.8, y: 1.5, w: 11.7, h: 1.0,
    fontSize: 40, fontFace: F.heading, color: C.text, bold: true, align: "center",
  });

  slide.addText(`Hafta ${week.weekNumber}: ${week.title}`, {
    x: 0.8, y: 2.8, w: 11.7, h: 0.6,
    fontSize: 18, fontFace: F.body, color: C.accent, align: "center",
  });

  if (week.nextWeekPreview) {
    slide.addText("Gelecek Hafta", {
      x: 0.8, y: 4.2, w: 11.7, h: 0.5,
      fontSize: 12, fontFace: F.body, color: C.muted, align: "center", charSpacing: 4,
    });

    slide.addText(week.nextWeekPreview, {
      x: 1.5, y: 4.8, w: 10.3, h: 0.8,
      fontSize: 18, fontFace: F.body, color: C.textSec, align: "center",
    });
  }

  slide.addText("klemensart.com  •  @klemensart", {
    x: 0.8, y: 6.2, w: 11.7, h: 0.5,
    fontSize: 12, fontFace: F.body, color: C.muted, align: "center",
  });
}

/* ── Ana Generator Fonksiyonu ── */

export async function generateWeekPPTX(weekNumber: number): Promise<Buffer> {
  const week = getWeek(weekNumber);
  if (!week) throw new Error(`Hafta ${weekNumber} bulunamadı`);

  const artworks = getArtworksForWeek(weekNumber);

  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE"; // 13.33 × 7.5
  pptx.author = "Klemens Art";
  pptx.title = `Hafta ${weekNumber} – ${week.title}`;
  pptx.subject = "Modern Sanat Atölyesi";

  // 1. Kapak
  addCoverSlide(pptx, week);

  // 2. Gündem
  addAgendaSlide(pptx, week);

  // 3. Akım Tanıtımı
  addMovementIntroSlide(pptx, week);

  // 4. Tarihsel Bağlam
  addHistoricalContextSlide(pptx, week);

  // 5-6. Sanatçı Spotlight (2 adet)
  addArtistSpotlightSlide(pptx, week, 0);
  addArtistSpotlightSlide(pptx, week, 1);

  // 7-12. Eser Analizi (ilk 6)
  for (let i = 0; i < 6 && i < artworks.length; i++) {
    addArtworkSlide(pptx, artworks[i]);
  }

  // 13-14. Kavram Derinlemesine (2 adet)
  addConceptSlide(pptx, week, 0);
  addConceptSlide(pptx, week, 1);

  // 15-19. Eser Analizi (sonraki 5)
  for (let i = 6; i < 11 && i < artworks.length; i++) {
    addArtworkSlide(pptx, artworks[i]);
  }

  // 20-21. Karşılaştırma slaytları
  if (artworks.length >= 4) {
    addComparisonSlide(pptx, artworks[0], artworks[1]);
    addComparisonSlide(pptx, artworks[2], artworks[3]);
  }

  // 22-25. Kalan eserler (4 adet)
  for (let i = 11; i < 15 && i < artworks.length; i++) {
    addArtworkSlide(pptx, artworks[i]);
  }

  // 26. Teknik/Stil Özeti
  addTechniqueSummarySlide(pptx, week);

  // 27-28. Tartışma soruları
  if (week.discussionQuestions.length >= 1) addDiscussionSlide(pptx, week.discussionQuestions[0], 0);
  if (week.discussionQuestions.length >= 2) addDiscussionSlide(pptx, week.discussionQuestions[1], 1);

  // 29. Quiz Teaser
  addQuizTeaserSlide(pptx, week);

  // 30. Kapanış
  addClosingSlide(pptx, week);

  // Buffer olarak döndür
  const arrayBuf = await pptx.write({ outputType: "arraybuffer" }) as ArrayBuffer;
  return Buffer.from(arrayBuf);
}
