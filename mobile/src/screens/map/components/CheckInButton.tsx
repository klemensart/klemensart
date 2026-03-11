/* ─── Check-in Butonu (Mesafe-aware) ─── */

import React, { useMemo } from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { haversineDistance, placeSlug, CHECK_IN_RADIUS } from "../../../shared/harita-gamification";
import { useMapStore } from "../../../stores/map-store";
import { useGamificationStore } from "../../../stores/gamification-store";
import { useAuthStore } from "../../../stores/auth-store";
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from "../../../config/theme";
import type { CulturePlace } from "../../../shared/harita-data";

interface Props {
  place: CulturePlace;
  onCheckIn: () => void;
}

export default function CheckInButton({ place, onCheckIn }: Props) {
  const { userLat, userLng } = useMapStore();
  const { visitedSlugs } = useGamificationStore();
  const { user } = useAuthStore();

  const slug = placeSlug(place.name);
  const isVisited = visitedSlugs.has(slug);

  const distance = useMemo(() => {
    if (userLat == null || userLng == null) return null;
    return haversineDistance(userLat, userLng, place.lat, place.lng);
  }, [userLat, userLng, place.lat, place.lng]);

  const isNearby = distance !== null && distance <= CHECK_IN_RADIUS;

  if (isVisited) {
    return (
      <View style={[styles.btn, styles.btnVisited]}>
        <Text style={styles.visitedText}>✓ Ziyaret Edildi</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.btn, styles.btnDisabled]}>
        <Text style={styles.disabledText}>Giriş yap ve check-in yap</Text>
      </View>
    );
  }

  if (!isNearby) {
    return (
      <View style={[styles.btn, styles.btnDisabled]}>
        <Text style={styles.disabledText}>
          {distance !== null
            ? `${Math.round(distance)}m uzakta — yaklaş!`
            : "Konum bekleniyor..."}
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.btn} onPress={onCheckIn} activeOpacity={0.7}>
      <Text style={styles.checkInText}>📍 Check-in Yap</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: COLORS.coral,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: "center",
    ...SHADOWS.sm,
  },
  btnVisited: { backgroundColor: "#E8F5E9" },
  btnDisabled: { backgroundColor: COLORS.light },
  checkInText: {
    fontSize: FONTS.sizes.md,
    fontWeight: "700",
    color: "#fff",
  },
  visitedText: {
    fontSize: FONTS.sizes.md,
    fontWeight: "600",
    color: "#4CAF50",
  },
  disabledText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.warm,
  },
});
