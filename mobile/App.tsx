/* ─── Klemens Art — Mobil Uygulama ─── */

import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";

import RootNavigator from "./src/navigation/RootNavigator";
import { supabase } from "./src/config/supabase";
import { useAuthStore } from "./src/stores/auth-store";
import { useLocaStore } from "./src/stores/loca-store";

export default function App() {
  const setSession = useAuthStore((s) => s.setSession);
  const hydrateLocaStore = useLocaStore((s) => s.hydrate);

  useEffect(() => {
    hydrateLocaStore();
  }, []);

  useEffect(() => {
    // İlk session kontrolü
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Auth state değişikliklerini dinle
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <NavigationContainer>
        <RootNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
