"use client";

import { useDesignStore } from "../hooks/useDesignStore";

const SHAPES = [
  {
    label: "Dikdörtgen",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="6" width="24" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    create: () => ({
      type: "shape" as const,
      shapeType: "rect" as const,
      x: 200,
      y: 200,
      width: 250,
      height: 200,
      fill: "#FF6D60",
      opacity: 1,
      rotation: 0,
    }),
  },
  {
    label: "Daire",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    create: () => ({
      type: "shape" as const,
      shapeType: "circle" as const,
      x: 300,
      y: 300,
      width: 200,
      height: 200,
      fill: "#FF6D60",
      opacity: 1,
      rotation: 0,
    }),
  },
  {
    label: "Çizgi",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <line x1="4" y1="16" x2="28" y2="16" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    create: () => ({
      type: "shape" as const,
      shapeType: "line" as const,
      x: 200,
      y: 300,
      width: 400,
      height: 0,
      fill: "#2D2926",
      strokeWidth: 3,
      opacity: 1,
      rotation: 0,
    }),
  },
];

const QUICK_COLORS = ["#FF6D60", "#2D2926", "#FFFBF7", "#F5F0EB", "#8C857E", "#ffffff", "#000000"];

export default function ShapesPanel() {
  const addObject = useDesignStore((s) => s.addObject);
  const selectedId = useDesignStore((s) => s.selectedId);
  const objects = useDesignStore((s) => s.objects);
  const updateObject = useDesignStore((s) => s.updateObject);
  const pushHistory = useDesignStore((s) => s.pushHistory);

  const selected = objects.find((o) => o.id === selectedId && o.type === "shape");

  return (
    <div className="p-4 space-y-5">
      <div>
        <h3 className="text-xs font-semibold text-warm-900/50 uppercase tracking-wider mb-3">
          Şekil Ekle
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {SHAPES.map((s) => (
            <button
              key={s.label}
              onClick={() => addObject(s.create())}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-warm-100 hover:border-coral/30 hover:bg-coral/5 transition-colors text-warm-900/60 hover:text-coral"
            >
              {s.icon}
              <span className="text-xs">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="border-t border-warm-100 pt-4 space-y-3">
          <h3 className="text-xs font-semibold text-warm-900/50 uppercase tracking-wider">
            Şekil Düzenle
          </h3>

          {/* Fill color */}
          <div>
            <label className="text-xs text-warm-900/60 mb-1 block">Dolgu Rengi</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selected.fill || "#FF6D60"}
                onChange={(e) => {
                  updateObject(selected.id, { fill: e.target.value });
                  pushHistory();
                }}
                className="w-10 h-10 rounded-lg border border-warm-100 cursor-pointer"
              />
              <input
                type="text"
                value={selected.fill || "#FF6D60"}
                onChange={(e) => {
                  updateObject(selected.id, { fill: e.target.value });
                  pushHistory();
                }}
                className="flex-1 px-3 py-2 border border-warm-100 rounded-lg text-sm bg-white text-warm-900 font-mono"
              />
            </div>
            <div className="flex gap-1.5 mt-2">
              {QUICK_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    updateObject(selected.id, { fill: c });
                    pushHistory();
                  }}
                  className="w-7 h-7 rounded-lg border border-warm-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Stroke */}
          <div>
            <label className="text-xs text-warm-900/60 mb-1 block">Kenarlık</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selected.stroke || "#000000"}
                onChange={(e) => {
                  updateObject(selected.id, { stroke: e.target.value });
                  pushHistory();
                }}
                className="w-10 h-10 rounded-lg border border-warm-100 cursor-pointer"
              />
              <input
                type="number"
                min={0}
                max={20}
                value={selected.strokeWidth || 0}
                onChange={(e) => {
                  updateObject(selected.id, { strokeWidth: Number(e.target.value) });
                  pushHistory();
                }}
                className="w-20 px-3 py-2 border border-warm-100 rounded-lg text-sm bg-white text-warm-900"
                placeholder="Kalınlık"
              />
            </div>
          </div>

          {/* Corner Radius (only for rect) */}
          {selected.shapeType === "rect" && (
            <div>
              <label className="text-xs text-warm-900/60 mb-1 block">Köşe Yuvarlama</label>
              <input
                type="number"
                min={0}
                max={100}
                value={selected.cornerRadius || 0}
                onChange={(e) => {
                  updateObject(selected.id, { cornerRadius: Number(e.target.value) });
                  pushHistory();
                }}
                className="w-full px-3 py-2 border border-warm-100 rounded-lg text-sm bg-white text-warm-900"
              />
            </div>
          )}

          {/* Opacity */}
          <div>
            <label className="text-xs text-warm-900/60 mb-1 block">
              Opaklık: {Math.round((selected.opacity ?? 1) * 100)}%
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={selected.opacity ?? 1}
              onChange={(e) => updateObject(selected.id, { opacity: Number(e.target.value) })}
              onMouseUp={() => pushHistory()}
              className="w-full accent-coral"
            />
          </div>
        </div>
      )}
    </div>
  );
}
