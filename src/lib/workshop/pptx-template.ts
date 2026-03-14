/* ── PPTX Marka Şablonu — Klemens Art Kurumsal Renkleri ── */

export const PPTX_COLORS = {
  bg: "2D2926",        // brand-dark
  bgCard: "3A3530",    // brand-dark lighter
  text: "FFF8F5",      // warm-50
  textSec: "F0E4D9",   // warm-200
  muted: "8C857E",     // brand-warm
  accent: "FF6D60",    // coral
  correct: "22C55E",
  border: "4A433C",    // brand-dark border
  white: "FFFFFF",
  black: "000000",
  cream: "FFFBF7",     // cream
  warmLight: "F5F0EB", // brand-light
  warm900: "2C2319",   // warm-900
};

export const PPTX_FONTS = {
  heading: "Georgia",
  body: "Helvetica Neue",
  mono: "Courier New",
};

export const SLIDE_WIDTH = 13.333; // inches (16:9)
export const SLIDE_HEIGHT = 7.5;

/* ── 30 Slayt Tipi Sıralaması ── */
export type SlideDefinition = {
  index: number;
  type: string;
  label: string;
};

export const SLIDE_ORDER: SlideDefinition[] = [
  { index: 1, type: "cover", label: "Kapak" },
  { index: 2, type: "agenda", label: "Gündem" },
  { index: 3, type: "movement-intro", label: "Akım Tanıtımı" },
  { index: 4, type: "historical-context", label: "Tarihsel Bağlam" },
  { index: 5, type: "artist-spotlight-1", label: "Sanatçı Spotlight 1" },
  { index: 6, type: "artist-spotlight-2", label: "Sanatçı Spotlight 2" },
  { index: 7, type: "artwork-1", label: "Eser Analizi 1" },
  { index: 8, type: "artwork-2", label: "Eser Analizi 2" },
  { index: 9, type: "artwork-3", label: "Eser Analizi 3" },
  { index: 10, type: "artwork-4", label: "Eser Analizi 4" },
  { index: 11, type: "artwork-5", label: "Eser Analizi 5" },
  { index: 12, type: "artwork-6", label: "Eser Analizi 6" },
  { index: 13, type: "concept-1", label: "Kavram Derinlemesine 1" },
  { index: 14, type: "concept-2", label: "Kavram Derinlemesine 2" },
  { index: 15, type: "artwork-7", label: "Eser Analizi 7" },
  { index: 16, type: "artwork-8", label: "Eser Analizi 8" },
  { index: 17, type: "artwork-9", label: "Eser Analizi 9" },
  { index: 18, type: "artwork-10", label: "Eser Analizi 10" },
  { index: 19, type: "artwork-11", label: "Eser Analizi 11" },
  { index: 20, type: "comparison-1", label: "Karşılaştırma 1" },
  { index: 21, type: "comparison-2", label: "Karşılaştırma 2" },
  { index: 22, type: "artwork-12", label: "Eser Analizi 12" },
  { index: 23, type: "artwork-13", label: "Eser Analizi 13" },
  { index: 24, type: "artwork-14", label: "Eser Analizi 14" },
  { index: 25, type: "artwork-15", label: "Eser Analizi 15" },
  { index: 26, type: "technique-summary", label: "Teknik/Stil Özeti" },
  { index: 27, type: "discussion-1", label: "Tartışma Sorusu 1" },
  { index: 28, type: "discussion-2", label: "Tartışma Sorusu 2" },
  { index: 29, type: "quiz-teaser", label: "Quiz Teaser" },
  { index: 30, type: "closing", label: "Kapanış" },
];
