"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { ArticleMeta } from "@/lib/markdown";

// ── Types ──────────────────────────────────────────────────────────────────────
type MemberSize = "large" | "medium";

type TeamMember = {
  id: string;
  name: string;
  initials: string;
  role: string;
  size: MemberSize;
  quote: string;
  ig?: string;
  mail?: string;
  photo?: string;
  svgX: number;
  svgY: number;
  floatDur: number;
  floatDelay: number;
};

type WriterMember = {
  id: string;
  name: string;
  initials: string;
  role: string;
  quote?: string;
  ig?: string;
  mail?: string;
  photo?: string;
};

// ── SVG canvas constants ───────────────────────────────────────────────────────
const VW = 1000;
const VH = 540;
const CX = 500;
const CY = 270;

// ── Core team (SVG network — 4 kişi) ────────────────────────────────────────
const TEAM: TeamMember[] = [
  {
    id: "kerem",
    name: "Kerem Hun",
    initials: "KH",
    role: "Kurucu & Kreatif Direktör",
    size: "large",
    quote: "Sanat tarihi bir amaç değil, kendinizi keşfetmek için bir araç.",
    ig: "@keremhun",
    mail: "kerem@klemensart.com",
    photo: "/images/ekip/kerem-hun.jpg",
    svgX: 240, svgY: 115,
    floatDur: 12, floatDelay: 0,
  },
  {
    id: "volkan",
    name: "Volkan Muyan",
    initials: "VM",
    role: "Yayın Koordinatörü",
    size: "medium",
    quote: "İyi bir yayın, okura yeni bir pencere açar.",
    svgX: 760, svgY: 115,
    floatDur: 14, floatDelay: 1.5,
  },
  {
    id: "hulya",
    name: "Hülya Utkuluer",
    initials: "HU",
    role: "Editör",
    size: "medium",
    quote: "Sanat hayatın ilhamıysa, müzeler ilhamın hafızasıdır.",
    ig: "@hutkuluer",
    mail: "hulyautkuluer@gmail.com",
    photo: "/images/ekip/hulya-utkuluer.jpg",
    svgX: 240, svgY: 420,
    floatDur: 11, floatDelay: 2.8,
  },
  {
    id: "sevim",
    name: "Sevim Aydın",
    initials: "SA",
    role: "Tasarımcı",
    size: "medium",
    quote: "Her film, izleyicisine kendini anlatan bir mektuptur.",
    ig: "@sevim_aydin",
    mail: "aydinsevimm@gmail.com",
    photo: "/images/ekip/sevim-aydin.jpg",
    svgX: 760, svgY: 420,
    floatDur: 13, floatDelay: 0.8,
  },
];

// ── Writers grid (tüm yazarlar — soyadı sırasına göre) ─────────────────────
const WRITERS: WriterMember[] = [
  {
    id: "berra",
    name: "Ebru Berra Alkan",
    initials: "BA",
    role: "Yazar",
  },
  {
    id: "ezel",
    name: "Ezel Evin Altındağ",
    initials: "EA",
    role: "Yazar",
  },
  {
    id: "baris",
    name: "Barış Arslan",
    initials: "BA",
    role: "Yazar",
    quote: "İnsani olan hiçbir şey bana yabancı değildir.",
    ig: "@barars2023",
    mail: "bararslan2009@gmail.com",
    photo: "/images/ekip/baris-arslan.jpg",
  },
  {
    id: "ugur",
    name: "Uğur Atay",
    initials: "UA",
    role: "Yazar",
  },
  {
    id: "zeynep",
    name: "Zeynep Aydın",
    initials: "ZA",
    role: "Yazar",
  },
  {
    id: "ecem",
    name: "Ecem Civaş",
    initials: "EC",
    role: "Yazar",
    quote: "Sanat ve feminizm, görünmeyeni görünür kılan iki dildir.",
    photo: "/images/ekip/ecem-civas.jpg",
  },
  {
    id: "gizem",
    name: "Gizem Dinç",
    initials: "GD",
    role: "Yazar",
    quote: "Yapay zeka çağında bile en güçlü bağ, insanın kendisiyle kurduğu bağdır.",
    ig: "@gizemdinc.h",
    mail: "gizemdinc@gmail.com",
    photo: "/images/ekip/gizem-dinc.jpg",
  },
  {
    id: "defne",
    name: "Defne Ege Durucu",
    initials: "DD",
    role: "Yazar",
    quote: "Yalnızlık kimsenin olmadığı bir yer değildir. Aksine, baktıkça kalabalıklaşır.",
    ig: "@aging_as_a_tree",
    mail: "defneeged@gmail.com",
  },
  {
    id: "cansu",
    name: "Cansu Kul",
    initials: "CK",
    role: "Yazar",
  },
  {
    id: "mehtap",
    name: "Mehtap Kurt",
    initials: "MK",
    role: "Yazar",
    quote: "Sanat insanın dünyadaki izini çözer, kültür ise onun sessiz hafızasını ortaya çıkarır.",
    ig: "@mehtapconatus",
    mail: "mehtapkurt7140@gmail.com",
    photo: "/images/ekip/mehtap-kurt.jpg",
  },
  {
    id: "dolunay",
    name: "Dolunay May",
    initials: "DM",
    role: "Yazar",
    quote: "Sanatı anladığını düşünen, sanatı anlamamıştır.",
    photo: "/images/ekip/dolunay-may.jpg",
  },
  {
    id: "gozde",
    name: "Gözde Şensoy Murt",
    initials: "GM",
    role: "Yazar",
    quote: "Anlaşılmak, ruhun karmaşasını bir sanat eserine dönüştüren büyülü bir akışa kapılmaktır.",
    ig: "@gozdsnsy",
    mail: "gozdesnsy@gmail.com",
    photo: "/images/ekip/gozde-murt.png",
  },
  {
    id: "didem",
    name: "Didem Kazan Sol",
    initials: "DS",
    role: "Yazar",
    quote: "Fırça, kadının sessiz direnişinin en güçlü silahıdır.",
    ig: "@didosol",
    mail: "soldidem@gmail.com",
  },
  {
    id: "iklim",
    name: "İklim Demir Tantoğlu",
    initials: "İT",
    role: "Yazar",
  },
  {
    id: "melis",
    name: "Melis Terzi",
    initials: "MT",
    role: "Yazar",
    quote: "Sanat ekseninde yalnızlığı konuşarak birlikte olalım.",
    ig: "@melisterzi",
    mail: "terzi_melis@hotmail.com",
  },
  {
    id: "doga",
    name: "Doğa Uğurel",
    initials: "DU",
    role: "Yazar",
  },
];

// ── Connection lines ───────────────────────────────────────────────────────────
type Connection = {
  from: string;
  to: string;
  bend: number;
  dur: number;
  delay: number;
  secondary?: boolean;
};

const CONNECTIONS: Connection[] = [
  // Center → 4 core members
  { from: "center", to: "kerem",  bend:  0.12, dur: 8,  delay: 0   },
  { from: "center", to: "volkan", bend: -0.12, dur: 10, delay: 1.2 },
  { from: "center", to: "hulya",  bend: -0.10, dur: 9,  delay: 0.5 },
  { from: "center", to: "sevim",  bend:  0.10, dur: 11, delay: 2.0 },
  // Outer ring (rectangle)
  { from: "kerem",  to: "volkan", bend: -0.15, dur: 14, delay: 2.5, secondary: true },
  { from: "volkan", to: "sevim",  bend:  0.18, dur: 12, delay: 1.0, secondary: true },
  { from: "sevim",  to: "hulya",  bend: -0.15, dur: 13, delay: 0.3, secondary: true },
  { from: "hulya",  to: "kerem",  bend:  0.18, dur: 11, delay: 2.2, secondary: true },
  // Cross connections (diagonals)
  { from: "kerem",  to: "sevim",  bend:  0.22, dur: 16, delay: 3.5, secondary: true },
  { from: "volkan", to: "hulya",  bend: -0.22, dur: 15, delay: 2.8, secondary: true },
];

function nodePos(id: string) {
  if (id === "center") return { svgX: CX, svgY: CY };
  return TEAM.find((m) => m.id === id)!;
}

function curvePath(x1: number, y1: number, x2: number, y2: number, bend: number) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  return `M${x1},${y1} Q${mx - dy * bend},${my + dx * bend} ${x2},${y2}`;
}

// ── Float keyframes ────────────────────────────────────────────────────────────
const FY = [0, -7, 3, -5, 2, -3, 0];
const FX = [0, 3, -2, 4, -1, 2, 0];
const FT = [0, 0.15, 0.35, 0.55, 0.7, 0.85, 1];

// ── Helpers ────────────────────────────────────────────────────────────────────
const nodeRadius = (size: MemberSize) => (size === "large" ? 30 : 22);

const igIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const mailIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const arrowIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

// ── Main component ─────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-[#2D2926] font-medium text-[15px] pr-4">{q}</span>
        <span className={`text-[#8C857E] text-xl shrink-0 transition-transform duration-200 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-[#8C857E] text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HakkimizdaClient({ articles }: { articles: ArticleMeta[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const allMembers = [...TEAM, ...WRITERS];
  const selectedMember = selectedId === "center"
    ? { id: "center", name: "KLEMENS", initials: "K", role: "Kolektif Yayınlar", quote: "Klemens, tek bir zihin değil — birbirine bağlı düşüncelerin, merakların ve tutkuların ağıdır.", photo: undefined }
    : selectedId ? allMembers.find((m) => m.id === selectedId) ?? null : null;
  // Author name aliases (DB name may differ from display name)
  const authorAliases: Record<string, string[]> = {
    "Gözde Şensoy Murt": ["Gözde Murt", "Gözde Şensoy Murt"],
    "Ebru Berra Alkan": ["Ebru Berra Alkan", "Berra Alkan"],
    "Ezel Evin Altındağ": ["Ezel Evin Altındağ", "Ezel Evin"],
    "KLEMENS": ["KLEMENS"],
  };
  const memberArticles = selectedMember
    ? articles.filter((a) => {
        const names = authorAliases[selectedMember.name] ?? [selectedMember.name];
        return names.includes(a.author);
      })
    : [];

  return (
    <main className="min-h-screen bg-warm-50">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <p className="text-coral text-sm font-semibold tracking-widest uppercase mb-4 fade-up">
            Hakkımızda
          </p>
          <h1 className="text-5xl md:text-7xl font-bold text-warm-900 leading-tight mb-6 fade-up-1">
            Kolektif<br />Bilinç
          </h1>
          <p className="text-lg md:text-xl text-warm-900/55 max-w-lg leading-relaxed fade-up-2">
            Klemens, tek bir zihin değil — birbirine bağlı düşüncelerin, merakların ve tutkuların ağıdır.
          </p>
        </div>
      </section>

      {/* ── Synaptic network — desktop ────────────────────────────────────── */}
      <section className="hidden lg:block bg-white pb-6">
        <div className="max-w-6xl mx-auto px-6">
          <svg
            viewBox={`0 0 ${VW} ${VH}`}
            className="w-full"
            style={{ display: "block", overflow: "visible" }}
          >
            <defs>
              <radialGradient id="hk-center-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#FF6D60" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#FF6D60" stopOpacity="0"    />
              </radialGradient>
              <filter id="hk-glow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Ambient glow behind center */}
            <circle cx={CX} cy={CY} r={110} fill="url(#hk-center-glow)" />

            {/* Connection lines */}
            {CONNECTIONS.map((conn, i) => {
              const a = nodePos(conn.from);
              const b = nodePos(conn.to);
              return (
                <motion.path
                  key={i}
                  d={curvePath(a.svgX, a.svgY, b.svgX, b.svgY, conn.bend)}
                  stroke="#FF6D60"
                  strokeWidth={conn.secondary ? 0.5 : 0.85}
                  fill="none"
                  strokeLinecap="round"
                  animate={{
                    opacity: conn.secondary
                      ? [0.04, 0.15, 0.05, 0.13, 0.04]
                      : [0.10, 0.38, 0.12, 0.30, 0.10],
                  }}
                  transition={{
                    duration: conn.dur,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: conn.delay,
                    times: [0, 0.25, 0.5, 0.75, 1],
                  }}
                />
              );
            })}

            {/* ── Center node: Klemens ── */}
            <motion.g
              style={{ cursor: "pointer" }}
              animate={{ y: FY, x: FX }}
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", times: FT }}
              onClick={() => setSelectedId("center")}
            >
              {/* Pulse ring */}
              <motion.circle
                cx={CX} cy={CY} r={42}
                fill="none" stroke="#FF6D60" strokeWidth={1}
                animate={{ r: [42, 76], opacity: [0.55, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
              />
              {/* Circle */}
              <circle cx={CX} cy={CY} r={40} fill="#FF6D60" filter="url(#hk-glow)" />
              {/* "K" glyph */}
              <text
                x={CX} y={CY - 5}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontFamily: "var(--font-jakarta)",
                  fontWeight: 800,
                  fontSize: 16,
                  fill: "white",
                  letterSpacing: "0.02em",
                  pointerEvents: "none",
                }}
              >
                K
              </text>
              <text
                x={CX} y={CY + 12}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontFamily: "var(--font-jakarta)",
                  fontWeight: 600,
                  fontSize: 8,
                  fill: "rgba(255,255,255,0.80)",
                  letterSpacing: "0.18em",
                  pointerEvents: "none",
                }}
              >
                KLEMENS
              </text>
            </motion.g>

            {/* ── Photo clip paths ── */}
            {TEAM.filter((m) => m.photo).map((m) => (
              <clipPath key={`clip-${m.id}`} id={`clip-${m.id}`}>
                <circle cx={m.svgX} cy={m.svgY} r={nodeRadius(m.size)} />
              </clipPath>
            ))}

            {/* ── Member nodes ── */}
            {TEAM.map((member) => {
              const r = nodeRadius(member.size);
              const isHovered  = hoveredId  === member.id;
              const isSelected = selectedId === member.id;
              const active = isHovered || isSelected;
              const fill   = active ? "#FF6D60" : "#2C2319";
              const nameColor   = active ? "#FF6D60" : "#2C2319";
              const nameOpacity = active ? 1 : 0.6;
              const nameFW = active ? 700 : 500;

              return (
                <motion.g
                  key={member.id}
                  style={{
                    cursor: "pointer",
                    transformOrigin: `${member.svgX}px ${member.svgY}px`,
                  }}
                  animate={{ y: FY.map((v) => v * 0.75), x: FX.map((v) => v * 0.75) }}
                  transition={{
                    duration: member.floatDur,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: member.floatDelay,
                    times: FT,
                  }}
                  whileHover={{ scale: 1.14 }}
                  onHoverStart={() => setHoveredId(member.id)}
                  onHoverEnd={() => setHoveredId(null)}
                  onClick={() => setSelectedId(member.id)}
                >
                  {member.photo ? (
                    <>
                      {/* Hit area (invisible but clickable) */}
                      <circle cx={member.svgX} cy={member.svgY} r={r + 4} fill="transparent" />
                      {/* Photo node */}
                      <image
                        href={member.photo}
                        x={member.svgX - r}
                        y={member.svgY - r}
                        width={r * 2}
                        height={r * 2}
                        clipPath={`url(#clip-${member.id})`}
                        preserveAspectRatio="xMidYMid slice"
                        style={{ pointerEvents: "none" }}
                      />
                      {/* Ring */}
                      <circle
                        cx={member.svgX}
                        cy={member.svgY}
                        r={r + 2}
                        fill="none"
                        stroke={active ? "#FF6D60" : "rgba(44,35,25,0.15)"}
                        strokeWidth={active ? 2.5 : 1}
                        style={{ transition: "stroke 0.2s ease, stroke-width 0.2s ease", pointerEvents: "none" }}
                      />
                    </>
                  ) : (
                    <>
                      {/* Initials node */}
                      <circle
                        cx={member.svgX}
                        cy={member.svgY}
                        r={r}
                        style={{ fill, transition: "fill 0.2s ease" }}
                      />
                      <text
                        x={member.svgX}
                        y={member.svgY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{
                          fontFamily: "var(--font-jakarta)",
                          fontWeight: 700,
                          fontSize: member.size === "large" ? 12 : 10,
                          fill: "white",
                          letterSpacing: "0.04em",
                          pointerEvents: "none",
                        }}
                      >
                        {member.initials}
                      </text>
                    </>
                  )}
                  {/* Name label */}
                  <text
                    x={member.svgX}
                    y={member.svgY + r + 16}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      fontFamily: "var(--font-jakarta)",
                      fontWeight: nameFW,
                      fontSize: member.size === "large" ? 11 : 9.5,
                      fill: nameColor,
                      opacity: nameOpacity,
                      transition: "fill 0.2s ease, opacity 0.2s ease",
                      pointerEvents: "none",
                    }}
                  >
                    {member.name}
                  </text>
                </motion.g>
              );
            })}
          </svg>
          <p className="text-center text-xs text-warm-900/30 mt-2 mb-2 tracking-wide">
            Bir üyeye tıklayarak tanıyın
          </p>
        </div>
      </section>

      {/* ── Mobile core team ──────────────────────────────────────────────── */}
      <section className="lg:hidden py-16 px-6 bg-white">
        <div className="max-w-lg mx-auto">
          <p className="text-coral text-sm font-semibold tracking-widest uppercase mb-2">
            Çekirdek Ekip
          </p>
          <p className="text-warm-900/40 text-xs mb-6">Bir üyeye dokunarak tanıyın</p>

          {/* Klemens center + core team */}
          <div className="flex flex-col items-center gap-5 mb-4">
            {/* Klemens hub */}
            <button
              onClick={() => setSelectedId("center")}
              className="w-16 h-16 rounded-full bg-coral flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <span className="text-white font-extrabold text-lg tracking-wide">K</span>
            </button>

            {/* 2x2 grid of core */}
            <div className="grid grid-cols-2 gap-3 w-full">
              {TEAM.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedId(member.id)}
                  className="flex flex-col items-center text-center rounded-2xl bg-warm-50 border border-warm-100 p-4 hover:border-coral/30 hover:shadow-md active:scale-[0.97] transition-all duration-200"
                >
                  {member.photo ? (
                    <Image
                      src={member.photo}
                      alt={member.name}
                      width={56}
                      height={56}
                      className="rounded-full object-cover mb-2.5"
                      style={{ width: 56, height: 56 }}
                    />
                  ) : (
                    <div
                      className="rounded-full flex items-center justify-center text-white font-bold mb-2.5"
                      style={{ width: 56, height: 56, fontSize: 14, background: "#2C2319" }}
                    >
                      {member.initials}
                    </div>
                  )}
                  <p className="font-bold text-warm-900 text-sm leading-tight">{member.name}</p>
                  <p className="text-[11px] text-warm-900/45 mt-0.5">{member.role}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Overlay + sliding panel ───────────────────────────────────────── */}
      <AnimatePresence>
        {selectedMember && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-warm-900/40 backdrop-blur-[2px] z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setSelectedId(null)}
            />

            {/* Panel */}
            <motion.div
              className={`fixed z-50 bg-white overflow-y-auto shadow-2xl ${
                isMobile
                  ? "bottom-0 left-0 right-0 rounded-t-3xl max-h-[88vh]"
                  : "top-0 right-0 h-full w-[400px] rounded-l-3xl"
              }`}
              initial={isMobile ? { y: "100%" } : { x: "100%" }}
              animate={isMobile ? { y: 0 } : { x: 0 }}
              exit={isMobile ? { y: "100%" } : { x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
            >
              {/* Mobile drag handle */}
              {isMobile && (
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-warm-200" />
                </div>
              )}

              <div className="relative p-8 pt-6">
                {/* Close */}
                <button
                  onClick={() => setSelectedId(null)}
                  className="absolute top-5 right-6 p-2 rounded-full text-warm-900/35 hover:text-warm-900 hover:bg-warm-100 transition-colors"
                  aria-label="Kapat"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>

                {/* Avatar */}
                {selectedMember.photo ? (
                  <Image
                    src={selectedMember.photo}
                    alt={selectedMember.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover mb-5"
                  />
                ) : (
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg mb-5"
                    style={{ background: "#FF6D60" }}
                  >
                    {selectedMember.initials}
                  </div>
                )}

                {/* Name + role */}
                <h2 className="text-2xl font-bold text-warm-900 leading-tight mb-1">
                  {selectedMember.name}
                </h2>
                <p className="text-sm text-warm-900/50 mb-5">{selectedMember.role}</p>

                {/* Quote */}
                <p className="text-sm italic text-warm-900/50 leading-relaxed mb-7 border-l-2 border-coral pl-4">
                  &ldquo;{selectedMember.quote}&rdquo;
                </p>

                {/* Social links */}
                <div className="flex flex-col gap-2.5 mb-8">
                  {selectedMember.ig && (
                    <a
                      href={`https://instagram.com/${selectedMember.ig.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-sm text-warm-900/55 hover:text-coral transition-colors"
                    >
                      {igIcon}
                      {selectedMember.ig}
                    </a>
                  )}
                  {selectedMember.mail && (
                    <a
                      href={`mailto:${selectedMember.mail}`}
                      className="flex items-center gap-2.5 text-sm text-warm-900/55 hover:text-coral transition-colors"
                    >
                      {mailIcon}
                      {selectedMember.mail}
                    </a>
                  )}
                </div>

                {/* Divider */}
                <hr className="border-warm-100 mb-6" />

                {/* Articles */}
                <h3 className="text-xs font-bold text-warm-900/35 uppercase tracking-widest mb-4">
                  Yazıları
                </h3>
                {memberArticles.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {memberArticles.map((article) => (
                      <Link
                        key={article.slug}
                        href={`/icerikler/yazi/${article.slug}`}
                        onClick={() => setSelectedId(null)}
                        className="group flex items-start gap-2.5 px-3 py-2.5 rounded-xl hover:bg-warm-50 transition-colors"
                      >
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-coral flex-shrink-0" />
                        <span className="text-sm text-warm-900/65 group-hover:text-warm-900 leading-snug transition-colors">
                          {article.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-warm-900/30 italic">Henüz yazı eklenmemiş.</p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Writers grid ──────────────────────────────────────────────────── */}
      {WRITERS.length > 0 && (
        <section className="py-16 px-6 bg-[#FFFBF7]">
          <div className="max-w-6xl mx-auto">
            <p className="text-coral text-sm font-semibold tracking-widest uppercase mb-2">
              Yazarlarımız
            </p>
            <p className="text-warm-900/45 text-sm mb-10 max-w-lg">
              Farklı disiplinlerden gelen yazarlarımız, Klemens&apos;in kolektif sesini oluşturur.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {WRITERS.map((writer) => (
                <button
                  key={writer.id}
                  onClick={() => setSelectedId(writer.id)}
                  className="text-left rounded-2xl bg-white border border-warm-100 p-4 hover:border-warm-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98]"
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    {writer.photo ? (
                      <Image
                        src={writer.photo}
                        alt={writer.name}
                        width={56}
                        height={56}
                        className="rounded-full object-cover"
                        style={{ width: 56, height: 56 }}
                      />
                    ) : (
                      <div
                        className="rounded-full flex items-center justify-center text-white font-bold"
                        style={{ width: 56, height: 56, fontSize: 14, background: "#2C2319" }}
                      >
                        {writer.initials}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-warm-900 text-sm leading-tight">{writer.name}</p>
                      <p className="text-[11px] text-warm-900/45 mt-1">{writer.role}</p>
                    </div>
                    {writer.quote && (
                      <p className="text-[11px] text-warm-900/40 italic leading-relaxed line-clamp-2">
                        &ldquo;{writer.quote}&rdquo;
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Manifesto + stats ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-warm-100">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-16">
            <p className="text-coral text-sm font-semibold tracking-widest uppercase mb-4">
              Manifestomuz
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-warm-900 leading-tight mb-6">
              Sanat, bir araç.<br />Siz, asıl mesele.
            </h2>
            <p className="text-warm-900/55 text-lg leading-relaxed">
              Sanatı hayatın merkezine koymak için buradayız. Tek bir doğru yorum yoktur — her bakış açısı bu ağa yeni bir boyut katar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {[
              { stat: "200+", label: "Atölye Mezunu" },
              { stat: "12",   label: "Aktif Program"  },
              { stat: "5K+",  label: "Bülten Okuru"   },
            ].map(({ stat, label }) => (
              <div key={label} className="flex flex-col">
                <span className="text-5xl font-bold text-warm-900 mb-2">{stat}</span>
                <span className="text-sm text-warm-900/50 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SSS (FAQ) ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#FFFBF7]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#2D2926] mb-10 text-center">
            Sık Sorulan Sorular
          </h2>
          <div className="space-y-3">
            {[
              { q: "Klemens Art nedir?", a: "Klemens Art, Ankara merkezli bağımsız bir kültür ve sanat platformudur. Sanat tarihi makaleleri, interaktif kültür haritası, atölye çalışmaları ve dijital sergiler aracılığıyla sanatı herkes için erişilebilir kılmayı amaçlıyoruz." },
              { q: "Klemens Art'ın içerikleri ücretsiz mi?", a: "Evet. Tüm makaleler, interaktif kültür haritası, etkinlik takvimi ve dijital sergiler tamamen ücretsizdir. Atölye çalışmaları ücretli olabilir; detaylar atölye sayfalarında belirtilir." },
              { q: "Kültür haritası nasıl çalışır?", a: "Ankara'nın müze, galeri, tiyatro, konser mekanı ve tarihi alanlarını gösteren interaktif bir haritadır. Mekanları ziyaret ederek check-in yapabilir, yıldız toplayabilir, rozet kazanabilir ve kültürel rotaları takip edebilirsiniz." },
              { q: "Atölyelere nasıl kayıt olunur?", a: "Atölyeler sayfasından ilgilendiğiniz atölyeyi seçip online ödeme yaparak kayıt olabilirsiniz. Kayıt sonrası detaylı bilgi ve hazırlık kiti e-posta ile gönderilir." },
              { q: "Loca Club nedir?", a: "Loca Club, Klemens Art'ın üyelik programıdır. Üyeler atölyelere erken erişim, özel içerikler ve kültür haritasında gelişmiş gamification özellikleri gibi avantajlardan yararlanır." },
              { q: "Klemens Art'a nasıl katkıda bulunabilirim?", a: "Yazar, fotoğrafçı veya içerik üreticisi olarak ekibimize katılabilirsiniz. Hakkımızda sayfasından ekip üyelerimizi inceleyebilir, sosyal medya hesaplarımız üzerinden bizimle iletişime geçebilirsiniz." },
            ].map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-warm-900">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Bu ağın bir parçası olmak ister misiniz?
          </h2>
          <p className="text-white/50 text-lg mb-10 max-w-md mx-auto leading-relaxed">
            Yazar, tasarımcı veya düşünür olarak Klemens ailesine katılın.
          </p>
          <a
            href="mailto:info@klemensart.com"
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-coral text-white font-semibold rounded-full hover:opacity-90 active:scale-95 transition-all duration-200"
          >
            Bize Ulaşın
            {arrowIcon}
          </a>
          <p className="mt-5 text-white/25 text-sm">info@klemensart.com</p>
        </div>
      </section>

    </main>
  );
}
