"use client";

import { useState } from "react";
import TextPanel from "./panels/TextPanel";
import ShapesPanel from "./panels/ShapesPanel";
import ImagesPanel from "./panels/ImagesPanel";
import TemplatesPanel from "./panels/TemplatesPanel";
import StoryEditPanel from "./panels/StoryEditPanel";
import { useDesignStore } from "./hooks/useDesignStore";

const TABS = [
  {
    id: "text",
    label: "Metin",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="9" y1="20" x2="15" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    ),
  },
  {
    id: "shapes",
    label: "Şekiller",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    ),
  },
  {
    id: "images",
    label: "Görseller",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
  {
    id: "templates",
    label: "Şablonlar",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

const QUICK_COLORS = ["#ffffff", "#FFFBF7", "#F5F0EB", "#2D2926", "#FF6D60", "#8C857E", "#000000"];

export default function SidePanel() {
  const [activeTab, setActiveTab] = useState<TabId>("text");
  const backgroundColor = useDesignStore((s) => s.backgroundColor);
  const setMeta = useDesignStore((s) => s.setMeta);
  const selectedId = useDesignStore((s) => s.selectedId);
  const objects = useDesignStore((s) => s.objects);
  const deleteObject = useDesignStore((s) => s.deleteObject);
  const moveLayer = useDesignStore((s) => s.moveLayer);
  const designName = useDesignStore((s) => s.designName);

  const selected = objects.find((o) => o.id === selectedId);
  const isStory = designName.startsWith("Story —");

  return (
    <div className="w-72 bg-white border-r border-warm-100 flex flex-col h-full overflow-hidden">
      {/* Tabs — Story modunda gizle */}
      {!isStory && (
        <div className="flex border-b border-warm-100">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs transition-colors ${
                activeTab === tab.id
                  ? "text-coral border-b-2 border-coral"
                  : "text-warm-900/40 hover:text-warm-900/70"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto">
        {isStory ? (
          <StoryEditPanel />
        ) : (
          <>
            {activeTab === "text" && <TextPanel />}
            {activeTab === "shapes" && <ShapesPanel />}
            {activeTab === "images" && <ImagesPanel />}
            {activeTab === "templates" && <TemplatesPanel />}
          </>
        )}
      </div>

      {/* Bottom section: Background color + Layer controls */}
      <div className="border-t border-warm-100 p-4 space-y-3">
        {/* Background color */}
        <div>
          <label className="text-xs font-semibold text-warm-900/50 uppercase tracking-wider block mb-2">
            Arka Plan
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setMeta({ backgroundColor: e.target.value })}
              className="w-8 h-8 rounded-lg border border-warm-100 cursor-pointer"
            />
            <div className="flex gap-1">
              {QUICK_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setMeta({ backgroundColor: c })}
                  className={`w-6 h-6 rounded border transition-transform hover:scale-110 ${
                    backgroundColor === c ? "border-coral ring-1 ring-coral" : "border-warm-200"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Layer controls for selected object */}
        {selected && (
          <div>
            <label className="text-xs font-semibold text-warm-900/50 uppercase tracking-wider block mb-2">
              Katman
            </label>
            <div className="flex gap-1">
              <button
                onClick={() => moveLayer(selected.id, "top")}
                className="flex-1 px-2 py-1.5 text-xs border border-warm-100 rounded-lg hover:bg-warm-50 transition-colors text-warm-900/60"
                title="En Öne"
              >
                En Öne
              </button>
              <button
                onClick={() => moveLayer(selected.id, "up")}
                className="flex-1 px-2 py-1.5 text-xs border border-warm-100 rounded-lg hover:bg-warm-50 transition-colors text-warm-900/60"
                title="Öne"
              >
                Öne
              </button>
              <button
                onClick={() => moveLayer(selected.id, "down")}
                className="flex-1 px-2 py-1.5 text-xs border border-warm-100 rounded-lg hover:bg-warm-50 transition-colors text-warm-900/60"
                title="Arkaya"
              >
                Arkaya
              </button>
              <button
                onClick={() => deleteObject(selected.id)}
                className="px-2 py-1.5 text-xs border border-red-200 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                title="Sil"
              >
                Sil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
