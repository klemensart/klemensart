"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { ROOMS, ROOM_COUNT, QUESTIONS_PER_ROOM, TOTAL_QUESTIONS } from "@/lib/leonardo/rooms";
import { DIALOGUES } from "@/lib/leonardo/dialogue";
import { calcPoints, getBadge, getRoomSummaries, formatTime, TIMER } from "@/lib/leonardo/scoring";
import type {
  Phase, LeonardoMood, SpriteAnimation, GameQuestion, AnswerResult, LeaderboardEntry,
} from "@/lib/leonardo/types";
import { getAnimationForPhase } from "@/lib/leonardo/sprite-config";
import SpriteCharacter from "@/components/leonardo/SpriteCharacter";
import DialogueBox from "@/components/leonardo/DialogueBox";
import ParallaxBackground from "@/components/leonardo/ParallaxBackground";
import SceneComposer from "@/components/leonardo/SceneComposer";
import SpritePreloader from "@/components/leonardo/SpritePreloader";

/* ── Tema: Rönesans Atölye ── */
const T = {
  bg: "#1a1714",
  bgCard: "#252220",
  bgWarm: "#2a2420",
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
  leonardo: "#D4A854",
};

const RING_R = 30;
const RING_CIRC = 2 * Math.PI * RING_R;
const DIGIT_H = 36;
const TYPEWRITER_MS = 28;

/* ── Motion Presets ── */
const fadeUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };
const fadeIn = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };
const scaleIn = { initial: { opacity: 0, scale: 0.92 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 } };
const slideRight = { initial: { opacity: 0, x: 60 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -40 } };
const spring = { type: "spring" as const, stiffness: 300, damping: 25 };

/**
 * Beklenen soru sırası — diyaloglarla (dialogue.ts) birebir eşleşir.
 * Her değer ilgili sorunun correct_answer alanıdır.
 */
const EXPECTED_ORDER = [
  "Mona Lisa",
  "Son Akşam Yemeği",
  "Gelincikli Kadın",
  "Vitruvius Adamı",
  "Kayalıklar Bakiresi",
  "Sfumato",
  "Chiaroscuro",
  "Atmosferik perspektif",
  "Filippo Brunelleschi",
  "Kuru sıva üzerine tempera ve yağlıboya karışımı",
  "Hem sanatsal hem bilimsel araştırma",
  "Gran Cavallo",
  "Sistematik anatomik diseksiyon",
  "8 baş",
  "Savaş sahneleri (Anghiari ve Cascina)",
  "Ornitopter",
  "Tank",
  "Solak olduğu için mürekkep bulaşmasını önlemek",
  "Kanal kapak (lock) sistemi",
  "Paraşüt",
  "7.000",
  "Fransa — I. François",
  "Polymath",
  "Bill Gates",
  "Francesco Melzi",
];

/* ── Helpers ── */
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

function SlotScore({ score, maxDigits = 5 }: { score: number; maxDigits?: number }) {
  const padded = String(Math.min(score, 10 ** maxDigits - 1)).padStart(maxDigits, "0");
  const digits = padded.split("").map(Number);
  const delays = digits.map((_, i) => (maxDigits - 1 - i) * 100);
  return (
    <div style={{ display: "flex", fontSize: 24, fontWeight: 800, color: T.accent, fontVariantNumeric: "tabular-nums" }}>
      {digits.map((d, i) => <SlotDigit key={i} digit={d} delay={delays[i]} />)}
    </div>
  );
}

/* ── Countdown Ring ── */
function CountdownRing({ timeLeft, total }: { timeLeft: number; total: number }) {
  const offset = RING_CIRC * (1 - timeLeft / total);
  const color = timeLeft > 12 ? T.correct : timeLeft > 6 ? "#f59e0b" : T.wrong;
  const pulse = timeLeft <= 5 && timeLeft > 0;
  return (
    <motion.div
      animate={pulse ? { scale: [1, 1.12, 1] } : { scale: 1 }}
      transition={pulse ? { duration: 0.5, repeat: Infinity } : {}}
      style={{ position: "relative", width: 72, height: 72 }}
    >
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
    </motion.div>
  );
}

/* ── Share Buttons ── */
function ShareButtons({ score, badge }: { score: number; badge: string }) {
  const [copied, setCopied] = useState(false);
  const text = `Leonardo'nun Atölyesi'nde ${score} puan alarak "${badge}" rozetini kazandım!`;
  const url = "https://klemensart.com/testler/leonardo-atolyesi";
  const btnStyle: React.CSSProperties = {
    flex: 1, padding: "12px 8px", borderRadius: 10, fontSize: 13, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit", border: `1px solid ${T.border}`,
    background: T.bgCard, color: T.text, transition: "all .2s ease",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
  };
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
      <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(text + "\n" + url)}`, "_blank")}
        style={{ ...btnStyle, color: "#25D366", borderColor: "rgba(37,211,102,0.3)" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
        WhatsApp
      </button>
      <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank")}
        style={{ ...btnStyle, color: "#1DA1F2", borderColor: "rgba(29,161,242,0.3)" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
        X
      </button>
      <button onClick={() => {
        navigator.clipboard.writeText(text + "\n" + url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
      }} style={{ ...btnStyle, color: copied ? T.correct : T.muted }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
        {copied ? "Kopyalandı!" : "Kopyala"}
      </button>
    </div>
  );
}

/* ── Mood → Sprite eşlemesi (küçük inline portrait yerine) ── */
function moodToAnimation(mood: LeonardoMood): SpriteAnimation {
  switch (mood) {
    case "happy": return "happy";
    case "thinking": return "thinking";
    case "sad": return "sad";
    default: return "idle";
  }
}

/* ── CSS Keyframes ── */
const ANIM_CSS = `
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes quillWrite {
  0%,100% { opacity: 1; }
  50% { opacity: 0; }
}
`;

/* ══════════════════════════════════════════════════════════════════════════════
   ANA BİLEŞEN
   ══════════════════════════════════════════════════════════════════════════════ */
export default function LeonardoAtolyesi() {
  /* ── Auth ── */
  const [user, setUser] = useState<User | null>(null);

  /* ── Game State ── */
  const [phase, setPhase] = useState<Phase>("loading");
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [currentRoom, setCurrentRoom] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [results, setResults] = useState<AnswerResult[]>([]);

  /* ── Question Phase ── */
  const [timeLeft, setTimeLeft] = useState(TIMER);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [showPointAnim, setShowPointAnim] = useState(false);

  /* ── Dialogue / Typewriter ── */
  const [dialogueText, setDialogueText] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [leonardoMood, setLeonardoMood] = useState<LeonardoMood>("neutral");

  /* ── Sprite Animasyon ── */
  const spriteAnim: SpriteAnimation = getAnimationForPhase(phase, {
    isTyping,
    hasArtwork: !!questions[currentQ]?.image_url,
    isCorrect,
  });

  /* ── Timing ── */
  const startTimeRef = useRef(0);
  const totalTimeRef = useRef(0);

  /* ── Result Phase ── */
  const savedRef = useRef(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [email, setEmail] = useState("");
  const [kvkkChecked, setKvkkChecked] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "done" | "error" | "registered">("idle");

  /* ── Mount ── */
  useEffect(() => { setPhase("intro"); }, []);
  useEffect(() => {
    try { const sb = createClient(); sb.auth.getUser().then(({ data }) => setUser(data.user ?? null)).catch(() => {}); } catch { /* */ }
  }, []);

  /* ── Prevent browser back ── */
  useEffect(() => {
    if (phase === "loading" || phase === "intro" || phase === "result") return;
    const handler = () => { window.history.pushState(null, "", window.location.href); };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [phase]);

  /* ── Typewriter ── */
  useEffect(() => {
    if (!dialogueText) { setDisplayedText(""); setIsTyping(false); return; }
    setDisplayedText("");
    setIsTyping(true);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayedText(dialogueText.slice(0, i));
      if (i >= dialogueText.length) { clearInterval(timer); setIsTyping(false); }
    }, TYPEWRITER_MS);
    return () => clearInterval(timer);
  }, [dialogueText]);

  /* ── Timer ── */
  useEffect(() => {
    if (phase !== "question" || selectedAnswer !== null) return;
    if (timeLeft <= 0) {
      setSelectedAnswer("__timeout__");
      setIsCorrect(false);
      setStreak(0);
      setResults(prev => [...prev, {
        questionIndex: currentQ, correct: false, userAnswer: "__timeout__",
        points: 0, streak: 0, timeLeft: 0, roomIndex: currentRoom,
      }]);
      setLeonardoMood("sad");
      const d = DIALOGUES[currentQ];
      if (d) setDialogueText(d.post.wrong);
      return;
    }
    const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase, selectedAnswer, currentQ, currentRoom]);

  /* ── Fetch questions ── */
  const startGame = useCallback(async () => {
    setPhase("loading");
    try {
      const res = await fetch(`/api/trivia/questions?category=leonardo-atolyesi&limit=25`);
      const data = await res.json();
      const raw = data.questions ?? [];
      if (raw.length < TOTAL_QUESTIONS) {
        alert("Yeterli soru bulunamadı. Lütfen daha sonra tekrar deneyin.");
        setPhase("intro");
        return;
      }
      // Soruları diyalog sırasına göre sırala (correct_answer eşlemesiyle)
      const sorted = [...raw].sort((a: GameQuestion, b: GameQuestion) => {
        const idxA = EXPECTED_ORDER.indexOf(a.correct_answer);
        const idxB = EXPECTED_ORDER.indexOf(b.correct_answer);
        return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
      });
      const prepared: GameQuestion[] = sorted.map((q: GameQuestion, i: number) => ({
        ...q,
        options: typeof q.options === "string" ? JSON.parse(q.options as string) : q.options,
        roomIndex: Math.floor(i / QUESTIONS_PER_ROOM),
        localIndex: i % QUESTIONS_PER_ROOM,
      }));
      setQuestions(prepared);
      setCurrentQ(0);
      setCurrentRoom(0);
      setTotalScore(0);
      setStreak(0);
      setResults([]);
      setSelectedAnswer(null);
      setIsCorrect(null);
      savedRef.current = false;
      startTimeRef.current = Date.now();
      setLeonardoMood("neutral");
      setPhase("room-intro");
    } catch {
      alert("Sorular yüklenemedi.");
      setPhase("intro");
    }
  }, []);

  /* ── Handle answer ── */
  const handleAnswer = useCallback((answer: string) => {
    if (selectedAnswer !== null || phase !== "question") return;
    const q = questions[currentQ];
    if (!q) return;
    const correct = answer === q.correct_answer;
    const newStreak = correct ? streak + 1 : 0;
    const pts = correct ? calcPoints(timeLeft, newStreak, currentRoom) : 0;
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    setStreak(newStreak);
    if (correct) {
      setTotalScore(prev => prev + pts);
      setEarnedPoints(pts);
      setShowPointAnim(true);
      setTimeout(() => setShowPointAnim(false), 1200);
    }
    setResults(prev => [...prev, {
      questionIndex: currentQ, correct, userAnswer: answer,
      points: pts, streak: newStreak, timeLeft, roomIndex: currentRoom,
    }]);
    setLeonardoMood(correct ? "happy" : "sad");
    const d = DIALOGUES[currentQ];
    if (d) setDialogueText(correct ? d.post.correct : d.post.wrong);
  }, [selectedAnswer, phase, questions, currentQ, streak, timeLeft, currentRoom]);

  /* ── Navigation ── */
  const goToQuestion = useCallback((qIndex: number) => {
    setCurrentQ(qIndex);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setTimeLeft(TIMER);
    setShuffledOptions(shuffle(questions[qIndex]?.options ?? []));
    setLeonardoMood("thinking");
    const d = DIALOGUES[qIndex];
    if (d) setDialogueText(d.pre);
    setPhase("dialogue");
  }, [questions]);

  const advance = useCallback(() => {
    const nextQ = currentQ + 1;
    if (nextQ % QUESTIONS_PER_ROOM === 0) { setPhase("room-complete"); return; }
    goToQuestion(nextQ);
  }, [currentQ, goToQuestion]);

  const goToNextRoom = useCallback(() => {
    const nextRoom = currentRoom + 1;
    if (nextRoom >= ROOM_COUNT) {
      totalTimeRef.current = Math.round((Date.now() - startTimeRef.current) / 1000);
      setPhase("result");
      return;
    }
    setCurrentRoom(nextRoom);
    setPhase("room-transition");
    setTimeout(() => setPhase("room-intro"), 1800);
  }, [currentRoom]);

  const startRoomQuestions = useCallback(() => {
    goToQuestion(currentRoom * QUESTIONS_PER_ROOM);
  }, [currentRoom, goToQuestion]);

  const proceedFromDialogue = useCallback(() => {
    if (isTyping) { setDisplayedText(dialogueText); setIsTyping(false); return; }
    setShuffledOptions(shuffle(questions[currentQ]?.options ?? []));
    setTimeLeft(TIMER);
    setPhase("question");
  }, [isTyping, dialogueText, questions, currentQ]);

  const proceedFromReaction = useCallback(() => {
    if (isTyping) { setDisplayedText(dialogueText); setIsTyping(false); return; }
    advance();
  }, [isTyping, dialogueText, advance]);

  /* ── Save results ── */
  useEffect(() => {
    if (phase !== "result" || savedRef.current) return;
    savedRef.current = true;
    const b = getBadge(totalScore);
    const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Anonim";
    fetch("/api/quiz/results", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score: totalScore, badge: b.name, time_seconds: totalTimeRef.current || null, mode: "timed", display_name: displayName, quiz_slug: "leonardo-atolyesi" }),
    }).catch(() => {});
    if (user) {
      fetch("/api/quiz/results?slug=leonardo-atolyesi&limit=10").then(r => r.json()).then(d => setLeaderboard(d.results ?? [])).catch(() => {});
    }
  }, [phase, totalScore, user]);

  /* ── Email submit ── */
  const handleEmailSubmit = useCallback(async () => {
    if (!email.trim() || !kvkkChecked) return;
    setEmailStatus("sending");
    try {
      const b = getBadge(totalScore);
      const res = await fetch("/api/quiz/send-results", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(), score: totalScore, badge: b.name,
          time_seconds: totalTimeRef.current, quiz_slug: "leonardo-atolyesi", quiz_title: "Leonardo'nun Atölyesi",
          results: results.map(r => {
            const q = questions[r.questionIndex];
            return { question: q?.question ?? "", correctAnswer: q?.correct_answer ?? "", userAnswer: r.userAnswer, correct: r.correct, points: r.points, funFact: q?.fun_fact ?? null };
          }),
        }),
      });
      const data = await res.json();
      setEmailStatus(data.registered ? "registered" : "done");
      fetch("/api/quiz/results?slug=leonardo-atolyesi&limit=10").then(r => r.json()).then(d => setLeaderboard(d.results ?? [])).catch(() => {});
    } catch { setEmailStatus("error"); }
  }, [email, kvkkChecked, totalScore, results, questions]);

  /* ── Convenience ── */
  const room = ROOMS[currentRoom];
  const question = questions[currentQ];
  const badge = getBadge(totalScore);
  const roomSummaries = getRoomSummaries(results);

  const cardStyle: React.CSSProperties = {
    background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24,
  };

  /* ══════════════════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div style={{
      minHeight: "100dvh", background: T.bg, color: T.text,
      fontFamily: "system-ui, -apple-system, sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <style dangerouslySetInnerHTML={{ __html: ANIM_CSS }} />

      <AnimatePresence mode="wait">

        {/* ═══ LOADING ═══ */}
        {phase === "loading" && (
          <motion.div key="loading" {...fadeIn} transition={{ duration: 0.3 }}>
            <SpritePreloader onComplete={() => {}} minDisplayMs={400} />
          </motion.div>
        )}

        {/* ═══ INTRO ═══ */}
        {phase === "intro" && (
          <motion.div key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ParallaxBackground roomIndex={0}>
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", minHeight: "100dvh", padding: "24px 16px",
              }}>
                <div style={{ textAlign: "center", maxWidth: 480 }}>
                  {/* Leonardo karakter — greeting animasyonu */}
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                    style={{ marginBottom: 24, display: "flex", justifyContent: "center" }}
                  >
                    <SpriteCharacter animation="greeting" width={160} height={240} />
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    style={{ fontSize: 30, fontWeight: 800, color: T.accent, marginBottom: 8, letterSpacing: "-0.5px" }}
                  >
                    Leonardo&apos;nun Atölyesi
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    style={{ color: T.textSec, fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}
                  >
                    Rönesans dehasının atölyesinde 5 oda, 25 soru.
                    Her oda yeni bir macera, her soru Leonardo&apos;yla bir diyalog.
                  </motion.p>

                  {/* Room preview cards */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
                    {ROOMS.map((r, i) => (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + i * 0.1, type: "spring", stiffness: 200, damping: 20 }}
                        style={{
                          ...cardStyle, padding: "12px 16px",
                          display: "flex", alignItems: "center", gap: 12,
                        }}
                      >
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: T.accentBg, display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: 14, fontWeight: 700, color: T.accent,
                          flexShrink: 0,
                        }}>
                          {i + 1}
                        </div>
                        <div style={{ textAlign: "left" }}>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{r.title}</div>
                          <div style={{ fontSize: 12, color: T.muted }}>{r.theme} · ×{r.multiplier}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3, duration: 0.5 }}
                    whileHover={{ scale: 1.03, boxShadow: `0 8px 30px ${T.accent}44` }}
                    whileTap={{ scale: 0.97 }}
                    onClick={startGame}
                    style={{
                      width: "100%", padding: "16px 24px", borderRadius: 14,
                      background: `linear-gradient(135deg, ${T.accent}, #b8952e)`,
                      color: "#1a1714", fontSize: 16, fontWeight: 700, cursor: "pointer",
                      border: "none", fontFamily: "inherit",
                    }}
                  >
                    Atölyeye Gir
                  </motion.button>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
                    <Link href="/testler" style={{ display: "block", marginTop: 16, color: T.muted, fontSize: 13, textDecoration: "none" }}>
                      ← Tüm Testler
                    </Link>
                  </motion.div>
                </div>
              </div>
            </ParallaxBackground>
          </motion.div>
        )}

        {/* ═══ ROOM INTRO ═══ */}
        {phase === "room-intro" && room && (
          <motion.div key={`room-intro-${currentRoom}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <SceneComposer
              roomIndex={currentRoom}
              bgImage={room.bgImage}
              animation="idle"
              characterScale={0.6}
            >
              {/* Room number large background */}
              <motion.div
                initial={{ scale: 3, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.06 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{
                  position: "absolute", fontSize: 300, fontWeight: 900,
                  color: T.accent, userSelect: "none", pointerEvents: "none",
                  top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                  zIndex: 0,
                }}
              >
                {currentRoom + 1}
              </motion.div>

              <div style={{ textAlign: "center" }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                  style={{
                    fontSize: 12, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: 3, color: T.accent, marginBottom: 12,
                    display: "inline-block", padding: "6px 16px", borderRadius: 20,
                    background: T.accentBg, border: `1px solid ${T.accent}33`,
                  }}
                >
                  Oda {currentRoom + 1} / {ROOM_COUNT}
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                  style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}
                >
                  {room.title}
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  style={{ height: 2, background: `linear-gradient(90deg, transparent, ${T.accent}, transparent)`, marginBottom: 16, borderRadius: 1 }}
                />

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  style={{ fontSize: 13, color: T.accent, fontWeight: 600, marginBottom: 16 }}
                >
                  {room.theme} · Çarpan ×{room.multiplier}
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  style={{ color: T.textSec, fontSize: 14, lineHeight: 1.7, marginBottom: 32, maxWidth: 400, marginInline: "auto" }}
                >
                  {room.description}
                </motion.p>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={startRoomQuestions}
                  style={{
                    padding: "14px 32px", borderRadius: 12,
                    background: `linear-gradient(135deg, ${T.accent}, #b8952e)`,
                    color: "#1a1714", fontSize: 15, fontWeight: 700, cursor: "pointer",
                    border: "none", fontFamily: "inherit",
                  }}
                >
                  Keşfetmeye Başla
                </motion.button>
              </div>
            </SceneComposer>
          </motion.div>
        )}

        {/* ═══ DIALOGUE (pre-question Leonardo talks) ═══ */}
        {phase === "dialogue" && (
          <motion.div key={`dialogue-${currentQ}`}
            {...fadeIn} transition={{ duration: 0.5 }}
          >
            <ParallaxBackground roomIndex={currentRoom} bgImage={room?.bgImage}>
              <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh", padding: "24px 16px" }}>
                {/* Top bar */}
                <motion.div {...fadeUp} transition={{ delay: 0.1 }}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, fontSize: 12, color: T.muted }}>
                  <span>Oda {currentRoom + 1}: {room?.title}</span>
                  <span>Soru {(currentQ % QUESTIONS_PER_ROOM) + 1}/{QUESTIONS_PER_ROOM}</span>
                </motion.div>

                {/* Score */}
                <motion.div {...fadeUp} transition={{ delay: 0.15 }}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <SlotScore score={totalScore} />
                  {streak >= 3 && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring}
                      style={{ padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: "rgba(168,85,247,0.12)", color: "#a855f7" }}>
                      🔥 {streak} seri · ×{streak >= 5 ? "2" : "1.5"}
                    </motion.div>
                  )}
                </motion.div>

                {/* Leonardo + dialogue */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    style={{ display: "flex", alignItems: "flex-end", gap: 12 }}
                  >
                    <SpriteCharacter animation={spriteAnim} width={120} height={180} />
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.leonardo, marginBottom: 8 }}>Leonardo da Vinci</div>
                  </motion.div>

                  <DialogueBox
                    displayedText={displayedText}
                    isTyping={isTyping}
                    onClick={proceedFromDialogue}
                    showContinue
                  />

                  {/* Artwork preview */}
                  {question?.image_url && (
                    <motion.div
                      initial={{ opacity: 0, y: 40, rotateX: 10 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{ delay: 0.6, duration: 0.7, ease: "easeOut" }}
                      style={{
                        ...cardStyle, padding: 0, overflow: "hidden",
                        boxShadow: `0 8px 30px rgba(0,0,0,0.4), inset 0 0 0 1px ${T.accent}22`,
                      }}
                    >
                      <div style={{ position: "relative", width: "100%", aspectRatio: "16/10" }}>
                        <Image src={question.image_url} alt="Eser" fill style={{ objectFit: "cover" }} unoptimized />
                        {/* Shimmer overlay */}
                        <div style={{
                          position: "absolute", inset: 0,
                          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)",
                          backgroundSize: "200% 100%",
                          animation: "shimmer 3s ease-in-out infinite",
                        }} />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </ParallaxBackground>
          </motion.div>
        )}

        {/* ═══ QUESTION ═══ */}
        {phase === "question" && question && (
          <motion.div key={`question-${currentQ}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
          <ParallaxBackground roomIndex={currentRoom} bgImage={room?.bgImage}>
          <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh", padding: "24px 16px" }}>
            {/* Top bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, fontSize: 12, color: T.muted }}>
              <span>Oda {currentRoom + 1}: {room?.title}</span>
              <span>{currentQ + 1} / {TOTAL_QUESTIONS}</span>
            </div>

            {/* Score + timer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ position: "relative" }}>
                <SlotScore score={totalScore} />
                <AnimatePresence>
                  {showPointAnim && (
                    <motion.div
                      initial={{ opacity: 1, y: 0 }}
                      animate={{ opacity: 0, y: -30 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1 }}
                      style={{ position: "absolute", top: -8, right: -50, color: T.correct, fontSize: 14, fontWeight: 700 }}
                    >
                      +{earnedPoints}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {streak >= 3 && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring}
                    style={{ padding: "4px 8px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: "rgba(168,85,247,0.12)", color: "#a855f7" }}>
                    🔥 ×{streak >= 5 ? "2" : "1.5"}
                  </motion.div>
                )}
                <CountdownRing timeLeft={timeLeft} total={TIMER} />
              </div>
            </div>

            {/* Question card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ ...cardStyle, marginBottom: 16 }}
            >
              {question.image_url && (
                <div style={{ position: "relative", width: "100%", aspectRatio: "16/10", borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
                  <Image src={question.image_url} alt="Soru görseli" fill style={{ objectFit: "cover" }} unoptimized />
                </div>
              )}
              <h3 style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.5, margin: 0 }}>
                {question.question}
              </h3>
            </motion.div>

            {/* Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
              {shuffledOptions.map((opt, i) => {
                const isSelected = selectedAnswer === opt;
                const isCorrectOpt = opt === question.correct_answer;
                const answered = selectedAnswer !== null;

                let bg = T.bgCard;
                let borderColor = T.border;
                let textColor = T.text;
                if (answered) {
                  if (isCorrectOpt) { bg = T.correctBg; borderColor = T.correct; textColor = T.correct; }
                  else if (isSelected && !isCorrectOpt) { bg = T.wrongBg; borderColor = T.wrong; textColor = T.wrong; }
                  else { textColor = T.muted; }
                }

                return (
                  <motion.button
                    key={opt}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 300, damping: 25 }}
                    whileHover={!answered ? { scale: 1.02, x: 4 } : {}}
                    whileTap={!answered ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswer(opt)}
                    disabled={answered}
                    style={{
                      padding: "14px 16px", borderRadius: 12,
                      background: bg, border: `1.5px solid ${borderColor}`,
                      color: textColor, fontSize: 14, fontWeight: 600,
                      cursor: answered ? "default" : "pointer",
                      fontFamily: "inherit", textAlign: "left",
                      transition: "background .3s, border-color .3s, color .3s",
                      display: "flex", alignItems: "center", gap: 10,
                    }}
                  >
                    <motion.span
                      animate={answered && isCorrectOpt ? { scale: [1, 1.3, 1] } : answered && isSelected && !isCorrectOpt ? { x: [0, -3, 3, -3, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: answered && isCorrectOpt ? T.correct : answered && isSelected ? T.wrong : T.accentBg,
                        color: answered && (isCorrectOpt || isSelected) ? "#fff" : T.accent,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 700, flexShrink: 0, transition: "all .3s",
                      }}
                    >
                      {answered && isCorrectOpt ? "✓" : answered && isSelected ? "✗" : String.fromCharCode(65 + i)}
                    </motion.span>
                    {opt}
                  </motion.button>
                );
              })}
            </div>

            {/* Post-answer: reaction + fun fact + next */}
            <AnimatePresence>
              {selectedAnswer !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
                  style={{ marginTop: 16 }}
                >
                  {question.fun_fact && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                      style={{
                        ...cardStyle, padding: "12px 16px", marginBottom: 12,
                        borderColor: T.accent, background: T.accentBg, overflow: "hidden",
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>
                        Biliyor muydunuz?
                      </div>
                      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: T.textSec }}>{question.fun_fact}</p>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}
                  >
                    <SpriteCharacter animation={moodToAnimation(leonardoMood)} width={60} height={90} />
                    <div style={{ flex: 1 }}>
                      <DialogueBox
                        displayedText={displayedText}
                        isTyping={isTyping}
                        variant={isCorrect ? "correct" : "wrong"}
                      />
                    </div>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={proceedFromReaction}
                    style={{
                      width: "100%", padding: "14px 24px", borderRadius: 12,
                      background: `linear-gradient(135deg, ${T.accent}, #b8952e)`,
                      color: "#1a1714", fontSize: 15, fontWeight: 700, cursor: "pointer",
                      border: "none", fontFamily: "inherit",
                    }}
                  >
                    {isTyping ? "Atla" : "Devam →"}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          </ParallaxBackground>
          </motion.div>
        )}

        {/* ═══ ROOM COMPLETE ═══ */}
        {phase === "room-complete" && room && (
          <motion.div key={`room-complete-${currentRoom}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
          <ParallaxBackground roomIndex={currentRoom} bgImage={room.bgImage}>
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", minHeight: "100dvh", padding: "24px 16px",
            }}>
            <div style={{ textAlign: "center", maxWidth: 440 }}>
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                style={{ display: "flex", justifyContent: "center" }}
              >
                <SpriteCharacter animation="happy" width={120} height={180} />
              </motion.div>

              <motion.h2 {...fadeUp} transition={{ delay: 0.3 }}
                style={{ fontSize: 22, fontWeight: 800, marginTop: 16, marginBottom: 8 }}>
                {room.title} Tamamlandı!
              </motion.h2>

              <motion.div {...fadeUp} transition={{ delay: 0.5 }}>
                {(() => {
                  const summary = roomSummaries[currentRoom];
                  return (
                    <div style={{ ...cardStyle, marginBottom: 24, textAlign: "left" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ color: T.muted, fontSize: 13 }}>Doğru</span>
                        <span style={{ color: T.correct, fontWeight: 700 }}>{summary?.correct ?? 0}/{QUESTIONS_PER_ROOM}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ color: T.muted, fontSize: 13 }}>Oda Puanı</span>
                        <span style={{ color: T.accent, fontWeight: 700 }}>{summary?.points ?? 0}</span>
                      </div>
                      {/* Progress bar */}
                      <div style={{ height: 6, borderRadius: 3, background: T.border, marginTop: 8, overflow: "hidden" }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${((summary?.correct ?? 0) / QUESTIONS_PER_ROOM) * 100}%` }}
                          transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                          style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${T.accent}, ${T.correct})` }}
                        />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                        <span style={{ color: T.muted, fontSize: 13 }}>Toplam Puan</span>
                        <span style={{ color: T.accent, fontWeight: 700 }}>{totalScore}</span>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={goToNextRoom}
                style={{
                  width: "100%", padding: "14px 24px", borderRadius: 12,
                  background: `linear-gradient(135deg, ${T.accent}, #b8952e)`,
                  color: "#1a1714", fontSize: 15, fontWeight: 700, cursor: "pointer",
                  border: "none", fontFamily: "inherit",
                }}
              >
                {currentRoom + 1 < ROOM_COUNT ? `Sonraki Oda: ${ROOMS[currentRoom + 1]?.title} →` : "Sonuçları Gör"}
              </motion.button>
            </div>
            </div>
          </ParallaxBackground>
          </motion.div>
        )}

        {/* ═══ ROOM TRANSITION (fade to black) ═══ */}
        {phase === "room-transition" && (
          <motion.div key="room-transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", minHeight: "100dvh", background: "#000",
            }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              style={{ width: 40, height: 40, border: `3px solid ${T.border}`, borderTop: `3px solid ${T.accent}`, borderRadius: "50%" }}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}
              style={{ color: T.muted, fontSize: 13, marginTop: 16 }}
            >
              Sonraki odaya geçiliyor...
            </motion.p>
          </motion.div>
        )}

        {/* ═══ RESULT ═══ */}
        {phase === "result" && (
          <motion.div key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 16px", minHeight: "100dvh" }}
          >
            <div style={{ maxWidth: 480, width: "100%" }}>

              {/* Badge celebration with Leonardo */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
                style={{ textAlign: "center", marginBottom: 24 }}
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}
                >
                  <SpriteCharacter animation="happy" width={140} height={210} />
                </motion.div>
                <div style={{ fontSize: 48, marginBottom: 8 }}>{badge.emoji}</div>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: T.accent, marginBottom: 4 }}>{badge.name}</h2>
                <p style={{ fontSize: 14, color: T.textSec }}>{badge.description}</p>
              </motion.div>

              {/* Score card */}
              <motion.div {...fadeUp} transition={{ delay: 0.5 }}
                style={{ ...cardStyle, textAlign: "center", marginBottom: 16, background: `linear-gradient(135deg, ${T.bgCard}, ${T.bgWarm})` }}>
                <div style={{ fontSize: 12, color: T.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Toplam Puan</div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <SlotScore score={totalScore} />
                </div>
                {totalTimeRef.current > 0 && (
                  <div style={{ fontSize: 13, color: T.muted, marginTop: 8 }}>Süre: {formatTime(totalTimeRef.current)}</div>
                )}
              </motion.div>

              {/* Room summaries */}
              <motion.div {...fadeUp} transition={{ delay: 0.7 }} style={{ ...cardStyle, marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: T.accent }}>Oda Özetleri</h3>
                {roomSummaries.map((s, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0",
                      borderBottom: i < ROOM_COUNT - 1 ? `1px solid ${T.border}` : "none",
                    }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{ROOMS[i]?.title}</div>
                      <div style={{ fontSize: 11, color: T.muted }}>{ROOMS[i]?.theme}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.accent }}>{s.points} pt</div>
                      <div style={{ fontSize: 11, color: s.correct >= 4 ? T.correct : s.correct >= 2 ? "#f59e0b" : T.wrong }}>
                        {s.correct}/{s.total} doğru
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Share */}
              <motion.div {...fadeUp} transition={{ delay: 1 }}>
                <ShareButtons score={totalScore} badge={badge.name} />
              </motion.div>

              {/* Leaderboard */}
              {(user || emailStatus === "done" || emailStatus === "registered") && leaderboard.length > 0 && (
                <motion.div {...fadeUp} transition={{ delay: 1.1 }} style={{ ...cardStyle, marginBottom: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: T.accent }}>🏆 Liderlik Tablosu</h3>
                  {leaderboard.map((entry, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                      borderBottom: i < leaderboard.length - 1 ? `1px solid ${T.border}` : "none",
                    }}>
                      <span style={{
                        width: 24, height: 24, borderRadius: 6,
                        background: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : T.bgCard,
                        color: i < 3 ? "#1a1714" : T.muted,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700, flexShrink: 0,
                      }}>{i + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.display_name}</div>
                        <div style={{ fontSize: 11, color: T.muted }}>{entry.badge} {entry.time_seconds ? `· ${formatTime(entry.time_seconds)}` : ""}</div>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: T.accent }}>{entry.score}</span>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Email form */}
              {!user && emailStatus !== "done" && emailStatus !== "registered" && (
                <motion.div {...fadeUp} transition={{ delay: 1.2 }} style={{ ...cardStyle, marginBottom: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Sonuçlarınızı kaydedin</h3>
                  <p style={{ fontSize: 12, color: T.muted, marginBottom: 12 }}>E-posta adresinizi girin, liderlik tablosuna katılın.</p>
                  <input type="email" placeholder="ornek@email.com" value={email} onChange={e => setEmail(e.target.value)}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, color: T.text, fontSize: 14, fontFamily: "inherit", marginBottom: 8, boxSizing: "border-box" }} />
                  <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 11, color: T.muted, marginBottom: 12, cursor: "pointer" }}>
                    <input type="checkbox" checked={kvkkChecked} onChange={e => setKvkkChecked(e.target.checked)} style={{ marginTop: 2 }} />
                    <span><Link href="/kvkk" style={{ color: T.accent, textDecoration: "underline" }}>KVKK Aydınlatma Metni</Link>&apos;ni okudum ve kabul ediyorum.</span>
                  </label>
                  <button onClick={handleEmailSubmit} disabled={!email.trim() || !kvkkChecked || emailStatus === "sending"}
                    style={{ width: "100%", padding: "12px 24px", borderRadius: 10, background: email.trim() && kvkkChecked ? T.accent : T.border, color: email.trim() && kvkkChecked ? "#1a1714" : T.muted, fontSize: 14, fontWeight: 700, cursor: email.trim() && kvkkChecked ? "pointer" : "not-allowed", border: "none", fontFamily: "inherit" }}>
                    {emailStatus === "sending" ? "Gönderiliyor..." : "Kaydet ve Gönder"}
                  </button>
                  {emailStatus === "error" && <p style={{ color: T.wrong, fontSize: 12, marginTop: 8 }}>Bir hata oluştu.</p>}
                </motion.div>
              )}
              {emailStatus === "registered" && (
                <div style={{ ...cardStyle, marginBottom: 16, borderColor: T.correct }}>
                  <p style={{ margin: 0, fontSize: 13, color: T.correct }}>✓ Zaten kayıtlısınız! Sonuçlarınız güncellendi.</p>
                </div>
              )}
              {emailStatus === "done" && (
                <div style={{ ...cardStyle, marginBottom: 16, borderColor: T.correct }}>
                  <p style={{ margin: 0, fontSize: 13, color: T.correct }}>✓ Sonuçlarınız e-posta adresinize gönderildi!</p>
                </div>
              )}

              {/* Question review */}
              <motion.div {...fadeUp} transition={{ delay: 1.3 }} style={{ ...cardStyle, marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: T.accent }}>Soru Detayları</h3>
                {results.map((r, i) => {
                  const q = questions[r.questionIndex];
                  if (!q) return null;
                  return (
                    <div key={i} style={{ padding: "10px 0", borderBottom: i < results.length - 1 ? `1px solid ${T.border}` : "none" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <span style={{
                          width: 20, height: 20, borderRadius: 6,
                          background: r.correct ? T.correctBg : T.wrongBg,
                          color: r.correct ? T.correct : T.wrong,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 2,
                        }}>{r.correct ? "✓" : "✗"}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>{q.question}</p>
                          {!r.correct && <p style={{ margin: "4px 0 0", fontSize: 11, color: T.correct }}>Doğru: {q.correct_answer}</p>}
                          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{r.points > 0 ? `+${r.points} puan` : "0 puan"}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>

              {/* Action buttons */}
              <motion.div {...fadeUp} transition={{ delay: 1.4 }} style={{ display: "flex", gap: 10, marginBottom: 32 }}>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { savedRef.current = false; setPhase("intro"); }}
                  style={{
                    flex: 1, padding: "14px 16px", borderRadius: 12,
                    background: `linear-gradient(135deg, ${T.accent}, #b8952e)`,
                    color: "#1a1714", fontSize: 14, fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "inherit",
                  }}>
                  Tekrar Oyna
                </motion.button>
                <Link href="/testler" style={{
                  flex: 1, padding: "14px 16px", borderRadius: 12,
                  background: T.bgCard, border: `1px solid ${T.border}`,
                  color: T.text, fontSize: 14, fontWeight: 700,
                  textDecoration: "none", textAlign: "center",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  Tüm Testler
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
