/* ─── Mekan Detay Bottom Sheet ─── */

import React, { useCallback, useRef, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../../../config/theme";
import { TYPE_LABELS } from "../../../shared/harita-data";
import { useMapStore } from "../../../stores/map-store";
import DirectionsButton from "./DirectionsButton";
import CheckInButton from "./CheckInButton";
import CheckInResult from "./CheckInResult";
import ReviewsSection from "./ReviewsSection";
import { useCheckIn } from "../../../hooks/useCheckIn";

const SNAP_POINTS = ["25%", "60%", "90%"];

export default function PlaceBottomSheet() {
  const { selectedPlace, selectPlace } = useMapStore();
  const sheetRef = useRef<BottomSheet>(null);
  const { status: checkInStatus, earnedStars, checkIn, reset: resetCheckIn } = useCheckIn();

  useEffect(() => {
    if (selectedPlace) {
      sheetRef.current?.snapToIndex(1);
    } else {
      sheetRef.current?.close();
    }
  }, [selectedPlace]);

  const handleClose = useCallback(() => {
    selectPlace(null);
  }, [selectPlace]);

  if (!selectedPlace) return null;

  const typeColor = COLORS.type[selectedPlace.type] ?? COLORS.warm;
  const typeLabel = TYPE_LABELS[selectedPlace.type] ?? selectedPlace.type;

  return (
    <BottomSheet
      ref={sheetRef}
      index={1}
      snapPoints={SNAP_POINTS}
      enablePanDownToClose
      onClose={handleClose}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Tip badge */}
          <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
            <Text style={styles.typeText}>{typeLabel}</Text>
          </View>

          {/* İsim */}
          <Text style={styles.name}>{selectedPlace.name}</Text>

          {/* Açıklama */}
          <Text style={styles.desc}>{selectedPlace.desc}</Text>

          {/* Check-in + Yol tarifi */}
          <View style={styles.actions}>
            <CheckInButton
              place={selectedPlace}
              onCheckIn={() => checkIn(selectedPlace)}
            />
            <View style={{ height: 10 }} />
            <DirectionsButton
              lat={selectedPlace.lat}
              lng={selectedPlace.lng}
              name={selectedPlace.name}
            />
          </View>

          {/* Check-in sonuç modal */}
          <CheckInResult
            status={checkInStatus}
            stars={earnedStars}
            onDismiss={resetCheckIn}
          />

          {/* Ayırıcı */}
          <View style={styles.divider} />

          {/* Yorumlar (placeholder — Faz 6'da gerçek veri) */}
          <Text style={styles.sectionTitle}>Yorumlar</Text>
          <ReviewsSection reviews={[]} averageRating={null} />

          {/* Boşluk */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...SHADOWS.lg,
  },
  handle: { backgroundColor: COLORS.light, width: 40 },
  content: { flex: 1, paddingHorizontal: SPACING.xl },
  typeBadge: {
    alignSelf: "flex-start",
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  typeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: "700",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  name: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
  desc: {
    fontSize: FONTS.sizes.md,
    color: COLORS.warm,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  actions: { marginBottom: SPACING.lg },
  divider: {
    height: 1,
    backgroundColor: COLORS.light,
    marginVertical: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
});
