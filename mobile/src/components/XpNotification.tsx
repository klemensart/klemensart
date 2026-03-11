/* ─── XP Kazanım Toast (Floating "+1 ⭐") ─── */

import React, { useEffect } from "react";
import { Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
} from "react-native-reanimated";
import { COLORS, FONTS, RADIUS, SHADOWS } from "../config/theme";

interface Props {
  visible: boolean;
  stars: number;
  onDismiss: () => void;
}

export default function XpNotification({ visible, stars, onDismiss }: Props) {
  const translateY = useSharedValue(-80);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(20, { damping: 12 });
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 10 })
      );

      // Auto hide
      const timeout = setTimeout(() => {
        translateY.value = withTiming(-80, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(onDismiss)();
        });
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [visible, translateY, opacity, scale, onDismiss]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <Text style={styles.text}>+{stars} ⭐</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    alignSelf: "center",
    backgroundColor: COLORS.dark,
    borderRadius: RADIUS.full,
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 999,
    ...SHADOWS.lg,
  },
  text: {
    fontSize: FONTS.sizes.lg,
    fontWeight: "700",
    color: "#fff",
  },
});
