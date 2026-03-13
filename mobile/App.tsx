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
import { useGamificationStore } from "./src/stores/gamification-store";
import { fetchGamificationStats } from "./src/services/gamification-service";
import { useRealtimeGamification } from "./src/hooks/useRealtimeGamification";

export default function App() {
  const setSession = useAuthStore((s) => s.setSession);
  const user = useAuthStore((s) => s.user);
  const hydrateLocaStore = useLocaStore((s) => s.hydrate);
  const loadFromCache = useGamificationStore((s) => s.loadFromCache);
  const hydrateFromServer = useGamificationStore((s) => s.hydrateFromServer);

  // AsyncStorage'dan anında yükle
  useEffect(() => {
    hydrateLocaStore();
    loadFromCache();
  }, []);

  // Session değişince sunucudan güncel veriyi çek
  useEffect(() => {
    if (!user) return;
    fetchGamificationStats()
      .then((data) => {
        hydrateFromServer({
          totalStars: data.stats.total_stars,
          rankName: data.stats.rank_name,
          visitedSlugs: data.visitedSlugs,
          todaySlugs: data.todaySlugs,
          earnedBadges: (data.badges || []).map((b) => b.badge_key),
          streakDays: 0,
          lastActiveDate: null,
        });
      })
      .catch(() => {});
  }, [user]);

  // Supabase Realtime subscription
  useRealtimeGamification();

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
