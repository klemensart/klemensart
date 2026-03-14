"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { checkWorkshopPurchase } from "@/lib/workshop/purchase-check";
import type { WorkshopQuizItem, BlockQuizConfig } from "@/lib/workshop/types";

/* ── Tema: Koyu Müze Ambiyansı ── */
const T = {
  bg: "#1a1714",
  bgCard: "#252220",
  text: "#f0ebe4",
  textSec: "#d4cfc8",
  muted: "#9B918A",
  accent: "#C9A84C",
  accentBg: "rgba(201,168,76,0.12)",
  correct: "#22c55e",
  correctBg: "rgba(34,197,94,0.12)",
  wrong: "#ef4444",
  wrongBg: "rgba(239,68,68,0.12)",
  border: "#3a302a",
};

const ease = "cubic-bezier(.4,0,.2,1)";

/* ── Helpers ── */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getBadge(score: number, total: number): string {
  const pct = score / total;
  if (pct >= 0.9) return "Uzman";
  if (pct >= 0.7) return "İleri";
  if (pct >= 0.5) return "Orta";
  return "Başlangıç";
}

/* ── Types ── */
type ResultRow = {
  question: WorkshopQuizItem;
  correct: boolean;
  userAnswer: string;
};
type Phase = "loading" | "purchase-wall" | "intro" | "quiz" | "result";

/* ── Progress Bar ── */
function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ width: "100%", height: 4, background: T.border, borderRadius: 2 }}>
      <div
        style={{
          width: `${(current / total) * 100}%`,
          height: "100%",
          background: T.accent,
          borderRadius: 2,
          transition: `width 0.3s ${ease}`,
        }}
      />
    </div>
  );
}

/* ── Purchase Wall ── */
function PurchaseWall({ config }: { config: BlockQuizConfig }) {
  return (
    <div
      style={{ background: T.bg, minHeight: "100vh" }}
      className="flex items-center justify-center px-4"
    >
      <div
        style={{ background: T.bgCard, border: `1px solid ${T.border}`, maxWidth: 500 }}
        className="rounded-3xl p-8 text-center"
      >
        <div
          style={{ background: T.accentBg, color: T.accent }}
          className="inline-flex p-3.5 rounded-2xl mb-6"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>

        <h2 style={{ color: T.text }} className="text-2xl font-bold mb-3">
          Atölye Katılımcılarına Özel
        </h2>
        <p style={{ color: T.textSec }} className="text-[15px] leading-relaxed mb-6">
          <strong style={{ color: T.accent }}>{config.title}</strong> testi,
          Modern Sanat Atölyesi katılımcılarına özeldir.
          Atölyeye katılarak tüm blok testlerine erişim sağlayabilirsiniz.
        </p>

        <Link
          href="/atolyeler/modern-sanat-atolyesi"
          style={{ background: T.accent, color: T.bg }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-[15px] no-underline hover:opacity-90 transition-opacity"
        >
          Atölyeye Katıl
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>

        <p style={{ color: T.muted }} className="text-xs mt-5">
          Zaten katıldıysanız, giriş yaptığınızdan emin olun.
        </p>
        <Link
          href="/club/giris"
          style={{ color: T.accent }}
          className="text-xs font-medium no-underline hover:underline mt-1 inline-block"
        >
          Giriş Yap →
        </Link>
      </div>
    </div>
  );
}

/* ── Ana Bileşen ── */
export default function WorkshopBlockQuiz({
  config,
  questions,
}: {
  config: BlockQuizConfig;
  questions: WorkshopQuizItem[];
}) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<WorkshopQuizItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [startTime] = useState(() => Date.now());

  // Auth + Purchase check
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      setUser(u);
      if (!u) {
        setPhase("purchase-wall");
        return;
      }
      const hasPurchase = await checkWorkshopPurchase(supabase, u.id);
      if (!hasPurchase) {
        setPhase("purchase-wall");
        return;
      }
      setPhase("intro");
    });
  }, []);

  const startQuiz = useCallback(() => {
    const shuffled = shuffle(questions).slice(0, config.questionCount);
    // Shuffle options for each question
    const withShuffledOptions = shuffled.map(q => ({
      ...q,
      options: shuffle(q.options),
    }));
    setItems(withShuffledOptions);
    setIdx(0);
    setScore(0);
    setResults([]);
    setSelected(null);
    setAnswered(false);
    setPhase("quiz");
  }, [questions, config.questionCount]);

  function handleAnswer(text: string) {
    if (answered) return;
    setSelected(text);
    setAnswered(true);

    const current = items[idx];
    const isCorrect = current.options.find(o => o.text === text)?.isCorrect ?? false;
    if (isCorrect) setScore(s => s + 1);

    setResults(r => [...r, { question: current, correct: isCorrect, userAnswer: text }]);

    setTimeout(() => {
      if (idx + 1 < items.length) {
        setIdx(i => i + 1);
        setSelected(null);
        setAnswered(false);
      } else {
        setPhase("result");
        // Save result
        saveResult(isCorrect ? score + 1 : score);
      }
    }, 1500);
  }

  async function saveResult(finalScore: number) {
    if (!user) return;
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const badge = getBadge(finalScore, items.length);
    try {
      await fetch("/api/quiz/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: finalScore,
          badge,
          time_seconds: elapsed,
          mode: "normal",
          display_name: (user.user_metadata as Record<string, string>)?.full_name || "Anonim",
          quiz_slug: config.slug,
        }),
      });
    } catch {
      // Sonuç kaydedilemediyse sessizce devam et
    }
  }

  // Loading
  if (phase === "loading") {
    return (
      <div style={{ background: T.bg, minHeight: "100vh" }} className="flex items-center justify-center">
        <div className="animate-pulse" style={{ color: T.muted }}>Yükleniyor...</div>
      </div>
    );
  }

  // Purchase wall
  if (phase === "purchase-wall") {
    return <PurchaseWall config={config} />;
  }

  // Intro
  if (phase === "intro") {
    return (
      <div style={{ background: T.bg, minHeight: "100vh" }} className="flex items-center justify-center px-4">
        <div
          style={{ background: T.bgCard, border: `1px solid ${T.border}`, maxWidth: 500 }}
          className="rounded-3xl p-8 text-center"
        >
          <div style={{ background: T.accentBg, color: T.accent }} className="inline-flex p-3.5 rounded-2xl mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>

          <h2 style={{ color: T.text }} className="text-2xl font-bold mb-2">{config.title}</h2>
          <p style={{ color: T.textSec }} className="text-[15px] leading-relaxed mb-2">
            {config.description}
          </p>
          <p style={{ color: T.muted }} className="text-sm mb-6">
            {config.questionCount} soru • Çoktan seçmeli
          </p>

          <button
            onClick={startQuiz}
            style={{ background: T.accent, color: T.bg }}
            className="w-full py-3 rounded-xl font-semibold text-[15px] cursor-pointer hover:opacity-90 transition-opacity"
          >
            Teste Başla
          </button>
        </div>
      </div>
    );
  }

  // Quiz
  if (phase === "quiz" && items.length > 0) {
    const current = items[idx];
    return (
      <div style={{ background: T.bg, minHeight: "100vh" }} className="py-8 px-4">
        <div style={{ maxWidth: 640 }} className="mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span style={{ color: T.muted }} className="text-sm">
              Soru {idx + 1}/{items.length}
            </span>
            <span style={{ color: T.accent }} className="text-sm font-semibold">
              Skor: {score}
            </span>
          </div>
          <ProgressBar current={idx + 1} total={items.length} />

          {/* Question Card */}
          <div
            style={{ background: T.bgCard, border: `1px solid ${T.border}` }}
            className="rounded-2xl p-6 mt-6"
          >
            <p style={{ color: T.text }} className="text-lg font-semibold mb-6 leading-relaxed">
              {current.question}
            </p>

            <div className="flex flex-col gap-3">
              {current.options.map((opt) => {
                const isSelected = selected === opt.text;
                const isCorrectOpt = opt.isCorrect;
                let bg = T.bgCard;
                let borderColor = T.border;
                let textColor = T.textSec;

                if (answered) {
                  if (isCorrectOpt) {
                    bg = T.correctBg;
                    borderColor = T.correct;
                    textColor = T.correct;
                  } else if (isSelected && !isCorrectOpt) {
                    bg = T.wrongBg;
                    borderColor = T.wrong;
                    textColor = T.wrong;
                  }
                } else if (isSelected) {
                  borderColor = T.accent;
                  textColor = T.accent;
                }

                return (
                  <button
                    key={opt.text}
                    onClick={() => handleAnswer(opt.text)}
                    disabled={answered}
                    style={{
                      background: bg,
                      border: `1.5px solid ${borderColor}`,
                      color: textColor,
                      transition: `all 0.2s ${ease}`,
                    }}
                    className="text-left px-5 py-3.5 rounded-xl text-[15px] cursor-pointer disabled:cursor-default hover:opacity-90"
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>

            {/* Explanation after answer */}
            {answered && (
              <div
                style={{
                  background: T.accentBg,
                  border: `1px solid ${T.border}`,
                  color: T.textSec,
                }}
                className="mt-5 p-4 rounded-xl text-sm leading-relaxed"
              >
                {current.explanation}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Results
  if (phase === "result") {
    const total = items.length;
    const badge = getBadge(score, total);
    const pct = Math.round((score / total) * 100);

    return (
      <div style={{ background: T.bg, minHeight: "100vh" }} className="py-12 px-4">
        <div style={{ maxWidth: 640 }} className="mx-auto">
          {/* Score Card */}
          <div
            style={{ background: T.bgCard, border: `1px solid ${T.border}` }}
            className="rounded-3xl p-8 text-center mb-8"
          >
            <div
              style={{ background: T.accentBg, color: T.accent }}
              className="inline-flex px-4 py-1.5 rounded-full text-sm font-bold mb-4"
            >
              {badge}
            </div>

            <h2 style={{ color: T.text }} className="text-3xl font-bold mb-2">
              {score} / {total}
            </h2>
            <p style={{ color: T.muted }} className="text-sm mb-4">
              %{pct} doğru cevap
            </p>

            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={startQuiz}
                style={{ background: T.accent, color: T.bg }}
                className="px-6 py-2.5 rounded-xl font-semibold text-sm cursor-pointer hover:opacity-90 transition-opacity"
              >
                Tekrar Dene
              </button>
              <Link
                href="/testler"
                style={{ background: T.bgCard, color: T.textSec, border: `1px solid ${T.border}` }}
                className="px-6 py-2.5 rounded-xl font-semibold text-sm no-underline hover:opacity-90 transition-opacity"
              >
                Tüm Testler
              </Link>
            </div>
          </div>

          {/* Question Results */}
          <h3 style={{ color: T.text }} className="text-lg font-bold mb-4">Soru Detayları</h3>
          <div className="flex flex-col gap-3">
            {results.map((r, i) => {
              const correctText = r.question.options.find(o => o.isCorrect)?.text ?? "";
              return (
                <div
                  key={i}
                  style={{
                    background: T.bgCard,
                    border: `1px solid ${r.correct ? T.correct : T.wrong}22`,
                  }}
                  className="rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <span
                      style={{ color: r.correct ? T.correct : T.wrong }}
                      className="text-lg mt-0.5"
                    >
                      {r.correct ? "✓" : "✗"}
                    </span>
                    <div className="flex-1">
                      <p style={{ color: T.text }} className="text-sm font-medium mb-1">
                        {r.question.question}
                      </p>
                      {!r.correct && (
                        <p className="text-xs" style={{ color: T.wrong }}>
                          Cevabınız: {r.userAnswer}
                        </p>
                      )}
                      <p className="text-xs" style={{ color: T.correct }}>
                        Doğru: {correctText}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
