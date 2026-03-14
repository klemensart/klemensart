import type { Metadata } from "next";
import WorkshopBlockQuiz from "@/components/workshop/WorkshopBlockQuiz";
import { BLOCK_QUIZZES } from "@/lib/workshop/curriculum";
import { FINAL_QUESTIONS } from "@/lib/workshop/quiz-data";

const config = BLOCK_QUIZZES[3];

export const metadata: Metadata = {
  title: `${config.title} | Klemens Art`,
  description: config.description,
  robots: { index: false, follow: false },
};

export default function FinalQuizPage() {
  return <WorkshopBlockQuiz config={config} questions={FINAL_QUESTIONS} />;
}
