/* ─── Google Maps JSON Stilleri ─── */

export const MAP_STYLE_LIGHT = [
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#c9e7f5" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry.fill",
    stylers: [{ color: "#f5f0eb" }],
  },
];

export const MAP_STYLE_DARK = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
];

// Rota efektleri için özel stiller
export const MAP_STYLE_GRAYSCALE = [
  { elementType: "geometry", stylers: [{ saturation: -100 }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

export const MAP_STYLE_NOIR = [
  { elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a1a" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e0e0e" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

export const MAP_STYLE_XRAY = [
  { elementType: "geometry", stylers: [{ color: "#0a192f" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#64ffda" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a192f" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#172a45" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#020c1b" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

export const MAP_STYLE_NEON = [
  { elementType: "geometry", stylers: [{ color: "#0d0221" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#ff6ec7" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0d0221" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a0533" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3d1a6e" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000014" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

export const ROUTE_FX_STYLES: Record<string, object[]> = {
  xray: MAP_STYLE_XRAY,
  grayscale: MAP_STYLE_GRAYSCALE,
  noir: MAP_STYLE_NOIR,
  neon: MAP_STYLE_NEON,
  rock: MAP_STYLE_GRAYSCALE, // rock → grayscale base
};
