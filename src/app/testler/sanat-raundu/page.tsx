"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

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
  hint: "#f59e0b",
  hintBg: "rgba(245,158,11,0.12)",
  border: "#3a302a",
  streak: "#a855f7",
  streakBg: "rgba(168,85,247,0.12)",
};

const ease = "cubic-bezier(.4,0,.2,1)";
const TIMER_SECONDS = 15;
const QUESTIONS_PER_ROUND = 10;
const CUBE_SIZE = 220;
const CUBE_HALF = CUBE_SIZE / 2;
const DIGIT_H = 36;
const RING_R = 30;
const RING_CIRC = 2 * Math.PI * RING_R;

/* ── Veri Modeli ── */
type Category = {
  slug: string;
  title: string;
  description: string;
  icon_emoji: string;
  color: string;
  question_count: number;
};

type TriviaQuestion = {
  id: string;
  question: string;
  image_url: string | null;
  options: string[];
  correct_answer: string;
  fun_fact: string | null;
  difficulty: string;
};

type ResultRow = {
  question: TriviaQuestion;
  correct: boolean;
  userAnswer: string;
  points: number;
  streak: number;
  timeLeft: number;
};

type LeaderboardEntry = {
  display_name: string;
  score: number;
  badge: string;
  mode: string;
  time_seconds: number | null;
  created_at: string;
};

type Phase = "loading" | "intro" | "quiz" | "result";

/* ── Puanlama ── */
function calcPoints(timeLeft: number, streak: number): number {
  const base = 100 + timeLeft * 5; // max 175
  const multiplier = streak >= 5 ? 2 : streak >= 3 ? 1.5 : 1;
  return Math.round(base * multiplier);
}

/* ── Rozetler ── */
function getBadge(totalScore: number): { name: string; desc: string; emoji: string } {
  if (totalScore >= 2000) return { name: "Sanat Ustası", desc: "Muhteşem bir performans!", emoji: "👑" };
  if (totalScore >= 1500) return { name: "Kültür Gururu", desc: "Sanat bilginiz etkileyici.", emoji: "🏆" };
  if (totalScore >= 1000) return { name: "Bilgi Koleksiyoncusu", desc: "İyi bir sanat kültürünüz var.", emoji: "🎖️" };
  if (totalScore >= 500) return { name: "Meraklı Kaşif", desc: "Potansiyel var, keşfe devam!", emoji: "🔍" };
  return { name: "Çırak", desc: "Sanat dünyasını keşfetmeye yeni başlıyorsunuz.", emoji: "🌱" };
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}dk ${sec}sn` : `${sec}sn`;
}

function shuffle<A>(arr: A[]): A[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── Slot Digit ── */
function SlotDigit({ digit, delay }: { digit: number; delay: number }) {
  return (
    <div style={{ height: DIGIT_H, overflow: "hidden", width: 22 }}>
      <div style={{
        transform: `translateY(${-digit * DIGIT_H}px)`,
        transition: `transform 0.6s ease-out ${delay}ms`,
      }}>
        {Array.from({ length: 10 }, (_, d) => (
          <div key={d} style={{ height: DIGIT_H, lineHeight: `${DIGIT_H}px`, textAlign: "center" }}>{d}</div>
        ))}
      </div>
    </div>
  );
}

function SlotScore({ score }: { score: number }) {
  const padded = String(Math.min(score, 9999)).padStart(4, "0");
  const digits = padded.split("").map(Number);
  const delays = [300, 200, 100, 0];
  return (
    <div style={{ display: "flex", fontSize: 24, fontWeight: 800, color: T.accent, fontVariantNumeric: "tabular-nums" }}>
      {digits.map((d, i) => <SlotDigit key={i} digit={d} delay={delays[i]} />)}
    </div>
  );
}

/* ── Countdown Ring ── */
function CountdownRing({ timeLeft, total }: { timeLeft: number; total: number }) {
  const offset = RING_CIRC * (1 - timeLeft / total);
  const color = timeLeft > 10 ? T.correct : timeLeft > 5 ? T.hint : T.wrong;
  const pulse = timeLeft <= 5 && timeLeft > 0;
  return (
    <div style={{ position: "relative", width: 72, height: 72, ...(pulse ? { animation: "pulse 0.5s ease-in-out infinite" } : {}) }}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={RING_R} fill="none" stroke={T.border} strokeWidth="4" />
        <circle cx="36" cy="36" r={RING_R} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={RING_CIRC} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 36 36)"
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, fontWeight: 800, color, transition: "color 0.3s",
      }}>
        {timeLeft}
      </div>
    </div>
  );
}

/* ── Texture paths for realistic card feel ── */
const TEX = {
  cardboard: "/textures/cardboard.png",
  paper: "/textures/natural-paper.png",
  cream: "/textures/cream-paper.png",
  groove: "/textures/groovepaper.png",
};

/* ── CSS Keyframes ── */
const ANIM_CSS = `
@keyframes fadeUp { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(-30px)} }
@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
@keyframes flyOut { to{opacity:0;transform:translateX(80px) scale(0.8)} }
@keyframes hintPop { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
@keyframes cardGlint { 0%{left:-100%} 100%{left:200%} }
`;

/* ── Share Buttons ── */
function ShareButtons({ score, badge }: { score: number; badge: string }) {
  const [copied, setCopied] = useState(false);
  const text = `Sanat Raundu'nda ${score} puan alarak "${badge}" rozetini kazandım!`;
  const url = "https://klemensart.com/testler/sanat-raundu";

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text + "\n" + url)}`, "_blank");
  };
  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
  };
  const copyLink = () => {
    navigator.clipboard.writeText(text + "\n" + url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const btnStyle: React.CSSProperties = {
    flex: 1, padding: "12px 8px", borderRadius: 10, fontSize: 13, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit", border: `1px solid ${T.border}`,
    background: T.bgCard, color: T.text, transition: `all .2s ${ease}`,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
  };

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
      <button onClick={shareWhatsApp} style={{ ...btnStyle, color: "#25D366", borderColor: "rgba(37,211,102,0.3)" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        WhatsApp
      </button>
      <button onClick={shareTwitter} style={{ ...btnStyle, color: "#1DA1F2", borderColor: "rgba(29,161,242,0.3)" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        X
      </button>
      <button onClick={copyLink} style={{ ...btnStyle, color: copied ? T.correct : T.muted }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        {copied ? "Kopyalandı!" : "Kopyala"}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   ANA BİLEŞEN
   ══════════════════════════════════════════════════════════════════════════════ */
export default function SanatRaundu() {
  /* ── State ── */
  const [phase, setPhase] = useState<Phase>("loading");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [fadeIn, setFadeIn] = useState(true);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [showPointAnim, setShowPointAnim] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const startTimeRef = useRef(0);
  const totalTimeRef = useRef(0);

  // Auth & save
  const [user, setUser] = useState<User | null>(null);
  const savedRef = useRef(false);

  // Email results
  const [email, setEmail] = useState("");
  const [kvkkChecked, setKvkkChecked] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "done" | "error" | "registered">("idle");

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Loading
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Game key
  const [gameKey, setGameKey] = useState(0);

  // Animation state
  const [cubeRotation, setCubeRotation] = useState(0);
  const [cubeAutoSpin, setCubeAutoSpin] = useState(true);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const cubeTouchX = useRef(0);

  // Joker state (per game)
  const [jokerDoubleUsed, setJokerDoubleUsed] = useState(false);
  const [jokerHalfUsed, setJokerHalfUsed] = useState(false);
  const [jokerHintUsed, setJokerHintUsed] = useState(false);
  // Joker active for current question
  const [activeJoker, setActiveJoker] = useState<null | "double" | "half" | "hint">(null);
  const [doubleFirstWrong, setDoubleFirstWrong] = useState<string | null>(null);
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);
  const [hintText, setHintText] = useState<string | null>(null);

  /* ── Auth check ── */
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u ?? null));
  }, []);

  /* ── Load categories on mount ── */
  useEffect(() => {
    fetch("/api/trivia/categories")
      .then((r) => r.json())
      .then((d) => {
        // leonardo-atolyesi'nin kendi sayfası var, Sanat Raundu'ndan hariç tut
        const all: Category[] = d.categories ?? [];
        setCategories(all.filter((c) => c.slug !== "leonardo-atolyesi"));
        setPhase("intro");
      })
      .catch(() => setPhase("intro"));
  }, []);

  /* ── Cube auto-spin ── */
  useEffect(() => {
    if (!cubeAutoSpin || phase !== "intro") return;
    const id = setInterval(() => setCubeRotation((r) => r + 90), 2500);
    return () => clearInterval(id);
  }, [cubeAutoSpin, phase]);

  /* ── Browser back prevention ── */
  useEffect(() => {
    if (phase !== "quiz") return;
    history.replaceState({ quiz: true }, "");
    const handler = () => {
      if (phase === "quiz") history.pushState({ quiz: true }, "");
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [phase]);

  /* ── Timer ── */
  useEffect(() => {
    if (phase !== "quiz" || selectedAnswer !== null) return;
    if (timeLeft <= 0) {
      const q = questions[current];
      setSelectedAnswer("__timeout__");
      setIsCorrect(false);
      setStreak(0);
      setEarnedPoints(0);
      setResults((prev) => [...prev, { question: q, correct: false, userAnswer: "__timeout__", points: 0, streak: 0, timeLeft: 0 }]);
      setTimeout(() => setCardFlipped(true), 400);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, phase, selectedAnswer, current, questions]);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  /* ── Select category & load questions ── */
  const selectCategory = useCallback(async (cat: Category) => {
    setSelectedCategory(cat);
    setLoadingQuestions(true);
    try {
      const res = await fetch(`/api/trivia/questions?category=${cat.slug}&limit=${QUESTIONS_PER_ROUND}`);
      const d = await res.json();
      const qs: TriviaQuestion[] = d.questions ?? [];
      if (qs.length === 0) {
        setLoadingQuestions(false);
        return;
      }
      // Shuffle options for each question
      const prepared = qs.map((q) => ({ ...q, options: typeof q.options === "string" ? JSON.parse(q.options) : q.options }));
      setQuestions(prepared);
      setShuffledOptions(shuffle(prepared[0].options));
      setCurrent(0);
      setTotalScore(0);
      setStreak(0);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setResults([]);
      setFadeIn(true);
      setImgError(false);
      setCardFlipped(false);
      setDisplayScore(0);
      setJokerDoubleUsed(false);
      setJokerHalfUsed(false);
      setJokerHintUsed(false);
      setActiveJoker(null);
      setDoubleFirstWrong(null);
      setEliminatedOptions([]);
      setHintText(null);
      setTimeLeft(TIMER_SECONDS);
      startTimeRef.current = Date.now();
      totalTimeRef.current = 0;
      savedRef.current = false;
      setEmailStatus("idle");
      setEmail("");
      setKvkkChecked(false);
      setEarnedPoints(0);
      setShowPointAnim(false);
      setGameKey((k) => k + 1);
      setLoadingQuestions(false);
      setPhase("quiz");
      scrollTop();
    } catch {
      setLoadingQuestions(false);
    }
  }, []);

  /* ── Joker activators ── */
  const activateDouble = useCallback(() => {
    if (jokerDoubleUsed || selectedAnswer || activeJoker) return;
    setJokerDoubleUsed(true);
    setActiveJoker("double");
  }, [jokerDoubleUsed, selectedAnswer, activeJoker]);

  const activateHalf = useCallback(() => {
    if (jokerHalfUsed || selectedAnswer || activeJoker) return;
    setJokerHalfUsed(true);
    setActiveJoker("half");
    const q = questions[current];
    const wrongOpts = shuffledOptions.filter((o) => o !== q.correct_answer);
    const toEliminate = shuffle(wrongOpts).slice(0, 2);
    setEliminatedOptions(toEliminate);
  }, [jokerHalfUsed, selectedAnswer, activeJoker, questions, current, shuffledOptions]);

  const activateHint = useCallback(() => {
    if (jokerHintUsed || selectedAnswer || activeJoker) return;
    setJokerHintUsed(true);
    setActiveJoker("hint");
    const q = questions[current];
    if (q.fun_fact) {
      const sentences = q.fun_fact.split(/[.!?]/);
      setHintText(sentences[0]?.trim() ? sentences[0].trim() + "..." : `"${q.correct_answer.charAt(0)}..." harfiyle başlıyor`);
    } else {
      setHintText(`Doğru cevap "${q.correct_answer.charAt(0)}" harfiyle başlıyor ve ${q.correct_answer.length} harften oluşuyor.`);
    }
  }, [jokerHintUsed, selectedAnswer, activeJoker, questions, current]);

  /* ── Handle answer (joker-aware + flip delay) ── */
  const handleAnswer = useCallback((answer: string) => {
    if (selectedAnswer) return;
    const q = questions[current];
    const correct = answer === q.correct_answer;

    // Double chance: first wrong → don't finalize, allow second try
    if (activeJoker === "double" && !doubleFirstWrong && !correct) {
      setDoubleFirstWrong(answer);
      return;
    }

    // Calculate points with joker modifiers
    const isSecondTry = activeJoker === "double" && doubleFirstWrong !== null;
    let newStreak = correct ? streak + 1 : 0;
    let pts = 0;
    if (correct) {
      if (isSecondTry) {
        pts = Math.round((100 + timeLeft * 5) * 0.5); // half base, no streak
        newStreak = streak; // don't increase streak
      } else if (activeJoker === "half") {
        pts = 100 + timeLeft * 5; // full base, no streak multiplier
      } else if (activeJoker === "hint") {
        pts = Math.round(calcPoints(timeLeft, newStreak) * 0.7);
      } else {
        pts = calcPoints(timeLeft, newStreak);
      }
    }

    setSelectedAnswer(answer);
    setIsCorrect(correct);
    setStreak(newStreak);
    setTotalScore((prev) => prev + pts);
    setEarnedPoints(pts);
    setResults((prev) => [...prev, { question: q, correct, userAnswer: answer, points: pts, streak: newStreak, timeLeft }]);

    if (pts > 0) {
      setShowPointAnim(true);
      setTimeout(() => setShowPointAnim(false), 1200);
    }

    // 400ms suspense → flip card + animate slot
    setTimeout(() => {
      setCardFlipped(true);
      setDisplayScore((prev) => prev + pts);
    }, 400);
  }, [selectedAnswer, questions, current, streak, timeLeft, activeJoker, doubleFirstWrong]);

  /* ── Next question (instant flip-back) ── */
  const nextQuestion = useCallback(() => {
    if (current + 1 >= questions.length) {
      totalTimeRef.current = Math.round((Date.now() - startTimeRef.current) / 1000);
      setPhase("result");
      scrollTop();
      return;
    }
    setCardFlipped(false); // instant (transition only applies on flip-to-back)
    setTimeout(() => {
      setFadeIn(false);
      setTimeout(() => {
        const next = current + 1;
        setCurrent(next);
        setShuffledOptions(shuffle(questions[next].options));
        setSelectedAnswer(null);
        setIsCorrect(null);
        setImgError(false);
        setActiveJoker(null);
        setDoubleFirstWrong(null);
        setEliminatedOptions([]);
        setHintText(null);
        setTimeLeft(TIMER_SECONDS);
        setEarnedPoints(0);
        setShowPointAnim(false);
        setFadeIn(true);
        scrollTop();
      }, 100);
    }, 50);
  }, [current, questions]);

  /* ── Save result & fetch leaderboard ── */
  useEffect(() => {
    if (phase !== "result") return;

    if (!savedRef.current && user) {
      savedRef.current = true;
      const badge = getBadge(totalScore);
      const meta = (user.user_metadata ?? {}) as Record<string, string>;
      const displayName = meta.full_name || meta.name || "Anonim";
      fetch("/api/quiz/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: totalScore,
          badge: badge.name,
          time_seconds: totalTimeRef.current || null,
          mode: "timed",
          display_name: displayName,
          quiz_slug: "sanat-raundu",
        }),
      }).catch(() => {});
    }

    if (user) {
      fetch("/api/quiz/results?slug=sanat-raundu&limit=10")
        .then((r) => r.json())
        .then((d) => setLeaderboard(d.results ?? []))
        .catch(() => {});
    }
  }, [phase, totalScore, user]);

  /* ── Send results to email ── */
  const handleEmailSubmit = async () => {
    if (!email || !kvkkChecked || emailStatus === "sending") return;
    setEmailStatus("sending");
    try {
      const badge = getBadge(totalScore);
      const res = await fetch("/api/quiz/send-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          score: totalScore,
          badge: badge.name,
          mode: "timed",
          time_seconds: totalTimeRef.current || null,
          quiz_slug: "sanat-raundu",
          quiz_title: "Sanat Raundu",
          results: results.map((r) => ({
            question: r.question.question,
            correctAnswer: r.question.correct_answer,
            userAnswer: r.userAnswer,
            correct: r.correct,
            points: r.points,
            funFact: r.question.fun_fact,
          })),
        }),
      });
      const data = await res.json();
      if (data.registered) setEmailStatus("registered");
      else if (data.sent) {
        setEmailStatus("done");
        fetch("/api/quiz/results?slug=sanat-raundu&limit=10")
          .then((r) => r.json())
          .then((d) => setLeaderboard(d.results ?? []))
          .catch(() => {});
      } else setEmailStatus("error");
    } catch {
      setEmailStatus("error");
    }
  };

  /* ══════════════════════════════════════════════
     LOADING
     ══════════════════════════════════════════════ */
  if (phase === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: T.muted, fontSize: 16 }}>Yükleniyor...</div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════
     INTRO — 3D Küp ile Kategori Seçimi
     ══════════════════════════════════════════════ */
  if (phase === "intro") {
    const faceCategories = categories.slice(0, 4);
    const activeFaceIdx = ((Math.round(cubeRotation / 90) % 4) + 4) % 4;
    const activeCategory = activeFaceIdx < faceCategories.length ? faceCategories[activeFaceIdx] : null;

    const cubeFaceStyle = (rotateY: number): React.CSSProperties => ({
      position: "absolute", width: CUBE_SIZE, height: CUBE_SIZE,
      backfaceVisibility: "hidden",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      borderRadius: 20, border: `2px solid ${T.border}`, background: T.bgCard,
      transform: `rotateY(${rotateY}deg) translateZ(${CUBE_HALF}px)`,
      cursor: "pointer",
    });

    return (
      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Segoe UI','Helvetica Neue',sans-serif" }}>
        <style>{ANIM_CSS}</style>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "96px 24px 60px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ background: T.accentBg, color: T.accent, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", padding: "8px 20px", borderRadius: 99, marginBottom: 32 }}>
            Klemens Trivia
          </div>

          <h1 style={{ fontSize: "clamp(28px,6vw,44px)", fontWeight: 800, color: T.text, lineHeight: 1.15, margin: "0 0 20px", letterSpacing: -0.5 }}>
            Sanat<br />
            <span style={{ color: T.accent }}>Raundu</span>
          </h1>

          <p style={{ fontSize: 17, lineHeight: 1.7, color: T.muted, margin: "0 0 12px", maxWidth: 480 }}>
            Hız bonuslu, süreli trivia oyunuyla sanat bilginizi test edin.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: T.muted, margin: "0 0 40px", maxWidth: 480 }}>
            <strong style={{ color: T.textSec }}>10 soru</strong> &middot;{" "}
            <strong style={{ color: T.textSec }}>15 saniye</strong> &middot;{" "}
            <strong style={{ color: T.textSec }}>Seri bonusu</strong>
          </p>

          {/* How it works */}
          <div style={{ display: "flex", gap: 24, marginBottom: 48, flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { n: "⚡", l: "Hızlı cevap = fazla puan" },
              { n: "🔥", l: "3+ seri = ×1.5 çarpan" },
              { n: "💎", l: "5+ seri = ×2 çarpan" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center", minWidth: 120 }}>
                <div style={{ fontSize: 28 }}>{s.n}</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* 3D Küp */}
          {faceCategories.length > 0 && (
            <div style={{ marginBottom: 32, marginTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 28 }}>
                Kategori Seçin
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
                {/* Sol ok */}
                <button
                  onClick={() => { setCubeAutoSpin(false); setCubeRotation((r) => r - 90); }}
                  style={{
                    width: 44, height: 44, borderRadius: 99, border: `1px solid ${T.border}`,
                    background: T.bgCard, color: T.muted, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
                </button>

                {/* Küp container */}
                <div
                  style={{ width: CUBE_SIZE, height: CUBE_SIZE, perspective: 600 }}
                  onMouseEnter={() => setCubeAutoSpin(false)}
                  onTouchStart={(e) => { cubeTouchX.current = e.touches[0].clientX; setCubeAutoSpin(false); }}
                  onTouchEnd={(e) => {
                    const dx = e.changedTouches[0].clientX - cubeTouchX.current;
                    if (Math.abs(dx) > 40) setCubeRotation((r) => r + (dx > 0 ? -90 : 90));
                  }}
                >
                  <div style={{
                    width: CUBE_SIZE, height: CUBE_SIZE, position: "relative",
                    transformStyle: "preserve-3d",
                    transform: `rotateY(${-cubeRotation}deg)`,
                    transition: `transform 0.6s ${ease}`,
                  }}>
                    {/* Category faces (4 yüz) */}
                    {faceCategories.map((cat, i) => (
                      <div key={cat.slug} style={cubeFaceStyle(i * 90)} onClick={() => selectCategory(cat)}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>{cat.icon_emoji}</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 4 }}>{cat.title}</div>
                        <div style={{ fontSize: 13, color: cat.color, fontWeight: 600 }}>{cat.question_count} soru</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sağ ok */}
                <button
                  onClick={() => { setCubeAutoSpin(false); setCubeRotation((r) => r + 90); }}
                  style={{
                    width: 44, height: 44, borderRadius: 99, border: `1px solid ${T.border}`,
                    background: T.bgCard, color: T.muted, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
                </button>
              </div>

              {/* Active face info */}
              <div style={{ marginTop: 24, minHeight: 80, transition: `opacity 0.3s ${ease}`, opacity: activeCategory ? 1 : 0.5 }}>
                {activeCategory ? (
                  <>
                    <div style={{ fontSize: 14, color: T.textSec, lineHeight: 1.6, marginBottom: 12, maxWidth: 360, margin: "0 auto 12px" }}>
                      {activeCategory.description}
                    </div>
                    <button
                      onClick={() => selectCategory(activeCategory)}
                      disabled={loadingQuestions}
                      style={{
                        background: T.accent, color: T.bg, border: "none", borderRadius: 12,
                        padding: "14px 40px", fontSize: 16, fontWeight: 700,
                        cursor: loadingQuestions ? "wait" : "pointer", fontFamily: "inherit",
                        transition: `transform .2s ${ease}`,
                      }}
                    >
                      {loadingQuestions ? "Yükleniyor..." : "Oyna"}
                    </button>
                  </>
                ) : (
                  <div style={{ fontSize: 14, color: T.muted }}>Döndürerek kategori seçin</div>
                )}
              </div>
            </div>
          )}

          {categories.length === 0 && (
            <div style={{ color: T.muted, fontSize: 14 }}>Kategoriler yüklenemedi.</div>
          )}

          <Link
            href="/testler"
            style={{ fontSize: 13, color: T.muted, marginTop: 24, textDecoration: "none", transition: `color .2s ${ease}` }}
          >
            Testlere Dön
          </Link>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════
     QUIZ — İskambil Kartı + Jokerler
     ══════════════════════════════════════════════ */
  if (phase === "quiz") {
    const q = questions[current];
    const progressPct = (current / questions.length) * 100;
    const diffLabel = q.difficulty === "kolay" ? "K" : q.difficulty === "orta" ? "O" : "Z";
    const diffColor = q.difficulty === "kolay" ? T.correct : q.difficulty === "orta" ? T.hint : T.wrong;
    const catEmoji = selectedCategory?.icon_emoji || "🎨";
    const jokerDisabled = selectedAnswer !== null;

    return (
      <div key={gameKey} style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Segoe UI','Helvetica Neue',sans-serif" }}>
        <style>{ANIM_CSS}</style>
        {/* textures loaded via CSS background-image */}
        <div
          style={{
            maxWidth: 640, margin: "0 auto", padding: "32px 20px 60px",
            opacity: fadeIn ? 1 : 0, transform: fadeIn ? "translateY(0)" : "translateY(12px)",
            transition: `opacity .3s ${ease}, transform .3s ${ease}`,
          }}
        >
          {/* Progress bar */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: T.muted, fontWeight: 600 }}>
                Soru {current + 1}/{questions.length}
              </span>
            </div>
            <div style={{ height: 4, background: T.border, borderRadius: 99 }}>
              <div style={{
                height: "100%", width: `${progressPct}%`, background: T.accent,
                borderRadius: 99, transition: `width 0.5s ${ease}`,
              }} />
            </div>
          </div>

          {/* Slot + Streak + Ring row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0 16px" }}>
            <div style={{ textAlign: "center" }}>
              <SlotScore score={displayScore} />
              <div style={{ fontSize: 10, color: T.muted, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>puan</div>
            </div>
            <div style={{ textAlign: "center" }}>
              {streak >= 3 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontSize: 20 }}>🔥</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.streak, background: T.streakBg, padding: "2px 10px", borderRadius: 99, marginTop: 2 }}>
                    ×{streak >= 5 ? "2" : "1.5"}
                  </span>
                  <span style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>seri</span>
                </div>
              ) : (
                <div style={{ opacity: 0.3, color: T.muted, fontSize: 12 }}>seri yok</div>
              )}
            </div>
            <CountdownRing timeLeft={timeLeft} total={TIMER_SECONDS} />
          </div>

          {/* ── JOKER BUTTONS ── */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[
              { key: "double" as const, icon: "🃏", label: "Çifte Şans", used: jokerDoubleUsed, fn: activateDouble },
              { key: "half" as const, icon: "✂️", label: "Yarı Yarıya", used: jokerHalfUsed, fn: activateHalf },
              { key: "hint" as const, icon: "💡", label: "İpucu", used: jokerHintUsed, fn: activateHint },
            ].map((j) => {
              const isActive = activeJoker === j.key;
              const disabled = j.used || jokerDisabled || (activeJoker !== null && !isActive);
              return (
                <button
                  key={j.key}
                  onClick={j.fn}
                  disabled={disabled}
                  style={{
                    flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    padding: "10px 6px", borderRadius: 12, fontFamily: "inherit", cursor: disabled ? "default" : "pointer",
                    background: isActive ? T.accentBg : j.used ? "rgba(0,0,0,0.15)" : T.bgCard,
                    border: `1.5px solid ${isActive ? T.accent : j.used ? "transparent" : T.border}`,
                    opacity: j.used && !isActive ? 0.35 : 1,
                    transition: `all .25s ${ease}`,
                    position: "relative", overflow: "hidden",
                  }}
                >
                  <span style={{ fontSize: 20, filter: j.used && !isActive ? "grayscale(1)" : "none" }}>{j.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: isActive ? T.accent : j.used ? T.muted : T.textSec, letterSpacing: 0.5 }}>
                    {j.label}
                  </span>
                  {j.used && !isActive && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: "120%", height: 1.5, background: T.muted, transform: "rotate(-20deg)", opacity: 0.5 }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Hint bubble */}
          {hintText && (
            <div style={{
              background: "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.06))",
              border: `1.5px solid rgba(201,168,76,0.3)`, borderRadius: 14,
              padding: "14px 18px", marginBottom: 16,
              animation: "hintPop 0.3s ease-out",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
                💡 İpucu
              </div>
              <div style={{ fontSize: 14, color: T.textSec, lineHeight: 1.6 }}>{hintText}</div>
            </div>
          )}

          {/* Double chance info */}
          {activeJoker === "double" && !doubleFirstWrong && !selectedAnswer && (
            <div style={{
              textAlign: "center", marginBottom: 12, fontSize: 13, fontWeight: 600,
              color: T.accent, background: T.accentBg, padding: "8px 16px", borderRadius: 99,
            }}>
              🃏 Çifte Şans aktif — yanlış bilirseniz 2. hakkınız var!
            </div>
          )}
          {doubleFirstWrong && !selectedAnswer && (
            <div style={{
              textAlign: "center", marginBottom: 12, fontSize: 13, fontWeight: 700,
              color: T.hint, background: T.hintBg, padding: "8px 16px", borderRadius: 99,
            }}>
              2. şansınız! Kalan şıklardan birini seçin
            </div>
          )}

          {/* 3D Flip Card — Trivia Kartı */}
          <div style={{ perspective: 1200, marginBottom: 20 }}>
            {/* Stacked card deck effect */}
            <div style={{ position: "relative" }}>
              {/* Stacked card deck — 3 layers, hidden when flipped */}
              {!cardFlipped && <>
              <div style={{
                position: "absolute", top: 8, left: 5, right: -5, bottom: -8,
                backgroundColor: `color-mix(in srgb, ${selectedCategory?.color || T.accent} 60%, #000)`,
                backgroundImage: `url(${TEX.cardboard})`,
                backgroundBlendMode: "overlay",
                borderRadius: 26, opacity: 0.25,
              }} />
              <div style={{
                position: "absolute", top: 5, left: 3, right: -3, bottom: -5,
                backgroundColor: `color-mix(in srgb, ${selectedCategory?.color || T.accent} 80%, #000)`,
                backgroundImage: `url(${TEX.cardboard})`,
                backgroundBlendMode: "overlay",
                borderRadius: 25, opacity: 0.4,
                boxShadow: "0 1px 0 rgba(255,255,255,0.1) inset",
              }} />
              <div style={{
                position: "absolute", top: 2, left: 1, right: -1, bottom: -2,
                backgroundColor: selectedCategory?.color || T.accent,
                backgroundImage: `url(${TEX.cardboard})`,
                backgroundBlendMode: "overlay",
                borderRadius: 24, opacity: 0.6,
                boxShadow: "0 1px 0 rgba(255,255,255,0.15) inset",
              }} />
              </>}

              <div style={{
                position: "relative",
                transformStyle: "preserve-3d",
                transition: cardFlipped ? `transform 0.6s ${ease}` : "none",
                transform: cardFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}>
                {/* ── FRONT FACE ── */}
                <div style={{
                  backfaceVisibility: "hidden", position: "relative",
                  backgroundColor: selectedCategory?.color || T.accent,
                  backgroundImage: `url(${TEX.cardboard})`,
                  backgroundBlendMode: "soft-light",
                  borderRadius: 24, overflow: "hidden",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}>
                  {/* Colored header area with cardboard texture */}
                  <div style={{
                    padding: "18px 20px 14px", position: "relative",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    backgroundImage: `url(${TEX.groove}), radial-gradient(circle at 20% 50%, rgba(255,255,255,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 40%)`,
                    backgroundBlendMode: "overlay, normal, normal",
                  }}>
                    {/* Category + difficulty */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: 12,
                        background: "rgba(255,255,255,0.2)",
                        backdropFilter: "blur(4px)",
                        border: "1.5px solid rgba(255,255,255,0.25)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)",
                      }}>
                        {catEmoji}
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.3)", letterSpacing: 0.3 }}>
                          {selectedCategory?.title || "Trivia"}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: 1.5 }}>
                          {q.difficulty}
                        </div>
                      </div>
                    </div>
                    {/* Question number badge */}
                    <div style={{
                      background: "rgba(0,0,0,0.15)", borderRadius: 10, padding: "6px 14px",
                      fontSize: 13, fontWeight: 800, color: "#fff",
                      border: "1px solid rgba(255,255,255,0.15)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
                      letterSpacing: 0.5,
                    }}>
                      {current + 1}/{questions.length}
                    </div>
                  </div>

                  {/* Glossy shine sweep — plastic coating effect */}
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                    overflow: "hidden", borderRadius: 24, pointerEvents: "none", zIndex: 5,
                  }}>
                    <div style={{
                      position: "absolute", top: -20, width: "40%", height: "140%",
                      background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 55%, transparent 70%)",
                      animation: "cardGlint 4s ease-in-out infinite",
                      transform: "skewX(-15deg)",
                    }} />
                  </div>

                  {/* Embossed edge line between header and content */}
                  <div style={{
                    height: 1, margin: "0 8px",
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.15) 80%, transparent)",
                    boxShadow: "0 1px 0 rgba(0,0,0,0.1)",
                  }} />

                  {/* White content card with real paper texture */}
                  <div style={{
                    backgroundColor: "#fffdf8", borderRadius: "20px 20px 22px 22px",
                    margin: "0 4px 4px", padding: "24px 20px 20px",
                    minHeight: 280, position: "relative",
                    backgroundImage: `url(${TEX.paper}), url(${TEX.cream}), linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.2) 100%)`,
                    backgroundBlendMode: "multiply, soft-light, normal",
                    boxShadow: "inset 0 2px 6px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(0,0,0,0.04), inset 0 -1px 0 rgba(255,255,255,0.8)",
                  }}>
                    {/* Image */}
                    {q.image_url && (
                      <div style={{
                        position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: 14,
                        overflow: "hidden", marginBottom: 20, background: "#f5f0eb",
                        border: "1px solid #e8e4df",
                      }}>
                        {!imgError ? (
                          <Image src={q.image_url} alt="Soru görseli" fill style={{ objectFit: "contain" }}
                            sizes="(max-width: 640px) 100vw, 640px" priority onError={() => setImgError(true)} />
                        ) : (
                          <div style={{ textAlign: "center", padding: 20 }}>
                            <div style={{ fontSize: 40, marginBottom: 8, opacity: 0.2 }}>&#x1f5bc;</div>
                            <span style={{ fontSize: 13, color: "#999" }}>Görsel yüklenemedi</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Question */}
                    <h2 style={{
                      fontSize: 19, fontWeight: 700, color: "#1a1714", textAlign: "center",
                      margin: "0 0 20px", lineHeight: 1.45,
                    }}>
                      {q.question}
                    </h2>

                    {/* Point animation */}
                    {showPointAnim && earnedPoints > 0 && (
                      <div style={{ textAlign: "center", marginBottom: 8, animation: "fadeUp .8s ease-out forwards", fontSize: 20, fontWeight: 800, color: selectedCategory?.color || T.accent }}>
                        +{earnedPoints}
                      </div>
                    )}

                    {/* Options with colored category strip */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {shuffledOptions.map((opt, optIdx) => {
                        const isEliminated = eliminatedOptions.includes(opt);
                        const isDoubleWrong = doubleFirstWrong === opt;
                        const isSelected = selectedAnswer === opt;
                        const isCorrectOpt = opt === q.correct_answer;
                        const answered = selectedAnswer !== null;
                        const optLabels = ["A", "B", "C", "D"];

                        if (isEliminated) {
                          return (
                            <div key={opt} style={{
                              animation: "flyOut 0.4s ease-in forwards",
                              display: "flex", alignItems: "stretch", borderRadius: 12, overflow: "hidden",
                              border: "1.5px solid #e8e4df", opacity: 0.5,
                            }}>
                              <div style={{ width: 6, background: "#ddd", flexShrink: 0 }} />
                              <div style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, color: "#999" }}>{opt}</div>
                            </div>
                          );
                        }

                        let bg = "#fff";
                        let bColor = "#e0dbd5";
                        let tColor = "#1a1714";
                        let stripColor = selectedCategory?.color || T.accent;
                        const isDisabled = answered || isDoubleWrong;

                        if (isDoubleWrong) {
                          bg = "#fef2f2"; bColor = T.wrong; tColor = T.wrong; stripColor = T.wrong;
                        } else if (answered) {
                          if (isCorrectOpt) { bg = "#f0fdf4"; bColor = T.correct; tColor = "#166534"; stripColor = T.correct; }
                          else if (isSelected) { bg = "#fef2f2"; bColor = T.wrong; tColor = T.wrong; stripColor = T.wrong; }
                          else { tColor = "#aaa"; stripColor = "#ddd"; }
                        }

                        return (
                          <button
                            key={opt} onClick={() => handleAnswer(opt)} disabled={isDisabled}
                            style={{
                              display: "flex", alignItems: "stretch", borderRadius: 12, overflow: "hidden",
                              border: `1.5px solid ${bColor}`,
                              backgroundColor: bg,
                              backgroundImage: `url(${TEX.cream})`,
                              backgroundBlendMode: "multiply",
                              cursor: isDisabled ? "default" : "pointer", fontFamily: "inherit", textAlign: "left",
                              transition: `all .2s ${ease}`,
                              opacity: (answered && !isSelected && !isCorrectOpt) || isDoubleWrong ? 0.5 : 1,
                              boxShadow: !answered && !isDoubleWrong ? "0 2px 6px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)" : "none",
                            }}
                          >
                            {/* Category color strip */}
                            <div style={{
                              width: 8, flexShrink: 0, transition: `background-color .2s ${ease}`,
                              backgroundColor: stripColor,
                              backgroundImage: `url(${TEX.cardboard})`,
                              backgroundBlendMode: "overlay",
                            }} />
                            {/* Option label */}
                            <div style={{
                              width: 34, display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 13, fontWeight: 900, color: stripColor, flexShrink: 0,
                              transition: `color .2s ${ease}`,
                              borderRight: "1px solid rgba(0,0,0,0.06)",
                            }}>
                              {optLabels[optIdx]}
                            </div>
                            {/* Option text */}
                            <div style={{
                              flex: 1, padding: "13px 14px 13px 10px", fontSize: 15, fontWeight: 600,
                              color: tColor, lineHeight: 1.4, transition: `color .2s ${ease}`,
                            }}>
                              {opt}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Timeout on front */}
                    {selectedAnswer === "__timeout__" && (
                      <div style={{ textAlign: "center", marginTop: 12, padding: "10px 16px", borderRadius: 99, background: "#fef2f2", color: T.wrong, fontSize: 14, fontWeight: 700 }}>
                        Süre doldu!
                      </div>
                    )}
                  </div>
                </div>

                {/* ── BACK FACE ── */}
                <div style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  position: "absolute", top: 0, left: 0, width: "100%",
                }}>
                  <div style={{
                    backgroundColor: isCorrect ? "#16a34a" : selectedAnswer === "__timeout__" ? "#9B918A" : "#dc2626",
                    backgroundImage: `url(${TEX.cardboard})`,
                    backgroundBlendMode: "soft-light",
                    borderRadius: 24, overflow: "hidden",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}>
                    {/* Result header */}
                    <div style={{
                      padding: "20px 20px 14px", textAlign: "center",
                      backgroundImage: `url(${TEX.groove})`,
                      backgroundBlendMode: "overlay",
                    }}>
                      <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                        {selectedAnswer === "__timeout__" ? "⏱ Süre Doldu!" : isCorrect ? "✓ Doğru!" : "✗ Yanlış!"}
                      </div>
                      {isCorrect && earnedPoints > 0 && (
                        <div style={{ fontSize: 22, fontWeight: 800, color: "rgba(255,255,255,0.9)", marginTop: 4 }}>
                          +{earnedPoints} puan
                        </div>
                      )}
                    </div>

                    {/* White content card with real paper texture */}
                    <div style={{
                      backgroundColor: "#fffdf8", borderRadius: "20px 20px 22px 22px",
                      margin: "0 4px 4px", padding: "24px 20px 20px",
                      backgroundImage: `url(${TEX.paper}), url(${TEX.cream}), linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.2) 100%)`,
                      backgroundBlendMode: "multiply, soft-light, normal",
                      boxShadow: "inset 0 2px 6px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(0,0,0,0.04), inset 0 -1px 0 rgba(255,255,255,0.8)",
                    }}>
                      {/* Correct answer */}
                      {!isCorrect && (
                        <div style={{
                          background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 12,
                          padding: "14px 16px", marginBottom: 16, textAlign: "center",
                        }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#166534", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Doğru Cevap</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: "#166534" }}>{q.correct_answer}</div>
                        </div>
                      )}

                      {/* Fun fact */}
                      {q.fun_fact && (
                        <div style={{
                          background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 12,
                          padding: "16px", marginBottom: 20,
                        }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
                            Biliyor muydun?
                          </div>
                          <div style={{ fontSize: 14, color: "#78350f", lineHeight: 1.7 }}>{q.fun_fact}</div>
                        </div>
                      )}

                      {/* Next button */}
                      <button
                        onClick={nextQuestion}
                        style={{
                          width: "100%", background: selectedCategory?.color || T.accent, color: "#fff",
                          border: "none", borderRadius: 14, padding: "16px", fontSize: 16, fontWeight: 700,
                          cursor: "pointer", fontFamily: "inherit", transition: `transform .2s ${ease}`,
                          boxShadow: `0 4px 12px ${(selectedCategory?.color || T.accent)}40`,
                        }}
                        onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                        onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.transform = "translateY(0)"; }}
                      >
                        {current + 1 < questions.length ? "Sonraki Soru →" : "Sonuçları Gör →"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════
     RESULT
     ══════════════════════════════════════════════ */
  const badge = getBadge(totalScore);
  const totalTime = totalTimeRef.current;
  const correctCount = results.filter((r) => r.correct).length;
  const maxStreak = Math.max(...results.map((r) => r.streak), 0);
  const showFullResults = user || emailStatus === "done";

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Segoe UI','Helvetica Neue',sans-serif" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "64px 20px 60px" }}>

        {/* ── Non-member: Email form ── */}
        {!user && emailStatus !== "done" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: 32 }}>
              <div style={{
                fontSize: 48, fontWeight: 800, color: T.muted, lineHeight: 1, opacity: 0.3,
                filter: "blur(8px)", userSelect: "none",
              }}>
                ?<span style={{ fontSize: 20 }}>/{questions.length}</span>
              </div>
              <p style={{ fontSize: 16, color: T.muted, marginTop: 12 }}>
                Raund tamamlandı!
              </p>
            </div>

            {emailStatus === "registered" ? (
              <div style={{
                background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16,
                padding: "28px 24px", marginBottom: 24,
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 8 }}>
                  Bu e-posta ile zaten üyesiniz!
                </div>
                <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.7, marginBottom: 20 }}>
                  Giriş yaparak sonuçlarınızı detaylı görebilir ve liderlik tablosunda yerinizi alabilirsiniz.
                </p>
                <a
                  href="/club/giris"
                  style={{
                    display: "inline-block", background: T.accent, color: T.bg,
                    textDecoration: "none", fontSize: 15, fontWeight: 700,
                    padding: "14px 36px", borderRadius: 99,
                  }}
                >
                  Giriş Yap
                </a>
              </div>
            ) : (
              <div style={{
                background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16,
                padding: "28px 24px", marginBottom: 24,
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 6 }}>
                  Sonuçlarınızı e-postanıza gönderelim
                </div>
                <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.7, marginBottom: 20 }}>
                  Puanınız, rozetiniz ve doğru cevaplar açıklamalarıyla birlikte e-posta adresinize gönderilecek.
                </p>

                <input
                  type="email" placeholder="E-posta adresiniz" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
                  style={{
                    width: "100%", boxSizing: "border-box", background: T.bg,
                    border: `1px solid ${T.border}`, borderRadius: 10,
                    padding: "14px 16px", fontSize: 15, color: T.text, fontFamily: "inherit",
                    outline: "none", marginBottom: 12,
                  }}
                />

                <label style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  cursor: "pointer", marginBottom: 16, textAlign: "left",
                }}>
                  <input
                    type="checkbox" checked={kvkkChecked}
                    onChange={(e) => setKvkkChecked(e.target.checked)}
                    style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, accentColor: T.accent }}
                  />
                  <span style={{ fontSize: 12, color: T.muted, lineHeight: 1.6 }}>
                    Kişisel verilerimin işlenmesine ilişkin{" "}
                    <a href="/kvkk" target="_blank" rel="noopener noreferrer"
                      style={{ color: T.accent, textDecoration: "underline", textUnderlineOffset: 2 }}>
                      KVKK Aydınlatma Metni
                    </a>
                    &apos;ni okudum ve e-posta adresimin sonuçların gönderimi ile bülten amacıyla işlenmesini kabul ediyorum.
                  </span>
                </label>

                <button
                  onClick={handleEmailSubmit}
                  disabled={emailStatus === "sending" || !email || !kvkkChecked}
                  style={{
                    width: "100%", background: T.accent, color: T.bg, border: "none", borderRadius: 12,
                    padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    opacity: emailStatus === "sending" || !email || !kvkkChecked ? 0.5 : 1,
                    transition: `all .2s ${ease}`,
                  }}
                >
                  {emailStatus === "sending" ? "Gönderiliyor..." : "Sonuçlarımı Gönder"}
                </button>

                {emailStatus === "error" && (
                  <div style={{ fontSize: 13, color: T.wrong, marginTop: 10 }}>
                    Bir hata oluştu. Lütfen tekrar deneyin.
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button
                onClick={() => setPhase("intro")}
                style={{
                  flex: 1, background: "transparent", color: T.muted,
                  border: `1px solid ${T.border}`, borderRadius: 12,
                  padding: "14px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Tekrar Oyna
              </button>
              <Link
                href="/testler"
                style={{
                  flex: 1, background: "transparent", color: T.muted,
                  border: `1px solid ${T.border}`, borderRadius: 12,
                  padding: "14px", fontSize: 14, fontWeight: 600, textDecoration: "none",
                  textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                Testlere Dön
              </Link>
            </div>
          </div>
        )}

        {/* ── After email sent ── */}
        {!user && emailStatus === "done" && (
          <div style={{
            textAlign: "center", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: 12, padding: "16px", marginBottom: 24,
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.correct }}>
              Sonuçlarınız e-postanıza gönderildi!
            </div>
          </div>
        )}

        {/* ── Full results ── */}
        {showFullResults && (
          <>
            {/* Score */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ fontSize: 56, fontWeight: 800, color: T.accent, lineHeight: 1 }}>
                {totalScore}
              </div>
              <div style={{ fontSize: 16, color: T.muted, marginTop: 8 }}>
                toplam puan
              </div>
              <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 16 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: T.correct }}>{correctCount}</div>
                  <div style={{ fontSize: 12, color: T.muted }}>Doğru</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: T.wrong }}>{questions.length - correctCount}</div>
                  <div style={{ fontSize: 12, color: T.muted }}>Yanlış</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: T.streak }}>{maxStreak}</div>
                  <div style={{ fontSize: 12, color: T.muted }}>En İyi Seri</div>
                </div>
                {totalTime > 0 && (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: T.textSec }}>{formatTime(totalTime)}</div>
                    <div style={{ fontSize: 12, color: T.muted }}>Süre</div>
                  </div>
                )}
              </div>
            </div>

            {/* Badge */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{
                display: "inline-flex", flexDirection: "column", alignItems: "center",
                background: T.accentBg, border: "1px solid rgba(201,168,76,0.25)",
                borderRadius: 20, padding: "24px 40px",
              }}>
                <span style={{ fontSize: 36, marginBottom: 8 }}>{badge.emoji}</span>
                <span style={{ fontSize: 13, color: T.muted, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
                  Rozetiniz
                </span>
                <span style={{ fontSize: 24, fontWeight: 800, color: T.accent, marginBottom: 4 }}>{badge.name}</span>
                <span style={{ fontSize: 14, color: T.muted }}>{badge.desc}</span>
                {user && (
                  <span style={{ fontSize: 12, color: T.correct, marginTop: 8, fontWeight: 600 }}>
                    Profilinize kaydedildi
                  </span>
                )}
              </div>
            </div>

            {/* Share */}
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: T.muted, marginBottom: 12, letterSpacing: 1, textTransform: "uppercase" }}>
                Sonucunuzu Paylaşın
              </h3>
            </div>
            <ShareButtons score={totalScore} badge={badge.name} />

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 12, textAlign: "left" }}>
                  Skor Tablosu
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {leaderboard.map((entry, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        background: i < 3 ? T.accentBg : T.bgCard,
                        border: `1px solid ${i < 3 ? "rgba(201,168,76,0.2)" : T.border}`,
                        borderRadius: 10, padding: "10px 14px",
                      }}
                    >
                      <span style={{
                        width: 24, height: 24, borderRadius: 99, fontSize: 12, fontWeight: 800,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: i === 0 ? T.accent : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : T.border,
                        color: i < 3 ? T.bg : T.muted, flexShrink: 0,
                      }}>
                        {i + 1}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 14, fontWeight: 600, color: T.text,
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                          {entry.display_name}
                        </div>
                        <div style={{ fontSize: 11, color: T.muted }}>
                          {entry.badge}{entry.time_seconds ? ` — ${formatTime(entry.time_seconds)}` : ""}
                        </div>
                      </div>
                      <span style={{ fontSize: 16, fontWeight: 800, color: T.accent, flexShrink: 0 }}>
                        {entry.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div style={{ textAlign: "left", marginBottom: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 12 }}>Soru Özeti</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {results.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      background: T.bgCard, border: `1px solid ${T.border}`,
                      borderRadius: 12, padding: "12px 14px",
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: 99, fontSize: 13, fontWeight: 800,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: r.correct ? T.correctBg : T.wrongBg,
                      color: r.correct ? T.correct : T.wrong, flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 14, fontWeight: 600, color: T.text,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {r.question.question}
                      </div>
                      {!r.correct && r.userAnswer !== "__timeout__" && (
                        <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                          Cevabınız: {r.userAnswer}
                        </div>
                      )}
                      {!r.correct && (
                        <div style={{ fontSize: 12, color: T.correct, marginTop: 2 }}>
                          Doğru: {r.question.correct_answer}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 700,
                        color: r.correct ? T.accent : T.wrong,
                      }}>
                        {r.correct ? `+${r.points}` : "0"}
                      </div>
                      {r.streak >= 3 && (
                        <div style={{ fontSize: 10, color: T.streak, fontWeight: 600 }}>
                          {r.streak >= 5 ? "×2" : "×1.5"}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Non-member CTA */}
            {!user && (
              <div style={{
                background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16,
                padding: "24px", marginBottom: 24, textAlign: "center",
              }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 6 }}>
                  Daha fazla quiz ve sanat içeriği için
                </div>
                <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.7, margin: "0 0 16px" }}>
                  Ücretsiz üye olun — rozetlerinizi kaydedin, liderlik tablosunda yerinizi alın.
                </p>
                <a
                  href="/club/giris"
                  style={{
                    display: "inline-block", background: T.accent, color: T.bg,
                    textDecoration: "none", fontSize: 15, fontWeight: 700,
                    padding: "14px 36px", borderRadius: 99,
                  }}
                >
                  Ücretsiz Üye Ol
                </a>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {selectedCategory && (
                <button
                  onClick={() => selectCategory(selectedCategory)}
                  style={{
                    width: "100%", background: T.accent, color: T.bg, border: "none", borderRadius: 12,
                    padding: "16px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    transition: `transform .2s ${ease}`,
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.transform = "translateY(0)"; }}
                >
                  Tekrar Oyna ({selectedCategory.title})
                </button>
              )}
              <button
                onClick={() => setPhase("intro")}
                style={{
                  width: "100%", background: "transparent", color: T.accent,
                  border: `1.5px solid rgba(201,168,76,0.4)`, borderRadius: 12,
                  padding: "16px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                  transition: `all .2s ${ease}`,
                }}
              >
                Başka Kategori Seç
              </button>
              <Link
                href="/testler"
                style={{
                  width: "100%", background: "transparent", color: T.muted,
                  border: `1px solid ${T.border}`, borderRadius: 12,
                  padding: "16px", fontSize: 14, fontWeight: 600, textDecoration: "none",
                  textAlign: "center", display: "block", boxSizing: "border-box",
                }}
              >
                Testlere Dön
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
