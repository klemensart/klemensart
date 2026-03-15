"use client";

import { useEffect, useRef, useCallback } from "react";

/* ── Static map pins — fixed cultural landmarks ── */
const PINS = [
  { nx: 0.20, ny: 0.24, color: "#3B82F6", label: "müze" },
  { nx: 0.52, ny: 0.16, color: "#FF6D60", label: "galeri" },
  { nx: 0.35, ny: 0.56, color: "#8B5CF6", label: "konser" },
  { nx: 0.73, ny: 0.36, color: "#F59E0B", label: "tarihi" },
  { nx: 0.14, ny: 0.74, color: "#7C3AED", label: "edebiyat" },
  { nx: 0.82, ny: 0.66, color: "#10B981", label: "gastronomi" },
];

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export default function HaritaBanner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number>(0);
  const frameRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const visibleRef = useRef(false);
  const lastDrawRef = useRef(0);

  const draw = useCallback((timestamp?: number) => {
    // Throttle to ~30fps (33ms between frames)
    if (timestamp && timestamp - lastDrawRef.current < 33) {
      if (visibleRef.current) rafRef.current = requestAnimationFrame(draw);
      return;
    }
    lastDrawRef.current = timestamp || 0;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h } = sizeRef.current;
    ctx.clearRect(0, 0, w, h);
    frameRef.current++;

    /* ── Coordinate grid ── */
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
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
    ctx.fillStyle = "rgba(255,255,255,0.13)";
    ctx.textAlign = "left";
    ctx.fillText("39.9°N", 6, h * 0.2 - 4);
    ctx.fillText("39.8°N", 6, h * 0.6 - 4);
    ctx.textAlign = "center";
    ctx.fillText("32.8°E", w * 0.33, h - 6);
    ctx.fillText("32.9°E", w * 0.67, h - 6);

    /* ── Pins ── */
    const pinR = Math.max(8, w * 0.022);
    const labelFs = Math.max(10, Math.round(w * 0.026));
    ctx.font = `${labelFs}px sans-serif`;

    for (let p = 0; p < PINS.length; p++) {
      const pin = PINS[p];
      const px = pin.nx * w;
      const py = pin.ny * h;
      const [cr, cg, cb] = hexToRgb(pin.color);
      const pulse = Math.sin(frameRef.current * 0.01 + p * 1.05);
      const pa = 0.55 + 0.2 * pulse;
      const scale = 1 + 0.08 * pulse;
      const r = pinR * scale;

      // Glow
      const gr = r * 4.5;
      const grad = ctx.createRadialGradient(px, py, r, px, py, gr);
      grad.addColorStop(0, `rgba(${cr},${cg},${cb},${pa * 0.3})`);
      grad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      ctx.beginPath();
      ctx.arc(px, py, gr, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Pin body (circle)
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${cr},${cg},${cb},${pa})`;
      ctx.fill();

      // Pin tail (triangle pointing down)
      ctx.beginPath();
      ctx.moveTo(px - r * 0.5, py + r * 0.7);
      ctx.lineTo(px, py + r * 2.2);
      ctx.lineTo(px + r * 0.5, py + r * 0.7);
      ctx.closePath();
      ctx.fillStyle = `rgba(${cr},${cg},${cb},${pa})`;
      ctx.fill();

      // Inner dot
      ctx.beginPath();
      ctx.arc(px, py, r * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(13,13,13,${pa * 0.7})`;
      ctx.fill();

      // Label
      ctx.textAlign = "left";
      ctx.fillStyle = `rgba(${cr},${cg},${cb},${pa * 0.6})`;
      ctx.fillText(pin.label, px + r + 6, py + labelFs * 0.35);
    }

    if (visibleRef.current) {
      rafRef.current = requestAnimationFrame(draw);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

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
      sizeRef.current = { w, h };
    };

    resize();
    window.addEventListener("resize", resize);

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          rafRef.current = requestAnimationFrame(draw);
        } else {
          cancelAnimationFrame(rafRef.current);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(section);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, [draw]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden" style={{ background: "#141414" }}>
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

        {/* Canvas */}
        <div
          className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/5"
          style={{ background: "#0d0d0d" }}
        >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, transparent 55%, #0d0d0d 100%)" }}
          />
        </div>
      </div>
    </section>
  );
}
