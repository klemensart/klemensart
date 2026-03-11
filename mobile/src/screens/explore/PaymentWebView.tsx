/* ─── Ödeme WebView (PayTR) ─── */

import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { COLORS } from "../../config/theme";
import { API_BASE_URL } from "../../config/api";

export default function PaymentWebView({ route, navigation }: any) {
  const { workshopId } = route.params;
  const paymentUrl = `${API_BASE_URL}/api/payment/start?workshopId=${workshopId}`;

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: paymentUrl }}
        style={styles.webview}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.coral} />
          </View>
        )}
        onNavigationStateChange={(state) => {
          // Ödeme tamamlandığında geri dön
          if (state.url.includes("/payment/success")) {
            navigation.goBack();
          }
        }}
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
