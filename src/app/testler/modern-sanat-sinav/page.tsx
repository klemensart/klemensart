import type { Metadata } from "next";
import WorkshopBlockQuiz from "@/components/workshop/WorkshopBlockQuiz";
import { BLOCK_QUIZZES } from "@/lib/workshop/curriculum";
import { SINAV_QUESTIONS } from "@/lib/workshop/quiz-data";

const config = BLOCK_QUIZZES.find((q) => q.slug === "modern-sanat-sinav")!;

export const metadata: Metadata = {
  title: `${config.title} | Klemens Art`,
  description: config.description,
  robots: { index: false, follow: false },
};

export default function SinavPage() {
  return (
    <WorkshopBlockQuiz
      config={config}
      questions={SINAV_QUESTIONS}
    />
  );
}
