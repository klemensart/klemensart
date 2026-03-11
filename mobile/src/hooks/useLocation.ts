/* ─── Konum Hook'u (expo-location) ─── */

import { useEffect, useRef } from "react";
import * as Location from "expo-location";
import { useMapStore } from "../stores/map-store";

export function useLocation() {
  const setUserLocation = useMapStore((s) => s.setUserLocation);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted" || cancelled) return;

      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
          timeInterval: 5000,
        },
        (loc) => {
          if (!cancelled) {
            setUserLocation(loc.coords.latitude, loc.coords.longitude);
          }
        }
      );
    })();

    return () => {
      cancelled = true;
      watchRef.current?.remove();
    };
  }, [setUserLocation]);
}
