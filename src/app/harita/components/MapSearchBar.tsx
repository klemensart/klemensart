"use client";

import { useRef, useEffect } from "react";
import { TYPE_COLORS } from "@/lib/harita-data";
import type { SearchResult } from "@/lib/hooks/useMapSearch";
import type { CulturePlace, Route, PlaceType } from "@/lib/harita-data";

type Props = {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult[];
  onSelectPlace: (place: CulturePlace) => void;
  onSelectRoute: (route: Route) => void;
  isDark: boolean;
};

export default function MapSearchBar({ query, setQuery, results, onSelectPlace, onSelectRoute, isDark }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        // Don't clear query, just blur
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const bg = isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.95)";
  const border = isDark ? "rgba(255,255,255,0.1)" : "#e0e0e0";
  const textColor = isDark ? "#fff" : "#1a1a2e";
  const mutedColor = isDark ? "#888" : "#666";
  const dropBg = isDark ? "rgba(18,18,18,0.97)" : "rgba(255,255,255,0.98)";

  return (
    <div ref={containerRef} style={{ position: "relative", marginBottom: 10 }}>
      {/* Input */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: bg, borderRadius: 10,
        border: `1px solid ${border}`,
        padding: "8px 12px",
        backdropFilter: "blur(12px)",
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={mutedColor} strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Mekan veya rota ara..."
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            color: textColor, fontSize: 13, fontWeight: 500,
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: mutedColor, fontSize: 16, padding: 0, lineHeight: 1,
              display: "flex", alignItems: "center",
            }}
          >
            &times;
          </button>
        )}
      </div>

      {/* Dropdown */}
      {query.length >= 2 && results.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: dropBg, borderRadius: 12,
          border: `1px solid ${border}`,
          backdropFilter: "blur(16px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          maxHeight: 320, overflowY: "auto", zIndex: 50,
          padding: "6px",
        }}>
          {results.map((r, i) => (
            <button
              key={`${r.kind}-${r.label}-${i}`}
              onClick={() => {
                if (r.kind === "place" && r.place) onSelectPlace(r.place);
                if (r.kind === "route" && r.route) onSelectRoute(r.route);
                setQuery("");
              }}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "10px 12px", borderRadius: 8,
                background: "transparent", border: "none",
                cursor: "pointer", textAlign: "left",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              {/* Type color dot */}
              <span style={{
                width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                background: r.kind === "place" && r.place
                  ? TYPE_COLORS[r.place.type as PlaceType]
                  : (r.route?.color || "#FF6D60"),
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  color: textColor, fontSize: 13, fontWeight: 600,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {r.label}
                </div>
                <div style={{ color: mutedColor, fontSize: 11 }}>
                  {r.sub}
                </div>
              </div>
              {r.distance !== undefined && (
                <span style={{ color: mutedColor, fontSize: 11, flexShrink: 0 }}>
                  {r.distance < 1000 ? `${Math.round(r.distance)}m` : `${(r.distance / 1000).toFixed(1)}km`}
                </span>
              )}
              {r.kind === "route" && (
                <span style={{
                  fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 6,
                  background: isDark ? "rgba(255,109,96,0.15)" : "#FFF0EE",
                  color: "#FF6D60", flexShrink: 0,
                }}>
                  Rota
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {query.length >= 2 && results.length === 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: dropBg, borderRadius: 12,
          border: `1px solid ${border}`,
          backdropFilter: "blur(16px)",
          padding: "16px", textAlign: "center",
          color: mutedColor, fontSize: 13, zIndex: 50,
        }}>
          Sonuc bulunamadi
        </div>
      )}
    </div>
  );
}
