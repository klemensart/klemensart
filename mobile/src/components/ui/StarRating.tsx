/* ─── Yıldız Puanlama Bileşeni ─── */

import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

interface Props {
  rating: number;
  onChange?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
}

export default function StarRating({ rating, onChange, size = 28, readonly = false }: Props) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity
          key={i}
          onPress={() => !readonly && onChange?.(i)}
          disabled={readonly}
          activeOpacity={readonly ? 1 : 0.6}
        >
          <Text style={[styles.star, { fontSize: size }]}>
            {i <= rating ? "★" : "☆"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 4 },
  star: { color: "#FFB300" },
});
