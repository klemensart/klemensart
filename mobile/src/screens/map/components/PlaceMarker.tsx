/* ─── Harita Mekan Marker'ı ─── */

import React, { memo, useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Marker } from "react-native-maps";
import { COLORS } from "../../../config/theme";
import type { CulturePlace, PlaceType } from "../../../shared/harita-data";

interface Props {
  place: CulturePlace;
  visited?: boolean;
  onPress: (place: CulturePlace) => void;
}

const MARKER_SIZE = 32;

const TYPE_EMOJI: Record<PlaceType, string> = {
  müze: "🏛",
  galeri: "🖼",
  konser: "🎵",
  tiyatro: "🎭",
  tarihi: "🏰",
  edebiyat: "📚",
  miras: "🛡",
};

function PlaceMarkerInner({ place, visited, onPress }: Props) {
  const bg = COLORS.type[place.type] ?? COLORS.warm;

  // İlk render'da true, kısa süre sonra false — performans optimizasyonu
  const [tracking, setTracking] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setTracking(false), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <Marker
      coordinate={{ latitude: place.lat, longitude: place.lng }}
      onPress={() => onPress(place)}
      tracksViewChanges={tracking}
    >
      <View style={[styles.outer, { backgroundColor: bg }]}>
        <Text style={styles.emoji}>{TYPE_EMOJI[place.type]}</Text>
        {visited && <View style={styles.visitedDot} />}
      </View>
    </Marker>
  );
}

export const PlaceMarker = memo(PlaceMarkerInner);

const styles = StyleSheet.create({
  outer: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  emoji: {
    fontSize: 14,
    textAlign: "center",
  },
  visitedDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
});
