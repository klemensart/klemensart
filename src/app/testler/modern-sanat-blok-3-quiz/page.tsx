import type { Metadata } from "next";
import WorkshopBlockQuiz from "@/components/workshop/WorkshopBlockQuiz";
import { BLOCK_QUIZZES } from "@/lib/workshop/curriculum";
import { BLOCK_3_QUESTIONS } from "@/lib/workshop/quiz-data";

const config = BLOCK_QUIZZES[2];

export const metadata: Metadata = {
  title: `${config.title} | Klemens Art`,
  description: config.description,
  robots: { index: false, follow: false },
};

export default function Blok3QuizPage() {
  return <WorkshopBlockQuiz config={config} questions={BLOCK_3_QUESTIONS} />;
}
