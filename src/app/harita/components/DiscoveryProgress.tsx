"use client";

import { useState } from "react";
import type { DistrictProgress } from "@/lib/hooks/useDiscovery";

type Props = {
  discovered: number;
  total: number;
  percent: number;
  districts: DistrictProgress[];
  isDark: boolean;
};

export default function DiscoveryProgress({ discovered, total, percent, districts, isDark }: Props) {
  const [expanded, setExpanded] = useState(false);

  const bg = isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.95)";
  const border = isDark ? "rgba(255,255,255,0.1)" : "#e0e0e0";
  const textColor = isDark ? "#ccc" : "#374151";
  const mutedColor = isDark ? "#888" : "#666";

  return (
    <div style={{
      position: "absolute", bottom: 100, left: 56, zIndex: 15,
      background: bg, borderRadius: 12,
      border: `1px solid ${border}`,
      backdropFilter: "blur(12px)",
      boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.08)",
      overflow: "hidden",
      maxWidth: expanded ? 220 : 180,
      transition: "max-width 0.3s ease",
    }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 12px", width: "100%",
          background: "transparent", border: "none",
          cursor: "pointer", textAlign: "left",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF6D60" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
        </svg>
        <div>
          <div style={{ color: textColor, fontSize: 12, fontWeight: 600 }}>
            {discovered}/{total}
          </div>
          <div style={{ color: mutedColor, fontSize: 9 }}>
            kesfedildi ({percent}%)
          </div>
        </div>
        {/* Progress bar */}
        <div style={{
          flex: 1, height: 4, borderRadius: 2, minWidth: 30,
          background: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb",
        }}>
          <div style={{
            height: "100%", borderRadius: 2,
            background: "linear-gradient(90deg, #FF6D60, #FFB300)",
            width: `${percent}%`, transition: "width 0.5s ease",
          }} />
        </div>
        <svg
          width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke={mutedColor} strokeWidth="2" strokeLinecap="round"
          style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* District details */}
      {expanded && (
        <div style={{ padding: "0 12px 10px", borderTop: `1px solid ${border}` }}>
          {districts.map((d) => (
            <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: textColor, fontSize: 11, fontWeight: 500 }}>{d.name}</div>
              </div>
              <div style={{ color: mutedColor, fontSize: 10, flexShrink: 0 }}>
                {d.discovered}/{d.total}
              </div>
              <div style={{
                width: 40, height: 3, borderRadius: 2, flexShrink: 0,
                background: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb",
              }}>
                <div style={{
                  height: "100%", borderRadius: 2,
                  background: d.percent === 100 ? "#4CAF50" : "#FF6D60",
                  width: `${d.percent}%`,
                }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
