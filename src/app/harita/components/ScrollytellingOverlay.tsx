"use client";

import { useEffect, useRef, useCallback, type RefObject } from "react";
import type { Route } from "@/lib/harita-data";
import { PLACES } from "@/lib/harita-data";
import { placeSlug } from "@/lib/harita-gamification";

type Props = {
  route: Route;
  currentChapter: number;
  setCurrentChapter: (i: number) => void;
  scrollProgress: number;
  setScrollProgress: (p: number) => void;
  onExit: () => void;
  onSelectRoute: (route: Route) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapboxMapRef: RefObject<any>;
  mapboxContainerRef: RefObject<HTMLDivElement | null>;
};

export default function ScrollytellingOverlay({
  route,
  currentChapter,
  setCurrentChapter,
  setScrollProgress,
  onExit,
  onSelectRoute,
  mapboxMapRef,
  mapboxContainerRef,
}: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mapInitialized = useRef(false);

  // Initialize Mapbox
  useEffect(() => {
    if (mapInitialized.current) return;
    mapInitialized.current = true;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.warn("Mapbox token not set. Scrollytelling map will not render.");
      return;
    }

    import("mapbox-gl").then((mapboxgl) => {
      const mbgl = mapboxgl.default || mapboxgl;

      // Add CSS
      if (!document.getElementById("mapbox-gl-css")) {
        const link = document.createElement("link");
        link.id = "mapbox-gl-css";
        link.rel = "stylesheet";
        link.href = "https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css";
        document.head.appendChild(link);
      }

      if (!mapboxContainerRef.current) return;

      (mbgl as typeof mapboxgl.default).accessToken = token;
      const firstStop = route.stops[0];

      const map = new mbgl.Map({
        container: mapboxContainerRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [firstStop.lng, firstStop.lat],
        zoom: 15,
        pitch: 45,
        bearing: 0,
        interactive: false,
      });

      mapboxMapRef.current = map;

      map.on("load", () => {
        // Add route line source
        const coords = route.stops.map((s) => [s.lng, s.lat]);
        map.addSource("route-line", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: coords },
          },
        });

        // Background line
        map.addLayer({
          id: "route-line-bg",
          type: "line",
          source: "route-line",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": route.color,
            "line-width": 6,
            "line-opacity": 0.2,
          },
        });

        // Animated dashed line
        map.addLayer({
          id: "route-line-dash",
          type: "line",
          source: "route-line",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": route.color,
            "line-width": 3,
            "line-opacity": 0.9,
            "line-dasharray": [2, 4],
          },
        });

        // Stop markers
        route.stops.forEach((stop, i) => {
          const el = document.createElement("div");
          el.style.cssText = `
            width:28px;height:28px;border-radius:50%;
            background:${i === 0 ? route.color : "rgba(30,30,30,0.9)"};
            border:2px solid ${route.color};
            display:flex;align-items:center;justify-content:center;
            color:${i === 0 ? "#fff" : route.color};
            font-weight:700;font-size:12px;
          `;
          el.textContent = String(i + 1);

          new mbgl.Marker({ element: el })
            .setLngLat([stop.lng, stop.lat])
            .addTo(map);
        });
      });
    }).catch(() => {
      console.warn("Failed to load mapbox-gl");
    });

    return () => {
      mapInitialized.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fly to chapter on change
  useEffect(() => {
    const map = mapboxMapRef.current;
    if (!map || !route.stops[currentChapter]) return;

    const stop = route.stops[currentChapter];
    const bearing = currentChapter * 30;

    map.flyTo({
      center: [stop.lng, stop.lat],
      zoom: 16,
      pitch: 50,
      bearing: bearing,
      duration: 2000,
      essential: true,
    });

    // Update marker styles
    const markers = mapboxContainerRef.current?.querySelectorAll(".mapboxgl-marker > div");
    markers?.forEach((el, i) => {
      const div = el as HTMLElement;
      if (i === currentChapter) {
        div.style.background = route.color;
        div.style.color = "#fff";
        div.style.boxShadow = `0 0 16px ${route.color}80`;
        div.style.transform = "scale(1.3)";
      } else {
        div.style.background = "rgba(30,30,30,0.9)";
        div.style.color = route.color;
        div.style.boxShadow = "none";
        div.style.transform = "scale(1)";
      }
    });
  }, [currentChapter, route, mapboxMapRef, mapboxContainerRef]);

  // IntersectionObserver for chapters
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-chapter"));
            if (!isNaN(idx)) setCurrentChapter(idx);
          }
        }
      },
      { root: container, threshold: 0.5 }
    );

    chapterRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [setCurrentChapter]);

  // Scroll progress tracking
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const progress = el.scrollTop / (el.scrollHeight - el.clientHeight);
    setScrollProgress(Math.min(1, Math.max(0, progress)));
  }, [setScrollProgress]);

  // Get fun facts for a stop
  const getStopFacts = (stopName: string): string[] => {
    const slug = placeSlug(stopName);
    const place = PLACES.find((p) => placeSlug(p.name) === slug);
    return place?.funFacts || [];
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "#000",
    }}>
      {/* Progress bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3, zIndex: 1010,
        background: "rgba(255,255,255,0.1)",
      }}>
        <div style={{
          height: "100%",
          background: route.color,
          width: `${(currentChapter / (route.stops.length - 1)) * 100}%`,
          transition: "width 0.5s ease",
        }} />
      </div>

      {/* Exit button */}
      <button
        onClick={onExit}
        style={{
          position: "absolute", top: 16, right: 16, zIndex: 1010,
          width: 40, height: 40, borderRadius: 12,
          background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          color: "#fff", fontSize: 20, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.6)"; }}
      >
        &times;
      </button>

      {/* Route title badge */}
      <div style={{
        position: "absolute", top: 16, left: 16, zIndex: 1010,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
        borderRadius: 10, padding: "8px 14px",
        border: `1px solid ${route.color}30`,
      }}>
        <div style={{ color: route.color, fontSize: 10, fontWeight: 600, letterSpacing: 1 }}>
          {route.title}
        </div>
        <div style={{ color: "#888", fontSize: 9, marginTop: 2 }}>
          {currentChapter + 1} / {route.stops.length} durak
        </div>
      </div>

      {/* Mapbox container (background) */}
      <div
        ref={mapboxContainerRef}
        style={{ position: "absolute", inset: 0, zIndex: 1 }}
      />

      {/* Scroll container (foreground) */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{
          position: "absolute", inset: 0, zIndex: 5,
          overflowY: "auto",
          scrollSnapType: "y proximity",
        }}
      >
        {/* Spacer at top */}
        <div style={{ height: "60vh" }} />

        {/* Chapters */}
        {route.stops.map((stop, i) => {
          const facts = getStopFacts(stop.name);
          return (
            <div
              key={i}
              ref={(el) => { chapterRefs.current[i] = el; }}
              data-chapter={i}
              style={{
                minHeight: "80vh",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                padding: "40px 20px",
                scrollSnapAlign: "start",
              }}
            >
              <div style={{
                width: "100%", maxWidth: 420,
                background: "rgba(18,18,18,0.92)",
                backdropFilter: "blur(16px)",
                borderRadius: 16,
                border: `1px solid ${i === currentChapter ? route.color + "40" : "rgba(255,255,255,0.08)"}`,
                padding: "24px",
                transition: "border-color 0.5s, opacity 0.5s",
                opacity: i === currentChapter ? 1 : 0.6,
              }}>
                {/* Stop number */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: route.color, color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ color: "#888", fontSize: 11 }}>
                    Durak {i + 1} / {route.stops.length}
                  </div>
                </div>

                {/* Stop name */}
                <h3 style={{
                  color: "#fff", fontSize: 20, fontWeight: 700,
                  margin: "0 0 14px 0", lineHeight: 1.3,
                }}>
                  {stop.name}
                </h3>

                {/* Story */}
                <div style={{ color: "#bbb", fontSize: 14, lineHeight: 1.8 }}>
                  {stop.story.split("\n\n").map((para, j) => (
                    <p key={j} style={{ margin: j > 0 ? "12px 0 0 0" : 0 }}>{para}</p>
                  ))}
                </div>

                {/* Fun facts */}
                {facts.length > 0 && (
                  <div style={{
                    marginTop: 16,
                    background: "rgba(255,179,0,0.08)",
                    border: "1px solid rgba(255,179,0,0.2)",
                    borderRadius: 12, padding: "12px 14px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                      <span style={{ fontSize: 12 }}>&#x1F4A1;</span>
                      <span style={{ color: "#FFB300", fontSize: 10, fontWeight: 700 }}>Biliyor Musun?</span>
                    </div>
                    {facts.slice(0, 2).map((fact, fi) => (
                      <p key={fi} style={{
                        color: "rgba(255,179,0,0.8)", fontSize: 11, lineHeight: 1.5,
                        margin: fi === 0 ? 0 : "4px 0 0 0",
                      }}>
                        <span style={{ color: "#FFB300", fontWeight: 700 }}>{fi + 1}.</span> {fact}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Final CTA */}
        <div style={{
          minHeight: "60vh",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "40px 20px",
        }}>
          <div style={{
            maxWidth: 400, textAlign: "center",
            background: "rgba(18,18,18,0.92)",
            backdropFilter: "blur(16px)",
            borderRadius: 16,
            border: `1px solid ${route.color}30`,
            padding: "32px 24px",
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{route.icon}</div>
            <h3 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: "0 0 8px 0" }}>
              {route.title}
            </h3>
            <p style={{ color: "#999", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
              {route.stops.length} durak · {route.duration}
            </p>
            <button
              onClick={() => { onExit(); onSelectRoute(route); }}
              style={{
                padding: "12px 28px", borderRadius: 10,
                background: route.color, border: "none",
                color: "#fff", fontSize: 14, fontWeight: 600,
                cursor: "pointer", transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              Bu Rotayi Yuru
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
