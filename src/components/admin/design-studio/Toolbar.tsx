"use client";

import { useState } from "react";
import { useDesignStore } from "./hooks/useDesignStore";
import { useCanvasExport } from "./hooks/useCanvasExport";
import type Konva from "konva";

type Props = {
  stageRef: React.RefObject<Konva.Stage | null>;
  onSave: () => void;
  saving: boolean;
};

const I = {
  save: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  download: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  undo: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  ),
  redo: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
    </svg>
  ),
};

export default function Toolbar({ stageRef, onSave, saving }: Props) {
  const designName = useDesignStore((s) => s.designName);
  const setMeta = useDesignStore((s) => s.setMeta);
  const undo = useDesignStore((s) => s.undo);
  const redo = useDesignStore((s) => s.redo);
  const historyIndex = useDesignStore((s) => s.historyIndex);
  const historyLength = useDesignStore((s) => s.history.length);
  const { downloadImage } = useCanvasExport(stageRef);
  const [showExport, setShowExport] = useState(false);

  return (
    <div className="h-14 bg-white border-b border-warm-100 flex items-center justify-between px-4 gap-4">
      {/* Left: Name */}
      <input
        type="text"
        value={designName}
        onChange={(e) => setMeta({ designName: e.target.value })}
        className="text-sm font-semibold text-warm-900 bg-transparent border-none outline-none hover:bg-warm-50 focus:bg-warm-50 px-2 py-1 rounded-lg transition-colors w-48"
      />

      {/* Center: Undo/Redo */}
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          className="p-2 rounded-lg text-warm-900/50 hover:bg-warm-50 hover:text-warm-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Geri Al (Ctrl+Z)"
        >
          {I.undo}
        </button>
        <button
          onClick={redo}
          disabled={historyIndex >= historyLength - 1}
          className="p-2 rounded-lg text-warm-900/50 hover:bg-warm-50 hover:text-warm-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="İleri Al (Ctrl+Shift+Z)"
        >
          {I.redo}
        </button>
      </div>

      {/* Right: Save + Export */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-warm-900 text-white text-sm font-medium rounded-xl hover:bg-warm-900/90 disabled:opacity-50 transition-colors"
        >
          {I.save}
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowExport(!showExport)}
            className="flex items-center gap-2 px-4 py-2 bg-coral text-white text-sm font-medium rounded-xl hover:bg-coral/90 transition-colors"
          >
            {I.download}
            Dışa Aktar
          </button>

          {showExport && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-warm-100 rounded-xl shadow-lg py-1 z-50 min-w-[140px]">
              <button
                onClick={() => {
                  downloadImage(designName, "png");
                  setShowExport(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-warm-900 hover:bg-warm-50 transition-colors"
              >
                PNG olarak indir
              </button>
              <button
                onClick={() => {
                  downloadImage(designName, "jpeg");
                  setShowExport(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-warm-900 hover:bg-warm-50 transition-colors"
              >
                JPG olarak indir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
