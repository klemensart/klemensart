"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const VW = 1000;
const VH = 490;

type NodeDef = {
  label: string;
  tooltip: string;
  href: string;
  x: number;
  y: number;
  floatDur: number;
  floatDelay: number;
  isHub?: boolean;
};

const nodes: NodeDef[] = [
  { label: "Atölyeler", tooltip: "Canlı Zoom seansları", href: "/atolyeler", x: 158, y: 118, floatDur: 9, floatDelay: 0 },
  { label: "Testler & Oyunlar", tooltip: "Sanat zevkinizi keşfedin", href: "/testler", x: 422, y: 88, floatDur: 11, floatDelay: 2.2 },
  { label: "E-bülten", tooltip: "Haftalık tematik içerik", href: "#bulten", x: 725, y: 110, floatDur: 10, floatDelay: 1 },
  { label: "İçerikler", tooltip: "Yazılar, analizler", href: "/icerikler", x: 500, y: 248, floatDur: 13, floatDelay: 0.5, isHub: true },
  { label: "Odak", tooltip: "Derinlemesine analizler", href: "/icerikler/odak", x: 218, y: 298, floatDur: 10, floatDelay: 1.8 },
  { label: "Kültür & Sanat", tooltip: "Sanat tarihi, eleştiri", href: "/icerikler/kultur-sanat", x: 498, y: 402, floatDur: 12, floatDelay: 3 },
  { label: "İlham Verenler", tooltip: "Yaratıcılarla sohbetler", href: "/icerikler/ilham-verenler", x: 792, y: 295, floatDur: 9, floatDelay: 1 },
  { label: "Kent & Yaşam", tooltip: "Şehrin kültürel nabzı", href: "/icerikler/kent-yasam", x: 845, y: 408, floatDur: 11, floatDelay: 2.5 },
  { label: "Etkinlikler", tooltip: "Yaklaşan seanslar", href: "#etkinlikler", x: 148, y: 402, floatDur: 8, floatDelay: 1.5 },
  { label: "Hakkımızda", tooltip: "Klemens'in felsefesi", href: "#manifesto", x: 330, y: 452, floatDur: 10, floatDelay: 0.8 },
];

type ConnDef = { a: number; b: number; coral: boolean; delay: number; dur: number; bend: number };

const connections: ConnDef[] = [
  { a: 0, b: 1, coral: false, delay: 0, dur: 7, bend: 0.10 },
  { a: 0, b: 3, coral: false, delay: 2.5, dur: 9, bend: -0.12 },
  { a: 0, b: 8, coral: false, delay: 1.0, dur: 8, bend: 0.08 },
  { a: 1, b: 2, coral: false, delay: 3.0, dur: 10, bend: -0.10 },
  { a: 1, b: 3, coral: false, delay: 1.5, dur: 7, bend: 0.12 },
  { a: 2, b: 6, coral: false, delay: 0.5, dur: 9, bend: -0.08 },
  { a: 3, b: 4, coral: true, delay: 0.0, dur: 8, bend: -0.13 },
  { a: 3, b: 5, coral: true, delay: 1.0, dur: 9, bend: 0.10 },
  { a: 3, b: 6, coral: true, delay: 2.0, dur: 7, bend: -0.10 },
  { a: 3, b: 7, coral: false, delay: 0.8, dur: 10, bend: 0.12 },
  { a: 4, b: 9, coral: false, delay: 2.0, dur: 8, bend: -0.10 },
  { a: 5, b: 7, coral: false, delay: 3.5, dur: 9, bend: 0.08 },
  { a: 8, b: 9, coral: false, delay: 1.2, dur: 7, bend: -0.12 },
  { a: 9, b: 3, coral: false, delay: 4.0, dur: 8, bend: 0.10 },
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

export default function DunyamiziDesktop() {
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
    <div className="rounded-3xl bg-warm-50 border border-warm-100 overflow-hidden">
      <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full h-[520px]" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="dunya-wash" cx="50%" cy="50%" r="58%">
            <stop offset="0%" stopColor="#FF6D60" stopOpacity="0.055" />
            <stop offset="100%" stopColor="#FF6D60" stopOpacity="0" />
          </radialGradient>
          <filter id="dunya-glow" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="tt-shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="7" floodColor="#2C2319" floodOpacity="0.09" />
          </filter>
        </defs>

        <rect width={VW} height={VH} fill="url(#dunya-wash)" />

        {connections.map((c, i) => {
          const na = nodes[c.a], nb = nodes[c.b];
          const isActive = hovered !== null && (hovered === c.a || hovered === c.b);
          return (
            <motion.path
              key={i}
              d={organicPath(na.x, na.y, nb.x, nb.y, c.bend)}
              stroke={c.coral ? "#FF6D60" : "#C8A98A"}
              strokeWidth={isActive ? (c.coral ? 2.0 : 1.4) : (c.coral ? 1.2 : 0.75)}
              fill="none" strokeLinecap="round"
              animate={{
                opacity: isActive
                  ? (c.coral ? 0.75 : 0.52)
                  : (c.coral ? [0.08, 0.52, 0.10, 0.42, 0.08] : [0.04, 0.22, 0.06, 0.17, 0.04]),
              }}
              transition={
                isActive
                  ? { duration: 0.25, ease: "easeOut" }
                  : { duration: c.dur, repeat: Infinity, ease: "easeInOut", delay: c.delay, times: OPACITY_T }
              }
            />
          );
        })}

        {nodes.map((node, i) => {
          const isHov = hovered === i;
          const isHub = node.isHub === true;
          const ttW = 178, ttH = 36;
          const ttRight = node.x < VW / 2;
          const ttBelow = node.y < VH / 2;
          const ttX = ttRight ? node.x + 18 : node.x - 18 - ttW;
          const ttY = ttBelow ? node.y + 16 : node.y - ttH - 16;
          const normalR = isHub ? 8 : 6;
          const hoveredR = isHub ? 14 : 11;
          const normalLabelY = node.y - (isHub ? 15 : 13);
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
              <rect x={node.x - 95} y={node.y - 40} width={190} height={65} fill="transparent" />
              {isHov && (
                <motion.circle cx={node.x} cy={node.y} r={26} fill="#FF6D60" opacity={0.1}
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.2 }}
                />
              )}
              {isHub && !isHov && (
                <motion.circle cx={node.x} cy={node.y} r={10} fill="none" stroke="#FF6D60" strokeWidth={0.8}
                  animate={{ r: [10, 28], opacity: [0.4, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                />
              )}
              <motion.circle
                cx={node.x} cy={node.y}
                animate={{ r: isHov ? hoveredR : normalR, fill: isHov ? "#FF6D60" : (isHub ? "#FF6D60" : "#C8A98A"), opacity: isHov ? 1 : (isHub ? 0.88 : 0.65) }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                filter={isHov || isHub ? "url(#dunya-glow)" : undefined}
              />
              <motion.text
                x={node.x}
                animate={{ y: isHov ? hoveredLabelY : normalLabelY, opacity: isHov ? 1 : (isHub ? 0.78 : 0.55) }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                textAnchor="middle"
                style={{
                  fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
                  fontStyle: "italic", fontSize: isHov ? (isHub ? 16 : 14) : (isHub ? 14 : 12.5),
                  fill: isHov ? "#FF6D60" : "#2C2319", pointerEvents: "none",
                }}
              >
                {node.label}
              </motion.text>
              {isHov && (
                <motion.g initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
                  <rect x={ttX} y={ttY} width={ttW} height={ttH} rx={11} fill="white" stroke="#F0E4D9" strokeWidth={1} filter="url(#tt-shadow)" />
                  <text x={ttX + ttW / 2} y={ttY + ttH / 2 + 4} textAnchor="middle"
                    style={{ fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif", fontSize: 11, fill: "#2C2319", opacity: 0.7, pointerEvents: "none" }}
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
  );
}
