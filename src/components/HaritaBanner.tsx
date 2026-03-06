const dots = [
  { cx: 100, cy: 85,  color: "#3B82F6", delay: 0 },
  { cx: 220, cy: 55,  color: "#FF6D60", delay: 0.6 },
  { cx: 150, cy: 165, color: "#8B5CF6", delay: 1.2 },
  { cx: 290, cy: 145, color: "#F59E0B", delay: 0.4 },
  { cx: 340, cy: 80,  color: "#7C3AED", delay: 1.8 },
  { cx: 195, cy: 225, color: "#10B981", delay: 1.0 },
];

const lines = [
  [0, 2],
  [2, 5],
  [0, 1],
  [1, 4],
  [2, 3],
  [3, 5],
];

export default function HaritaBanner() {
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

        {/* Animated map visualization */}
        <div
          className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/5"
          style={{ background: "#0d0d0d" }}
        >
          <svg viewBox="0 0 400 280" className="w-full h-full" fill="none">
            {/* Subtle grid */}
            <defs>
              <pattern id="harita-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0L0 0 0 40" stroke="white" strokeWidth="0.3" opacity="0.04" />
              </pattern>
            </defs>
            <rect width="400" height="280" fill="url(#harita-grid)" />

            {/* Route lines */}
            {lines.map(([a, b], i) => (
              <line
                key={i}
                x1={dots[a].cx}
                y1={dots[a].cy}
                x2={dots[b].cx}
                y2={dots[b].cy}
                stroke="white"
                strokeWidth="0.8"
                opacity="0.07"
                strokeDasharray="6 4"
              />
            ))}

            {/* Glowing dots */}
            {dots.map((dot, i) => (
              <g key={i}>
                {/* Outer glow */}
                <circle cx={dot.cx} cy={dot.cy} r="16" fill={dot.color} opacity="0.1">
                  <animate
                    attributeName="r"
                    values="16;24;16"
                    dur="3s"
                    begin={`${dot.delay}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.1;0.02;0.1"
                    dur="3s"
                    begin={`${dot.delay}s`}
                    repeatCount="indefinite"
                  />
                </circle>
                {/* Core dot */}
                <circle cx={dot.cx} cy={dot.cy} r="4" fill={dot.color} opacity="0.9">
                  <animate
                    attributeName="r"
                    values="4;5.5;4"
                    dur="3s"
                    begin={`${dot.delay}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.9;0.5;0.9"
                    dur="3s"
                    begin={`${dot.delay}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            ))}
          </svg>

          {/* Vignette overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 40%, #0d0d0d 100%)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
