"use client";

import { useState, useCallback } from "react";
import type { CulturePlace } from "@/lib/harita-data";

type Props = {
  getRandomPlace: () => CulturePlace;
  onSelect: (place: CulturePlace) => void;
  isDark: boolean;
};

export default function SurpriseButton({ getRandomPlace, onSelect, isDark }: Props) {
  const [spinning, setSpinning] = useState(false);
  const [slotName, setSlotName] = useState<string | null>(null);

  const handleClick = useCallback(() => {
    if (spinning) return;
    setSpinning(true);

    // Slot machine effect: flash random names for 0.8s
    let count = 0;
    const interval = setInterval(() => {
      const rp = getRandomPlace();
      setSlotName(rp.name);
      count++;
      if (count >= 8) {
        clearInterval(interval);
        const final = getRandomPlace();
        setSlotName(final.name);
        setTimeout(() => {
          onSelect(final);
          setSpinning(false);
          setSlotName(null);
        }, 600);
      }
    }, 100);
  }, [spinning, getRandomPlace, onSelect]);

  const bg = isDark ? "rgba(0,0,0,0.7)" : "#fff";
  const border = isDark ? "rgba(255,255,255,0.12)" : "#d1d5db";

  return (
    <div style={{ position: "absolute", bottom: 140, left: 14, zIndex: 15 }}>
      {/* Slot name popup */}
      {slotName && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: "50%",
          transform: "translateX(-50%)", whiteSpace: "nowrap",
          background: "rgba(18,18,18,0.95)", borderRadius: 8,
          padding: "6px 12px", color: "#fff", fontSize: 11, fontWeight: 600,
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,109,96,0.3)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis",
          animation: "toast-show 0.15s ease",
        }}>
          {slotName}
        </div>
      )}

      <button
        onClick={handleClick}
        disabled={spinning}
        title="Surpriz Kesfet"
        style={{
          width: 36, height: 36, borderRadius: 8,
          background: bg,
          border: `1px solid ${border}`,
          boxShadow: isDark ? "none" : "0 2px 6px rgba(0,0,0,0.1)",
          cursor: spinning ? "wait" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
          animation: spinning ? "spin-dice 0.8s linear" : "none",
        }}
      >
        <style>{`
          @keyframes spin-dice {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={spinning ? "#FF6D60" : (isDark ? "#ccc" : "#374151")} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="3" />
          <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          <circle cx="16" cy="8" r="1.5" fill="currentColor" />
          <circle cx="8" cy="16" r="1.5" fill="currentColor" />
          <circle cx="16" cy="16" r="1.5" fill="currentColor" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}
