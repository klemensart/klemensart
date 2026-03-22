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
  workshop: "#E87461",
  workshopBg: "rgba(232,116,97,0.12)",
};

const ease = "cubic-bezier(.4,0,.2,1)";
const TIMER_SECONDS = 15;
const QUIZ_SLUG = "modern-sanat-quiz";
const QUIZ_TITLE = "Modern Sanat Quizi";

/* ── Veri Modeli ── */
type QuizItem = {
  id: number;
  image: string;
  title: string;
  artist: string;
  year: string;
  info: string;
  questionType: "artist" | "title" | "movement";
  question: string;
  correctAnswer: string;
  options: string[];
  hint: string;
};

type ResultRow = { item: QuizItem; correct: boolean; hintUsed: boolean; userAnswer: string };
type LeaderboardEntry = {
  display_name: string;
  score: number;
  badge: string;
  mode: string;
  time_seconds: number | null;
  created_at: string;
};

/* ── 10 Soru — Modern Sanat ── */
const ITEMS: QuizItem[] = [
  {
    id: 1,
    image: "/images/testler/modern-sanat/grande-jatte.webp",
    title: "La Grande Jatte Adasında Bir Pazar Öğleden Sonrası",
    artist: "Georges Seurat",
    year: "1884–1886",
    info: "Neo-Empresyonizm akımının kurucusu Seurat, bu devasa tabloyu iki yılda tamamlamıştır. Tuval üzerine binlerce küçük renk noktası (pointilizm) yerleştirerek ışık ve renk teorisini bilimsel olarak uygulamıştır. Chicago Sanat Enstitüsü'ndedir.",
    questionType: "artist",
    question: "Noktacılık (Pointilizm) tekniğiyle yapılmış bu tabloyu kim resmetmiştir?",
    correctAnswer: "Georges Seurat",
    options: ["Georges Seurat", "Claude Monet", "Pierre-Auguste Renoir", "Camille Pissarro"],
    hint: "Bu sanatçı, tuval üzerine binlerce küçük renk noktası yerleştirerek yeni bir teknik geliştirmiştir.",
  },
  {
    id: 2,
    image: "/images/testler/modern-sanat/munch-madonna.webp",
    title: "Madonna",
    artist: "Edvard Munch",
    year: "1894–1895",
    info: "Munch'un 'Yaşam Frizi' serisinin bir parçası olan bu eser, aşk, ölüm ve varoluş temalarını ele alır. Çığlık kadar ünlü olmasa da, Munch'un en güçlü eserlerinden biridir. Oslo Munch Müzesi'ndedir.",
    questionType: "artist",
    question: "Çığlık tablosunun da sanatçısı olan bu eseri kim yapmıştır?",
    correctAnswer: "Edvard Munch",
    options: ["Edvard Munch", "Ernst Ludwig Kirchner", "Egon Schiele", "Emil Nolde"],
    hint: "Norveçli bu sanatçı, insanın varoluşsal kaygılarını tablolarına yansıtmasıyla bilinir.",
  },
  {
    id: 3,
    image: "/images/testler/modern-sanat/klimt-adele.webp",
    title: "Adele Bloch-Bauer I Portresi",
    artist: "Gustav Klimt",
    year: "1907",
    info: "'Altın Adele' olarak da bilinen bu portre, II. Dünya Savaşı'nda Naziler tarafından çalınmış ve 2006'da Maria Altmann'a iade edilmiştir. 135 milyon dolara satılarak o dönemin en pahalı tablosu olmuştur. New York Neue Galerie'dedir.",
    questionType: "artist",
    question: "2006'da 135 milyon dolara satılan bu altın yaldızlı portre kime aittir?",
    correctAnswer: "Gustav Klimt",
    options: ["Gustav Klimt", "Egon Schiele", "Alphonse Mucha", "Koloman Moser"],
    hint: "Viyana Secession hareketinin lideri olan bu Avusturyalı sanatçı, altın varak kullanımıyla tanınır.",
  },
  {
    id: 4,
    image: "/images/testler/modern-sanat/kandinsky-kompozisyon.webp",
    title: "Kompozisyon VIII",
    artist: "Wassily Kandinsky",
    year: "1923",
    info: "Kandinsky, figüratif olmayan saf soyut resmin ilk örneklerini veren sanatçı olarak kabul edilir. 'Sanatta Ruhanilik Üzerine' kitabı modern sanatın manifestolarından biridir. Bu eser Guggenheim Müzesi'ndedir.",
    questionType: "artist",
    question: "Soyut sanatın öncüsü olarak kabul edilen bu eserin sanatçısı kimdir?",
    correctAnswer: "Wassily Kandinsky",
    options: ["Wassily Kandinsky", "Piet Mondrian", "Kazimir Malevich", "Paul Klee"],
    hint: "Rus asıllı bu sanatçı, müzik ve resim arasındaki ilişkiyi araştırmış, Bauhaus'ta ders vermiştir.",
  },
  {
    id: 5,
    image: "/images/testler/modern-sanat/malevich-kare.webp",
    title: "Siyah Kare",
    artist: "Kazimir Malevich",
    year: "1915",
    info: "1915'te sergilenen bu eser, sanatı nesnel dünyadan tamamen koparan bir manifesto niteliğindedir. Malevich, bu tabloyu 'resmin sıfır noktası' olarak adlandırmıştır. Tretyakov Galerisi'ndedir.",
    questionType: "artist",
    question: "Sanat tarihinin en radikal eserlerinden biri olan 'Siyah Kare'yi kim yapmıştır?",
    correctAnswer: "Kazimir Malevich",
    options: ["Kazimir Malevich", "Piet Mondrian", "El Lissitzky", "Alexander Rodchenko"],
    hint: "Süprematizm akımının kurucusu olan bu sanatçı, 'saf duygunun üstünlüğü' ilkesini savunmuştur.",
  },
  {
    id: 6,
    image: "/images/testler/modern-sanat/klee-senecio.webp",
    title: "Senecio",
    artist: "Paul Klee",
    year: "1922",
    info: "Bauhaus'ta ders veren Klee, çocuksu bir sadelikle derin felsefi temaları birleştirmiştir. 'Senecio' (yaşlı adam), bir tiyatro maskesini andıran geometrik bir portredir. Basel Kunstmuseum'dadır.",
    questionType: "artist",
    question: "Bu renkli ve geometrik portre kime aittir?",
    correctAnswer: "Paul Klee",
    options: ["Paul Klee", "Joan Miró", "Wassily Kandinsky", "Henri Matisse"],
    hint: "'Çizim, gezintiye çıkan bir çizgidir' sözüyle bilinen İsviçreli-Alman sanatçı.",
  },
  {
    id: 7,
    image: "/images/testler/modern-sanat/matisse-dans.webp",
    title: "Dans (La Danse)",
    artist: "Henri Matisse",
    year: "1910",
    info: "Rus koleksiyoner Sergei Shchukin için yapılan bu tablo, beş dans eden figürün ilkel enerji ve hareket duygusunu yakalayan, modern sanatın simgelerinden biridir. St. Petersburg Hermitage Müzesi'ndedir.",
    questionType: "title",
    question: "Fovizm akımının öncüsü Matisse'e ait bu ünlü tablonun adı nedir?",
    correctAnswer: "Dans (La Danse)",
    options: ["Dans (La Danse)", "Yaşam Sevinci", "Kırmızı Oda", "Lüks, Sakinlik ve Haz"],
    hint: "Beş insan figürü bir daire oluşturarak hareket etmektedir.",
  },
  {
    id: 8,
    image: "/images/testler/modern-sanat/schiele-kucaklasma.webp",
    title: "Kucaklaşma (Sevgililer)",
    artist: "Egon Schiele",
    year: "1917",
    info: "Schiele'nin karakteristik angular çizgisi ve çarpıtılmış figürleri, Viyana Ekspresyonizmi'nin en güçlü örnekleridir. 28 yaşında İspanyol Gribi'nden ölmüş, kısa ömrüne rağmen 300'den fazla tablo bırakmıştır.",
    questionType: "artist",
    question: "Çarpıcı çizgisi ve provokatif portreleriyle bilinen bu ekspresyonist sanatçı kimdir?",
    correctAnswer: "Egon Schiele",
    options: ["Egon Schiele", "Ernst Ludwig Kirchner", "Oskar Kokoschka", "Amedeo Modigliani"],
    hint: "28 yaşında İspanyol Gribi'nden ölen bu Avusturyalı sanatçı, Klimt'in protejesidir.",
  },
  {
    id: 9,
    image: "/images/testler/modern-sanat/gauguin-nereden.webp",
    title: "Nereden Geliyoruz? Neyiz? Nereye Gidiyoruz?",
    artist: "Paul Gauguin",
    year: "1897–1898",
    info: "Gauguin'in en büyük ve en önemli eseri olan bu tablo, varoluşun temel sorularını görselleştirir. Sanatçı bu tabloyu intihar girişiminden önce 'vasiyeti' olarak yapmıştır. Boston Güzel Sanatlar Müzesi'ndedir.",
    questionType: "artist",
    question: "Tahiti'de yaşayarak eserler üreten bu post-empresyonist sanatçı kimdir?",
    correctAnswer: "Paul Gauguin",
    options: ["Paul Gauguin", "Henri Rousseau", "Pierre Bonnard", "Émile Bernard"],
    hint: "Paris borsasındaki işini bırakıp Güney Pasifik'e göç eden bu Fransız sanatçı, 'ilkelci' tarzıyla tanınır.",
  },
  {
    id: 10,
    image: "/images/testler/modern-sanat/modigliani-jeanne.webp",
    title: "Jeanne Hébuterne Portresi",
    artist: "Amedeo Modigliani",
    year: "1919",
    info: "Modigliani'nin sevgilisi Jeanne Hébuterne'in bu portresi, sanatçının karakteristik uzun boyun ve oval yüz stilinin en güzel örneklerinden biridir. Modigliani 35 yaşında tüberkülozdan ölmüş, Jeanne ertesi gün intihar etmiştir.",
    questionType: "artist",
    question: "Uzun boyun ve badem gözlerle stilize portreleriyle tanınan bu sanatçı kimdir?",
    correctAnswer: "Amedeo Modigliani",
    options: ["Amedeo Modigliani", "Egon Schiele", "Gustav Klimt", "Chaïm Soutine"],
    hint: "İtalyan asıllı bu Paris Okulu sanatçısı, 35 yaşında tüberkülozdan ölmüştür.",
  },
];

/* ── Yardımcılar ── */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getBadge(score: number, timed: boolean): { name: string; desc: string } {
  const suffix = timed ? " (Hızlı)" : "";
  if (score >= 9) return { name: `Modern Sanat Uzmanı${suffix}`, desc: "Modern sanata hakimsiniz!" };
  if (score >= 7) return { name: `Avant-Garde${suffix}`, desc: "Modern sanat bilginiz etkileyici." };
  if (score >= 5) return { name: `Galeri Dostu${suffix}`, desc: "İyi bir temel var, derinleşme zamanı!" };
  if (score >= 3) return { name: `Keşifçi${suffix}`, desc: "Modern sanat dünyasını keşfetmeye başlıyorsunuz." };
  return { name: `Çırak${suffix}`, desc: "Modern sanat sizi bekliyor — atölyemize katılın!" };
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}dk ${sec}sn` : `${sec}sn`;
}

/* ── Progress Bar ── */
function ProgressBar({
  current, total, score, timeLeft, timed,
}: {
  current: number; total: number; score: number; timeLeft: number; timed: boolean;
}) {
  const pct = (current / total) * 100;
  return (
    <div style={{ padding: "16px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: T.muted, fontWeight: 600 }}>
          Soru {current + 1}/{total}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {timed && (
            <span style={{
              fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums",
              color: timeLeft <= 5 ? T.wrong : T.hint,
              transition: `color .3s ${ease}`,
            }}>
              {timeLeft}sn
            </span>
          )}
          <span style={{ fontSize: 13, color: T.accent, fontWeight: 700 }}>
            {score} puan
          </span>
        </div>
      </div>
      <div style={{ height: 4, background: T.border, borderRadius: 99, position: "relative" }}>
        <div style={{
          height: "100%", width: `${pct}%`, background: T.accent,
          borderRadius: 99, transition: `width 0.5s ${ease}`,
        }} />
        {timed && (
          <div style={{
            position: "absolute", top: 0, left: 0, height: "100%",
            width: `${(timeLeft / TIMER_SECONDS) * 100}%`,
            background: timeLeft <= 5 ? T.wrong : T.hint,
            borderRadius: 99, transition: `width 1s linear, background .3s`,
            opacity: 0.5,
          }} />
        )}
      </div>
    </div>
  );
}

/* ── Share Buttons ── */
function ShareButtons({ score, badge }: { score: number; badge: string }) {
  const [copied, setCopied] = useState(false);
  const text = `Modern Sanat Quizi'nde ${score}/10 puan alarak "${badge}" rozetini kazandım!`;
  const url = "https://klemensart.com/testler/modern-sanat-quiz";

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
export default function ModernSanatQuiz() {
  /* ── State ── */
  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro");
  const [mode, setMode] = useState<"normal" | "timed">("normal");
  const [questions, setQuestions] = useState<QuizItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [fadeIn, setFadeIn] = useState(true);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [imgError, setImgError] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const startTimeRef = useRef(0);
  const totalTimeRef = useRef(0);

  // Auth & save
  const [user, setUser] = useState<User | null>(null);
  const savedRef = useRef(false);

  // Email results (non-member)
  const [email, setEmail] = useState("");
  const [kvkkChecked, setKvkkChecked] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "done" | "error" | "registered">("idle");

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Coupon (score >= 8)
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponExpiry, setCouponExpiry] = useState<string | null>(null);
  const [couponCopied, setCouponCopied] = useState(false);
  const couponFetchedRef = useRef(false);

  // Game key
  const [gameKey, setGameKey] = useState(0);

  /* ── Auth check ── */
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u ?? null));
  }, []);

  /* ── Browser back prevention ── */
  useEffect(() => {
    if (phase !== "quiz") return;
    history.replaceState({ quiz: true }, "");
    const handler = () => {
      if (phase === "quiz") {
        history.pushState({ quiz: true }, "");
      }
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [phase]);

  /* ── Timer (timed mode) ── */
  useEffect(() => {
    if (phase !== "quiz" || mode !== "timed" || selectedAnswer !== null) return;
    if (timeLeft <= 0) {
      const q = questions[current];
      setSelectedAnswer("__timeout__");
      setIsCorrect(false);
      setResults((prev) => [...prev, { item: q, correct: false, hintUsed, userAnswer: "__timeout__" }]);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, phase, mode, selectedAnswer, current, questions, hintUsed]);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  /* ── Start game ── */
  const startGame = useCallback((m: "normal" | "timed") => {
    const shuffled = shuffle(ITEMS);
    setMode(m);
    setQuestions(shuffled);
    setShuffledOptions(shuffle(shuffled[0].options));
    setCurrent(0);
    setScore(0);
    setShowHint(false);
    setHintUsed(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setResults([]);
    setFadeIn(true);
    setImgError(false);
    setTimeLeft(TIMER_SECONDS);
    startTimeRef.current = Date.now();
    totalTimeRef.current = 0;
    savedRef.current = false;
    setEmailStatus("idle");
    setEmail("");
    setKvkkChecked(false);
    setCouponCode(null);
    setCouponExpiry(null);
    setCouponCopied(false);
    couponFetchedRef.current = false;
    setGameKey((k) => k + 1);
    setPhase("quiz");
    scrollTop();
  }, []);

  /* ── Handle answer ── */
  const handleAnswer = useCallback((answer: string) => {
    if (selectedAnswer) return;
    const q = questions[current];
    const correct = answer === q.correctAnswer;
    const pts = correct ? (hintUsed ? 0.5 : 1) : 0;

    setSelectedAnswer(answer);
    setIsCorrect(correct);
    setScore((prev) => prev + pts);
    setResults((prev) => [...prev, { item: q, correct, hintUsed, userAnswer: answer }]);
  }, [selectedAnswer, questions, current, hintUsed]);

  /* ── Next question ── */
  const nextQuestion = useCallback(() => {
    if (current + 1 >= questions.length) {
      totalTimeRef.current = Math.round((Date.now() - startTimeRef.current) / 1000);
      setPhase("result");
      scrollTop();
      return;
    }
    setFadeIn(false);
    setTimeout(() => {
      const next = current + 1;
      setCurrent(next);
      setShuffledOptions(shuffle(questions[next].options));
      setShowHint(false);
      setHintUsed(false);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setImgError(false);
      setTimeLeft(TIMER_SECONDS);
      setFadeIn(true);
      scrollTop();
    }, 300);
  }, [current, questions]);

  /* ── Save result & fetch leaderboard on result phase ── */
  useEffect(() => {
    if (phase !== "result") return;

    if (!savedRef.current && user) {
      savedRef.current = true;
      const badge = getBadge(score, mode === "timed");
      const meta = (user.user_metadata ?? {}) as Record<string, string>;
      const displayName = meta.full_name || meta.name || "Anonim";
      fetch("/api/quiz/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score,
          badge: badge.name,
          time_seconds: totalTimeRef.current || null,
          mode,
          display_name: displayName,
          quiz_slug: QUIZ_SLUG,
        }),
      }).catch(() => {});
    }

    if (user) {
      fetch(`/api/quiz/results?slug=${QUIZ_SLUG}&limit=10`)
        .then((r) => r.json())
        .then((d) => setLeaderboard(d.results ?? []))
        .catch(() => {});
    }

    // Generate coupon for high scorers (members only — non-members get it via email API)
    if (!couponFetchedRef.current && score >= 8 && user) {
      couponFetchedRef.current = true;
      fetch("/api/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiz_slug: QUIZ_SLUG,
          workshop_slug: "modern-sanat-atolyesi",
          user_id: user.id,
          user_email: user.email,
          score,
        }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.code) {
            setCouponCode(d.code);
            setCouponExpiry(d.expires_at);
          }
        })
        .catch(() => {});
    }
  }, [phase, score, mode, user]);

  /* ── Send results to email (non-member) ── */
  const handleEmailSubmit = async () => {
    if (!email || !kvkkChecked || emailStatus === "sending") return;
    setEmailStatus("sending");
    try {
      const badge = getBadge(score, mode === "timed");
      const res = await fetch("/api/quiz/send-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          score,
          badge: badge.name,
          mode,
          time_seconds: totalTimeRef.current || null,
          quiz_slug: QUIZ_SLUG,
          quiz_title: QUIZ_TITLE,
          max_score: 10,
          results: results.map((r) => ({
            title: r.item.title,
            artist: r.item.artist,
            year: r.item.year,
            info: r.item.info,
            question: r.item.question,
            correctAnswer: r.item.correctAnswer,
            userAnswer: r.userAnswer,
            correct: r.correct,
            hintUsed: r.hintUsed,
          })),
        }),
      });
      const data = await res.json();
      if (data.registered) {
        setEmailStatus("registered");
      } else if (data.sent) {
        setEmailStatus("done");
        fetch(`/api/quiz/results?slug=${QUIZ_SLUG}&limit=10`)
          .then((r) => r.json())
          .then((d) => setLeaderboard(d.results ?? []))
          .catch(() => {});
        // Generate coupon for non-member high scorers
        if (score >= 8) {
          fetch("/api/coupon", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              quiz_slug: QUIZ_SLUG,
              workshop_slug: "modern-sanat-atolyesi",
              user_email: email.trim().toLowerCase(),
              score,
            }),
          })
            .then((r) => r.json())
            .then((d) => {
              if (d.code) {
                setCouponCode(d.code);
                setCouponExpiry(d.expires_at);
              }
            })
            .catch(() => {});
        }
      } else {
        setEmailStatus("error");
      }
    } catch {
      setEmailStatus("error");
    }
  };

  /* ══════════════════════════════════════════════
     INTRO
     ══════════════════════════════════════════════ */
  if (phase === "intro") {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Segoe UI','Helvetica Neue',sans-serif" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "96px 24px 60px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ background: T.accentBg, color: T.accent, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", padding: "8px 20px", borderRadius: 99, marginBottom: 32 }}>
            Klemens Quiz
          </div>

          <h1 style={{ fontSize: "clamp(28px,6vw,44px)", fontWeight: 800, color: T.text, lineHeight: 1.15, margin: "0 0 20px", letterSpacing: -0.5 }}>
            Modern Sanat<br />
            <span style={{ color: T.accent }}>Quizi</span>
          </h1>

          <p style={{ fontSize: 17, lineHeight: 1.7, color: T.muted, margin: "0 0 12px", maxWidth: 480 }}>
            Empresyonizmden soyut sanata — modern sanatın başyapıtlarını ne kadar tanıyorsunuz?
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: T.muted, margin: "0 0 40px", maxWidth: 480 }}>
            <strong style={{ color: T.textSec }}>10 soruda</strong> bilginizi test edin.
          </p>

          <div style={{ display: "flex", gap: 32, marginBottom: 40, flexWrap: "wrap", justifyContent: "center" }}>
            {[{ n: "10", l: "Soru" }, { n: "7", l: "Akım" }, { n: "~3dk", l: "Süre" }].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: T.text }}>{s.n}</div>
                <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Mode selection */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16, width: "100%", maxWidth: 400 }}>
            <button
              onClick={() => startGame("normal")}
              style={{
                flex: 1, background: T.accent, color: T.bg, border: "none", borderRadius: 99,
                padding: "18px 24px", fontSize: 16, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 24px rgba(201,168,76,0.3)", fontFamily: "inherit",
                transition: `transform .2s ${ease}`,
              }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.transform = "translateY(0)"; }}
            >
              Başla
            </button>
            <button
              onClick={() => startGame("timed")}
              style={{
                flex: 1, background: "transparent", color: T.hint, border: `1.5px solid rgba(245,158,11,0.4)`,
                borderRadius: 99, padding: "18px 24px", fontSize: 16, fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit", transition: `all .2s ${ease}`,
              }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.transform = "translateY(0)"; }}
            >
              Hızlı Mod ({TIMER_SECONDS}sn)
            </button>
          </div>

          <p style={{ fontSize: 12, color: T.muted, marginTop: 16, maxWidth: 400, lineHeight: 1.6, fontStyle: "italic" }}>
            Normal modda süre sınırı yok. Hızlı modda her soru için {TIMER_SECONDS} saniyeniz var.
          </p>

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
     QUIZ
     ══════════════════════════════════════════════ */
  if (phase === "quiz") {
    const q = questions[current];
    return (
      <div key={gameKey} style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Segoe UI','Helvetica Neue',sans-serif" }}>
        <div
          style={{
            maxWidth: 640, margin: "0 auto", padding: "32px 20px 60px",
            opacity: fadeIn ? 1 : 0, transform: fadeIn ? "translateY(0)" : "translateY(12px)",
            transition: `opacity .3s ${ease}, transform .3s ${ease}`,
          }}
        >
          <ProgressBar current={current} total={questions.length} score={score} timeLeft={timeLeft} timed={mode === "timed"} />

          {/* Image */}
          <div
            style={{
              position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: 16,
              overflow: "hidden", marginBottom: 24, background: T.bgCard,
              border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {!imgError ? (
              <Image
                src={q.image} alt="Eser görseli" fill
                style={{ objectFit: "contain" }}
                sizes="(max-width: 640px) 100vw, 640px"
                priority
                onError={() => setImgError(true)}
              />
            ) : (
              <div style={{ textAlign: "center", padding: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 8, opacity: 0.3 }}>&#x1f5bc;</div>
                <span style={{ fontSize: 13, color: T.muted }}>Görsel yüklenemedi</span>
              </div>
            )}
          </div>

          {/* Question */}
          <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text, textAlign: "center", margin: "0 0 20px", lineHeight: 1.4 }}>
            {q.question}
          </h2>

          {/* Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {shuffledOptions.map((opt) => {
              const isSelected = selectedAnswer === opt;
              const isCorrectOpt = opt === q.correctAnswer;
              const answered = selectedAnswer !== null;
              const showFeedback = user !== null;

              let bg = T.bgCard;
              let borderColor = T.border;
              let textColor = T.text;

              if (answered) {
                if (showFeedback) {
                  if (isCorrectOpt) {
                    bg = T.correctBg; borderColor = T.correct; textColor = T.correct;
                  } else if (isSelected) {
                    bg = T.wrongBg; borderColor = T.wrong; textColor = T.wrong;
                  } else {
                    textColor = T.muted;
                  }
                } else {
                  if (isSelected) {
                    bg = T.accentBg; borderColor = T.accent; textColor = T.accent;
                  } else {
                    textColor = T.muted;
                  }
                }
              }

              return (
                <button
                  key={opt} onClick={() => handleAnswer(opt)} disabled={answered}
                  style={{
                    background: bg, border: `1.5px solid ${borderColor}`, borderRadius: 12,
                    padding: "16px 20px", fontSize: 15, fontWeight: 600, color: textColor,
                    cursor: answered ? "default" : "pointer", fontFamily: "inherit", textAlign: "left",
                    transition: `all .25s ${ease}`,
                    opacity: answered && !isSelected && !(showFeedback && isCorrectOpt) ? 0.5 : 1,
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Timeout indicator */}
          {selectedAnswer === "__timeout__" && (
            <div style={{
              textAlign: "center", marginBottom: 16, padding: "10px 16px", borderRadius: 99,
              background: T.wrongBg, color: T.wrong, fontSize: 14, fontWeight: 700,
            }}>
              Süre doldu!
            </div>
          )}

          {/* Hint button (before answering, not in timed mode, only for members) */}
          {user && !selectedAnswer && mode !== "timed" && (
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              {!showHint ? (
                <button
                  onClick={() => { setShowHint(true); setHintUsed(true); }}
                  style={{
                    background: T.hintBg, color: T.hint, border: "1px solid rgba(245,158,11,0.25)",
                    borderRadius: 99, padding: "10px 24px", fontSize: 13, fontWeight: 600,
                    cursor: "pointer", fontFamily: "inherit", transition: `all .2s ${ease}`,
                  }}
                >
                  İpucu Göster (-0.5 puan)
                </button>
              ) : (
                <div style={{
                  background: T.hintBg, border: "1px solid rgba(245,158,11,0.25)",
                  borderRadius: 12, padding: "14px 20px", fontSize: 14, color: T.hint, lineHeight: 1.6,
                }}>
                  {q.hint}
                </div>
              )}
            </div>
          )}

          {/* Post-answer feedback — only for logged-in members */}
          {selectedAnswer && user && (
            <div style={{
              background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16,
              padding: "20px", marginBottom: 20,
            }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px",
                borderRadius: 99, fontSize: 13, fontWeight: 700, marginBottom: 12,
                background: isCorrect ? T.correctBg : T.wrongBg,
                color: isCorrect ? T.correct : T.wrong,
              }}>
                {selectedAnswer === "__timeout__" ? "Süre Doldu" : isCorrect ? "Doğru!" : "Yanlış"}
                {hintUsed && isCorrect && <span style={{ fontWeight: 400, opacity: 0.8 }}> (İpucu ile +0.5)</span>}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text, margin: "0 0 4px" }}>{q.title}</h3>
              <p style={{ fontSize: 13, color: T.accent, margin: "0 0 10px", fontWeight: 600 }}>
                {q.artist} &middot; {q.year}
              </p>
              <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.7, margin: 0 }}>{q.info}</p>
            </div>
          )}

          {/* Non-member: neutral "answered" indicator */}
          {selectedAnswer && !user && selectedAnswer !== "__timeout__" && (
            <div style={{
              textAlign: "center", marginBottom: 16, padding: "10px 16px", borderRadius: 99,
              background: T.accentBg, color: T.accent, fontSize: 14, fontWeight: 600,
            }}>
              Cevabınız kaydedildi
            </div>
          )}

          {/* Next button */}
          {selectedAnswer && (
            <button
              onClick={nextQuestion}
              style={{
                width: "100%", background: T.accent, color: T.bg, border: "none", borderRadius: 12,
                padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                transition: `transform .2s ${ease}`,
              }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.transform = "translateY(0)"; }}
            >
              {current + 1 < questions.length ? "Sonraki Soru" : "Sonuçları Gör"}
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════
     RESULT
     ══════════════════════════════════════════════ */
  const badge = getBadge(score, mode === "timed");
  const totalTime = totalTimeRef.current;

  const showFullResults = user || emailStatus === "done";

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Segoe UI','Helvetica Neue',sans-serif" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "64px 20px 60px" }}>

        {/* ── Non-member: Email form (before results) ── */}
        {!user && emailStatus !== "done" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: 32 }}>
              <div style={{
                fontSize: 48, fontWeight: 800, color: T.muted, lineHeight: 1, opacity: 0.3,
                filter: "blur(8px)", userSelect: "none",
              }}>
                ?<span style={{ fontSize: 20 }}>/10</span>
              </div>
              <p style={{ fontSize: 16, color: T.muted, marginTop: 12 }}>
                Quiz tamamlandı!
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
                  Giriş yaparak quiz sonuçlarınızı detaylı görebilir, rozetinizi kaydedebilir ve
                  liderlik tablosunda yerinizi alabilirsiniz.
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
                  Puanınız, rozetiniz ve yanlış cevaplarınızın doğruları açıklamalarıyla birlikte
                  e-posta adresinize gönderilecek.
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
                    &apos;ni okudum ve e-posta adresimin quiz sonuçlarının gönderimi ile
                    bülten amacıyla işlenmesini kabul ediyorum.
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
                onClick={() => startGame("normal")}
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

        {/* ── Non-member: After email sent — show results + CTA ── */}
        {!user && emailStatus === "done" && (
          <div style={{
            textAlign: "center", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: 12, padding: "16px", marginBottom: 24,
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.correct }}>
              Sonuçlarınız e-postanıza gönderildi!
            </div>
            <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>
              Yanlış cevaplarınızın doğruları ve açıklamaları mailinizde.
            </div>
          </div>
        )}

        {/* ── Full results (members always, non-members after email) ── */}
        {showFullResults && (
          <>
            {/* Score */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ fontSize: 56, fontWeight: 800, color: T.accent, lineHeight: 1 }}>
                {score}<span style={{ fontSize: 24, color: T.muted }}>/10</span>
              </div>
              {totalTime > 0 && (
                <div style={{ fontSize: 14, color: T.muted, marginTop: 8 }}>
                  {formatTime(totalTime)} {mode === "timed" && "— Hızlı Mod"}
                </div>
              )}
            </div>

            {/* Badge */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{
                display: "inline-flex", flexDirection: "column", alignItems: "center",
                background: T.accentBg, border: "1px solid rgba(201,168,76,0.25)",
                borderRadius: 20, padding: "24px 40px",
              }}>
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

            {/* ── WORKSHOP CTA — with coupon if earned ── */}
            <div style={{
              background: couponCode ? "rgba(34,197,94,0.06)" : T.workshopBg,
              border: `1.5px solid ${couponCode ? "rgba(34,197,94,0.3)" : `${T.workshop}40`}`,
              borderRadius: 20, padding: "28px 24px", marginBottom: 32, textAlign: "center",
              position: "relative", overflow: "hidden",
            }}>
              {/* Decorative corner accent */}
              <div style={{
                position: "absolute", top: -20, right: -20, width: 80, height: 80,
                borderRadius: "50%", background: couponCode ? "rgba(34,197,94,0.08)" : `${T.workshop}15`,
              }} />
              <div style={{
                position: "absolute", bottom: -10, left: -10, width: 50, height: 50,
                borderRadius: "50%", background: couponCode ? "rgba(34,197,94,0.05)" : `${T.workshop}10`,
              }} />

              {couponCode ? (
                <>
                  <div style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
                    color: T.correct, marginBottom: 12,
                  }}>
                    %10 Indirim Kazandınız!
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: T.text, marginBottom: 8, lineHeight: 1.3 }}>
                    Tebrikler! Atölye indirimi<br />sizin oldu.
                  </div>
                  <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.7, margin: "0 0 16px", maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
                    <strong style={{ color: T.textSec }}>Modern Sanatı Okumak</strong> atölyemize
                    kayıt olurken bu kodu kullanarak <strong style={{ color: T.correct }}>%10 indirim</strong> kazanın.
                  </p>

                  {/* Coupon code display */}
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 12,
                    background: T.bgCard, border: `2px dashed ${T.correct}60`,
                    borderRadius: 14, padding: "14px 24px", marginBottom: 12,
                  }}>
                    <span style={{
                      fontSize: 20, fontWeight: 800, color: T.correct,
                      letterSpacing: 2, fontFamily: "monospace",
                    }}>
                      {couponCode}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(couponCode).then(() => {
                          setCouponCopied(true);
                          setTimeout(() => setCouponCopied(false), 2000);
                        });
                      }}
                      style={{
                        background: couponCopied ? T.correctBg : "transparent",
                        border: `1px solid ${couponCopied ? T.correct : T.border}`,
                        borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600,
                        color: couponCopied ? T.correct : T.muted,
                        cursor: "pointer", fontFamily: "inherit", transition: `all .2s ${ease}`,
                      }}
                    >
                      {couponCopied ? "Kopyalandı!" : "Kopyala"}
                    </button>
                  </div>

                  {couponExpiry && (
                    <p style={{ fontSize: 12, color: T.muted, margin: "0 0 16px" }}>
                      Son kullanma: {new Date(couponExpiry).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  )}

                  <a
                    href="/atolyeler/modern-sanat-atolyesi"
                    style={{
                      display: "inline-block", background: T.correct, color: "#fff",
                      textDecoration: "none", fontSize: 15, fontWeight: 700,
                      padding: "14px 36px", borderRadius: 99,
                      boxShadow: "0 4px 20px rgba(34,197,94,0.3)",
                      transition: `transform .2s ${ease}`,
                    }}
                  >
                    Atölyeye Katıl — %10 İndirimli
                  </a>
                </>
              ) : (
                <>
                  <div style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
                    color: T.workshop, marginBottom: 12,
                  }}>
                    Atölye Daveti
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: T.text, marginBottom: 8, lineHeight: 1.3 }}>
                    Modern sanatı daha derinlemesine<br />keşfetmek ister misiniz?
                  </div>
                  <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.7, margin: "0 0 8px", maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
                    10 haftalık <strong style={{ color: T.textSec }}>Modern Sanatı Okumak</strong> atölyemizde
                    Empresyonizmden Kavramsal Sanata uzanan yolculuğa çıkın.
                  </p>
                  {score < 8 && (
                    <p style={{ fontSize: 13, color: T.hint, lineHeight: 1.7, margin: "0 0 8px", fontWeight: 600 }}>
                      8+ puan alarak %10 atölye indirimi kazanabilirsiniz!
                    </p>
                  )}
                  <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.7, margin: "0 0 20px" }}>
                    Her hafta bir akım, her akımda bir başyapıt.
                  </p>
                  <a
                    href="/atolyeler/modern-sanat-atolyesi"
                    style={{
                      display: "inline-block", background: T.workshop, color: "#fff",
                      textDecoration: "none", fontSize: 15, fontWeight: 700,
                      padding: "14px 36px", borderRadius: 99,
                      boxShadow: `0 4px 20px ${T.workshop}40`,
                      transition: `transform .2s ${ease}`,
                    }}
                  >
                    Atölyeye Katıl
                  </a>
                </>
              )}
            </div>

            {/* Share */}
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: T.muted, marginBottom: 12, letterSpacing: 1, textTransform: "uppercase" }}>
                Sonucunuzu Paylaşın
              </h3>
            </div>
            <ShareButtons score={score} badge={badge.name} />

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
                      borderRadius: 12, padding: "10px 14px",
                    }}
                  >
                    <div style={{
                      width: 48, height: 36, borderRadius: 6, overflow: "hidden",
                      position: "relative", flexShrink: 0, background: T.border,
                    }}>
                      <Image src={r.item.image} alt={r.item.title} fill style={{ objectFit: "cover" }} sizes="48px" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {r.item.title}
                      </div>
                      <div style={{ fontSize: 12, color: T.muted }}>{r.item.artist}</div>
                    </div>
                    <div style={{
                      fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 99, flexShrink: 0,
                      background: r.correct ? T.correctBg : T.wrongBg,
                      color: r.correct ? T.correct : T.wrong,
                    }}>
                      {r.correct ? (r.hintUsed ? "+0.5" : "+1") : "0"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Non-member CTA — register */}
            {!user && (
              <div style={{
                background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16,
                padding: "24px", marginBottom: 24, textAlign: "center",
              }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 6 }}>
                  Daha fazla quiz ve sanat içeriği için
                </div>
                <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.7, margin: "0 0 16px" }}>
                  Ücretsiz üye olun — rozetlerinizi kaydedin, liderlik tablosunda yerinizi alın,
                  yeni quizlerden ilk siz haberdar olun.
                </p>
                <a
                  href="/club/giris"
                  style={{
                    display: "inline-block", background: T.accent, color: T.bg,
                    textDecoration: "none", fontSize: 15, fontWeight: 700,
                    padding: "14px 36px", borderRadius: 99,
                    transition: `transform .2s ${ease}`,
                  }}
                >
                  Ücretsiz Üye Ol
                </a>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => startGame("normal")}
                style={{
                  width: "100%", background: T.accent, color: T.bg, border: "none", borderRadius: 12,
                  padding: "16px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                  transition: `transform .2s ${ease}`,
                }}
                onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.transform = "translateY(0)"; }}
              >
                Tekrar Oyna
              </button>

              <div style={{ display: "flex", gap: 10 }}>
                <Link
                  href="/testler/ronesans-quiz"
                  style={{
                    flex: 1, background: "transparent", color: T.muted,
                    border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px",
                    fontSize: 14, fontWeight: 600, textDecoration: "none", textAlign: "center",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  Rönesans Quizi
                </Link>
                <Link
                  href="/testler"
                  style={{
                    flex: 1, background: "transparent", color: T.muted,
                    border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px",
                    fontSize: 14, fontWeight: 600, textDecoration: "none", textAlign: "center",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  Testlere Dön
                </Link>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
