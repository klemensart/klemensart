"use client";

import { useDesignStore } from "../hooks/useDesignStore";

type FontGroup = {
  label: string;
  fonts: string[];
};

const FONT_GROUPS: FontGroup[] = [
  {
    label: "Serif — Editorial",
    fonts: [
      "Cormorant Garamond",
      "EB Garamond",
      "Playfair Display",
      "Libre Baskerville",
      "Lora",
      "DM Serif Display",
      "Fraunces",
    ],
  },
  {
    label: "Sans-Serif — Modern",
    fonts: [
      "Plus Jakarta Sans",
      "Space Grotesk",
      "Sora",
    ],
  },
  {
    label: "El Yazısı",
    fonts: [
      "Caveat",
    ],
  },
];

const ALL_FONTS = FONT_GROUPS.flatMap((g) => g.fonts);

const PRESETS = [
  { label: "Başlık", fontSize: 72, fontFamily: "Cormorant Garamond", fontStyle: "bold" },
  { label: "Alt Başlık", fontSize: 40, fontFamily: "Space Grotesk", fontStyle: "bold" },
  { label: "Gövde", fontSize: 26, fontFamily: "EB Garamond", fontStyle: "normal" },
  { label: "Etiket", fontSize: 18, fontFamily: "Space Grotesk", fontStyle: "bold" },
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
                  text: p.label === "Başlık" ? "Başlık metni" : p.label === "Alt Başlık" ? "Alt başlık metni" : p.label === "Etiket" ? "ETİKET" : "Metin girin",
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
                  fontSize: Math.min(p.fontSize / 3, 22),
                  fontWeight: p.fontStyle === "bold" ? 700 : 400,
                }}
                className="text-warm-900"
              >
                {p.label}
              </span>
              <span className="text-[10px] text-warm-900/30 ml-2">{p.fontFamily}</span>
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

          {/* Font family — grouped */}
          <div>
            <label className="text-xs text-warm-900/60 mb-1 block">Font</label>
            <select
              value={selected.fontFamily || "Cormorant Garamond"}
              onChange={(e) => {
                updateObject(selected.id, { fontFamily: e.target.value });
                pushHistory();
              }}
              className="w-full px-3 py-2 border border-warm-100 rounded-lg text-sm bg-white text-warm-900"
              style={{ fontFamily: selected.fontFamily || "Cormorant Garamond" }}
            >
              {FONT_GROUPS.map((g) => (
                <optgroup key={g.label} label={g.label}>
                  {g.fonts.map((f) => (
                    <option key={f} value={f} style={{ fontFamily: f }}>
                      {f}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            {/* Font quick picks */}
            <div className="flex flex-wrap gap-1 mt-2">
              {["Cormorant Garamond", "EB Garamond", "Fraunces", "Space Grotesk", "Caveat"].map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    updateObject(selected.id, { fontFamily: f });
                    pushHistory();
                  }}
                  className={`px-2 py-1 rounded-md text-xs border transition-colors ${
                    selected.fontFamily === f
                      ? "bg-coral/10 border-coral/30 text-coral"
                      : "border-warm-100 text-warm-900/50 hover:border-warm-200"
                  }`}
                  style={{ fontFamily: f }}
                >
                  {f.split(" ")[0]}
                </button>
              ))}
            </div>
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
