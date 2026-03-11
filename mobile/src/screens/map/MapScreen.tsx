/* ─── Harita Ekranı (Hero) ─── */

import React, { useRef, useCallback, useMemo, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import MapView, { PROVIDER_GOOGLE, Region, MapStyleElement, LatLng } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PLACES } from "../../shared/harita-data";
import { placeSlug } from "../../shared/harita-gamification";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../../config/theme";
import { MAP_STYLE_LIGHT, MAP_STYLE_DARK } from "../../config/map-styles";
import { useMapStore } from "../../stores/map-store";
import { useGamificationStore } from "../../stores/gamification-store";

import { PlaceMarker } from "./components/PlaceMarker";
import TypeFilterBar from "./components/TypeFilterBar";
import PlaceBottomSheet from "./components/PlaceBottomSheet";
import RouteListSheet from "./components/RouteListSheet";
import RoutePolyline from "./components/RoutePolyline";
import { RouteStopMarker } from "./components/RouteStopMarker";
import RouteStorySheet from "./components/RouteStorySheet";

import { ROUTE_FX_STYLES } from "../../config/map-styles";
import type { CulturePlace } from "../../shared/harita-data";

const ANKARA: Region = {
  latitude: 39.925,
  longitude: 32.855,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

// Ankara + çevre ilçeler sınırı (Polatlı, Beypazarı, Çubuk, Haymana vs.)
const ANKARA_BOUNDS = {
  northEast: { latitude: 40.15, longitude: 33.25 } as LatLng,
  southWest: { latitude: 39.60, longitude: 32.30 } as LatLng,
};

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();

  const {
    mode, activeFilter, isDark, selectPlace, setMode, toggleTheme,
    selectedRoute, activeStopIndex, setActiveStop, selectedPlace,
  } = useMapStore();
  const { visitedSlugs } = useGamificationStore();

  const filteredPlaces = useMemo(() => {
    if (!activeFilter) return PLACES;
    return PLACES.filter((p) => p.type === activeFilter);
  }, [activeFilter]);

  // Sınır içinde clamp — sınırdaki mekanlarda harita takılmasın
  const clampLat = (lat: number) =>
    Math.min(Math.max(lat, ANKARA_BOUNDS.southWest.latitude + 0.005), ANKARA_BOUNDS.northEast.latitude - 0.005);
  const clampLng = (lng: number) =>
    Math.min(Math.max(lng, ANKARA_BOUNDS.southWest.longitude + 0.005), ANKARA_BOUNDS.northEast.longitude - 0.005);

  // Bottom sheet açıkken mapPadding.bottom artır — marker her zaman sheet üstünde kalır
  const SHEET_HEIGHT = Math.round(Dimensions.get("window").height * 0.55);

  const handleMarkerPress = useCallback(
    (place: CulturePlace) => {
      selectPlace(place);
      // animateCamera ile marker'ı tam koordinata ortala
      // mapPadding.bottom sheet yüksekliğini hesaba katarak marker'ı yukarıda tutar
      mapRef.current?.animateCamera(
        {
          center: {
            latitude: clampLat(place.lat),
            longitude: clampLng(place.lng),
          },
          zoom: 15,
        },
        { duration: 400 }
      );
    },
    [selectPlace]
  );

  // Rota seçildiğinde harita stilini değiştir
  const mapStyle = useMemo(() => {
    if (selectedRoute?.fx && ROUTE_FX_STYLES[selectedRoute.fx]) {
      return ROUTE_FX_STYLES[selectedRoute.fx] as MapStyleElement[];
    }
    return isDark ? MAP_STYLE_DARK : MAP_STYLE_LIGHT;
  }, [isDark, selectedRoute]);

  // Rota durak değiştiğinde (marker tıklama, Sonraki/Önceki butonları) haritayı animate et
  useEffect(() => {
    if (selectedRoute && activeStopIndex >= 0) {
      const stop = selectedRoute.stops[activeStopIndex];
      if (stop) {
        mapRef.current?.animateCamera(
          {
            center: {
              latitude: clampLat(stop.lat),
              longitude: clampLng(stop.lng),
            },
            zoom: 15.5,
          },
          { duration: 400 }
        );
      }
    }
  }, [selectedRoute, activeStopIndex]);

  const handleStopPress = useCallback(
    (index: number) => {
      setActiveStop(index);
    },
    [setActiveStop]
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={ANKARA}
        customMapStyle={mapStyle}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        mapPadding={{ top: 0, right: 0, bottom: selectedPlace ? SHEET_HEIGHT : 100, left: 0 }}
        minZoomLevel={9}
        maxZoomLevel={18}
        onMapReady={() => {
          mapRef.current?.setMapBoundaries?.(
            ANKARA_BOUNDS.northEast,
            ANKARA_BOUNDS.southWest
          );
        }}
      >
        {/* Keşfet modu: mekan marker'ları */}
        {mode === "explore" &&
          filteredPlaces.map((place, idx) => (
            <PlaceMarker
              key={`${place.type}-${place.name}-${idx}`}
              place={place}
              visited={visitedSlugs.has(placeSlug(place.name))}
              onPress={handleMarkerPress}
            />
          ))}

        {/* Rota modu: polyline + durak marker'ları */}
        {selectedRoute && (
          <>
            <RoutePolyline route={selectedRoute} />
            {selectedRoute.stops.map((stop, i) => (
              <RouteStopMarker
                key={`${selectedRoute.id}-${i}`}
                stop={stop}
                index={i}
                color={selectedRoute.color}
                isActive={i === activeStopIndex}
                onPress={handleStopPress}
              />
            ))}
          </>
        )}
      </MapView>

      {/* Mod Geçişi: Keşfet / Rotalar */}
      <View style={[styles.modeBar, { top: insets.top + 12 }]}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === "explore" && styles.modeBtnActive]}
          onPress={() => setMode("explore")}
        >
          <Text
            style={[styles.modeText, mode === "explore" && styles.modeTextActive]}
          >
            Keşfet
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === "routes" && styles.modeBtnActive]}
          onPress={() => setMode("routes")}
        >
          <Text
            style={[styles.modeText, mode === "routes" && styles.modeTextActive]}
          >
            Rotalar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Kategori Filtre */}
      {mode === "explore" && <TypeFilterBar />}

      {/* Tema toggle */}
      <TouchableOpacity
        style={[styles.themeBtn, { top: insets.top + 12 }]}
        onPress={toggleTheme}
        activeOpacity={0.7}
      >
        <Text style={styles.themeIcon}>{isDark ? "☀️" : "🌙"}</Text>
      </TouchableOpacity>

      {/* Harita altı stat bar */}
      <View style={[styles.statsBar, { bottom: insets.bottom + 90 }]}>
        <Text style={styles.statsText}>
          {filteredPlaces.length} mekan
        </Text>
      </View>

      {/* Mekan detay paneli */}
      {mode === "explore" && <PlaceBottomSheet />}

      {/* Rota modu panelleri */}
      {mode === "routes" && !selectedRoute && <RouteListSheet />}
      {mode === "routes" && selectedRoute && <RouteStorySheet />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  modeBar: {
    position: "absolute",
    left: SPACING.lg,
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    padding: 3,
    ...SHADOWS.md,
    zIndex: 20,
  },
  modeBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
  },
  modeBtnActive: {
    backgroundColor: COLORS.coral,
  },
  modeText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: "600",
    color: COLORS.warm,
  },
  modeTextActive: {
    color: "#fff",
  },

  themeBtn: {
    position: "absolute",
    right: SPACING.lg,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.md,
    zIndex: 20,
  },
  themeIcon: { fontSize: 18 },

  statsBar: {
    position: "absolute",
    left: SPACING.lg,
    backgroundColor: "rgba(45,41,38,0.75)",
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
    zIndex: 10,
  },
  statsText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: "600",
    color: "#fff",
  },
});
