"use client";

import { TYPE_COLORS, TYPE_LABELS, type CulturePlace, type PlaceType } from "@/lib/harita-data";

type Props = {
  places: CulturePlace[];
  onSelect: (place: CulturePlace) => void;
  compact?: boolean;
};

export default function SimilarPlaces({ places, onSelect, compact }: Props) {
  if (places.length === 0) return null;

  return (
    <div style={{ marginBottom: compact ? 12 : 16 }}>
      <div style={{
        color: "#999", fontSize: compact ? 10 : 11,
        fontWeight: 600, letterSpacing: 1, marginBottom: compact ? 8 : 10,
      }}>
        BENZER MEKANLAR
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: compact ? 6 : 8,
      }}>
        {places.map((p) => (
          <button
            key={p.name}
            onClick={() => onSelect(p)}
            style={{
              display: "flex", alignItems: "flex-start", gap: 8,
              padding: compact ? "8px 10px" : "10px 12px",
              borderRadius: compact ? 8 : 10,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              cursor: "pointer", textAlign: "left",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
          >
            <span style={{
              width: 6, height: 6, borderRadius: "50%", marginTop: 4, flexShrink: 0,
              background: TYPE_COLORS[p.type as PlaceType],
            }} />
            <div style={{ minWidth: 0 }}>
              <div style={{
                color: "#ddd", fontSize: compact ? 11 : 12, fontWeight: 600,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {p.name}
              </div>
              <div style={{
                color: "#777", fontSize: compact ? 9 : 10, lineHeight: 1.3, marginTop: 2,
                overflow: "hidden", textOverflow: "ellipsis",
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              }}>
                {TYPE_LABELS[p.type]}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
