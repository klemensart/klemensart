"use client";

import { motion } from "framer-motion";

// ViewBox dimensions — roughly 4:5 ratio, suits the right-half desktop layout
const VW = 480;
const VH = 600;

type NodeDef = {
  label: string;
  x: number;
  y: number;
  floatDur: number;
  floatDelay: number;
  ta: "start" | "middle" | "end";
  labelDy: number; // vertical offset from dot center to text baseline
  size?: "lg";
};

const nodes: NodeDef[] = [
  { label: "Rönesans",  x: 68,  y: 148, floatDur: 9,   floatDelay: 0,   ta: "start",  labelDy: -16 },
  { label: "Bilinç",    x: 342, y: 118, floatDur: 11,  floatDelay: 2.2, ta: "middle", labelDy: -17 },
  { label: "Katharsis", x: 412, y: 268, floatDur: 10,  floatDelay: 1,   ta: "end",    labelDy: -16 },
  { label: "Avangard",  x: 365, y: 452, floatDur: 12,  floatDelay: 3,   ta: "end",    labelDy:  26 },
  { label: "Sanat",     x: 75,  y: 478, floatDur: 8,   floatDelay: 1.5, ta: "start",  labelDy:  26 },
  { label: "Aura",      x: 240, y: 308, floatDur: 10,  floatDelay: 0.8, ta: "middle", labelDy: -20, size: "lg" },
  { label: "Psikoloji", x: 190, y: 88,  floatDur: 9.5, floatDelay: 0.7, ta: "middle", labelDy: -17 },
  { label: "Sinema",    x: 100, y: 292, floatDur: 10.5,floatDelay: 2.8, ta: "start",  labelDy: -16 },
  { label: "Felsefe",   x: 200, y: 502, floatDur: 8.5, floatDelay: 1.8, ta: "middle", labelDy:  26 },
];

type ConnDef = {
  a: number;
  b: number;
  coral: boolean;
  delay: number;
  dur: number;
  bend: number;
};

const connections: ConnDef[] = [
  // Original connections
  { a: 0, b: 1, coral: false, delay: 0,   dur: 7,  bend:  0.14 },
  { a: 1, b: 2, coral: true,  delay: 1.5, dur: 9,  bend: -0.18 },
  { a: 2, b: 3, coral: false, delay: 3,   dur: 8,  bend:  0.2  },
  { a: 3, b: 4, coral: false, delay: 0.8, dur: 10, bend: -0.13 },
  { a: 4, b: 5, coral: true,  delay: 2,   dur: 7,  bend:  0.18 },
  { a: 5, b: 0, coral: false, delay: 4,   dur: 9,  bend: -0.15 },
  { a: 1, b: 5, coral: false, delay: 1.2, dur: 11, bend:  0.1  },
  { a: 2, b: 5, coral: false, delay: 2.8, dur: 8,  bend: -0.11 },
  // New nodes → hub
  { a: 6, b: 5, coral: false, delay: 0.5, dur: 8,  bend:  0.12 },
  { a: 7, b: 5, coral: true,  delay: 3.5, dur: 8,  bend: -0.14 },
  { a: 8, b: 5, coral: false, delay: 1.8, dur: 9,  bend:  0.1  },
];

/** Quadratic bezier with a perpendicular control-point offset — produces organic, non-mechanical curves */
function organicPath(
  ax: number, ay: number,
  bx: number, by: number,
  bend: number,
): string {
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 0.001) return `M ${ax} ${ay}`;
  const cx = mx + (-dy / len) * len * bend;
  const cy = my + (dx / len) * len * bend;
  return `M ${ax} ${ay} Q ${cx} ${cy} ${bx} ${by}`;
}

// Shared keyframes for the gentle floating motion
const FLOAT_Y   = [0, -7, 3, -5, 2, -3, 0];
const FLOAT_X   = [0,  3, -2, 4, -1,  2, 0];
const FLOAT_T   = [0, 0.15, 0.35, 0.55, 0.7, 0.85, 1];
const OPACITY_T = [0, 0.25, 0.5, 0.75, 1];

export default function SynapseNetwork() {
  return (
    // Only visible on large screens; sits in the right half of the Hero section
    <div
      className="hidden lg:block absolute inset-y-0 right-0 w-1/2 pointer-events-none select-none z-10"
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Warm radial wash — gives the network a soft focal glow */}
          <radialGradient id="syn-wash" cx="52%" cy="50%" r="52%">
            <stop offset="0%"   stopColor="#FF6D60" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#FF6D60" stopOpacity="0"    />
          </radialGradient>

          {/* Soft glow filter for node dots */}
          <filter id="dot-glow" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient background wash */}
        <rect width={VW} height={VH} fill="url(#syn-wash)" />

        {/* ── Connection lines ── */}
        {connections.map((c, i) => {
          const na = nodes[c.a];
          const nb = nodes[c.b];
          return (
            <motion.path
              key={i}
              d={organicPath(na.x, na.y, nb.x, nb.y, c.bend)}
              stroke={c.coral ? "#FF6D60" : "#C8A98A"}
              strokeWidth={c.coral ? 1.1 : 0.65}
              fill="none"
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{
                opacity: c.coral
                  ? [0.05, 0.48, 0.08, 0.40, 0.05]
                  : [0.03, 0.20, 0.05, 0.14, 0.03],
              }}
              transition={{
                duration: c.dur,
                repeat: Infinity,
                ease: "easeInOut",
                delay: c.delay,
                times: OPACITY_T,
              }}
            />
          );
        })}

        {/* ── Concept nodes ── */}
        {nodes.map((n) => {
          const isHub = n.size === "lg"; // "Aura" is the central hub
          return (
            <motion.g
              key={n.label}
              animate={{ y: FLOAT_Y, x: FLOAT_X }}
              transition={{
                duration: n.floatDur,
                repeat: Infinity,
                ease: "easeInOut",
                delay: n.floatDelay,
                times: FLOAT_T,
              }}
            >
              {/* Expanding pulse ring — only on the hub node */}
              {isHub && (
                <motion.circle
                  cx={n.x}
                  cy={n.y}
                  r={6}
                  fill="none"
                  stroke="#FF6D60"
                  strokeWidth={0.75}
                  animate={{ r: [6, 26], opacity: [0.45, 0] }}
                  transition={{
                    duration: 4.8,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: 1.5,
                  }}
                />
              )}

              {/* Node dot */}
              <motion.circle
                cx={n.x}
                cy={n.y}
                r={isHub ? 4.5 : 3}
                fill="#FF6D60"
                filter="url(#dot-glow)"
                animate={{
                  opacity: [0.25, 0.72, 0.30, 0.60, 0.25],
                  r: isHub
                    ? [4, 5.5, 4, 5, 4]
                    : [2.5, 4, 2.8, 3.5, 2.5],
                }}
                transition={{
                  duration: n.floatDur * 0.9,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: n.floatDelay + 0.4,
                  times: OPACITY_T,
                }}
              />

              {/* Concept label — Playfair Display italic */}
              <motion.text
                x={n.x}
                y={n.y + n.labelDy}
                textAnchor={n.ta}
                style={{
                  fontFamily:
                    "var(--font-playfair), 'Playfair Display', Georgia, serif",
                  fontStyle: "italic",
                  fontSize: isHub ? 18 : 13.5,
                  fill: "#2C2319",
                  letterSpacing: isHub ? "0.03em" : "0.01em",
                }}
                animate={{
                  opacity: [0.30, 0.62, 0.34, 0.55, 0.30],
                }}
                transition={{
                  duration: n.floatDur,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: n.floatDelay + 0.65,
                  times: OPACITY_T,
                }}
              >
                {n.label}
              </motion.text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
