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

/* ── Static map pins — fixed cultural landmarks ── */
const PINS = [
  { nx: 0.20, ny: 0.24, color: "#3B82F6", label: "müze" },
  { nx: 0.52, ny: 0.16, color: "#FF6D60", label: "galeri" },
  { nx: 0.35, ny: 0.56, color: "#8B5CF6", label: "konser" },
  { nx: 0.73, ny: 0.36, color: "#F59E0B", label: "tarihi" },
  { nx: 0.14, ny: 0.74, color: "#7C3AED", label: "edebiyat" },
  { nx: 0.82, ny: 0.66, color: "#10B981", label: "gastronomi" },
];

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

    /* ── Coordinate grid (very faint) ── */
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 0.5;
    for (let i = 1; i <= 4; i++) {
      const gy = h * (i / 5);
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
    }
    for (let i = 1; i <= 5; i++) {
      const gx = w * (i / 6);
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
    }
    const coordFs = Math.max(8, Math.round(w * 0.02));
    ctx.font = `${coordFs}px monospace`;
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.textAlign = "left";
    ctx.fillText("39.9°N", 6, h * 0.2 - 4);
    ctx.fillText("39.8°N", 6, h * 0.6 - 4);
    ctx.textAlign = "center";
    ctx.fillText("32.8°E", w * 0.33, h - 6);
    ctx.fillText("32.9°E", w * 0.67, h - 6);

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

    /* ── Static pins + labels ── */
    const pinR = Math.max(5, w * 0.013);
    const labelFs = Math.max(8, Math.round(w * 0.02));
    ctx.font = `${labelFs}px sans-serif`;
    for (let p = 0; p < PINS.length; p++) {
      const pin = PINS[p];
      const px = pin.nx * w;
      const py = pin.ny * h;
      const [cr, cg, cb] = hexToRgb(pin.color);
      const pa = 0.45 + 0.15 * Math.sin(frameRef.current * 0.012 + p * 1.1);

      // Glow
      const gr = pinR * 4;
      const grad = ctx.createRadialGradient(px, py, pinR, px, py, gr);
      grad.addColorStop(0, `rgba(${cr},${cg},${cb},${pa * 0.25})`);
      grad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      ctx.beginPath();
      ctx.arc(px, py, gr, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Pin body (circle)
      ctx.beginPath();
      ctx.arc(px, py, pinR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${cr},${cg},${cb},${pa})`;
      ctx.fill();

      // Pin tail (triangle pointing down)
      ctx.beginPath();
      ctx.moveTo(px - pinR * 0.5, py + pinR * 0.7);
      ctx.lineTo(px, py + pinR * 2);
      ctx.lineTo(px + pinR * 0.5, py + pinR * 0.7);
      ctx.closePath();
      ctx.fillStyle = `rgba(${cr},${cg},${cb},${pa})`;
      ctx.fill();

      // Inner dot
      ctx.beginPath();
      ctx.arc(px, py, pinR * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(13,13,13,${pa * 0.7})`;
      ctx.fill();

      // Label
      ctx.textAlign = "left";
      ctx.fillStyle = `rgba(${cr},${cg},${cb},${pa * 0.55})`;
      ctx.fillText(pin.label, px + pinR + 5, py + labelFs * 0.35);
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
