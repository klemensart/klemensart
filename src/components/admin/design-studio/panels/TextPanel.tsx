"use client";

import { useDesignStore } from "../hooks/useDesignStore";

const FONT_FAMILIES = [
  "Plus Jakarta Sans",
  "Playfair Display",
  "Georgia",
  "Arial",
  "Courier New",
];

const PRESETS = [
  { label: "Başlık", fontSize: 64, fontFamily: "Playfair Display", fontStyle: "bold" },
  { label: "Alt Başlık", fontSize: 36, fontFamily: "Plus Jakarta Sans", fontStyle: "bold" },
  { label: "Gövde", fontSize: 24, fontFamily: "Plus Jakarta Sans", fontStyle: "normal" },
  { label: "Küçük", fontSize: 16, fontFamily: "Plus Jakarta Sans", fontStyle: "normal" },
];

export default function TextPanel() {
  const addObject = useDesignStore((s) => s.addObject);
  const selectedId = useDesignStore((s) => s.selectedId);
  const objects = useDesignStore((s) => s.objects);
  const updateObject = useDesignStore((s) => s.updateObject);
  const pushHistory = useDesignStore((s) => s.pushHistory);

  const selected = objects.find((o) => o.id === selectedId && o.type === "text");

  return (
    <div className="p-4 space-y-5">
      {/* Add text presets */}
      <div>
        <h3 className="text-xs font-semibold text-warm-900/50 uppercase tracking-wider mb-3">
          Metin Ekle
        </h3>
        <div className="space-y-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() =>
                addObject({
                  type: "text",
                  x: 100,
                  y: 100,
                  width: 600,
                  text: p.label === "Başlık" ? "Başlık metni" : p.label === "Alt Başlık" ? "Alt başlık metni" : "Metin girin",
                  fontSize: p.fontSize,
                  fontFamily: p.fontFamily,
                  fontStyle: p.fontStyle,
                  fill: "#2D2926",
                  align: "left",
                  opacity: 1,
                  rotation: 0,
                })
              }
              className="w-full text-left px-3 py-2.5 rounded-xl border border-warm-100 hover:border-coral/30 hover:bg-coral/5 transition-colors"
            >
              <span
                style={{
                  fontFamily: p.fontFamily,
                  fontSize: Math.min(p.fontSize / 3, 20),
                  fontWeight: p.fontStyle === "bold" ? 700 : 400,
                }}
                className="text-warm-900"
              >
                {p.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Edit selected text */}
      {selected && (
        <div className="border-t border-warm-100 pt-4 space-y-3">
          <h3 className="text-xs font-semibold text-warm-900/50 uppercase tracking-wider">
            Metin Düzenle
          </h3>

          {/* Font family */}
          <div>
            <label className="text-xs text-warm-900/60 mb-1 block">Font</label>
            <select
              value={selected.fontFamily || "Plus Jakarta Sans"}
              onChange={(e) => {
                updateObject(selected.id, { fontFamily: e.target.value });
                pushHistory();
              }}
              className="w-full px-3 py-2 border border-warm-100 rounded-lg text-sm bg-white text-warm-900"
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Font size */}
          <div>
            <label className="text-xs text-warm-900/60 mb-1 block">Boyut</label>
            <input
              type="number"
              min={8}
              max={200}
              value={Math.round(selected.fontSize || 24)}
              onChange={(e) => {
                updateObject(selected.id, { fontSize: Number(e.target.value) });
                pushHistory();
              }}
              className="w-full px-3 py-2 border border-warm-100 rounded-lg text-sm bg-white text-warm-900"
            />
          </div>

          {/* Color */}
          <div>
            <label className="text-xs text-warm-900/60 mb-1 block">Renk</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selected.fill || "#000000"}
                onChange={(e) => {
                  updateObject(selected.id, { fill: e.target.value });
                  pushHistory();
                }}
                className="w-10 h-10 rounded-lg border border-warm-100 cursor-pointer"
              />
              <input
                type="text"
                value={selected.fill || "#000000"}
                onChange={(e) => {
                  updateObject(selected.id, { fill: e.target.value });
                  pushHistory();
                }}
                className="flex-1 px-3 py-2 border border-warm-100 rounded-lg text-sm bg-white text-warm-900 font-mono"
              />
            </div>
          </div>

          {/* Style buttons */}
          <div>
            <label className="text-xs text-warm-900/60 mb-1 block">Stil</label>
            <div className="flex gap-1">
              {(["bold", "italic"] as const).map((style) => {
                const isActive = (selected.fontStyle || "").includes(style);
                return (
                  <button
                    key={style}
                    onClick={() => {
                      const current = selected.fontStyle || "normal";
                      let newStyle: string;
                      if (isActive) {
                        newStyle = current.replace(style, "").trim() || "normal";
                      } else {
                        newStyle = current === "normal" ? style : `${current} ${style}`;
                      }
                      updateObject(selected.id, { fontStyle: newStyle });
                      pushHistory();
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      isActive
                        ? "bg-coral/10 border-coral/30 text-coral"
                        : "border-warm-100 text-warm-900/60 hover:border-warm-200"
                    }`}
                  >
                    {style === "bold" ? "B" : "I"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alignment */}
          <div>
            <label className="text-xs text-warm-900/60 mb-1 block">Hizalama</label>
            <div className="flex gap-1">
              {(["left", "center", "right"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => {
                    updateObject(selected.id, { align: a });
                    pushHistory();
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    selected.align === a
                      ? "bg-coral/10 border-coral/30 text-coral"
                      : "border-warm-100 text-warm-900/60 hover:border-warm-200"
                  }`}
                >
                  {a === "left" ? "Sol" : a === "center" ? "Orta" : "Sağ"}
                </button>
              ))}
            </div>
          </div>

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
