/* ─── 3D Sergi (WebView Wrapper) ─── */

import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { COLORS } from "../../config/theme";
import { useXp } from "../../hooks/useXp";

export default function ExhibitionScreen({ route }: any) {
  const { url, title } = route.params ?? {};
  const { earnXp } = useXp();

  const exhibitionUrl = url ?? "https://klemensart.com/sergi";

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: exhibitionUrl }}
        style={styles.webview}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.coral} />
          </View>
        )}
        onLoad={() => earnXp("exhibition_visit")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
  loading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.cream,
  },
});
