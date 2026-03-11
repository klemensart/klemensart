"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { PLACES, ROUTES, TYPE_LABELS, type PlaceType, type CulturePlace, type Route } from "@/lib/harita-data";

/* ───────── Types ───────── */

type SupabaseEvent = {
  id: string;
  title: string;
  event_date: string | null;
  end_date: string | null;
  event_type: string | null;
  venue: string | null;
};

type MapMode = "explore" | "routes";

/* ───────── Constants ───────── */

const TYPE_COLORS: Record<PlaceType, string> = {
  müze: "#4A9EFF",
  galeri: "#FF6D60",
  konser: "#9B6BB0",
  tiyatro: "#4CAF50",
  tarihi: "#FFB300",
  edebiyat: "#8B5CF6",
  miras: "#795548",
};

const TYPE_SVGS: Record<PlaceType, string> = {
  müze: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/><path d="M10 10h1"/><path d="M14 10h-1"/></svg>`,
  galeri: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="2.5"/><path d="M17 3a2.5 2.5 0 0 1 0 5"/><path d="M3 19.5C3 10 13.5 12 13.5 6.5"/><path d="M5.5 19.5 3 22"/><path d="M18.5 19.5 21 22"/><path d="M12 19.5a7.5 7.5 0 0 0-7.5 0h15a7.5 7.5 0 0 0-7.5 0z"/></svg>`,
  konser: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  tiyatro: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v4a8 8 0 0 1-8 8H8a8 8 0 0 1-6-3"/><circle cx="10" cy="9" r="1"/><circle cx="16" cy="9" r="1"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg>`,
  tarihi: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M4 21V11l4-4 4 4 4-4 4 4v10"/><path d="M9 21v-4h6v4"/><path d="M3 11h18"/></svg>`,
  edebiyat: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 7h8"/><path d="M8 11h6"/></svg>`,
  miras: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
};

const FILTER_OPTIONS: { key: PlaceType | "all"; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "müze", label: "Müzeler" },
  { key: "galeri", label: "Galeriler" },
  { key: "konser", label: "Konser" },
  { key: "tiyatro", label: "Tiyatro" },
  { key: "tarihi", label: "Tarihi" },
  { key: "edebiyat", label: "Edebiyat" },
  { key: "miras", label: "Kültürel Miras" },
];



/* ───────── Route SVG Icons ───────── */

const ROUTE_ICON_PATHS: Record<number, string> = {
  1: '<path d="M5 7h11 M5 17h11 M5 7v10"/><path d="M16 7c2.5 0 4 2.2 4 5s-1.5 5-4 5"/>',
  2: '<path d="M12 3l7 4v4c0 5.5-3 9.5-7 12-4-2.5-7-6.5-7-12V7z"/>',
  3: '<path d="M6 4h12 M6 20h12 M9 4v16 M15 4v16"/>',
  4: '<path d="M4 12h16 M7 12c0-3 2.2-5 5-5s5 2 5 5"/><circle cx="8.5" cy="16" r="2"/><circle cx="15.5" cy="16" r="2"/><path d="M10.5 16h3"/>',
  5: '<path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z M15 5l4 4"/>',
  6: '<circle cx="12" cy="12" r="3.5"/><path d="M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5.6 5.6l2.1 2.1 M16.3 16.3l2.1 2.1 M5.6 18.4l2.1-2.1 M16.3 7.7l2.1-2.1"/>',
  7: '<path d="M4 18l5-10 3 4 3-6 5 12H4z"/>',
  8: '<path d="M4 17l2-10 4 5 2-6 2 6 4-5 2 10H4z"/>',
  9: '<path d="M12 3C8 8.5 6 11.5 6 14a6 6 0 0 0 12 0c0-2.5-2-5.5-6-11z"/>',
  10: '<path d="M3 20V10h7v10 M14 20V4h7v16"/><path d="M5 13h3 M5 16h3 M16 7h3 M16 11h3 M16 15h3"/>',
  11: '<path d="M2 16h20 M5 16c0-5 3-9 7-9s7 4 7 9"/>',
  12: '<circle cx="9" cy="12" r="2.5"/><circle cx="15" cy="12" r="2.5"/><path d="M7 8l-3-3 M17 8l3-3 M11.5 12h1"/>',
  13: '<path d="M13 2L6 13h5l-2 9 7-11h-5z"/>',
};

function renderRouteIcon(id: number, color: string, size = 24) {
  const bgSize = size + 8;
  return (
    <div
      style={{
        width: bgSize, height: bgSize, borderRadius: "50%",
        background: `${color}1A`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "background 0.2s",
      }}
      onMouseOver={(e) => { e.currentTarget.style.background = `${color}33`; }}
      onMouseOut={(e) => { e.currentTarget.style.background = `${color}1A`; }}
    >
      <svg
        width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
        dangerouslySetInnerHTML={{ __html: ROUTE_ICON_PATHS[id] || "" }}
      />
    </div>
  );
}

/* ───────── Component ───────── */

export default function HaritaPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const routeLayersRef = useRef<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tileLayerRef = useRef<any>(null);
  const fxStyleRef = useRef<HTMLStyleElement | null>(null);
  const noiseOverlayRef = useRef<HTMLDivElement | null>(null);

  // Explore mode state
  const [activeFilter, setActiveFilter] = useState<PlaceType | "all">("all");
  const [selectedPlace, setSelectedPlace] = useState<CulturePlace | null>(null);
  const [panelEvents, setPanelEvents] = useState<SupabaseEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(13);
  const [tileStyle, setTileStyle] = useState<"voyager" | "dark">("voyager");
  const [mapReady, setMapReady] = useState(false);
  const isDark = tileStyle === "dark";

  // Mode state
  const [mode, setMode] = useState<MapMode>("explore");

  // Route mode state
  const [activeRoute, setActiveRoute] = useState<Route | null>(null);
  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const [showRouteList, setShowRouteList] = useState(true);

  // User location state
  const [locating, setLocating] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userMarkerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userCircleRef = useRef<any>(null);

  // Mobile panel drag state
  const [panelPct, setPanelPct] = useState(40); // percent of viewport
  const dragStartYRef = useRef(0);
  const dragStartPctRef = useRef(40);

  // Fetch events for selected place
  const fetchEvents = useCallback(async (place: CulturePlace) => {
    setEventsLoading(true);
    setPanelEvents([]);
    try {
      const supabase = createClient();
      const now = new Date().toISOString();
      const names = [place.name, ...(place.venueAliases || [])];
      const orFilter = names.map((n) => `venue.ilike.%${n}%`).join(",");
      const { data } = await supabase
        .from("events")
        .select("id, title, event_date, end_date, event_type, venue")
        .eq("status", "approved")
        .gte("event_date", now)
        .or(orFilter)
        .order("event_date", { ascending: true })
        .limit(10);
      setPanelEvents(data || []);
    } catch {
      setPanelEvents([]);
    }
    setEventsLoading(false);
  }, []);

  const selectPlace = useCallback((place: CulturePlace) => {
    setSelectedPlace(place);
    fetchEvents(place);
  }, [fetchEvents]);

  // Locate user on map
  const locateUser = useCallback(() => {
    const map = mapRef.current;
    const Leaf = leafletRef.current;
    if (!map || !Leaf) return;

    setLocating(true);
    map.locate({ setView: true, maxZoom: 15 });

    map.once("locationfound", (e: { latlng: { lat: number; lng: number }; accuracy: number }) => {
      setLocating(false);

      // Remove previous markers
      if (userMarkerRef.current) { map.removeLayer(userMarkerRef.current); }
      if (userCircleRef.current) { map.removeLayer(userCircleRef.current); }

      // Pulsating blue dot
      const pulseIcon = Leaf.divIcon({
        className: "",
        html: `<div style="
          width: 16px; height: 16px; border-radius: 50%;
          background: #4285F4; border: 3px solid #fff;
          box-shadow: 0 0 0 0 rgba(66,133,244,0.4);
          animation: pulse-loc 2s infinite;
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      userMarkerRef.current = Leaf.marker(e.latlng, { icon: pulseIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup("Buradasınız");

      // Accuracy circle
      userCircleRef.current = Leaf.circle(e.latlng, {
        radius: Math.min(e.accuracy, 500),
        color: "#4285F4",
        fillColor: "#4285F4",
        fillOpacity: 0.08,
        weight: 1,
      }).addTo(map);
    });

    map.once("locationerror", () => {
      setLocating(false);
    });
  }, []);

  // Clear route layers from map
  const clearRouteLayers = useCallback(() => {
    routeLayersRef.current.forEach((l: { remove: () => void }) => l.remove());
    routeLayersRef.current = [];
  }, []);

  // Apply / clear map visual effects for special routes
  const applyMapEffect = useCallback((fx?: string) => {
    clearMapEffect();
    if (!fx) return;
    const container = mapContainerRef.current;
    if (!container) return;
    const tilePane = container.querySelector(".leaflet-tile-pane") as HTMLElement | null;
    if (!tilePane) return;

    // Inject CSS keyframes once
    if (!fxStyleRef.current) {
      const s = document.createElement("style");
      s.textContent = `
        @keyframes waterFlow { to { stroke-dashoffset: -64; } }
        .water-flow path { animation: waterFlow 1.5s linear infinite; }
        .water-glow path { filter: drop-shadow(0 0 6px #00E5FF); }
        @keyframes neonPulse { 0%,100%{box-shadow:0 0 8px #FF980080;} 50%{box-shadow:0 0 20px #FF9800cc;} }
      `;
      document.head.appendChild(s);
      fxStyleRef.current = s;
    }

    tilePane.style.transition = "filter 0.5s, opacity 0.5s";

    if (fx === "xray") {
      tilePane.style.opacity = "0.3";
    } else if (fx === "grayscale") {
      tilePane.style.filter = "grayscale(1) contrast(1.3)";
    } else if (fx === "noir") {
      tilePane.style.filter = "sepia(0.3)";
      // noise overlay
      const noise = document.createElement("div");
      noise.style.cssText = `position:absolute;inset:0;z-index:1;pointer-events:none;opacity:0.06;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");`;
      container.appendChild(noise);
      noiseOverlayRef.current = noise;
    } else if (fx === "rock") {
      tilePane.style.filter = "hue-rotate(30deg) saturate(0.5)";
    }
    // "neon" has no tile effect, only marker glow — handled in drawRoute
  }, []);

  const clearMapEffect = useCallback(() => {
    const container = mapContainerRef.current;
    if (!container) return;
    const tilePane = container.querySelector(".leaflet-tile-pane") as HTMLElement | null;
    if (tilePane) {
      tilePane.style.opacity = "";
      tilePane.style.filter = "";
    }
    if (noiseOverlayRef.current) {
      noiseOverlayRef.current.remove();
      noiseOverlayRef.current = null;
    }
  }, []);

  // Compute mobile bottom padding for fitBounds
  const getMobilePanelPx = useCallback(() => {
    if (typeof window === "undefined") return 0;
    const isMob = window.innerWidth <= 640;
    return isMob ? Math.round(window.innerHeight * panelPct / 100) + 20 : 0;
  }, [panelPct]);

  // Draw route on map
  const drawRoute = useCallback((route: Route, stopIdx: number, fit?: boolean) => {
    const map = mapRef.current;
    const Leaf = leafletRef.current;
    if (!map || !Leaf) return;

    clearRouteLayers();

    const latLngs = route.stops.map((s) => [s.lat, s.lng] as [number, number]);
    const fx = route.fx;

    // Draw polyline — style varies by fx
    if (fx === "xray") {
      // Glow underline
      const glow = Leaf.polyline(latLngs, { color: "#00BCD4", weight: 10, opacity: 0.25, className: "water-glow" }).addTo(map);
      routeLayersRef.current.push(glow);
      // Animated flowing line
      const flow = Leaf.polyline(latLngs, { color: "#00E5FF", weight: 3, opacity: 0.9, dashArray: "12, 20", className: "water-flow" }).addTo(map);
      routeLayersRef.current.push(flow);
    } else if (fx === "noir") {
      const line = Leaf.polyline(latLngs, { color: "#ffffff", weight: 2, opacity: 0.3, dashArray: "6, 10" }).addTo(map);
      routeLayersRef.current.push(line);
    } else if (fx === "rock") {
      // Zigzag polyline: insert offset midpoints
      const zigzag: [number, number][] = [];
      for (let i = 0; i < latLngs.length; i++) {
        zigzag.push(latLngs[i]);
        if (i < latLngs.length - 1) {
          const midLat = (latLngs[i][0] + latLngs[i + 1][0]) / 2 + (Math.random() - 0.5) * 0.003;
          const midLng = (latLngs[i][1] + latLngs[i + 1][1]) / 2 + (Math.random() - 0.5) * 0.003;
          zigzag.push([midLat, midLng]);
        }
      }
      const line = Leaf.polyline(zigzag, { color: "#F44336", weight: 4, opacity: 0.7 }).addTo(map);
      routeLayersRef.current.push(line);
    } else {
      // Default polyline
      const polyline = Leaf.polyline(latLngs, { color: route.color, weight: 3, opacity: 0.7, dashArray: "8, 8" }).addTo(map);
      routeLayersRef.current.push(polyline);
    }

    // Draw numbered markers — neon glow for fx=neon
    const isNeon = fx === "neon";
    route.stops.forEach((stop, i) => {
      const isActive = i === stopIdx;
      const size = isActive ? 32 : 26;
      const neonGlow = isNeon ? `0 0 14px ${route.color}, 0 0 28px ${route.color}80` : "";
      const icon = Leaf.divIcon({
        className: "",
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        html: `<div style="
          width:${size}px;height:${size}px;border-radius:50%;
          background:${isActive ? route.color : "rgba(30,30,30,0.9)"};
          border:2px solid ${route.color};
          display:flex;align-items:center;justify-content:center;
          color:${isActive ? "#fff" : route.color};
          font-weight:700;font-size:${isActive ? 14 : 12}px;
          cursor:pointer;
          box-shadow:${isNeon ? neonGlow : (isActive ? `0 0 12px ${route.color}80` : "none")};
          transition:all 0.2s;
          ${isNeon ? "animation:neonPulse 2s ease-in-out infinite;" : ""}
        ">${i + 1}</div>`,
      });
      const marker = Leaf.marker([stop.lat, stop.lng], { icon });
      marker.on("click", () => {
        setActiveStopIndex(i);
      });
      marker.addTo(map);
      routeLayersRef.current.push(marker);
    });

    // Fit bounds with mobile panel padding
    if (fit !== false) {
      const bottomPad = getMobilePanelPx();
      map.fitBounds(Leaf.latLngBounds(latLngs), {
        paddingTopLeft: [60, 60],
        paddingBottomRight: [60, 60 + bottomPad],
        maxZoom: 16,
      });
    }
  }, [clearRouteLayers, getMobilePanelPx]);

  // Select a route
  const selectRoute = useCallback((route: Route) => {
    setActiveRoute(route);
    setActiveStopIndex(0);
    setShowRouteList(false);
    setPanelPct(40);
    applyMapEffect(route.fx);
    drawRoute(route, 0, true);
  }, [drawRoute, applyMapEffect]);

  // Deselect route
  const deselectRoute = useCallback(() => {
    clearRouteLayers();
    clearMapEffect();
    setActiveRoute(null);
    setActiveStopIndex(0);
    setShowRouteList(true);
  }, [clearRouteLayers, clearMapEffect]);

  // When active stop changes, redraw & fly to (offset for mobile panel)
  useEffect(() => {
    if (!activeRoute || !mapRef.current) return;
    drawRoute(activeRoute, activeStopIndex, false);
    const map = mapRef.current;
    const stop = activeRoute.stops[activeStopIndex];
    const bottomPad = getMobilePanelPx();
    // Fly to stop, offset upward by half the panel height in pixels
    const targetLatLng = [stop.lat, stop.lng] as [number, number];
    map.flyTo(targetLatLng, 16, { duration: 0.5 });
    // After fly completes, nudge so marker is above panel
    if (bottomPad > 0) {
      setTimeout(() => {
        const point = map.latLngToContainerPoint(targetLatLng);
        const offset = point.add([0, bottomPad / 2]);
        const newLatLng = map.containerPointToLatLng(offset);
        map.panTo(newLatLng, { duration: 0.3 });
      }, 550);
    }
  }, [activeStopIndex, activeRoute, drawRoute, getMobilePanelPx]);

  // Switch mode
  const switchMode = useCallback((newMode: MapMode) => {
    if (newMode === mode) return;
    // Clean up current mode
    if (mode === "routes") {
      clearRouteLayers();
      clearMapEffect();
      setActiveRoute(null);
      setActiveStopIndex(0);
      setShowRouteList(true);
    }
    if (mode === "explore") {
      setSelectedPlace(null);
    }
    setMode(newMode);
    // Reset map view
    if (mapRef.current) {
      mapRef.current.flyTo([39.935, 32.860], 13, { duration: 0.5 });
    }
  }, [mode, clearRouteLayers, clearMapEffect]);

  // Initialize map (dynamic import)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    // Pulse animation for user location dot
    const style = document.createElement("style");
    style.textContent = `@keyframes pulse-loc { 0% { box-shadow: 0 0 0 0 rgba(66,133,244,0.4); } 70% { box-shadow: 0 0 0 12px rgba(66,133,244,0); } 100% { box-shadow: 0 0 0 0 rgba(66,133,244,0); } }`;
    document.head.appendChild(style);

    import("leaflet").then((L) => {
      leafletRef.current = L.default || L;
      const Leaf = leafletRef.current;

      if (!mapContainerRef.current) return;

      const ankaraBounds = Leaf.latLngBounds([39.4, 31.5], [40.6, 33.8]);
      const map = Leaf.map(mapContainerRef.current, {
        center: [39.935, 32.860],
        zoom: 13,
        zoomControl: false,
        maxBounds: ankaraBounds,
        maxBoundsViscosity: 1.0,
        minZoom: 10,
        maxZoom: 18,
      });
      mapRef.current = map;

      tileLayerRef.current = Leaf.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 18,
      }).addTo(map);

      Leaf.control.zoom({ position: "bottomleft" }).addTo(map);

      map.on("zoomend", () => {
        setCurrentZoom(map.getZoom());
      });

      setMapReady(true);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      link.remove();
    };
  }, []);

  // Swap tile layer when tileStyle changes
  useEffect(() => {
    const map = mapRef.current;
    const Leaf = leafletRef.current;
    if (!map || !Leaf || !mapReady) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const urls: Record<string, string> = {
      voyager: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    };

    tileLayerRef.current = Leaf.tileLayer(urls[tileStyle], {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 18,
    }).addTo(map);

    // Keep tiles behind markers
    tileLayerRef.current.setZIndex(0);
  }, [tileStyle, mapReady]);

  // Manage explore markers based on filter + zoom (only in explore mode)
  useEffect(() => {
    const map = mapRef.current;
    const Leaf = leafletRef.current;
    if (!map || !Leaf || !mapReady) return;

    // Remove old markers
    markersRef.current.forEach((m: { remove: () => void }) => m.remove());
    markersRef.current = [];

    // Only show explore markers in explore mode
    if (mode !== "explore") return;

    const filtered = PLACES.filter((p) => {
      if (activeFilter !== "all" && p.type !== activeFilter) return false;
      if (p.minZoom && currentZoom < p.minZoom) return false;
      return true;
    });

    filtered.forEach((place) => {
      const color = TYPE_COLORS[place.type];
      const svg = TYPE_SVGS[place.type];
      const showLabel = currentZoom >= 17;
      const labelColor = isDark ? "#fff" : "#1a1a2e";
      const labelShadow = isDark ? "0 1px 4px rgba(0,0,0,0.9),0 0 8px rgba(0,0,0,0.6)" : "0 1px 3px rgba(255,255,255,0.8),0 0 6px rgba(255,255,255,0.4)";
      const markerBorder = isDark ? "none" : "2px solid #fff";
      const labelHtml = showLabel
        ? `<div style="position:absolute;left:44px;top:50%;transform:translateY(-50%);white-space:nowrap;font-size:11px;font-weight:600;color:${labelColor};text-shadow:${labelShadow};pointer-events:none;">${place.name}</div>`
        : "";
      const icon = Leaf.divIcon({
        className: "culture-marker",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        html: `<div style="position:relative;">
          <div class="marker-circle" style="
            width:36px;height:36px;border-radius:50%;
            background:${color};border:${markerBorder};box-sizing:border-box;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 2px 8px rgba(0,0,0,0.4),0 0 12px ${color}50;
            cursor:pointer;transition:transform 0.2s;
            animation:marker-glow 3s infinite;
            --glow-color:${color};
          ">${svg}</div>${labelHtml}
        </div>`,
      });

      const marker = Leaf.marker([place.lat, place.lng], { icon });
      marker.on("click", () => {
        selectPlace(place);
        map.flyTo([place.lat, place.lng], Math.max(map.getZoom(), 15), { duration: 0.6 });
      });
      marker.addTo(map);
      markersRef.current.push(marker);
    });
  }, [activeFilter, currentZoom, mapReady, selectPlace, mode, isDark]);

  const formatDate = (d: string | null) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
  };

  const getRelativeLabel = (d: string | null): { text: string; color: string } | null => {
    if (!d) return null;
    const now = new Date();
    const date = new Date(d);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.round((dateStart.getTime() - todayStart.getTime()) / 86400000);
    if (diffDays === 0) return { text: "Bugün", color: "#22c55e" };
    if (diffDays === 1) return { text: "Yarın", color: "#f59e0b" };
    if (diffDays > 1 && diffDays <= 6) return { text: date.toLocaleDateString("tr-TR", { weekday: "long" }), color: "#6366f1" };
    return null;
  };

  const activeStop = activeRoute?.stops[activeStopIndex] ?? null;

  /* ───────── Shared panel content renderer for events ───────── */
  const renderDirectionsButton = (place: CulturePlace, compact?: boolean) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}&destination_place_id=&travelmode=walking`;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          padding: compact ? "10px 14px" : "12px 16px",
          background: "rgba(66,133,244,0.12)", border: "1px solid rgba(66,133,244,0.25)",
          borderRadius: compact ? 8 : 10, color: "#4285F4",
          fontSize: compact ? 13 : 14, fontWeight: 600,
          textDecoration: "none", cursor: "pointer",
          transition: "all 0.2s",
          marginBottom: compact ? 14 : 20,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(66,133,244,0.2)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(66,133,244,0.12)"; }}
      >
        <svg width={compact ? 16 : 18} height={compact ? 16 : 18} viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11l19-9-9 19-2-8-8-2z" />
        </svg>
        Yol Tarifi Al
      </a>
    );
  };

  // Panel arka planı her zaman koyu — etkinlik renkleri panelle uyumlu olmalı
  const renderEventsSection = (compact?: boolean) => {
    const cardBg = "rgba(255,255,255,0.03)";
    const cardBorder = "rgba(255,255,255,0.06)";
    const cardHoverBg = "rgba(255,255,255,0.07)";
    const titleColor = "#fff";
    const mutedColor = "#888";
    const dimColor = "#666";

    return (
      <div style={{ borderTop: `1px solid ${cardBorder}`, paddingTop: compact ? 14 : 20 }}>
        <div style={{ color: "#FF6D60", fontSize: compact ? 10 : 11, letterSpacing: 2, marginBottom: compact ? 10 : 14, fontWeight: 600 }}>
          YAKLAŞAN ETKİNLİKLER
        </div>
        {eventsLoading ? (
          <div style={{ color: dimColor, fontSize: compact ? 12 : 13 }}>Yükleniyor...</div>
        ) : panelEvents.length === 0 ? (
          <div style={{
            background: cardBg, borderRadius: 10, padding: compact ? "12px" : "16px",
            border: `1px solid ${cardBorder}`,
          }}>
            <div style={{ color: dimColor, fontSize: compact ? 12 : 13, textAlign: "center" }}>
              Şu an planlanmış etkinlik yok
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: compact ? 8 : 10 }}>
            {panelEvents.map((ev) => {
              const rel = getRelativeLabel(ev.event_date);
              return (
                <Link key={ev.id} href={`/etkinlikler/${ev.id}`} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      background: cardBg, borderRadius: compact ? 8 : 10, padding: compact ? "10px 12px" : "14px",
                      border: `1px solid ${cardBorder}`, transition: "background 0.2s",
                      display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = cardHoverBg; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = cardBg; }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: titleColor, fontSize: compact ? 13 : 14, fontWeight: 500, marginBottom: compact ? 4 : 6 }}>
                        {ev.title}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        {rel && (
                          <span style={{
                            color: "#fff", fontSize: 10, fontWeight: 600,
                            background: rel.color, borderRadius: 4, padding: "1px 6px",
                          }}>
                            {rel.text}
                          </span>
                        )}
                        {ev.event_date && (
                          <span style={{ color: mutedColor, fontSize: compact ? 11 : 12 }}>
                            {formatDate(ev.event_date)}
                            {ev.end_date && ` → ${formatDate(ev.end_date)}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <span style={{ color: mutedColor, fontSize: 16, flexShrink: 0 }}>&rarr;</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  /* ───────── Story panel content (shared between desktop & mobile) ───────── */
  const renderStoryContent = (compact?: boolean) => {
    if (!activeRoute || !activeStop) return null;
    return (
      <>
        {/* Route title */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: compact ? 12 : 16,
          paddingBottom: compact ? 10 : 12, borderBottom: `1px solid ${activeRoute.color}30`,
        }}>
          {renderRouteIcon(activeRoute.id, activeRoute.color, compact ? 16 : 20)}
          <span style={{ color: activeRoute.color, fontSize: compact ? 12 : 13, fontWeight: 600, letterSpacing: 1 }}>
            {activeRoute.title}
          </span>
        </div>

        {/* Stop number */}
        <div style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: compact ? 28 : 32, height: compact ? 28 : 32, borderRadius: "50%",
          background: activeRoute.color, color: "#fff",
          fontSize: compact ? 14 : 16, fontWeight: 700, marginBottom: compact ? 8 : 12,
        }}>
          {activeStopIndex + 1}
        </div>

        <h2 style={{ color: "#fff", fontSize: compact ? 18 : 22, fontWeight: 600, margin: "0 0 12px 0", lineHeight: 1.3 }}>
          {activeStop.name}
        </h2>

        <p style={{ color: "#bbb", fontSize: compact ? 13 : 14, lineHeight: 1.8, margin: "0 0 20px 0" }}>
          {activeStop.story}
        </p>

        {/* Nav buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setActiveStopIndex(Math.max(0, activeStopIndex - 1))}
            disabled={activeStopIndex === 0}
            style={{
              flex: 1, padding: compact ? "10px 0" : "12px 0",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8, color: activeStopIndex === 0 ? "#444" : "#ccc",
              fontSize: compact ? 12 : 13, fontWeight: 500, cursor: activeStopIndex === 0 ? "default" : "pointer",
              transition: "all 0.2s",
            }}
          >
            &larr; &Ouml;nceki
          </button>
          <button
            onClick={() => setActiveStopIndex(Math.min(activeRoute.stops.length - 1, activeStopIndex + 1))}
            disabled={activeStopIndex === activeRoute.stops.length - 1}
            style={{
              flex: 1, padding: compact ? "10px 0" : "12px 0",
              background: activeStopIndex === activeRoute.stops.length - 1 ? "rgba(255,255,255,0.05)" : `${activeRoute.color}20`,
              border: `1px solid ${activeStopIndex === activeRoute.stops.length - 1 ? "rgba(255,255,255,0.1)" : activeRoute.color + "40"}`,
              borderRadius: 8,
              color: activeStopIndex === activeRoute.stops.length - 1 ? "#444" : activeRoute.color,
              fontSize: compact ? 12 : 13, fontWeight: 600,
              cursor: activeStopIndex === activeRoute.stops.length - 1 ? "default" : "pointer",
              transition: "all 0.2s",
            }}
          >
            Sonraki &rarr;
          </button>
        </div>

        {/* Progress */}
        <div style={{ marginTop: 14, display: "flex", gap: 4, justifyContent: "center" }}>
          {activeRoute.stops.map((_, i) => (
            <div
              key={i}
              onClick={() => setActiveStopIndex(i)}
              style={{
                width: i === activeStopIndex ? 20 : 8, height: 8, borderRadius: 4,
                background: i === activeStopIndex ? activeRoute.color : "rgba(255,255,255,0.1)",
                cursor: "pointer", transition: "all 0.3s",
              }}
            />
          ))}
        </div>

        {/* Back to routes */}
        <button
          onClick={deselectRoute}
          style={{
            marginTop: 20, width: "100%", padding: compact ? "8px 0" : "10px 0",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, color: "#888", fontSize: compact ? 11 : 12,
            cursor: "pointer", transition: "all 0.2s",
          }}
        >
          &larr; Rotalara D&ouml;n
        </button>
      </>
    );
  };

  const uiText = isDark ? "#fff" : "#1a1a2e";
  const uiMuted = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";
  const uiSubtle = isDark ? "#666" : "#888";
  const uiContainerBg = isDark ? "#1a1a1a" : "#f2f2f2";

  return (
    <div style={{ width: "100%", height: "100vh", background: uiContainerBg, position: "relative", overflow: "hidden" }}>
      <style>{`
        @keyframes marker-glow {
          0%, 100% { box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 12px var(--glow-color, #4A9EFF)50; }
          50% { box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 20px var(--glow-color, #4A9EFF)80; }
        }
        .leaflet-container { background: ${uiContainerBg} !important; }
        .leaflet-tile-pane {
          filter: ${tileStyle === "dark" ? "brightness(1.3)" : "none"};
        }
        .culture-marker .marker-circle:hover { transform: scale(1.17); }
      `}</style>

      {/* Map */}
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%", zIndex: 1 }} />

      {/* Header */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, pointerEvents: "none" }}>
        <div style={{ padding: "16px 20px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <Link
              href="/"
              style={{
                color: uiMuted, fontSize: 13, fontWeight: 500,
                textDecoration: "none", pointerEvents: "auto", transition: "color 0.2s",
              }}
              onMouseOver={(e) => { (e.target as HTMLElement).style.color = "#FF6D60"; }}
              onMouseOut={(e) => { (e.target as HTMLElement).style.color = uiMuted; }}
            >
              &larr; Ana Sayfa
            </Link>
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#FF6D60", marginBottom: 2 }}>KLEMENS</div>
              <div style={{ fontSize: 16, fontWeight: 300, letterSpacing: 3, color: uiText }}>
                K&Uuml;LT&Uuml;R HARİTASI
              </div>
              <div style={{ fontSize: 10, color: uiSubtle, marginTop: 1 }}>Ankara</div>
            </div>
          </div>
        </div>

        {/* Mode tabs + Filters */}
        <div style={{ padding: "0 20px 8px", pointerEvents: "auto" }}>
          {/* Mode switch + Day/Night toggle */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
            {(["explore", "routes"] as MapMode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                style={{
                  padding: "7px 0",
                  minWidth: 100,
                  background: isDark
                    ? (mode === m ? "rgba(255,109,96,0.25)" : "rgba(0,0,0,0.5)")
                    : (mode === m ? "#fff" : "#fff"),
                  border: isDark
                    ? `1px solid ${mode === m ? "#FF6D60" : "rgba(255,255,255,0.08)"}`
                    : `1px solid ${mode === m ? "#FF6D60" : "#e0e0e0"}`,
                  borderBottom: !isDark && mode === m ? "2px solid #FF6D60" : undefined,
                  borderRadius: 8,
                  color: isDark
                    ? (mode === m ? "#fff" : "#666")
                    : (mode === m ? "#FF6D60" : "#374151"),
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  transition: "all 0.2s", letterSpacing: 0.5,
                  backdropFilter: "blur(8px)",
                  boxShadow: !isDark ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                }}
              >
                {m === "explore" ? "Keşfet" : "Rotalar"}
              </button>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", gap: 2, alignItems: "center" }}>
              <button onClick={() => setTileStyle("voyager")} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", transition: "all 0.2s" }} title="Gündüz">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={!isDark ? "#FF6D60" : "rgba(255,255,255,0.3)"} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              </button>
              <button onClick={() => setTileStyle("dark")} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", transition: "all 0.2s" }} title="Gece">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#FF6D60" : "rgba(0,0,0,0.25)"} strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              </button>
            </div>
          </div>

          {/* Filters (explore only) */}
          {mode === "explore" && (
            <div style={{ display: "flex", gap: 10, flexWrap: "nowrap", overflowX: "auto", paddingBottom: 4 }}>
              {FILTER_OPTIONS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 20,
                    border: isDark
                      ? `1px solid ${activeFilter === f.key
                          ? (f.key === "all" ? "#FF6D60" : TYPE_COLORS[f.key as PlaceType])
                          : "rgba(255,255,255,0.12)"}`
                      : `${activeFilter === f.key ? "2px" : "1px"} solid ${activeFilter === f.key
                          ? (f.key === "all" ? "#FF6D60" : TYPE_COLORS[f.key as PlaceType])
                          : "#e0e0e0"}`,
                    background: isDark
                      ? (activeFilter === f.key
                          ? (f.key === "all" ? "rgba(255,109,96,0.2)" : `${TYPE_COLORS[f.key as PlaceType]}20`)
                          : "rgba(0,0,0,0.6)")
                      : "#fff",
                    color: isDark
                      ? (activeFilter === f.key
                          ? (f.key === "all" ? "#FF6D60" : TYPE_COLORS[f.key as PlaceType])
                          : "#999")
                      : (activeFilter === f.key
                          ? (f.key === "all" ? "#FF6D60" : TYPE_COLORS[f.key as PlaceType])
                          : "#374151"),
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    backdropFilter: "blur(8px)",
                    transition: "all 0.2s",
                    letterSpacing: 0.5,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    boxShadow: !isDark ? "0 1px 2px rgba(0,0,0,0.04)" : "none",
                  }}
                >
                  {f.key !== "all" && (
                    <span style={{
                      display: "inline-block", width: 6, height: 6, borderRadius: "50%",
                      background: TYPE_COLORS[f.key as PlaceType],
                      marginRight: 6, verticalAlign: "middle",
                    }} />
                  )}
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Locate me button — above zoom controls */}
      <button
        onClick={locateUser}
        disabled={locating}
        title="Konumumu göster"
        style={{
          position: "absolute", bottom: 100, left: 14, zIndex: 15,
          width: 36, height: 36, borderRadius: 8,
          background: isDark ? "rgba(0,0,0,0.7)" : "#fff",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#d1d5db"}`,
          boxShadow: isDark ? "none" : "0 2px 6px rgba(0,0,0,0.1)",
          cursor: locating ? "wait" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
          opacity: locating ? 0.6 : 1,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={locating ? "#4285F4" : (isDark ? "#ccc" : "#374151")} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4" /><path d="M12 18v4" />
          <path d="M2 12h4" /><path d="M18 12h4" />
          <circle cx="12" cy="12" r="8" />
        </svg>
      </button>

      {/* Legend — bottom right (explore only) */}
      {mode === "explore" && (
        <div style={{
          position: "absolute", bottom: 20, right: 20, zIndex: 10,
          background: isDark ? "rgba(0,0,0,0.7)" : "#fff",
          borderRadius: 10, padding: "10px 14px",
          backdropFilter: "blur(8px)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e0e0e0"}`,
          boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.08)",
        }}>
          {(Object.keys(TYPE_COLORS) as PlaceType[]).map((t) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: t === "tarihi" ? 0 : 6 }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%", background: TYPE_COLORS[t],
                boxShadow: `0 0 6px ${TYPE_COLORS[t]}`,
              }} />
              <span style={{ color: isDark ? "#999" : "#374151", fontSize: 11 }}>{TYPE_LABELS[t]}</span>
            </div>
          ))}
        </div>
      )}

      {/* ═══════ EXPLORE MODE PANELS ═══════ */}

      {/* Desktop detail panel — slide in from right */}
      {mode === "explore" && (
        <div className="desktop-panel" style={{
          position: "absolute",
          top: 0, right: 0, bottom: 0,
          width: selectedPlace ? 380 : 0,
          maxWidth: "100%",
          zIndex: 20,
          background: "rgba(18,18,18,0.95)",
          backdropFilter: "blur(12px)",
          borderLeft: selectedPlace ? "1px solid rgba(255,255,255,0.08)" : "none",
          transition: "width 0.3s ease",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}>
          {selectedPlace && (
            <div style={{ width: 380, maxWidth: "100vw", height: "100%", overflowY: "auto", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "16px 20px", display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setSelectedPlace(null)}
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#999", fontSize: 18, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => { (e.currentTarget).style.color = "#fff"; }}
                  onMouseOut={(e) => { (e.currentTarget).style.color = "#999"; }}
                >
                  &times;
                </button>
              </div>
              <div style={{ padding: "0 24px 24px", flex: 1 }}>
                <div style={{
                  display: "inline-block",
                  padding: "4px 12px", borderRadius: 12,
                  background: `${TYPE_COLORS[selectedPlace.type]}20`,
                  border: `1px solid ${TYPE_COLORS[selectedPlace.type]}40`,
                  color: TYPE_COLORS[selectedPlace.type],
                  fontSize: 11, fontWeight: 600, letterSpacing: 1,
                  marginBottom: 12,
                }}>
                  {TYPE_LABELS[selectedPlace.type]}
                </div>
                <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 600, margin: "0 0 12px 0", lineHeight: 1.3 }}>
                  {selectedPlace.name}
                </h2>
                <p style={{ color: "#999", fontSize: 14, lineHeight: 1.7, margin: "0 0 20px 0" }}>
                  {selectedPlace.desc}
                </p>
                {renderDirectionsButton(selectedPlace)}
                {renderEventsSection()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Explore mobile panel (bottom sheet) */}
      {mode === "explore" && selectedPlace && (
        <div
          className="mobile-panel"
          style={{
            position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 25,
            background: "rgba(18,18,18,0.97)", backdropFilter: "blur(12px)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px 16px 0 0", maxHeight: "60vh",
            overflowY: "auto", padding: "20px 20px 28px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
          </div>
          <button
            onClick={() => setSelectedPlace(null)}
            style={{
              position: "absolute", top: 16, right: 16,
              width: 32, height: 32, borderRadius: 8,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#999", fontSize: 16, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            &times;
          </button>
          <div style={{
            display: "inline-block", padding: "3px 10px", borderRadius: 10,
            background: `${TYPE_COLORS[selectedPlace.type]}20`,
            border: `1px solid ${TYPE_COLORS[selectedPlace.type]}40`,
            color: TYPE_COLORS[selectedPlace.type],
            fontSize: 10, fontWeight: 600, letterSpacing: 1, marginBottom: 10,
          }}>
            {TYPE_LABELS[selectedPlace.type]}
          </div>
          <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 600, margin: "0 0 8px 0", lineHeight: 1.3 }}>
            {selectedPlace.name}
          </h3>
          <p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, margin: "0 0 14px 0" }}>
            {selectedPlace.desc}
          </p>
          {renderDirectionsButton(selectedPlace, true)}
          {renderEventsSection(true)}
        </div>
      )}

      {/* ═══════ ROUTES MODE PANELS ═══════ */}

      {/* Desktop: Route list panel (left side) */}
      {mode === "routes" && showRouteList && !activeRoute && (
        <div className="desktop-panel" style={{
          position: "absolute", top: 160, left: 20, bottom: 20,
          width: 280, zIndex: 20, overflowY: "auto",
          background: "rgba(18,18,18,0.95)", backdropFilter: "blur(12px)",
          borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)",
          padding: "16px",
        }}>
          <div style={{ color: "#FF6D60", fontSize: 10, letterSpacing: 2, marginBottom: 14, fontWeight: 600 }}>
            ROTALAR
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ROUTES.map((route) => {
              const isNightLocked = route.nightOnly && (() => { const h = new Date().getHours(); return h >= 5 && h < 23; })();
              return (
              <button
                key={route.id}
                onClick={() => !isNightLocked && selectRoute(route)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "14px", borderRadius: 10,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderLeft: `3px solid ${route.color}`,
                  cursor: isNightLocked ? "not-allowed" : "pointer", textAlign: "left",
                  transition: "all 0.2s",
                  opacity: isNightLocked ? 0.4 : 1,
                }}
                onMouseOver={(e) => { if (!isNightLocked) (e.currentTarget).style.background = "rgba(255,255,255,0.07)"; }}
                onMouseOut={(e) => { (e.currentTarget).style.background = "rgba(255,255,255,0.03)"; }}
              >
                {renderRouteIcon(route.id, route.color, 22)}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                    {route.title}
                    {isNightLocked && <span style={{ marginLeft: 6 }}>{"\u{1F512}"}</span>}
                  </div>
                  <div style={{ color: isNightLocked ? "#FF9800" : "#888", fontSize: 11, marginBottom: 6, lineHeight: 1.4 }}>
                    {isNightLocked ? "Gece Kuşları İçin — 23:00'te Açılır" : route.desc}
                  </div>
                  <div style={{ display: "flex", gap: 8, color: "#666", fontSize: 10 }}>
                    <span>{route.stops.length} durak</span>
                    <span>&middot;</span>
                    <span>{route.duration}</span>
                  </div>
                </div>
              </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Desktop: Story panel (right side, when route active) */}
      {mode === "routes" && activeRoute && activeStop && (
        <div className="desktop-panel" style={{
          position: "absolute", top: 0, right: 0, bottom: 0,
          width: 380, zIndex: 20,
          background: "rgba(18,18,18,0.95)", backdropFilter: "blur(12px)",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          overflowY: "auto",
          display: "flex", flexDirection: "column",
        }}>
          <div style={{ width: 380, height: "100%", overflowY: "auto", padding: "24px" }}>
            {renderStoryContent()}
          </div>
        </div>
      )}

      {/* Mobile: Route list bottom sheet */}
      {mode === "routes" && showRouteList && !activeRoute && (
        <div
          className="mobile-panel"
          style={{
            position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 25,
            background: "rgba(18,18,18,0.97)", backdropFilter: "blur(12px)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px 16px 0 0", maxHeight: "55vh",
            overflowY: "auto", padding: "20px 16px 28px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
          </div>
          <div style={{ color: "#FF6D60", fontSize: 10, letterSpacing: 2, marginBottom: 12, fontWeight: 600 }}>
            ROTALAR
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ROUTES.map((route) => {
              const isNightLocked = route.nightOnly && (() => { const h = new Date().getHours(); return h >= 5 && h < 23; })();
              return (
              <button
                key={route.id}
                onClick={() => !isNightLocked && selectRoute(route)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "12px", borderRadius: 10,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderLeft: `3px solid ${route.color}`,
                  cursor: isNightLocked ? "not-allowed" : "pointer", textAlign: "left",
                  opacity: isNightLocked ? 0.4 : 1,
                }}
              >
                {renderRouteIcon(route.id, route.color, 18)}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, marginBottom: 3 }}>
                    {route.title}
                    {isNightLocked && <span style={{ marginLeft: 4, fontSize: 11 }}>{"\u{1F512}"}</span>}
                  </div>
                  {isNightLocked ? (
                    <div style={{ color: "#FF9800", fontSize: 10, marginBottom: 3 }}>23:00&apos;te Açılır</div>
                  ) : (
                    <div style={{ display: "flex", gap: 6, color: "#666", fontSize: 10 }}>
                      <span>{route.stops.length} durak</span>
                      <span>&middot;</span>
                      <span>{route.duration}</span>
                    </div>
                  )}
                </div>
              </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile: Story bottom sheet (draggable) */}
      {mode === "routes" && activeRoute && activeStop && (
        <div
          className="mobile-panel"
          style={{
            position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 25,
            background: "rgba(18,18,18,0.97)", backdropFilter: "blur(12px)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px 16px 0 0",
            height: `${panelPct}vh`,
            overflowY: "auto",
            transition: dragStartYRef.current ? "none" : "height 0.3s ease",
          }}
        >
          {/* Drag handle */}
          <div
            style={{ padding: "12px 16px 8px", cursor: "grab", touchAction: "none" }}
            onTouchStart={(e) => {
              dragStartYRef.current = e.touches[0].clientY;
              dragStartPctRef.current = panelPct;
            }}
            onTouchMove={(e) => {
              if (!dragStartYRef.current) return;
              const dy = dragStartYRef.current - e.touches[0].clientY;
              const deltaPct = (dy / window.innerHeight) * 100;
              const next = Math.max(30, Math.min(70, dragStartPctRef.current + deltaPct));
              setPanelPct(Math.round(next));
            }}
            onTouchEnd={() => {
              // Snap to nearest: 30, 40, 70
              const snaps = [30, 40, 70];
              const closest = snaps.reduce((a, b) => Math.abs(b - panelPct) < Math.abs(a - panelPct) ? b : a);
              setPanelPct(closest);
              dragStartYRef.current = 0;
            }}
          >
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)" }} />
            </div>
          </div>
          <div style={{ padding: "0 16px 28px", overflowY: "auto", height: "calc(100% - 40px)" }}>
            {renderStoryContent(true)}
          </div>
        </div>
      )}

      {/* Responsive */}
      <style>{`
        @media (max-width: 640px) {
          .desktop-panel { display: none !important; }
        }
        @media (min-width: 641px) {
          .mobile-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}
