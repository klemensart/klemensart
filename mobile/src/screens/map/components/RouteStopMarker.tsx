/* ─── Rota Durak Marker'ı (Numaralı) ─── */

import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Marker } from "react-native-maps";
import type { RouteStop } from "../../../shared/harita-data";
import { COLORS } from "../../../config/theme";

interface Props {
  stop: RouteStop;
  index: number;
  color: string;
  isActive: boolean;
  onPress: (index: number) => void;
}

function RouteStopMarkerInner({ stop, index, color, isActive, onPress }: Props) {
  const size = isActive ? 40 : 30;

  return (
    <Marker
      coordinate={{ latitude: stop.lat, longitude: stop.lng }}
      onPress={() => onPress(index)}
      tracksViewChanges={false}
    >
      <View
        style={[
          styles.outer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: isActive ? color : COLORS.white,
            borderColor: color,
          },
        ]}
      >
        <Text
          style={[
            styles.number,
            {
              color: isActive ? "#fff" : color,
              fontSize: isActive ? 16 : 13,
            },
          ]}
        >
          {index + 1}
        </Text>
      </View>
    </Marker>
  );
}

export const RouteStopMarker = memo(RouteStopMarkerInner);

const styles = StyleSheet.create({
  outer: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  number: {
    fontWeight: "800",
  },
});
