/* ─── Keşfet Tab Stack Navigasyonu ─── */

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { COLORS, FONTS } from "../config/theme";

import ExploreHomeScreen from "../screens/explore/ExploreHomeScreen";
import EventsListScreen from "../screens/explore/EventsListScreen";
import EventDetailScreen from "../screens/explore/EventDetailScreen";
import ArticlesListScreen from "../screens/explore/ArticlesListScreen";
import ArticleReaderScreen from "../screens/explore/ArticleReaderScreen";
import WorkshopsListScreen from "../screens/explore/WorkshopsListScreen";
import WorkshopDetailScreen from "../screens/explore/WorkshopDetailScreen";
import PaymentWebView from "../screens/explore/PaymentWebView";
import ExhibitionScreen from "../screens/explore/ExhibitionScreen";
import TestScreen from "../screens/explore/TestScreen";

export type ExploreStackParamList = {
  ExploreHome: undefined;
  EventsList: undefined;
  EventDetail: { event: any };
  ArticlesList: undefined;
  ArticleReader: { article: any };
  WorkshopsList: undefined;
  WorkshopDetail: { workshop: any };
  PaymentWebView: { workshopId: number };
  Exhibition: { url?: string; title?: string };
  Test: undefined;
};

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export default function ExploreStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.cream },
        headerTintColor: COLORS.dark,
        headerTitleStyle: { fontWeight: "600", fontSize: FONTS.sizes.md },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="ExploreHome"
        component={ExploreHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EventsList"
        component={EventsListScreen}
        options={{ title: "Etkinlikler" }}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ title: "Etkinlik" }}
      />
      <Stack.Screen
        name="ArticlesList"
        component={ArticlesListScreen}
        options={{ title: "Makaleler" }}
      />
      <Stack.Screen
        name="ArticleReader"
        component={ArticleReaderScreen}
        options={{ title: "Makale" }}
      />
      <Stack.Screen
        name="WorkshopsList"
        component={WorkshopsListScreen}
        options={{ title: "Atölyeler" }}
      />
      <Stack.Screen
        name="WorkshopDetail"
        component={WorkshopDetailScreen}
        options={{ title: "Atölye" }}
      />
      <Stack.Screen
        name="PaymentWebView"
        component={PaymentWebView}
        options={{ title: "Ödeme" }}
      />
      <Stack.Screen
        name="Exhibition"
        component={ExhibitionScreen}
        options={{ title: "Sergi" }}
      />
      <Stack.Screen
        name="Test"
        component={TestScreen}
        options={{ title: "Test" }}
      />
    </Stack.Navigator>
  );
}
