"use client";

import { TEMPLATES } from "../lib/templates";
import { useDesignStore, type CanvasObject } from "../hooks/useDesignStore";

export default function TemplatesPanel() {
  const setMeta = useDesignStore((s) => s.setMeta);
  const loadObjects = useDesignStore((s) => s.loadObjects);

  function applyTemplate(templateId: string) {
    const t = TEMPLATES.find((t) => t.id === templateId);
    if (!t) return;

    if (
      !confirm(
        "Şablonu uygulamak mevcut tasarımı silecek. Devam etmek istiyor musunuz?"
      )
    )
      return;

    setMeta({
      platform: t.platform,
      width: t.width,
      height: t.height,
    });

    // Generate IDs for template objects
    let counter = 0;
    const objectsWithIds: CanvasObject[] = t.objects.map((obj) => ({
      ...obj,
      id: `tpl_${Date.now()}_${++counter}`,
    }));

    loadObjects(objectsWithIds);
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-xs font-semibold text-warm-900/50 uppercase tracking-wider">
        Şablonlar
      </h3>
      <div className="space-y-3">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => applyTemplate(t.id)}
            className="w-full text-left group"
          >
            <div className="border border-warm-100 rounded-xl overflow-hidden hover:border-coral/40 transition-colors">
              {/* Thumbnail preview */}
              <div
                className="h-28 relative"
                style={{
                  backgroundColor:
                    t.objects.find((o) => o.type === "shape")?.fill || "#fff",
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="text-sm font-semibold px-3 text-center"
                    style={{
                      color:
                        t.objects.find((o) => o.type === "text")?.fill ||
                        "#2D2926",
                      fontFamily:
                        t.objects.find((o) => o.type === "text")?.fontFamily ||
                        "Plus Jakarta Sans",
                    }}
                  >
                    {t.objects.find((o) => o.type === "text")?.text || t.name}
                  </span>
                </div>
              </div>
              <div className="px-3 py-2.5 bg-white">
                <span className="text-sm font-medium text-warm-900 group-hover:text-coral transition-colors">
                  {t.name}
                </span>
                <span className="text-xs text-warm-900/40 ml-2">
                  {t.width}×{t.height}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
