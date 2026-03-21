/* Leonardo'nun Atölyesi — Tip Tanımları */

export type Phase =
  | "loading"
  | "intro"
  | "room-intro"
  | "dialogue"
  | "artwork-reveal"
  | "question"
  | "reaction"
  | "room-complete"
  | "room-transition"
  | "result";

export type LeonardoMood = "neutral" | "happy" | "thinking" | "sad";

export type SpriteAnimation =
  | "idle"
  | "talking"
  | "happy"
  | "sad"
  | "thinking"
  | "pointing"
  | "greeting";

export interface SpriteConfig {
  frames: number;
  durationMs: number;
  loop: boolean;
  /** loop=false iken animasyon bitince hangi karede kalacak (0-indexed) */
  holdFrame?: number;
  /** Yatay strip sprite sheet URL'i */
  src: string;
}

export type CharacterPosition = "center" | "left" | "right";

export interface Room {
  id: number;
  slug: string;
  title: string;
  theme: string;
  description: string;
  bgImage: string;
  multiplier: number;
  questionIds: number[]; // indices into questions array (0-24)
}

export interface LeonardoDialogue {
  questionIndex: number; // 0-24
  pre: string;   // soru öncesi Leonardo repliği
  post: {
    correct: string;
    wrong: string;
  };
}

export interface QuestionFromAPI {
  id: string;
  question: string;
  image_url: string | null;
  options: string[] | string;
  correct_answer: string;
  fun_fact: string | null;
  difficulty: string;
}

export interface GameQuestion extends QuestionFromAPI {
  options: string[];
  roomIndex: number;
  localIndex: number; // 0-4 within room
}

export interface AnswerResult {
  questionIndex: number;
  correct: boolean;
  userAnswer: string;
  points: number;
  streak: number;
  timeLeft: number;
  roomIndex: number;
}

export interface RoomSummary {
  roomIndex: number;
  correct: number;
  total: number;
  points: number;
}

export interface Badge {
  name: string;
  emoji: string;
  description: string;
}

export interface LeaderboardEntry {
  display_name: string;
  score: number;
  badge: string;
  mode: string;
  time_seconds: number | null;
  created_at: string;
}
