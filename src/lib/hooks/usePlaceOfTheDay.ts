"use client";

import { useState, useMemo, useCallback } from "react";
import { PLACES, type CulturePlace } from "@/lib/harita-data";

/* Deterministic hash from date string → index */
function hashDate(dateStr: string): number {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = ((h << 5) - h + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % PLACES.length;
}

export function usePlaceOfTheDay() {
  const [dismissed, setDismissed] = useState(false);
  const [showToast, setShowToast] = useState(true);

  const dailyPlace: CulturePlace = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const idx = hashDate(today);
    return PLACES[idx];
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    setShowToast(false);
  }, []);

  const getRandomPlace = useCallback((): CulturePlace => {
    const idx = Math.floor(Math.random() * PLACES.length);
    return PLACES[idx];
  }, []);

  return { dailyPlace, dismissed, showToast, setShowToast, dismiss, getRandomPlace };
}
