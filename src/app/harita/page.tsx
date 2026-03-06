"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

/* ───────── Types ───────── */

type PlaceType = "müze" | "galeri" | "konser" | "tiyatro" | "tarihi";

type CulturePlace = {
  lat: number;
  lng: number;
  type: PlaceType;
  name: string;
  desc: string;
  minZoom?: number;
};

type SupabaseEvent = {
  id: string;
  title: string;
  event_date: string | null;
  end_date: string | null;
  event_type: string | null;
  venue: string | null;
  price_info: string | null;
};

/* ───────── Constants ───────── */

const TYPE_COLORS: Record<PlaceType, string> = {
  müze: "#4A9EFF",
  galeri: "#FF6D60",
  konser: "#9B6BB0",
  tiyatro: "#4CAF50",
  tarihi: "#FFB300",
};

const TYPE_LABELS: Record<PlaceType, string> = {
  müze: "Müze",
  galeri: "Galeri",
  konser: "Konser",
  tiyatro: "Tiyatro",
  tarihi: "Tarihi",
};

const FILTER_OPTIONS: { key: PlaceType | "all"; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "müze", label: "Müzeler" },
  { key: "galeri", label: "Galeriler" },
  { key: "konser", label: "Konser" },
  { key: "tiyatro", label: "Tiyatro" },
  { key: "tarihi", label: "Tarihi" },
];

const PLACES: CulturePlace[] = [
  // Müzeler
  { lat: 39.9381, lng: 32.8645, type: "müze", name: "Anadolu Medeniyetleri Müzesi", desc: "Paleolitik Çağ'dan Osmanlı'ya Anadolu'nun binlerce yıllık tarihi. 1997 Avrupa Yılın Müzesi ödüllü." },
  { lat: 39.9370, lng: 32.8640, type: "müze", name: "Erimtan Arkeoloji ve Sanat Müzesi", desc: "Ankara Kalesi eteklerinde arkeoloji ve sanat koleksiyonu. Özel sergiler ve etkinlikler." },
  { lat: 39.9385, lng: 32.8650, type: "müze", name: "Rahmi M. Koç Müzesi", desc: "Tarihi Çengelhan'da sanayi, ulaşım ve iletişim tarihine dair interaktif sergiler." },
  { lat: 39.9390, lng: 32.8550, type: "müze", name: "Etnografya Müzesi", desc: "Selçuklu'dan Cumhuriyet'e Türk kültürü. Atatürk'ün ilk defnedildiği yer." },
  { lat: 39.9400, lng: 32.8530, type: "müze", name: "Devlet Resim ve Heykel Müzesi", desc: "1927'den beri Türk resim sanatı. 6 salonda eserler, 3 güzel sanatlar galerisi." },
  { lat: 39.9254, lng: 32.8369, type: "müze", name: "Anıtkabir ve Atatürk Müzesi", desc: "Mustafa Kemal Atatürk'ün anıt mezarı. Kurtuluş Savaşı belgeleri ve kişisel eşyalar." },
  { lat: 39.9430, lng: 32.8540, type: "müze", name: "Kurtuluş Savaşı Müzesi (I. TBMM)", desc: "Birinci Meclis binası. Cumhuriyet'in temellerinin atıldığı tarihi mekan." },
  { lat: 39.9425, lng: 32.8545, type: "müze", name: "Cumhuriyet Müzesi (II. TBMM)", desc: "İkinci Meclis binası. İlk anayasaların yazıldığı, kritik kararların alındığı yer." },
  { lat: 39.9383, lng: 32.8655, type: "müze", name: "Gökyay Vakfı Satranç Müzesi", desc: "110 ülkeden 723 satranç takımı. Tematik bölümler ve eğitim atölyeleri." },
  { lat: 39.8673, lng: 32.7495, type: "müze", name: "Altın Köşk Müzesi", desc: "Türkiye'nin ilk mimarlık ve mobilya müzesi. 1000 form ve motiften esinlenmiş tasarım." },
  { lat: 39.9415, lng: 32.8535, type: "müze", name: "PTT Pul Müzesi", desc: "Neo-klasik binada posta tarihi. Osmanlı'dan Cumhuriyet'e pullar ve haberleşme eserleri." },
  { lat: 39.9350, lng: 32.8520, type: "müze", name: "Vakıf Eserleri Müzesi", desc: "Cami ve mescitlerden toplanan halı, kilim, Kur'an-ı Kerim ve şamdanlar." },
  { lat: 39.9360, lng: 32.8610, type: "müze", name: "SOKUM - Somut Olmayan Kültürel Miras Müzesi", desc: "Karagöz-Hacivat, meddah, ebru, kına geceleri. Türkiye'nin ilk somut olmayan miras müzesi." },
  // Galeriler & Sanat Merkezleri
  { lat: 39.9395, lng: 32.8480, type: "galeri", name: "CerModern", desc: "Eski TCDD atölyelerinde çağdaş sanat. Sergiler, atölyeler, film gösterimleri ve konserler." },
  { lat: 39.9210, lng: 32.8560, type: "galeri", name: "Galeri Nev", desc: "Türk çağdaş sanatının öncü galerilerinden." },
  // Konser & Performans
  { lat: 39.9147, lng: 32.8107, type: "konser", name: "CSO Ada Ankara", desc: "Cumhurbaşkanlığı Senfoni Orkestrası'nın evi. Ziraat Ana Salon ve Bankkart Mavi Salon." },
  { lat: 39.8673, lng: 32.7495, type: "konser", name: "Bilkent Konser Salonu", desc: "Türkiye'nin akustik açıdan en iyi salonlarından biri." },
  { lat: 39.9110, lng: 32.8020, type: "konser", name: "Congresium", desc: "Büyük ölçekli konser ve etkinliklere ev sahipliği yapan merkez." },
  { lat: 39.9180, lng: 32.8590, type: "konser", name: "Atatürk Kültür Merkezi", desc: "Çankaya Belediyesi. Mavi Salon ve Kırmızı Salon'da tiyatro, opera, konser." },
  // Tiyatro
  { lat: 39.9420, lng: 32.8543, type: "tiyatro", name: "Ankara Devlet Tiyatrosu", desc: "Türkiye'nin en köklü tiyatro kurumlarından biri." },
  { lat: 39.9200, lng: 32.8540, type: "tiyatro", name: "Ankara Devlet Opera ve Balesi", desc: "Opera, bale ve müzikal gösterileri." },
  // Tarihi Yapılar & Arkeolojik Alanlar
  { lat: 39.9408, lng: 32.8644, type: "tarihi", name: "Ankara Kalesi", desc: "MÖ 5. yüzyıldan. Galatlar, Romalılar, Selçuklular. Panoramik şehir manzarası." },
  { lat: 39.9395, lng: 32.8680, type: "tarihi", name: "Hamamönü", desc: "Restore edilmiş Osmanlı evleri, sanat atölyeleri, kafeler. Sanat Sokağı ve el sanatları.", minZoom: 14 },
  { lat: 39.9410, lng: 32.8630, type: "tarihi", name: "Hacı Bayram Camii", desc: "15. yüzyıl. Augustus Tapınağı'nın hemen yanında, Ankara'nın en önemli camileri." },
  { lat: 39.9412, lng: 32.8632, type: "tarihi", name: "Augustus Tapınağı", desc: "Roma İmparatoru Augustus döneminden. Res Gestae kitabesi dünya tarihinin önemli belgeleri." },
  { lat: 39.9440, lng: 32.8600, type: "tarihi", name: "Roma Hamamı", desc: "3. yüzyıl Roma dönemi hamamı kalıntıları. Palaestra, frigidarium ve caldarium bölümleri." },
  { lat: 39.9388, lng: 32.8670, type: "tarihi", name: "Taceddin Dergahı (Mehmet Akif Ersoy Müzesi)", desc: "İstiklal Marşı'nın yazıldığı ev. Mehmet Akif Ersoy'un yaşadığı mekan.", minZoom: 14 },
  { lat: 39.9400, lng: 32.8660, type: "tarihi", name: "Pilavoğlu Hanı", desc: "Tarihi han. Kafeler, sanat galerileri ve butik dükkanlar.", minZoom: 15 },
  { lat: 39.9405, lng: 32.8645, type: "tarihi", name: "Samanpazarı (Antikacılar)", desc: "Ankara'nın antikacılar caddesi. Nostalji meraklıları için hazine.", minZoom: 15 },
  { lat: 39.9392, lng: 32.8675, type: "tarihi", name: "Sanat Sokağı", desc: "Hamamönü'nde sanat kursları, ressam atölyeleri ve el sanatları dükkanları.", minZoom: 15 },
  { lat: 39.9398, lng: 32.8668, type: "tarihi", name: "Karacabey Hamamı", desc: "Hamamönü'ne adını veren tarihi hamam. Osmanlı dönemi sosyal merkezi.", minZoom: 15 },
];

/* ───────── Component ───────── */

export default function HaritaPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);

  const [activeFilter, setActiveFilter] = useState<PlaceType | "all">("all");
  const [selectedPlace, setSelectedPlace] = useState<CulturePlace | null>(null);
  const [panelEvents, setPanelEvents] = useState<SupabaseEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(13);
  const [mapReady, setMapReady] = useState(false);

  // Fetch events for selected place
  const fetchEvents = useCallback(async (placeName: string) => {
    setEventsLoading(true);
    setPanelEvents([]);
    try {
      const supabase = createClient();
      const now = new Date().toISOString();
      const { data } = await supabase
        .from("events")
        .select("id, title, event_date, end_date, event_type, venue, price_info")
        .eq("status", "approved")
        .gte("event_date", now)
        .ilike("venue", `%${placeName}%`)
        .order("event_date", { ascending: true })
        .limit(5);
      setPanelEvents(data || []);
    } catch {
      setPanelEvents([]);
    }
    setEventsLoading(false);
  }, []);

  const selectPlace = useCallback((place: CulturePlace) => {
    setSelectedPlace(place);
    fetchEvents(place.name);
  }, [fetchEvents]);

  // Initialize map (dynamic import)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Load leaflet CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    import("leaflet").then((L) => {
      leafletRef.current = L.default || L;
      const Leaf = leafletRef.current;

      if (!mapContainerRef.current) return;

      const map = Leaf.map(mapContainerRef.current, {
        center: [39.935, 32.860],
        zoom: 13,
        zoomControl: false,
      });
      mapRef.current = map;

      Leaf.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
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

  // Manage markers based on filter + zoom
  useEffect(() => {
    const map = mapRef.current;
    const Leaf = leafletRef.current;
    if (!map || !Leaf || !mapReady) return;

    // Remove old markers
    markersRef.current.forEach((m: { remove: () => void }) => m.remove());
    markersRef.current = [];

    const filtered = PLACES.filter((p) => {
      if (activeFilter !== "all" && p.type !== activeFilter) return false;
      if (p.minZoom && currentZoom < p.minZoom) return false;
      return true;
    });

    filtered.forEach((place) => {
      const color = TYPE_COLORS[place.type];
      const size = 14;
      const icon = Leaf.divIcon({
        className: "",
        iconSize: [size * 2 + 12, size * 2 + 12],
        iconAnchor: [size + 6, size + 6],
        html: `<div style="
          width:${size}px;height:${size}px;border-radius:50%;
          background:${color};
          box-shadow:0 0 ${size}px ${color},0 0 ${size * 2}px ${color}80;
          position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
          transition:transform 0.2s;cursor:pointer;
          animation:pulse-marker 2s infinite;
        "></div>`,
      });

      const marker = Leaf.marker([place.lat, place.lng], { icon });
      marker.on("click", () => {
        selectPlace(place);
        map.flyTo([place.lat, place.lng], Math.max(map.getZoom(), 15), { duration: 0.6 });
      });
      marker.addTo(map);
      markersRef.current.push(marker);
    });
  }, [activeFilter, currentZoom, mapReady, selectPlace]);

  const formatDate = (d: string | null) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={{ width: "100%", height: "100vh", background: "#1a1a1a", position: "relative", overflow: "hidden" }}>
      {/* Pulse animation */}
      <style>{`
        @keyframes pulse-marker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .leaflet-container { background: #1a1a1a !important; }
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
                color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 500,
                textDecoration: "none", pointerEvents: "auto", transition: "color 0.2s",
              }}
              onMouseOver={(e) => { (e.target as HTMLElement).style.color = "#FF6D60"; }}
              onMouseOut={(e) => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}
            >
              &larr; Ana Sayfa
            </Link>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, letterSpacing: 4, color: "#FF6D60", marginBottom: 4 }}>KLEMENS</div>
              <div style={{ fontSize: 20, fontWeight: 300, letterSpacing: 4, color: "#fff" }}>
                K&Uuml;LT&Uuml;R HARİTASI
              </div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>Ankara</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          padding: "0 20px 12px", display: "flex", gap: 8, flexWrap: "wrap", pointerEvents: "auto",
        }}>
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: `1px solid ${activeFilter === f.key
                  ? (f.key === "all" ? "#FF6D60" : TYPE_COLORS[f.key as PlaceType])
                  : "rgba(255,255,255,0.12)"}`,
                background: activeFilter === f.key
                  ? (f.key === "all" ? "rgba(255,109,96,0.2)" : `${TYPE_COLORS[f.key as PlaceType]}20`)
                  : "rgba(0,0,0,0.6)",
                color: activeFilter === f.key
                  ? (f.key === "all" ? "#FF6D60" : TYPE_COLORS[f.key as PlaceType])
                  : "#999",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                backdropFilter: "blur(8px)",
                transition: "all 0.2s",
                letterSpacing: 0.5,
              }}
            >
              {f.key !== "all" && (
                <span style={{
                  display: "inline-block", width: 8, height: 8, borderRadius: "50%",
                  background: TYPE_COLORS[f.key as PlaceType],
                  marginRight: 6, verticalAlign: "middle",
                }} />
              )}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend — bottom right */}
      <div style={{
        position: "absolute", bottom: 20, right: 20, zIndex: 10,
        background: "rgba(0,0,0,0.7)", borderRadius: 10, padding: "10px 14px",
        backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.08)",
      }}>
        {(Object.keys(TYPE_COLORS) as PlaceType[]).map((t) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: t === "tarihi" ? 0 : 6 }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%", background: TYPE_COLORS[t],
              boxShadow: `0 0 6px ${TYPE_COLORS[t]}`,
            }} />
            <span style={{ color: "#999", fontSize: 11 }}>{TYPE_LABELS[t]}</span>
          </div>
        ))}
      </div>

      {/* Desktop detail panel — slide in from right */}
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
            {/* Close */}
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

            {/* Content */}
            <div style={{ padding: "0 24px 24px", flex: 1 }}>
              {/* Type badge */}
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

              <p style={{ color: "#999", fontSize: 14, lineHeight: 1.7, margin: "0 0 24px 0" }}>
                {selectedPlace.desc}
              </p>

              {/* Events section */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
                <div style={{ color: "#FF6D60", fontSize: 11, letterSpacing: 2, marginBottom: 14, fontWeight: 600 }}>
                  YAKLAŞAN ETKİNLİKLER
                </div>

                {eventsLoading ? (
                  <div style={{ color: "#666", fontSize: 13 }}>Yükleniyor...</div>
                ) : panelEvents.length === 0 ? (
                  <div style={{
                    background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "16px",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}>
                    <div style={{ color: "#555", fontSize: 13, textAlign: "center" }}>
                      Şu an planlanmış etkinlik yok
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {panelEvents.map((ev) => (
                      <div key={ev.id} style={{
                        background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "14px",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}>
                        <div style={{ color: "#fff", fontSize: 14, fontWeight: 500, marginBottom: 6 }}>
                          {ev.title}
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                          {ev.event_date && (
                            <span style={{ color: "#888", fontSize: 12 }}>
                              {formatDate(ev.event_date)}
                            </span>
                          )}
                          {ev.price_info && (
                            <span style={{
                              color: "#666", fontSize: 11,
                              background: "rgba(255,255,255,0.05)", borderRadius: 6, padding: "2px 8px",
                            }}>
                              {ev.price_info}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile panel (bottom sheet) */}
      {selectedPlace && (
        <div
          className="mobile-panel"
          style={{
            position: "absolute",
            left: 0, right: 0, bottom: 0,
            zIndex: 25,
            background: "rgba(18,18,18,0.97)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px 16px 0 0",
            maxHeight: "60vh",
            overflowY: "auto",
            padding: "20px 20px 28px",
          }}
        >
          {/* Handle */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
          </div>

          {/* Close */}
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

          {/* Type badge */}
          <div style={{
            display: "inline-block",
            padding: "3px 10px", borderRadius: 10,
            background: `${TYPE_COLORS[selectedPlace.type]}20`,
            border: `1px solid ${TYPE_COLORS[selectedPlace.type]}40`,
            color: TYPE_COLORS[selectedPlace.type],
            fontSize: 10, fontWeight: 600, letterSpacing: 1,
            marginBottom: 10,
          }}>
            {TYPE_LABELS[selectedPlace.type]}
          </div>

          <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 600, margin: "0 0 8px 0", lineHeight: 1.3 }}>
            {selectedPlace.name}
          </h3>
          <p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, margin: "0 0 16px 0" }}>
            {selectedPlace.desc}
          </p>

          {/* Events */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14 }}>
            <div style={{ color: "#FF6D60", fontSize: 10, letterSpacing: 2, marginBottom: 10, fontWeight: 600 }}>
              YAKLAŞAN ETKİNLİKLER
            </div>
            {eventsLoading ? (
              <div style={{ color: "#666", fontSize: 12 }}>Yükleniyor...</div>
            ) : panelEvents.length === 0 ? (
              <div style={{ color: "#555", fontSize: 12 }}>Şu an planlanmış etkinlik yok</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {panelEvents.map((ev) => (
                  <div key={ev.id} style={{
                    background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 12px",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}>
                    <div style={{ color: "#fff", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{ev.title}</div>
                    {ev.event_date && <div style={{ color: "#888", fontSize: 11 }}>{formatDate(ev.event_date)}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Responsive: hide desktop panel on mobile, hide mobile panel on desktop */}
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
