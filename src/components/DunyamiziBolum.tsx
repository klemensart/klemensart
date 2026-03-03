"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ── ViewBox — wide landscape, fills the canvas container with "slice" ──────
const VW = 1000;
const VH = 490;

type NodeDef = {
  label: string;
  tooltip: string; // short text for SVG tooltip
  desc: string;    // longer text for mobile cards
  href: string;
  x: number;
  y: number;
  floatDur: number;
  floatDelay: number;
  isHub?: boolean;
};

const nodes: NodeDef[] = [
  {
    label: "Atölyeler",
    tooltip: "Canlı Zoom seansları",
    desc: "Uzman rehberliğinde küçük gruplarla Zoom atölyeleri",
    href: "#hizmetler",
    x: 158, y: 118, floatDur: 9, floatDelay: 0,
  },
  {
    label: "Testler & Oyunlar",
    tooltip: "Sanat zevkinizi keşfedin",
    desc: "İç dünyanızla sanat zevklerinizi buluşturun",
    href: "#hizmetler",
    x: 422, y: 88, floatDur: 11, floatDelay: 2.2,
  },
  {
    label: "E-bülten",
    tooltip: "Haftalık tematik içerik",
    desc: "Kültür ve sanat dünyasından haftalık seçkiler",
    href: "#bulten",
    x: 725, y: 110, floatDur: 10, floatDelay: 1,
  },
  {
    label: "İçerikler",
    tooltip: "Yazılar, analizler",
    desc: "Yazılar, analizler ve röportajlar — tüm kategoriler",
    href: "/icerikler",
    x: 500, y: 248, floatDur: 13, floatDelay: 0.5,
    isHub: true,
  },
  {
    label: "Odak",
    tooltip: "Derinlemesine analizler",
    desc: "Bir eseri, dönemi ya da fikri derinlemesine inceleyin",
    href: "/icerikler/odak",
    x: 218, y: 298, floatDur: 10, floatDelay: 1.8,
  },
  {
    label: "Kültür & Sanat",
    tooltip: "Sanat tarihi, eleştiri",
    desc: "Sanat tarihi, eleştiri ve güncel sergi incelemeleri",
    href: "/icerikler/kultur-sanat",
    x: 498, y: 402, floatDur: 12, floatDelay: 3,
  },
  {
    label: "İlham Verenler",
    tooltip: "Yaratıcılarla sohbetler",
    desc: "Yaratıcı insanlarla kısa ama derin röportajlar",
    href: "/icerikler/ilham-verenler",
    x: 792, y: 295, floatDur: 9, floatDelay: 1,
  },
  {
    label: "Kent & Yaşam",
    tooltip: "Şehrin kültürel nabzı",
    desc: "Şehrin kültürel nabzını tutuyoruz",
    href: "/icerikler/kent-yasam",
    x: 845, y: 408, floatDur: 11, floatDelay: 2.5,
  },
  {
    label: "Etkinlikler",
    tooltip: "Yaklaşan seanslar",
    desc: "Yaklaşan atölye, seminer ve program takvimi",
    href: "#etkinlikler",
    x: 148, y: 402, floatDur: 8, floatDelay: 1.5,
  },
  {
    label: "Hakkımızda",
    tooltip: "Klemens'in felsefesi",
    desc: "Klemens'in yaklaşımı, felsefesi ve ekip",
    href: "#manifesto",
    x: 330, y: 452, floatDur: 10, floatDelay: 0.8,
  },
];

type ConnDef = { a: number; b: number; coral: boolean; delay: number; dur: number; bend: number };

const connections: ConnDef[] = [
  { a: 0, b: 1, coral: false, delay: 0,   dur: 7,  bend:  0.10 },
  { a: 0, b: 3, coral: false, delay: 2.5, dur: 9,  bend: -0.12 },
  { a: 0, b: 8, coral: false, delay: 1.0, dur: 8,  bend:  0.08 },
  { a: 1, b: 2, coral: false, delay: 3.0, dur: 10, bend: -0.10 },
  { a: 1, b: 3, coral: false, delay: 1.5, dur: 7,  bend:  0.12 },
  { a: 2, b: 6, coral: false, delay: 0.5, dur: 9,  bend: -0.08 },
  { a: 3, b: 4, coral: true,  delay: 0.0, dur: 8,  bend: -0.13 },
  { a: 3, b: 5, coral: true,  delay: 1.0, dur: 9,  bend:  0.10 },
  { a: 3, b: 6, coral: true,  delay: 2.0, dur: 7,  bend: -0.10 },
  { a: 3, b: 7, coral: false, delay: 0.8, dur: 10, bend:  0.12 },
  { a: 4, b: 9, coral: false, delay: 2.0, dur: 8,  bend: -0.10 },
  { a: 5, b: 7, coral: false, delay: 3.5, dur: 9,  bend:  0.08 },
  { a: 8, b: 9, coral: false, delay: 1.2, dur: 7,  bend: -0.12 },
  { a: 9, b: 3, coral: false, delay: 4.0, dur: 8,  bend:  0.10 },
];

function organicPath(ax: number, ay: number, bx: number, by: number, bend: number): string {
  const mx = (ax + bx) / 2, my = (ay + by) / 2;
  const dx = bx - ax, dy = by - ay;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 0.001) return `M ${ax} ${ay}`;
  return `M ${ax} ${ay} Q ${mx + (-dy / len) * len * bend} ${my + (dx / len) * len * bend} ${bx} ${by}`;
}

const FLOAT_Y = [0, -6, 2.5, -4, 1.5, -2.5, 0];
const FLOAT_X = [0, 2.5, -1.5, 3.5, -1, 1.5, 0];
const FLOAT_T = [0, 0.15, 0.35, 0.55, 0.7, 0.85, 1];
const OPACITY_T = [0, 0.25, 0.5, 0.75, 1];

// Mobile card accent colours — full class strings so Tailwind includes them
const CARD_COLORS = [
  { badge: "bg-coral/10 text-coral",    ring: "hover:border-coral/30"    },
  { badge: "bg-amber-50 text-amber-700", ring: "hover:border-amber-200"  },
  { badge: "bg-sky-50 text-sky-700",     ring: "hover:border-sky-200"    },
  { badge: "bg-coral/10 text-coral",    ring: "hover:border-coral/30"    },
  { badge: "bg-coral/10 text-coral",    ring: "hover:border-coral/30"    },
  { badge: "bg-amber-50 text-amber-700", ring: "hover:border-amber-200"  },
  { badge: "bg-sky-50 text-sky-700",     ring: "hover:border-sky-200"    },
  { badge: "bg-emerald-50 text-emerald-700", ring: "hover:border-emerald-200" },
  { badge: "bg-emerald-50 text-emerald-700", ring: "hover:border-emerald-200" },
  { badge: "bg-warm-100 text-warm-900/70",   ring: "hover:border-warm-300"   },
];

export default function DunyamiziBolum() {
  const [hovered, setHovered] = useState<number | null>(null);
  const router = useRouter();

  const handleNodeClick = (href: string) => {
    if (href.startsWith("/")) {
      router.push(href);
    } else {
      document.getElementById(href.replace("#", ""))?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="dunyamiz" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">

        {/* ── Section header ── */}
        <div className="text-center mb-14">
          <p className="text-coral text-sm font-semibold tracking-widest uppercase mb-4">Harita</p>
          <h2 className="text-4xl md:text-5xl font-bold text-warm-900 leading-tight mb-4">
            Dünyamızı Keşfet
          </h2>
          <p className="text-warm-900/55 text-lg max-w-lg mx-auto leading-relaxed">
            Klemens evreninde kaybolun — her kavram yeni bir kapı açar.
          </p>
        </div>

        {/* ── DESKTOP: Interactive SVG synapse map ── */}
        <div className="hidden md:block rounded-3xl bg-warm-50 border border-warm-100 overflow-hidden">
          <svg
            viewBox={`0 0 ${VW} ${VH}`}
            className="w-full h-[520px]"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <radialGradient id="dunya-wash" cx="50%" cy="50%" r="58%">
                <stop offset="0%"   stopColor="#FF6D60" stopOpacity="0.055" />
                <stop offset="100%" stopColor="#FF6D60" stopOpacity="0"     />
              </radialGradient>
              <filter id="dunya-glow" x="-120%" y="-120%" width="340%" height="340%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="tt-shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="7" floodColor="#2C2319" floodOpacity="0.09" />
              </filter>
            </defs>

            <rect width={VW} height={VH} fill="url(#dunya-wash)" />

            {/* ── Connection lines ── */}
            {connections.map((c, i) => {
              const na = nodes[c.a], nb = nodes[c.b];
              const isActive = hovered !== null && (hovered === c.a || hovered === c.b);
              return (
                <motion.path
                  key={i}
                  d={organicPath(na.x, na.y, nb.x, nb.y, c.bend)}
                  stroke={c.coral ? "#FF6D60" : "#C8A98A"}
                  strokeWidth={isActive ? (c.coral ? 2.0 : 1.4) : (c.coral ? 1.2 : 0.75)}
                  fill="none"
                  strokeLinecap="round"
                  animate={{
                    opacity: isActive
                      ? (c.coral ? 0.75 : 0.52)
                      : (c.coral
                          ? [0.08, 0.52, 0.10, 0.42, 0.08]
                          : [0.04, 0.22, 0.06, 0.17, 0.04]),
                  }}
                  transition={
                    isActive
                      ? { duration: 0.25, ease: "easeOut" }
                      : { duration: c.dur, repeat: Infinity, ease: "easeInOut", delay: c.delay, times: OPACITY_T }
                  }
                />
              );
            })}

            {/* ── Nodes ── */}
            {nodes.map((node, i) => {
              const isHov = hovered === i;
              const isHub = node.isHub === true;

              // Tooltip anchor — flip sides near edges
              const ttW = 178;
              const ttH = 36;
              const ttRight = node.x < VW / 2;
              const ttBelow  = node.y < VH / 2;
              const ttX = ttRight ? node.x + 18 : node.x - 18 - ttW;
              const ttY = ttBelow  ? node.y + 16 : node.y - ttH - 16;

              const normalR  = isHub ? 8  : 6;
              const hoveredR = isHub ? 14 : 11;
              const normalLabelY  = node.y - (isHub ? 15 : 13);
              const hoveredLabelY = node.y - (isHub ? 21 : 18);

              return (
                <motion.g
                  key={node.label}
                  animate={{ y: FLOAT_Y, x: FLOAT_X }}
                  transition={{ duration: node.floatDur, repeat: Infinity, ease: "easeInOut", delay: node.floatDelay, times: FLOAT_T }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => handleNodeClick(node.href)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Invisible hit area */}
                  <rect x={node.x - 95} y={node.y - 40} width={190} height={65} fill="transparent" />

                  {/* Hover glow ring */}
                  {isHov && (
                    <motion.circle
                      cx={node.x} cy={node.y} r={26}
                      fill="#FF6D60" opacity={0.1}
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}

                  {/* Hub pulse ring (always) */}
                  {isHub && !isHov && (
                    <motion.circle
                      cx={node.x} cy={node.y} r={10}
                      fill="none" stroke="#FF6D60" strokeWidth={0.8}
                      animate={{ r: [10, 28], opacity: [0.4, 0] }}
                      transition={{ duration: 4.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                    />
                  )}

                  {/* Node dot */}
                  <motion.circle
                    cx={node.x} cy={node.y}
                    animate={{
                      r:       isHov ? hoveredR : normalR,
                      fill:    isHov ? "#FF6D60" : (isHub ? "#FF6D60" : "#C8A98A"),
                      opacity: isHov ? 1 : (isHub ? 0.88 : 0.65),
                    }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    filter={isHov || isHub ? "url(#dunya-glow)" : undefined}
                  />

                  {/* Label */}
                  <motion.text
                    x={node.x}
                    animate={{
                      y:       isHov ? hoveredLabelY : normalLabelY,
                      opacity: isHov ? 1 : (isHub ? 0.78 : 0.55),
                    }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    textAnchor="middle"
                    style={{
                      fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
                      fontStyle: "italic",
                      fontSize:   isHov ? (isHub ? 16 : 14) : (isHub ? 14 : 12.5),
                      fill:       isHov ? "#FF6D60" : "#2C2319",
                      pointerEvents: "none",
                    }}
                  >
                    {node.label}
                  </motion.text>

                  {/* Tooltip */}
                  {isHov && (
                    <motion.g
                      initial={{ opacity: 0, y: -3 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <rect
                        x={ttX} y={ttY} width={ttW} height={ttH}
                        rx={11} fill="white" stroke="#F0E4D9" strokeWidth={1}
                        filter="url(#tt-shadow)"
                      />
                      <text
                        x={ttX + ttW / 2} y={ttY + ttH / 2 + 4}
                        textAnchor="middle"
                        style={{
                          fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
                          fontSize: 11,
                          fill: "#2C2319",
                          opacity: 0.7,
                          pointerEvents: "none",
                        }}
                      >
                        {node.tooltip}
                      </text>
                    </motion.g>
                  )}
                </motion.g>
              );
            })}
          </svg>
        </div>

        {/* ── MOBILE: 2-column card grid ── */}
        <div className="md:hidden grid grid-cols-2 gap-3">
          {nodes.map((node, i) => {
            const colors = CARD_COLORS[i];
            const isPage = node.href.startsWith("/");
            const inner = (
              <>
                <span className={`self-start px-2.5 py-1 rounded-full text-[11px] font-semibold mb-3 ${colors.badge}`}>
                  {node.isHub ? "Merkez" : "Keşfet"}
                </span>
                <p className="text-warm-900 font-semibold text-sm leading-snug mb-1.5 line-clamp-2">
                  {node.label}
                </p>
                <p className="text-warm-900/50 text-xs leading-relaxed flex-1 line-clamp-2">
                  {node.desc}
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-coral">
                  <span>Keşfet</span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </>
            );
            const cls = `flex flex-col p-4 rounded-2xl bg-warm-50 border border-warm-100 ${colors.ring} hover:-translate-y-0.5 hover:shadow-md hover:shadow-warm-900/[0.05] transition-all duration-200`;
            return isPage
              ? <Link key={node.label} href={node.href} className={cls}>{inner}</Link>
              : <a   key={node.label} href={node.href} className={cls}>{inner}</a>;
          })}
        </div>

      </div>
    </section>
  );
}
