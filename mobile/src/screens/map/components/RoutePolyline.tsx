/* ─── Rota Çizgisi (Polyline) ─── */

import React from "react";
import { Polyline } from "react-native-maps";
import type { Route } from "../../../shared/harita-data";

interface Props {
  route: Route;
}

export default function RoutePolyline({ route }: Props) {
  const coords = route.stops.map((s) => ({
    latitude: s.lat,
    longitude: s.lng,
  }));

  return (
    <Polyline
      coordinates={coords}
      strokeColor={route.color}
      strokeWidth={4}
      lineDashPattern={[8, 4]}
      lineCap="round"
      lineJoin="round"
    />
  );
}
