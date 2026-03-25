"use client";

import { useEffect, useState } from "react";
import { TYPE_COLORS, TYPE_LABELS, type CulturePlace, type PlaceType } from "@/lib/harita-data";

type Props = {
  place: CulturePlace;
  visible: boolean;
  onExplore: () => void;
  onDismiss: () => void;
};

export default function PlaceOfDayToast({ place, visible, onExplore, onDismiss }: Props) {
  const [show, setShow] = useState(false);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setShow(true), 500);
      return () => clearTimeout(t);
    }
  }, [visible]);

  // Auto-hide after 8s
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => {
      setHiding(true);
      setTimeout(() => { onDismiss(); }, 400);
    }, 8000);
    return () => clearTimeout(t);
  }, [show, onDismiss]);

  if (!visible || !show) return null;

  const color = TYPE_COLORS[place.type as PlaceType];

  return (
    <div style={{
      position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
      zIndex: 100, pointerEvents: "auto",
      animation: hiding ? "toast-hide 0.4s ease forwards" : "toast-show 0.5s ease forwards",
    }}>
      <style>{`
        @keyframes toast-show {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes toast-hide {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-20px); }
        }
        @keyframes shimmer-border {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
      <div style={{
        background: "rgba(18,18,18,0.95)",
        backdropFilter: "blur(16px)",
        borderRadius: 14,
        padding: "2px",
        backgroundImage: `linear-gradient(90deg, ${color}40, #FFB30040, ${color}40)`,
        backgroundSize: "200% 100%",
        animation: "shimmer-border 3s linear infinite",
      }}>
        <div style={{
          background: "rgba(18,18,18,0.98)",
          borderRadius: 12,
          padding: "12px 16px",
          display: "flex", alignItems: "center", gap: 12,
          minWidth: 260, maxWidth: 360,
        }}>
          {/* Color dot */}
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: `${color}20`, border: `2px solid ${color}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, flexShrink: 0,
          }}>
            <span role="img" aria-label="star">&#x2728;</span>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "#999", fontSize: 9, fontWeight: 600, letterSpacing: 1, marginBottom: 2 }}>
              GUNUN MEKANI
            </div>
            <div style={{
              color: "#fff", fontSize: 13, fontWeight: 600,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {place.name}
            </div>
            <div style={{ color: color, fontSize: 10, fontWeight: 500 }}>
              {TYPE_LABELS[place.type]}
            </div>
          </div>

          {/* Explore button */}
          <button
            onClick={() => { onExplore(); setHiding(true); setTimeout(onDismiss, 300); }}
            style={{
              padding: "6px 12px", borderRadius: 8,
              background: `${color}20`, border: `1px solid ${color}40`,
              color: color, fontSize: 11, fontWeight: 600,
              cursor: "pointer", flexShrink: 0,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${color}35`; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = `${color}20`; }}
          >
            Kesfet
          </button>

          {/* Close */}
          <button
            onClick={() => { setHiding(true); setTimeout(onDismiss, 300); }}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#666", fontSize: 16, padding: 0, lineHeight: 1,
              flexShrink: 0,
            }}
          >
            &times;
          </button>
        </div>
      </div>
    </div>
  );
}
