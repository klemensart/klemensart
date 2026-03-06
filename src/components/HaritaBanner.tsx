"use client";

import { useEffect, useRef, useCallback } from "react";

/* ── Colours matching the /harita map types ── */
const PALETTE = [
  "#3B82F6", // müze — blue
  "#FF6D60", // galeri — coral
  "#8B5CF6", // konser — purple
  "#F59E0B", // tarihi — amber
  "#7C3AED", // edebiyat — violet
  "#10B981", // gastronomi — emerald
  "#FF6D60", // coral accent
  "#3B82F6", // blue accent
];

type Dot = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  pulse: number;      // current pulse phase (radians)
  pulseSpeed: number;  // radians per frame
  glowing: boolean;    // currently in glow state
  glowTimer: number;   // frames until next glow toggle
};

/* ── Ankara skyline silhouette drawer ── */
function traceSkyline(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const baseY = h * 0.90;
  const peak = h * 0.42;
  const px = (n: number) => n * w;
  const py = (n: number) => baseY - n * peak;

  ctx.moveTo(0, baseY);

  // Low left buildings
  ctx.lineTo(px(0.04), py(0.06));
  ctx.lineTo(px(0.07), py(0.13));
  ctx.lineTo(px(0.09), py(0.08));

  // Ankara Kalesi — crenellated castle walls
  ctx.lineTo(px(0.11), py(0.16));
  ctx.lineTo(px(0.13), py(0.38));
  ctx.lineTo(px(0.15), py(0.33));
  ctx.lineTo(px(0.16), py(0.40));
  ctx.lineTo(px(0.17), py(0.33));
  ctx.lineTo(px(0.18), py(0.43));
  ctx.lineTo(px(0.19), py(0.35));
  ctx.lineTo(px(0.21), py(0.39));
  ctx.lineTo(px(0.23), py(0.20));
  ctx.lineTo(px(0.26), py(0.12));

  // Low buildings
  ctx.lineTo(px(0.29), py(0.08));
  ctx.lineTo(px(0.31), py(0.15));
  ctx.lineTo(px(0.33), py(0.10));

  // Kocatepe Camii — left minaret
  ctx.lineTo(px(0.355), py(0.10));
  ctx.lineTo(px(0.36), py(0.52));
  ctx.lineTo(px(0.365), py(0.10));

  // Main dome (smooth curve)
  ctx.lineTo(px(0.38), py(0.18));
  ctx.quadraticCurveTo(px(0.425), py(0.60), px(0.47), py(0.18));

  // Right minaret
  ctx.lineTo(px(0.485), py(0.10));
  ctx.lineTo(px(0.49), py(0.52));
  ctx.lineTo(px(0.495), py(0.10));

  // Gap
  ctx.lineTo(px(0.52), py(0.06));
  ctx.lineTo(px(0.54), py(0.13));
  ctx.lineTo(px(0.56), py(0.08));

  // Anıtkabir — flat-roofed rectangular monument
  ctx.lineTo(px(0.58), py(0.10));
  ctx.lineTo(px(0.59), py(0.35));
  ctx.lineTo(px(0.67), py(0.35));
  ctx.lineTo(px(0.68), py(0.10));

  // Buildings
  ctx.lineTo(px(0.71), py(0.08));
  ctx.lineTo(px(0.73), py(0.17));
  ctx.lineTo(px(0.76), py(0.10));

  // Atakule — thin tower with observation disc
  ctx.lineTo(px(0.785), py(0.10));
  ctx.lineTo(px(0.785), py(0.48));
  ctx.lineTo(px(0.775), py(0.53));
  ctx.lineTo(px(0.78), py(0.56));
  ctx.lineTo(px(0.79), py(0.72));
  ctx.lineTo(px(0.80), py(0.56));
  ctx.lineTo(px(0.805), py(0.53));
  ctx.lineTo(px(0.795), py(0.48));
  ctx.lineTo(px(0.795), py(0.10));

  // Fade out right
  ctx.lineTo(px(0.83), py(0.14));
  ctx.lineTo(px(0.87), py(0.08));
  ctx.lineTo(px(0.91), py(0.10));
  ctx.lineTo(px(0.95), py(0.04));
  ctx.lineTo(w, baseY);
}

const DESKTOP_COUNT = 28;
const MOBILE_COUNT = 14;
const CONNECT_DIST = 0.28;  // fraction of canvas diagonal
const SPEED = 0.15;         // px per frame — very slow

function createDots(count: number, w: number, h: number): Dot[] {
  const pad = 0.08;
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    return {
      x: w * (pad + Math.random() * (1 - 2 * pad)),
      y: h * (pad + Math.random() * (1 - 2 * pad)),
      vx: Math.cos(angle) * SPEED * (0.5 + Math.random() * 0.5),
      vy: Math.sin(angle) * SPEED * (0.5 + Math.random() * 0.5),
      r: 2 + Math.random() * 2,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.015 + Math.random() * 0.01,
      glowing: false,
      glowTimer: 120 + Math.floor(Math.random() * 300),
    };
  });
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export default function HaritaBanner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const rafRef = useRef<number>(0);
  const frameRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h } = sizeRef.current;
    const dots = dotsRef.current;
    const diag = Math.sqrt(w * w + h * h);
    const maxDist = diag * CONNECT_DIST;

    ctx.clearRect(0, 0, w, h);
    frameRef.current++;

    /* ── Ankara skyline silhouette (bottom half, breathing) ── */
    const skyPulse = Math.sin(frameRef.current * 0.01); // ~10s cycle at 60fps
    const skyStrokeA = 0.115 + 0.035 * skyPulse;        // 0.08 – 0.15
    const skyFillA = 0.04 + 0.02 * skyPulse;            // 0.02 – 0.06

    // Filled shape (skyline + bottom rectangle)
    ctx.beginPath();
    traceSkyline(ctx, w, h);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = `rgba(255,109,96,${skyFillA})`;
    ctx.fill();

    // Stroke only along the skyline top edge
    ctx.beginPath();
    traceSkyline(ctx, w, h);
    ctx.strokeStyle = `rgba(255,109,96,${skyStrokeA})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    /* ── Update positions ── */
    for (const d of dots) {
      d.x += d.vx;
      d.y += d.vy;

      // Soft bounce off edges
      const pad = 20;
      if (d.x < pad)     { d.x = pad;     d.vx = Math.abs(d.vx); }
      if (d.x > w - pad) { d.x = w - pad; d.vx = -Math.abs(d.vx); }
      if (d.y < pad)     { d.y = pad;     d.vy = Math.abs(d.vy); }
      if (d.y > h - pad) { d.y = h - pad; d.vy = -Math.abs(d.vy); }

      // Pulse phase
      d.pulse += d.pulseSpeed;

      // Glow timer
      d.glowTimer--;
      if (d.glowTimer <= 0) {
        d.glowing = !d.glowing;
        d.glowTimer = d.glowing
          ? 40 + Math.floor(Math.random() * 60)   // glow duration
          : 200 + Math.floor(Math.random() * 400); // rest duration
      }
    }

    /* ── Draw connections ── */
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > maxDist) continue;

        const alpha = (1 - dist / maxDist) * 0.12;
        ctx.beginPath();
        ctx.moveTo(dots[i].x, dots[i].y);

        // Slight curve for organic feel
        const mx = (dots[i].x + dots[j].x) / 2;
        const my = (dots[i].y + dots[j].y) / 2;
        const nx = -(dots[i].y - dots[j].y);
        const ny = dots[i].x - dots[j].x;
        const len = Math.sqrt(nx * nx + ny * ny) || 1;
        const bend = 0.06;
        ctx.quadraticCurveTo(
          mx + (nx / len) * dist * bend,
          my + (ny / len) * dist * bend,
          dots[j].x,
          dots[j].y,
        );

        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    /* ── Draw dots ── */
    for (const d of dots) {
      const [cr, cg, cb] = hexToRgb(d.color);
      const pulseFactor = 0.5 + 0.5 * Math.sin(d.pulse);
      const baseAlpha = 0.6 + pulseFactor * 0.35;
      const r = d.r * (0.9 + pulseFactor * 0.15);

      // Glow
      if (d.glowing) {
        const glowR = r * 5;
        const grad = ctx.createRadialGradient(d.x, d.y, r, d.x, d.y, glowR);
        grad.addColorStop(0, `rgba(${cr},${cg},${cb},0.2)`);
        grad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.beginPath();
        ctx.arc(d.x, d.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Core dot
      ctx.beginPath();
      ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${cr},${cg},${cb},${baseAlpha})`;
      ctx.fill();
    }

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const isMobile = w < 500;
      const count = isMobile ? MOBILE_COUNT : DESKTOP_COUNT;

      // Re-create dots if size changed significantly or first init
      const prev = sizeRef.current;
      if (Math.abs(prev.w - w) > 50 || Math.abs(prev.h - h) > 50 || dotsRef.current.length === 0) {
        dotsRef.current = createDots(count, w, h);
      }
      sizeRef.current = { w, h };
    };

    resize();
    window.addEventListener("resize", resize);

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  return (
    <section className="relative overflow-hidden" style={{ background: "#141414" }}>
      <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        {/* Text */}
        <div>
          <span
            className="block mb-4"
            style={{ color: "#FF6D60", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" as const }}
          >
            KLEMENS
          </span>
          <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight mb-5">
            Ankara&apos;n&#305;n<br />K&uuml;lt&uuml;r Haritas&#305;
          </h2>
          <p className="text-white/40 text-sm md:text-base leading-relaxed mb-8 max-w-md">
            63 k&uuml;lt&uuml;rel mekan, 13 tematik rota, gizli hikayeler.
            Ba&#351;kentin g&ouml;r&uuml;nmez katmanlar&#305;n&#305; ke&#351;fedin.
          </p>
          <a
            href="/harita"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-coral text-white text-sm font-semibold rounded-full hover:opacity-90 active:scale-95 transition-all duration-150"
          >
            Haritay&#305; Ke&#351;fet
            <span className="text-base">&rarr;</span>
          </a>
        </div>

        {/* Canvas animation */}
        <div
          className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/5"
          style={{ background: "#0d0d0d" }}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
          />
          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, transparent 40%, #0d0d0d 100%)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
