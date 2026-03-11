"use client";

import { useState } from "react";
import { TEMPLATES, type Template } from "../lib/templates";
import { useDesignStore, type CanvasObject } from "../hooks/useDesignStore";

// Derive editable text fields from a template
function getEditableFields(t: Template) {
  return t.objects
    .map((obj, idx) => ({ obj, idx }))
    .filter(({ obj }) => obj.type === "text")
    .map(({ obj, idx }) => {
      // Assign a human-readable label based on font size / position
      let label = "Metin";
      const fs = obj.fontSize || 24;
      if (fs >= 70) label = "Ana Başlık";
      else if (fs >= 48) label = "Başlık";
      else if (fs >= 32) label = "Alt Başlık";
      else if (fs >= 26) label = "Gövde Metin";
      else if (fs >= 20) label = "Etiket";
      else label = "Küçük Metin";
      return { idx, label, text: obj.text || "", fontFamily: obj.fontFamily || "" };
    });
}

export default function TemplatesPanel() {
  const setMeta = useDesignStore((s) => s.setMeta);
  const loadObjects = useDesignStore((s) => s.loadObjects);

  const [selected, setSelected] = useState<Template | null>(null);
  const [editTexts, setEditTexts] = useState<Record<number, string>>({});

  function selectTemplate(t: Template) {
    setSelected(t);
    // Init editable texts
    const texts: Record<number, string> = {};
    t.objects.forEach((obj, idx) => {
      if (obj.type === "text") {
        texts[idx] = obj.text || "";
      }
    });
    setEditTexts(texts);
  }

  function applyTemplate() {
    if (!selected) return;

    setMeta({
      platform: selected.platform,
      width: selected.width,
      height: selected.height,
    });

    let counter = 0;
    const objectsWithIds: CanvasObject[] = selected.objects.map((obj, idx) => ({
      ...obj,
      // Override text with edited values
      ...(obj.type === "text" && editTexts[idx] !== undefined
        ? { text: editTexts[idx] }
        : {}),
      id: `tpl_${Date.now()}_${++counter}`,
    }));

    loadObjects(objectsWithIds);
    setSelected(null);
  }

  // ── Selected template: edit form ──────────────────
  if (selected) {
    const fields = getEditableFields(selected);
    const bgObj = selected.objects.find((o) => o.type === "shape");
    const bgColor = bgObj?.fill || "#fff";
    const firstText = selected.objects.find((o) => o.type === "text");

    return (
      <div className="p-4 space-y-4">
        {/* Back button */}
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-2 text-sm text-warm-900/50 hover:text-warm-900 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Şablonlara Dön
        </button>

        <div className="border-b border-warm-100 pb-3">
          {/* Mini preview */}
          <div
            className="h-24 rounded-xl mb-3 flex items-center justify-center"
            style={{ backgroundColor: bgColor }}
          >
            <span
              className="text-sm font-semibold px-4 text-center"
              style={{
                color: firstText?.fill || "#2D2926",
                fontFamily: firstText?.fontFamily || "Cormorant Garamond",
              }}
            >
              {selected.name}
            </span>
          </div>
          <h3 className="text-sm font-bold text-warm-900">{selected.name}</h3>
          <p className="text-xs text-warm-900/40">{selected.width}×{selected.height}</p>
        </div>

        {/* Editable fields */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-warm-900/50 uppercase tracking-wider">
            İçerikleri Düzenle
          </h4>
          {fields.map(({ idx, label, fontFamily }) => (
            <div key={idx}>
              <label className="text-xs text-warm-900/60 mb-1 flex items-center gap-2">
                {label}
                <span className="text-warm-900/25 text-[10px]">{fontFamily.split(" ")[0]}</span>
              </label>
              {(editTexts[idx] || "").length > 60 ? (
                <textarea
                  value={editTexts[idx] || ""}
                  onChange={(e) => setEditTexts({ ...editTexts, [idx]: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-warm-100 rounded-lg text-sm bg-white text-warm-900 focus:outline-none focus:border-coral resize-none"
                  style={{ fontFamily }}
                />
              ) : (
                <input
                  type="text"
                  value={editTexts[idx] || ""}
                  onChange={(e) => setEditTexts({ ...editTexts, [idx]: e.target.value })}
                  className="w-full px-3 py-2 border border-warm-100 rounded-lg text-sm bg-white text-warm-900 focus:outline-none focus:border-coral"
                  style={{ fontFamily }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Apply */}
        <button
          onClick={applyTemplate}
          className="w-full py-3 bg-coral text-white text-sm font-semibold rounded-xl hover:bg-coral/90 transition-colors"
        >
          Şablonu Uygula
        </button>

        <p className="text-[11px] text-warm-900/30 text-center">
          Mevcut tasarımın üzerine yazılacak
        </p>
      </div>
    );
  }

  // ── Template grid ─────────────────────────────────
  return (
    <div className="p-4 space-y-4">
      <h3 className="text-xs font-semibold text-warm-900/50 uppercase tracking-wider">
        Şablonlar
      </h3>
      <div className="space-y-3">
        {TEMPLATES.map((t) => {
          const bgObj = t.objects.find((o) => o.type === "shape");
          const bgColor = bgObj?.fill || "#fff";
          const firstText = t.objects.find((o) => o.type === "text");
          const titleText = t.objects.find(
            (o) => o.type === "text" && (o.fontSize || 0) >= 48
          );

          return (
            <button
              key={t.id}
              onClick={() => selectTemplate(t)}
              className="w-full text-left group"
            >
              <div className="border border-warm-100 rounded-xl overflow-hidden hover:border-coral/40 hover:shadow-sm transition-all">
                {/* Thumbnail preview */}
                <div
                  className="h-32 relative flex flex-col items-center justify-center gap-1 px-4"
                  style={{ backgroundColor: bgColor }}
                >
                  {titleText && (
                    <span
                      className="text-center leading-tight"
                      style={{
                        color: titleText.fill || "#2D2926",
                        fontFamily: titleText.fontFamily || "Cormorant Garamond",
                        fontSize: Math.min((titleText.fontSize || 48) / 4.5, 22),
                        fontWeight: (titleText.fontStyle || "").includes("bold") ? 700 : 400,
                        fontStyle: (titleText.fontStyle || "").includes("italic") ? "italic" : "normal",
                      }}
                    >
                      {(titleText.text || "").split("\n")[0]}
                    </span>
                  )}
                  {!titleText && firstText && (
                    <span
                      className="text-sm text-center"
                      style={{
                        color: firstText.fill || "#2D2926",
                        fontFamily: firstText.fontFamily || "Cormorant Garamond",
                      }}
                    >
                      {firstText.text || t.name}
                    </span>
                  )}
                </div>
                <div className="px-3 py-2.5 bg-white flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-warm-900 group-hover:text-coral transition-colors">
                      {t.name}
                    </span>
                    <span className="text-xs text-warm-900/30 ml-2">
                      {t.width}×{t.height}
                    </span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-warm-900/20 group-hover:text-coral transition-colors">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
