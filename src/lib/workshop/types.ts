/* ── Modern Sanat Atölyesi — Tip Tanımları ── */

export type SlideType =
  | "cover"
  | "agenda"
  | "movement-intro"
  | "historical-context"
  | "artist-spotlight"
  | "artwork-analysis"
  | "concept-deep-dive"
  | "comparison"
  | "technique-summary"
  | "discussion"
  | "quiz-teaser"
  | "closing";

export type Artwork = {
  id: string;
  title: string;
  titleTr: string;
  artist: string;
  year: string;
  movement: string;
  medium: string;
  dimensions?: string;
  location: string;
  image: string; // relative to /public
  description: string;
  funFact?: string;
  technique?: string;
  week: number;
};

export type WeekConfig = {
  weekNumber: number;
  title: string;
  subtitle: string;
  movement: string;
  dateRange: string;
  keyArtists: string[];
  keyTerms: string[];
  description: string;
  discussionQuestions: string[];
  nextWeekPreview: string;
};

export type WorkshopQuizOption = {
  text: string;
  isCorrect: boolean;
};

export type WorkshopQuizItem = {
  id: number;
  question: string;
  image?: string;
  options: WorkshopQuizOption[];
  explanation: string;
  week: number;
  difficulty: "easy" | "medium" | "hard";
};

export type BlockQuizConfig = {
  slug: string;
  title: string;
  description: string;
  weeks: number[];
  questionCount: number;
};
